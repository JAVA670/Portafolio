"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { djSets, type DJSetVideo } from "@/lib/mockData";

function SetPanel({ set, index, watch }: { set: DJSetVideo; index: number; watch: string }) {
  return (
    <article className="latex-sheen group grid border border-crimson bg-iron transition-shadow duration-500 hover:box-glow-red md:grid-cols-[1fr_300px]">
      <div className="relative aspect-video overflow-hidden bg-void">
        <AutoVideo
          src={set.src}
          poster={set.poster}
          className="h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span className="tech-label-red absolute left-4 top-4 animate-flicker bg-void/70 px-2 py-1 motion-reduce:animate-none">
          REC ● {set.duration}
        </span>
      </div>

      <div className="flex flex-col justify-between border-crimson p-5 md:border-l md:p-6">
        <div>
          <p className="tech-label-red mb-3">
            SET / {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="font-display text-3xl font-bold uppercase leading-none tracking-tight md:text-4xl">
            {set.artist}
            <span className="text-blood">.</span>
          </h3>
          <p className="mt-3 text-[11px] leading-relaxed tracking-[0.15em] text-bone">
            {set.event}
            <br />
            {set.location}
            <br />
            {set.year}
          </p>
        </div>
        <p className="tech-label mt-6">
          16:9 / MULTI-CAM / <span className="text-blood">{watch} ▶</span>
        </p>
      </div>
    </article>
  );
}

export function DJSets() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);

  // Desktop vault: section pins while the rail pans horizontally —
  // one full viewport of scroll per set.
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${((djSets.length - 1) / djSets.length) * 100}%`]
  );

  return (
    <section id="dj-sets" className="bg-iron">
      <SectionHeader
        label={t.djSets.label}
        title={t.djSets.title}
        sub={t.djSets.sub}
      />

      {/* Mobile / reduced motion: stacked vertical list */}
      <div className={`flex flex-col gap-4 p-4 ${reduceMotion ? "" : "md:hidden"}`}>
        {djSets.map((set, i) => (
          <BlurReveal key={set.id} distance={48}>
            <SetPanel set={set} index={i} watch={t.djSets.watch} />
          </BlurReveal>
        ))}
      </div>

      {/* Desktop: pinned horizontal pan */}
      {!reduceMotion && (
        <div
          ref={railRef}
          className="relative hidden md:block"
          style={{ height: `${djSets.length * 100}vh` }}
        >
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <motion.div style={{ x }} className="flex w-max">
              {djSets.map((set, i) => (
                <div
                  key={set.id}
                  className="flex w-screen shrink-0 items-center justify-center px-12 lg:px-20"
                >
                  <div className="w-full max-w-5xl">
                    <SetPanel set={set} index={i} watch={t.djSets.watch} />
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Rail progress */}
            <div className="absolute bottom-8 left-1/2 h-[2px] w-40 -translate-x-1/2 bg-crimson">
              <motion.div
                style={{ scaleX: scrollYProgress }}
                className="h-full origin-left bg-blood shadow-[0_0_10px_rgba(232,0,45,0.9)]"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
