"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Blood-red laser line tracking scroll position across the top edge. */
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
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-blood shadow-[0_0_12px_rgba(232,0,45,0.9)]"
      aria-hidden
    />
  );
}
