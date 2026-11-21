"use client";

import { useState } from "react";
import { SectionHead } from "@/components/fx/SectionHead";
import { ImageReveal } from "@/components/fx/ImageReveal";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { VideoModal } from "@/components/sections/VideoModal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { contact, videos, type Video } from "@/lib/mockData";

const [featured, ...rest] = videos;

/**
 * Column spans (of 12) for the grid below the featured cut: rows alternate
 * wide/narrow so the wall never reads as a uniform thumbnail grid. The
 * last row closes on the Instagram panel.
 */
const SPANS = [7, 5, 5, 7, 7, 5, 5, 7, 5];

const metaLine = (video: Video) => [video.meta, video.year].filter(Boolean).join(" — ");

/** Red record light + running number. */
function LiveTag({ index }: { index: number }) {
  return (
    <span className="meta flex items-center gap-1.5 bg-void/80 px-2 py-1 text-strobe backdrop-blur-sm">
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-signal" aria-hidden />
      {String(index).padStart(2, "0")}
    </span>
  );
}

function FilmTile({
  video,
  index,
  span,
  onPlay,
}: {
  video: Video;
  index: number;
  span: number;
  onPlay: (video: Video) => void;
}) {
  const { t } = useLanguage();
  const wide = span === 7;
  const meta = metaLine(video);
  return (
    <button
      type="button"
      data-cursor="PLAY"
      onClick={() => onPlay(video)}
      className={`group relative block w-full text-left ${wide ? "md:col-span-7" : "md:col-span-5"}`}
      aria-label={`${t.films.sound}: ${video.title}`}
    >
      <ImageReveal className={`aspect-video bg-ink ${wide ? "" : "md:aspect-auto md:h-full"}`} delay={wide ? 0 : 0.08}>
        <AutoVideo
          src={video.preview}
          poster={video.still}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </ImageReveal>

      {/* Legibility scrim + frame */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-transparent" aria-hidden />
      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-hairline transition-shadow duration-150 ease-linear group-hover:ring-signal/70" aria-hidden />

      <span className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-4">
        <span className="flex items-start justify-between gap-3">
          <LiveTag index={index} />
          <span className="meta bg-void/80 px-2 py-1 text-strobe backdrop-blur-sm">{video.label}</span>
        </span>
        <span className="flex items-end justify-between gap-3">
          <span className="min-w-0">
            <span className="display block truncate text-[clamp(30px,3.4vw,58px)] [text-shadow:0_2px_18px_rgba(0,0,0,0.4)]">
              {video.title}
            </span>
            <span className="meta mt-1.5 block text-strobe/85">{meta || "\u00a0"}</span>
          </span>
          <span className="flex h-11 shrink-0 items-center gap-2 bg-strobe px-3.5 font-mono text-[11px] uppercase tracking-[0.15em] text-void transition-colors duration-150 ease-linear group-hover:bg-signal group-hover:text-strobe md:h-12">
            ▶<span className="hidden lg:inline">{t.films.play}</span>
          </span>
        </span>
      </span>
    </button>
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
  const featuredMeta = metaLine(featured);

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
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" aria-hidden />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <span className="label-block label-block--signal">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-blink rounded-full bg-strobe align-middle" aria-hidden />
                {t.films.featured}
              </span>
              <span className="meta bg-void/80 px-2 py-1 text-strobe">{featured.label}</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="display text-[clamp(44px,7vw,120px)] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
                  {featured.title}
                </p>
                {featuredMeta && <p className="meta mt-2 text-strobe">{featuredMeta}</p>}
              </div>
              <span className="flex h-16 shrink-0 items-center gap-2.5 bg-strobe px-5 font-mono text-[12px] uppercase tracking-[0.15em] text-void transition-colors duration-150 ease-linear group-hover:bg-signal group-hover:text-strobe md:h-20 md:px-7">
                ▶<span className="hidden sm:inline">{t.films.sound}</span>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Wall of live previews */}
      <div className="shell mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
        {rest.map((video, i) => (
          <FilmTile key={video.id} video={video} index={i + 2} span={SPANS[i] ?? 5} onPlay={setPlaying} />
        ))}

        <a
          href={contact.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="OPEN"
          className="group relative flex min-h-[220px] flex-col justify-between gap-6 overflow-hidden border border-hairline bg-ink p-4 transition-colors duration-150 ease-linear hover:border-signal md:col-span-7 md:aspect-video md:min-h-0 md:p-6"
        >
          <span className="flex items-start justify-between gap-3">
            <span className="meta text-strobe">{t.films.more}</span>
            <span className="meta text-strobe transition-colors duration-150 ease-linear group-hover:text-signal">IG ↗</span>
          </span>
          <span>
            <span className="display block text-[clamp(34px,4.6vw,78px)] normal-case transition-colors duration-150 ease-linear group-hover:text-signal">
              @{contact.instagram}
            </span>
            <span className="mt-3 flex items-end justify-between gap-4">
              <span className="max-w-[36ch] text-[14px] leading-[1.5] text-mute md:text-[15px]">{t.films.moreText}</span>
              <span className="shrink-0 border border-divider px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-strobe transition-colors duration-150 ease-linear group-hover:border-signal group-hover:bg-signal">
                {t.films.follow} ↗
              </span>
            </span>
          </span>
        </a>
      </div>

      <VideoModal video={playing} onClose={() => setPlaying(null)} />
    </section>
  );
}
