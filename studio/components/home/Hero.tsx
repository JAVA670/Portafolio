"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { LensMark, Wordmark } from "@/components/brand/Logo";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { allFrames } from "@/lib/sessions";
import { ramp } from "@/lib/motion";

const CINE = [0.77, 0, 0.175, 1] as const;
const EXPO = [0.16, 1, 0.3, 1] as const;
const COLUMNS = 5;
const PER_COLUMN = 4;

/** Frames for one drifting column, offset so neighbours never match. */
function columnFrames(col: number) {
  if (!allFrames.length) return [];
  return Array.from({ length: PER_COLUMN }, (_, i) => allFrames[(col * 2 + i) % allFrames.length]);
}

/**
 * Opening shot. A light table of the studio's photographs sits on a plane
 * tilted away in 3D, its columns drifting in opposite directions; the
 * studio lockup floats in front. Scrolling plays an After-Effects-style
 * camera move — the plane tilts further back and swells while the logo
 * pushes toward the viewer and dissolves. The pointer adds a little
 * parallax. Under reduced motion everything holds still.
 */
export function Hero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const wallTilt = useTransform(scrollYProgress, [0, 1], [46, 64]);
  const wallScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const wallY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const logoScale = useTransform(scrollYProgress, [0, 0.7], [1, 1.45]);
  const logoOpacity = useTransform(scrollYProgress, (p) => ramp(p, 0.25, 0.7, 1, 0));
  const railOpacity = useTransform(scrollYProgress, (p) => ramp(p, 0, 0.2, 1, 0));
  const shade = useTransform(scrollYProgress, (p) => ramp(p, 0.4, 1, 0, 0.85));

  // Pointer parallax.
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
    <section ref={ref} id="top" data-tone="dark" className="relative h-[190svh] bg-night text-white">
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
              animate={{ opacity: 1, z: 0 }}
              transition={{ duration: 2.4, ease: EXPO }}
            >
              {Array.from({ length: COLUMNS }, (_, col) => {
                const frames = columnFrames(col);
                return (
                  <div key={col} className="w-[34vw] shrink-0 overflow-hidden md:w-[17vw]">
                    <div
                      className={`drift flex flex-col gap-4 md:gap-6 ${col % 2 ? "drift--reverse" : ""}`}
                      style={{ ["--drift" as string]: `${70 + col * 9}s` }}
                    >
                      {[...frames, ...frames].map((frame, i) => (
                        <div key={i} className="relative aspect-[4/5] w-full overflow-hidden bg-night-2">
                          {frame && (
                            <Image
                              src={frame.src}
                              alt=""
                              fill
                              sizes="(min-width: 768px) 17vw, 34vw"
                              quality={75}
                              preload={col === 2 && i < 2}
                              className="object-cover opacity-70"
                              style={{ objectPosition: frame.focus ?? "50% 50%" }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Lighting: dark well in the middle for the logo, deep edges */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 48% at 50% 50%, rgba(10,10,11,0.86) 0%, rgba(10,10,11,0.62) 55%, rgba(10,10,11,0.94) 100%)",
          }}
          aria-hidden
        />
        <motion.div className="pointer-events-none absolute inset-0 bg-night" style={{ opacity: shade }} aria-hidden />

        {/* Lockup */}
        <motion.div
          className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center"
          style={reduceMotion ? undefined : { scale: logoScale, opacity: logoOpacity, x: lx, y: ly }}
        >
          <h1 className="flex flex-col items-center">
            <span className="sr-only">Thrulenses Studio</span>
            {/* Lens mark draws itself in */}
            <LensMark draw className="h-[clamp(56px,7vw,96px)] w-[clamp(56px,7vw,96px)]" strokeWidth={1.1} />
            {/* THRULENSES rises out of its line */}
            <span className="mt-8 block overflow-hidden pb-[0.06em] md:mt-10" aria-hidden>
              <motion.span
                className="block text-[clamp(30px,6.6vw,104px)] leading-none"
                initial={reduceMotion ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.3, ease: CINE, delay: 0.55 }}
              >
                <Wordmark className="-mr-[0.28em]" />
              </motion.span>
            </span>
            {/* — STUDIO — */}
            <motion.span
              className="mt-5 flex w-full max-w-[min(88vw,720px)] items-center gap-5 md:mt-7"
              initial={reduceMotion ? false : { opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1.2, ease: CINE, delay: 0.9 }}
              aria-hidden
            >
              <span className="h-px flex-1 bg-white/30" />
              <span className="font-logo -mr-[0.5em] text-[clamp(12px,1.4vw,18px)] uppercase tracking-[0.5em] text-white/75">
                Studio
              </span>
              <span className="h-px flex-1 bg-white/30" />
            </motion.span>
          </h1>
          <motion.p
            className="serif mt-8 text-[clamp(20px,2.4vw,34px)] italic text-white/85 md:mt-10"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.15, ease: EXPO }}
          >
            {t.hero.line}
          </motion.p>
        </motion.div>

        {/* Rail */}
        <motion.div
          className="shell absolute inset-x-0 bottom-0 z-10"
          style={reduceMotion ? undefined : { opacity: railOpacity }}
        >
          <div className="flex items-center justify-between border-t border-fog py-5">
            <p className="eyebrow text-white/60">{t.hero.based}</p>
            <p className="eyebrow flex items-center gap-3 text-white/60">
              {t.hero.scroll}
              <span className="relative block h-8 w-px overflow-hidden bg-white/20" aria-hidden>
                <motion.span
                  className="absolute inset-x-0 top-0 h-1/2 bg-white"
                  animate={reduceMotion ? undefined : { y: ["-100%", "200%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
