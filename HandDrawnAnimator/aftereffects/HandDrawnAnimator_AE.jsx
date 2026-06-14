/*
 * HandDrawnAnimator_AE.jsx — Hand-Drawn Animator (After Effects)
 * ===========================================================================
 * A dockable ScriptUI panel that BUILDS the full kinetic hand-drawn text
 * animation directly in an After Effects comp — fonts, texture, and
 * word-by-word MORPH — none of which Premiere's scripting can do. The
 * finished comp is then rendered or dynamic-linked into Premiere (no MOGRT,
 * no importMGT).
 *
 * INSTALL as a dockable panel: copy this file into
 *   Win : C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\Scripts\ScriptUI Panels\
 *   Mac : /Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/
 * then restart AE and open it from the Window menu. Or just run it once via
 * File ▸ Scripts ▸ Run Script File…
 *
 * Enable Preferences ▸ Scripting & Expressions ▸ "Allow Scripts to Write Files
 * and Access Network" so the boil expressions can be applied.
 *
 * What it builds:
 *   • One text layer per chunk (word / N-words / sentence / whole line) in the
 *     chosen hand-drawn font and color, centered.
 *   • MORPH: consecutive chunks overlap with an opacity crossfade + a subtle
 *     scale pulse — reads as one word transforming into the next.
 *   • A top adjustment layer with the hand-drawn boil (Turbulent Displace with
 *     an infinite time-based Evolution expression + Posterize Time for the
 *     stepped look) and edge texture (Roughen Edges), plus per-style extras.
 */

(function (thisObj) {

    // ---- tuning ----------------------------------------------------------
    var W = 1920, H = 1080, FPS = 24;

    var SPEEDS = {            // amount = displacement, evo = boil rate, fps = posterize step
        "Light":  { amount: 6,  evo: 40,  fps: 12 },
        "Normal": { amount: 12, evo: 90,  fps: 12 },
        "Heavy":  { amount: 20, evo: 150, fps: 8  }
    };
    var STYLE_BORDER = { "None": 1, "Grunge": 14, "Film": 2, "VHS": 2, "Paper": 3 };

    // Common free hand-drawn fonts to suggest (the user installs these). The
    // field accepts any family name; app.fonts resolves it to a PostScript name.
    var FONT_SUGGESTIONS = [
        "Permanent Marker", "Caveat", "Rock Salt", "Shadows Into Light",
        "Gochi Hand", "Mansalva", "Reenie Beanie", "Patrick Hand", "Arial"
    ];

    /* ---------------- helpers ------------------------------------------- */

    function trim(s) { return String(s == null ? "" : s).replace(/^\s+|\s+$/g, ""); }

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
        var per = (mode === "2 words") ? 2 : (mode === "3 words") ? 3 : 1;
        var out = [];
        for (var j = 0; j < words.length; j += per) out.push(words.slice(j, j + per).join(" "));
        return out;
    }

    // Resolve a family name to a real PostScript name via app.fonts (AE 2022+),
    // preferring a Regular style; fall back to the raw string on older builds.
    function resolveFont(name) {
        try {
            if (app.fonts && app.fonts.allFonts) {
                var all = app.fonts.allFonts, lcn = String(name).toLowerCase(), best = null;
                for (var i = 0; i < all.length; i++) {
                    var f = all[i];
                    var fam = f.familyName ? f.familyName.toLowerCase() : "";
                    var ps = f.postScriptName ? f.postScriptName.toLowerCase() : "";
                    if (fam === lcn || ps === lcn) {
                        best = f;
                        if (f.fontStyle && /regular|book/i.test(f.fontStyle)) break;
                    }
                }
                if (best) return best.postScriptName;
            }
        } catch (e) {}
        return name;
    }

    // Installed hand-drawn fonts (for the dropdown), if app.fonts is available.
    function installedHandFonts() {
        var found = [];
        try {
            if (app.fonts && app.fonts.allFonts) {
                var kw = /(marker|brush|hand|script|sketch|scrawl|crayon|chalk|comic|caveat|permanent|rock salt|shadows|gochi|reenie|patrick|mansalva|pencil|ink|doodle)/i;
                var seen = {};
                var all = app.fonts.allFonts;
                for (var i = 0; i < all.length; i++) {
                    var fam = all[i].familyName;
                    if (fam && kw.test(fam) && !seen[fam]) { seen[fam] = 1; found.push(fam); }
                }
                found.sort();
            }
        } catch (e) {}
        return found;
    }

    function addFx(layer, matchName) { return layer.property("ADBE Effect Parade").addProperty(matchName); }
    function setP(prop, name, v) { try { prop.property(name).setValue(v); } catch (e) {} }
    function setExpr(prop, name, expr) { try { prop.property(name).expression = expr; } catch (e) {} }

    /* ---------------- boil + texture adjustment layer ------------------- */

    function addBoilAndTexture(comp, speed, style) {
        var adj = comp.layers.addSolid([0, 0, 0], "BOIL + TEXTURE", comp.width, comp.height, 1.0, comp.duration);
        adj.adjustmentLayer = true;
        adj.moveToBeginning(); // top of the stack -> affects all text below

        // line wobble; Evolution animates forever via time* (no keyframes)
        var tdisp = addFx(adj, "ADBE Turbulent Displace");
        setP(tdisp, "Amount", speed.amount);
        setP(tdisp, "Size", 50);
        setExpr(tdisp, "Evolution", "time * " + speed.evo + ";");

        // marker/pencil edge texture
        var border = STYLE_BORDER[style] || 2;
        if (border > 0) {
            var rough = addFx(adj, "ADBE Roughen Edges");
            setP(rough, "Border", border);
            setExpr(rough, "Evolution", "time * 70;");
        }

        // per-style extras (best-effort; each wrapped so a missing effect is harmless)
        if (style === "Grunge") { try { addFx(adj, "ADBE CurvesCustom"); } catch (e) {} }
        if (style === "Film") {
            try { var g = addFx(adj, "ADBE Glo2"); setP(g, "Glow Threshold", 60); setP(g, "Glow Radius", 30); } catch (e) {}
            try { setP(addFx(adj, "ADBE Noise"), "Amount of Noise", 6); } catch (e2) {}
        }
        if (style === "VHS") {
            try {
                var v = addFx(adj, "ADBE Turbulent Displace");
                setP(v, "Displacement", 8); // Horizontal Displacement
                setP(v, "Amount", 30); setP(v, "Size", 14);
                setExpr(v, "Evolution", "time * 300;");
            } catch (e) {}
        }
        if (style === "Paper") {
            try {
                var paper = comp.layers.addSolid([1, 1, 1], "PAPER", comp.width, comp.height, 1.0, comp.duration);
                var fn = addFx(paper, "ADBE Fractal Noise");
                setP(fn, "Contrast", 130); setP(fn, "Brightness", -10);
                paper.blendingMode = BlendingMode.MULTIPLY;
                paper.moveToBeginning();
                adj.moveToBeginning(); // keep boil on very top
            } catch (e) {}
        }

        // stepped "animated-on-twos" boil — added LAST so it quantizes the rest
        var post = addFx(adj, "ADBE Posterize Time");
        setP(post, "Frame Rate", speed.fps);
    }

    /* ---------------- one text chunk ------------------------------------ */

    function addChunk(comp, text, fontPS, size, color, inSec, outSec, fadeSec, morph) {
        var tl = comp.layers.addText(text);
        var src = tl.property("ADBE Text Properties").property("ADBE Text Document");
        var td = src.value;
        td.resetCharStyle();
        td.fontSize = size;
        td.fillColor = color;
        td.applyFill = true;
        td.applyStroke = false;
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        try { td.font = fontPS; } catch (e) {}
        src.setValue(td);

        // trim the layer to its slot
        tl.inPoint = inSec;
        tl.outPoint = outSec;

        // center the layer on its own bounds (so scale pulses around the middle)
        try {
            var r = tl.sourceRectAtTime(inSec, false);
            tl.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([r.left + r.width / 2, r.top + r.height / 2]);
        } catch (e2) {}
        tl.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width / 2, comp.height / 2]);

        // crossfade in/out
        var op = tl.property("ADBE Transform Group").property("ADBE Opacity");
        op.setValueAtTime(inSec, 0);
        op.setValueAtTime(inSec + fadeSec, 100);
        op.setValueAtTime(outSec - fadeSec, 100);
        op.setValueAtTime(outSec, 0);

        // morph: subtle scale pulse so the word "grows into" the next one
        if (morph) {
            var sc = tl.property("ADBE Transform Group").property("ADBE Scale");
            sc.setValueAtTime(inSec, [90, 90]);
            sc.setValueAtTime(inSec + fadeSec, [100, 100]);
            sc.setValueAtTime(outSec - fadeSec, [100, 100]);
            sc.setValueAtTime(outSec, [112, 112]);
        }
        return tl;
    }

    /* ---------------- build the whole animation ------------------------- */

    function build(opts) {
        var chunks = splitText(opts.text, opts.split);
        if (!chunks.length) { return { ok: false, msg: "Type some text first." }; }

        app.beginUndoGroup("Build Hand-Drawn Animation");
        try {
            var holdF = Math.max(2, Math.round(opts.framesPerChunk));
            var morph = opts.morph && chunks.length > 1;
            var overlapF = morph ? Math.max(2, Math.round(holdF * 0.5)) : 0;
            if (overlapF >= holdF) overlapF = holdF - 1;
            var stepF = holdF - overlapF;
            var fadeSec = (morph ? overlapF : Math.min(3, Math.floor(holdF / 3))) / FPS;
            if (fadeSec <= 0) fadeSec = 1 / FPS;

            var totalF = (chunks.length - 1) * stepF + holdF;
            var durSec = (totalF + 6) / FPS;

            var comp = app.project.items.addComp("HandDrawn_" + chunks.length + "x", W, H, 1.0, Math.max(durSec, 1), FPS);
            comp.openInViewer();

            if (opts.darkBG) {
                var bg = comp.layers.addSolid([0.02, 0.02, 0.02], "BG", W, H, 1.0, comp.duration);
            }

            var fontPS = resolveFont(opts.font);
            for (var i = 0; i < chunks.length; i++) {
                var inSec = (i * stepF) / FPS;
                var outSec = (i * stepF + holdF) / FPS;
                addChunk(comp, chunks[i], fontPS, opts.size, opts.color, inSec, outSec, fadeSec, morph);
            }

            addBoilAndTexture(comp, SPEEDS[opts.speed] || SPEEDS["Normal"], opts.style);

            return { ok: true, msg: chunks.length + " chunk(s) built" + (morph ? " with morph" : "") + ". Font: " + fontPS +
                                   ".\nRender it or dynamic-link the comp into Premiere." };
        } catch (e) {
            return { ok: false, msg: "Build failed: " + e.toString() + (e.line ? " (line " + e.line + ")" : "") };
        } finally {
            app.endUndoGroup();
        }
    }

    /* ---------------- UI ------------------------------------------------ */

    function buildUI(thisObj) {
        var pal = (thisObj instanceof Panel) ? thisObj
                  : new Window("palette", "Hand-Drawn Animator", undefined, { resizeable: true });
        pal.alignChildren = ["fill", "top"];
        pal.spacing = 8; pal.margins = 12;

        var color = [1, 1, 1]; // text fill, default white

        function row(parent, labelText) {
            var g = parent.add("group"); g.orientation = "row"; g.alignChildren = ["left", "center"];
            var st = g.add("statictext", undefined, labelText); st.preferredSize.width = 80;
            return g;
        }

        var gTxt = pal.add("group"); gTxt.orientation = "column"; gTxt.alignChildren = ["fill", "top"];
        gTxt.add("statictext", undefined, "Text  (use  /  or new lines to mark sentences)");
        var txt = gTxt.add("edittext", undefined, "A DESIRE TO GROW", { multiline: true });
        txt.preferredSize = [300, 56];

        var gFont = row(pal, "Font");
        var installed = installedHandFonts();
        var fontList = (installed.length ? installed : []).concat(FONT_SUGGESTIONS);
        var fontDD = gFont.add("dropdownlist", undefined, fontList);
        fontDD.selection = 0;
        fontDD.preferredSize.width = 150;
        var fontTxt = gFont.add("edittext", undefined, fontList[0]); fontTxt.preferredSize.width = 130;
        fontDD.onChange = function () { if (fontDD.selection) fontTxt.text = fontDD.selection.text; };
        if (installed.length) gTxt.add("statictext", undefined, "(" + installed.length + " hand-drawn fonts detected)");

        var gSize = row(pal, "Font size");
        var sizeTxt = gSize.add("edittext", undefined, "200"); sizeTxt.preferredSize.width = 60;
        var colorBtn = gSize.add("button", undefined, "Text color…");
        var colorSwatch = gSize.add("statictext", undefined, "white");
        colorBtn.onClick = function () {
            var packed = $.colorPicker(((color[0] * 255) << 16) | ((color[1] * 255) << 8) | (color[2] * 255));
            if (packed >= 0) {
                color = [((packed >> 16) & 255) / 255, ((packed >> 8) & 255) / 255, (packed & 255) / 255];
                colorSwatch.text = "#" + ("000000" + packed.toString(16)).slice(-6);
            }
        };

        var gStyle = row(pal, "Style");
        var styleDD = gStyle.add("dropdownlist", undefined, ["None", "Grunge", "Film", "VHS", "Paper"]); styleDD.selection = 0;
        var gSpeed = row(pal, "Speed");
        var speedDD = gSpeed.add("dropdownlist", undefined, ["Light", "Normal", "Heavy"]); speedDD.selection = 1;

        var gSplit = row(pal, "Split");
        var splitDD = gSplit.add("dropdownlist", undefined, ["Word by word", "2 words", "3 words", "Sentences (/ or line)", "Whole line"]);
        splitDD.selection = 0;

        var gPace = row(pal, "Frames each");
        var paceTxt = gPace.add("edittext", undefined, "12"); paceTxt.preferredSize.width = 50;
        var morphChk = gPace.add("checkbox", undefined, "Morph crossfade"); morphChk.value = true;
        var bgChk = gPace.add("checkbox", undefined, "Dark BG"); bgChk.value = false;

        var buildBtn = pal.add("button", undefined, "BUILD ANIMATION");
        var status = pal.add("statictext", undefined, "Ready.", { multiline: true });
        status.preferredSize = [300, 40];

        buildBtn.onClick = function () {
            var size = parseFloat(sizeTxt.text); if (isNaN(size) || size <= 0) size = 200;
            var pace = parseInt(paceTxt.text, 10); if (isNaN(pace) || pace < 2) pace = 12;
            status.text = "Building…";
            var res = build({
                text: txt.text,
                font: trim(fontTxt.text) || "Arial",
                size: size,
                color: color,
                style: styleDD.selection ? styleDD.selection.text : "None",
                speed: speedDD.selection ? speedDD.selection.text : "Normal",
                split: splitDD.selection ? splitDD.selection.text : "Word by word",
                framesPerChunk: pace,
                morph: morphChk.value,
                darkBG: bgChk.value
            });
            status.text = (res.ok ? "✓ " : "✗ ") + res.msg;
        };

        pal.layout.layout(true);
        return pal;
    }

    var ui = buildUI(thisObj);
    if (ui instanceof Window) { ui.center(); ui.show(); }

})(this);
