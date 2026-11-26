"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChromeWordmark } from "@/components/hero/ChromeWordmark";
import { Sigil } from "@/components/chrome/Sigil";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { emit, useSignal } from "@/lib/intro";
import { ramp } from "@/lib/motion";
import { chapterPhotoIds, chapters, photoById, type Photo } from "@/lib/mockData";

const CINE = [0.77, 0, 0.175, 1] as const;
const EXPO = [0.16, 1, 0.3, 1] as const;
const COLUMNS = 5;
const PER_COLUMN = 4;

/**
 * Frames for the light table: portrait shots taken round-robin across the
 * chapters so neighbouring frames change light (EDC → fire → cold …).
 */
const WALL: Photo[] = (() => {
  const lists = chapters.map((c) =>
    chapterPhotoIds(c.id)
      .map((id) => photoById.get(id)!)
      .filter((p) => p.ratio < 1)
  );
  const out: Photo[] = [];
  for (let i = 0; out.length < COLUMNS * PER_COLUMN && i < 40; i++) {
    for (const list of lists) if (list[i] && out.length < COLUMNS * PER_COLUMN) out.push(list[i]);
  }
  return out;
})();

const column = (col: number) =>
  Array.from({ length: PER_COLUMN }, (_, i) => WALL[(col * PER_COLUMN + i) % WALL.length]);

function LiveClock() {
  const [now, setNow] = useState("--:--:--");
  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return <span className="tabular-nums text-strobe">{now}</span>;
}

/**
 * Opening shot. The archive sits on a light table tilted away in 3D, its
 * columns drifting in opposite directions; the chrome wordmark floats in
 * front, with only one line of copy for calm. Scrolling plays a camera
 * pull-back — the table tilts further and swells, the wordmark pushes
 * toward you and dissolves. The pointer adds a little parallax.
 */
export function Hero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const show = useSignal("introDone") || !!reduceMotion;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const wallTilt = useTransform(scrollYProgress, [0, 1], [46, 66]);
  const wallScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const wallY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const nameScale = useTransform(scrollYProgress, [0, 0.7], [1, 1.5]);
  const nameOpacity = useTransform(scrollYProgress, (p) => ramp(p, 0.25, 0.7, 1, 0));
  const railOpacity = useTransform(scrollYProgress, (p) => ramp(p, 0, 0.2, 1, 0));
  const shade = useTransform(scrollYProgress, (p) => ramp(p, 0.4, 1, 0, 0.9));

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-1, 1], [3, -3]), { stiffness: 60, damping: 20 });
  const ry = useSpring(useTransform(px, [-1, 1], [-4, 4]), { stiffness: 60, damping: 20 });
  const lx = useSpring(useTransform(px, [-1, 1], [12, -12]), { stiffness: 60, damping: 20 });
  const ly = useSpring(useTransform(py, [-1, 1], [8, -8]), { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion, px, py]);

  return (
    <section ref={ref} id="top" className="relative h-[190svh]">
      <div className="sticky top-0 h-svh overflow-hidden [perspective:1300px]">
        {/* Light table */}
        <motion.div
          className="absolute inset-0 [transform-style:preserve-3d]"
          style={reduceMotion ? undefined : { rotateX: rx, rotateY: ry }}
          aria-hidden
        >
          <motion.div
            className="absolute -inset-x-[30%] -inset-y-[40%] [transform-style:preserve-3d]"
            style={
              reduceMotion
                ? { rotateX: 46, rotateZ: -12 }
                : { rotateX: wallTilt, scale: wallScale, y: wallY, rotateZ: -12 }
            }
          >
            <motion.div
              className="flex h-full justify-center gap-4 md:gap-6"
              initial={reduceMotion ? false : { opacity: 0, z: -600 }}
              animate={show ? { opacity: 1, z: 0 } : undefined}
              transition={{ duration: 2.4, ease: EXPO }}
            >
              {Array.from({ length: COLUMNS }, (_, col) => {
                const frames = column(col);
                return (
                  <div key={col} className="w-[34vw] shrink-0 overflow-hidden md:w-[17vw]">
                    <div
                      className={`drift flex flex-col gap-4 md:gap-6 ${col % 2 ? "drift--reverse" : ""}`}
                      style={{ ["--drift" as string]: `${70 + col * 9}s` }}
                    >
                      {[...frames, ...frames].map((frame, i) => (
                        <div key={i} className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
                          <Image
                            src={frame.src}
                            alt=""
                            fill
                            sizes="(min-width: 768px) 17vw, 34vw"
                            quality={75}
                            preload={col === 2 && i < 2}
                            className="object-cover opacity-70"
                            style={{ objectPosition: frame.focus ?? "50% 50%" }}
                            onLoad={col === 2 && i === 0 ? () => emit("heroReady") : undefined}
                            onError={col === 2 && i === 0 ? () => emit("heroReady") : undefined}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Lighting: a dark well for the wordmark, deep edges */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 62% 50% at 50% 50%, rgba(5,5,7,0.86) 0%, rgba(5,5,7,0.6) 55%, rgba(5,5,7,0.95) 100%)",
          }}
          aria-hidden
        />
        <motion.div className="pointer-events-none absolute inset-0 bg-void" style={{ opacity: shade }} aria-hidden />

        {/* Name */}
        <motion.div
          className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center"
          style={reduceMotion ? undefined : { scale: nameScale, opacity: nameOpacity, x: lx, y: ly }}
        >
          <motion.p
            className="meta text-strobe/70"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, delay: 0.7, ease: EXPO }}
          >
            {t.hero.labelA} — {t.hero.labelB}
          </motion.p>
          <h1 className="mt-6 w-[94vw] max-w-[1040px] md:mt-8 md:w-[64vw]">
            <span className="sr-only">THRULENSES670</span>
            <motion.span
              className="block"
              initial={reduceMotion ? false : { clipPath: "inset(-60% 50% -60% 50%)", opacity: 0 }}
              animate={show ? { clipPath: "inset(-60% -8% -60% -8%)", opacity: 1 } : undefined}
              transition={{ duration: 1.6, ease: CINE, delay: 0.1 }}
            >
              <ChromeWordmark priority sizes="(min-width: 1625px) 1040px, (min-width: 768px) 64vw, 94vw" />
            </motion.span>
          </h1>
          <motion.span
            className="label-block label-block--chrome mt-8 md:mt-10"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, delay: 0.95, ease: EXPO }}
          >
            <Sigil className="mr-2 h-2.5 w-2.5 -translate-y-px text-void" />
            {t.hero.bar}
            <Sigil className="ml-2 h-2.5 w-2.5 -translate-y-px text-void" />
          </motion.span>
        </motion.div>

        {/* Meta rail */}
        <motion.div
          className="shell absolute inset-x-0 bottom-0 z-10"
          style={reduceMotion ? undefined : { opacity: railOpacity }}
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
      </div>
    </section>
  );
}
