/**
 * ThroughLenses670 — media manifest.
 *
 * Drop your real files into:
 *   /public/assets/photography/          → photos (.jpg / .webp)
 *   /public/assets/videos/dj-sets/       → horizontal 16:9 sets (.mp4) + poster .jpg
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

export type DJSetVideo = {
  id: string;
  src: string;
  poster: string;
  artist: string;
  event: string;
  location: string;
  year: string;
  duration: string;
};

export type Aftermovie = {
  id: string;
  src: string;
  poster: string;
  title: string;
  event: string;
  year: string;
};

const PHOTO_DIR = "/assets/photography";
const DJSET_DIR = "/assets/videos/dj-sets";
const AFTERMOVIE_DIR = "/assets/videos/aftermovies";

export const photos: Photo[] = [
  { id: "p01", src: `${PHOTO_DIR}/photo-01.jpg`, alt: "Strobe burst over the main floor", event: "VOID FREQUENCY", location: "Warehouse 12, Bogotá", year: "2025", ratio: 2 / 3 },
  { id: "p02", src: `${PHOTO_DIR}/photo-02.jpg`, alt: "DJ silhouette against white strobes", event: "INDUSTRIAL RITES", location: "La Fábrica", year: "2025", ratio: 3 / 2 },
  { id: "p03", src: `${PHOTO_DIR}/photo-03.jpg`, alt: "Crowd hands in smoke", event: "VOID FREQUENCY", location: "Warehouse 12, Bogotá", year: "2025", ratio: 4 / 5 },
  { id: "p04", src: `${PHOTO_DIR}/photo-04.jpg`, alt: "Laser grid across the warehouse", event: "BLACKOUT SERIES 04", location: "Sector Norte", year: "2024", ratio: 16 / 9 },
  { id: "p05", src: `${PHOTO_DIR}/photo-05.jpg`, alt: "Close-up of CDJs mid-set", event: "INDUSTRIAL RITES", location: "La Fábrica", year: "2025", ratio: 1 },
  { id: "p06", src: `${PHOTO_DIR}/photo-06.jpg`, alt: "Backlit dancer in fog", event: "BLACKOUT SERIES 04", location: "Sector Norte", year: "2024", ratio: 2 / 3 },
  { id: "p07", src: `${PHOTO_DIR}/photo-07.jpg`, alt: "Front row pressed against the rail", event: "HARD SIGNAL", location: "Club Subsuelo", year: "2024", ratio: 3 / 2 },
  { id: "p08", src: `${PHOTO_DIR}/photo-08.jpg`, alt: "Single beam cutting the dark", event: "HARD SIGNAL", location: "Club Subsuelo", year: "2024", ratio: 4 / 5 },
  { id: "p09", src: `${PHOTO_DIR}/photo-09.jpg`, alt: "Aerial drone shot of the venue", event: "OPEN AIR 670", location: "Outdoor Stage", year: "2025", ratio: 16 / 9 },
  { id: "p10", src: `${PHOTO_DIR}/photo-10.jpg`, alt: "Crowd surge under red wash", event: "OPEN AIR 670", location: "Outdoor Stage", year: "2025", ratio: 2 / 3 },
  { id: "p11", src: `${PHOTO_DIR}/photo-11.jpg`, alt: "Monochrome portrait of the headliner", event: "VOID FREQUENCY", location: "Warehouse 12, Bogotá", year: "2025", ratio: 1 },
  { id: "p12", src: `${PHOTO_DIR}/photo-12.jpg`, alt: "Last drop, full house lights", event: "INDUSTRIAL RITES", location: "La Fábrica", year: "2025", ratio: 3 / 2 },
];

export const djSets: DJSetVideo[] = [
  { id: "s01", src: `${DJSET_DIR}/set-01.mp4`, poster: `${DJSET_DIR}/set-01-poster.jpg`, artist: "KRSCH", event: "VOID FREQUENCY", location: "Warehouse 12, Bogotá", year: "2025", duration: "62:00" },
  { id: "s02", src: `${DJSET_DIR}/set-02.mp4`, poster: `${DJSET_DIR}/set-02-poster.jpg`, artist: "DAGGER unit", event: "INDUSTRIAL RITES", location: "La Fábrica", year: "2025", duration: "90:00" },
  { id: "s03", src: `${DJSET_DIR}/set-03.mp4`, poster: `${DJSET_DIR}/set-03-poster.jpg`, artist: "VANTA", event: "BLACKOUT SERIES 04", location: "Sector Norte", year: "2024", duration: "75:00" },
  { id: "s04", src: `${DJSET_DIR}/set-04.mp4`, poster: `${DJSET_DIR}/set-04-poster.jpg`, artist: "REZISTOR", event: "HARD SIGNAL", location: "Club Subsuelo", year: "2024", duration: "60:00" },
];

export const aftermovies: Aftermovie[] = [
  { id: "a01", src: `${AFTERMOVIE_DIR}/aftermovie-01.mp4`, poster: `${AFTERMOVIE_DIR}/aftermovie-01-poster.jpg`, title: "VOID FREQUENCY — OFFICIAL AFTERMOVIE", event: "VOID FREQUENCY", year: "2025" },
  { id: "a02", src: `${AFTERMOVIE_DIR}/aftermovie-02.mp4`, poster: `${AFTERMOVIE_DIR}/aftermovie-02-poster.jpg`, title: "INDUSTRIAL RITES — RECAP REEL", event: "INDUSTRIAL RITES", year: "2025" },
  { id: "a03", src: `${AFTERMOVIE_DIR}/aftermovie-03.mp4`, poster: `${AFTERMOVIE_DIR}/aftermovie-03-poster.jpg`, title: "BLACKOUT 04 — 45 SECONDS INSIDE", event: "BLACKOUT SERIES 04", year: "2024" },
  { id: "a04", src: `${AFTERMOVIE_DIR}/aftermovie-04.mp4`, poster: `${AFTERMOVIE_DIR}/aftermovie-04-poster.jpg`, title: "OPEN AIR 670 — DRONE CUT", event: "OPEN AIR 670", year: "2025" },
];

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
