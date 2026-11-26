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

/**
 * A session film. The full-quality cut is streamed from YouTube (unlisted
 * is fine) or Vimeo — paste just the video id. `preview`/`poster` are an
 * optional short silent loop + still in public/media/videos/ (from
 * `npm run import-media`) shown before playing; otherwise the cover photo.
 */
export type Film = {
  youtube?: string;
  vimeo?: string;
  preview?: string;
  poster?: string;
  /** Display ratio (w / h); default 16:9. */
  ratio?: number;
};

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
const BIRTHDAY = "/media/birthday";

export const sessions: Session[] = [
  {
    slug: "birthday",
    category: "celebrations",
    // Title from the photographer's own file names ("Birthday 15th").
    title: { en: "15th Birthday", es: "Cumpleaños 15" },
    blurb: {
      en: "A fifteenth birthday told in frames — the gown, the family, the first dance and the haze-lit moments in between.",
      es: "Unos quince contados en fotos — el vestido, la familia, el primer baile y los momentos entre la neblina y las luces.",
    },
    photos: [
      { src: `${BIRTHDAY}/birthday-06.jpg`, ratio: 0.6668, alt: "The birthday girl in a tiara and full blue ball gown on a hazy, violet-lit dance floor", focus: "50% 35%" },
      { src: `${BIRTHDAY}/birthday-05.jpg`, ratio: 0.6668, alt: "Portrait of the birthday girl in a tiara under violet light and stage haze", focus: "50% 30%" },
      { src: `${BIRTHDAY}/birthday-02.jpg`, ratio: 0.6668, alt: "The birthday girl holding a blue bouquet beside a woman in a blue lace dress, tropical backdrop behind", focus: "50% 25%" },
      { src: `${BIRTHDAY}/birthday-04.jpg`, ratio: 0.6668, alt: "The birthday girl with a blue bouquet in front of a palm-tree beach backdrop and blue balloons", focus: "50% 30%" },
      { src: `${BIRTHDAY}/birthday-03.jpg`, ratio: 0.6668, alt: "The birthday girl seated with her bouquet before a mermaid backdrop and gold balloons", focus: "50% 40%" },
      { src: `${BIRTHDAY}/birthday-01.jpg`, ratio: 0.6668, alt: "The birthday girl in her tiara and gown, hugged and kissed on the cheek in red and blue haze", focus: "40% 35%" },
      { src: `${BIRTHDAY}/birthday-07.jpg`, ratio: 0.6668, alt: "A slow dance with a man in a cowboy hat, silhouetted in blue haze", focus: "60% 35%" },
    ],
    // Full-quality film streamed from Vimeo (vimeo.com/1250413715).
    film: { vimeo: "1250413715", ratio: 16 / 9 },
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
