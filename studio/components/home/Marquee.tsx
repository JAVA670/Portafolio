"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { LensMark } from "@/components/brand/Logo";

/**
 * Kinetic band: the services in large serif italic, crawling across the
 * full bleed, split by the lens mark. Scrolling also skews the band a
 * touch, like a camera whip.
 */
export function Marquee() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const skew = useTransform(scrollYProgress, [0, 0.5, 1], [-4, 0, 4]);
  const shift = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  const items = [
    t.categories.events,
    t.categories.portraits,
    t.categories.celebrations,
    t.services.items.more.title,
  ];
  const run = (copy: number) =>
    items.map((item) => (
      <span key={`${copy}-${item}`} className="flex shrink-0 items-center">
        <span className="serif whitespace-nowrap px-8 text-[clamp(56px,9vw,160px)] italic leading-none md:px-14">
          {item}
        </span>
        <LensMark className="h-[clamp(28px,3.4vw,56px)] w-[clamp(28px,3.4vw,56px)] text-ink" strokeWidth={1.2} />
      </span>
    ));

  return (
    <div ref={ref} className="overflow-hidden border-y border-line py-10 md:py-16" aria-hidden>
      <motion.div style={reduceMotion ? undefined : { skewX: skew, x: shift }}>
        <div className="marquee flex w-max" style={{ ["--marquee" as string]: "48s" }}>
          {run(0)}
          {run(1)}
        </div>
      </motion.div>
    </div>
  );
}
