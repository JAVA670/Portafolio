# THRULENSES670

Immersive digital portfolio for hard techno concert photography & videography.
Next.js (App Router, TypeScript) · Tailwind CSS v4 · Framer Motion · Lenis.

## Luxury hospitality edition — `index.html` (standalone, no build)

`index.html` is a second, completely separate portfolio: a single-file,
dark-editorial site for luxury hospitality / real-estate videography
(Tailwind + GSAP ScrollTrigger via CDN). No build step — open the file in a
browser, or publish it with GitHub Pages (see below). It is independent of the
Next.js app in the rest of this repo.

### Put it online (GitHub Pages — free, public URL)

1. Push this branch to GitHub (already done).
2. On GitHub: **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick this branch (`claude/luxury-videographer-portfolio-dazbxm`) — or `main`
   after you merge — set the folder to **/ (root)**, and click **Save**.
5. Wait ~1 minute. Your live URL will be:
   **https://java670.github.io/portafolio/**

Because `index.html` sits at the repo root, Pages serves it automatically.
(`.nojekyll` tells GitHub to serve the file as-is.)

### Add your own footage & videos

All media lives in two easy-to-find spots inside `index.html`, each marked
with a big `▓ YOUR FOOTAGE` comment:

1. **Hero background film** — the `<video><source src="…">` near the top.
2. **Selected Work grid** — each `<article class="work-card">` has:
   - `data-video="…"` → the film that plays in the pop-up player
   - `<img class="card-img" src="…">` → the thumbnail still
   - `data-title` / `data-meta` → the caption text

The simplest workflow: drop your `.mp4` and `.jpg` files into the **`assets/`**
folder (see `assets/README.md` for suggested names), then point each `src` /
`data-video` at e.g. `assets/film-01.mp4`. Add or delete `<article>` blocks to
change how many projects appear. Update the contact email in the footer
`mailto:` links.

Until you swap them, the page shows tasteful placeholder footage/stills
hot-linked from Pexels &amp; Unsplash, and every thumbnail has a designed
gradient fallback if an image ever fails to load.

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
