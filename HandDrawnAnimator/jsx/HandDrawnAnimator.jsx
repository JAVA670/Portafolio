/*
 * Hand-Drawn Animator — ExtendScript backend for Adobe Premiere Pro (23.0+)
 * ---------------------------------------------------------------------------
 * ExtendScript is ES3: no JSON object, no let/const/arrow functions. Written
 * to that baseline throughout.
 *
 * Two engines share this file:
 *
 *   1. The hand-drawn BOIL engine (configureWarp/Edges + Posterize Time +
 *      Evolution/Phase keyframes) — the frame-by-frame jitter look.
 *   2. The TEXT ANIMATOR on top of it: animateText() creates/targets a text
 *      graphic, applies a boil preset, and keyframes a directional in/out
 *      TRANSITION on the clip's Motion > Position and Opacity.
 *
 * API surface used, and why:
 *
 *  app.enableQE() + qe.project.getVideoEffectByName() + qeClip.addVideoEffect()
 *      The ONLY scripting route to ADD an effect to a clip (documented DOM
 *      can modify but not add). Used by the boil engine.
 *
 *  trackItem.components[i].properties[j]  (documented DOM)
 *      ComponentParam: setValue / setTimeVarying / addKey / setValueAtKey /
 *      setInterpolationTypeAtKey (0=Linear, 4=Hold, 5=Bezier — values verified
 *      against Adobe's PProPanel sample) / removeKeyRange. Keyframe times are
 *      clip/source seconds (inPoint.seconds -> outPoint.seconds).
 *
 *  Motion > Position + Opacity > Opacity  (documented DOM, intrinsic comps)
 *      Keyframed for the directional in/out transitions. Position is read
 *      first to discover the clip's center and coordinate units (normalized
 *      vs pixels) so offsets are computed relative to whatever the build uses.
 *
 *  sequence.importMGT(path, ticks, vTrack, aTrack) + item.getMGTComponent()
 *      Inserts a bundled text MOGRT and sets its Source Text — the only
 *      reliable way to create text from script. Premiere has no API to build
 *      a text layer from scratch, and no expression engine (AE only), so the
 *      boil loop is real keyframes rather than an expression.
 */

$.global.HDA = (function () {

    var KF_LINEAR = 0;
    var KF_HOLD = 4;
    var KF_BEZIER = 5;

    var MAX_KEYS_PER_PARAM = 1500;

    // Effect display-name candidates; first that exists in this build/locale
    // wins. On non-English installs add your exact local names at the FRONT.
    var FX = {
        warp: [
            "Turbulent Displace", "Desplazamiento turbulento",
            "Wave Warp", "Deformación de onda"
        ],
        edges: [
            "Roughen Edges", "Bordes rugosos",
            "Brush Strokes", "Trazos de pincel", "Alpha Glow"
        ],
        posterize: ["Posterize Time", "Tiempo de posterización"]
    };

    /* ---------------- JSON reply helpers (ES3 has no JSON) -------------- */

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
    function trim(s) { return String(s == null ? "" : s).replace(/^\s+|\s+$/g, ""); }
    function lc(s) { return String(s == null ? "" : s).toLowerCase(); }

    /* ---------------- selection + QE lookup ----------------------------- */

    function selectedVideoClips(seq) {
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

    /* ---------------- effects + parameters ------------------------------ */

    function findComponentByNames(domClip, names) {
        var comps = domClip.components;
        for (var n = 0; n < names.length; n++) {
            var want = lc(names[n]);
            var found = null;
            for (var i = 0; i < comps.numItems; i++) {
                var c = comps[i];
                if (c && lc(c.displayName) === want) found = c;
            }
            if (found) return { comp: found, name: names[n] };
        }
        return null;
    }

    function ensureEffect(domClip, qeClip, candidates, log, label) {
        var existing = findComponentByNames(domClip, candidates);
        if (existing) { log.push(label + ': reusing "' + existing.name + '"'); return existing; }
        for (var i = 0; i < candidates.length; i++) {
            var fx = null;
            try { fx = qe.project.getVideoEffectByName(candidates[i]); } catch (e) { fx = null; }
            if (!fx) continue;
            try { qeClip.addVideoEffect(fx); } catch (e2) { continue; }
            var added = findComponentByNames(domClip, [candidates[i]]);
            if (added) { log.push(label + ': added "' + candidates[i] + '"'); return added; }
        }
        log.push(label + ": no candidate effect available — skipped");
        return null;
    }

    function findParam(component, names) {
        var props = component.properties;
        for (var n = 0; n < names.length; n++) {
            var want = lc(names[n]);
            for (var i = 0; i < props.numItems; i++) {
                var p = props[i];
                if (p && lc(p.displayName) === want) return p;
            }
        }
        return null;
    }

    function setNum(component, names, value, log, label) {
        var p = findParam(component, names);
        if (!p) { log.push(label + ": param not found"); return false; }
        try { p.setTimeVarying(false); } catch (e0) {}
        try { p.setValue(value, true); log.push(label + " = " + value); return true; }
        catch (e) { log.push(label + ": setValue failed (" + e + ")"); return false; }
    }

    /* ---------------- boil keyframe generators -------------------------- */

    function clearKeys(param, t0, t1) {
        try { param.removeKeyRange(t0 - 1, t1 + 1, true); } catch (e) {}
    }

    function boilHoldKeys(param, t0, t1, boilFps, log, label) {
        try { param.setTimeVarying(true); } catch (eTV) { log.push(label + ": not keyframeable"); return; }
        clearKeys(param, t0, t1);
        var step = 1 / boilFps;
        var n = Math.floor((t1 - t0) / step) + 1;
        if (n > MAX_KEYS_PER_PARAM) { n = MAX_KEYS_PER_PARAM; log.push(label + ": capped at " + n + " keys"); }
        for (var i = 0; i < n; i++) {
            var t = t0 + i * step;
            var v = round2((i * 137.508) % 360); // golden angle: never visibly repeats
            param.addKey(t);
            param.setValueAtKey(t, v, false);
            try { param.setInterpolationTypeAtKey(t, KF_HOLD, false); } catch (eIp) {}
        }
        log.push(label + ": " + n + " hold keys @ " + boilFps + " fps");
    }

    function boilRamp(param, t0, t1, degPerSec, log, label) {
        try { param.setTimeVarying(true); } catch (eTV) { log.push(label + ": not keyframeable"); return; }
        clearKeys(param, t0, t1);
        param.addKey(t0); param.setValueAtKey(t0, 0, false);
        try { param.setInterpolationTypeAtKey(t0, KF_LINEAR, false); } catch (e1) {}
        param.addKey(t1); param.setValueAtKey(t1, round2((t1 - t0) * degPerSec), true);
        try { param.setInterpolationTypeAtKey(t1, KF_LINEAR, true); } catch (e2) {}
        log.push(label + ": linear ramp " + round2(degPerSec) + " deg/s");
    }

    function configureWarp(entry, jitter, fps, hold, t0, t1, log) {
        var comp = entry.comp, nm = lc(entry.name);
        if (nm.indexOf("turbulent") !== -1 || nm.indexOf("turbulento") !== -1) {
            setNum(comp, ["Amount", "Cantidad"], Math.round(5 + jitter * 1.15), log, "Turbulent > Amount");
            setNum(comp, ["Size", "Tamaño"], 30, log, "Turbulent > Size");
            var evo = findParam(comp, ["Evolution", "Evolución"]);
            if (!evo) { log.push("Turbulent > Evolution not found"); return; }
            if (hold) boilHoldKeys(evo, t0, t1, fps, log, "Turbulent > Evolution");
            else boilRamp(evo, t0, t1, 90 + jitter * 1.8, log, "Turbulent > Evolution");
            return;
        }
        var wt = findParam(comp, ["Wave Type", "Tipo de onda"]);
        if (wt) { try { wt.setValue(8, true); log.push("Wave Warp > Type = Smooth Noise"); } catch (eWT) {} }
        setNum(comp, ["Wave Height", "Altura de onda"], Math.round(1 + jitter * 0.3), log, "Wave Warp > Height");
        setNum(comp, ["Wave Width", "Anchura de onda"], Math.round(35 + jitter * 0.9), log, "Wave Warp > Width");
        var phase = findParam(comp, ["Phase", "Fase"]);
        if (hold && phase) {
            setNum(comp, ["Wave Speed", "Velocidad de onda"], 0, log, "Wave Warp > Speed");
            boilHoldKeys(phase, t0, t1, fps, log, "Wave Warp > Phase");
        } else {
            setNum(comp, ["Wave Speed", "Velocidad de onda"], round2(0.4 + jitter / 70), log, "Wave Warp > Speed");
        }
    }

    function configureEdges(entry, jitter, fps, hold, edgeScale, t0, t1, log) {
        var comp = entry.comp, nm = lc(entry.name);
        if (nm.indexOf("roughen") !== -1 || nm.indexOf("rugoso") !== -1) {
            setNum(comp, ["Border", "Borde"], Math.round((6 + jitter * 0.45) * edgeScale), log, "Roughen > Border");
            var evo = findParam(comp, ["Evolution", "Evolución"]);
            if (!evo) { log.push("Roughen > Evolution not found"); return; }
            if (hold) boilHoldKeys(evo, t0, t1, fps, log, "Roughen > Evolution");
            else boilRamp(evo, t0, t1, (90 + jitter * 1.8) * 0.6, log, "Roughen > Evolution");
            return;
        }
        if (nm.indexOf("brush") !== -1 || nm.indexOf("pincel") !== -1) {
            setNum(comp, ["Brush Size", "Tamaño de pincel"], 1.5 * edgeScale, log, "Brush > Size");
            setNum(comp, ["Stroke Length", "Longitud de trazo"], 2, log, "Brush > Stroke Length");
            return;
        }
        log.push('edges: "' + entry.name + '" applied with defaults');
    }

    /*
     * processClip — applies the full boil stack to one clip. Shared by
     * applyEffect() and animateText(). edgeScale scales the marker/pencil
     * roughness from the STYLE preset (1 = default).
     */
    function processClip(entry, jitter, fps, hold, edgeScale, log) {
        var clip = entry.clip;
        var qeClip = qeClipAt(entry.trackIndex, entry.clipOrdinal);
        if (!qeClip) { log.push("QE counterpart not found — boil skipped"); return false; }
        var t0 = clip.inPoint.seconds, t1 = clip.outPoint.seconds;

        var warp = ensureEffect(clip, qeClip, FX.warp, log, "warp");
        if (warp) configureWarp(warp, jitter, fps, hold, t0, t1, log);

        if (edgeScale > 0) {
            var edges = ensureEffect(clip, qeClip, FX.edges, log, "edges");
            if (edges) configureEdges(edges, jitter, fps, hold, edgeScale, t0, t1, log);
        } else {
            log.push("edges: STYLE = None — skipped");
        }

        // Added last: Posterize Time only quantizes effects ABOVE it.
        var post = ensureEffect(clip, qeClip, FX.posterize, log, "posterize");
        if (post) setNum(post.comp, ["Frame Rate", "Velocidad de fotogramas"], fps, log, "Posterize > Frame Rate");

        return true;
    }

    /* ---------------- directional in/out transition -------------------- */

    function startPos(dir, cx, cy, ox, oy) {
        if (dir === "left")  return [cx + ox, cy];  // enters from the right, travels left
        if (dir === "right") return [cx - ox, cy];
        if (dir === "up")    return [cx, cy + oy];  // enters from below, travels up
        if (dir === "down")  return [cx, cy - oy];
        return [cx, cy];
    }
    function endPos(dir, cx, cy, ox, oy) {
        if (dir === "left")  return [cx - ox, cy];  // exits to the left
        if (dir === "right") return [cx + ox, cy];
        if (dir === "up")    return [cx, cy - oy];
        if (dir === "down")  return [cx, cy + oy];
        return [cx, cy];
    }

    function key2D(param, t, val, interp) {
        param.addKey(t);
        param.setValueAtKey(t, val, false);
        try { param.setInterpolationTypeAtKey(t, interp, false); } catch (e) {}
    }
    function key1D(param, t, val, interp) { key2D(param, t, val, interp); }

    function applyTransition(clip, t0, t1, inDir, outDir, log) {
        inDir = lc(inDir || "none"); outDir = lc(outDir || "none");
        if (inDir === "none" && outDir === "none") { log.push("transition: none"); return; }

        var dur = Math.min(0.5, (t1 - t0) / 3);
        if (dur <= 0.001) { log.push("transition: clip too short"); return; }

        var motion = findComponentByNames(clip, ["Motion", "Movimiento"]);
        var pos = motion ? findParam(motion.comp, ["Position", "Posición"]) : null;
        var opComp = findComponentByNames(clip, ["Opacity", "Opacidad"]);
        var op = opComp ? findParam(opComp.comp, ["Opacity", "Opacidad"]) : null;

        // Position slide — read current value to learn center + units.
        if (pos) {
            var center = null;
            try { center = pos.getValue(); } catch (e) { center = null; }
            if (center && center.length === 2) {
                var cx = center[0], cy = center[1];
                var normalized = (Math.abs(cx) <= 2 && Math.abs(cy) <= 2);
                var ox = normalized ? 1.2 : Math.abs(cx) * 2 || 1920;
                var oy = normalized ? 1.2 : Math.abs(cy) * 2 || 1080;
                try {
                    pos.setTimeVarying(true);
                    clearKeys(pos, t0, t1);
                    if (inDir !== "none") {
                        key2D(pos, t0, startPos(inDir, cx, cy, ox, oy), KF_BEZIER);
                        key2D(pos, t0 + dur, [cx, cy], KF_BEZIER);
                    }
                    if (outDir !== "none") {
                        key2D(pos, t1 - dur, [cx, cy], KF_BEZIER);
                        key2D(pos, t1, endPos(outDir, cx, cy, ox, oy), KF_BEZIER);
                    }
                    log.push("transition: position slide in=" + inDir + " out=" + outDir +
                             (normalized ? " (normalized)" : " (pixels)"));
                } catch (eP) { log.push("transition: position keying failed (" + eP + ")"); }
            } else {
                log.push("transition: Position unreadable — opacity fade only");
            }
        }

        // Opacity fade paired with each animated side.
        if (op) {
            try {
                op.setTimeVarying(true);
                clearKeys(op, t0, t1);
                if (inDir !== "none") { key1D(op, t0, 0, KF_LINEAR); key1D(op, t0 + dur, 100, KF_LINEAR); }
                if (outDir !== "none") { key1D(op, t1 - dur, 100, KF_LINEAR); key1D(op, t1, 0, KF_LINEAR); }
                log.push("transition: opacity fade applied");
            } catch (eO) { log.push("transition: opacity keying failed (" + eO + ")"); }
        }
    }

    /* ---------------- text creation (MOGRT) ----------------------------- */

    function extRoot() { return new File($.fileName).parent.parent.fsName; }

    function trySetMogrtText(clip, text, log) {
        var mgt = null;
        try { mgt = clip.getMGTComponent(); } catch (e) { mgt = null; }
        if (!mgt) { log.push("note: target is not a MOGRT — TEXT field ignored"); return false; }
        var names = ["Text", "Texto", "Your Text", "Source Text", "Text Layer", "Title"];
        var p = null;
        for (var i = 0; i < names.length && !p; i++) {
            try { p = mgt.properties.getParamForDisplayName(names[i]); } catch (e2) { p = null; }
        }
        if (!p) { // fall back: first param whose display name mentions text
            var props = mgt.properties;
            for (var j = 0; j < props.numItems && !p; j++) {
                var nm = lc(props[j].displayName);
                if (nm.indexOf("text") !== -1 || nm.indexOf("texto") !== -1) p = props[j];
            }
        }
        if (!p) { log.push("note: no text parameter exposed in this MOGRT"); return false; }
        try { p.setValue(text, 1); log.push('text set to "' + text + '"'); return true; }
        catch (e3) { log.push("text set failed (" + e3 + ")"); return false; }
    }

    function importTextMogrt(seq, text, log) {
        var mogrt = new File(extRoot() + "/assets/HandDrawnText.mogrt");
        if (!mogrt.exists) {
            return { ok: false, message: "Nothing selected and assets/HandDrawnText.mogrt is missing. Build it once (assets/BUILD-THE-TEXT-MOGRT.md) or select an existing text clip to animate." };
        }
        var v = seq.videoTracks.numTracks - 1; // top existing video track
        var startTicks = "0";
        try { startTicks = seq.getPlayerPosition().ticks; } catch (e) {}
        var item = null;
        try { item = seq.importMGT(mogrt.fsName, startTicks, v, 0); } catch (e2) {
            return { ok: false, message: "importMGT failed: " + e2 };
        }
        if (!item) return { ok: false, message: "importMGT returned nothing." };
        var track = seq.videoTracks[v], ord = track.clips.numItems - 1;
        for (var i = 0; i < track.clips.numItems; i++) {
            if (String(track.clips[i].start.ticks) === String(item.start.ticks)) { ord = i; break; }
        }
        log.push("text clip created on V" + (v + 1) + " at playhead");
        return { ok: true, entry: { clip: item, trackIndex: v, clipOrdinal: ord } };
    }

    /* ---------------- public API ---------------------------------------- */

    var api = {};

    api.ping = function () {
        try {
            var seq = app.project ? app.project.activeSequence : null;
            if (!seq) return reply(true, "PPro " + app.version + " — no active sequence");
            var sel = selectedVideoClips(seq).length;
            return reply(true, '"' + seq.name + '" — ' + sel + " clip(s) selected");
        } catch (e) { return reply(false, "ping failed: " + e); }
    };

    /* Boil-only entry point (kept for the effect workflow). */
    api.applyEffect = function (jitter, fps, hold) {
        var log = [];
        try {
            jitter = clampNum(jitter, 0, 100, 40);
            fps = clampNum(fps, 1, 30, 12);
            hold = (hold === true || hold === "true");
            if (!app.project || !app.project.activeSequence) return reply(false, "Open a sequence first.");
            var seq = app.project.activeSequence;
            app.enableQE();
            var sel = selectedVideoClips(seq);
            if (!sel.length) return reply(false, "Select a graphic/text clip in the timeline first.");
            var done = 0;
            for (var i = 0; i < sel.length; i++) {
                log.push("▸ " + sel[i].clip.name);
                if (processClip(sel[i], jitter, fps, hold, 1, log)) done++;
            }
            return reply(done > 0, done + " of " + sel.length + " clip(s) processed.", log);
        } catch (e) { return reply(false, "applyEffect failed: " + e, log); }
    };

    /*
     * animateText — the text-animator entry point.
     *   text     : string for the TEXT field ("" to animate the selection as-is)
     *   jitter   : 0..100  (ANIMATION preset intensity)
     *   fps      : boil fps (8/12)
     *   hold     : true = random boil, false = smooth
     *   edgeScale: STYLE roughness multiplier (0 = no edge texture)
     *   inDir/outDir : "none"|"up"|"down"|"left"|"right" TRANSITION directions
     */
    api.animateText = function (text, jitter, fps, hold, edgeScale, inDir, outDir) {
        var log = [];
        try {
            text = trim(text);
            jitter = clampNum(jitter, 0, 100, 40);
            fps = clampNum(fps, 1, 30, 12);
            hold = (hold === true || hold === "true");
            edgeScale = clampNum(edgeScale, 0, 4, 1);

            if (!app.project || !app.project.activeSequence) return reply(false, "Open a sequence first.");
            var seq = app.project.activeSequence;
            app.enableQE();

            // Target: the selection if any, else spawn a text MOGRT.
            var target = null;
            var sel = selectedVideoClips(seq);
            if (sel.length) {
                target = sel[0];
                log.push("▸ animating selected clip: " + target.clip.name);
                if (text) trySetMogrtText(target.clip, text, log);
            } else if (text) {
                var made = importTextMogrt(seq, text, log);
                if (!made.ok) return reply(false, made.message, log);
                target = made.entry;
                trySetMogrtText(target.clip, text, log);
            } else {
                return reply(false, "Type some text, or select a text/graphic clip to animate.");
            }

            // 1) hand-drawn boil  2) directional transition
            processClip(target, jitter, fps, hold, edgeScale, log);
            var t0 = target.clip.inPoint.seconds, t1 = target.clip.outPoint.seconds;
            applyTransition(target.clip, t0, t1, inDir, outDir, log);

            return reply(true, "Animated " + (text ? '"' + text + '"' : target.clip.name) + ".", log);
        } catch (e) {
            return reply(false, "animateText failed: " + e + (e.line ? " (line " + e.line + ")" : ""), log);
        }
    };

    /* Diagnostic: list effect names exposed by this build/locale. */
    api.listEffects = function (filter) {
        var log = [];
        try {
            app.enableQE();
            var list = null;
            try { list = qe.project.getVideoEffectList(); } catch (e1) { list = null; }
            if (!list || !list.length) return reply(false, "Effect list unavailable — read names from the Effects panel.");
            var f = lc(filter || ""), hits = 0;
            for (var i = 0; i < list.length; i++) {
                var nm = String(list[i]);
                if (!f || lc(nm).indexOf(f) !== -1) {
                    log.push(nm); hits++;
                    if (hits >= 60) { log.push("… (truncated)"); break; }
                }
            }
            return reply(true, hits + ' effect(s) matching "' + (filter || "") + '"', log);
        } catch (e) { return reply(false, "listEffects failed: " + e); }
    };

    return api;
})();
