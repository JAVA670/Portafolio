# THRULENSES670

Hard techno concert photography & film — portfolio site.
Next.js (App Router, TypeScript) · Tailwind CSS v4 · Framer Motion · Lenis.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Design system

- **Type:** Anton (display, always solid white) · Archivo variable (labels at `wdth` 115, body at 100) · JetBrains Mono (metadata, 11px).
- **Colour:** `#050507` canvas, white, one electric cobalt `#0038FF` accent. Tokens live in `app/globals.css`.
- **Grid:** 12 columns, 12px gaps, 0px radius everywhere, 1px hairlines.

## Adding photos

1. Upload the files anywhere in the repo, e.g. `public/assets/photography/`.
2. Import them (EXIF-rotate, 2000px long edge, mozjpeg, clean slug names):
   ```bash
   node scripts/import-media.mjs path/to/Thrulenses-123.jpg path/to/clip.mp4
   ```
   The command prints each file's slug and real aspect ratio.
3. Add an entry to `photos` in `lib/mockData.ts` with its `chapter`
   (`inferno` · `cold` · `daylight`), `caption`, `alt` and, if the crop needs it,
   a `focus` (`"50% 0%"` keeps the top of the frame).
4. Optionally place it in that chapter's `rows`. Photos you don't place still
   appear at the end of their chapter automatically.

Optional `artist`, `venue` and `date` fields show on hover and in the viewer
only once filled in, so only add verified information.

## Swapping the hero camera

Drop a new render at `public/assets/chrome-camera-hero.png` (3/4 view) or
`public/assets/chrome-camera-front.png` (front view, used in Booking). A
transparent or black background both work. To convert a render to a clean
alpha PNG first:

```bash
node scripts/prepare-hero-render.mjs my-render.jpg public/assets/chrome-camera-hero.png
```

A looping video is also supported: set `heroRender.video` in `lib/mockData.ts`.

## Structure

- `app/` — root layout (fonts, metadata), page composition, global CSS
- `components/sections/` — Hero, Intro, Work, Index (archive), Films, Booking, Lightbox, VideoModal
- `components/work/` — chapter blocks, photo cards, text panels
- `components/hero/CameraRender.tsx` — the chrome camera slot
- `components/fx/` — preloader, cursor, reveals, section heads
- `lib/mockData.ts` — photos, chapters, films, index, contact
- `lib/i18n.ts` — English / Spanish copy
