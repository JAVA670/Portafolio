/*
 * AE_Host.jsx — Hand-Drawn Animator back-end (After Effects, CEP)
 * ===========================================================================
 * Driven by the CEP panel (index.html / main.js) via CSInterface.evalScript.
 * Builds the full kinetic hand-drawn text animation in an AE comp: real
 * hand-drawn fonts, edge texture/styles, smooth eased in/out animations,
 * word-by-word morph, and .srt VOICE SYNC so text lands on your speech.
 *
 * Returns JSON strings so the panel can show status. ExtendScript ES3.
 */

$.global.HDA_AE = (function () {

    var HOST_VERSION = "ae-v2";
    var W = 1920, H = 1080, FPS = 24, MAX_CHUNKS = 500;

    var SPEEDS = {
        "Light":  { amount: 6,  evo: 40,  fps: 12 },
        "Normal": { amount: 12, evo: 90,  fps: 12 },
        "Heavy":  { amount: 20, evo: 150, fps: 8  }
    };
    var STYLE_CFG = {
        "Hand-Drawn": { border: 2,  boil: true },
        "Grunge":     { border: 14, boil: true, curves: true },
        "Marker":     { border: 6,  boil: true },
        "Film":       { border: 2,  boil: true, glow: 30, grain: true },
        "VHS":        { border: 2,  boil: true, vhs: true },
        "Paper":      { border: 3,  boil: true, paper: true },
        "Neon":       { border: 1,  boil: true, glow: 60 },
        "Clean":      { border: 0,  boil: false }
    };
    var SMOOTH = { "Low": 33, "Medium": 66, "High": 85 };

    /* ---------- JSON reply / parse ---------- */
    function jsonStr(s) {
        s = String(s); var out = "";
        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            if (c === '"' || c === "\\") out += "\\" + c;
            else if (c === "\n") out += "\\n"; else if (c === "\r") out += "\\r";
            else if (c === "\t") out += "\\t"; else out += c;
        }
        return '"' + out + '"';
    }
    function reply(ok, message, log) {
        var r = '{"ok":' + (ok ? "true" : "false") + ',"message":' + jsonStr("[" + HOST_VERSION + "] " + message);
        if (log && log.length) { r += ',"log":['; for (var i = 0; i < log.length; i++) r += (i ? "," : "") + jsonStr(log[i]); r += "]"; }
        return r + "}";
    }
    function parsePayload(s) {
        s = String(s == null ? "" : s);
        if (typeof JSON !== "undefined" && JSON.parse) { try { return JSON.parse(s); } catch (e) {} }
        var t = s.replace(/^\s+|\s+$/g, "");
        if (t.charAt(0) !== "{") return null;
        try { return eval("(" + t + ")"); } catch (e2) { return null; }
    }

    /* ---------- helpers ---------- */
    function trim(s) { return String(s == null ? "" : s).replace(/^\s+|\s+$/g, ""); }
    function num(v, d) { v = Number(v); return isNaN(v) ? d : v; }
    function addFx(layer, mn) { return layer.property("ADBE Effect Parade").addProperty(mn); }
    function setP(fx, name, v) { try { fx.property(name).setValue(v); } catch (e) {} }
    function setExpr(fx, name, e) { try { fx.property(name).expression = e; } catch (er) {} }
    function tg(layer) { return layer.property("ADBE Transform Group"); }
    function P(layer, name) { return tg(layer).property(name); }
    function key(prop, t, v) { prop.setValueAtTime(t, v); }

    function splitText(text, mode) {
        text = trim(text); if (text === "") return [];
        if (mode === "Whole line") return [text];
        if (mode === "Sentences") {
            var parts = text.split(/\s*[\/\n]\s*/), o = [];
            for (var i = 0; i < parts.length; i++) if (trim(parts[i]) !== "") o.push(trim(parts[i]));
            return o.length ? o : [text];
        }
        var words = text.replace(/\s+/g, " ").split(" ");
        var per = (mode === "2 words") ? 2 : (mode === "3 words") ? 3 : 1, out = [];
        for (var j = 0; j < words.length; j += per) out.push(words.slice(j, j + per).join(" "));
        return out;
    }

    function tcToSec(tc) {
        var m = trim(tc).replace(".", ",").match(/(\d+):(\d+):(\d+)[,](\d+)/);
        if (!m) return -1;
        return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000;
    }
    function parseSRT(file) {
        var cues = [];
        try {
            file.encoding = "UTF-8"; file.open("r"); var content = file.read(); file.close();
            content = content.replace(/\r/g, "");
            var blocks = content.split(/\n\s*\n/);
            for (var b = 0; b < blocks.length; b++) {
                var lines = blocks[b].split("\n"), tcLine = -1;
                for (var l = 0; l < lines.length; l++) if (lines[l].indexOf("-->") !== -1) { tcLine = l; break; }
                if (tcLine < 0) continue;
                var tcs = lines[tcLine].split("-->");
                var start = tcToSec(tcs[0]), end = tcToSec(tcs[1]);
                if (start < 0 || end <= start) continue;
                var txt = [];
                for (var t = tcLine + 1; t < lines.length; t++) if (trim(lines[t]) !== "") txt.push(trim(lines[t]));
                if (txt.length) cues.push({ start: start, end: end, text: txt.join(" ") });
            }
        } catch (e) {}
        return cues;
    }

    function buildChunkList(o) {
        var out = [];
        if (o.source === "srt") {
            if (!o.srtPath) return [];
            var cues = parseSRT(new File(o.srtPath));
            for (var i = 0; i < cues.length; i++) {
                var c = cues[i];
                if (o.sync === "Word") {
                    var words = c.text.replace(/\s+/g, " ").split(" "), n = words.length, dur = (c.end - c.start) / Math.max(1, n);
                    for (var j = 0; j < n; j++) { var s = c.start + j * dur; out.push({ text: words[j], inSec: s, outSec: s + dur + (o.morph ? dur * 0.4 : 0) }); }
                } else out.push({ text: c.text, inSec: c.start, outSec: c.end + (o.morph ? 0.2 : 0) });
            }
        } else {
            var parts = splitText(o.text, o.split);
            var holdF = Math.max(2, Math.round(o.framesPerChunk)), morph = o.morph && parts.length > 1;
            var overlapF = morph ? Math.max(2, Math.round(holdF * 0.5)) : 0;
            if (overlapF >= holdF) overlapF = holdF - 1;
            var stepF = holdF - overlapF;
            for (var k = 0; k < parts.length; k++) out.push({ text: parts[k], inSec: (k * stepF) / FPS, outSec: (k * stepF + holdF) / FPS });
        }
        return out;
    }

    function resolveFont(name) {
        try {
            if (app.fonts && app.fonts.allFonts) {
                var all = app.fonts.allFonts, lcn = String(name).toLowerCase(), best = null;
                for (var i = 0; i < all.length; i++) {
                    var f = all[i], fam = f.familyName ? f.familyName.toLowerCase() : "", ps = f.postScriptName ? f.postScriptName.toLowerCase() : "";
                    if (fam === lcn || ps === lcn) { best = f; if (f.fontStyle && /regular|book/i.test(f.fontStyle)) break; }
                }
                if (best) return best.postScriptName;
            }
        } catch (e) {}
        return name;
    }

    /* ---------- easing ---------- */
    function easeProp(prop, infl) {
        if (!prop || prop.numKeys < 1) return;
        var dims = 1;
        try { var v = prop.valueAtTime(prop.keyTime(1), false); dims = (v instanceof Array) ? v.length : 1; } catch (e) { dims = 1; }
        for (var k = 1; k <= prop.numKeys; k++) {
            var ein = [], eout = [];
            for (var d = 0; d < dims; d++) { ein.push(new KeyframeEase(0, infl)); eout.push(new KeyframeEase(0, infl)); }
            try { prop.setTemporalEaseAtKey(k, ein, eout); } catch (e2) {}
        }
    }
    function easeLayer(layer, infl) {
        easeProp(P(layer, "ADBE Position"), infl); easeProp(P(layer, "ADBE Scale"), infl);
        easeProp(P(layer, "ADBE Opacity"), infl); easeProp(P(layer, "ADBE Rotate Z"), infl);
        try { var b = layer.property("ADBE Effect Parade").property("ADBE Gaussian Blur 2"); if (b) easeProp(b.property(1), infl); } catch (e) {}
    }

    /* ---------- in/out animation library ---------- */
    function applyIn(layer, cx, cy, t0, dur, preset) {
        var off = 200, op = P(layer, "ADBE Opacity"), pos = P(layer, "ADBE Position"), sc = P(layer, "ADBE Scale"), rot = P(layer, "ADBE Rotate Z");
        if (preset !== "Hard") { key(op, t0, 0); key(op, t0 + dur, 100); } else key(op, t0, 100);
        switch (preset) {
            case "Slide Up":    key(pos, t0, [cx, cy + off]); key(pos, t0 + dur, [cx, cy]); break;
            case "Slide Down":  key(pos, t0, [cx, cy - off]); key(pos, t0 + dur, [cx, cy]); break;
            case "Slide Left":  key(pos, t0, [cx + off, cy]); key(pos, t0 + dur, [cx, cy]); break;
            case "Slide Right": key(pos, t0, [cx - off, cy]); key(pos, t0 + dur, [cx, cy]); break;
            case "Rise":        key(pos, t0, [cx, cy + 70]); key(pos, t0 + dur, [cx, cy]); break;
            case "Pop":         key(sc, t0, [25, 25]); key(sc, t0 + dur * 0.7, [113, 113]); key(sc, t0 + dur, [100, 100]); break;
            case "Scale":       key(sc, t0, [40, 40]); key(sc, t0 + dur, [100, 100]); break;
            case "Bounce":      key(pos, t0, [cx, cy + off]); key(pos, t0 + dur * 0.65, [cx, cy - 22]); key(pos, t0 + dur, [cx, cy]); break;
            case "Spin":        key(rot, t0, -32); key(rot, t0 + dur, 0); key(sc, t0, [55, 55]); key(sc, t0 + dur, [100, 100]); break;
            case "Blur":        try { var gb = addFx(layer, "ADBE Gaussian Blur 2"); var bp = gb.property(1); bp.setValueAtTime(t0, 60); bp.setValueAtTime(t0 + dur, 0); } catch (e) {} break;
        }
    }
    function applyOut(layer, cx, cy, t1, dur, preset) {
        var off = 200, s = t1 - dur, op = P(layer, "ADBE Opacity"), pos = P(layer, "ADBE Position"), sc = P(layer, "ADBE Scale"), rot = P(layer, "ADBE Rotate Z");
        if (preset !== "Hard") { key(op, s, 100); key(op, t1, 0); } else key(op, t1, 100);
        switch (preset) {
            case "Slide Up":    key(pos, s, [cx, cy]); key(pos, t1, [cx, cy - off]); break;
            case "Slide Down":  key(pos, s, [cx, cy]); key(pos, t1, [cx, cy + off]); break;
            case "Slide Left":  key(pos, s, [cx, cy]); key(pos, t1, [cx - off, cy]); break;
            case "Slide Right": key(pos, s, [cx, cy]); key(pos, t1, [cx + off, cy]); break;
            case "Rise":        key(pos, s, [cx, cy]); key(pos, t1, [cx, cy - 70]); break;
            case "Pop":         key(sc, s, [100, 100]); key(sc, t1, [25, 25]); break;
            case "Scale":       key(sc, s, [100, 100]); key(sc, t1, [40, 40]); break;
            case "Bounce":      key(pos, s, [cx, cy]); key(pos, t1, [cx, cy + off]); break;
            case "Spin":        key(rot, s, 0); key(rot, t1, 32); key(sc, s, [100, 100]); key(sc, t1, [55, 55]); break;
            case "Blur":        try { var gb = layer.property("ADBE Effect Parade").property("ADBE Gaussian Blur 2") || addFx(layer, "ADBE Gaussian Blur 2"); var bp = gb.property(1); bp.setValueAtTime(s, 0); bp.setValueAtTime(t1, 60); } catch (e) {} break;
        }
    }

    function applyBoil(layer, speed, cfg) {
        if (!cfg.boil) return;
        var td = addFx(layer, "ADBE Turbulent Displace"); setP(td, "Amount", speed.amount); setP(td, "Size", 50); setExpr(td, "Evolution", "time * " + speed.evo + ";");
        if (cfg.border > 0) { var r = addFx(layer, "ADBE Roughen Edges"); setP(r, "Border", cfg.border); setExpr(r, "Evolution", "time * 70;"); }
        if (cfg.curves) { try { addFx(layer, "ADBE CurvesCustom"); } catch (e) {} }
        if (cfg.glow) { try { var g = addFx(layer, "ADBE Glo2"); setP(g, "Glow Radius", cfg.glow); setP(g, "Glow Threshold", 50); } catch (e2) {} }
        if (cfg.grain) { try { setP(addFx(layer, "ADBE Noise"), "Amount of Noise", 6); } catch (e3) {} }
        if (cfg.vhs) { try { var v = addFx(layer, "ADBE Turbulent Displace"); setP(v, "Displacement", 8); setP(v, "Amount", 28); setP(v, "Size", 14); setExpr(v, "Evolution", "time * 300;"); } catch (e4) {} }
        var post = addFx(layer, "ADBE Posterize Time"); setP(post, "Frame Rate", speed.fps);
    }

    function addChunk(comp, item, o, fontPS, speed, cfg, animDur, infl) {
        var tl = comp.layers.addText(item.text);
        var src = tl.property("ADBE Text Properties").property("ADBE Text Document");
        var td = src.value;
        td.resetCharStyle(); td.fontSize = o.size; td.fillColor = o.color; td.applyFill = true;
        if (o.outline) { td.applyStroke = true; td.strokeColor = [0, 0, 0]; td.strokeWidth = Math.max(2, o.size / 18); td.strokeOverFill = false; } else td.applyStroke = false;
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        try { td.font = fontPS; } catch (e) {}
        src.setValue(td);

        try {
            var rect0 = tl.sourceRectAtTime(item.inSec + 0.001, false), maxW = comp.width * 0.9;
            if (rect0.width > maxW && rect0.width > 0) { td.fontSize = Math.max(24, Math.floor(o.size * (maxW / rect0.width))); if (o.outline) td.strokeWidth = Math.max(2, td.fontSize / 18); src.setValue(td); }
        } catch (eFit) {}

        tl.inPoint = item.inSec; tl.outPoint = item.outSec;
        try { var r = tl.sourceRectAtTime(item.inSec + Math.min(animDur, (item.outSec - item.inSec) / 2), false); tg(tl).property("ADBE Anchor Point").setValue([r.left + r.width / 2, r.top + r.height / 2]); } catch (e2) {}
        var cx = comp.width / 2, cy = o.posY;
        tg(tl).property("ADBE Position").setValue([cx, cy]);
        if (o.jitter && o.inAnim !== "Spin" && o.outAnim !== "Spin") { try { tg(tl).property("ADBE Rotate Z").setValue((Math.random() * 6) - 3); } catch (eJ) {} }

        var d = Math.min(animDur, (item.outSec - item.inSec) / 2.2); if (d <= 0) d = 1 / FPS;
        applyIn(tl, cx, cy, item.inSec, d, o.inAnim);
        applyOut(tl, cx, cy, item.outSec, d, o.outAnim);
        easeLayer(tl, infl);
        applyBoil(tl, speed, cfg);
        if (o.shadow) { try { var ds = addFx(tl, "ADBE Drop Shadow"); setP(ds, "Opacity", 160); setP(ds, "Distance", 8); setP(ds, "Softness", 18); } catch (e3) {} }
        return tl;
    }

    function build(o) {
        var chunks = buildChunkList(o);
        if (!chunks.length) return reply(false, o.source === "srt" ? "No cues found — pick a valid .srt file." : "Type some text first.");
        if (chunks.length > MAX_CHUNKS) return reply(false, "Too many chunks (" + chunks.length + "). Use Phrase sync or shorter text.");

        app.beginUndoGroup("Build Hand-Drawn Animation");
        try {
            var lastEnd = 0;
            for (var i = 0; i < chunks.length; i++) if (chunks[i].outSec > lastEnd) lastEnd = chunks[i].outSec;
            var comp = app.project.items.addComp("HandDrawn_" + (o.source === "srt" ? "subs" : "text"), W, H, 1.0, lastEnd + 0.5, FPS);
            comp.openInViewer();
            if (o.darkBG) comp.layers.addSolid([0.02, 0.02, 0.02], "BG", W, H, 1.0, comp.duration);

            var speed = SPEEDS[o.speed] || SPEEDS["Normal"], cfg = STYLE_CFG[o.style] || STYLE_CFG["Hand-Drawn"], infl = SMOOTH[o.smooth] || 85;
            o.posY = (o.position === "Lower third") ? H * 0.78 : (o.position === "Top") ? H * 0.20 : H / 2;
            var fontPS = resolveFont(o.font), animDur = 0.33;

            for (var c = 0; c < chunks.length; c++) addChunk(comp, chunks[c], o, fontPS, speed, cfg, animDur, infl);

            if (cfg.paper) { try { var paper = comp.layers.addSolid([1, 1, 1], "PAPER", W, H, 1.0, comp.duration); var fn = addFx(paper, "ADBE Fractal Noise"); setP(fn, "Contrast", 130); setP(fn, "Brightness", -10); paper.blendingMode = BlendingMode.MULTIPLY; } catch (e) {} }

            return reply(true, "Built " + chunks.length + ' chunk(s) — "' + comp.name + '". Font: ' + fontPS + ". Render or dynamic-link the comp into Premiere.");
        } catch (e) {
            return reply(false, "Build failed: " + e.toString() + (e.line ? " (line " + e.line + ")" : ""));
        } finally {
            app.endUndoGroup();
        }
    }

    /* ---------- public API ---------- */
    var api = {};

    api.ping = function () {
        try {
            if (!app.project) return reply(true, "AE " + app.version + " — open/create a project");
            var fonts = 0; try { fonts = (app.fonts && app.fonts.allFonts) ? app.fonts.allFonts.length : 0; } catch (e) {}
            return reply(true, "AE ready" + (fonts ? " — " + fonts + " fonts available" : ""));
        } catch (e) { return reply(false, "ping failed: " + e); }
    };

    // Opens AE's file dialog and returns the chosen .srt path (or "").
    api.pickSRT = function () {
        try { var f = File.openDialog("Pick a subtitle .srt", "*.srt"); return f ? f.fsName : ""; }
        catch (e) { return ""; }
    };

    api.build = function (jsonString) {
        try {
            var o = parsePayload(jsonString);
            if (!o) return reply(false, "Could not parse the panel payload.");
            if (!app.project) { try { app.newProject(); } catch (e) { return reply(false, "Open a project first."); } }
            // normalize / defaults
            o.source = o.source || "text";
            o.text = o.text == null ? "" : o.text;
            o.split = o.split || "Word by word";
            o.sync = o.sync || "Word";
            o.font = trim(o.font) || "Arial";
            o.size = num(o.size, 200);
            o.color = (o.color && o.color.length === 3) ? o.color : [1, 1, 1];
            o.style = o.style || "Hand-Drawn";
            o.speed = o.speed || "Normal";
            o.smooth = o.smooth || "High";
            o.inAnim = o.inAnim || "Fade";
            o.outAnim = o.outAnim || "Fade";
            o.position = o.position || "Center";
            o.framesPerChunk = num(o.framesPerChunk, 12);
            o.morph = !!o.morph; o.outline = !!o.outline; o.shadow = !!o.shadow; o.jitter = !!o.jitter; o.darkBG = !!o.darkBG;
            return build(o);
        } catch (e) { return reply(false, "build error: " + e); }
    };

    return api;
})();
