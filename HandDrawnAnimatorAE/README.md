# Hand-Drawn Animator — After Effects (CEP panel)

The same cream "Hand Drawn ANIMATOR" panel UI as the Premiere version, but it
runs **in After Effects** and drives AE's full power: it **creates** the text,
sets a real **hand-drawn font**, adds **texture + styles**, **morphs** word to
word, and syncs to your **voice via `.srt`** — then you render or dynamic-link
the comp into Premiere.

```
HandDrawnAnimatorAE/
├── CSXS/manifest.xml   CEP manifest (Host = AEFT, After Effects 2022+)
├── .debug              remote-debug port (localhost:8089)
├── index.html          cream hardware-style panel UI
├── css/style.css       styling (pure CSS/SVG)
├── js/main.js          collects controls → evalScript bridge
├── lib/CSInterface.js  CEP bridge
├── jsx/AE_Host.jsx     ExtendScript backend (builds the animation)
└── assets/sample.srt   demo subtitles to test voice sync
```

## Install (developer mode)

1. **Enable unsigned extensions** (CEP `PlayerDebugMode` — shared with Premiere):
   - **Windows** (`cmd`): `for %v in (9 10 11 12) do reg add HKCU\Software\Adobe\CSXS.%v /v PlayerDebugMode /t REG_SZ /d 1 /f`
   - **macOS** (Terminal, then restart AE): `for v in 9 10 11 12; do defaults write com.adobe.CSXS.$v PlayerDebugMode 1; done; killall cfprefsd`
2. **Copy the `HandDrawnAnimatorAE` folder** into the CEP extensions dir:
   - Windows: `%APPDATA%\Adobe\CEP\extensions\HandDrawnAnimatorAE`
   - macOS: `~/Library/Application Support/Adobe/CEP/extensions/HandDrawnAnimatorAE`
3. In After Effects, also enable **Preferences ▸ Scripting & Expressions ▸
   "Allow Scripts to Write Files and Access Network"** (for the boil expressions).
4. Restart AE → **Window ▸ Extensions ▸ Hand-Drawn Animator**.

## Use it

1. Open or create a project (the panel builds a new comp).
2. **Install a hand-drawn font first** — the painted texture comes from the
   font. Free: Permanent Marker, Bangers, Anton, Caveat, Patrick Hand.
3. Type text (use `/` or new lines to mark sentences), **or** click
   **Load .srt…** and tick *Use subtitle timing* to sync to your voice.
   - Get an SRT free from Premiere: **Window ▸ Text ▸ Transcribe → Create
     Captions → Export `.srt`**. Try `assets/sample.srt` to see it instantly.
4. Pick font / style / Transition In / Out / speed / split, tweak the
   checkboxes (Morph, Outline, Shadow, Hand jitter), or hit a **Quick preset**.
5. Click **ANIMATE**. A finished comp is created — render it or dynamic-link it
   into Premiere.

## Controls

- **Text / Split** — type and chunk by word / N-words / sentence / line.
- **Voice sync (.srt)** — Phrase or Word timing locked to your speech.
- **Font / Size / Color** — real fonts (auto-resolved to PostScript names).
- **Style** — Hand-Drawn, Grunge, Marker, Film, VHS, Paper, Neon, Clean.
- **Transition In/Out** — Fade, Slide ×4, Pop, Bounce, Scale, Spin, Blur, Rise, Hard.
- **Speed / Smoothness** — boil intensity + eased-keyframe smoothness.
- **Position** — Center / Lower third / Top. **Outline / Shadow** — readability.
- **Quick presets** — TikTok, Hand-Drawn, Clean Sub, Kinetic.

Debug at **http://localhost:8089**. Errors are returned to the panel's status
line and log area.
