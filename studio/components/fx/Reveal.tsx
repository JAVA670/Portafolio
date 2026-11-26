"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * Words rise out of their own masked lines, staggered — a title-sequence
 * reveal. The in-view trigger sits on the unclipped wrapper (masked
 * children never report an intersection). Same markup under reduced motion.
 */
export function WordsReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.06,
  immediate = false,
  wordClassName = "",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
  wordClassName?: string;
}) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      aria-label={text}
      role="text"
      initial={reduceMotion ? false : "hidden"}
      {...(immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-10% 0px" } })}
    >
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              aria-hidden
              className={`inline-block ${wordClassName}`}
              variants={{
                hidden: { y: "110%", rotateX: -60 },
                show: {
                  y: "0%",
                  rotateX: 0,
                  transition: { duration: 1, delay: delay + i * stagger, ease: EXPO },
                },
              }}
              style={{ transformOrigin: "50% 100%" }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </motion.span>
  );
}

/** Generic rise-in from depth for blocks. */
export function Rise({
  children,
  className = "",
  delay = 0,
  y = 40,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1, delay, ease: EXPO }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Photo entrance: the frame opens from the bottom while the image settles
 * from a slight zoom. Trigger on the unclipped wrapper, clip on the child.
 */
export function ImageReveal({
  children,
  className = "",
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={`relative ${className}`}
      style={style}
      initial={reduceMotion ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden"
        variants={{
          hidden: { clipPath: "inset(100% 0 0 0)" },
          shown: { clipPath: "inset(0% 0 0 0)", transition: { duration: 1.1, ease: [0.77, 0, 0.175, 1], delay } },
        }}
      >
        <motion.div
          className="absolute inset-0"
          variants={{
            hidden: { scale: 1.18 },
            shown: { scale: 1, transition: { duration: 1.6, ease: EXPO, delay } },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
