/* Hand-Drawn Animator — panel logic.
   The Premiere work lives in jsx/HandDrawnAnimator.jsx; this file collects
   the hardware-style control state (rotary knob, STYLE selector, rate
   toggle), calls the backend through evalScript, and renders JSON replies. */

(function () {
    "use strict";

    var cs = null;
    var insideHost = !!window.__adobe_cep__;

    // control state
    var jitter = 40;                 // 0..100, rotary knob
    var fps = 12;                    // 8 | 12
    var STYLES = [
        { label: "Random Boil", hold: true },   // hold keyframes per boil frame
        { label: "Smooth Wave", hold: false }    // continuous, quantized by Posterize Time
    ];
    var styleIdx = 0;

    var el = {};
    function $(id) { return document.getElementById(id); }

    /* ---------- output helpers ---------- */

    function setStatus(msg, kind) {
        el.status.innerHTML = "";
        el.status.textContent = msg;
        el.status.className = "display" + (kind ? " " + kind : "");
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

    /* ---------- knob ---------- */

    function intensityLabel(v) {
        return v < 34 ? "Low" : (v < 67 ? "Med" : "High");
    }

    function renderKnob() {
        el.jitterValue.textContent = jitter;
        el.intensityReadout.textContent = intensityLabel(jitter);
        // map 0..100 -> -135deg .. +135deg
        var deg = -135 + (jitter / 100) * 270;
        el.knobRim.style.transform = "rotate(" + deg + "deg)";
    }

    function setJitter(v) {
        jitter = Math.max(0, Math.min(100, Math.round(v)));
        renderKnob();
    }

    function bindKnobDrag() {
        var dragging = false, startY = 0, startVal = 0;
        function down(e) {
            dragging = true;
            startY = (e.touches ? e.touches[0].clientY : e.clientY);
            startVal = jitter;
            e.preventDefault();
        }
        function move(e) {
            if (!dragging) return;
            var y = (e.touches ? e.touches[0].clientY : e.clientY);
            setJitter(startVal + (startY - y) * 0.7); // drag up = more
        }
        function up() { dragging = false; }
        el.knob.addEventListener("mousedown", down);
        el.knob.addEventListener("touchstart", down);
        document.addEventListener("mousemove", move);
        document.addEventListener("touchmove", move);
        document.addEventListener("mouseup", up);
        document.addEventListener("touchend", up);
    }

    /* ---------- style + rate ---------- */

    function renderStyle() { el.styleLabel.textContent = STYLES[styleIdx].label; }

    function cycleStyle(dir) {
        styleIdx = (styleIdx + dir + STYLES.length) % STYLES.length;
        renderStyle();
    }

    function setRate(value) {
        fps = value;
        var btns = el.rateToggle.getElementsByTagName("button");
        for (var i = 0; i < btns.length; i++) {
            if (parseInt(btns[i].getAttribute("data-fps"), 10) === fps) btns[i].className = "on";
            else btns[i].className = "";
        }
    }

    /* ---------- backend bridge ---------- */

    function runJSX(call, cb) {
        cs.evalScript(call, function (res) {
            if (!res || res === "EvalScript error.") {
                cb({ ok: false, message: "ExtendScript error — see http://localhost:8088 to debug." });
                return;
            }
            try { cb(JSON.parse(res)); }
            catch (e) { cb({ ok: false, message: "Unreadable reply: " + res }); }
        });
    }

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

    function ping() {
        runJSX("HDA.ping()", function (r) { setStatus(r.message, r.ok ? "ok" : "err"); });
    }

    function animate() {
        var hold = STYLES[styleIdx].hold ? "true" : "false";
        busy(true);
        setStatus("Applying hand-drawn effect…");
        setLog(null);
        runJSX("HDA.applyEffect(" + jitter + "," + fps + "," + hold + ")", function (r) {
            busy(false);
            setStatus(r.message, r.ok ? "ok" : "err");
            setLog(r.log);
        });
    }

    function insertMogrt() {
        busy(true);
        setStatus("Inserting boil MOGRT…");
        setLog(null);
        runJSX("HDA.applyBoilMogrt(" + jitter + "," + fps + ")", function (r) {
            busy(false);
            setStatus(r.message, r.ok ? "ok" : "err");
            setLog(r.log);
        });
    }

    function findEffects() {
        busy(true);
        runJSX('HDA.listEffects("")', function (r) {
            busy(false);
            setStatus(r.message, r.ok ? "ok" : "err");
            setLog(r.log);
        });
    }

    /* ---------- init ---------- */

    window.addEventListener("load", function () {
        el.status = $("status");
        el.log = $("log");
        el.knob = $("knob");
        el.knobRim = el.knob.getElementsByClassName("knob-rim")[0];
        el.jitterValue = $("jitterValue");
        el.intensityReadout = $("intensityReadout");
        el.styleLabel = $("styleLabel");
        el.rateToggle = $("rateToggle");
        el.apply = $("apply");
        el.mogrt = $("mogrt");
        el.find = $("find");
        el.refresh = $("refresh");

        renderKnob();
        renderStyle();
        bindKnobDrag();

        $("jitterDown").addEventListener("click", function () { setJitter(jitter - 5); });
        $("jitterUp").addEventListener("click", function () { setJitter(jitter + 5); });
        $("stylePrev").addEventListener("click", function () { cycleStyle(-1); });
        $("styleNext").addEventListener("click", function () { cycleStyle(1); });
        el.rateToggle.addEventListener("click", function (ev) {
            var b = ev.target;
            if (b && b.getAttribute("data-fps")) setRate(parseInt(b.getAttribute("data-fps"), 10));
        });

        if (!insideHost) {
            setStatus("UI preview — open inside Premiere Pro to apply.", "err");
            busy(true);
            return;
        }

        cs = new CSInterface();
        el.apply.addEventListener("click", animate);
        el.mogrt.addEventListener("click", insertMogrt);
        el.find.addEventListener("click", findEffects);
        el.refresh.addEventListener("click", ping);

        ensureBackend(function (ok) {
            if (!ok) { setStatus("Could not load HandDrawnAnimator.jsx.", "err"); return; }
            ping();
        });
    });
})();
