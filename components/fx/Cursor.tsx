"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor: a blend-difference ring trailing the pointer, which inflates
 * into a labelled red disc over anything carrying a `data-cursor` attribute
 * (e.g. data-cursor="VIEW" / "PLAY"). Pointer-only — never rendered on touch.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 450, damping: 38, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 450, damping: 38, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      setEnabled(true);
      x.set(e.clientX);
      y.set(e.clientY);
      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(target ? (target as HTMLElement).dataset.cursor ?? null : null);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className="pointer-events-none fixed left-0 top-0 z-[95]"
      aria-hidden
    >
      <motion.div
        animate={
          label
            ? { width: 64, height: 22, backgroundColor: "rgba(0,56,255,1)" }
            : { width: 12, height: 12, backgroundColor: "rgba(255,255,255,0)" }
        }
        transition={{ duration: 0.15, ease: "linear" }}
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-strobe"
      >
        {label && (
          <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-strobe">
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
