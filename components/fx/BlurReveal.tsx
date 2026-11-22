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
 * Core scroll-in primitive: elements rise out of the dark and land hard as
 * they enter the viewport. (No blur — the brief is razor-sharp; the name
 * stays for the existing call sites.)
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
          : { opacity: 0, y: distance }
      }
      whileInView={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0 }
      }
      viewport={{ once, margin: "-12% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
