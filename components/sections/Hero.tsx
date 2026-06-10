"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function Hero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Pin-style exit: the brand name scales up, shears and burns out of focus
  // as the user scrolls into the archive — a strobe frame overexposing.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const skew = useTransform(scrollYProgress, [0, 1], [0, -6]);
  const blur = useTransform(scrollYProgress, [0, 0.7], ["blur(0px)", "blur(18px)"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const labelY = useTransform(scrollYProgress, [0, 1], ["0%", "-180%"]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex h-svh flex-col justify-between overflow-hidden bg-void"
    >
      {/* Heat haze rising from the floor of the frame */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 100%, rgba(74,0,14,0.55) 0%, rgba(28,0,6,0.25) 45%, transparent 75%)",
        }}
      />

      {/* Technical corner markers */}
      <div className="pointer-events-none absolute inset-4 z-10 sm:inset-8">
        <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-blood" />
        <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-blood" />
        <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-blood" />
        <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-blood" />
        <span className="tech-label-red absolute right-8 top-1 hidden animate-flicker sm:block">
          REC ● 140+ BPM
        </span>
      </div>

      <motion.div
        style={reduceMotion ? undefined : { scale, filter: blur, opacity, skewX: skew }}
        className="flex flex-1 flex-col items-center justify-center px-4 text-center"
      >
        <motion.p
          style={reduceMotion ? undefined : { y: labelY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="tech-label-red mb-6"
        >
          {t.hero.role}
        </motion.p>

        <motion.h1
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(20px)", scale: 0.96 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative font-display text-[13vw] font-bold uppercase leading-[0.85] tracking-tighter sm:text-[11vw] lg:text-[9.5vw]"
        >
          THROUGH
          <br />
          LENSES
          <span className="text-blood glow-red animate-pulse-glow motion-reduce:animate-none">
            670
          </span>
          {/* RGB-split misfire layers */}
          {(["glitch-layer-a", "glitch-layer-b"] as const).map((layer) => (
            <span key={layer} aria-hidden className={`glitch-layer ${layer}`}>
              THROUGH
              <br />
              LENSES670
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-8 max-w-sm text-xs leading-relaxed text-bone sm:max-w-md sm:text-sm"
        >
          {t.hero.statement}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="tech-label-red mt-12 animate-blink"
        >
          ▼ {t.hero.scroll}
        </motion.p>
      </motion.div>

      {/* Industrial ticker strip */}
      <div className="relative z-10 overflow-hidden border-t border-crimson bg-darkred py-2.5">
        <div className="flex w-max animate-marquee whitespace-nowrap motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <span
              key={copy}
              aria-hidden={copy === 1}
              className="pr-4 text-[10px] font-bold tracking-[0.35em] text-laser"
            >
              {t.hero.marquee} {t.hero.scene} / / {t.hero.marquee}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
