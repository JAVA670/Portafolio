"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CameraRender } from "@/components/hero/CameraRender";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSignal } from "@/lib/intro";
import { heroRender } from "@/lib/mockData";

const EASE_SWISS = [0.77, 0, 0.175, 1] as const;

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
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return <span className="tabular-nums text-strobe">{now}</span>;
}

/** One line of the headline rising out of its mask. */
function Line({ children, delay, show }: { children: string; delay: number; show: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-[0.04em]">
      <motion.span
        className="block"
        initial={reduceMotion ? false : { y: "105%" }}
        animate={show ? { y: "0%" } : undefined}
        transition={{ duration: 1.1, ease: EASE_SWISS, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Label block that wipes on left → right, mechanical and linear. */
function Wipe({ children, delay, show }: { children: React.ReactNode; delay: number; show: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      className="inline-block"
      initial={reduceMotion ? false : { clipPath: "inset(0 100% 0 0)" }}
      animate={show ? { clipPath: "inset(0 0% 0 0)" } : undefined}
      transition={{ duration: 0.32, ease: "linear", delay }}
    >
      {children}
    </motion.span>
  );
}

export function Hero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const show = useSignal("introDone") || !!reduceMotion;
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const render = (
    <CameraRender
      src={heroRender.src}
      width={heroRender.width}
      height={heroRender.height}
      video={heroRender.video}
      alt="Liquid-chrome mirrorless camera wrapped in spiked metal tendrils"
      priority
      progress={scrollYProgress}
      caption={t.hero.fig}
    />
  );

  return (
    <section ref={ref} id="top" className="relative h-svh min-h-[640px] overflow-hidden">
      {/* 12-column architectural hairlines */}
      <div className="shell pointer-events-none absolute inset-0" aria-hidden>
        <div className="grid-lines h-full w-full" />
      </div>

      {/* Desktop render — right 45%, bleeding off the edge */}
      <div className="pointer-events-none absolute right-[-5vw] top-1/2 hidden w-[63vw] max-w-[1240px] -translate-y-[52%] lg:block">
        {render}
      </div>

      <motion.div
        style={reduceMotion ? undefined : { y: textY, opacity: fade }}
        className="shell relative z-10 flex h-full flex-col pb-16 pt-[84px] lg:pb-[72px] lg:pt-[96px]"
      >
        {/* Role stack */}
        <div className="flex flex-col items-start gap-1">
          <Wipe delay={0.25} show={show}>
            <span className="label-block">{t.hero.labelA}</span>
          </Wipe>
          <Wipe delay={0.35} show={show}>
            <span className="label-block">{t.hero.labelB}</span>
          </Wipe>
          <Wipe delay={0.45} show={show}>
            <span className="label-block label-block--cobalt">{t.hero.bar}</span>
          </Wipe>
          <motion.p
            className="mt-5 max-w-[30ch] text-[15px] leading-[1.5] text-mute md:text-base"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={show ? { opacity: 1 } : undefined}
            transition={{ duration: 0.3, ease: "linear", delay: 0.75 }}
          >
            {t.hero.statement}
          </motion.p>
        </div>

        {/* Mobile render */}
        <div className="relative -mx-[8vw] my-auto py-4 lg:hidden">{render}</div>

        {/* Headline — bottom-anchored on the grid */}
        <h1
          className="display text-[clamp(84px,25vw,150px)] lg:mt-auto lg:text-[clamp(110px,min(15vw,22vh),260px)]"
          aria-label="THRU LENSES 670"
        >
          <Line delay={0} show={show}>
            THRU
          </Line>
          <Line delay={0.08} show={show}>
            LENSES
          </Line>
          <Line delay={0.16} show={show}>
            670
          </Line>
        </h1>
      </motion.div>

      {/* Meta rail */}
      <motion.div
        className="shell absolute inset-x-0 bottom-0 z-10"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={show ? { opacity: 1 } : undefined}
        transition={{ duration: 0.3, ease: "linear", delay: 0.9 }}
      >
        <div className="grid grid-cols-2 gap-x-3 border-t border-hairline py-3.5 lg:grid-cols-12">
          <p className="meta lg:col-span-5">{t.hero.base}</p>
          <p className="meta hidden lg:col-span-3 lg:block">{t.hero.rig}</p>
          <p className="meta text-right lg:col-span-3 lg:text-left">
            {t.hero.localTime} <LiveClock />
          </p>
          <p className="meta hidden text-right lg:col-span-1 lg:block">
            {t.hero.scroll} <span className="inline-block animate-blink text-strobe">↓</span>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
