/*
 * Premiere_Host.jsx — Hand-Drawn Animator back-end (Premiere Pro)
 * ===========================================================================
 * Receives a JSON payload from the panel (main.js → CSInterface.evalScript),
 * imports HandDrawnMaster.mogrt onto the active sequence at the playhead, and
 * injects the user's text / color / style / transition choices into the
 * MOGRT's Essential Graphics parameters.
 *
 * ExtendScript is ES3. Premiere has no guaranteed JSON object, so the payload
 * is parsed with a guarded eval (the data is produced by our own UI). All
 * host calls are wrapped so failures are reported, not thrown.
 *
 * API surface (and why):
 *   activeSequence.importMGT(path, ticksString, vTrackIndex, aTrackIndex)
 *       imports the .mogrt at the playhead on the top video track.
 *   trackItem.getMGTComponent()
 *       returns the MOGRT's parameter component (the EGP controls).
 *   mgtComponent.properties.getParamForDisplayName(name)
 *       resolves an exposed control by the name we gave it in After Effects;
 *       ComponentParam.setValue(value, updateUI) writes it (this is the
 *       documented equivalent of the conceptual "setParameterValue").
 */

$.global.HDA_HOST = (function () {

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
        var r = '{"ok":' + (ok ? "true" : "false") + ',"message":' + jsonStr(message);
        if (log && log.length) {
            r += ',"log":[';
            for (var i = 0; i < log.length; i++) r += (i ? "," : "") + jsonStr(log[i]);
            r += "]";
        }
        return r + "}";
    }

    /* ---------------- payload parsing ----------------------------------- */
    // The payload is our own UI's JSON; parse with JSON if present, else eval.
    function parsePayload(s) {
        s = String(s == null ? "" : s);
        if (typeof JSON !== "undefined" && JSON.parse) { try { return JSON.parse(s); } catch (e) {} }
        var t = s.replace(/^\s+|\s+$/g, "");
        if (t.charAt(0) !== "{") return null;
        try { return eval("(" + t + ")"); } catch (e2) { return null; }
    }

    function hexToRgbNorm(hex) {
        hex = String(hex || "#ffffff").replace("#", "");
        if (hex.length === 3) hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        var r = parseInt(hex.substr(0, 2), 16) / 255;
        var g = parseInt(hex.substr(2, 2), 16) / 255;
        var b = parseInt(hex.substr(4, 2), 16) / 255;
        if (isNaN(r) || isNaN(g) || isNaN(b)) return [1, 1, 1, 1];
        return [r, g, b, 1];
    }

    /* ---------------- MOGRT parameter injection ------------------------- */
    function getParam(mgt, name) {
        try { return mgt.properties.getParamForDisplayName(name); } catch (e) { return null; }
    }
    function setText(mgt, name, value, log) {
        var p = getParam(mgt, name);
        if (!p) { log.push(name + ": not exposed in this MOGRT"); return false; }
        try { p.setValue(String(value), 1); log.push(name + ' = "' + value + '"'); return true; }
        catch (e) { log.push(name + ": setValue failed (" + e + ")"); return false; }
    }
    function setIndex(mgt, name, idx, log) {
        var p = getParam(mgt, name);
        if (!p) { log.push(name + ": not exposed in this MOGRT"); return false; }
        // Dropdown EGP params are 1-based (matching the AE menu order).
        try { p.setValue(idx, 1); log.push(name + " = " + idx); return true; }
        catch (e) { log.push(name + ": setValue failed (" + e + ")"); return false; }
    }
    function setColor(mgt, name, hex, log) {
        var p = getParam(mgt, name);
        if (!p) { log.push(name + ": not exposed in this MOGRT"); return false; }
        var rgbaN = hexToRgbNorm(hex);
        // Color params vary by build: try normalized [r,g,b,a] 0..1, then 0..255.
        try { p.setValue(rgbaN, 1); log.push(name + " = " + hex); return true; } catch (e) {}
        try {
            var rgba255 = [Math.round(rgbaN[0] * 255), Math.round(rgbaN[1] * 255), Math.round(rgbaN[2] * 255), 255];
            p.setValue(rgba255, 1); log.push(name + " = " + hex + " (0-255)"); return true;
        } catch (e2) { log.push(name + ": setValue failed (" + e2 + ")"); return false; }
    }

    // The MOGRT can live next to the installed extension OR in the neutral
    // Documents location Build_Mogrt.jsx exports to (the AE script and the
    // installed panel are usually in different folders, so we check both).
    function candidatePaths() {
        var root = new File($.fileName).parent.parent.fsName; // extension root
        var docs = Folder.myDocuments ? Folder.myDocuments.fsName : root;
        return [
            root + "/assets/HandDrawnMaster.mogrt",
            docs + "/HandDrawnAnimator/HandDrawnMaster.mogrt"
        ];
    }
    function findMogrt() {
        var p = candidatePaths();
        for (var i = 0; i < p.length; i++) { var f = new File(p[i]); if (f.exists) return f; }
        return null;
    }
    function pathsList() { return candidatePaths().join("  |  "); }

    /* ---------------- public API ---------------------------------------- */
    var api = {};

    api.ping = function () {
        try {
            var seq = app.project ? app.project.activeSequence : null;
            var has = findMogrt() ? "MOGRT found" : "MOGRT MISSING (run Build_Mogrt.jsx in After Effects)";
            if (!seq) return reply(true, "PPro " + app.version + " — no sequence — " + has);
            return reply(!!findMogrt(), '"' + seq.name + '" — ' + has);
        } catch (e) { return reply(false, "ping failed: " + e); }
    };

    /*
     * animate(jsonString)
     * payload = { text, color, speedIndex, styleIndex, inIndex, outIndex }
     */
    api.animate = function (jsonString) {
        var log = [];
        try {
            var d = parsePayload(jsonString);
            if (!d) return reply(false, "Could not parse the panel payload.");

            if (!app.project || !app.project.activeSequence) return reply(false, "Open a sequence first.");
            var seq = app.project.activeSequence;

            var mogrt = findMogrt();
            if (!mogrt) {
                return reply(false, "HandDrawnMaster.mogrt not found. Put it in one of these exact paths (or re-run Build_Mogrt.jsx, which now exports to your Documents): " + pathsList(), log);
            }
            log.push("using MOGRT: " + mogrt.fsName);

            // vidTrackOffset / audTrackOffset are OFFSETS, not absolute track
            // indices — Adobe's own PProPanel sample hardcodes 0, 0. Passing a
            // track index here makes importMGT fail and return nothing.
            var vidTrackOffset = 0, audTrackOffset = 0;
            var startTicks = "0";
            try { startTicks = seq.getPlayerPosition().ticks; } catch (e) {}

            var item = null;
            try { item = seq.importMGT(mogrt.fsName, startTicks, vidTrackOffset, audTrackOffset); }
            catch (eImp) { return reply(false, "importMGT failed: " + eImp, log); }
            if (!item) return reply(false, "importMGT returned nothing (check the MOGRT exported cleanly).", log);
            log.push("MOGRT imported at playhead");

            var mgt = null;
            try { mgt = item.getMGTComponent(); } catch (eC) { mgt = null; }
            if (!mgt) return reply(true, "Graphic placed on the timeline, but its controls weren't reachable by script — adjust Text/Style/etc. in the Essential Graphics panel.", log);

            // Inject every control. Names MUST match those set in Build_Mogrt.jsx.
            if (d.text != null && String(d.text) !== "") setText(mgt, "Source Text", d.text, log);
            if (d.color != null) setColor(mgt, "Fill Color", d.color, log);
            if (d.speedIndex != null) setIndex(mgt, "Animation Speed", Number(d.speedIndex), log);
            if (d.styleIndex != null) setIndex(mgt, "Style", Number(d.styleIndex), log);
            if (d.inIndex != null) setIndex(mgt, "Transition In", Number(d.inIndex), log);
            if (d.outIndex != null) setIndex(mgt, "Transition Out", Number(d.outIndex), log);

            return reply(true, "Animated " + (d.text ? '"' + d.text + '"' : "graphic") + " on the timeline.", log);
        } catch (e) {
            return reply(false, "animate failed: " + e + (e.line ? " (line " + e.line + ")" : ""), log);
        }
    };

    return api;
})();
