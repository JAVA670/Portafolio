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
import { useLanguage } from "@/components/providers/LanguageProvider";

/**
 * The far side of the glass. The shared camera (CameraJourney) dives through
 * this section: as its lens swallows the viewport, the iris here opens with
 * a strobe pop and rippling focus rings, landing the scroll inside a
 * photograph. Timings are tuned to the camera's flight — its zoom happens
 * over p 0.13–0.37 of this container.
 */
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

  // The DOM photo opens behind the 3D tunnel canvas; by the time the canvas
  // fades (journey P 0.60-0.66 ≈ local 0.40-0.49) it is already near full
  // bleed showing the same frame the tunnel lands on — a clean matte handoff.
  const iris = useTransform(scrollYProgress, [0.3, 0.52], [0, 120]);
  const clipPath = useTransform(iris, (r) => `circle(${r}% at 50% 50%)`);
  const photoScale = useTransform(scrollYProgress, [0.3, 1], [1.18, 1]);

  // Aperture rings rippling outward during the emergence
  const ringScale = useTransform(scrollYProgress, [0.34, 0.62], [0.1, 3.4]);
  const ringOpacity = useTransform(
    scrollYProgress,
    [0.34, 0.46, 0.66],
    [0, 0.9, 0]
  );

  // Strobe pop right as the tunnel hands over to the page
  const flash = useTransform(
    scrollYProgress,
    [0.42, 0.48, 0.58],
    [0, 0.85, 0]
  );

  // HUD
  const hudOpacity = useTransform(
    scrollYProgress,
    [0.02, 0.1, 0.88, 0.98],
    [0, 1, 1, 0]
  );

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setFocal(Math.min(670, Math.max(12, Math.round(12 + v * 730))));
    setInside(v > 0.46);
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
