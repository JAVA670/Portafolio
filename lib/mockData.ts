/**
 * THRULENSES670 — content manifest.
 *
 * Every caption and alt text below was written after looking at the actual
 * frame. Captions describe the mood, never an event or artist (those go in
 * the optional `artist` / `venue` / `date` fields, which render on hover
 * only once they are filled in with verified information).
 *
 * Photos are grouped into colour chapters by the light they were shot in,
 * and each chapter is art-directed row by row (see `chapters`).
 */

export type ChapterId = "edc" | "inferno" | "cold";

export type Photo = {
  id: string;
  src: string;
  /** Descriptive alt text (what is literally in the frame). */
  alt: string;
  /** Short artistic line shown on hover and in the viewer. */
  caption: string;
  /** Source aspect ratio (w / h). Cards crop to 4:5 or 16:9. */
  ratio: number;
  chapter: ChapterId;
  /** CSS object-position for the crop, e.g. "50% 0%". Defaults to center. */
  focus?: string;
  /** Verified metadata — leave undefined until confirmed. */
  artist?: string;
  venue?: string;
  date?: string;
};

export type Row =
  | { kind: "opener"; id: string }
  | { kind: "trio"; ids: [string, string, string] }
  | { kind: "wide"; id: string; side: "left" | "right" }
  | { kind: "duo"; ids: [string, string] }
  | { kind: "solo"; id: string };

export type Chapter = {
  id: ChapterId;
  numeral: string;
  /** Palette swatches sampled from the chapter's frames. */
  swatches: [string, string, string];
  rows: Row[];
};

const DIR = "/assets/photography";

const p = (
  id: string,
  slug: string,
  ratio: number,
  chapter: ChapterId,
  caption: string,
  alt: string,
  focus?: string
): Photo => ({ id, src: `${DIR}/${slug}.jpg`, ratio, chapter, caption, alt, focus });

export const photos: Photo[] = [
  // ── I // EDC — festival stages, giant sculpture, day and night ──
  p("p56", "edc-109", 1.5, "edc", "THE OWL OPENS ITS EYES", "Giant goggled owl-face stage glowing red, lasers fanning across the crowd"),
  p("p57", "edc-30", 0.6667, "edc", "FACE OF THE FESTIVAL", "Giant sculpted face looming over the stage canopy and the crowd below"),
  p("p58", "edc-39", 0.6667, "edc", "RED ARCHITECTURE", "Stage structure lit red from below, crowd hands raised in the foreground"),
  p("p59", "edc-89", 0.6667, "edc", "SMALL HUMAN, GIANT STAGE", "Red-haired performer on stage beneath a towering sculpted face"),

  // ── II // INFERNO — fire, pyro, red strobes, amber and magenta smoke ──
  p("p16", "diablo-06", 1.4568, "inferno", "THE EVIL UNDER FIRE", "Performer in a horned goat mask beside a burst of stage fire"),
  p("p40", "tl-051", 0.5946, "inferno", "FREEFALL IN AMBER", "Aerial performer hanging upside down in orange light beams"),
  p("p37", "tl-090", 0.6667, "edc", "DETONATION", "Pyrotechnics exploding above a giant goggled stage face"),
  p("p45", "tl670-47", 0.6667, "inferno", "THE GATES OPEN", "Symmetrical stage framed by giant orange inflatable hands"),
  p("p41", "tl670-54", 1.5, "inferno", "INFERNO STAGE", "Festival stage glowing orange through smoke, framed by an inflatable arch"),
  p("p07", "genesis-01", 0.6667, "inferno", "ORANGE ROOM TRANCE", "DJ in headphones and sunglasses inside a saturated orange room", "50% 0%"),
  p("p09", "maluna-01", 0.5627, "inferno", "THE FAN OF FIRE", "Woman in profile beside a glowing red LED fan"),
  p("p35", "diablo-07", 0.5627, "inferno", "CLOSE ENOUGH TO HEAR IT", "Close profile of a curly-haired DJ working the mixer in warm light"),
  p("p19", "diablo-02", 0.9806, "inferno", "LATEX COMMUNION", "Plastic-wrapped figure behind a chain-link fence, framed by orange neon"),
  p("p23", "diablo-05", 0.9227, "inferno", "WRAPPED AND WAITING", "Plastic-wrapped performer pressed against a chain-link fence under orange neon"),
  p("p29", "solar-05", 0.7728, "inferno", "RING OF STEEL", "Dancer in black latex with a metal ring harness, head thrown back under red light"),
  p("p04", "diablo-03", 1.5, "inferno", "INVERTED STAR", "Packed dancefloor beneath a red neon inverted star and crosses"),
  p("p20", "hocus-03", 0.5627, "inferno", "DEVIL IN NEON", "Dancer with red devil horns and sunglasses framed by red neon"),
  p("p24", "solar-04", 0.6667, "inferno", "HORNS UP", "Dancer in red devil horns grimacing mid-drop"),
  p("p28", "diablo-01", 0.5627, "inferno", "THE HORNED CONGREGATION", "Horned costumed figure towering over a shirtless dancer in red light", "50% 0%"),
  p("p08", "diablo-04", 1.705, "inferno", "SANCTUM OF NEON", "Wide view of a stage flanked by red neon crosses and a horned emblem"),
  p("p44", "tl-055", 0.668, "inferno", "RED HOOD PROTOCOL", "Hooded figure on a giant screen cut by red laser beams", "50% 0%"),
  p("p42", "tl-065", 0.8747, "edc", "THE MACHINE WATCHES", "Giant mechanical face with glowing goggles looming over the stage"),
  p("p48", "tl-063", 0.6667, "edc", "STEEL HALO", "DJ on a monumental stage under a white spotlight and red rig"),
  p("p21", "aero-11", 1.5, "inferno", "UNDER THE RED DOME", "MC crouched on stage beneath a red-lit geodesic dome, teal haze in front"),
  p("p27", "aero-02", 0.5627, "inferno", "ONE HAND FOR THE DROP", "DJ raising one arm above the decks in red light, crowd filming behind"),
  p("p30", "aero-03", 0.5627, "inferno", "BALACLAVA, RED NOISE", "Masked DJ in a black balaclava leaning over the mixer, red bokeh behind"),
  p("p33", "club-01", 0.6667, "inferno", "RED ROOM, 4AM", "DJ in a cap working the mixer, lit only by red light", "50% 10%"),
  p("p38", "tl670-171", 1.5, "inferno", "ARMS UP, NO MERCY", "DJ raising both arms over the decks under a steel truss", "50% 0%"),
  p("p11", "solar-02", 0.6667, "inferno", "INK UNDER RED", "Tattooed back of a dancer with slicked hair under red stage light"),
  p("p18", "solar-03", 0.6667, "inferno", "LATEX VISION", "Close portrait of a person in a glossy black latex hood, red and blue reflections"),
  p("p47", "tl670-58", 0.6667, "inferno", "SURGICAL MIX", "DJ focused on the mixer under magenta and red light"),
  p("p14", "aero-09", 1.5, "inferno", "MAGENTA SURGE", "Performer silhouetted in magenta and red stage beams"),
  p("p17", "aero-10", 0.6667, "inferno", "PINK SMOKE SERMON", "Hooded DJ at the controls in thick magenta smoke"),

  p("p60", "holypriest-177", 0.6667, "inferno", "PRIEST IN THE RED", "Masked DJ behind the decks under a red-lit truss"),
  p("p61", "holypriest-178", 0.6667, "inferno", "RED MASS", "Masked DJ framed by red light bars and steel truss"),
  p("p62", "holypriest-179", 0.6667, "cold", "GREEN SERMON", "Masked DJ raising both hands over the decks in green haze"),

  // ── III // COLD CIRCUIT — lasers, LED walls, blue, cyan, teal and green ──
  p("p06", "aero-07", 1.5, "cold", "OPEN-AIR, AFTER DARK", "View from behind a DJ toward a packed open-air crowd at night"),
  p("p39", "tl670-52", 0.6667, "cold", "SNOWSTORM AT 140", "DJ silhouetted against a white particle LED wall"),
  p("p36", "aero-06", 0.5627, "cold", "BALACLAVA DATASTREAM", "Masked DJ at a laptop in front of a blue LED wall"),
  p("p43", "tl670-39", 0.6667, "cold", "BRAIDED VOLTAGE", "DJ with long braids and sunglasses working the mixer in blue light"),
  p("p10", "aero-08", 1.3034, "cold", "THE DOME HOLDS", "Crowd and DJ booth beneath a blue-lit geodesic dome"),
  p("p32", "aero-04", 0.5627, "cold", "BLUE BEAM BAPTISM", "Club crowd beneath sweeping blue light beams, decks blurred in the foreground"),
  p("p15", "urban-02", 0.6667, "cold", "CROSSFIRE", "Blue laser beams crossing above a dark crowd"),
  p("p49", "tl670-121", 0.5627, "cold", "COLD HANGAR PRESSURE", "Crowd under blue and green light in a warehouse hangar"),
  p("p53", "tl-100", 0.6667, "cold", "HANGING IN THE BLUE", "Aerial performer suspended in front of a giant blue LED screen"),
  p("p46", "tl-085", 0.6667, "cold", "ALTAR OF TEAL", "Performer with a raised arm under a teal-lit stage dome"),
  p("p50", "tl-086", 0.6667, "cold", "LIGHT FROM ABOVE", "Lone performer under white beams on a domed stage"),
  p("p12", "diablo-08", 1.3427, "cold", "NEON SIGNATURE", "Shirtless tattooed DJ looking up, a red neon tube cutting across blue haze", "50% 20%"),
  p("p52", "tl-098", 0.6667, "edc", "CYAN ARCHITECTURE", "Towering stage structure wrapped in cyan LED panels at night"),
  p("p22", "genesis-02", 0.6667, "cold", "THE MASK IN BLUE", "Dancer in a painted mask reaching up through blue light"),
  p("p25", "hocus-04", 0.5627, "cold", "STUDDED SILENCE", "Close portrait of a dancer in a studded black balaclava"),
  p("p01", "aero-01", 0.5627, "cold", "PRESSED TO THE BARRIER", "Crowd pressed against the front barrier, hands up under cyan light"),
  p("p13", "hocus-02", 0.5627, "cold", "TEETH AND GOLD", "Grinning dancer in a beanie and sunglasses, friends crowding in under teal haze"),
  p("p34", "aero-05", 0.5627, "cold", "SECOND SKIN", "Dancer in a teal mesh hood bending into the music"),
  p("p02", "solar-01", 1.5, "cold", "THE FLOOR BREATHES", "High view over a dark, packed dancefloor around a lit DJ booth"),
  p("p26", "urban-03", 0.6667, "cold", "GREEN LASER LITURGY", "DJ in yellow behind the decks as green lasers slice the room"),
  p("p05", "urban-01", 0.6667, "cold", "SMOKE BREAK AT THE DECKS", "Tattooed DJ holding a cigarette, headphones around her neck, under green tube light", "50% 10%"),
  p("p31", "urban-04", 0.6667, "cold", "SMILE IN THE GREEN", "DJ with green-lit hair smiling over the mixer"),
  p("p03", "hocus-01", 0.5627, "cold", "GHOST IN THE SMOKE", "DJ bent over the decks in teal haze, a warm spotlight behind"),
  p("p51", "tl670-61", 0.6667, "cold", "THE PIT EXHALES", "Packed club crowd facing the DJ booth under purple and blue light"),

  p("p55", "tl-137", 0.6667, "edc", "SUN ON THE MACHINE", "Giant bronze goggled face stage under a clear blue afternoon sky"),
  p("p54", "tl-110", 0.6667, "edc", "DAYLIGHT SORCERY", "Costumed festival friends laughing in daylight, one in a starry witch hat", "50% 0%"),
];

// Artist credit taken from the user's own file names ("hOLYpRIEST, Thrulenses-177").
for (const photo of photos) {
  if (photo.src.includes("/holypriest-")) photo.artist = "HOLYPRIEST";
}

export const photoById = new Map(photos.map((photo) => [photo.id, photo]));

export const chapters: Chapter[] = [
  {
    id: "edc",
    numeral: "I",
    swatches: ["#ff2d3d", "#c9924f", "#3f8ff5"],
    rows: [
      { kind: "opener", id: "p56" },
      { kind: "trio", ids: ["p57", "p58", "p59"] },
      { kind: "trio", ids: ["p55", "p54", "p37"] },
      { kind: "trio", ids: ["p42", "p48", "p52"] },
    ],
  },
  {
    id: "inferno",
    numeral: "II",
    swatches: ["#ff5a14", "#e3122d", "#c2187a"],
    rows: [
      { kind: "opener", id: "p16" },
      { kind: "trio", ids: ["p40", "p60", "p45"] },
      { kind: "wide", id: "p41", side: "left" },
      { kind: "trio", ids: ["p07", "p09", "p35"] },
      { kind: "trio", ids: ["p19", "p23", "p29"] },
      { kind: "wide", id: "p04", side: "right" },
      { kind: "trio", ids: ["p20", "p24", "p28"] },
      { kind: "wide", id: "p08", side: "left" },
      { kind: "trio", ids: ["p44", "p61", "p17"] },
      { kind: "wide", id: "p21", side: "right" },
      { kind: "trio", ids: ["p27", "p30", "p33"] },
      { kind: "wide", id: "p38", side: "left" },
      { kind: "trio", ids: ["p11", "p18", "p47"] },
      { kind: "wide", id: "p14", side: "right" },
    ],
  },
  {
    id: "cold",
    numeral: "III",
    swatches: ["#21d4fd", "#1f5bff", "#19c37d"],
    rows: [
      { kind: "opener", id: "p06" },
      { kind: "trio", ids: ["p39", "p36", "p43"] },
      { kind: "wide", id: "p10", side: "left" },
      { kind: "trio", ids: ["p32", "p15", "p49"] },
      { kind: "trio", ids: ["p53", "p46", "p50"] },
      { kind: "wide", id: "p12", side: "right" },
      { kind: "trio", ids: ["p62", "p22", "p25"] },
      { kind: "trio", ids: ["p01", "p13", "p34"] },
      { kind: "wide", id: "p02", side: "left" },
      { kind: "trio", ids: ["p26", "p05", "p31"] },
      { kind: "duo", ids: ["p03", "p51"] },
    ],
  },
];

/** Photo ids in display order for a chapter (rows first, then any unplaced). */
export function chapterPhotoIds(chapterId: ChapterId): string[] {
  const chapter = chapters.find((c) => c.id === chapterId);
  const placed: string[] = [];
  chapter?.rows.forEach((row) => {
    if ("ids" in row) placed.push(...row.ids);
    else placed.push(row.id);
  });
  // Photos added to `photos` but not yet art-directed still appear.
  const unplaced = photos
    .filter((photo) => photo.chapter === chapterId && !placed.includes(photo.id))
    .map((photo) => photo.id);
  return [...placed, ...unplaced];
}

/** Global frame numbers (FR.001…) in site display order. */
export const frameNumber = new Map(
  chapters
    .flatMap((chapter) => chapterPhotoIds(chapter.id))
    .map((id, index) => [id, String(index + 1).padStart(3, "0")])
);

// ── Films ───────────────────────────────────────────────────────────────

export type Video = {
  id: string;
  src: string;
  poster: string;
  title: string;
  /** Verified context only (from the user or their own file names). */
  meta?: string;
  year?: string;
  /** Aspect ratio (w / h) of the source file. */
  ratio: number;
  /** Format badge, e.g. "16:9". */
  label: string;
};

const VIDEO_DIR = "/assets/videos/aftermovies";

const v = (
  id: string,
  slug: string,
  ratio: number,
  label: string,
  title: string,
  meta?: string,
  year?: string
): Video => ({
  id,
  src: `${VIDEO_DIR}/${slug}.mp4`,
  poster: `${VIDEO_DIR}/${slug}-poster.jpg`,
  title,
  meta,
  year,
  ratio,
  label,
});

export const videos: Video[] = [
  v("v01", "thrulenses-reel", 1.7778, "16:9", "THRULENSES670", "FEATURED CUT"),
  v("v10", "halloween-2026", 1.7778, "16:9", "HALLOWEEN", undefined, "2026"),
  v("v03", "aerotechno-fest", 1.5, "3:2", "AEROTECHNO FESTIVAL", "MEDELLÍN"),
  v("v06", "urban-fest-2025", 1.7778, "16:9", "URBAN FEST", "MEDELLÍN", "2025"),
  v("v04", "fiesta-del-diablo", 1.7778, "16:9", "FIESTA DEL DIABLO"),
  v("v07", "genesis-aftermovie", 1.7778, "16:9", "GENESIS", "AFTERMOVIE"),
  v("v05", "mija", 1.5, "3:2", "MIJA"),
  v("v08", "maluna-fest", 1.7778, "16:9", "MALUNA FEST"),
  v("v09", "psicoddelic", 1.5, "3:2", "PSICODDELIC", "VHS CUT"),
  v("v02", "lilith", 1, "1:1", "LILITH"),
];

// ── Index ───────────────────────────────────────────────────────────────

/** Artists the user has confirmed shooting. */
export const artists = ["999999999", "AnD", "HENRIQUE CAMACHO", "MIJA", "SHIMZA"];

/** Stages: city/country only where verified, otherwise left blank. */
export const stages: { name: string; city?: string; country?: string }[] = [
  { name: "EDC" },
  { name: "HOCUS POCUS", city: "MIAMI", country: "US" },
  { name: "AEROTECHNO FESTIVAL", city: "MEDELLÍN", country: "CO" },
  { name: "LA SOLAR", city: "MEDELLÍN", country: "CO" },
  { name: "URBAN FEST", city: "MEDELLÍN", country: "CO" },
  { name: "FIESTA DEL DIABLO" },
  { name: "GENESIS" },
  { name: "MALUNA FEST" },
  { name: "LILITH" },
];

export const gear = [
  { item: "SONY A7 V", kind: "BODY", role: "PRIMARY" },
  { item: "SIGMA 12-24MM F2.8", kind: "GLASS", role: "ULTRA WIDE" },
  { item: "ZEISS 50MM F1.4", kind: "GLASS", role: "LOW LIGHT / PORTRAIT" },
  { item: "RODE MICROPHONE", kind: "AUDIO", role: "LIVE SOUND" },
  { item: "DJI MINI 4 PRO", kind: "AERIAL", role: "DRONE OPS" },
];

export const contact = {
  email: "Thrulenses670@gmail.com",
  phone: "239-777-1732",
  phoneHref: "tel:+12397771732",
  instagram: "thrulenses670",
  instagramUrl: "https://www.instagram.com/thrulenses670/",
};

/**
 * Hero centrepiece. To swap the render, drop a PNG with a transparent or
 * black background at the same path (or point `src` elsewhere). Optional
 * `video` (webm/mp4 loop) takes precedence over the still when set.
 */
export const heroRender: {
  src: string;
  front: string;
  width: number;
  height: number;
  video?: string;
} = {
  src: "/assets/chrome-camera-hero.png",
  front: "/assets/chrome-camera-front.png",
  width: 2000,
  height: 1116,
};

export const stats = {
  frames: photos.length,
  films: videos.length,
  stages: stages.length,
  countries: new Set(stages.map((s) => s.country).filter(Boolean)).size,
};
