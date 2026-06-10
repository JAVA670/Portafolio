"use client";

import { motion } from "framer-motion";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { videos } from "@/lib/mockData";

/**
 * Single vault for all motion work: 16:9 cinematic cuts sit wide,
 * 9:16 reels sit tall, interleaved in one rhythm.
 */
export function Videos() {
  const { t } = useLanguage();

  return (
    <section id="videos" className="bg-iron">
      <SectionHeader
        label={t.videos.label}
        title={t.videos.title}
        sub={t.videos.sub}
      />

      {/* Mobile: horizontal snap rail. Desktop: mixed-span grid. */}
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-6 sm:px-8 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-16">
        {videos.map((video, i) => {
          const wide = video.format === "16:9";
          return (
            <BlurReveal
              key={video.id}
              className={`shrink-0 snap-center ${
                wide ? "w-[85vw] sm:w-[70vw]" : "w-[62vw] sm:w-[40vw]"
              } md:w-auto ${wide ? "md:col-span-2" : ""}`}
              delay={(i % 3) * 0.08}
            >
              <motion.article
                data-cursor="PLAY"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="latex-sheen group flex h-full flex-col border border-steel bg-iron transition-[border-color,box-shadow] duration-300 hover:border-blood hover:box-glow-red"
              >
                <div
                  className={`relative flex-1 overflow-hidden bg-void ${
                    wide ? "aspect-video" : "aspect-[9/16]"
                  }`}
                >
                  <AutoVideo
                    src={video.src}
                    poster={video.poster}
                    className="h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span className="tech-label-red absolute left-3 top-3 bg-void/70 px-1.5 py-0.5">
                    {video.format}
                    {video.duration ? ` ● ${video.duration}` : ""}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-crimson p-3">
                  <div>
                    <p
                      className={`font-bold leading-snug tracking-[0.15em] ${
                        wide ? "font-display text-lg sm:text-xl" : "text-[10px]"
                      }`}
                    >
                      {video.title}
                      {wide && <span className="text-blood">.</span>}
                    </p>
                    <p className="tech-label mt-1">
                      {video.event} / {video.year}
                    </p>
                  </div>
                  <span className="tech-label-red shrink-0">
                    {t.videos.watch} ▶
                  </span>
                </div>
              </motion.article>
            </BlurReveal>
          );
        })}
      </div>
    </section>
  );
}
