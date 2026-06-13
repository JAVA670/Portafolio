# Building `HandDrawnBoil.mogrt` (one-time, in After Effects)

The **Insert Boil MOGRT** button needs `assets/HandDrawnBoil.mogrt`. This is
the high-fidelity fallback for Premiere 23.x/24.x, where Turbulent Displace
is not a native effect: an *adjustment-layer* Motion Graphics Template that
warps every track below it using the real AE effects, with the boil loop
baked in as expressions (allowed inside MOGRTs, impossible to script in
Premiere directly).

## Recipe

1. **New composition** `HandDrawnBoil` — match your delivery spec
   (e.g. 1920×1080, 25 fps, 10 s).

2. **Layer ▸ New ▸ Adjustment Layer**, rename it `BOIL`. An adjustment layer
   inside a MOGRT affects all Premiere tracks underneath the .mogrt clip —
   that is what lets it style *existing* text/shape clips.

3. On `BOIL`, add **Effect ▸ Expression Controls ▸ Slider Control** twice;
   rename them exactly:
   - `Jitter Intensity` (set 40)
   - `Boil FPS` (set 12)

   These exact names matter: `HDA.applyBoilMogrt()` drives them via
   `getMGTComponent().properties.getParamForDisplayName("Jitter Intensity")`.

4. Add **Effect ▸ Distort ▸ Turbulent Displace**, then alt-click the
   stopwatch of these properties and paste the expressions:

   - **Amount**
     ```js
     effect("Jitter Intensity")("Slider") * 1.2
     ```
   - **Size** — set statically to `30`.
   - **Evolution**
     ```js
     posterizeTime(effect("Boil FPS")("Slider"));
     seedRandom(1, true);
     random(0, 360)
     ```

5. Add **Effect ▸ Stylize ▸ Roughen Edges**:
   - **Border**
     ```js
     6 + effect("Jitter Intensity")("Slider") * 0.45
     ```
   - **Evolution**
     ```js
     posterizeTime(effect("Boil FPS")("Slider"));
     seedRandom(2, true);
     random(0, 360)
     ```

   `posterizeTime()` freezes the expression between boil frames and
   `seedRandom(..., true)` re-rolls a new pose each boil frame — a perfect
   random boil with no keyframes.

6. Open **Window ▸ Essential Graphics**, pick the `HandDrawnBoil` comp,
   drag in the two sliders from `BOIL`, and confirm their displayed names
   are `Jitter Intensity` and `Boil FPS`.

7. Click **Export Motion Graphics Template…** → save as
   `HandDrawnBoil.mogrt` → put the file in this `assets/` folder.

## Usage from the panel

Select a clip in Premiere (make sure an empty video track exists above it)
and click **Insert Boil MOGRT (AE look)**. The script inserts the .mogrt on
the track above via `sequence.importMGT()`, aligns it to the clip, and sets
both exposed sliders from the panel controls.
