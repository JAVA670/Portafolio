/*
 * Build_Mogrt.jsx — Hand-Drawn Animator MOGRT builder (After Effects)
 * ===========================================================================
 * Run this ONCE in After Effects (File ▸ Scripts ▸ Run Script File…). It
 * programmatically builds the master composition, rigs the hand-drawn boil,
 * the five style overlays, the directional in/out transitions and the
 * Responsive-Design-Time protected regions, links everything to the Essential
 * Graphics panel, and exports `HandDrawnMaster.mogrt` straight into the
 * Premiere extension's /assets folder (../assets relative to this script).
 *
 * Requirements: After Effects 2022 (22.0)+  — needs Dropdown Menu Control
 * (2020+), MarkerValue.protectedRegion (2019+), and
 * CompItem.exportAsMotionGraphicsTemplate (2020+).
 *
 * API surface (and why):
 *   project.items.addComp()                       master comp
 *   comp.layers.addText() / addSolid()            text + overlays
 *   layer.property("ADBE Effect Parade").addProperty(matchName)
 *                                                 add built-in effects by matchName
 *   property.expression = "..."                   infinite boil + style gating +
 *                                                 directional transitions (no keyframes)
 *   Dropdown Menu Control .setPropertyParameters([...])
 *                                                 build the Style / Speed / Transition menus
 *   MarkerValue.protectedRegion + comp.markerProperty.setValueAtTime()
 *                                                 Responsive Design - Time intro/outro
 *   property.addToMotionGraphicsTemplateAs(comp, name)
 *                                                 expose controls in the EGP
 *   comp.exportAsMotionGraphicsTemplate(true, path)
 *                                                 write the .mogrt file
 */

(function buildHandDrawnMaster() {

    // ---- config ----------------------------------------------------------
    var W = 1920, H = 1080, FPS = 24, DUR = 6.0;     // 6s comp @ 24fps
    var INTRO = 1.0, OUTRO = 1.0;                     // protected (responsive) regions
    var TRANS = 0.6;                                  // transition length (s) used by expressions

    // Style / Speed / Transition menu orders (1-based, as AE dropdowns are)
    var STYLE_ITEMS = ["None", "Grunge", "Film", "VHS", "Paper"];
    var SPEED_ITEMS = ["Light", "Normal", "Heavy"];
    var DIR_ITEMS   = ["Up", "Down", "Left", "Right"];

    if (!app.project) app.newProject();
    app.beginUndoGroup("Build Hand-Drawn Master MOGRT");

    // ---- helpers ---------------------------------------------------------
    function fx(layer, matchName, niceName) {
        var e = layer.property("ADBE Effect Parade").addProperty(matchName);
        if (niceName) e.name = niceName;
        return e;
    }
    function expr(prop, str) { try { prop.expression = str; } catch (e) { /* expressions off */ } }
    function lines() { var a = []; for (var i = 0; i < arguments.length; i++) a.push(arguments[i]); return a.join("\n"); }
    // Safely turn any thrown value into a string. Implicitly coercing an
    // ExtendScript Error object with "+" throws "object of type error found
    // where a number/array/property is needed", so never concatenate raw `e`.
    function safeErr(e) {
        try { return String(e.toString()); } catch (x1) {}
        try { return String(e.description); } catch (x2) {}
        return "unknown error";
    }
    // `getProp` is a function so a stale/invalid reference is caught here, not
    // at the call site. Adding effects to a layer invalidates previously
    // stored references to its other effects, so callers re-resolve by name.
    var egpReport = [];
    function egp(getProp, name) {
        var prop = null;
        try { prop = getProp(); } catch (e) { egpReport.push("[skip] " + name + ": " + safeErr(e)); return; }
        if (!prop) { egpReport.push("[skip] " + name + ": property not found"); return; }
        try { prop.addToMotionGraphicsTemplateAs(comp, name); egpReport.push("[ok] " + name); return; }
        catch (e2) {
            try { prop.addToMotionGraphicsTemplate(comp); egpReport.push("[ok] " + name + " (default name)"); return; }
            catch (e3) { egpReport.push("[skip] " + name + ": " + safeErr(e3)); }
        }
    }
    function addDropdown(layer, name, items) {
        var e = fx(layer, "ADBE Dropdown Control", name);
        try { e.property(1).setPropertyParameters(items); } catch (er) {}
        return e;
    }

    // ---- master comp -----------------------------------------------------
    var comp = app.project.items.addComp("HandDrawnMaster", W, H, 1.0, DUR, FPS);
    comp.openInViewer();

    // ---- CONTROLS layer: holds all the dropdown menus -------------------
    // A guide null keeps the menus off-render; expressions reference it by name.
    var ctrl = comp.layers.addNull();
    ctrl.name = "CONTROLS";
    ctrl.guideLayer = true;
    ctrl.enabled = false;
    var dSpeed = addDropdown(ctrl, "Animation Speed", SPEED_ITEMS);
    var dStyle = addDropdown(ctrl, "Style", STYLE_ITEMS);
    var dIn    = addDropdown(ctrl, "Transition In", DIR_ITEMS);
    var dOut   = addDropdown(ctrl, "Transition Out", DIR_ITEMS);

    // ---- TEXT layer ------------------------------------------------------
    var txt = comp.layers.addText("Hello World");
    txt.name = "TEXT";
    // center the source text
    var td = txt.property("ADBE Text Properties").property("ADBE Text Document").value;
    td.resetCharStyle();
    td.fontSize = 200;
    td.fillColor = [1, 1, 1];
    td.justification = ParagraphJustification.CENTER_JUSTIFY;
    txt.property("ADBE Text Properties").property("ADBE Text Document").setValue(td);
    txt.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([0, 0, 0]);

    // Fill effect → gives us an EGP-able "Fill Color" the user can drive
    var fill = fx(txt, "ADBE Fill", "Fill Color");
    try { fill.property("Color").setValue([1, 1, 1, 1]); } catch (eFill) { try { fill.property("Color").setValue([1, 1, 1]); } catch (eFill2) {} }

    // --- hand-drawn boil on the text -------------------------------------
    // Turbulent Displace = line wobble; Evolution animates infinitely via time*.
    var tdisp = fx(txt, "ADBE Turbulent Displace", "Boil Wobble");
    expr(tdisp.property("Amount"), lines(
        "var sp = thisComp.layer('CONTROLS').effect('Animation Speed')('Menu');",
        "(sp==1)?15:(sp==2)?32:60;"   // Light / Normal / Heavy displacement
    ));
    tdisp.property("Size").setValue(40);
    expr(tdisp.property("Evolution"), lines(
        "var sp = thisComp.layer('CONTROLS').effect('Animation Speed')('Menu');",
        "time * ((sp==1)?40:(sp==2)?90:160);"   // infinite boil, speed-scaled
    ));

    // Roughen Edges = marker/pencil edge; Evolution also time-driven.
    var rough = fx(txt, "ADBE Roughen Edges", "Edge Texture");
    expr(rough.property("Border"), lines(
        "var s = thisComp.layer('CONTROLS').effect('Style')('Menu');",
        "(s==2)?22:8;"   // Grunge = rougher border
    ));
    expr(rough.property("Evolution"), "time * 70;");

    // Posterize Time = stepped 'animated-on-twos' look; ~12fps (Heavy = chunkier).
    var post = fx(txt, "ADBE Posterize Time", "Stepped Boil");
    expr(post.property("Frame Rate"), lines(
        "var sp = thisComp.layer('CONTROLS').effect('Animation Speed')('Menu');",
        "(sp==3)?8:12;"
    ));

    // --- directional in/out transition (Position expression, no keyframes)
    expr(txt.property("ADBE Transform Group").property("ADBE Position"), lines(
        "var ctrl = thisComp.layer('CONTROLS');",
        "var inD  = ctrl.effect('Transition In')('Menu');",   // 1 Up,2 Down,3 Left,4 Right
        "var outD = ctrl.effect('Transition Out')('Menu');",
        "var c = [thisComp.width/2, thisComp.height/2];",
        "var dur = " + TRANS + ";",
        "var dist = thisComp.width;",
        "function vec(d){ if(d==1) return [0, dist]; if(d==2) return [0,-dist]; if(d==3) return [dist,0]; return [-dist,0]; }",
        "var p = c;",
        "var tIn = time - inPoint;",
        "if (tIn < dur){ var k = ease(tIn,0,dur,1,0); var v = vec(inD); p = [c[0]+v[0]*k, c[1]+v[1]*k]; }",
        "var tOut = outPoint - time;",
        "if (tOut < dur){ var k2 = ease(tOut,0,dur,1,0); var o = vec(outD); p = [c[0]-o[0]*k2, c[1]-o[1]*k2]; }",
        "p;"
    ));

    // ---- STYLE overlays (opacity gated by the Style dropdown) -----------
    // Each overlay's opacity = (Style == itsIndex) ? 100 : 0
    function gateOpacity(layer, styleIndex) {
        expr(layer.property("ADBE Transform Group").property("ADBE Opacity"), lines(
            "var s = thisComp.layer('CONTROLS').effect('Style')('Menu');",
            "(s==" + styleIndex + ")?100:0;"
        ));
    }

    // GRUNGE (3=Film below; Grunge is index 2) — high-contrast rough adjustment
    var grunge = comp.layers.addSolid([0, 0, 0], "GRUNGE", W, H, 1.0, DUR);
    grunge.adjustmentLayer = true;
    var gCurves = fx(grunge, "ADBE CurvesCustom", "Contrast"); // high contrast
    fx(grunge, "ADBE Roughen Edges", "Grunge Edges").property("Border").setValue(30);
    gateOpacity(grunge, 2);

    // FILM (index 3) — soft glow + grain
    var film = comp.layers.addSolid([0, 0, 0], "FILM", W, H, 1.0, DUR);
    film.adjustmentLayer = true;
    var glow = fx(film, "ADBE Glo2", "Soft Glow");
    glow.property("Glow Threshold").setValue(60);
    glow.property("Glow Radius").setValue(40);
    var grain = fx(film, "ADBE Noise", "Film Grain");
    grain.property("Amount of Noise").setValue(8);
    gateOpacity(film, 3);

    // VHS (index 4) — horizontal displacement glitch + channel separation
    var vhs = comp.layers.addSolid([0, 0, 0], "VHS", W, H, 1.0, DUR);
    vhs.adjustmentLayer = true;
    var vDisp = fx(vhs, "ADBE Turbulent Displace", "H-Glitch");
    vDisp.property("Displacement").setValue(8);            // 8 = Horizontal Displacement
    vDisp.property("Amount").setValue(40);
    vDisp.property("Size").setValue(12);
    expr(vDisp.property("Evolution"), "time * 300 + wiggle(8, 60);"); // jittery scanlines
    var vChan = fx(vhs, "ADBE Channel Blur", "Chroma Bleed");
    try { vChan.property("Red Blurriness").setValue(0); vChan.property("Blue Blurriness").setValue(18); } catch (e) {}
    try { vChan.property("Blur Dimensions").setValue(2); } catch (e2) {} // 2 = Horizontal
    gateOpacity(vhs, 4);

    // PAPER (index 5) — fractal-noise paper texture, multiply
    var paper = comp.layers.addSolid([1, 1, 1], "PAPER", W, H, 1.0, DUR);
    var pNoise = fx(paper, "ADBE Fractal Noise", "Paper Grain");
    try { pNoise.property("Contrast").setValue(140); pNoise.property("Brightness").setValue(-20); } catch (e3) {}
    paper.blendingMode = BlendingMode.MULTIPLY;
    gateOpacity(paper, 5);

    // ---- Responsive Design - Time (protected intro/outro) ---------------
    try {
        var mIn = new MarkerValue(""); mIn.protectedRegion = true; mIn.duration = INTRO;
        comp.markerProperty.setValueAtTime(0, mIn);
        var mOut = new MarkerValue(""); mOut.protectedRegion = true; mOut.duration = OUTRO;
        comp.markerProperty.setValueAtTime(DUR - OUTRO, mOut);
    } catch (eM) { /* older AE: set protected regions manually in the EGP */ }

    // ---- Essential Graphics linking -------------------------------------
    // Re-resolve every effect by name from a FRESH effect parade: references
    // captured earlier (fill, dSpeed, …) went stale when later effects were
    // added to the same layer. Layer property groups (Source Text) are stable.
    egp(function () { return txt.property("ADBE Text Properties").property("ADBE Text Document"); }, "Source Text");
    egp(function () { return txt.property("ADBE Effect Parade").property("Fill Color").property("Color"); }, "Fill Color");
    egp(function () { return ctrl.property("ADBE Effect Parade").property("Animation Speed").property(1); }, "Animation Speed");
    egp(function () { return ctrl.property("ADBE Effect Parade").property("Style").property(1); }, "Style");
    egp(function () { return ctrl.property("ADBE Effect Parade").property("Transition In").property(1); }, "Transition In");
    egp(function () { return ctrl.property("ADBE Effect Parade").property("Transition Out").property(1); }, "Transition Out");
    try { comp.openInEssentialGraphics(); } catch (eE) {}

    // ---- export the .mogrt -----------------------------------------------
    // Export to a NEUTRAL location both halves agree on: <Documents>/
    // HandDrawnAnimator/HandDrawnMaster.mogrt. The AE script and the installed
    // Premiere panel usually live in different folders, so a fixed user-space
    // path avoids the "found it here, looked there" mismatch. We also copy it
    // next to the script (../assets) in case you run from the extension folder.
    var primaryPath = null, copyPath = null, exportErr = "";
    try {
        var docFolder = new Folder(Folder.myDocuments.fsName + "/HandDrawnAnimator");
        if (!docFolder.exists) docFolder.create();
        var out = new File(docFolder.fsName + "/HandDrawnMaster.mogrt");
        var ok = comp.exportAsMotionGraphicsTemplate(true, out.fsName);
        // Some AE versions return undefined yet still write the file.
        if (out.exists) primaryPath = out.fsName;
        else if (ok) primaryPath = out.fsName;
    } catch (eX) { exportErr = (function () { try { return eX.toString(); } catch (x) { return "export error"; } })(); }

    if (primaryPath) {
        try {
            var assets = new Folder(new File($.fileName).parent.parent.fsName + "/assets");
            if (!assets.exists) assets.create();
            var dest = new File(assets.fsName + "/HandDrawnMaster.mogrt");
            if (new File(primaryPath).copy(dest.fsName)) copyPath = dest.fsName;
        } catch (eC) {}
    }

    app.endUndoGroup();

    var report = "\n\nEssential Graphics controls:\n  " + egpReport.join("\n  ");

    if (primaryPath) {
        var msg = "Hand-Drawn Master exported to:\n" + primaryPath;
        if (copyPath) msg += "\n(also copied to: " + copyPath + ")";
        msg += "\n\nThe Premiere panel checks your Documents folder automatically — just click ANIMATE.";
        alert(msg + report);
    } else {
        alert("Hand-Drawn Master comp built and opened in Essential Graphics, but AUTO-EXPORT FAILED" +
              (exportErr ? " (" + exportErr + ")" : "") + ".\n\n" +
              "Export it by hand: in the Essential Graphics panel click 'Export Motion Graphics Template…' " +
              "and save it as HandDrawnMaster.mogrt inside:\n" +
              Folder.myDocuments.fsName + "/HandDrawnAnimator/" + report);
    }
})();
