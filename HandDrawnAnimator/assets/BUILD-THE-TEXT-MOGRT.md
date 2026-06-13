# Building `HandDrawnText.mogrt` (one-time)

The **TEXT HERE** field can animate an existing clip you've selected, **or**
spawn a fresh text graphic when nothing is selected. The "spawn" path needs
`assets/HandDrawnText.mogrt`, because ExtendScript has no API to build a text
layer from scratch — a Motion Graphics Template with an exposed Source Text
parameter is the only reliable route.

> You do **not** need this file to use the plugin. If you select an existing
> text/graphic clip in the timeline first, **ANIMATE** applies the hand-drawn
> boil + your in/out transition directly to it. The MOGRT is only required if
> you want to type text and have the panel create the layer for you.

## Recipe (≈2 minutes)

You can build it in **Premiere Pro** itself (no After Effects needed):

1. With the Type tool, click on the Program Monitor and type any placeholder
   (e.g. `TEXT`). Style the font/size/color however you like the default look.
2. Select that text clip. Open **Window ▸ Essential Graphics ▸ Edit**.
3. In the Essential Graphics panel you'll see your text layer. Drag the
   **Source Text** property into the upper "exposed controls" area.
4. **Rename the exposed control to exactly `Text`** (double-click its name).
   The backend looks for a parameter named `Text` (it also tries `Source
   Text`, `Your Text`, `Title`, or the first param containing "text").
5. Click **Export Motion Graphics Template…**, save it as
   `HandDrawnText.mogrt`, and drop the file into this `assets/` folder.

## How the panel uses it

When you type in **TEXT HERE** with nothing selected and hit **ANIMATE**:

1. `sequence.importMGT()` drops the MOGRT on the **top existing video track**
   at the playhead — so make sure that track is free at the playhead.
2. `item.getMGTComponent().properties.getParamForDisplayName("Text")` sets
   your typed string.
3. The boil engine adds Turbulent Displace / Wave Warp + Roughen Edges +
   Posterize Time, and keyframes the **Motion ▸ Position** / **Opacity**
   in-out transition you chose on the D-pads.

If the panel reports *"no text parameter exposed in this MOGRT"*, re-check
step 4 — the exposed control must be named `Text`.
