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

/**
 * Centered hero: the name set edge to edge on one line, with the chrome
 * camera floating directly behind the letters and the role labels stacked
 * above.
 */
export function Hero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const show = useSignal("introDone") || !!reduceMotion;
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const nameY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <section ref={ref} id="top" className="relative h-svh min-h-[640px] overflow-hidden">
      {/* 12-column architectural hairlines */}
      <div className="shell pointer-events-none absolute inset-0" aria-hidden>
        <div className="grid-lines h-full w-full" />
      </div>

      <motion.div
        style={reduceMotion ? undefined : { opacity: fade }}
        className="shell relative z-10 flex h-full flex-col items-center justify-center pb-16 pt-16 text-center"
      >
        {/* Role stack */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <Wipe delay={0.25} show={show}>
            <span className="label-block">{t.hero.labelA}</span>
          </Wipe>
          <Wipe delay={0.35} show={show}>
            <span className="label-block">{t.hero.labelB}</span>
          </Wipe>
          <Wipe delay={0.45} show={show}>
            <span className="label-block label-block--cobalt">{t.hero.bar}</span>
          </Wipe>
        </div>

        {/* Name with the camera behind it */}
        <div className="relative mt-10 w-full md:mt-6">
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[118vw] max-w-[1080px] -translate-x-1/2 -translate-y-1/2 md:w-[68vw]">
            <CameraRender
              src={heroRender.src}
              width={heroRender.width}
              height={heroRender.height}
              video={heroRender.video}
              alt="Liquid-chrome mirrorless camera wrapped in spiked metal tendrils"
              priority
              progress={scrollYProgress}
            />
          </div>

          <motion.div
            style={reduceMotion ? undefined : { y: nameY }}
            className="relative z-10 [container-type:inline-size]"
          >
            <h1 className="display overflow-hidden whitespace-nowrap py-[0.04em] text-[calc(100cqw/5.86)] leading-[0.86] [text-shadow:0_6px_48px_rgba(0,0,0,0.45)]">
              <motion.span
                className="block"
                initial={reduceMotion ? false : { y: "105%" }}
                animate={show ? { y: "0%" } : undefined}
                transition={{ duration: 1.1, ease: EASE_SWISS, delay: 0.05 }}
              >
                THRULENSES670
              </motion.span>
            </h1>
          </motion.div>
        </div>

        <motion.p
          className="relative z-10 mt-8 max-w-[44ch] bg-void/70 px-3 py-2 text-[14px] leading-[1.5] text-strobe/80 backdrop-blur-sm md:mt-10 md:text-[15px]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={show ? { opacity: 1 } : undefined}
          transition={{ duration: 0.3, ease: "linear", delay: 0.75 }}
        >
          {t.hero.statement}
        </motion.p>
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
