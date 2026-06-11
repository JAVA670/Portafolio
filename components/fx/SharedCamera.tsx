"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  type MotionValue,
} from "framer-motion";
import { CameraIllustration } from "@/components/fx/CameraIllustration";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

type SharedCameraProps = {
  /** Combined scroll progress over hero + lens portal (0 → 1). */
  progress: MotionValue<number>;
};

/**
 * The one camera of the opening act. It films from BEHIND the brand name —
 * a slow handheld pan left to right, tilting gently into the motion, REC
 * tally blinking. Scrolling pulls it to center, brings it forward through
 * the letters, and dives through its lens into the portal.
 *
 * Stacking: rendered before the hero in the DOM with z-index 0, so the
 * headline paints over it. Once the dive starts, z-index jumps above the
 * page so it can pass through the letters and over the portal.
 */
export function SharedCamera({ progress }: SharedCameraProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(0.95);
  const rotate = useMotionValue(0);
  const opacity = useMotionValue(0);
  const zIndex = useMotionValue(0);

  useAnimationFrame((t) => {
    const P = progress.get();
    if (P > 0.5) {
      opacity.set(0);
      return;
    }

    const W = window.innerWidth;

    // --- FILMING PAN: slow left↔right sweep behind the letters, easing at
    // the edges like a videographer reframing; gentle bob; tilt follows the
    // direction of travel (handheld feel).
    const phase = (t / 1000) * 0.42;
    const px = Math.sin(phase) * W * 0.22;
    const py = Math.sin(t / 1400) * 14;
    const tilt = Math.cos(phase) * 3.5;

    // --- DESCENT: scroll pulls it from the pan to dead center.
    const blend = ease(clamp01((P - 0.1) / 0.2));
    const cx = lerp(px, 0, blend);
    const cy = lerp(py, 0, blend);

    // --- APPROACH: forward through the letters — only a gentle grow; the
    // real travel is the 3D tunnel (LensTunnel), which crossfades in before
    // this vector asset could ever scale enough to soften.
    const approach = lerp(0.95, 1.15, ease(clamp01((P - 0.26) / 0.14)));
    const zoom = clamp01((P - 0.34) / 0.1);
    const s = approach * (1 + zoom * 1.5);

    // Entrance after the preloader curtain; handoff to the tunnel.
    const intro = clamp01((t - 1400) / 900);
    const exit = 1 - clamp01((P - 0.4) / 0.05);

    x.set(cx);
    y.set(cy);
    scale.set(s);
    rotate.set(tilt * (1 - blend));
    opacity.set(intro * exit);
    // Behind the headline while filming; above the page for the dive.
    zIndex.set(blend > 0.05 ? 30 : 0);
  });

  return (
    <motion.div
      style={{ x, y, scale, rotate, opacity, zIndex, transformOrigin: "50% 52.2%" }}
      className="pointer-events-none fixed left-1/2 top-1/2 w-[74vw] max-w-[540px] -translate-x-1/2 -translate-y-1/2 will-change-transform sm:w-[38vw]"
      aria-hidden
    >
      {/* Red backlight halo so the body separates from the void */}
      <div className="absolute inset-[-12%] rounded-full bg-blood/15 blur-3xl" />
      <CameraIllustration />
    </motion.div>
  );
}
