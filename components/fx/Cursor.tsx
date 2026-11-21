"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Pointer companion: a small square outline that trails the cursor and, over
 * anything with `data-cursor`, snaps into a white label block ("VIEW" /
 * "PLAY"). Fine pointers only — never rendered on touch.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 520, damping: 40, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 520, damping: 40, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      setEnabled(true);
      x.set(e.clientX);
      y.set(e.clientY);
      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(target ? ((target as HTMLElement).dataset.cursor ?? null) : null);
    };
    const onLeave = () => setLabel(null);
    window.addEventListener("mousemove", onMove, { passive: true });
    // A click usually opens an overlay; drop the label until the next move.
    window.addEventListener("mousedown", onLeave);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className="pointer-events-none fixed left-0 top-0 z-[95]"
      aria-hidden
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 transition-[width,height,background-color,border-color] duration-150 ease-linear ${
          label
            ? "flex h-[26px] w-[72px] items-center justify-center border border-strobe bg-strobe"
            : "h-2.5 w-2.5 border border-strobe bg-transparent mix-blend-difference"
        }`}
      >
        {label && (
          <span className="font-mono text-[10px] font-medium tracking-[0.18em] text-void">{label}</span>
        )}
      </div>
    </motion.div>
  );
}
