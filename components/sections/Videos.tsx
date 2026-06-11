"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { VideoModal } from "@/components/sections/VideoModal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { videos, type Video } from "@/lib/mockData";

/**
 * Single vault for all motion work. Cards preview muted in the scroll;
 * clicking one opens the full-screen theater with sound + controls.
 */
export function Videos() {
  const { t } = useLanguage();
  const [active, setActive] = useState<Video | null>(null);

  return (
    <section id="videos" className="bg-iron">
      <SectionHeader
        label={t.videos.label}
        title={t.videos.title}
        sub={t.videos.sub}
      />

      <div className="columns-1 gap-4 px-4 py-6 sm:px-8 md:columns-2 md:pb-16">
        {videos.map((video, i) => (
          <BlurReveal
            key={video.id}
            className="mb-4 break-inside-avoid"
            delay={(i % 2) * 0.08}
          >
            <motion.article
              data-cursor="PLAY"
              role="button"
              tabIndex={0}
              aria-label={`Play ${video.title}`}
              onClick={() => setActive(video)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(video);
                }
              }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="latex-sheen group flex cursor-pointer flex-col border border-steel bg-iron transition-[border-color,box-shadow] duration-300 hover:border-blood hover:box-glow-red"
            >
              <div
                className="relative overflow-hidden bg-void"
                style={{ aspectRatio: video.ratio }}
              >
                <AutoVideo
                  src={video.src}
                  poster={video.poster}
                  className="h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="tech-label-red absolute left-3 top-3 bg-void/70 px-1.5 py-0.5">
                  REC ● {video.label}
                </span>
                {/* Play affordance — visible without hover, esp. on touch */}
                <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center border border-strobe/60 bg-void/60 text-strobe transition-colors duration-300 group-hover:border-blood group-hover:bg-blood group-hover:text-void">
                  ▶
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-crimson p-3 sm:p-4">
                <div>
                  <p className="font-display text-lg font-bold leading-snug tracking-[0.1em] sm:text-xl">
                    {video.title}
                    <span className="text-blood">.</span>
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
        ))}
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
