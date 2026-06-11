"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { TextReveal } from "@/components/fx/TextReveal";
import { FloatingCamera } from "@/components/fx/FloatingCamera";
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

        {/* Viewfinder exposure readout */}
        <div className="absolute bottom-10 left-1 hidden flex-col gap-1.5 sm:flex">
          {["ISO 3200", "F 1.4", "1/250", "WB 3200K"].map((value) => (
            <span key={value} className="tech-label">
              {value}
            </span>
          ))}
          <span className="tech-label-red animate-flicker">AF-C ● LOCKED</span>
        </div>
      </div>

      <motion.div
        style={reduceMotion ? undefined : { scale, filter: blur, opacity, skewX: skew }}
        className="relative flex flex-1 flex-col items-center justify-center px-4 text-center"
      >
        {/* Sony camera drifting in the void behind the type */}
        <FloatingCamera />

        {/* AF focus brackets breathing around the headline */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[42vh] w-[84vw] -translate-x-1/2 -translate-y-1/2 max-w-4xl"
          initial={{ opacity: 0 }}
          animate={
            reduceMotion
              ? { opacity: 0.5 }
              : { opacity: [0, 0.6, 0.45], scale: [1.04, 1, 1.012] }
          }
          transition={{ delay: 2.2, duration: 4, repeat: reduceMotion ? 0 : Infinity, repeatType: "mirror" }}
        >
          <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-blood/70" />
          <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-blood/70" />
          <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-blood/70" />
          <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-blood/70" />
        </motion.div>

        <motion.p
          style={reduceMotion ? undefined : { y: labelY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="tech-label-red relative z-10 mb-6"
        >
          {t.hero.role}
        </motion.p>

        {/* Masked editorial reveal — letters rise out of clipped lines once
            the preloader curtain lifts. */}
        <h1 className="relative z-10 font-display text-[13vw] font-bold uppercase leading-[0.85] tracking-tighter sm:text-[11vw] lg:text-[9.5vw]">
          <span className="block">
            <TextReveal text="THRU" immediate delay={1.35} stagger={0.05} />
          </span>
          <span className="block">
            <TextReveal text="LENSES" immediate delay={1.6} stagger={0.045} />
            <TextReveal
              text="670"
              immediate
              delay={1.9}
              stagger={0.06}
              className="text-blood glow-red animate-pulse-glow motion-reduce:animate-none"
            />
          </span>
          {/* RGB-split misfire layers */}
          {(["glitch-layer-a", "glitch-layer-b"] as const).map((layer) => (
            <span key={layer} aria-hidden className={`glitch-layer ${layer}`}>
              THRU
              <br />
              LENSES670
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.7 }}
          className="relative z-10 mt-8 max-w-sm text-xs leading-relaxed text-bone sm:max-w-md sm:text-sm"
        >
          {t.hero.statement}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="tech-label-red relative z-10 mt-12 animate-blink"
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
