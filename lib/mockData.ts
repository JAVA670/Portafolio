/**
 * ThruLenses670 — media manifest (real assets).
 *
 * Photos live in /public/assets/photography/, videos + their poster frames in
 * /public/assets/videos/aftermovies/. Files were renamed to clean slugs and
 * optimized by scripts/process-media.mjs during import.
 */

export type Photo = {
  id: string;
  src: string;
  alt: string;
  /** Short artistic line shown on hover and in the lightbox. */
  caption: string;
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
  caption: string,
  alt: string
): Photo => ({
  id,
  src: `${PHOTO_DIR}/${slug}.jpg`,
  alt,
  caption,
  ratio,
});

/** Ordered to interleave verticals and horizontals for masonry rhythm. */
export const photos: Photo[] = [
  p("p01", "aero-01", 0.5627, "STROBE BAPTISM", "Strobe burst over the main floor"),
  p("p02", "solar-01", 1.5, "THE FLOOR BREATHES", "Wide shot of the festival crowd"),
  p("p03", "hocus-01", 0.5627, "GHOST IN THE SMOKE", "DJ silhouette in the smoke"),
  p("p04", "diablo-03", 1.5, "THE EVIL UNDER FIRE", "Red neon over the dancefloor"),
  p("p05", "urban-01", 0.6667, "HANDS TO THE CEILING", "Crowd hands in the lights"),
  p("p06", "aero-07", 1.5, "LASER LITURGY", "Main stage laser grid"),
  p("p07", "genesis-01", 0.6667, "BODY ELECTRIC", "Backlit dancer in fog"),
  p("p08", "diablo-04", 1.705, "CAGED HEAT", "Caged booth under red wash"),
  p("p09", "maluna-01", 0.5627, "ONE BEAM TO CUT THE DARK", "Single beam cutting the dark"),
  p("p10", "aero-08", 1.3034, "PRESSURE AT THE RAIL", "Crowd surge at the rail"),
  p("p11", "solar-02", 0.6667, "FALLOUT IN COLOR", "Confetti drop at the headline set"),
  p("p12", "diablo-08", 1.3427, "THROUGH THE FENCE", "Floor view through the fence"),
  p("p13", "hocus-02", 0.5627, "FROZEN MID-RIOT", "Strobe freeze over the pit"),
  p("p14", "aero-09", 1.5, "FIRE DISCIPLINE", "Stage-wide pyro hit"),
  p("p15", "urban-02", 0.6667, "FRONT ROW FAITH", "Portrait in the front row"),
  p("p16", "diablo-06", 1.4568, "SMOKE EATS THE LIGHT", "Smoke column over the decks"),
  p("p17", "aero-10", 0.6667, "MIDNIGHT MACHINERY", "Vertical frame of the main stage"),
  p("p18", "solar-03", 0.6667, "GOLDEN HOUR, LOUD", "Golden hour over the crowd"),
  p("p19", "diablo-02", 0.9806, "LATEX COMMUNION", "Latex figure under the Fiesta Del Diablo neon"),
  p("p20", "hocus-03", 0.5627, "TUNNEL VISION", "Tunnel of light over the floor"),
  p("p21", "aero-11", 1.5, "VOID WORSHIP", "Full venue from the back wall"),
  p("p22", "genesis-02", 0.6667, "WHITE NOISE HALO", "Closing set under white strobes"),
  p("p23", "diablo-05", 0.9227, "RED RITUAL", "Portrait in red haze"),
  p("p24", "solar-04", 0.6667, "CROWD AS ONE", "Crowd from the photographer pit"),
  p("p25", "hocus-04", 0.5627, "THE LAST DROP", "Last drop, full house lights"),
  p("p26", "urban-03", 0.6667, "ZERO GRAVITY FLOOR", "Stage dive moment"),
  p("p27", "aero-02", 0.5627, "RAW SIGNAL", "CDJs close-up mid-set"),
  p("p28", "diablo-01", 0.5627, "ANTENNAS TO HEAVEN", "Vertical beam through the smoke"),
  p("p29", "solar-05", 0.7728, "PHANTOM FRAME", "Headliner portrait monochrome"),
  p("p30", "aero-03", 0.5627, "BASS CATHEDRAL", "Hands up at the drop"),
  p("p31", "urban-04", 0.6667, "BURNT FREQUENCIES", "Side stage long exposure"),
  p("p32", "aero-04", 0.5627, "HEAT SIGNATURE", "Floor level wide angle"),
  p("p33", "club-01", 0.6667, "4AM CONFESSIONS", "Intimate club booth"),
  p("p34", "aero-05", 0.5627, "STATIC BLOOM", "Strobes through the truss"),
  p("p35", "diablo-07", 0.5627, "DEVIL'S CONGREGATION", "Devil party crowd vertical"),
  p("p36", "aero-06", 0.5627, "CLOSING CREDITS", "Closing frame of the night"),
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
  v("v01", "thrulenses-reel", 1.7778, "16:9", "THRULENSES670", "OFFICIAL SHOWREEL", "2025"),
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
  { item: "SONY A7 V", role: "BODY / PRIMARY" },
  { item: "SIGMA 12-24MM F2.8", role: "GLASS / ULTRA WIDE" },
  { item: "ZEISS 50MM F1.4", role: "GLASS / LOW LIGHT + PORTRAITS" },
  { item: "RODE MICROPHONE", role: "AUDIO / LIVE SOUND" },
  { item: "DJI MINI 4 PRO", role: "DRONE / AERIAL OPS" },
];

export const contact = {
  email: "Thrulenses670@gmail.com",
  phone: "239-777-1732",
  phoneHref: "tel:+12397771732",
  instagram: "thrulenses670",
  instagramUrl: "https://www.instagram.com/thrulenses670/",
};
