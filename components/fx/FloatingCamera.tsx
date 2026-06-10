"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * The hero centerpiece: a mirrorless camera drifting in the void behind the
 * brand name. Technical vector illustration — blood-red rim light, knurled
 * lens rings — with a zero-gravity bob and subtle mouse parallax.
 */
export function FloatingCamera() {
  const reduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(useTransform(mouseX, [-1, 1], [-22, 22]), {
    stiffness: 40,
    damping: 18,
  });
  const y = useSpring(useTransform(mouseY, [-1, 1], [-14, 14]), {
    stiffness: 40,
    damping: 18,
  });
  const rotate = useSpring(useTransform(mouseX, [-1, 1], [-4, 4]), {
    stiffness: 40,
    damping: 18,
  });

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY, reduceMotion]);

  return (
    <motion.div
      aria-hidden
      style={reduceMotion ? undefined : { x, y, rotate }}
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[82vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 sm:w-[44vw]"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.1, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: [-14, 14, -14], rotate: [-1.5, 1.5, -1.5] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <CameraIllustration />
      </motion.div>
    </motion.div>
  );
}

function CameraIllustration() {
  return (
    <svg
      viewBox="0 0 640 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full opacity-90 [filter:drop-shadow(0_0_50px_rgba(232,0,45,0.22))]"
    >
      <defs>
        <radialGradient id="cam-glass" cx="0.42" cy="0.38" r="0.75">
          <stop offset="0%" stopColor="#2a1016" />
          <stop offset="45%" stopColor="#12060a" />
          <stop offset="100%" stopColor="#040203" />
        </radialGradient>
        <linearGradient id="cam-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#161113" />
          <stop offset="100%" stopColor="#0a0708" />
        </linearGradient>
        <filter id="cam-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Under-glow pooling beneath the body */}
      <ellipse cx="320" cy="430" rx="220" ry="16" fill="#e8002d" opacity="0.10" filter="url(#cam-glow)" />

      {/* Viewfinder hump + hot shoe */}
      <rect x="248" y="44" width="144" height="64" rx="12" fill="url(#cam-body)" stroke="#2b2225" />
      <rect x="288" y="36" width="64" height="10" rx="2" fill="#0a0708" stroke="#2b2225" />
      <line x1="296" y1="41" x2="344" y2="41" stroke="#3a2f33" strokeWidth="2" />

      {/* Mode dial + shutter */}
      <circle cx="524" cy="74" r="24" fill="#100c0e" stroke="#2b2225" />
      <circle cx="524" cy="74" r="18" stroke="#3a2f33" strokeDasharray="2 5" />
      <rect x="100" y="58" width="44" height="14" rx="7" fill="#100c0e" stroke="#2b2225" />
      <circle cx="122" cy="64" r="9" fill="#e8002d" opacity="0.9" />

      {/* Body */}
      <rect x="40" y="92" width="560" height="296" rx="26" fill="url(#cam-body)" stroke="#2b2225" strokeWidth="1.5" />

      {/* Grip */}
      <rect x="52" y="110" width="74" height="260" rx="20" fill="#0c090a" stroke="#221a1d" />
      <line x1="70" y1="130" x2="70" y2="350" stroke="#1c1517" strokeWidth="3" strokeDasharray="3 8" />

      {/* Blood rim light tracing the left edge */}
      <path
        d="M 66 92 Q 40 92 40 118 L 40 362 Q 40 388 66 388"
        stroke="#e8002d"
        strokeWidth="2.5"
        opacity="0.85"
        filter="url(#cam-glow)"
      />
      <path
        d="M 392 44 L 264 44 Q 248 44 248 60"
        stroke="#ff5a1f"
        strokeWidth="2"
        opacity="0.5"
        filter="url(#cam-glow)"
      />

      {/* Lens — mount, knurled rings, glass */}
      <circle cx="320" cy="240" r="124" fill="#070405" stroke="#2b2225" strokeWidth="2" />
      <circle cx="320" cy="240" r="114" stroke="#1c1517" strokeWidth="10" />
      <circle cx="320" cy="240" r="114" stroke="#332a2d" strokeWidth="8" strokeDasharray="2.5 6" />
      <circle cx="320" cy="240" r="96" stroke="#241c1f" strokeWidth="6" />
      <circle cx="320" cy="240" r="86" fill="url(#cam-glass)" stroke="#3a2f33" />
      {/* Glass reflections */}
      <path d="M 262 196 A 74 74 0 0 1 348 172" stroke="#ff2244" strokeWidth="3" opacity="0.45" strokeLinecap="round" />
      <path d="M 380 292 A 74 74 0 0 1 350 308" stroke="#ff5a1f" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
      <ellipse cx="290" cy="206" rx="26" ry="14" fill="#ffffff" opacity="0.10" transform="rotate(-28 290 206)" />
      {/* Inner elements + aperture */}
      <circle cx="320" cy="240" r="56" stroke="#4a000e" strokeWidth="2" />
      <circle cx="320" cy="240" r="34" fill="#020102" stroke="#1c1517" />
      <circle cx="320" cy="240" r="33" stroke="#0e0a0b" strokeWidth="10" strokeDasharray="14 7" />
      <circle cx="311" cy="231" r="5" fill="#e8002d" opacity="0.55" />

      {/* Red focus index + REC tally */}
      <rect x="318" y="112" width="4" height="12" fill="#e8002d" />
      <circle cx="572" cy="116" r="5" fill="#e8002d" className="animate-blink" />

      {/* Engravings */}
      <text x="452" y="362" fill="#7a6a6d" fontFamily="monospace" fontSize="15" letterSpacing="4">
        TL670
      </text>
      <text x="138" y="118" fill="#4a3a3e" fontFamily="monospace" fontSize="11" letterSpacing="3">
        FULL FRAME / 140 BPM
      </text>
    </svg>
  );
}
