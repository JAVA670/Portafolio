/*
 * Minimal CSInterface subset for the Hand-Drawn Animator panel.
 * Implements only what js/main.js uses — evalScript, getHostEnvironment,
 * getSystemPath and the theme-change event — by wrapping the raw
 * window.__adobe_cep__ bridge that CEP injects into every extension page.
 *
 * It is API-compatible with Adobe's official CSInterface.js (v11), so you
 * can replace this file with the full version from
 * https://github.com/Adobe-CEP/CEP-Resources at any time without touching
 * the rest of the code.
 */

function CSInterface() {}

CSInterface.THEME_COLOR_CHANGED_EVENT = "com.adobe.csxs.events.ThemeColorChanged";

/** Runs ExtendScript in the host and passes its string result to callback. */
CSInterface.prototype.evalScript = function (script, callback) {
    callback = callback || function () {};
    if (!window.__adobe_cep__) { callback("EvalScript error."); return; }
    window.__adobe_cep__.evalScript(script, callback);
};

/** Host info incl. appSkinInfo (panel colors) — used for theme syncing. */
CSInterface.prototype.getHostEnvironment = function () {
    return JSON.parse(window.__adobe_cep__.getHostEnvironment());
};

/** Subscribe to CEP events (we only use ThemeColorChanged). */
CSInterface.prototype.addEventListener = function (type, listener, obj) {
    window.__adobe_cep__.addEventListener(type, listener, obj);
};

/** Filesystem location of this extension, used to $.evalFile the jsx. */
CSInterface.prototype.getSystemPath = function (pathType) {
    var path = decodeURI(window.__adobe_cep__.getSystemPath(pathType));
    var OSVersion = this.getOSInformation();
    if (OSVersion.indexOf("Windows") >= 0) {
        path = path.replace("file:///", "");
    } else {
        path = path.replace("file://", "");
    }
    return path;
};

CSInterface.prototype.getOSInformation = function () {
    return (navigator.platform.toLowerCase().indexOf("win") > -1) ? "Windows" : "Mac";
};

var SystemPath = {
    USER_DATA: "userData",
    COMMON_FILES: "commonFiles",
    MY_DOCUMENTS: "myDocuments",
    APPLICATION: "application",
    EXTENSION: "extension",
    HOST_APPLICATION: "hostApplication"
};
