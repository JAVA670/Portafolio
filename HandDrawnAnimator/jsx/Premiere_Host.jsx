/*
 * Premiere_Host.jsx — Hand-Drawn Animator back-end (Premiere Pro)
 * ===========================================================================
 * NATIVE mode: applies the hand-drawn look directly to the clip you've
 * selected on the timeline — no After Effects, no MOGRT, no importMGT (which
 * proved unreliable for scripted import of AE-built MOGRTs on some setups).
 *
 * Workflow: make a text/shape graphic in Premiere (Type tool), select it on
 * the timeline, set the panel controls, click ANIMATE. This script then:
 *   1. adds Turbulent Displace (or Wave Warp) + Roughen Edges + Posterize Time
 *      via the QE DOM and tunes them for a SUBTLE, readable boil,
 *   2. keyframes Evolution/Phase for the infinite "boil" jitter,
 *   3. keyframes Motion>Position + Opacity for the directional in/out.
 *
 * ExtendScript is ES3. Every host call is wrapped so failures are reported,
 * not thrown.
 *
 * API used: app.enableQE() + qe.project.getVideoEffectByName() +
 * qeClip.addVideoEffect() (the only scripting route to ADD an effect);
 * trackItem.components[].properties[] ComponentParam keyframing
 * (setValue/setTimeVarying/addKey/setValueAtKey/setInterpolationTypeAtKey,
 * 0=Linear,4=Hold,5=Bezier; times are clip seconds inPoint→outPoint).
 */

$.global.HDA_HOST = (function () {

    var HOST_VERSION = "v9-native";
    var KF_LINEAR = 0, KF_HOLD = 4, KF_BEZIER = 5;
    var MAX_KEYS = 1500;

    var FX = {
        warp: ["Turbulent Displace", "Desplazamiento turbulento", "Wave Warp", "Deformación de onda"],
        edges: ["Roughen Edges", "Bordes rugosos", "Brush Strokes", "Trazos de pincel"],
        posterize: ["Posterize Time", "Tiempo de posterización"]
    };

    // Animation Speed (1 Light, 2 Normal, 3 Heavy) -> subtle, READABLE boil.
    var SPEED = [
        null,
        { amount: 4,  fps: 12 },   // Light
        { amount: 8,  fps: 12 },   // Normal
        { amount: 15, fps: 8 }     // Heavy
    ];
    // Style (1 None..5 Paper) -> edge-texture border (0 = skip Roughen Edges).
    var STYLE_BORDER = [0, 1, 6, 2, 2, 3]; // index 0 unused; None=1px,Grunge=6,...

    /* ---------------- JSON reply (ES3 has no JSON) ---------------------- */
    function jsonStr(s) {
        s = String(s); var out = "";
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
        var r = '{"ok":' + (ok ? "true" : "false") + ',"message":' + jsonStr("[" + HOST_VERSION + "] " + message);
        if (log && log.length) {
            r += ',"log":[';
            for (var i = 0; i < log.length; i++) r += (i ? "," : "") + jsonStr(log[i]);
            r += "]";
        }
        return r + "}";
    }
    function parsePayload(s) {
        s = String(s == null ? "" : s);
        if (typeof JSON !== "undefined" && JSON.parse) { try { return JSON.parse(s); } catch (e) {} }
        var t = s.replace(/^\s+|\s+$/g, "");
        if (t.charAt(0) !== "{") return null;
        try { return eval("(" + t + ")"); } catch (e2) { return null; }
    }
    function clampNum(v, lo, hi, d) { v = Number(v); if (isNaN(v)) v = d; if (v < lo) v = lo; if (v > hi) v = hi; return v; }
    function round2(v) { return Math.round(v * 100) / 100; }
    function lc(s) { return String(s == null ? "" : s).toLowerCase(); }

    /* ---------------- selection + QE lookup ----------------------------- */
    function selectedVideoClips(seq) {
        var out = [];
        for (var t = 0; t < seq.videoTracks.numTracks; t++) {
            var track = seq.videoTracks[t];
            for (var c = 0; c < track.clips.numItems; c++) {
                var ti = track.clips[c], sel = false;
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
            if (it && String(it.type) !== "Empty") { ord++; if (ord === clipOrdinal) return it; }
        }
        return null;
    }

    /* ---------------- effects + params ---------------------------------- */
    function findComponentByNames(domClip, names) {
        var comps = domClip.components;
        for (var n = 0; n < names.length; n++) {
            var want = lc(names[n]), found = null;
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
        catch (e) { log.push(label + ": setValue failed"); return false; }
    }

    /* ---------------- keyframes ----------------------------------------- */
    function clearKeys(param, t0, t1) { try { param.removeKeyRange(t0 - 1, t1 + 1, true); } catch (e) {} }
    function setKeys(param, keys, interp) {
        if (!param || !keys.length) return false;
        try { param.setTimeVarying(true); } catch (e) { return false; }
        clearKeys(param, keys[0][0], keys[keys.length - 1][0]);
        for (var i = 0; i < keys.length; i++) {
            try { param.addKey(keys[i][0]); param.setValueAtKey(keys[i][0], keys[i][1], false); param.setInterpolationTypeAtKey(keys[i][0], interp, false); } catch (e2) {}
        }
        return true;
    }
    function boilHoldKeys(param, t0, t1, fps, log, label) {
        try { param.setTimeVarying(true); } catch (e) { log.push(label + ": not keyframeable"); return; }
        clearKeys(param, t0, t1);
        var step = 1 / fps, n = Math.floor((t1 - t0) / step) + 1;
        if (n > MAX_KEYS) n = MAX_KEYS;
        for (var i = 0; i < n; i++) {
            var t = t0 + i * step, v = round2((i * 137.508) % 360);
            param.addKey(t); param.setValueAtKey(t, v, false);
            try { param.setInterpolationTypeAtKey(t, KF_HOLD, false); } catch (e2) {}
        }
        log.push(label + ": " + n + " boil keys @ " + fps + "fps");
    }

    /* ---------------- transition (Position + Opacity) ------------------- */
    function readCenter(pos) {
        var c = null; try { c = pos.getValue(); } catch (e) { return null; }
        if (!c || c.length !== 2) return null;
        var cx = c[0], cy = c[1], norm = (Math.abs(cx) <= 2 && Math.abs(cy) <= 2);
        return { cx: cx, cy: cy, ox: norm ? 1.2 : (Math.abs(cx) * 2 || 1920), oy: norm ? 1.2 : (Math.abs(cy) * 2 || 1080) };
    }
    function startPos(dir, c) { // 1 Up,2 Down,3 Left,4 Right — direction of travel
        if (dir === 1) return [c.cx, c.cy + c.oy];
        if (dir === 2) return [c.cx, c.cy - c.oy];
        if (dir === 3) return [c.cx + c.ox, c.cy];
        if (dir === 4) return [c.cx - c.ox, c.cy];
        return [c.cx, c.cy];
    }
    function endPos(dir, c) {
        if (dir === 1) return [c.cx, c.cy - c.oy];
        if (dir === 2) return [c.cx, c.cy + c.oy];
        if (dir === 3) return [c.cx - c.ox, c.cy];
        if (dir === 4) return [c.cx + c.ox, c.cy];
        return [c.cx, c.cy];
    }
    function applyTransition(clip, t0, t1, inDir, outDir, log) {
        if (!inDir && !outDir) { log.push("transition: none"); return; }
        var dur = Math.min(0.5, (t1 - t0) / 3);
        if (dur <= 0.001) { log.push("transition: clip too short"); return; }
        var motion = findComponentByNames(clip, ["Motion", "Movimiento"]);
        var pos = motion ? findParam(motion.comp, ["Position", "Posición"]) : null;
        var opC = findComponentByNames(clip, ["Opacity", "Opacidad"]);
        var op = opC ? findParam(opC.comp, ["Opacity", "Opacidad"]) : null;
        if (pos) {
            var c = readCenter(pos);
            if (c) {
                var k = [];
                if (inDir) { k.push([t0, startPos(inDir, c)]); k.push([t0 + dur, [c.cx, c.cy]]); }
                if (outDir) { k.push([t1 - dur, [c.cx, c.cy]]); k.push([t1, endPos(outDir, c)]); }
                setKeys(pos, k, KF_BEZIER);
                log.push("transition: position slide");
            } else { log.push("transition: position unreadable — opacity only"); }
        }
        if (op) {
            var ok = [];
            if (inDir) { ok.push([t0, 0]); ok.push([t0 + dur, 100]); }
            if (outDir) { ok.push([t1 - dur, 100]); ok.push([t1, 0]); }
            setKeys(op, ok, KF_LINEAR);
        }
    }

    /* ---------------- per-clip application ------------------------------ */
    function applyToClip(entry, speed, border, inDir, outDir, log) {
        var clip = entry.clip;
        var qeClip = qeClipAt(entry.trackIndex, entry.clipOrdinal);
        if (!qeClip) { log.push("QE counterpart not found — skipped"); return false; }
        var t0 = clip.inPoint.seconds, t1 = clip.outPoint.seconds;

        var warp = ensureEffect(clip, qeClip, FX.warp, log, "warp");
        if (warp) {
            var nm = lc(warp.name);
            if (nm.indexOf("turbulent") !== -1 || nm.indexOf("turbulento") !== -1) {
                setNum(warp.comp, ["Amount", "Cantidad"], speed.amount, log, "Turbulent > Amount");
                setNum(warp.comp, ["Size", "Tamaño"], 60, log, "Turbulent > Size"); // large = smooth, readable
                var evo = findParam(warp.comp, ["Evolution", "Evolución"]);
                if (evo) boilHoldKeys(evo, t0, t1, speed.fps, log, "Turbulent > Evolution");
            } else {
                var wt = findParam(warp.comp, ["Wave Type", "Tipo de onda"]);
                if (wt) { try { wt.setValue(8, true); } catch (e) {} }
                setNum(warp.comp, ["Wave Height", "Altura de onda"], Math.round(speed.amount / 4), log, "Wave > Height");
                setNum(warp.comp, ["Wave Width", "Anchura de onda"], 60, log, "Wave > Width");
                var ph = findParam(warp.comp, ["Phase", "Fase"]);
                if (ph) { setNum(warp.comp, ["Wave Speed", "Velocidad de onda"], 0, log, "Wave > Speed"); boilHoldKeys(ph, t0, t1, speed.fps, log, "Wave > Phase"); }
            }
        }

        if (border > 0) {
            var edges = ensureEffect(clip, qeClip, FX.edges, log, "edges");
            if (edges && lc(edges.name).indexOf("roughen") !== -1) {
                setNum(edges.comp, ["Border", "Borde"], border, log, "Roughen > Border");
                var revo = findParam(edges.comp, ["Evolution", "Evolución"]);
                if (revo) boilHoldKeys(revo, t0, t1, speed.fps, log, "Roughen > Evolution");
            }
        }

        var post = ensureEffect(clip, qeClip, FX.posterize, log, "posterize");
        if (post) setNum(post.comp, ["Frame Rate", "Velocidad de fotogramas"], speed.fps, log, "Posterize > Frame Rate");

        applyTransition(clip, t0, t1, inDir, outDir, log);
        return true;
    }

    /* ---------------- public API ---------------------------------------- */
    var api = {};

    api.ping = function () {
        try {
            var seq = app.project ? app.project.activeSequence : null;
            if (!seq) return reply(true, "no sequence open");
            var n = selectedVideoClips(seq).length;
            return reply(true, '"' + seq.name + '" — ' + n + " clip(s) selected" + (n ? "" : " (select a text/graphic clip)"));
        } catch (e) { return reply(false, "ping failed: " + e); }
    };

    /*
     * animate(jsonString) — applies the look to every selected video clip.
     * payload = { speedIndex 1-3, styleIndex 1-5, inIndex 1-4, outIndex 1-4 }
     * Directions: 0/none disables that side; 1 Up,2 Down,3 Left,4 Right.
     */
    api.animate = function (jsonString) {
        var log = [];
        try {
            var d = parsePayload(jsonString) || {};
            if (!app.project || !app.project.activeSequence) return reply(false, "Open a sequence first.");
            var seq = app.project.activeSequence;
            app.enableQE();

            var sel = selectedVideoClips(seq);
            if (!sel.length) return reply(false, "Select a text or graphic clip on the timeline first (make one with the Type tool).");

            var speed = SPEED[clampNum(d.speedIndex, 1, 3, 2)];
            var border = STYLE_BORDER[clampNum(d.styleIndex, 1, 5, 1)];
            var inDir = clampNum(d.inIndex, 0, 4, 0);
            var outDir = clampNum(d.outIndex, 0, 4, 0);

            var done = 0;
            for (var i = 0; i < sel.length; i++) {
                log.push("▸ " + sel[i].clip.name);
                if (applyToClip(sel[i], speed, border, inDir, outDir, log)) done++;
            }
            return reply(done > 0, "Hand-drawn look applied to " + done + " clip(s). Tip: a bold/thick font reads best.", log);
        } catch (e) {
            return reply(false, "animate failed: " + e + (e.line ? " (line " + e.line + ")" : ""), log);
        }
    };

    api.listEffects = function (filter) {
        var log = [];
        try {
            app.enableQE();
            var list = null; try { list = qe.project.getVideoEffectList(); } catch (e1) { list = null; }
            if (!list || !list.length) return reply(false, "effect list unavailable");
            var f = lc(filter || ""), hits = 0;
            for (var i = 0; i < list.length; i++) {
                var nm = String(list[i]);
                if (!f || lc(nm).indexOf(f) !== -1) { log.push(nm); if (++hits >= 60) { log.push("…"); break; } }
            }
            return reply(true, hits + ' effect(s) matching "' + (filter || "") + '"', log);
        } catch (e) { return reply(false, "listEffects failed: " + e); }
    };

    return api;
})();
