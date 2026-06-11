"use client";

import { useRef } from "react";
import { useReducedMotion, useScroll } from "framer-motion";
import { Hero } from "@/components/sections/Hero";
import { LensPortal } from "@/components/sections/LensPortal";
import { SharedCamera } from "@/components/fx/SharedCamera";

/**
 * The opening act as one continuous shot: a single camera films the brand
 * name from behind it, dives to center as you scroll, and becomes the
 * portal you fly through into the archive. One scroll context spans both
 * sections so the camera's journey never cuts.
 *
 * DOM order matters: the camera sits BEFORE the hero so the headline paints
 * over it while it films (the hero section has no background of its own).
 */
export function CameraJourney() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className="relative">
      {!reduceMotion && <SharedCamera progress={scrollYProgress} />}
      <Hero />
      <LensPortal />
    </div>
  );
}
