"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { emit, useSignal } from "@/lib/intro";

type CameraRenderProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Optional webm/mp4 loop; takes precedence over the still. */
  video?: string;
  /** Hero: preloader waits for it and it loads with priority. */
  priority?: boolean;
  /** Scroll progress of the parent section (0–1) for parallax. */
  progress?: MotionValue<number>;
  /** Strength of the cobalt backlight, 0–1. */
  glow?: number;
  caption?: string;
  className?: string;
};

/**
 * The liquid-chrome camera slot. A cobalt radial backlight sits behind the
 * render; the render itself is an alpha PNG (see
 * scripts/prepare-hero-render.mjs) with `mix-blend-mode: lighten` and a
 * soft radial edge mask as safety nets, so a black-background drop-in still
 * melts into the page.
 */
export function CameraRender({
  src,
  width,
  height,
  alt,
  video,
  priority = false,
  progress,
  glow = 1,
  caption,
  className = "",
}: CameraRenderProps) {
  const reduceMotion = useReducedMotion();
  const introDone = useSignal("introDone");
  const [failed, setFailed] = useState(false);

  // Pointer tilt (fine pointers only), spring-smoothed.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-1, 1], [-6, 6]), { stiffness: 60, damping: 18 });
  const rotateX = useSpring(useTransform(py, [-1, 1], [4, -4]), { stiffness: 60, damping: 18 });

  // Scroll parallax: drifts up and grows slightly as the section leaves.
  const fallback = useMotionValue(0);
  const scrollY = useTransform(progress ?? fallback, [0, 1], ["0%", "-14%"]);
  const scrollScale = useTransform(progress ?? fallback, [0, 1], [1, 1.08]);

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py, reduceMotion]);

  // A missing asset must never hold the preloader hostage.
  useEffect(() => {
    if (priority && failed) emit("heroReady");
  }, [priority, failed]);

  const ready = introDone || !priority;

  return (
    <figure className={`relative ${className}`}>
      <motion.div
        style={reduceMotion ? undefined : { y: scrollY, scale: scrollScale }}
        className="relative"
      >
        {/* Cobalt backlight */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-[-18%_-8%]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(0,56,255,0.62), rgba(0,56,255,0.26) 42%, rgba(0,56,255,0.08) 64%, rgba(0,56,255,0) 78%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? glow : 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: priority ? 0.15 : 0 }}
        />

        <motion.div
          className="relative"
          style={{
            aspectRatio: `${width} / ${height}`,
            ...(reduceMotion ? {} : { rotateX, rotateY, transformPerspective: 1400 }),
          }}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.08, filter: "blur(16px)" }}
          animate={
            ready ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined
          }
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="camera-float relative h-full w-full mix-blend-lighten">
            {failed ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-divider text-center">
                <span className="meta text-strobe">DROP RENDER HERE</span>
                <span className="meta">public{src}</span>
              </div>
            ) : video ? (
              <video
                src={video}
                poster={src}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-contain"
                onLoadedData={() => priority && emit("heroReady")}
                onError={() => setFailed(true)}
              />
            ) : (
              <Image
                src={src}
                alt={alt}
                fill
                preload={priority}
                fetchPriority={priority ? "high" : "auto"}
                loading={priority ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 58vw, 110vw"
                className="object-contain [mask-image:radial-gradient(ellipse_78%_78%_at_50%_50%,#000_68%,transparent_100%)]"
                onLoad={() => priority && emit("heroReady")}
                onError={() => setFailed(true)}
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      {caption && (
        <motion.figcaption
          className="meta mt-3 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "linear", delay: priority ? 1.1 : 0 }}
        >
          <span className="inline-block h-px w-8 bg-divider" />
          {caption}
        </motion.figcaption>
      )}
    </figure>
  );
}
