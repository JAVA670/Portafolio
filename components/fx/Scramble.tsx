"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+<>/\\|=_";
const randGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

type ScrambleProps = {
  text: string;
  className?: string;
  /** ms before decoding starts once in view */
  delay?: number;
  /** Start immediately on mount instead of on scroll into view. */
  immediate?: boolean;
};

/**
 * Terminal-style decode: characters resolve left to right out of random
 * glyphs, with a short run of noise ahead of the cursor. Screen readers get
 * the final text; the animation layer is aria-hidden.
 */
export function Scramble({ text, className, delay = 0, immediate = false }: ScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();
  // Starts blank; the decode fills it in once the line scrolls into view.
  const [out, setOut] = useState("\u00a0");
  const started = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      const id = window.setTimeout(() => setOut(text), 0);
      return () => window.clearTimeout(id);
    }
    if (started.current || !(immediate || inView)) return;
    started.current = true;
    let pos = 0;
    let id = 0;
    const timer = window.setTimeout(() => {
      id = window.setInterval(() => {
        pos += 0.55;
        const shown = Math.floor(pos);
        let next = "";
        for (let i = 0; i < text.length; i++) {
          if (i >= shown + 3) break;
          next += text[i] === " " ? " " : i < shown ? text[i] : randGlyph();
        }
        setOut(next || " ");
        if (shown >= text.length) {
          window.clearInterval(id);
          setOut(text);
        }
      }, 24);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(id);
    };
  }, [inView, immediate, delay, text, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{out}</span>
    </span>
  );
}
