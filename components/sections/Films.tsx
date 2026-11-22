"use client";

import { Fragment, useState } from "react";
import { SectionHead } from "@/components/fx/SectionHead";
import { ImageReveal } from "@/components/fx/ImageReveal";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { VideoModal } from "@/components/sections/VideoModal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Sigil } from "@/components/chrome/Sigil";
import { ThornCorners } from "@/components/chrome/ThornCorners";
import { ChromeCorners } from "@/components/chrome/Ornaments";
import { contact, videos, type Video } from "@/lib/mockData";

const [featured, ...rest] = videos;

/**
 * The wall below the featured cut follows each film's real shape:
 * landscape films pair up wide/narrow, vertical (phone 9:16) films sit
 * three to a row as portrait tiles — rows alternate so the rhythm never
 * reads as a uniform thumbnail grid. The Instagram panel fills the first
 * landscape row with a free slot (or closes the wall).
 */
type WallRow = { kind: "land" | "tall"; items: Video[] };

const wallRows: WallRow[] = (() => {
  const land = rest.filter((v) => v.ratio >= 1);
  const tall = rest.filter((v) => v.ratio < 1);
  const rows: WallRow[] = [];
  for (let li = 0, ti = 0, turn = 0; li < land.length || ti < tall.length; turn++) {
    if ((turn % 2 === 0 && li < land.length) || ti >= tall.length) {
      rows.push({ kind: "land", items: land.slice(li, li + 2) });
      li += 2;
    } else {
      rows.push({ kind: "tall", items: tall.slice(ti, ti + 3) });
      ti += 3;
    }
  }
  return rows;
})();

const panelRow = wallRows.findIndex((row) => row.kind === "land" && row.items.length === 1);
const wallOrder = wallRows.flatMap((row) => row.items);

type TileShape = "wide" | "narrow" | "tall";

const TILE: Record<TileShape, { col: string; frame: string; title: string }> = {
  wide: { col: "md:col-span-7", frame: "aspect-video", title: "text-[clamp(28px,3vw,52px)]" },
  narrow: { col: "md:col-span-5", frame: "aspect-video md:aspect-auto md:h-full", title: "text-[clamp(28px,3vw,52px)]" },
  tall: { col: "md:col-span-4", frame: "aspect-[4/5] md:aspect-[2/3]", title: "text-[clamp(26px,2.4vw,42px)]" },
};

const metaLine = (video: Video) => [video.meta, video.year].filter(Boolean).join(" — ");

/** Thorn-star record light + running number. */
function LiveTag({ index }: { index: number }) {
  return (
    <span className="cut-sm meta flex items-center gap-1.5 bg-void px-2.5 py-1 text-strobe">
      <Sigil className="h-2.5 w-2.5 animate-blink text-chrome" />
      {String(index).padStart(2, "0")}
    </span>
  );
}

/** Solid black title plate — hard edges instead of a soft scrim. */
function TitlePlate({ title, meta, size }: { title: string; meta: string; size: string }) {
  return (
    <span className="cut-sm block min-w-0 max-w-full bg-void px-3 pb-2 pt-2.5 md:px-4">
      <span className={`display block truncate ${size}`}>
        {title}
      </span>
      <span className="meta mt-1 block text-strobe/80">{meta || " "}</span>
    </span>
  );
}

function FilmTile({
  video,
  shape,
  delay = 0,
  onPlay,
}: {
  video: Video;
  shape: TileShape;
  delay?: number;
  onPlay: (video: Video) => void;
}) {
  const { t } = useLanguage();
  const tile = TILE[shape];
  const index = wallOrder.indexOf(video) + 2;
  return (
    <button
      type="button"
      data-cursor="PLAY"
      onClick={() => onPlay(video)}
      className={`group relative block w-full text-left ${tile.col}`}
      aria-label={`${t.films.sound}: ${video.title}`}
    >
      <ImageReveal className={`bg-ink ${tile.frame}`} delay={delay}>
        <AutoVideo
          src={video.preview}
          poster={video.still}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </ImageReveal>

      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-hairline transition-shadow duration-150 ease-linear group-hover:ring-strobe/70" aria-hidden />
      <ThornCorners />

      <span className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-4">
        <span className="flex items-start justify-between gap-3">
          <LiveTag index={index} />
          <span className="cut-sm meta bg-void px-2.5 py-1 text-strobe">{video.label}</span>
        </span>
        <span className="flex items-end justify-between gap-3">
          <TitlePlate title={video.title} meta={metaLine(video)} size={tile.title} />
          <span className="cut-sm flex h-11 shrink-0 items-center gap-2 bg-strobe px-3.5 font-mono text-[11px] uppercase tracking-[0.15em] text-void transition-colors duration-150 ease-linear group-hover:chrome-plate group-hover:text-void md:h-12">
            ▶<span className="hidden lg:inline">{t.films.play}</span>
          </span>
        </span>
      </span>
    </button>
  );
}

/** Closing panel: more cuts live on Instagram. */
function InstagramPanel({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <div className={`relative ${className}`}>
      <a
        href={contact.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="OPEN"
        className="cut-lg group relative flex h-full min-h-[240px] flex-col justify-between gap-6 overflow-hidden bg-ink p-5 transition-colors duration-150 ease-linear hover:bg-steel md:min-h-[320px] md:p-8"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="meta flex items-center gap-2 text-strobe">
            <Sigil className="h-2.5 w-2.5 text-chrome" />
            {t.films.more}
          </span>
          <span className="meta text-strobe transition-colors duration-150 ease-linear group-hover:text-chrome">IG ↗</span>
        </span>
        <span>
          <span className="display chrome-text block text-[clamp(34px,4.6vw,78px)] normal-case">@{contact.instagram}</span>
          <span className="mt-3 flex items-end justify-between gap-4">
            <span className="max-w-[36ch] text-[14px] leading-[1.5] text-mute md:text-[15px]">{t.films.moreText}</span>
            <span className="cut-sm shrink-0 bg-strobe px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-void transition-colors duration-150 ease-linear group-hover:chrome-plate group-hover:text-void">
              {t.films.follow} ↗
            </span>
          </span>
        </span>
      </a>
      <ChromeCorners corners={["tr", "bl"]} className="w-[84px] md:w-[124px]" />
    </div>
  );
}

/**
 * 03 FILMS — every cut previews itself. Short silent loops autoplay as
 * they scroll into view (and pause when they leave); a click opens the
 * full film with sound in the theater.
 */
export function Films() {
  const { t } = useLanguage();
  const [playing, setPlaying] = useState<Video | null>(null);

  return (
    <section id="films" className="relative">
      <SectionHead label={t.films.label} title={t.films.title} sub={t.films.sub} />

      {/* Featured */}
      <div className="shell mt-14 md:mt-20">
        <button
          type="button"
          data-cursor="PLAY"
          onClick={() => setPlaying(featured)}
          className="group relative block w-full text-left"
          aria-label={`${t.films.sound}: ${featured.title}`}
        >
          <ImageReveal className="aspect-[4/5] bg-ink sm:aspect-video">
            <AutoVideo
              src={featured.preview}
              poster={featured.still}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
            />
          </ImageReveal>
          <ThornCorners always />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-7">
            <div className="flex items-start justify-between gap-3">
              <span className="label-block label-block--chrome">
                <Sigil className="mr-2 h-2.5 w-2.5 -translate-y-px animate-blink text-void" />
                {t.films.featured}
              </span>
              <span className="cut-sm meta bg-void px-2.5 py-1 text-strobe">{featured.label}</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <TitlePlate title={featured.title} meta={metaLine(featured)} size="text-[clamp(40px,6.4vw,110px)]" />
              <span className="cut-sm flex h-16 shrink-0 items-center gap-2.5 bg-strobe px-5 font-mono text-[12px] uppercase tracking-[0.15em] text-void transition-colors duration-150 ease-linear group-hover:chrome-plate group-hover:text-void md:h-20 md:px-7">
                ▶<span className="hidden sm:inline">{t.films.sound}</span>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Wall of live previews — tiles follow each film's real shape */}
      <div className="shell mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
        {wallRows.map((row, r) => {
          if (row.kind === "tall") {
            return row.items.map((video, i) => (
              <FilmTile key={video.id} video={video} shape="tall" delay={i * 0.08} onPlay={setPlaying} />
            ));
          }
          const [first, second] = row.items;
          return (
            <Fragment key={`row-${r}`}>
              <FilmTile video={first} shape="wide" onPlay={setPlaying} />
              {second ? (
                <FilmTile video={second} shape="narrow" delay={0.08} onPlay={setPlaying} />
              ) : (
                r === panelRow && <InstagramPanel className="md:col-span-5" />
              )}
            </Fragment>
          );
        })}
        {panelRow === -1 && <InstagramPanel className="md:col-span-12" />}
      </div>

      <VideoModal video={playing} onClose={() => setPlaying(null)} />
    </section>
  );
}
