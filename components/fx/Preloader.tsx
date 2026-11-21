"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";

/**
 * Cold boot sequence: a white label block, a mono counter ticking
 * 000 → 100 and a cobalt bar filling underneath — then a hard cut to the
 * hero (no fade, no slide). Scroll is locked while it runs.
 */
export function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();

  useEffect(() => {
    if (reduceMotion) {
      const id = window.setTimeout(() => setDone(true), 0);
      return () => window.clearTimeout(id);
    }
    let value = 0;
    let cut = 0;
    const interval = window.setInterval(() => {
      value = Math.min(100, value + Math.floor(Math.random() * 7) + 4);
      setCount(value);
      if (value >= 100) {
        window.clearInterval(interval);
        cut = window.setTimeout(() => setDone(true), 140);
      }
    }, 45);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(cut);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!lenis || reduceMotion) return;
    if (done) lenis.start();
    else lenis.stop();
  }, [done, lenis, reduceMotion]);

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-void p-4 motion-reduce:hidden sm:p-8"
      aria-hidden
    >
      <div className="flex items-start justify-between">
        <span className="label-block text-sm sm:text-base">THRULENSES670</span>
        <span className="meta">BOOT / SIGNAL</span>
      </div>

      <div>
        <div className="flex items-end justify-between">
          <span className="meta">LOADING ARCHIVE</span>
          <span className="font-mono text-6xl font-bold leading-none tabular-nums sm:text-8xl">
            {String(count).padStart(3, "0")}
          </span>
        </div>
        <div className="mt-4 h-[3px] w-full bg-steel">
          <div className="h-full bg-cobalt" style={{ width: `${count}%` }} />
        </div>
      </div>
    </div>
  );
}
