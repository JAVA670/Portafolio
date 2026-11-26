# Thrulenses Studio

The studio website — events, portraits and celebrations. A separate Next.js
app from the concert gallery at the repo root; it reuses the same chrome
THRULENSES670 logo.

## Add a shoot

1. Upload the photos to `studio/photos/<shoot-name>/` (and any videos to
   `studio/videos/`) — see the READMEs in those folders.
2. From `studio/`, run `npm run import-media`. Photos are resized for the
   web (GPS/camera metadata removed) into `public/media/<shoot-name>/`;
   videos get a web cut, a silent preview loop and a poster. A manifest of
   every file with its real aspect ratio is printed.
3. Add (or fill in) the shoot in `lib/sessions.ts` with those paths and
   ratios. The home page, the 3D work strip and `/work/<shoot-name>` all
   pick it up automatically.

## Run locally

```bash
cd studio
npm install
npm run dev      # http://localhost:3000
```

## Deploy (Vercel)

Create a **second** Vercel project from this same GitHub repo and set
**Root Directory** to `studio`. Everything else is auto-detected (Next.js).
Every push to `main` then deploys both sites: the gallery (repo root) and
the studio (this folder). Add a custom domain under the project's Domains
settings whenever you have one.

Optional environment variable: `NEXT_PUBLIC_GALLERY_URL` — the address of
the concert gallery, used by the footer and the Live Music page.

## Brand files

`public/brand/` holds the chrome wordmark (from the gallery), the ink
version for light pages, the sigil and the share image. Regenerate the
derived ones with `node scripts/make-brand.mjs`.
