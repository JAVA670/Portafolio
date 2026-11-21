"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.77, 0, 0.175, 1] as const;

/**
 * Editorial image entrance: the frame wipes open bottom → top while the
 * picture inside settles from a slight zoom.
 *
 * The in-view trigger lives on an unclipped wrapper and the clip-path on a
 * child: an element whose own clip-path is fully closed can read as
 * zero-area to IntersectionObserver, so observing it directly fails when
 * the page jumps (anchor links) and a frame is only partly on screen.
 * Same markup with reduced motion (it simply starts revealed).
 */
export function ImageReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={`relative ${className}`}
      initial={reduceMotion ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden"
        variants={{
          hidden: { clipPath: "inset(100% 0 0 0)" },
          shown: { clipPath: "inset(0% 0 0 0)", transition: { duration: 0.95, ease: EASE, delay } },
        }}
      >
        <motion.div
          className="absolute inset-0"
          variants={{
            hidden: { scale: 1.14 },
            shown: { scale: 1, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay } },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
