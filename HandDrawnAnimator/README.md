# Hand-Drawn Animator — CEP extension for Premiere Pro (2023+)

A vintage-hardware-styled panel that animates text & graphics with a
hand-drawn frame-by-frame "boil / jitter" aesthetic. Type text (or select a
clip), turn the **ANIMATION** knob to pick a preset, choose a **STYLE**, set
in/out **TRANSITION** directions on the D-pads, and hit **ANIMATE**.

Under the hood, ANIMATE: (1) targets the selected clip or spawns a text MOGRT
from the TEXT field, (2) applies a displacement warp + edge-roughening texture
+ Posterize Time and generates the looping boil keyframes, and (3) keyframes a
directional in/out transition on Motion ▸ Position and Opacity.

```
HandDrawnAnimator/
├── CSXS/manifest.xml          CEP manifest (PPRO ≥ 23.0)
├── .debug                     remote-debug port (localhost:8088)
├── index.html                 panel UI (skeuomorphic hardware look)
├── css/style.css              pure-CSS/SVG styling (renders offline)
├── js/main.js                 control state → evalScript bridge
├── lib/CSInterface.js         minimal CEP bridge (drop-in compatible)
├── jsx/HandDrawnAnimator.jsx  ExtendScript backend (all Premiere work)
└── assets/BUILD-THE-TEXT-MOGRT.md  one-time text-template recipe
```

## Controls

| Control | Maps to |
|---|---|
| **ANIMATION** knob (drag or ◀ ▶) | Boil preset: Normal / Calm / Rough / Jitter / Wild → jitter + fps + boil mode |
| **TEXT HERE** field | Text to create (spawns a MOGRT) or retext a selected MOGRT; leave empty to animate the selection as-is |
| **STYLE** selector | Edge-texture roughness: None / Pencil / Marker / Bold |
| **TRANSITION** D-pads | Animate In / Out direction (Up/Down/Left/Right) or center = None |
| **ANIMATE** | Runs `HDA.animateText(...)` |
| ⟳ button | Re-checks the timeline selection |

## Feasibility summary (what the API allows)

| Need | Verdict | How |
|---|---|---|
| Add effects to a clip by script | ✅ via QE DOM only | `app.enableQE()` → `qe.project.getVideoEffectByName()` → `qeClip.addVideoEffect()`. The documented DOM cannot add effects. |
| Modify effect parameters | ✅ documented DOM | `trackItem.components[i].properties` → `ComponentParam.setValue(value, true)` |
| Boil + transition keyframes | ✅ documented DOM | `setTimeVarying(true)`, `addKey(t)`, `setValueAtKey(t, v)`, `setInterpolationTypeAtKey` (0=Linear, 4=Hold, 5=Bezier — values verified against Adobe's PProPanel sample); times are clip-relative seconds (`inPoint.seconds → outPoint.seconds`) |
| Directional in/out transition | ✅ documented DOM | keyframes intrinsic **Motion ▸ Position** + **Opacity ▸ Opacity**; current Position is read first to detect center & coordinate units (normalized vs pixels) |
| Expressions on Evolution | ❌ impossible | Premiere has no expression engine (AE only) → the script writes real keyframes instead |
| Create a text layer from scratch | ❌ impossible | no ExtendScript API → spawn a text MOGRT via `sequence.importMGT()` and set Source Text via `getMGTComponent()` (see `assets/BUILD-THE-TEXT-MOGRT.md`), or animate an existing selected clip |
| Posterize Time | ✅ all supported versions | native Premiere effect (Time category) |
| Roughen Edges | ✅ Premiere 22.x+ | native (GPU-accelerated since 22.1) — available on the 2023 minimum |
| Turbulent Displace | ✅ Premiere 25.2+ only | native GPU effect since April 2025; on 23.x/24.x the script auto-falls back to **Wave Warp** (Smooth Noise) |
| Apply a `.prfpset` preset by script | ❌ impossible | no scripting API for effect presets — QE add-by-name replaces it |

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
2. Open a sequence. Then either:
   - **Select a text/graphic clip** in the timeline (animate it as-is), or
   - **Type in TEXT HERE** with nothing selected to spawn a text graphic
     (requires `assets/HandDrawnText.mogrt` — see that build doc).
3. Turn the **ANIMATION** knob (preset), pick a **STYLE**, set **Animate
   In/Out** directions, and click **ANIMATE**.
4. Check the clip's Effect Controls: warp + edge effects on top, Posterize
   Time at the bottom (order matters — it quantizes what is above it), plus
   Position/Opacity keyframes for the transition.

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
  names effects differently. Add the exact local name to the front of the
  `FX` candidate lists at the top of `jsx/HandDrawnAnimator.jsx` (call
  `HDA.listEffects("wave")` from the console to see what your build exposes).
- **"Type some text, or select a text/graphic clip"** — nothing was selected
  and the TEXT field was empty. Select a clip or type text.
- **"no text parameter exposed in this MOGRT"** — your text template's
  exposed control isn't named `Text`; re-check `assets/BUILD-THE-TEXT-MOGRT.md`.
- **Transition shows "Position unreadable — opacity fade only"** — rare on
  some clip types; the in/out still fades. Position keying needs a readable
  Motion ▸ Position value.
- **No Turbulent Displace on 23.x/24.x** — expected; it shipped natively in
  25.2. The script falls back to Wave Warp automatically.
- **Turbulent Displace renders oddly on 25.3** — known Adobe GPU bug in that
  dot release; update Premiere or switch the clip to software rendering.
- **Nothing happens** — the panel needs a *timeline* selection (clip
  highlighted in the sequence), not a Project-panel selection.
- **QE disclaimer** — `qe` is Adobe's internal QE DOM: undocumented but
  stable for ~a decade and used by Adobe's own PProPanel sample. It is the
  only way to add effects by script; all parameter work uses the documented
  API.
