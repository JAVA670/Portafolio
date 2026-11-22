"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { emit, useSignal } from "@/lib/intro";
import { ChromeWordmark } from "@/components/hero/ChromeWordmark";
import { ChromeSigil } from "@/components/chrome/Ornaments";

const MIN_MS = 900;
const MAX_MS = 2200;

/**
 * Boot sequence. A mono counter runs while the hero render decodes; once it
 * is ready (or after a hard ceiling) the counter completes and the curtain
 * wipes up. Scroll is locked while it runs.
 */
export function Preloader() {
  const reduceMotion = useReducedMotion();
  const heroReady = useSignal("heroReady");
  const lenis = useLenis();
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    readyRef.current = heroReady;
  }, [heroReady]);

  // Counter eases toward 90 while waiting, then finishes once ready.
  useEffect(() => {
    if (reduceMotion) {
      const id = window.setTimeout(() => {
        setDone(true);
        emit("introDone");
      }, 0);
      return () => window.clearTimeout(id);
    }
    if (done) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      setCount((prev) => {
        const ceiling = readyRef.current && elapsed > MIN_MS ? 100 : 90;
        const next = prev + Math.max(0.6, (ceiling - prev) * 0.08);
        return Math.min(ceiling, next);
      });
      if (elapsed > MAX_MS) setCount(100);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, done]);

  useEffect(() => {
    if (count < 100 || done) return;
    const id = window.setTimeout(() => {
      setDone(true);
      emit("introDone");
    }, 180);
    return () => window.clearTimeout(id);
  }, [count, done]);

  useEffect(() => {
    if (!lenis) return;
    if (done) lenis.start();
    else lenis.stop();
  }, [done, lenis]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-void motion-reduce:hidden"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
          aria-hidden
        >
          <div className="shell flex items-center justify-between pt-5">
            <span className="label-block">CONCERT PHOTOGRAPHY / FILM</span>
            <span className="meta hidden sm:block">BOOT // ARCHIVE</span>
          </div>

          <div className="shell flex flex-col items-center gap-6">
            <ChromeSigil className="sigil-spin w-14 md:w-20" sizes="80px" />
            <ChromeWordmark glint={false} priority className="w-[88vw] max-w-[860px]" sizes="(min-width: 980px) 860px, 88vw" />
          </div>

          <div className="shell pb-6">
            <div className="flex items-end justify-between">
              <span className="meta">LOADING THE ARCHIVE</span>
              <span className="display text-[22vw] leading-[0.8] tabular-nums sm:text-[12vw]">
                {String(Math.floor(count)).padStart(3, "0")}
              </span>
            </div>
            <div className="mt-4 h-px w-full bg-hairline">
              <div className="h-full bg-strobe" style={{ width: `${count}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
