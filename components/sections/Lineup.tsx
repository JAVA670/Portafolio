"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Scramble } from "@/components/fx/Scramble";
import { LabelBlock } from "@/components/ui/LabelBlock";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { credits } from "@/lib/mockData";

/** Asymmetric offsets so the stack reads like a pasted-up club flyer. */
const OFFSETS = ["0%", "6%", "2%", "9%", "3%"];

/**
 * "SHOT FOR" — an underground techno poster. Artist names stacked as stark
 * white label blocks over a cold, parallaxing frame; festivals listed as
 * decoding monospace metadata.
 */
export function Lineup() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} id="lineup" className="relative overflow-hidden border-y border-hairline bg-void">
      {/* Cold backdrop frame */}
      <motion.div
        style={reduceMotion ? undefined : { y: bgY }}
        className="absolute inset-[-10%_0]"
        aria-hidden
      >
        <Image
          src="/assets/photography/aero-07.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-30 [filter:grayscale(1)_contrast(1.2)]"
        />
        <div className="absolute inset-0 bg-cobalt/25 mix-blend-color" />
        <div className="absolute inset-0 bg-linear-to-b from-void via-void/40 to-void" />
      </motion.div>

      <div className="relative grid grid-cols-1 gap-12 px-4 py-24 sm:px-8 md:grid-cols-12 md:py-36">
        <div className="min-w-0 md:col-span-8">
          <div className="mb-6 flex items-center gap-3">
            <LabelBlock variant="cobalt" className="text-[11px] tracking-[0.2em]">
              {t.lineup.label}
            </LabelBlock>
            <span className="meta">{t.lineup.title}</span>
          </div>

          <ul className="flex flex-col items-start gap-1.5 sm:gap-2">
            {credits.artists.map((artist, i) => (
              <li key={artist} style={{ marginLeft: OFFSETS[i % OFFSETS.length] }}>
                <motion.span
                  className="inline-block"
                  initial={reduceMotion ? false : { clipPath: "inset(0 100% 0 0)" }}
                  whileInView={{ clipPath: "inset(0 0% 0 0)" }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ delay: i * 0.08, duration: 0.24, ease: "linear" }}
                >
                  <LabelBlock className="text-[7.4vw] leading-[0.95] tracking-[0.02em] md:text-[4.6vw]">
                    {artist}
                  </LabelBlock>
                </motion.span>
              </li>
            ))}
            <li style={{ marginLeft: "9%" }}>
              <LabelBlock variant="ghost" className="text-sm tracking-[0.2em] md:text-base">
                {t.lineup.locals}
              </LabelBlock>
            </li>
          </ul>
        </div>

        <div className="flex min-w-0 flex-col justify-end gap-8 md:col-span-4">
          <div>
            <p className="meta mb-3 text-ice">{`/ ${t.lineup.festivals}`}</p>
            <ul className="flex flex-col border-t border-hairline">
              {credits.festivals.map((festival, i) => (
                <li
                  key={festival}
                  className="flex items-baseline justify-between gap-3 border-b border-hairline py-2.5 font-mono text-[11px] tracking-[0.16em] text-strobe"
                >
                  <Scramble text={festival} delay={i * 140} />
                  <span className="text-ash">{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="meta">{t.lineup.hours}</p>
            <p className="mt-2 font-display text-5xl font-extrabold leading-none tracking-[-0.05em] lg:text-6xl">
              140<span className="text-chrome">BPM</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
