# THROUGHLENSES670

Immersive digital portfolio for hard techno concert photography & videography.
Next.js (App Router, TypeScript) · Tailwind CSS v4 · Framer Motion · Lenis.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Drop in your media

The site reads everything from `lib/mockData.ts`, which points at:

| Type | Directory | Naming |
| --- | --- | --- |
| Photos | `public/assets/photography/` | `photo-01.jpg` … `photo-12.jpg` |
| DJ sets (16:9) | `public/assets/videos/dj-sets/` | `set-01.mp4` + `set-01-poster.jpg` … |
| Aftermovies (9:16) | `public/assets/videos/aftermovies/` | `aftermovie-01.mp4` + `aftermovie-01-poster.jpg` … |

Two ways to go live with real media:

1. **Overwrite** the placeholder files using the same names — no code changes.
2. **Edit `lib/mockData.ts`** to add/remove entries, change filenames, captions,
   events, locations and aspect ratios (`ratio` drives the masonry layout).

Placeholder frames were generated with `node scripts/generate-placeholders.mjs`
(re-run it anytime to regenerate).

For scroll performance, export videos as H.264 MP4, ~8–12 Mbps for 16:9 sets
and ~5–8 Mbps for 9:16 reels. They autoplay muted and lazy-load only when
scrolled into view.

## Where things live

- `app/` — root layout (fonts, metadata, grain overlay) and the single page
- `components/sections/` — Hero, Gallery (+ Lightbox), DJSets, Aftermovies, Contact
- `components/fx/` — `BlurReveal` (blur→focus scroll reveal), section headers
- `components/ui/` — `SmartImage` (graceful fallback), `AutoVideo` (in-view autoplay)
- `components/providers/` — Lenis smooth scroll, EN/ES language context
- `lib/mockData.ts` — media manifest, gear list, contact info
- `lib/i18n.ts` — English/Spanish copy

Booking form submits via `mailto:` to the address in `lib/mockData.ts`
(`contact.email`) — change it there.
