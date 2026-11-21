"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";

type TextRevealProps = {
  text: string;
  className?: string;
  delay?: number;
  /** Per-character stagger in seconds. */
  stagger?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
  /** Class applied to every character (e.g. gradient-clipped chrome type). */
  charClassName?: string;
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
  charClassName = "",
}: TextRevealProps) {
  const reduceMotion = useReducedMotion();

  // Group characters into words so lines only ever break between words.
  const words = text.split(" ");
  const offsets = words.map((_, w) =>
    words.slice(0, w).reduce((sum, word) => sum + word.length, 0)
  );

  return (
    <motion.span
      className={className}
      aria-label={text}
      role="text"
      // Same markup on server and client (no hydration mismatch); reduced
      // motion simply starts in the final state.
      initial={reduceMotion ? false : "hidden"}
      // The trigger lives on the (unclipped) wrapper — the characters
      // themselves start translated out of their masks, so observing them
      // directly would never report an intersection.
      {...(immediate
        ? { animate: "show" }
        : { whileInView: "show", viewport: { once: true, margin: "-8% 0px" } })}
    >
      {words.map((word, w) => (
        <Fragment key={w}>
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, c) => {
              const i = offsets[w] + c;
              return (
                <span key={i} className="inline-block overflow-hidden align-bottom">
                  <motion.span
                    aria-hidden
                    className={`inline-block ${charClassName}`}
                    variants={{
                      hidden: { y: "115%" },
                      show: {
                        y: "0%",
                        transition: {
                          duration: 0.7,
                          delay: delay + i * stagger,
                          ease: [0.76, 0, 0.24, 1],
                        },
                      },
                    }}
                  >
                    {char}
                  </motion.span>
                </span>
              );
            })}
          </span>
          {w < words.length - 1 && " "}
        </Fragment>
      ))}
    </motion.span>
  );
}
