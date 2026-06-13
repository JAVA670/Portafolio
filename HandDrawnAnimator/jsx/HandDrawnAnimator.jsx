/*
 * Hand-Drawn Animator — ExtendScript backend for Adobe Premiere Pro (23.0+)
 * ---------------------------------------------------------------------------
 * ExtendScript is ES3: no JSON object, no let/const/arrow functions, no
 * Array.prototype.indexOf. Everything below is written to that baseline.
 *
 * API surface used, and why:
 *
 *  app.enableQE()
 *      Unlocks the undocumented-but-stable "QE DOM" (global `qe`). The
 *      documented Premiere DOM can READ and MODIFY effect parameters but has
 *      no method to ADD an effect to a clip; qe.addVideoEffect() is the only
 *      scripting route (it is what Adobe's own PProPanel sample uses).
 *
 *  qe.project.getVideoEffectByName(displayName)
 *      Resolves an effect by the LOCALIZED display name shown in the Effects
 *      panel. Returns a falsy value when the effect does not exist in this
 *      Premiere version/locale — which is how we feature-detect Turbulent
 *      Displace (native only in 25.2+) and fall back to Wave Warp.
 *
 *  qeClip.addVideoEffect(fx)
 *      Appends the effect to the bottom of the clip's Effect Controls rack.
 *      Effects render top-to-bottom, so we add Posterize Time LAST so it
 *      quantizes the warp/edge animation into the stepped 8/12 fps boil.
 *
 *  trackItem.components / component.properties (documented DOM)
 *      After QE adds the effect, the documented DOM sees it as a Component.
 *      Each parameter is a ComponentParam supporting:
 *        setValue(value, updateUI)             - static value
 *        setTimeVarying(true)                  - enable keyframing
 *        addKey(seconds) / setValueAtKey(...)  - create keyframes
 *        setInterpolationTypeAtKey(t, type)    - 0 = Linear, 4 = Hold
 *        removeKeyRange(start, end, updateUI)  - clear keys before re-runs
 *      Keyframe times are CLIP time (seconds relative to the media), so we
 *      span trackItem.inPoint.seconds -> trackItem.outPoint.seconds.
 *
 *  sequence.importMGT(path, ticks, vTrack, aTrack) + item.getMGTComponent()
 *      The documented MOGRT route. Used by applyBoilMogrt() to drop an
 *      After-Effects-built adjustment-layer .mogrt (true Turbulent Displace +
 *      Roughen Edges) above the selected clip on Premiere versions older
 *      than 25.2, and to drive its exposed Essential Graphics sliders.
 *
 * Premiere has NO expression engine (expressions are After Effects only),
 * so the "boiling" loop is generated as real keyframes instead.
 */

$.global.HDA = (function () {

    var KF_LINEAR = 0; // ComponentParam interpolation enum
    var KF_HOLD = 4;

    var MAX_KEYS_PER_PARAM = 1500; // safety cap for very long clips

    // Effect display-name candidates; the first one that exists wins.
    // getVideoEffectByName() matches the localized Effects-panel name, so on
    // non-English installs add your exact local names at the FRONT of each
    // list (the panel's "Effect name finder" prints what your build exposes;
    // the Spanish entries below are best-effort guesses).
    var FX_CANDIDATES = {
        warp: [
            "Turbulent Displace",       // native since Premiere 25.2 (2025)
            "Desplazamiento turbulento",
            "Wave Warp",                // fallback: native in every modern build
            "Deformación de onda"
        ],
        edges: [
            "Roughen Edges",            // native since Premiere 22.x -> OK on 2023+
            "Bordes rugosos",
            "Brush Strokes",            // legacy fallbacks, just in case
            "Trazos de pincel",
            "Alpha Glow"
        ],
        posterize: [
            "Posterize Time",
            "Tiempo de posterización"
        ]
    };

    /* ---------------- JSON reply helpers (ES3 has no JSON object) -------- */

    function jsonStr(s) {
        s = String(s);
        var out = "";
        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            if (c === '"' || c === "\\") out += "\\" + c;
            else if (c === "\n") out += "\\n";
            else if (c === "\r") out += "\\r";
            else if (c === "\t") out += "\\t";
            else out += c;
        }
        return '"' + out + '"';
    }

    function reply(ok, message, log) {
        var r = '{"ok":' + (ok ? "true" : "false") + ',"message":' + jsonStr(message);
        if (log && log.length) {
            r += ',"log":[';
            for (var i = 0; i < log.length; i++) r += (i ? "," : "") + jsonStr(log[i]);
            r += "]";
        }
        return r + "}";
    }

    function clampNum(v, lo, hi, dflt) {
        v = Number(v);
        if (isNaN(v)) v = dflt;
        if (v < lo) v = lo;
        if (v > hi) v = hi;
        return v;
    }

    function round2(v) { return Math.round(v * 100) / 100; }

    /* ---------------- selection + QE lookup ------------------------------ */

    function selectedVideoClips(seq) {
        // trackItem.isSelected() (documented DOM) per clip; we also record the
        // track index and the clip ordinal so the QE counterpart can be found.
        var out = [];
        for (var t = 0; t < seq.videoTracks.numTracks; t++) {
            var track = seq.videoTracks[t];
            for (var c = 0; c < track.clips.numItems; c++) {
                var ti = track.clips[c];
                var sel = false;
                try { sel = ti.isSelected(); } catch (e) { sel = false; }
                if (sel) out.push({ clip: ti, trackIndex: t, clipOrdinal: c });
            }
        }
        return out;
    }

    function qeClipAt(trackIndex, clipOrdinal) {
        // QE tracks interleave real clips with "Empty" gap items, while the
        // documented DOM's track.clips skips gaps — so we match the Nth
        // non-empty QE item to DOM clips[N].
        var qeSeq = qe.project.getActiveSequence();
        if (!qeSeq) return null;
        var qeTrack = null;
        try { qeTrack = qeSeq.getVideoTrackAt(trackIndex); } catch (e) { return null; }
        if (!qeTrack) return null;
        var ord = -1;
        for (var i = 0; i < qeTrack.numItems; i++) {
            var it = null;
            try { it = qeTrack.getItemAt(i); } catch (e2) { it = null; }
            if (it && String(it.type) !== "Empty") {
                ord++;
                if (ord === clipOrdinal) return it;
            }
        }
        return null;
    }

    /* ---------------- effects + parameters ------------------------------- */

    function findComponentByNames(domClip, names) {
        var comps = domClip.components;
        for (var n = 0; n < names.length; n++) {
            var want = String(names[n]).toLowerCase();
            var found = null;
            for (var i = 0; i < comps.numItems; i++) {
                var c = comps[i];
                if (c && String(c.displayName).toLowerCase() === want) found = c; // keep last match
            }
            if (found) return { comp: found, name: names[n] };
        }
        return null;
    }

    function ensureEffect(domClip, qeClip, candidates, log, label) {
        // Idempotent: reuse the effect if a previous run (or the user) already
        // added it, otherwise add the first candidate this build knows about.
        var existing = findComponentByNames(domClip, candidates);
        if (existing) {
            log.push(label + ': reusing existing "' + existing.name + '"');
            return existing;
        }
        for (var i = 0; i < candidates.length; i++) {
            var fx = null;
            try { fx = qe.project.getVideoEffectByName(candidates[i]); } catch (e) { fx = null; }
            if (!fx) continue;
            try { qeClip.addVideoEffect(fx); } catch (e2) { continue; }
            var added = findComponentByNames(domClip, [candidates[i]]);
            if (added) {
                log.push(label + ': added "' + candidates[i] + '"');
                return added;
            }
        }
        log.push(label + ": no candidate effect available in this build — skipped");
        return null;
    }

    function findParam(component, names) {
        var props = component.properties;
        for (var n = 0; n < names.length; n++) {
            var want = String(names[n]).toLowerCase();
            for (var i = 0; i < props.numItems; i++) {
                var p = props[i];
                if (p && String(p.displayName).toLowerCase() === want) return p;
            }
        }
        return null;
    }

    function setNum(component, names, value, log, label) {
        var p = findParam(component, names);
        if (!p) {
            log.push(label + ": parameter not found (" + names.join(" / ") + ")");
            return false;
        }
        try { p.setTimeVarying(false); } catch (e0) {} // drop stale keyframes from earlier runs
        try {
            p.setValue(value, true);
            log.push(label + " = " + value);
            return true;
        } catch (e) {
            log.push(label + ": setValue failed (" + e + ")");
            return false;
        }
    }

    /* ---------------- boil keyframe generators --------------------------- */

    function clearKeys(param, t0, t1) {
        try { param.removeKeyRange(t0 - 1, t1 + 1, true); } catch (e) {}
    }

    function boilHoldKeys(param, t0, t1, boilFps, log, label) {
        // A HOLD keyframe every 1/fps s with a golden-angle value walk:
        // each frame jumps to an unrelated pose and freezes — the classic
        // hand-drawn "boil", independent of Posterize Time behavior.
        try { param.setTimeVarying(true); } catch (eTV) {
            log.push(label + ": not keyframeable (" + eTV + ")");
            return 0;
        }
        clearKeys(param, t0, t1);
        var step = 1 / boilFps;
        var n = Math.floor((t1 - t0) / step) + 1;
        if (n > MAX_KEYS_PER_PARAM) {
            n = MAX_KEYS_PER_PARAM;
            log.push(label + ": clip is long, capped at " + MAX_KEYS_PER_PARAM + " keys");
        }
        for (var i = 0; i < n; i++) {
            var t = t0 + i * step;
            var v = round2((i * 137.508) % 360); // golden angle: never visibly repeats
            param.addKey(t);
            param.setValueAtKey(t, v, false);
            try { param.setInterpolationTypeAtKey(t, KF_HOLD, false); } catch (eIp) {}
        }
        log.push(label + ": " + n + " hold keyframes @ " + boilFps + " fps");
        return n;
    }

    function boilRamp(param, t0, t1, degPerSec, log, label) {
        // Two linear keyframes ramping the angle continuously; Posterize Time
        // (added below the warp in the rack) steps it into the boil.
        try { param.setTimeVarying(true); } catch (eTV) {
            log.push(label + ": not keyframeable (" + eTV + ")");
            return 0;
        }
        clearKeys(param, t0, t1);
        param.addKey(t0);
        param.setValueAtKey(t0, 0, false);
        try { param.setInterpolationTypeAtKey(t0, KF_LINEAR, false); } catch (e1) {}
        param.addKey(t1);
        param.setValueAtKey(t1, round2((t1 - t0) * degPerSec), true);
        try { param.setInterpolationTypeAtKey(t1, KF_LINEAR, true); } catch (e2) {}
        log.push(label + ": linear ramp " + round2(degPerSec) + " deg/s");
        return 2;
    }

    /* ---------------- per-effect configuration --------------------------- */

    function configureWarp(entry, jitter, boilFps, holdKeys, t0, t1, log) {
        var comp = entry.comp;
        var lname = String(entry.name).toLowerCase();

        if (lname.indexOf("turbulent") !== -1 || lname.indexOf("turbulento") !== -1) {
            // Turbulent Displace (Premiere 25.2+): jitter -> Amount,
            // boil -> Evolution keyframes (the parameter the request asked for).
            setNum(comp, ["Amount", "Cantidad"], Math.round(5 + jitter * 1.15), log, "Turbulent Displace > Amount");
            setNum(comp, ["Size", "Tamaño"], 30, log, "Turbulent Displace > Size");
            var evo = findParam(comp, ["Evolution", "Evolución"]);
            if (!evo) { log.push("Turbulent Displace > Evolution: parameter not found"); return; }
            if (holdKeys) boilHoldKeys(evo, t0, t1, boilFps, log, "Turbulent Displace > Evolution");
            else boilRamp(evo, t0, t1, 90 + jitter * 1.8, log, "Turbulent Displace > Evolution");
            return;
        }

        // Wave Warp fallback (all versions): jitter -> Wave Height/Width.
        // "Smooth Noise" wave type reads as organic boil rather than a wave;
        // popup params take a 0-based index in scripting (8 = Smooth Noise).
        var wt = findParam(comp, ["Wave Type", "Tipo de onda"]);
        if (wt) {
            try { wt.setValue(8, true); log.push("Wave Warp > Wave Type = Smooth Noise"); } catch (eWT) {}
        }
        setNum(comp, ["Wave Height", "Altura de onda"], Math.round(1 + jitter * 0.3), log, "Wave Warp > Wave Height");
        setNum(comp, ["Wave Width", "Anchura de onda"], Math.round(35 + jitter * 0.9), log, "Wave Warp > Wave Width");

        var phase = findParam(comp, ["Phase", "Fase"]);
        if (holdKeys && phase) {
            // Freeze the built-in animation and step Phase manually instead.
            setNum(comp, ["Wave Speed", "Velocidad de onda"], 0, log, "Wave Warp > Wave Speed");
            boilHoldKeys(phase, t0, t1, boilFps, log, "Wave Warp > Phase");
        } else {
            // Wave Warp self-animates; Posterize Time will quantize it.
            setNum(comp, ["Wave Speed", "Velocidad de onda"], round2(0.4 + jitter / 70), log, "Wave Warp > Wave Speed");
        }
    }

    function configureEdges(entry, jitter, boilFps, holdKeys, t0, t1, log) {
        var comp = entry.comp;
        var lname = String(entry.name).toLowerCase();

        if (lname.indexOf("roughen") !== -1 || lname.indexOf("rugoso") !== -1) {
            setNum(comp, ["Border", "Borde"], Math.round(6 + jitter * 0.45), log, "Roughen Edges > Border");
            var evo = findParam(comp, ["Evolution", "Evolución"]);
            if (!evo) { log.push("Roughen Edges > Evolution: parameter not found"); return; }
            if (holdKeys) boilHoldKeys(evo, t0, t1, boilFps, log, "Roughen Edges > Evolution");
            else boilRamp(evo, t0, t1, (90 + jitter * 1.8) * 0.6, log, "Roughen Edges > Evolution");
            return;
        }

        if (lname.indexOf("brush") !== -1 || lname.indexOf("pincel") !== -1) {
            setNum(comp, ["Brush Size", "Tamaño de pincel"], 1.5, log, "Brush Strokes > Brush Size");
            setNum(comp, ["Stroke Length", "Longitud de trazo"], 2, log, "Brush Strokes > Stroke Length");
            return;
        }

        log.push('edges: "' + entry.name + '" applied with default parameters');
    }

    /* ---------------- public API ----------------------------------------- */

    var api = {};

    api.ping = function () {
        try {
            var seq = app.project ? app.project.activeSequence : null;
            if (!seq) return reply(true, "Premiere Pro " + app.version + " — no active sequence");
            var sel = selectedVideoClips(seq).length;
            return reply(true, "Premiere Pro " + app.version + ' — "' + seq.name + '", ' +
                               sel + " selected video clip(s)");
        } catch (e) {
            return reply(false, "ping failed: " + e);
        }
    };

    /*
     * applyEffect(jitterIntensity 0-100, boilFps, holdKeys)
     * Applies warp + edge texture + Posterize Time to every selected video
     * clip and generates the boil animation.
     */
    api.applyEffect = function (jitter, boilFps, holdKeys) {
        var log = [];
        try {
            jitter = clampNum(jitter, 0, 100, 40);
            boilFps = clampNum(boilFps, 1, 30, 12);
            holdKeys = (holdKeys === true || holdKeys === "true");

            if (!app.project || !app.project.activeSequence) {
                return reply(false, "Open a sequence first.");
            }
            var seq = app.project.activeSequence;

            app.enableQE(); // required before touching the qe DOM

            var sel = selectedVideoClips(seq);
            if (sel.length === 0) {
                return reply(false, "Nothing selected — click a graphic/text clip in the timeline first.");
            }

            var done = 0;
            for (var i = 0; i < sel.length; i++) {
                var entry = sel[i];
                var clip = entry.clip;
                log.push("▸ " + clip.name + "  (V" + (entry.trackIndex + 1) + ")");

                var qeClip = qeClipAt(entry.trackIndex, entry.clipOrdinal);
                if (!qeClip) {
                    log.push("could not locate QE counterpart — skipped");
                    continue;
                }

                // Keyframe times are clip/media-relative seconds.
                var t0 = clip.inPoint.seconds;
                var t1 = clip.outPoint.seconds;

                var warp = ensureEffect(clip, qeClip, FX_CANDIDATES.warp, log, "warp");
                if (warp) configureWarp(warp, jitter, boilFps, holdKeys, t0, t1, log);

                var edges = ensureEffect(clip, qeClip, FX_CANDIDATES.edges, log, "edges");
                if (edges) configureEdges(edges, jitter, boilFps, holdKeys, t0, t1, log);

                // Added last on purpose: Posterize Time only quantizes effects
                // ABOVE it in the Effect Controls rack.
                var post = ensureEffect(clip, qeClip, FX_CANDIDATES.posterize, log, "posterize");
                if (post) {
                    setNum(post.comp, ["Frame Rate", "Velocidad de fotogramas"], boilFps, log,
                           "Posterize Time > Frame Rate");
                }

                if (warp || edges || post) done++;
            }
            return reply(done > 0, done + " of " + sel.length + " clip(s) processed.", log);
        } catch (e) {
            return reply(false, "applyEffect failed: " + e + (e.line ? " (line " + e.line + ")" : ""), log);
        }
    };

    /*
     * applyBoilMogrt(jitterIntensity, boilFps)
     * High-fidelity workaround for Premiere < 25.2: inserts the bundled
     * After-Effects-built adjustment-layer MOGRT (true Turbulent Displace +
     * Roughen Edges with looping expressions baked in) on the track above the
     * selected clip, then drives its exposed Essential Graphics sliders.
     * Build the .mogrt once — see assets/BUILD-THE-MOGRT.md.
     */
    api.applyBoilMogrt = function (jitter, boilFps) {
        var log = [];
        try {
            jitter = clampNum(jitter, 0, 100, 40);
            boilFps = clampNum(boilFps, 1, 30, 12);

            var seq = app.project ? app.project.activeSequence : null;
            if (!seq) return reply(false, "Open a sequence first.");

            var sel = selectedVideoClips(seq);
            if (sel.length === 0) return reply(false, "Select the clip the boil should sit above.");
            var target = sel[0];

            // $.fileName = this .jsx file -> extension root is two levels up.
            var mogrt = new File(new File($.fileName).parent.parent.fsName + "/assets/HandDrawnBoil.mogrt");
            if (!mogrt.exists) {
                return reply(false, "assets/HandDrawnBoil.mogrt is missing. Export it once from After Effects — see assets/BUILD-THE-MOGRT.md.");
            }

            var trackAbove = target.trackIndex + 1;
            if (seq.videoTracks.numTracks <= trackAbove) {
                return reply(false, "Add an empty video track above V" + (target.trackIndex + 1) +
                                    " first — the MOGRT is an adjustment layer and must sit on top.");
            }

            var item = seq.importMGT(mogrt.fsName, target.clip.start.ticks, trackAbove, 0);
            if (!item) return reply(false, "importMGT() failed.");
            log.push("MOGRT inserted on V" + (trackAbove + 1) + " at " + round2(target.clip.start.seconds) + "s");

            try {
                item.end = target.clip.end;
                log.push("duration matched to the selected clip");
            } catch (eEnd) {
                log.push("could not set duration automatically — trim it manually");
            }

            var mgt = null;
            try { mgt = item.getMGTComponent(); } catch (eC) { mgt = null; }
            if (mgt) {
                var pJitter = null, pFps = null;
                try { pJitter = mgt.properties.getParamForDisplayName("Jitter Intensity"); } catch (e1) {}
                try { pFps = mgt.properties.getParamForDisplayName("Boil FPS"); } catch (e2) {}
                if (pJitter) { pJitter.setValue(jitter, true); log.push("Jitter Intensity = " + jitter); }
                else log.push('exposed control "Jitter Intensity" not found in the MOGRT');
                if (pFps) { pFps.setValue(boilFps, true); log.push("Boil FPS = " + boilFps); }
                else log.push('exposed control "Boil FPS" not found in the MOGRT');
            } else {
                log.push("getMGTComponent() returned nothing — adjust sliders in the Essential Graphics panel");
            }
            return reply(true, "Boil MOGRT placed above the selected clip.", log);
        } catch (e) {
            return reply(false, "applyBoilMogrt failed: " + e + (e.line ? " (line " + e.line + ")" : ""), log);
        }
    };

    /*
     * listEffects(filter)
     * Diagnostic for localized installs: prints the effect display names this
     * build exposes so users can correct FX_CANDIDATES.
     */
    api.listEffects = function (filter) {
        var log = [];
        try {
            app.enableQE();
            var list = null;
            try { list = qe.project.getVideoEffectList(); } catch (e1) { list = null; }
            if (!list || !list.length) {
                return reply(false, "qe.project.getVideoEffectList() is unavailable in this build — read the exact names from the Effects panel instead.");
            }
            var f = String(filter || "").toLowerCase();
            var hits = 0;
            for (var i = 0; i < list.length; i++) {
                var nm = String(list[i]);
                if (!f || nm.toLowerCase().indexOf(f) !== -1) {
                    log.push(nm);
                    hits++;
                    if (hits >= 60) { log.push("… (truncated)"); break; }
                }
            }
            return reply(true, hits + ' effect name(s) matching "' + (filter || "") + '"', log);
        } catch (e) {
            return reply(false, "listEffects failed: " + e);
        }
    };

    return api;
})();
