"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Solid signal-red hairline tracking scroll position across the top edge. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-signal"
      aria-hidden
    />
  );
}
