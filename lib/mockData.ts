/**
 * ThroughLenses670 — media manifest (real assets).
 *
 * Photos live in /public/assets/photography/, videos + their poster frames in
 * /public/assets/videos/aftermovies/. Files were renamed to clean slugs and
 * optimized by scripts/process-media.mjs during import.
 *
 * Event labels per photo series are provisional (inferred from filenames) —
 * edit the entries below to correct any attribution.
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
  /** Aspect ratio (w / h) of the source file. */
  ratio: number;
  /** Format badge shown on the card. */
  label: string;
};

const PHOTO_DIR = "/assets/photography";
const VIDEO_DIR = "/assets/videos/aftermovies";

const p = (
  id: string,
  slug: string,
  ratio: number,
  event: string,
  location: string,
  year: string,
  alt: string
): Photo => ({ id, src: `${PHOTO_DIR}/${slug}.jpg`, alt, event, location, year, ratio });

/** Ordered to interleave verticals and horizontals for masonry rhythm. */
export const photos: Photo[] = [
  p("p01", "aero-01", 0.5627, "AEROTECHNO FESTIVAL", "Medellín", "2025", "Strobe burst over the main floor"),
  p("p02", "solar-01", 1.5, "LA SOLAR", "Medellín", "2025", "Wide shot of the festival crowd"),
  p("p03", "hocus-01", 0.5627, "HOCUS POCUS", "Miami", "2025", "DJ silhouette in the smoke"),
  p("p04", "diablo-03", 1.5, "FIESTA DEL DIABLO", "Medellín", "2025", "Red neon over the dancefloor"),
  p("p05", "urban-01", 0.6667, "URBAN FEST", "Medellín", "2025", "Crowd hands in the lights"),
  p("p06", "aero-07", 1.5, "AEROTECHNO FESTIVAL", "Medellín", "2025", "Main stage laser grid"),
  p("p07", "genesis-01", 0.6667, "GENESIS", "Medellín", "2025", "Backlit dancer in fog"),
  p("p08", "diablo-04", 1.705, "FIESTA DEL DIABLO", "Medellín", "2025", "Caged booth under red wash"),
  p("p09", "maluna-01", 0.5627, "MALUNA FEST", "Medellín", "2025", "Single beam cutting the dark"),
  p("p10", "aero-08", 1.3034, "AEROTECHNO FESTIVAL", "Medellín", "2025", "Crowd surge at the rail"),
  p("p11", "solar-02", 0.6667, "LA SOLAR", "Medellín", "2025", "Confetti drop at the headline set"),
  p("p12", "diablo-08", 1.3427, "FIESTA DEL DIABLO", "Medellín", "2025", "Floor view through the fence"),
  p("p13", "hocus-02", 0.5627, "HOCUS POCUS", "Miami", "2025", "Strobe freeze over the pit"),
  p("p14", "aero-09", 1.5, "AEROTECHNO FESTIVAL", "Medellín", "2025", "Stage-wide pyro hit"),
  p("p15", "urban-02", 0.6667, "URBAN FEST", "Medellín", "2025", "Portrait in the front row"),
  p("p16", "diablo-06", 1.4568, "FIESTA DEL DIABLO", "Medellín", "2025", "Smoke column over the decks"),
  p("p17", "aero-10", 0.6667, "AEROTECHNO FESTIVAL", "Medellín", "2025", "Vertical frame of the main stage"),
  p("p18", "solar-03", 0.6667, "LA SOLAR", "Medellín", "2025", "Golden hour over the crowd"),
  p("p19", "diablo-02", 0.9806, "FIESTA DEL DIABLO", "Medellín", "2025", "Latex figure under the Fiesta Del Diablo neon"),
  p("p20", "hocus-03", 0.5627, "HOCUS POCUS", "Miami", "2025", "Tunnel of light over the floor"),
  p("p21", "aero-11", 1.5, "AEROTECHNO FESTIVAL", "Medellín", "2025", "Full venue from the back wall"),
  p("p22", "genesis-02", 0.6667, "GENESIS", "Medellín", "2025", "Closing set under white strobes"),
  p("p23", "diablo-05", 0.9227, "FIESTA DEL DIABLO", "Medellín", "2025", "Portrait in red haze"),
  p("p24", "solar-04", 0.6667, "LA SOLAR", "Medellín", "2025", "Crowd from the photographer pit"),
  p("p25", "hocus-04", 0.5627, "HOCUS POCUS", "Miami", "2025", "Last drop, full house lights"),
  p("p26", "urban-03", 0.6667, "URBAN FEST", "Medellín", "2025", "Stage dive moment"),
  p("p27", "aero-02", 0.5627, "AEROTECHNO FESTIVAL", "Medellín", "2025", "CDJs close-up mid-set"),
  p("p28", "diablo-01", 0.5627, "FIESTA DEL DIABLO", "Medellín", "2025", "Vertical beam through the smoke"),
  p("p29", "solar-05", 0.7728, "LA SOLAR", "Medellín", "2025", "Headliner portrait monochrome"),
  p("p30", "aero-03", 0.5627, "AEROTECHNO FESTIVAL", "Medellín", "2025", "Hands up at the drop"),
  p("p31", "urban-04", 0.6667, "URBAN FEST", "Medellín", "2025", "Side stage long exposure"),
  p("p32", "aero-04", 0.5627, "AEROTECHNO FESTIVAL", "Medellín", "2025", "Floor level wide angle"),
  p("p33", "club-01", 0.6667, "CLUB SESSION", "Medellín", "2024", "Intimate club booth"),
  p("p34", "aero-05", 0.5627, "AEROTECHNO FESTIVAL", "Medellín", "2025", "Strobes through the truss"),
  p("p35", "diablo-07", 0.5627, "FIESTA DEL DIABLO", "Medellín", "2025", "Devil party crowd vertical"),
  p("p36", "aero-06", 0.5627, "AEROTECHNO FESTIVAL", "Medellín", "2025", "Closing frame of the night"),
];

const v = (
  id: string,
  slug: string,
  ratio: number,
  label: string,
  title: string,
  event: string,
  year: string
): Video => ({
  id,
  src: `${VIDEO_DIR}/${slug}.mp4`,
  poster: `${VIDEO_DIR}/${slug}-poster.jpg`,
  title,
  event,
  year,
  ratio,
  label,
});

export const videos: Video[] = [
  v("v01", "thrulenses-reel", 1.7778, "16:9", "THROUGHLENSES670", "OFFICIAL SHOWREEL", "2025"),
  v("v02", "lilith", 1, "1:1", "LILITH", "MEDELLÍN", "2025"),
  v("v03", "aerotechno-fest", 1.5, "3:2", "AEROTECHNO FESTIVAL", "MEDELLÍN — AFTERMOVIE", "2025"),
  v("v04", "fiesta-del-diablo", 1.7778, "16:9", "FIESTA DEL DIABLO", "MEDELLÍN — AFTERMOVIE", "2025"),
  v("v05", "mija", 1.5, "3:2", "MIJA", "LIVE SET", "2025"),
  v("v06", "urban-fest-2025", 1.7778, "16:9", "URBAN FEST", "MEDELLÍN — AFTERMOVIE", "2025"),
  v("v07", "genesis-aftermovie", 1.7778, "16:9", "GENESIS", "MEDELLÍN — AFTERMOVIE", "2025"),
  v("v08", "maluna-fest", 1.7778, "16:9", "MALUNA FEST", "MEDELLÍN — AFTERMOVIE", "2025"),
];

export const credits = {
  artists: ["999999999", "AnD", "HENRIQUE CAMACHO", "MIJA", "SHIMZA"],
  festivals: [
    "HOCUS POCUS — MIAMI",
    "AEROTECHNO FESTIVAL — MEDELLÍN",
    "LA SOLAR — MEDELLÍN",
    "FIESTA DEL DIABLO — MEDELLÍN",
    "URBAN FEST — MEDELLÍN",
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
