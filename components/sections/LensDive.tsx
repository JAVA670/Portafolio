"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { ramp } from "@/lib/motion";
import { heroRender } from "@/lib/mockData";

/** Centre of the front lens element in chrome-camera-hero.png (% of the image). */
const LENS = { x: 35, y: 62 };

/**
 * "Through the lens" — the chrome camera's own pinned scene between the
 * hero and the work.
 *
 * 1. The camera rises out of the dark, settling from a tilt, under its
 *    cobalt backlight while the title wipes in.
 * 2. The title clears; the camera turns a touch to face you and the shot
 *    pushes in, scaling around the front lens until the glass fills the
 *    frame.
 * 3. The glass falls to black — and the work begins.
 *
 * Same markup with reduced motion (no hydration mismatch): the motion
 * styles are simply not applied and CSS unpins it into a captioned still.
 */
export function LensDive() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // 1 — arrive. 2 — while pushing in, drift so the lens (not the body)
  // ends up dead centre: it sits 15% left / 12% below the image centre.
  const driftX = useTransform(p, (v) => `${ramp(v, 0.36, 0.8, 0, 50 - LENS.x)}%`);
  const rise = useTransform(p, (v) => `${ramp(v, 0, 0.22, 26, 0) + ramp(v, 0.36, 0.8, 0, 50 - LENS.y)}%`);
  const tilt = useTransform(p, (v) => ramp(v, 0, 0.22, 24, 0) + ramp(v, 0.4, 0.9, 0, -8));
  const turn = useTransform(p, (v) => ramp(v, 0.3, 0.9, 0, 14));
  const appear = useTransform(p, (v) => ramp(v, 0, 0.16, 0, 1));
  // 2 — push in through the lens (exponential, so the speed feels constant)
  const scale = useTransform(p, (v) => Math.pow(7, ramp(v, 0.36, 0.9, 0, 1)));
  const glow = useTransform(p, (v) => ramp(v, 0, 0.2, 0, 1) * ramp(v, 0.5, 0.85, 1, 0.2));
  // 3 — into black
  const black = useTransform(p, (v) => ramp(v, 0.76, 0.92, 0, 1));
  // copy
  const titleOpacity = useTransform(p, (v) => ramp(v, 0.08, 0.2, 0, 1) * ramp(v, 0.34, 0.46, 1, 0));
  const titleY = useTransform(p, (v) => `${ramp(v, 0.08, 0.46, 30, -40)}px`);
  const titleSpacing = useTransform(p, (v) => `${ramp(v, 0.08, 0.46, 0.04, 0.22)}em`);

  const still = !!reduceMotion;

  return (
    <section
      ref={ref}
      className="relative h-[250svh] motion-reduce:h-auto motion-reduce:py-24"
      aria-label={t.lens.title}
    >
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden [perspective:1400px] motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible">
        {/* Cobalt backlight */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[90vmin] w-[140vmin] -translate-x-1/2 -translate-y-1/2 opacity-0 motion-reduce:opacity-60"
          style={{
            ...(still ? {} : { opacity: glow }),
            background:
              "radial-gradient(closest-side, rgba(0,56,255,0.55), rgba(0,56,255,0.2) 45%, rgba(0,56,255,0) 75%)",
          }}
        />

        {/* Title */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[13svh] z-10 px-5 text-center md:top-[11svh] motion-reduce:static"
          style={still ? undefined : { opacity: titleOpacity, y: titleY }}
        >
          <p className="meta text-strobe/70">{t.lens.kicker}</p>
          <motion.h2
            className="display chrome-text mt-4 text-[clamp(40px,7vw,124px)] leading-none"
            style={still ? undefined : { letterSpacing: titleSpacing }}
          >
            {t.lens.title}
          </motion.h2>
          <p className="mx-auto mt-4 hidden max-w-[40ch] text-[14px] text-mute motion-reduce:block md:text-[15px]">{t.lens.sub}</p>
        </motion.div>

        {/* Camera — scales around its own front lens */}
        <motion.div
          className="relative mt-[10svh] w-[120vw] max-w-[1180px] will-change-transform md:w-[72vw] motion-reduce:mt-10"
          style={{
            ...(still ? {} : { x: driftX, y: rise, rotateX: tilt, rotateY: turn, scale, opacity: appear }),
            transformOrigin: `${LENS.x}% ${LENS.y}%`,
            aspectRatio: `${heroRender.width} / ${heroRender.height}`,
          }}
        >
          <Image
            src={heroRender.src}
            alt="Liquid-chrome mirrorless camera wrapped in spiked metal tendrils"
            fill
            sizes="(min-width: 1640px) 1180px, (min-width: 768px) 72vw, 120vw"
            quality={85}
            className="object-contain mix-blend-lighten"
          />
        </motion.div>

        {/* Into the glass */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-void opacity-0 motion-reduce:hidden"
          style={still ? undefined : { opacity: black }}
        />
      </div>
    </section>
  );
}
