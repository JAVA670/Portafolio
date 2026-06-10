"use client";

import { motion, useReducedMotion } from "framer-motion";

type TextRevealProps = {
  text: string;
  className?: string;
  delay?: number;
  /** Per-character stagger in seconds. */
  stagger?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
};

/**
 * Editorial masked-type reveal: each character rises out of a clipped line,
 * staggered left to right.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.035,
  immediate = false,
}: TextRevealProps) {
  const reduceMotion = useReducedMotion();
  const chars = Array.from(text);

  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} aria-label={text} role="text">
      {chars.map((char, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            aria-hidden
            className="inline-block"
            initial={{ y: "115%" }}
            {...(immediate
              ? { animate: { y: "0%" } }
              : {
                  whileInView: { y: "0%" },
                  viewport: { once: true, margin: "-10% 0px" },
                })}
            transition={{
              duration: 0.8,
              delay: delay + i * stagger,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            {char === " " ? " " : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
