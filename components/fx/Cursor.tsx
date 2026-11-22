"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Sigil } from "@/components/chrome/Sigil";

/**
 * Pointer companion: a thin crosshair with a thorn-star core that trails
 * the cursor and, over anything with `data-cursor`, snaps into a
 * razor-cut white label ("VIEW" / "PLAY"). Fine pointers only.
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
      {label ? (
        <div className="cut-sm flex h-[26px] -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 bg-strobe px-2.5">
          <Sigil className="h-2.5 w-2.5 text-void" />
          <span className="font-mono text-[10px] font-medium tracking-[0.18em] text-void">{label}</span>
        </div>
      ) : (
        <div className="relative h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-strobe mix-blend-difference">
          <span className="absolute left-0 top-1/2 h-px w-[8px] bg-current" />
          <span className="absolute right-0 top-1/2 h-px w-[8px] bg-current" />
          <span className="absolute left-1/2 top-0 h-[8px] w-px bg-current" />
          <span className="absolute bottom-0 left-1/2 h-[8px] w-px bg-current" />
          <Sigil className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
    </motion.div>
  );
}
