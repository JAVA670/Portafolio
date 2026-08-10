/* Hand-Drawn Animator — panel logic.
   Bundles the UI control values into a JSON payload and hands it to
   jsx/Premiere_Host.jsx via CSInterface.evalScript(). All Premiere work
   happens host-side. */

(function () {
    "use strict";

    var cs = null;
    var insideHost = !!window.__adobe_cep__;
    var el = {};
    function $(id) { return document.getElementById(id); }

    /* ---------- output ---------- */
    function setStatus(msg, kind) {
        el.status.textContent = msg;
        el.status.className = "statusline" + (kind ? " " + kind : "");
    }
    function setLog(lines) {
        if (!lines || !lines.length) { el.log.hidden = true; return; }
        el.log.textContent = lines.join("\n");
        el.log.hidden = false;
    }
    function busy(b) { el.apply.disabled = b; }

    /* ---------- backend bridge ---------- */
    function runJSX(call, cb) {
        cs.evalScript(call, function (res) {
            if (!res || res === "EvalScript error.") { cb({ ok: false, message: "ExtendScript error — see http://localhost:8088." }); return; }
            try { cb(JSON.parse(res)); } catch (e) { cb({ ok: false, message: "Unreadable reply: " + res }); }
        });
    }
    function ensureBackend(cb) {
        // Always re-load the host from disk so panel reloads pick up edits
        // (Premiere's ExtendScript engine caches HDA_HOST across panel opens,
        // so checking "typeof HDA_HOST" first would keep a stale version).
        var jsx = (cs.getSystemPath(SystemPath.EXTENSION) + "/jsx/Premiere_Host.jsx").replace(/\\/g, "/");
        cs.evalScript('$.evalFile("' + jsx + '")', function () {
            cs.evalScript("typeof HDA_HOST", function (t) { cb(t === "object"); });
        });
    }

    /* ---------- actions ---------- */
    function ping() { runJSX("HDA_HOST.ping()", function (r) { setStatus(r.message, r.ok ? "ok" : "err"); }); }

    function animate() {
        // Applies the hand-drawn look to the SELECTED clip (no text/color —
        // those are set in Premiere directly on the text layer).
        var payload = {
            speedIndex: parseInt(el.speed.value, 10),    // 1 Light, 2 Normal, 3 Heavy
            styleIndex: parseInt(el.style.value, 10),    // 1 None … 5 Paper
            inIndex: parseInt(el.transIn.value, 10),     // 0 None, 1 Up … 4 Right
            outIndex: parseInt(el.transOut.value, 10)
        };
        var json = JSON.stringify(payload);
        busy(true);
        setStatus("Animating…");
        setLog(null);
        // JSON.stringify(json) safely embeds the payload as a quoted JS string.
        runJSX("HDA_HOST.animate(" + JSON.stringify(json) + ")", function (r) {
            busy(false);
            setStatus(r.message, r.ok ? "ok" : "err");
            setLog(r.log);
        });
    }

    /* ---------- init ---------- */
    window.addEventListener("load", function () {
        el.status = $("status");
        el.log = $("log");
        el.speed = $("speed");
        el.style = $("style");
        el.transIn = $("transIn");
        el.transOut = $("transOut");
        el.apply = $("apply");

        if (!insideHost) {
            setStatus("UI preview — open inside Premiere Pro to animate.", "err");
            busy(true);
            return;
        }

        cs = new CSInterface();
        el.apply.addEventListener("click", animate);

        ensureBackend(function (ok) {
            if (!ok) { setStatus("Could not load Premiere_Host.jsx.", "err"); return; }
            ping();
        });
    });
})();
