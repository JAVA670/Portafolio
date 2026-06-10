"use client";

import { motion, useReducedMotion } from "framer-motion";

type BlurRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** How far the element travels up while focusing, in px. */
  distance?: number;
  once?: boolean;
};

/**
 * Core "Rave Scroll" primitive: elements emerge from the dark out of focus,
 * then snap sharp as they enter the viewport.
 */
export function BlurReveal({
  children,
  className,
  delay = 0,
  distance = 32,
  once = true,
}: BlurRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: distance, filter: "blur(14px)" }
      }
      whileInView={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      viewport={{ once, margin: "-12% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
