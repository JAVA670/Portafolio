# Hand-Drawn Animator — CEP extension for Premiere Pro (2023+)

Automates the frame-by-frame "boil / jitter" aesthetic for text and shape
graphics: one click applies a displacement warp, an edge-roughening texture
and Posterize Time, then generates the looping boil animation as keyframes.

```
HandDrawnAnimator/
├── CSXS/manifest.xml        CEP manifest (PPRO ≥ 23.0)
├── .debug                   remote-debug port (localhost:8088)
├── index.html               panel UI
├── css/style.css            dark theme, syncs to Premiere's skin
├── js/main.js               UI logic → evalScript bridge
├── lib/CSInterface.js       minimal CEP bridge (drop-in compatible with Adobe's)
├── jsx/HandDrawnAnimator.jsx  ExtendScript backend (all Premiere work)
└── assets/BUILD-THE-MOGRT.md  optional AE-grade fallback for PPro < 25.2
```

## Feasibility summary (what the API allows)

| Need | Verdict | How |
|---|---|---|
| Add effects to a clip by script | ✅ via QE DOM only | `app.enableQE()` → `qe.project.getVideoEffectByName()` → `qeClip.addVideoEffect()`. The documented DOM cannot add effects. |
| Modify effect parameters | ✅ documented DOM | `trackItem.components[i].properties` → `ComponentParam.setValue(value, true)` |
| Keyframes for the boil loop | ✅ documented DOM | `setTimeVarying(true)`, `addKey(t)`, `setValueAtKey(t, v)`, `setInterpolationTypeAtKey(t, 4 /*Hold*/)` — times are clip-relative seconds (`inPoint.seconds → outPoint.seconds`) |
| Expressions on Evolution | ❌ impossible | Premiere has no expression engine (AE only) → the script writes real keyframes instead |
| Posterize Time | ✅ all supported versions | native Premiere effect (Time category) |
| Roughen Edges | ✅ Premiere 22.x+ | native (GPU-accelerated since 22.1) — available on the 2023 minimum |
| Turbulent Displace | ✅ Premiere 25.2+ only | native GPU effect since April 2025; on 23.x/24.x the script auto-falls back to **Wave Warp** (Smooth Noise) |
| Apply a `.prfpset` preset by script | ❌ impossible | no scripting API for effect presets — QE add-by-name replaces it |
| AE-grade look on old versions | ✅ MOGRT workaround | `sequence.importMGT()` + `trackItem.getMGTComponent()` — see `assets/BUILD-THE-MOGRT.md` |

## Install (developer mode)

### 1. Enable unsigned extensions (PlayerDebugMode)

CEP refuses unsigned panels unless PlayerDebugMode is on. Premiere 2023–2025
use the CSXS 11 runtime; setting 9–12 covers every recent build.

**Windows** — run in `cmd`:

```bat
for %v in (9 10 11 12) do reg add HKCU\Software\Adobe\CSXS.%v /v PlayerDebugMode /t REG_SZ /d 1 /f
```

(Manual route: `regedit` → `HKEY_CURRENT_USER\Software\Adobe\CSXS.11` → new
**String value** `PlayerDebugMode` = `1`.)

**macOS** — run in Terminal, then restart Premiere:

```bash
for v in 9 10 11 12; do defaults write com.adobe.CSXS.$v PlayerDebugMode 1; done
killall cfprefsd
```

### 2. Copy the folder into the CEP extensions directory

| OS | Per-user path (create `extensions` if missing) |
|---|---|
| Windows | `%APPDATA%\Adobe\CEP\extensions\HandDrawnAnimator` |
| macOS | `~/Library/Application Support/Adobe/CEP/extensions/HandDrawnAnimator` |

Tip: symlink instead of copying while developing —
`mklink /D "%APPDATA%\Adobe\CEP\extensions\HandDrawnAnimator" "C:\path\to\repo\HandDrawnAnimator"` (Windows) or
`ln -s "$(pwd)/HandDrawnAnimator" ~/Library/Application\ Support/Adobe/CEP/extensions/` (macOS).

### 3. Run it

1. Restart Premiere Pro → **Window ▸ Extensions ▸ Hand-Drawn Animator**.
2. Open a sequence, select a text/shape graphic clip in the timeline.
3. Set **Jitter Intensity** and **Boil Rate**, click **Apply Hand-Drawn Effect**.
4. Check the clip's Effect Controls: warp + edge effects on top, Posterize
   Time at the bottom (order matters — it quantizes what is above it).

### 4. Debugging

With PlayerDebugMode on, the panel's Chromium inspector is at
**http://localhost:8088** (port set in `.debug`). ExtendScript errors are
returned to the panel and shown in its log area. If the panel appears blank,
delete the CEP cache (`%APPDATA%\Adobe\CEP\cache` /
`~/Library/Caches/CSXS`) and restart.

### 5. Distribution (optional)

For machines without PlayerDebugMode, package and sign:

```bash
ZXPSignCmd -selfSignedCert US NY "Studio" "Yeison" password cert.p12
ZXPSignCmd -sign HandDrawnAnimator HandDrawnAnimator.zxp cert.p12 password -tsa http://timestamp.digicert.com
```

Install the `.zxp` with anastasiy's Extension Manager or `ExManCmd`.

## Troubleshooting

- **"warp/edges: no candidate effect available"** — your Premiere UI locale
  names effects differently. Open the panel's *Troubleshooting ▸ effect name
  finder*, search (e.g. `wave`), and paste the exact name at the front of
  `FX_CANDIDATES` in `jsx/HandDrawnAnimator.jsx`.
- **No Turbulent Displace on 23.x/24.x** — expected; it shipped natively in
  25.2. The script falls back to Wave Warp, or use the MOGRT route for the
  real AE effect.
- **Turbulent Displace renders oddly on 25.3** — known Adobe GPU bug in that
  dot release; update Premiere or switch the clip to software rendering.
- **Nothing happens on Apply** — the panel needs a *timeline* selection
  (clip highlighted in the sequence), not a Project-panel selection.
- **QE disclaimer** — `qe` is Adobe's internal QE DOM: undocumented but
  stable for ~a decade and used by Adobe's own PProPanel sample. It is the
  only way to add effects by script; all parameter work uses the documented
  API.
