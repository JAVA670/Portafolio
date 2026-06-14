/*
 * HandDrawnAnimator_AE.jsx — Hand-Drawn Animator v2 (After Effects)
 * ===========================================================================
 * The "best tool for social-media subtitles and text-when-you-speak."
 * A dockable ScriptUI panel that BUILDS animated kinetic text in an AE comp:
 *
 *   • VOICE SYNC — import an .srt (e.g. from Premiere's free Speech-to-Text)
 *     and the words land exactly on your speech, Phrase or Word-by-word.
 *   • Manual text mode — type text, split by word / N-words / sentence / line.
 *   • IN / OUT animation library — Fade, Slide (4 dirs), Pop, Bounce, Scale,
 *     Spin, Blur, Rise, Hard — with SMOOTH eased keyframes (Low/Med/High).
 *   • MORPH — consecutive chunks overlap and cross-blend (word→word).
 *   • Styles — Hand-Drawn, Grunge, Marker, Film, VHS, Paper, Neon, Clean.
 *   • Readability — outline + drop shadow for subtitles.
 *   • Quick social presets that set everything in one click.
 *
 * Output: a finished comp — render it or dynamic-link it into Premiere.
 * No MOGRT, no importMGT.
 *
 * INSTALL (dockable): copy into AE's  Scripts/ScriptUI Panels/  and restart,
 * or run once via File ▸ Scripts ▸ Run Script File…  Enable Preferences ▸
 * Scripting & Expressions ▸ "Allow Scripts to Write Files and Access Network".
 *
 * GET AN SRT: in Premiere, Window ▸ Text ▸ Transcribe, then Create Captions,
 * then export them as .srt (or use any tool that writes .srt). Import it here.
 */

(function (thisObj) {

    var W = 1920, H = 1080, FPS = 24;
    var MAX_CHUNKS = 500;

    // Speed: amount = displacement, evo = boil rate, fps = posterize step
    var SPEEDS = {
        "Light":  { amount: 6,  evo: 40,  fps: 12 },
        "Normal": { amount: 12, evo: 90,  fps: 12 },
        "Heavy":  { amount: 20, evo: 150, fps: 8  }
    };
    // Per-style config (border = Roughen Edges amount; flags add signature fx)
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
    var IN_OUT = ["Fade", "Slide Up", "Slide Down", "Slide Left", "Slide Right",
                  "Pop", "Bounce", "Scale", "Spin", "Blur", "Rise", "Hard"];
    var SMOOTH = { "Low": 33, "Medium": 66, "High": 85 };

    var FONT_SUGGESTIONS = ["Permanent Marker", "Caveat", "Rock Salt",
        "Shadows Into Light", "Gochi Hand", "Patrick Hand", "Bangers", "Anton", "Arial"];

    // Quick presets set many controls at once. Keys map to UI control names.
    var PRESETS = {
        "TikTok Captions": { style: "Clean", font: "Anton", inAnim: "Pop", outAnim: "Fade", morph: false, split: "Word by word", outline: true, shadow: true, speed: "Light" },
        "Hand-Drawn Boil": { style: "Marker", font: "Permanent Marker", inAnim: "Fade", outAnim: "Fade", morph: true, split: "Word by word", outline: false, shadow: false, speed: "Normal" },
        "Clean Subtitle":  { style: "Clean", font: "Arial", inAnim: "Fade", outAnim: "Fade", morph: false, split: "Sentences (/ or line)", outline: true, shadow: true, speed: "Light" },
        "Kinetic Pop":     { style: "Neon", font: "Bangers", inAnim: "Bounce", outAnim: "Scale", morph: false, split: "Word by word", outline: true, shadow: true, speed: "Normal" }
    };

    /* ===================== helpers ===================== */

    function trim(s) { return String(s == null ? "" : s).replace(/^\s+|\s+$/g, ""); }
    function addFx(layer, mn) { return layer.property("ADBE Effect Parade").addProperty(mn); }
    function setP(fx, name, v) { try { fx.property(name).setValue(v); } catch (e) {} }
    function setExpr(fx, name, e) { try { fx.property(name).expression = e; } catch (er) {} }
    function tg(layer) { return layer.property("ADBE Transform Group"); }

    function splitText(text, mode) {
        text = trim(text);
        if (text === "") return [];
        if (mode === "Whole line") return [text];
        if (mode === "Sentences (/ or line)") {
            var parts = text.split(/\s*[\/\n]\s*/), o = [];
            for (var i = 0; i < parts.length; i++) if (trim(parts[i]) !== "") o.push(trim(parts[i]));
            return o.length ? o : [text];
        }
        var words = text.replace(/\s+/g, " ").split(" ");
        var per = (mode === "2 words") ? 2 : (mode === "3 words") ? 3 : 1, out = [];
        for (var j = 0; j < words.length; j += per) out.push(words.slice(j, j + per).join(" "));
        return out;
    }

    /* ---- SRT parsing (voice sync) ---- */
    function tcToSec(tc) {
        var m = trim(tc).replace(".", ",").match(/(\d+):(\d+):(\d+)[,](\d+)/);
        if (!m) return -1;
        return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000;
    }
    function parseSRT(file) {
        var cues = [];
        try {
            file.encoding = "UTF-8";
            file.open("r"); var content = file.read(); file.close();
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
                if (!txt.length) continue;
                cues.push({ start: start, end: end, text: txt.join(" ") });
            }
        } catch (e) {}
        return cues;
    }

    // Unified chunk list: [{text, inSec, outSec}] from either source.
    function buildChunkList(opts) {
        var out = [];
        if (opts.source === "srt") {
            if (!opts.srtFile) return [];
            var cues = parseSRT(opts.srtFile);
            for (var i = 0; i < cues.length; i++) {
                var c = cues[i];
                if (opts.sync === "Word") {
                    var words = c.text.replace(/\s+/g, " ").split(" "), n = words.length;
                    var dur = (c.end - c.start) / Math.max(1, n);
                    for (var j = 0; j < n; j++) {
                        var s = c.start + j * dur;
                        var e = s + dur + (opts.morph ? dur * 0.4 : 0);
                        out.push({ text: words[j], inSec: s, outSec: e });
                    }
                } else {
                    out.push({ text: c.text, inSec: c.start, outSec: c.end + (opts.morph ? 0.2 : 0) });
                }
            }
        } else {
            var parts = splitText(opts.text, opts.split);
            var holdF = Math.max(2, Math.round(opts.framesPerChunk));
            var morph = opts.morph && parts.length > 1;
            var overlapF = morph ? Math.max(2, Math.round(holdF * 0.5)) : 0;
            if (overlapF >= holdF) overlapF = holdF - 1;
            var stepF = holdF - overlapF;
            for (var k = 0; k < parts.length; k++) {
                out.push({ text: parts[k], inSec: (k * stepF) / FPS, outSec: (k * stepF + holdF) / FPS });
            }
        }
        return out;
    }

    /* ---- fonts ---- */
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
    function installedHandFonts() {
        var found = [];
        try {
            if (app.fonts && app.fonts.allFonts) {
                var kw = /(marker|brush|hand|script|sketch|scrawl|crayon|chalk|comic|caveat|permanent|rock salt|shadows|gochi|reenie|patrick|bangers|anton|pencil|ink|doodle)/i;
                var seen = {}, all = app.fonts.allFonts;
                for (var i = 0; i < all.length; i++) { var fam = all[i].familyName; if (fam && kw.test(fam) && !seen[fam]) { seen[fam] = 1; found.push(fam); } }
                found.sort();
            }
        } catch (e) {}
        return found;
    }

    /* ---- easing ---- */
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
        easeProp(tg(layer).property("ADBE Position"), infl);
        easeProp(tg(layer).property("ADBE Scale"), infl);
        easeProp(tg(layer).property("ADBE Opacity"), infl);
        easeProp(tg(layer).property("ADBE Rotate Z"), infl);
        try { var b = layer.property("ADBE Effect Parade").property("ADBE Gaussian Blur 2"); if (b) easeProp(b.property(1), infl); } catch (e) {}
    }

    /* ---- in/out animation library ---- */
    function P(layer, name) { return tg(layer).property(name); }
    function key(prop, t, v) { prop.setValueAtTime(t, v); }

    function applyIn(layer, cx, cy, t0, dur, preset) {
        var off = 200;
        var op = P(layer, "ADBE Opacity"), pos = P(layer, "ADBE Position"), sc = P(layer, "ADBE Scale"), rot = P(layer, "ADBE Rotate Z");
        if (preset !== "Hard") { key(op, t0, 0); key(op, t0 + dur, 100); } else { key(op, t0, 100); }
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
        var off = 200, s = t1 - dur;
        var op = P(layer, "ADBE Opacity"), pos = P(layer, "ADBE Position"), sc = P(layer, "ADBE Scale"), rot = P(layer, "ADBE Rotate Z");
        if (preset !== "Hard") { key(op, s, 100); key(op, t1, 0); } else { key(op, t1, 100); }
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

    /* ---- per-layer boil + texture (steps content, not the smooth transform) ---- */
    function applyBoil(layer, speed, cfg) {
        if (!cfg.boil) return;
        var td = addFx(layer, "ADBE Turbulent Displace");
        setP(td, "Amount", speed.amount); setP(td, "Size", 50);
        setExpr(td, "Evolution", "time * " + speed.evo + ";");
        if (cfg.border > 0) { var r = addFx(layer, "ADBE Roughen Edges"); setP(r, "Border", cfg.border); setExpr(r, "Evolution", "time * 70;"); }
        if (cfg.curves) { try { addFx(layer, "ADBE CurvesCustom"); } catch (e) {} }
        if (cfg.glow) { try { var g = addFx(layer, "ADBE Glo2"); setP(g, "Glow Radius", cfg.glow); setP(g, "Glow Threshold", 50); } catch (e2) {} }
        if (cfg.grain) { try { setP(addFx(layer, "ADBE Noise"), "Amount of Noise", 6); } catch (e3) {} }
        if (cfg.vhs) { try { var v = addFx(layer, "ADBE Turbulent Displace"); setP(v, "Displacement", 8); setP(v, "Amount", 28); setP(v, "Size", 14); setExpr(v, "Evolution", "time * 300;"); } catch (e4) {} }
        var post = addFx(layer, "ADBE Posterize Time"); setP(post, "Frame Rate", speed.fps); // LAST: steps content above it
    }

    /* ---- one text chunk ---- */
    function addChunk(comp, item, opts, fontPS, speed, cfg, animDur, infl) {
        var tl = comp.layers.addText(item.text);
        var src = tl.property("ADBE Text Properties").property("ADBE Text Document");
        var td = src.value;
        td.resetCharStyle();
        td.fontSize = opts.size;
        td.fillColor = opts.color;
        td.applyFill = true;
        if (opts.outline) { td.applyStroke = true; td.strokeColor = [0, 0, 0]; td.strokeWidth = Math.max(2, opts.size / 18); td.strokeOverFill = false; }
        else td.applyStroke = false;
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        try { td.font = fontPS; } catch (e) {}
        src.setValue(td);

        // auto-fit: shrink long lines so they don't overflow the frame (subtitles)
        try {
            var rect0 = tl.sourceRectAtTime(item.inSec + 0.001, false);
            var maxW = comp.width * 0.9;
            if (rect0.width > maxW && rect0.width > 0) {
                td.fontSize = Math.max(24, Math.floor(opts.size * (maxW / rect0.width)));
                if (opts.outline) td.strokeWidth = Math.max(2, td.fontSize / 18);
                src.setValue(td);
            }
        } catch (eFit) {}

        tl.inPoint = item.inSec;
        tl.outPoint = item.outSec;

        try {
            var r = tl.sourceRectAtTime(item.inSec + Math.min(animDur, (item.outSec - item.inSec) / 2), false);
            tg(tl).property("ADBE Anchor Point").setValue([r.left + r.width / 2, r.top + r.height / 2]);
        } catch (e2) {}
        var cx = comp.width / 2, cy = opts.posY;
        tg(tl).property("ADBE Position").setValue([cx, cy]);

        // organic hand-drawn tilt (kept unless the Spin preset keyframes rotation)
        if (opts.jitter && opts.inAnim !== "Spin" && opts.outAnim !== "Spin") {
            try { tg(tl).property("ADBE Rotate Z").setValue((Math.random() * 6) - 3); } catch (eJ) {}
        }

        var d = Math.min(animDur, (item.outSec - item.inSec) / 2.2);
        if (d <= 0) d = 1 / FPS;
        applyIn(tl, cx, cy, item.inSec, d, opts.inAnim);
        applyOut(tl, cx, cy, item.outSec, d, opts.outAnim);
        easeLayer(tl, infl);
        applyBoil(tl, speed, cfg);
        if (opts.shadow) { try { var ds = addFx(tl, "ADBE Drop Shadow"); setP(ds, "Opacity", 160); setP(ds, "Distance", 8); setP(ds, "Softness", 18); } catch (e3) {} }
        return tl;
    }

    /* ===================== build ===================== */
    function build(opts) {
        var chunks = buildChunkList(opts);
        if (!chunks.length) return { ok: false, msg: opts.source === "srt" ? "No cues found — pick a valid .srt file." : "Type some text first." };
        if (chunks.length > MAX_CHUNKS) return { ok: false, msg: "Too many chunks (" + chunks.length + "). Use Phrase sync or shorter text." };

        app.beginUndoGroup("Build Hand-Drawn Animation");
        try {
            var lastEnd = 0;
            for (var i = 0; i < chunks.length; i++) if (chunks[i].outSec > lastEnd) lastEnd = chunks[i].outSec;
            var comp = app.project.items.addComp("HandDrawn_" + (opts.source === "srt" ? "subs" : "text"), W, H, 1.0, lastEnd + 0.5, FPS);
            comp.openInViewer();

            if (opts.darkBG) comp.layers.addSolid([0.02, 0.02, 0.02], "BG", W, H, 1.0, comp.duration);

            var speed = SPEEDS[opts.speed] || SPEEDS["Normal"];
            var cfg = STYLE_CFG[opts.style] || STYLE_CFG["Hand-Drawn"];
            var infl = SMOOTH[opts.smooth] || 66;
            var fontPS = resolveFont(opts.font);
            var animDur = 0.33;
            opts.posY = (opts.position === "Lower third") ? H * 0.78 : (opts.position === "Top") ? H * 0.20 : H / 2;

            for (var c = 0; c < chunks.length; c++) addChunk(comp, chunks[c], opts, fontPS, speed, cfg, animDur, infl);

            // Paper texture is a single global multiply overlay (no posterize, keeps transforms smooth)
            if (cfg.paper) {
                try {
                    var paper = comp.layers.addSolid([1, 1, 1], "PAPER", W, H, 1.0, comp.duration);
                    var fn = addFx(paper, "ADBE Fractal Noise"); setP(fn, "Contrast", 130); setP(fn, "Brightness", -10);
                    paper.blendingMode = BlendingMode.MULTIPLY;
                } catch (e) {}
            }

            return { ok: true, msg: chunks.length + " chunk(s) built. Font: " + fontPS +
                ". Style: " + opts.style + ", In: " + opts.inAnim + ", Out: " + opts.outAnim +
                ".\nRender or dynamic-link the comp into Premiere." };
        } catch (e) {
            return { ok: false, msg: "Build failed: " + e.toString() + (e.line ? " (line " + e.line + ")" : "") };
        } finally {
            app.endUndoGroup();
        }
    }

    /* ===================== UI ===================== */
    function buildUI(thisObj) {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Hand-Drawn Animator v2", undefined, { resizeable: true });
        pal.alignChildren = ["fill", "top"]; pal.spacing = 7; pal.margins = 12;
        var color = [1, 1, 1];

        function section(title) { var p = pal.add("panel", undefined, title); p.alignChildren = ["fill", "top"]; p.spacing = 5; p.margins = 10; return p; }
        function rowg(parent) { var g = parent.add("group"); g.orientation = "row"; g.alignChildren = ["left", "center"]; g.spacing = 6; return g; }
        function lbl(g, t, w) { var s = g.add("statictext", undefined, t); if (w) s.preferredSize.width = w; return s; }

        // SOURCE
        var src = section("SOURCE — type text, or sync to your voice (.srt)");
        var gMode = rowg(src);
        var rbType = gMode.add("radiobutton", undefined, "Type text"); rbType.value = true;
        var rbSrt = gMode.add("radiobutton", undefined, "Import .srt subtitles");
        var txt = src.add("edittext", undefined, "A DESIRE TO GROW", { multiline: true }); txt.preferredSize = [320, 50];
        var gSplit = rowg(src);
        lbl(gSplit, "Split", 70);
        var splitDD = gSplit.add("dropdownlist", undefined, ["Word by word", "2 words", "3 words", "Sentences (/ or line)", "Whole line"]); splitDD.selection = 0;
        var gSrt = rowg(src);
        var srtBtn = gSrt.add("button", undefined, "Choose .srt…"); var srtTxt = lbl(gSrt, "(none)", 180);
        lbl(gSrt, "Sync");
        var syncDD = gSrt.add("dropdownlist", undefined, ["Phrase", "Word"]); syncDD.selection = 1;
        var srtFile = null;
        srtBtn.onClick = function () { var f = File.openDialog("Pick a subtitle .srt", "*.srt"); if (f) { srtFile = f; srtTxt.text = f.name; } };
        var gHint = rowg(src); lbl(gHint, "SRT from Premiere: Window ▸ Text ▸ Transcribe → Create Captions → Export .srt");

        // LOOK
        var look = section("LOOK");
        var gFont = rowg(look); lbl(gFont, "Font", 70);
        var installed = installedHandFonts();
        var fontList = installed.concat(FONT_SUGGESTIONS);
        var fontDD = gFont.add("dropdownlist", undefined, fontList); fontDD.selection = 0; fontDD.preferredSize.width = 150;
        var fontTxt = gFont.add("edittext", undefined, fontList[0]); fontTxt.preferredSize.width = 120;
        fontDD.onChange = function () { if (fontDD.selection) fontTxt.text = fontDD.selection.text; };
        var gS = rowg(look); lbl(gS, "Size", 70);
        var sizeTxt = gS.add("edittext", undefined, "200"); sizeTxt.preferredSize.width = 55;
        var colorBtn = gS.add("button", undefined, "Color…"); var colorTxt = lbl(gS, "white");
        colorBtn.onClick = function () { var pk = $.colorPicker(((color[0] * 255) << 16) | ((color[1] * 255) << 8) | (color[2] * 255)); if (pk >= 0) { color = [((pk >> 16) & 255) / 255, ((pk >> 8) & 255) / 255, (pk & 255) / 255]; colorTxt.text = "#" + ("000000" + pk.toString(16)).slice(-6); } };
        var gStyle = rowg(look); lbl(gStyle, "Style", 70);
        var styleDD = gStyle.add("dropdownlist", undefined, ["Hand-Drawn", "Grunge", "Marker", "Film", "VHS", "Paper", "Neon", "Clean"]); styleDD.selection = 0;
        var gRead = rowg(look); lbl(gRead, "Readable", 70);
        var outlineChk = gRead.add("checkbox", undefined, "Outline"); var shadowChk = gRead.add("checkbox", undefined, "Shadow");
        var gPos = rowg(look); lbl(gPos, "Position", 70);
        var posDD = gPos.add("dropdownlist", undefined, ["Center", "Lower third", "Top"]); posDD.selection = 0;
        var jitterChk = gPos.add("checkbox", undefined, "Hand jitter (tilt)"); jitterChk.value = true;

        // ANIMATION
        var anim = section("ANIMATION");
        var gIO = rowg(anim);
        lbl(gIO, "In", 70); var inDD = gIO.add("dropdownlist", undefined, IN_OUT); inDD.selection = 0;
        lbl(gIO, "Out"); var outDD = gIO.add("dropdownlist", undefined, IN_OUT); outDD.selection = 0;
        var gAn2 = rowg(anim);
        lbl(gAn2, "Speed", 70); var speedDD = gAn2.add("dropdownlist", undefined, ["Light", "Normal", "Heavy"]); speedDD.selection = 1;
        lbl(gAn2, "Smooth"); var smoothDD = gAn2.add("dropdownlist", undefined, ["Low", "Medium", "High"]); smoothDD.selection = 2;
        var gAn3 = rowg(anim);
        lbl(gAn3, "Frames each", 70); var paceTxt = gAn3.add("edittext", undefined, "12"); paceTxt.preferredSize.width = 50;
        var morphChk = gAn3.add("checkbox", undefined, "Morph crossfade"); morphChk.value = true;
        var bgChk = gAn3.add("checkbox", undefined, "Dark BG");

        // PRESETS
        var preG = section("QUICK PRESETS");
        var pr = rowg(preG);
        function applyPreset(name) {
            var p = PRESETS[name]; if (!p) return;
            for (var i = 0; i < styleDD.items.length; i++) if (styleDD.items[i].text === p.style) styleDD.selection = i;
            for (var j = 0; j < speedDD.items.length; j++) if (speedDD.items[j].text === p.speed) speedDD.selection = j;
            for (var k = 0; k < inDD.items.length; k++) { if (inDD.items[k].text === p.inAnim) inDD.selection = k; if (outDD.items[k].text === p.outAnim) outDD.selection = k; }
            for (var m = 0; m < splitDD.items.length; m++) if (splitDD.items[m].text === p.split) splitDD.selection = m;
            fontTxt.text = p.font; morphChk.value = p.morph; outlineChk.value = p.outline; shadowChk.value = p.shadow;
        }
        var presetNames = ["TikTok Captions", "Hand-Drawn Boil", "Clean Subtitle", "Kinetic Pop"];
        for (var pi = 0; pi < presetNames.length; pi++) {
            (function (nm) { pr.add("button", undefined, nm).onClick = function () { applyPreset(nm); status.text = "Preset applied: " + nm; }; })(presetNames[pi]);
        }

        var buildBtn = pal.add("button", undefined, "BUILD ANIMATION");
        var status = pal.add("statictext", undefined, "Ready. Install a hand-drawn font for the painted look.", { multiline: true }); status.preferredSize = [320, 38];

        buildBtn.onClick = function () {
            var size = parseFloat(sizeTxt.text); if (isNaN(size) || size <= 0) size = 200;
            var pace = parseInt(paceTxt.text, 10); if (isNaN(pace) || pace < 2) pace = 12;
            status.text = "Building…";
            var res = build({
                source: rbSrt.value ? "srt" : "text",
                srtFile: srtFile, sync: syncDD.selection ? syncDD.selection.text : "Word",
                text: txt.text, split: splitDD.selection ? splitDD.selection.text : "Word by word",
                font: trim(fontTxt.text) || "Arial", size: size, color: color,
                style: styleDD.selection ? styleDD.selection.text : "Hand-Drawn",
                outline: outlineChk.value, shadow: shadowChk.value,
                position: posDD.selection ? posDD.selection.text : "Center", jitter: jitterChk.value,
                inAnim: inDD.selection ? inDD.selection.text : "Fade",
                outAnim: outDD.selection ? outDD.selection.text : "Fade",
                speed: speedDD.selection ? speedDD.selection.text : "Normal",
                smooth: smoothDD.selection ? smoothDD.selection.text : "High",
                framesPerChunk: pace, morph: morphChk.value, darkBG: bgChk.value
            });
            status.text = (res.ok ? "✓ " : "✗ ") + res.msg;
        };

        pal.layout.layout(true);
        return pal;
    }

    var ui = buildUI(thisObj);
    if (ui instanceof Window) { ui.center(); ui.show(); }

})(this);
