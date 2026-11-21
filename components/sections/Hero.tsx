"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChromeHero } from "@/components/chrome/ChromeHero";
import { TextReveal } from "@/components/fx/TextReveal";
import { LabelBlock } from "@/components/ui/LabelBlock";
import { useLanguage } from "@/components/providers/LanguageProvider";

/** Preloader hard-cuts at ~1.2s; the hero choreography starts right after. */
const T0 = 1.25;

function LiveClock() {
  const [now, setNow] = useState("--:--:--");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    const id = window.setInterval(tick, 1000);
    const first = window.setTimeout(tick, 0);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, []);
  return <span className="tabular-nums">{now}</span>;
}

/** A label block that wipes on left→right, mechanical and linear. */
function WipeIn({
  children,
  delay,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <motion.span
      className={`inline-block origin-left ${className}`}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      transition={{ delay, duration: 0.22, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

export function Hero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const overlayY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative h-svh min-h-[620px] overflow-hidden bg-void"
    >
      <ChromeHero progress={scrollYProgress} still={!!reduceMotion} />

      {/* Editorial hairline grid over the chrome */}
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />

      <motion.div
        style={reduceMotion ? undefined : { y: overlayY, opacity: overlayOpacity }}
        className="relative z-10 flex h-full flex-col justify-between px-4 pb-5 pt-24 sm:px-8 sm:pb-8 md:pt-28"
      >
        {/* Poster stack — asymmetric label blocks */}
        <div className="flex flex-col items-start gap-1.5">
          <WipeIn delay={T0}>
            <LabelBlock className="text-[13px] sm:text-base">{t.hero.labelA}</LabelBlock>
          </WipeIn>
          <WipeIn delay={T0 + 0.12} className="ml-6 sm:ml-14">
            <LabelBlock className="text-[13px] sm:text-base">{t.hero.labelB}</LabelBlock>
          </WipeIn>
          <WipeIn delay={T0 + 0.24} className="ml-2 sm:ml-5">
            <LabelBlock variant="cobalt" className="text-[11px] tracking-[0.22em] sm:text-[13px]">
              {t.hero.bar}
            </LabelBlock>
          </WipeIn>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: T0 + 0.5, duration: 0.2, ease: "linear" }}
            className="mt-5 max-w-[280px] bg-void/75 px-2 py-1.5 text-[13px] leading-relaxed text-bone sm:max-w-[330px] sm:text-sm md:bg-transparent md:p-0"
          >
            {t.hero.statement}
          </motion.p>
        </div>

        <div>
          {/* Massive brand mark */}
          <h1 className="font-display text-[14vw] font-extrabold uppercase leading-[0.8] tracking-[-0.055em] md:text-[11.5vw]">
            <span className="block">
              <TextReveal text="THRU" immediate delay={T0 + 0.05} stagger={0.04} />
            </span>
            <span className="block">
              <TextReveal text="LENSES" immediate delay={T0 + 0.2} stagger={0.04} />
            </span>
            <span className="block">
              <TextReveal
                text="670"
                immediate
                delay={T0 + 0.45}
                stagger={0.05}
                charClassName="text-chrome"
              />
            </span>
          </h1>

          {/* Metadata rail */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: T0 + 0.7, duration: 0.2, ease: "linear" }}
            className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hairline pt-3 md:grid-cols-4"
          >
            <p className="meta">{t.hero.base}</p>
            <p className="meta hidden md:block">{t.hero.rig}</p>
            <p className="meta">
              {t.hero.localTime} <span className="text-strobe"><LiveClock /></span>
            </p>
            <p className="meta hidden text-right md:block">
              {t.hero.scroll} <span className="inline-block animate-blink text-ice">↓</span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
