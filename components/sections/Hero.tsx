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

  // Pin-style exit: the brand name scales up and falls out of focus as the
  // user scrolls into the archive, like a strobe frame burning out.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const blur = useTransform(scrollYProgress, [0, 0.7], ["blur(0px)", "blur(18px)"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex h-svh flex-col justify-between overflow-hidden bg-void"
    >
      {/* Technical corner markers */}
      <div className="pointer-events-none absolute inset-4 z-10 sm:inset-8">
        <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-ash" />
        <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-ash" />
        <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-ash" />
        <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-ash" />
      </div>

      <motion.div
        style={reduceMotion ? undefined : { scale, filter: blur, opacity }}
        className="flex flex-1 flex-col items-center justify-center px-4 text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="tech-label mb-6"
        >
          {t.hero.role}
        </motion.p>

        <motion.h1
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(20px)", scale: 0.96 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[13vw] font-bold uppercase leading-[0.85] tracking-tighter sm:text-[11vw] lg:text-[9.5vw]"
        >
          THROUGH
          <br />
          LENSES
          <span className="text-ash">670</span>
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
          className="tech-label mt-12 animate-blink"
        >
          ▼ {t.hero.scroll}
        </motion.p>
      </motion.div>

      {/* Industrial ticker strip */}
      <div className="relative z-10 overflow-hidden border-t border-smoke bg-iron py-2.5">
        <div className="flex w-max animate-marquee whitespace-nowrap motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <span
              key={copy}
              aria-hidden={copy === 1}
              className="pr-4 text-[10px] tracking-[0.35em] text-ash"
            >
              {t.hero.marquee} {t.hero.scene} / / {t.hero.marquee}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
