"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { CameraIllustration } from "@/components/fx/FloatingCamera";
import { useLanguage } from "@/components/providers/LanguageProvider";

/**
 * THE transition. A pinned 300vh sequence between the hero and the archive:
 * the camera flies toward the viewer until its lens swallows the viewport,
 * the aperture iris opens with a strobe pop, and the scroll lands inside a
 * photograph — literally going through the lens.
 *
 * The lens glass sits at 50% / 52.2% of the camera SVG, so every zoom layer
 * shares that transform origin.
 */
const LENS_ORIGIN = "50% 52.2%";

export function LensPortal() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [focal, setFocal] = useState(12);
  const [inside, setInside] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Phase A — the camera flies at you (origin on the lens glass)
  const camScale = useTransform(scrollYProgress, [0, 0.55], [0.9, 12]);
  const camOpacity = useTransform(scrollYProgress, [0, 0.42, 0.58], [1, 1, 0]);

  // Phase B — the photo opens through an expanding iris
  const iris = useTransform(scrollYProgress, [0.34, 0.92], [0, 120]);
  const clipPath = useTransform(iris, (r) => `circle(${r}% at 50% 50%)`);
  const photoScale = useTransform(scrollYProgress, [0.34, 1], [1.45, 1]);

  // Aperture rings rippling outward as the glass breaks open
  const ringScale = useTransform(scrollYProgress, [0.36, 0.75], [0.1, 3.4]);
  const ringOpacity = useTransform(
    scrollYProgress,
    [0.36, 0.5, 0.78],
    [0, 0.9, 0]
  );

  // Strobe pop at the moment of breakthrough
  const flash = useTransform(
    scrollYProgress,
    [0.4, 0.46, 0.54],
    [0, 0.9, 0]
  );

  // HUD
  const hudOpacity = useTransform(
    scrollYProgress,
    [0.02, 0.1, 0.88, 0.98],
    [0, 1, 1, 0]
  );

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setFocal(Math.min(670, Math.max(12, Math.round(12 + v * 730))));
    setInside(v > 0.55);
  });

  if (reduceMotion) return null;

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-void">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* The photograph waiting on the other side of the glass */}
        <motion.div
          style={{ clipPath, scale: photoScale }}
          className="absolute inset-0"
        >
          <Image
            src="/assets/photography/diablo-03.jpg"
            alt="The evil under fire — red neon over the dancefloor"
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Chromatic breathing on the iris edge */}
          <div className="absolute inset-0 shadow-[inset_0_0_140px_60px_rgba(232,0,45,0.28)]" />
        </motion.div>

        {/* Aperture rings rippling outward */}
        {[0, 1, 2].map((ring) => (
          <motion.div
            key={ring}
            style={{
              scale: ringScale,
              opacity: ringOpacity,
              transitionDelay: `${ring * 60}ms`,
            }}
            className={`pointer-events-none absolute left-1/2 top-1/2 -ml-[24vmin] -mt-[24vmin] h-[48vmin] w-[48vmin] rounded-full border ${
              ring === 1 ? "border-laser/70" : "border-crimson"
            }`}
          />
        ))}

        {/* The camera you fly through */}
        <motion.div
          style={{
            scale: camScale,
            opacity: camOpacity,
            transformOrigin: LENS_ORIGIN,
          }}
          className="absolute left-1/2 top-1/2 w-[82vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 sm:w-[44vw]"
        >
          <CameraIllustration />
        </motion.div>

        {/* Strobe pop */}
        <motion.div
          style={{ opacity: flash }}
          className="pointer-events-none absolute inset-0 bg-strobe mix-blend-screen"
        />

        {/* HUD chrome */}
        <motion.div
          style={{ opacity: hudOpacity }}
          className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-10"
        >
          <div className="flex items-center justify-between">
            <p className="tech-label-red">▮ {t.lens.label}</p>
            <p className="tech-label-red animate-flicker">
              {inside ? t.lens.lock : t.lens.enter}
            </p>
          </div>
          <div className="flex items-end justify-between">
            <p className="tech-label">
              ƒ/1.4 — {String(focal).padStart(3, "0")}MM
            </p>
            <div className="h-[2px] w-32 bg-steel">
              <motion.div
                style={{ scaleX: scrollYProgress }}
                className="h-full origin-left bg-blood shadow-[0_0_10px_rgba(232,0,45,0.9)]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
