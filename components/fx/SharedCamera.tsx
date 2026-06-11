"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { CameraIllustration } from "@/components/fx/FloatingCamera";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Smooth ease for phase blending
const ease = (t: number) => t * t * (3 - 2 * t);

type SharedCameraProps = {
  /** Combined scroll progress over hero + lens portal (0 → 1). */
  progress: MotionValue<number>;
};

/**
 * ONE camera for the whole opening act, driven frame-by-frame:
 *
 *  P 0.00–0.12  ORBIT  — circles the brand name like a shooter working the
 *                        pit: banking, drifting near/far, strobe popping as
 *                        it takes frames of the name.
 *  P 0.12–0.30  DESCENT — scroll pulls it out of orbit to dead center.
 *  P 0.30–0.42  APPROACH — grows to full size, aiming its lens at you.
 *  P 0.42–0.58  THROUGH — zoom locked on the lens glass until the glass
 *                        swallows the viewport and the portal iris opens.
 */
export function SharedCamera({ progress }: SharedCameraProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(0.45);
  const rotate = useMotionValue(0);
  const opacity = useMotionValue(0);
  const flash = useMotionValue(0);
  const globalFlash = useTransform(flash, (f) => f * 0.16);

  useAnimationFrame((t) => {
    const P = progress.get();
    if (P > 0.66) {
      opacity.set(0);
      flash.set(0);
      return;
    }

    const W = window.innerWidth;
    const H = window.innerHeight;

    // --- ORBIT: elliptical path around the headline, banking into turns,
    // breathing closer/farther for depth.
    const theta = (t / 1000) * 0.55;
    const ox = Math.cos(theta) * W * 0.3;
    const oy = Math.sin(theta) * H * 0.16 + Math.sin(t / 900) * 8;
    const depth = 0.42 + Math.sin(theta) * 0.09;

    // --- DESCENT: scroll dissolves the orbit into dead center.
    const blend = ease(clamp01((P - 0.12) / 0.18));
    const cx = lerp(ox, 0, blend);
    const cy = lerp(oy, 0, blend);

    // --- APPROACH + THROUGH: grow, then dive through the glass.
    const approach = lerp(depth, 1, ease(clamp01((P - 0.3) / 0.12)));
    const zoom = clamp01((P - 0.42) / 0.16);
    const s = approach * (1 + zoom * zoom * 11);

    // Banking tilt only matters while orbiting.
    const tilt = Math.sin(theta + 0.6) * 9 * (1 - blend);

    // Entrance fade (after the preloader curtain) and exit through the glass.
    const intro = clamp01((t - 1100) / 800);
    const exit = 1 - clamp01((P - 0.555) / 0.05);
    // On the far side of the orbit the body dims — it reads as passing
    // behind the glowing name.
    const depthFade = lerp(lerp(0.45, 1, (Math.sin(theta) + 1) / 2), 1, blend);

    // Strobe pop every 2.6s while shooting the name.
    const cycle = t % 2600;
    const pop = cycle < 150 ? 1 - cycle / 150 : 0;

    x.set(cx);
    y.set(cy);
    scale.set(s);
    rotate.set(tilt);
    opacity.set(intro * exit * depthFade);
    flash.set(pop * (1 - blend) * intro);
  });

  return (
    <>
      {/* Full-screen spill of the strobe pop */}
      <motion.div
        style={{ opacity: globalFlash }}
        className="pointer-events-none fixed inset-0 z-[14] bg-strobe mix-blend-screen"
        aria-hidden
      />

      <motion.div
        style={{ x, y, scale, rotate, opacity, transformOrigin: "50% 52.2%" }}
        className="pointer-events-none fixed left-1/2 top-1/2 z-[15] w-[62vw] max-w-[440px] -translate-x-1/2 -translate-y-1/2 will-change-transform sm:w-[32vw]"
        aria-hidden
      >
        <CameraIllustration />
        {/* The burst at the body when a frame is taken */}
        <motion.div
          style={{ opacity: flash }}
          className="absolute -inset-6 rounded-full bg-strobe blur-2xl"
        />
      </motion.div>
    </>
  );
}
