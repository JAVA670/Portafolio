"use client";

import { motion } from "framer-motion";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { aftermovies } from "@/lib/mockData";

export function Aftermovies() {
  const { t } = useLanguage();

  return (
    <section id="aftermovies" className="bg-void">
      <SectionHeader
        label={t.aftermovies.label}
        title={t.aftermovies.title}
        sub={t.aftermovies.sub}
      />

      {/* 9:16 rail — native momentum + snap on touch, staggered grid on desktop */}
      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-6 sm:px-8 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-20"
        style={{ perspective: "1200px" }}
      >
        {aftermovies.map((movie, i) => (
          <BlurReveal
            key={movie.id}
            className={`w-[72vw] shrink-0 snap-center sm:w-[44vw] md:w-auto ${
              i % 2 === 1 ? "md:translate-y-12" : ""
            }`}
            delay={(i % 4) * 0.08}
          >
            <motion.article
              data-cursor="PLAY"
              whileHover={{ rotateX: 3, rotateY: i % 2 === 0 ? -3 : 3, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="latex-sheen group flex flex-col border border-steel bg-iron transition-[border-color,box-shadow] duration-300 hover:border-blood hover:box-glow-red"
            >
              <div className="relative aspect-[9/16] overflow-hidden bg-void">
                <AutoVideo
                  src={movie.src}
                  poster={movie.poster}
                  className="h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="tech-label-red absolute left-3 top-3 bg-void/70 px-1.5 py-0.5">
                  9:16
                </span>
              </div>
              <div className="border-t border-crimson p-3">
                <p className="text-[10px] font-bold leading-snug tracking-[0.15em]">
                  {movie.title}
                </p>
                <p className="tech-label-red mt-1.5">{movie.year}</p>
              </div>
            </motion.article>
          </BlurReveal>
        ))}
      </div>
    </section>
  );
}
