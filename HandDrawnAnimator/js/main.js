/* Hand-Drawn Animator — panel logic.
   All Premiere work happens in jsx/HandDrawnAnimator.jsx; this file only
   collects UI values, calls the backend through evalScript, and renders the
   JSON replies. */

(function () {
    "use strict";

    var cs = null;
    var insideHost = !!window.__adobe_cep__;

    var el = {
        status: null, log: null,
        jitter: null, jitterValue: null, holdKeys: null,
        apply: null, mogrt: null, find: null, findTerm: null
    };

    function $(id) { return document.getElementById(id); }

    /* ---------- output helpers ---------- */

    function setStatus(msg, kind) {
        el.status.textContent = msg;
        el.status.className = "status" + (kind ? " " + kind : "");
    }

    function setLog(lines) {
        if (!lines || !lines.length) { el.log.hidden = true; return; }
        el.log.textContent = lines.join("\n");
        el.log.hidden = false;
    }

    function busy(b) {
        el.apply.disabled = b;
        el.mogrt.disabled = b;
        el.find.disabled = b;
    }

    /* ---------- backend bridge ---------- */

    function runJSX(call, cb) {
        cs.evalScript(call, function (res) {
            if (!res || res === "EvalScript error.") {
                cb({ ok: false, message: "ExtendScript error — open http://localhost:8088 to debug, or check that jsx/HandDrawnAnimator.jsx loaded." });
                return;
            }
            try {
                cb(JSON.parse(res));
            } catch (e) {
                cb({ ok: false, message: "Unreadable backend reply: " + res });
            }
        });
    }

    // ScriptPath in the manifest normally auto-loads the jsx; if the HDA
    // namespace is missing (some hosts only load it lazily), evalFile it.
    function ensureBackend(cb) {
        cs.evalScript("typeof HDA", function (t) {
            if (t === "object") { cb(true); return; }
            var jsx = (cs.getSystemPath(SystemPath.EXTENSION) + "/jsx/HandDrawnAnimator.jsx")
                .replace(/\\/g, "/");
            cs.evalScript('$.evalFile("' + jsx + '")', function () {
                cs.evalScript("typeof HDA", function (t2) { cb(t2 === "object"); });
            });
        });
    }

    /* ---------- actions ---------- */

    function currentFps() {
        return document.querySelector('input[name="fps"]:checked').value;
    }

    function ping() {
        runJSX("HDA.ping()", function (r) {
            setStatus(r.message, r.ok ? "ok" : "err");
        });
    }

    function applyEffect() {
        var jitter = parseInt(el.jitter.value, 10) || 0;
        var hold = el.holdKeys.checked ? "true" : "false";
        busy(true);
        setStatus("Applying hand-drawn effect…");
        setLog(null);
        runJSX("HDA.applyEffect(" + jitter + "," + currentFps() + "," + hold + ")", function (r) {
            busy(false);
            setStatus(r.message, r.ok ? "ok" : "err");
            setLog(r.log);
        });
    }

    function insertMogrt() {
        var jitter = parseInt(el.jitter.value, 10) || 0;
        busy(true);
        setStatus("Inserting boil MOGRT…");
        setLog(null);
        runJSX("HDA.applyBoilMogrt(" + jitter + "," + currentFps() + ")", function (r) {
            busy(false);
            setStatus(r.message, r.ok ? "ok" : "err");
            setLog(r.log);
        });
    }

    function findEffects() {
        // quotes/backslashes stripped: the term is embedded in an eval string
        var term = el.findTerm.value.replace(/["'\\\r\n]/g, "");
        busy(true);
        runJSX('HDA.listEffects("' + term + '")', function (r) {
            busy(false);
            setStatus(r.message, r.ok ? "ok" : "err");
            setLog(r.log);
        });
    }

    /* ---------- host theme sync ---------- */

    function clamp8(v) { return Math.max(0, Math.min(255, Math.round(v))); }

    function applyTheme() {
        try {
            var color = cs.getHostEnvironment().appSkinInfo.panelBackgroundColor.color;
            var root = document.documentElement.style;
            root.setProperty("--bg", "rgb(" + clamp8(color.red) + "," + clamp8(color.green) + "," + clamp8(color.blue) + ")");
            root.setProperty("--card", "rgb(" + clamp8(color.red + 10) + "," + clamp8(color.green + 10) + "," + clamp8(color.blue + 10) + ")");
            root.setProperty("--border", "rgb(" + clamp8(color.red + 24) + "," + clamp8(color.green + 24) + "," + clamp8(color.blue + 24) + ")");
            if (color.red > 128) { // light UI themes
                root.setProperty("--text", "#1f1f1f");
                root.setProperty("--text-dim", "#5a5a5a");
            }
        } catch (e) { /* keep CSS defaults */ }
    }

    /* ---------- init ---------- */

    window.addEventListener("load", function () {
        el.status = $("status");
        el.log = $("log");
        el.jitter = $("jitter");
        el.jitterValue = $("jitterValue");
        el.holdKeys = $("holdKeys");
        el.apply = $("apply");
        el.mogrt = $("mogrt");
        el.find = $("find");
        el.findTerm = $("findTerm");

        el.jitter.addEventListener("input", function () {
            el.jitterValue.textContent = el.jitter.value;
        });

        if (!insideHost) {
            setStatus("Running outside Premiere Pro — UI preview only.", "err");
            busy(true);
            return;
        }

        cs = new CSInterface();
        applyTheme();
        cs.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, applyTheme);

        el.apply.addEventListener("click", applyEffect);
        el.mogrt.addEventListener("click", insertMogrt);
        el.find.addEventListener("click", findEffects);
        el.findTerm.addEventListener("keydown", function (ev) {
            if (ev.key === "Enter") findEffects();
        });

        ensureBackend(function (ok) {
            if (!ok) {
                setStatus("Could not load jsx/HandDrawnAnimator.jsx into the host.", "err");
                return;
            }
            ping();
        });
    });
})();
