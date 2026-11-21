"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { SectionHead } from "@/components/fx/SectionHead";
import { ImageReveal } from "@/components/fx/ImageReveal";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { VideoModal } from "@/components/sections/VideoModal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { videos, type Video } from "@/lib/mockData";

const [featured, ...rest] = videos;

/**
 * 03 FILMS — one featured cut at full width, then a typographic index.
 * On desktop a poster preview follows the cursor over each row; on touch
 * the rows carry their own thumbnail. Everything opens the theater.
 */
export function Films() {
  const { t } = useLanguage();
  const [playing, setPlaying] = useState<Video | null>(null);
  const [hovered, setHovered] = useState<Video | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 30, mass: 0.6 });
  const y = useSpring(my, { stiffness: 260, damping: 30, mass: 0.6 });

  const meta = (video: Video) => [video.meta, video.year].filter(Boolean).join(" — ") || "—";

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
          aria-label={`${t.films.play} ${featured.title}`}
        >
          <ImageReveal className="aspect-[4/5] sm:aspect-video">
            <AutoVideo src={featured.src} poster={featured.poster} className="h-full w-full object-cover" />
          </ImageReveal>
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6">
            <div className="flex items-start justify-between">
              <span className="label-block label-block--cobalt">{t.films.featured}</span>
              <span className="meta bg-void px-2 py-1 text-strobe">{featured.label}</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="display text-[clamp(44px,7vw,120px)] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
                  {featured.title}
                </p>
                <p className="meta mt-2 text-strobe">{meta(featured)}</p>
              </div>
              <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-strobe text-xl text-void transition-colors duration-150 ease-linear group-hover:bg-cobalt group-hover:text-strobe md:h-20 md:w-20">
                ▶
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Index */}
      <div
        className="shell relative mt-16 md:mt-24"
        onPointerMove={(e) => {
          mx.set(e.clientX);
          my.set(e.clientY);
        }}
        onPointerLeave={() => setHovered(null)}
      >
        <div className="hidden grid-cols-12 gap-3 border-b border-divider pb-3 md:grid">
          <span className="meta col-span-1">NO.</span>
          <span className="meta col-span-6">TITLE</span>
          <span className="meta col-span-3">CONTEXT</span>
          <span className="meta col-span-1">FORMAT</span>
          <span className="meta col-span-1 text-right">{t.films.play}</span>
        </div>
        <ul>
          {rest.map((video, i) => (
            <li key={video.id} className="border-b border-hairline">
              <button
                type="button"
                onClick={() => setPlaying(video)}
                onPointerEnter={() => setHovered(video)}
                onFocus={() => setHovered(video)}
                onBlur={() => setHovered(null)}
                className="group grid w-full grid-cols-12 items-center gap-3 px-1 py-3 text-left transition-colors duration-150 ease-linear hover:bg-strobe hover:text-void md:py-4"
                aria-label={`${t.films.play} ${video.title}`}
              >
                <span className="relative col-span-4 aspect-video overflow-hidden bg-ink md:hidden">
                  <Image src={video.poster} alt="" fill sizes="35vw" className="object-cover" />
                </span>
                <span className="meta col-span-1 hidden group-hover:text-void md:block">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <span className="col-span-8 flex flex-col md:col-span-6">
                  <span className="display text-[clamp(28px,3.8vw,60px)]">{video.title}</span>
                  <span className="meta mt-1 group-hover:text-void md:hidden">
                    {meta(video)} — {video.label}
                  </span>
                </span>
                <span className="meta col-span-3 hidden group-hover:text-void md:block">{meta(video)}</span>
                <span className="meta col-span-1 hidden group-hover:text-void md:block">{video.label}</span>
                <span className="col-span-1 hidden text-right font-mono text-sm md:block">▶</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Cursor-following preview (desktop, fine pointer). Always rendered —
            hidden with CSS under reduced motion so SSR markup matches. */}
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-40 -mt-[84px] ml-6 hidden w-[300px] lg:motion-safe:block"
          style={{ x, y }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.92 }}
          transition={{ duration: 0.18, ease: "linear" }}
        >
          {hovered && (
            <div className="relative aspect-video overflow-hidden border border-hairline bg-ink">
              <Image src={hovered.poster} alt="" fill sizes="300px" className="object-cover" />
              <span className="absolute bottom-0 left-0 bg-void px-2 py-1 font-mono text-[10px] tracking-[0.15em] text-strobe">
                ▶ {hovered.label}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      <VideoModal video={playing} onClose={() => setPlaying(null)} />
    </section>
  );
}
