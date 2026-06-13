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
        cs.evalScript("typeof HDA_HOST", function (t) {
            if (t === "object") { cb(true); return; }
            var jsx = (cs.getSystemPath(SystemPath.EXTENSION) + "/jsx/Premiere_Host.jsx").replace(/\\/g, "/");
            cs.evalScript('$.evalFile("' + jsx + '")', function () {
                cs.evalScript("typeof HDA_HOST", function (t2) { cb(t2 === "object"); });
            });
        });
    }

    /* ---------- actions ---------- */
    function ping() { runJSX("HDA_HOST.ping()", function (r) { setStatus(r.message, r.ok ? "ok" : "err"); }); }

    function animate() {
        // Bundle the UI into a JSON object exactly as the spec requires.
        var payload = {
            text: el.text.value,
            color: el.color.value,                       // "#rrggbb"
            speedIndex: parseInt(el.speed.value, 10),    // 1 Light, 2 Normal, 3 Heavy
            styleIndex: parseInt(el.style.value, 10),    // 1 None … 5 Paper
            inIndex: parseInt(el.transIn.value, 10),     // 1 Up … 4 Right
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
        el.text = $("text");
        el.color = $("color");
        el.hex = $("hex");
        el.speed = $("speed");
        el.style = $("style");
        el.transIn = $("transIn");
        el.transOut = $("transOut");
        el.apply = $("apply");

        el.color.addEventListener("input", function () { el.hex.textContent = el.color.value.toUpperCase(); });
        el.hex.textContent = el.color.value.toUpperCase();

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
