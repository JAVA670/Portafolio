/* Hand-Drawn Animator (After Effects) — CEP panel logic.
   Same UI as the Premiere panel, but talks to jsx/AE_Host.jsx which builds the
   full animation (fonts, texture, morph, in/out, .srt voice sync) in AE. */

(function () {
    "use strict";

    var cs = null;
    var insideHost = !!window.__adobe_cep__;
    var srtPath = "";

    var IN_OUT = ["Fade", "Slide Up", "Slide Down", "Slide Left", "Slide Right",
                  "Pop", "Bounce", "Scale", "Spin", "Blur", "Rise", "Hard"];
    var PRESETS = {
        "TikTok Captions": { style: "Clean", font: "Anton", inAnim: "Pop", outAnim: "Fade", morph: false, split: "Word by word", outline: true, shadow: true, speed: "Light" },
        "Hand-Drawn Boil": { style: "Marker", font: "Permanent Marker", inAnim: "Fade", outAnim: "Fade", morph: true, split: "Word by word", outline: false, shadow: false, speed: "Normal" },
        "Clean Subtitle":  { style: "Clean", font: "Arial", inAnim: "Fade", outAnim: "Fade", morph: false, split: "Sentences", outline: true, shadow: true, speed: "Light" },
        "Kinetic Pop":     { style: "Neon", font: "Bangers", inAnim: "Bounce", outAnim: "Scale", morph: false, split: "Word by word", outline: true, shadow: true, speed: "Normal" }
    };

    var el = {};
    function $(id) { return document.getElementById(id); }

    function setStatus(msg, kind) { el.status.textContent = msg; el.status.className = "statusline" + (kind ? " " + kind : ""); }
    function setLog(lines) { if (!lines || !lines.length) { el.log.hidden = true; return; } el.log.textContent = lines.join("\n"); el.log.hidden = false; }
    function busy(b) { el.apply.disabled = b; }

    function hexToRgb(hex) {
        hex = String(hex || "#ffffff").replace("#", "");
        if (hex.length === 3) hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        return [parseInt(hex.substr(0, 2), 16) / 255, parseInt(hex.substr(2, 2), 16) / 255, parseInt(hex.substr(4, 2), 16) / 255];
    }

    function fillSelect(sel, items, selected) {
        for (var i = 0; i < items.length; i++) {
            var o = document.createElement("option");
            o.textContent = items[i]; if (items[i] === selected) o.selected = true;
            sel.appendChild(o);
        }
    }

    /* ---------- backend ---------- */
    function runJSX(call, cb) {
        cs.evalScript(call, function (res) {
            if (!res || res === "EvalScript error.") { cb({ ok: false, message: "ExtendScript error — see http://localhost:8089." }); return; }
            try { cb(JSON.parse(res)); } catch (e) { cb({ ok: false, message: "Unreadable reply: " + res }); }
        });
    }
    function ensureBackend(cb) {
        var jsx = (cs.getSystemPath(SystemPath.EXTENSION) + "/jsx/AE_Host.jsx").replace(/\\/g, "/");
        cs.evalScript('$.evalFile("' + jsx + '")', function () {
            cs.evalScript("typeof HDA_AE", function (t) { cb(t === "object"); });
        });
    }
    function esc(s) { return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }

    /* ---------- actions ---------- */
    function ping() { runJSX("HDA_AE.ping()", function (r) { setStatus(r.message, r.ok ? "ok" : "err"); }); }

    function loadSrt() {
        // pickSRT returns a bare path string (not JSON), so read it directly.
        cs.evalScript("HDA_AE.pickSRT()", function (path) {
            if (path && path !== "EvalScript error." && path.length) {
                srtPath = path;
                el.srtName.textContent = path.replace(/^.*[\\\/]/, "");
                el.useSrt.checked = true;
                setStatus("Loaded subtitles: " + el.srtName.textContent, "ok");
            }
        });
    }

    function animate() {
        var payload = {
            source: el.useSrt.checked && srtPath ? "srt" : "text",
            srtPath: srtPath,
            sync: el.sync.value,
            text: el.text.value,
            split: el.split.value,
            font: el.font.value,
            size: parseInt(el.size.value, 10) || 200,
            color: hexToRgb(el.color.value),
            style: el.style.value,
            speed: el.speed.value,
            smooth: el.smooth.value,
            inAnim: el.inAnim.value,
            outAnim: el.outAnim.value,
            position: el.position.value,
            framesPerChunk: parseInt(el.frames.value, 10) || 12,
            morph: el.morph.checked,
            outline: el.outline.checked,
            shadow: el.shadow.checked,
            jitter: el.jitter.checked,
            darkBG: el.darkBG.checked
        };
        var json = JSON.stringify(payload);
        busy(true); setStatus("Building animation…"); setLog(null);
        runJSX("HDA_AE.build(" + JSON.stringify(json) + ")", function (r) {
            busy(false); setStatus(r.message, r.ok ? "ok" : "err"); setLog(r.log);
        });
    }

    function applyPreset(name) {
        var p = PRESETS[name]; if (!p) return;
        el.style.value = p.style; el.font.value = p.font; el.inAnim.value = p.inAnim; el.outAnim.value = p.outAnim;
        el.split.value = p.split; el.speed.value = p.speed; el.morph.checked = p.morph; el.outline.checked = p.outline; el.shadow.checked = p.shadow;
        setStatus("Preset applied: " + name, "ok");
    }

    /* ---------- init ---------- */
    window.addEventListener("load", function () {
        var ids = ["status", "log", "text", "useSrt", "srtName", "loadSrt", "font", "size", "color", "hex",
                   "style", "inAnim", "outAnim", "speed", "smooth", "split", "frames", "position", "sync",
                   "morph", "outline", "shadow", "jitter", "darkBG", "apply"];
        for (var i = 0; i < ids.length; i++) el[ids[i]] = $(ids[i]);

        fillSelect(el.inAnim, IN_OUT, "Fade");
        fillSelect(el.outAnim, IN_OUT, "Fade");

        el.color.addEventListener("input", function () { el.hex.textContent = el.color.value.toUpperCase(); });
        el.hex.textContent = el.color.value.toUpperCase();

        var pbtns = document.querySelectorAll("#presets button");
        for (var b = 0; b < pbtns.length; b++) {
            pbtns[b].addEventListener("click", function (ev) { applyPreset(ev.target.getAttribute("data-preset")); });
        }

        if (!insideHost) { setStatus("UI preview — open inside After Effects to build.", "err"); busy(true); return; }

        cs = new CSInterface();
        el.apply.addEventListener("click", animate);
        el.loadSrt.addEventListener("click", loadSrt);

        ensureBackend(function (ok) {
            if (!ok) { setStatus("Could not load AE_Host.jsx.", "err"); return; }
            ping();
        });
    });
})();
