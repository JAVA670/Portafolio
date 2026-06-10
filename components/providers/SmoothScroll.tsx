"use client";

import { ReactLenis } from "lenis/react";

/**
 * Momentum scrolling on desktop. On touch devices Lenis stays out of the way
 * (syncTouch off) so native momentum + scroll-snap keep full performance.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.085,
        wheelMultiplier: 1.1,
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
