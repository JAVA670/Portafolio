"use client";

import { ReactLenis } from "lenis/react";

/** Momentum scrolling on desktop (anchor links glide too); native on touch. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{ lerp: 0.08, wheelMultiplier: 1, syncTouch: false, anchors: { offset: -72 } }}
    >
      {children}
    </ReactLenis>
  );
}
