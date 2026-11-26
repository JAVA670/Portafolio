/**
 * Thrulenses Studio — shoots ("sessions") shown on the site.
 *
 * Adding a shoot: upload to studio/photos/<slug>/, run
 * `npm run import-media`, then add an entry here with the printed paths and
 * ratios. Only facts the client/photographer gave go in titles and
 * captions — no guessed names, venues or dates.
 */
export type Category = "celebrations" | "events" | "portraits";

type Localized = { en: string; es: string };

export type Photo = {
  src: string;
  /** Display aspect ratio (w / h). */
  ratio: number;
  alt: string;
  /** CSS object-position for crops, e.g. "50% 20%". */
  focus?: string;
};

export type Film = { src: string; preview: string; poster: string; ratio: number };

export type Session = {
  slug: string;
  category: Category;
  title: Localized;
  blurb: Localized;
  date?: string;
  location?: string;
  photos: Photo[];
  /** Index into photos used as the cover (default 0). */
  cover?: number;
  film?: Film;
  /** Links to the full concert archive (separate site). */
  archive?: boolean;
};

const EVENTS = "/media/events";

export const sessions: Session[] = [
  {
    slug: "birthday",
    category: "celebrations",
    title: { en: "Birthday", es: "Cumpleaños" },
    blurb: {
      en: "A birthday told in frames — the people, the details and the moments in between.",
      es: "Un cumpleaños contado en fotos — la gente, los detalles y los momentos intermedios.",
    },
    // Filled in from studio/photos/birthday/ once uploaded.
    photos: [],
  },
  {
    slug: "live-music",
    category: "events",
    title: { en: "Live Music & Festivals", es: "Música en vivo y festivales" },
    blurb: {
      en: "From EDC's biggest stages to the club floor — the same instincts every event gets.",
      es: "De los escenarios más grandes de EDC a la pista del club — el mismo instinto que recibe cada evento.",
    },
    archive: true,
    photos: [
      { src: `${EVENTS}/tl-110.jpg`, ratio: 0.6665, alt: "Costumed festival friends laughing in daylight, one in a starry witch hat", focus: "50% 0%" },
      { src: `${EVENTS}/edc-109.jpg`, ratio: 1.5004, alt: "Giant goggled owl-face stage glowing red, lasers fanning across the crowd" },
      { src: `${EVENTS}/tl-137.jpg`, ratio: 0.6665, alt: "Giant bronze goggled face stage under a clear blue afternoon sky" },
      { src: `${EVENTS}/edc-89.jpg`, ratio: 0.6665, alt: "Red-haired performer on stage beneath a towering sculpted face" },
      { src: `${EVENTS}/tl-063.jpg`, ratio: 0.6665, alt: "DJ on a monumental stage under a white spotlight and red rig" },
      { src: `${EVENTS}/tl-098.jpg`, ratio: 0.6665, alt: "Towering stage structure wrapped in cyan LED panels at night" },
    ],
  },
];

export const sessionBySlug = (slug: string) => sessions.find((s) => s.slug === slug);

export const coverOf = (session: Session): Photo | undefined => session.photos[session.cover ?? 0];

/** Every photo across sessions, tagged with its session — for the hero wall and the coverflow. */
export const allFrames = sessions.flatMap((session) =>
  session.photos.map((photo) => ({ ...photo, session }))
);

/** Service → the session whose photos illustrate it (first match with photos). */
export const imageFor = (category: Category): Photo | undefined =>
  sessions.find((s) => s.category === category && s.photos.length)?.photos[0];
