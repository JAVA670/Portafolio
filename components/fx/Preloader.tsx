"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";

/**
 * Signal-acquisition intro: black curtain with a counter burning up to 100,
 * then the curtain lifts to expose the hero. Scroll is locked while it runs.
 */
export function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();

  useEffect(() => {
    if (reduceMotion) return;
    let value = 0;
    const interval = setInterval(() => {
      // Uneven steps read like a real signal lock, not a fake loading bar.
      value = Math.min(100, value + Math.floor(Math.random() * 9) + 2);
      setCount(value);
      if (value >= 100) {
        clearInterval(interval);
        setTimeout(() => setDone(true), 350);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  useEffect(() => {
    if (!lenis || reduceMotion) return;
    if (done) {
      lenis.start();
    } else {
      lenis.stop();
    }
  }, [done, lenis, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-void p-6 sm:p-10"
          aria-hidden
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold uppercase tracking-[0.18em]">
              THROUGHLENSES<span className="text-blood">670</span>
            </p>
            <p className="tech-label-red animate-flicker">
              ACQUIRING SIGNAL
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <p className="tech-label">HARD TECHNO / PHOTO + VIDEO</p>
              <div className="h-[2px] w-40 bg-steel">
                <div
                  className="h-full bg-blood shadow-[0_0_10px_rgba(232,0,45,0.9)] transition-[width] duration-100"
                  style={{ width: `${count}%` }}
                />
              </div>
            </div>
            <p className="font-display text-7xl font-bold leading-none text-blood glow-red sm:text-9xl">
              {count}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
