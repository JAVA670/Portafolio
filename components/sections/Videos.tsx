"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { LabelBlock } from "@/components/ui/LabelBlock";
import { VideoModal } from "@/components/sections/VideoModal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { videos, type Video } from "@/lib/mockData";

const [featured, ...rest] = videos;

/**
 * Films. A sticky cinematic stage: the showreel starts as a framed window
 * and opens to full bleed as you scroll, title blocks riding over it. Then
 * the rest of the cuts sit in a hairline grid. Cards preview muted; a click
 * opens the full-screen theater with sound.
 */
export function Videos() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<Video | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end end"] });
  const inset = useTransform(scrollYProgress, [0, 0.6], [14, 0]);
  const clipPath = useTransform(inset, (v) => `inset(${v}% ${v * 1.4}% ${v}% ${v * 1.4}%)`);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.12, 1]);

  const open = (video: Video) => setActive(video);

  return (
    <section id="films" className="bg-void">
      <SectionHeader label={t.films.label} title={t.films.title} sub={t.films.sub} />

      {/* Sticky stage — desktop only; mobile gets a plain featured card */}
      <div ref={stageRef} className="relative hidden md:block" style={{ height: "220vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.button
            type="button"
            data-cursor="PLAY"
            onClick={() => open(featured)}
            style={reduceMotion ? undefined : { clipPath }}
            className="absolute inset-0 block w-full"
            aria-label={`${t.films.watch} ${featured.title}`}
          >
            <motion.div style={reduceMotion ? undefined : { scale }} className="absolute inset-0">
              <AutoVideo src={featured.src} poster={featured.poster} className="h-full w-full object-cover" />
            </motion.div>
            <div className="absolute inset-0 bg-void/20" />
          </motion.button>

          <div className="pointer-events-none absolute inset-x-8 bottom-8 flex items-end justify-between">
            <div className="flex flex-col items-start gap-1.5">
              <LabelBlock variant="cobalt" className="text-[11px] tracking-[0.2em]">
                {t.films.featured}
              </LabelBlock>
              <LabelBlock className="text-[5vw] leading-[0.95] tracking-[0.01em]">{featured.title}</LabelBlock>
              <LabelBlock className="ml-8 text-sm tracking-[0.18em]">{featured.event}</LabelBlock>
            </div>
            <span className="label-block text-[11px] tracking-[0.2em]">▶ {t.films.watch}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-px border-y border-hairline bg-hairline md:grid-cols-2">
        {[...(featured ? [featured] : []), ...rest].map((video, i) => (
          <BlurReveal
            key={video.id}
            className={`bg-void ${i === 0 ? "md:hidden" : ""}`}
            delay={(i % 2) * 0.05}
            distance={16}
          >
            <button
              type="button"
              data-cursor="PLAY"
              onClick={() => open(video)}
              className="group block w-full text-left"
              aria-label={`${t.films.watch} ${video.title}`}
            >
              <div className="relative overflow-hidden bg-iron" style={{ aspectRatio: video.ratio }}>
                <AutoVideo
                  src={video.src}
                  poster={video.poster}
                  className="grade-cool h-full w-full object-cover"
                />
                <span className="absolute left-0 top-0 bg-void/80 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.2em] text-bone">
                  REC ● {video.label}
                </span>
                <span className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center bg-strobe text-sm text-void transition-colors duration-150 ease-linear group-hover:bg-cobalt group-hover:text-strobe">
                  ▶
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-display text-lg font-extrabold uppercase tracking-[-0.01em] transition-colors duration-150 ease-linear group-hover:bg-strobe group-hover:text-void sm:text-xl">
                    {video.title}
                  </p>
                  <p className="meta mt-1">
                    {video.event} / {video.year}
                  </p>
                </div>
                <span className="meta shrink-0">{String(i + 1).padStart(2, "0")}</span>
              </div>
            </button>
          </BlurReveal>
        ))}
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
