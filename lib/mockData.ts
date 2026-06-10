/**
 * ThroughLenses670 — media manifest.
 *
 * Drop your real files into:
 *   /public/assets/photography/          → photos (.jpg / .webp)
 *   /public/assets/videos/dj-sets/       → horizontal 16:9 videos (.mp4) + poster .jpg
 *   /public/assets/videos/aftermovies/   → vertical 9:16 reels (.mp4) + poster .jpg
 *
 * Keep the filenames below, or edit the entries to match your own files.
 * Placeholder frames currently live at these exact paths so the site renders
 * out of the box — overwriting them with real media is all that's needed.
 */

export type Photo = {
  id: string;
  src: string;
  alt: string;
  event: string;
  location: string;
  year: string;
  /** Aspect ratio (w / h) used for the asymmetric masonry layout. */
  ratio: number;
};

export type Video = {
  id: string;
  src: string;
  poster: string;
  title: string;
  event: string;
  year: string;
  /** Card orientation in the vault. */
  format: "16:9" | "9:16";
  duration?: string;
};

const PHOTO_DIR = "/assets/photography";
const DJSET_DIR = "/assets/videos/dj-sets";
const AFTERMOVIE_DIR = "/assets/videos/aftermovies";

export const photos: Photo[] = [
  { id: "p01", src: `${PHOTO_DIR}/photo-01.jpg`, alt: "Strobe burst over the main floor", event: "HOCUS POCUS", location: "Miami", year: "2025", ratio: 2 / 3 },
  { id: "p02", src: `${PHOTO_DIR}/photo-02.jpg`, alt: "DJ silhouette against white strobes", event: "AEROTECHNO FESTIVAL", location: "Medellín", year: "2025", ratio: 3 / 2 },
  { id: "p03", src: `${PHOTO_DIR}/photo-03.jpg`, alt: "Crowd hands in smoke", event: "LA SOLAR", location: "Medellín", year: "2025", ratio: 4 / 5 },
  { id: "p04", src: `${PHOTO_DIR}/photo-04.jpg`, alt: "Laser grid across the main stage", event: "AEROTECHNO FESTIVAL", location: "Medellín", year: "2024", ratio: 16 / 9 },
  { id: "p05", src: `${PHOTO_DIR}/photo-05.jpg`, alt: "Close-up of CDJs mid-set", event: "HOCUS POCUS", location: "Miami", year: "2025", ratio: 1 },
  { id: "p06", src: `${PHOTO_DIR}/photo-06.jpg`, alt: "Backlit dancer in fog", event: "LA SOLAR", location: "Medellín", year: "2024", ratio: 2 / 3 },
  { id: "p07", src: `${PHOTO_DIR}/photo-07.jpg`, alt: "Front row pressed against the rail", event: "CLUB SESSION", location: "Medellín", year: "2024", ratio: 3 / 2 },
  { id: "p08", src: `${PHOTO_DIR}/photo-08.jpg`, alt: "Single beam cutting the dark", event: "AEROTECHNO FESTIVAL", location: "Medellín", year: "2024", ratio: 4 / 5 },
  { id: "p09", src: `${PHOTO_DIR}/photo-09.jpg`, alt: "Aerial drone shot of the festival grounds", event: "LA SOLAR", location: "Medellín", year: "2025", ratio: 16 / 9 },
  { id: "p10", src: `${PHOTO_DIR}/photo-10.jpg`, alt: "Crowd surge under red wash", event: "HOCUS POCUS", location: "Miami", year: "2025", ratio: 2 / 3 },
  { id: "p11", src: `${PHOTO_DIR}/photo-11.jpg`, alt: "Monochrome portrait of the headliner", event: "AEROTECHNO FESTIVAL", location: "Medellín", year: "2025", ratio: 1 },
  { id: "p12", src: `${PHOTO_DIR}/photo-12.jpg`, alt: "Last drop, full house lights", event: "CLUB SESSION", location: "Medellín", year: "2025", ratio: 3 / 2 },
];

/**
 * One vault, two orientations: 16:9 cinematic cuts and 9:16 reels together.
 * Artist ↔ event pairings are provisional — correct them to match reality.
 */
export const videos: Video[] = [
  { id: "v01", src: `${DJSET_DIR}/set-01.mp4`, poster: `${DJSET_DIR}/set-01-poster.jpg`, title: "999999999", event: "HOCUS POCUS — MIAMI", year: "2025", format: "16:9", duration: "LIVE CUT" },
  { id: "v02", src: `${AFTERMOVIE_DIR}/aftermovie-01.mp4`, poster: `${AFTERMOVIE_DIR}/aftermovie-01-poster.jpg`, title: "HOCUS POCUS — OFFICIAL RECAP", event: "MIAMI", year: "2025", format: "9:16" },
  { id: "v03", src: `${DJSET_DIR}/set-02.mp4`, poster: `${DJSET_DIR}/set-02-poster.jpg`, title: "HENRIQUE CAMACHO", event: "AEROTECHNO FESTIVAL — MEDELLÍN", year: "2025", format: "16:9", duration: "LIVE CUT" },
  { id: "v04", src: `${AFTERMOVIE_DIR}/aftermovie-02.mp4`, poster: `${AFTERMOVIE_DIR}/aftermovie-02-poster.jpg`, title: "AEROTECHNO — AFTERMOVIE", event: "MEDELLÍN", year: "2025", format: "9:16" },
  { id: "v05", src: `${DJSET_DIR}/set-03.mp4`, poster: `${DJSET_DIR}/set-03-poster.jpg`, title: "MIJA", event: "HOCUS POCUS — MIAMI", year: "2025", format: "16:9", duration: "LIVE CUT" },
  { id: "v06", src: `${AFTERMOVIE_DIR}/aftermovie-03.mp4`, poster: `${AFTERMOVIE_DIR}/aftermovie-03-poster.jpg`, title: "LA SOLAR — DRONE CUT", event: "MEDELLÍN", year: "2025", format: "9:16" },
  { id: "v07", src: `${DJSET_DIR}/set-04.mp4`, poster: `${DJSET_DIR}/set-04-poster.jpg`, title: "SHIMZA", event: "LA SOLAR — MEDELLÍN", year: "2025", format: "16:9", duration: "LIVE CUT" },
  { id: "v08", src: `${AFTERMOVIE_DIR}/aftermovie-04.mp4`, poster: `${AFTERMOVIE_DIR}/aftermovie-04-poster.jpg`, title: "AND — CLUB SESSION", event: "MEDELLÍN", year: "2024", format: "9:16" },
];

export const credits = {
  artists: ["999999999", "AnD", "HENRIQUE CAMACHO", "MIJA", "SHIMZA"],
  festivals: [
    "HOCUS POCUS — MIAMI",
    "AEROTECHNO FESTIVAL — MEDELLÍN",
    "LA SOLAR — MEDELLÍN",
  ],
};

export const gear = [
  { item: "SONY A7 IV", role: "BODY / PRIMARY" },
  { item: "SONY A7S III", role: "BODY / LOW LIGHT VIDEO" },
  { item: "SONY 24-70MM F2.8 GM II", role: "GLASS / WORKHORSE" },
  { item: "SONY 35MM F1.4 GM", role: "GLASS / PIT + DARK ROOMS" },
  { item: "DJI MAVIC 3 PRO", role: "DRONE / AERIAL OPS" },
  { item: "DJI RS 4", role: "GIMBAL / STABILIZED MOTION" },
];

export const contact = {
  email: "Thrulenses670@gmail.com",
  instagram: "thrulenses670",
  instagramUrl: "https://www.instagram.com/thrulenses670/",
};
