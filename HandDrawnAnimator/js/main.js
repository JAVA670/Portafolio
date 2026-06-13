/* Hand-Drawn Animator — panel logic.
   Collects the hardware-style control state (ANIMATION preset knob, TEXT
   field, STYLE selector, in/out TRANSITION D-pads) and calls the
   jsx/HandDrawnAnimator.jsx backend through evalScript. */

(function () {
    "use strict";

    var cs = null;
    var insideHost = !!window.__adobe_cep__;

    // ANIMATION presets — each maps to the boil engine's jitter/fps/hold.
    var ANIM = [
        { name: "Normal", jitter: 40, fps: 12, hold: true },
        { name: "Calm",   jitter: 20, fps: 8,  hold: false },
        { name: "Rough",  jitter: 60, fps: 12, hold: true },
        { name: "Jitter", jitter: 80, fps: 12, hold: true },
        { name: "Wild",   jitter: 100, fps: 8, hold: true }
    ];
    var animIdx = 0;

    // STYLE presets — edge-texture (marker/pencil) roughness multiplier.
    var STYLE = [
        { name: "None",   edge: 0 },
        { name: "Pencil", edge: 0.7 },
        { name: "Marker", edge: 1.3 },
        { name: "Bold",   edge: 2.2 }
    ];
    var styleIdx = 0;

    var inDir = "none", outDir = "none";

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

    /* ---------- knob / presets ---------- */

    function renderAnim() {
        el.animReadout.textContent = ANIM[animIdx].name;
        var deg = -135 + (animIdx / (ANIM.length - 1)) * 270;
        el.knobRim.style.transform = "rotate(" + deg + "deg)";
    }
    function cycleAnim(dir) {
        animIdx = (animIdx + dir + ANIM.length) % ANIM.length;
        renderAnim();
    }
    function bindKnobDrag() {
        var dragging = false, startY = 0, startIdx = 0;
        function down(e) {
            dragging = true;
            startY = (e.touches ? e.touches[0].clientY : e.clientY);
            startIdx = animIdx; e.preventDefault();
        }
        function move(e) {
            if (!dragging) return;
            var y = (e.touches ? e.touches[0].clientY : e.clientY);
            var steps = Math.round((startY - y) / 28);
            var idx = Math.max(0, Math.min(ANIM.length - 1, startIdx + steps));
            if (idx !== animIdx) { animIdx = idx; renderAnim(); }
        }
        function up() { dragging = false; }
        el.knob.addEventListener("mousedown", down);
        el.knob.addEventListener("touchstart", down);
        document.addEventListener("mousemove", move);
        document.addEventListener("touchmove", move);
        document.addEventListener("mouseup", up);
        document.addEventListener("touchend", up);
    }

    function renderStyle() { el.styleLabel.textContent = STYLE[styleIdx].name; }
    function cycleStyle(dir) {
        styleIdx = (styleIdx + dir + STYLE.length) % STYLE.length;
        renderStyle();
    }

    /* ---------- D-pads ---------- */

    function bindDpad(subpanel) {
        var which = subpanel.getAttribute("data-trans"); // "in" | "out"
        var readout = subpanel.getElementsByClassName("dir-readout")[0];
        var btns = subpanel.getElementsByClassName("dbtn");
        subpanel.addEventListener("click", function (ev) {
            var b = ev.target;
            var dir = b.getAttribute && b.getAttribute("data-dir");
            if (!dir) return;
            for (var i = 0; i < btns.length; i++) btns[i].className = btns[i].className.replace(/\s*on/g, "");
            b.className += " on";
            if (which === "in") inDir = dir; else outDir = dir;
            readout.textContent = dir.charAt(0).toUpperCase() + dir.slice(1);
        });
    }

    /* ---------- backend ---------- */

    function runJSX(call, cb) {
        cs.evalScript(call, function (res) {
            if (!res || res === "EvalScript error.") {
                cb({ ok: false, message: "ExtendScript error — see http://localhost:8088." });
                return;
            }
            try { cb(JSON.parse(res)); }
            catch (e) { cb({ ok: false, message: "Unreadable reply: " + res }); }
        });
    }
    function ensureBackend(cb) {
        cs.evalScript("typeof HDA", function (t) {
            if (t === "object") { cb(true); return; }
            var jsx = (cs.getSystemPath(SystemPath.EXTENSION) + "/jsx/HandDrawnAnimator.jsx").replace(/\\/g, "/");
            cs.evalScript('$.evalFile("' + jsx + '")', function () {
                cs.evalScript("typeof HDA", function (t2) { cb(t2 === "object"); });
            });
        });
    }

    // Escape for safe embedding inside the evalScript double-quoted string.
    function esc(s) { return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]/g, " "); }

    /* ---------- actions ---------- */

    function ping() { runJSX("HDA.ping()", function (r) { setStatus(r.message, r.ok ? "ok" : "err"); }); }

    function animate() {
        var a = ANIM[animIdx], edge = STYLE[styleIdx].edge;
        var text = esc(el.textInput.value);
        busy(true);
        setStatus("Animating…");
        setLog(null);
        var call = 'HDA.animateText("' + text + '",' + a.jitter + ',' + a.fps + ',' +
                   (a.hold ? "true" : "false") + ',' + edge + ',"' + inDir + '","' + outDir + '")';
        runJSX(call, function (r) {
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
        el.animReadout = $("animReadout");
        el.styleLabel = $("styleLabel");
        el.textInput = $("textInput");
        el.apply = $("apply");
        el.refresh = $("refresh");

        renderAnim();
        renderStyle();
        bindKnobDrag();

        $("animPrev").addEventListener("click", function () { cycleAnim(-1); });
        $("animNext").addEventListener("click", function () { cycleAnim(1); });
        $("stylePrev").addEventListener("click", function () { cycleStyle(-1); });
        $("styleNext").addEventListener("click", function () { cycleStyle(1); });

        var subs = document.getElementsByClassName("subpanel");
        for (var i = 0; i < subs.length; i++) bindDpad(subs[i]);

        if (!insideHost) {
            setStatus("UI preview — open inside Premiere Pro to animate.", "err");
            busy(true);
            return;
        }

        cs = new CSInterface();
        el.apply.addEventListener("click", animate);
        el.refresh.addEventListener("click", ping);

        ensureBackend(function (ok) {
            if (!ok) { setStatus("Could not load HandDrawnAnimator.jsx.", "err"); return; }
            ping();
        });
    });
})();
