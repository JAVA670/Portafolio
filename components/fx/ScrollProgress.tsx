"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Hairline tracking scroll position across the top edge: cobalt heating to red. */
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
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-cobalt via-glow to-signal"
      aria-hidden
    />
  );
}
