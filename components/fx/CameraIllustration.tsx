"use client";

/**
 * The journey camera — technical vector illustration, brightened for
 * legibility against pure black: lighter body metals, hot red rim light,
 * stronger glow.
 */
export function CameraIllustration() {
  return (
    <svg
      viewBox="0 0 640 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full [filter:drop-shadow(0_0_55px_rgba(232,0,45,0.35))]"
    >
      <defs>
        <radialGradient id="cam-glass" cx="0.42" cy="0.38" r="0.75">
          <stop offset="0%" stopColor="#3a1620" />
          <stop offset="45%" stopColor="#1a0a10" />
          <stop offset="100%" stopColor="#070305" />
        </radialGradient>
        <linearGradient id="cam-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b2228" />
          <stop offset="100%" stopColor="#151013" />
        </linearGradient>
        <filter id="cam-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Under-glow pooling beneath the body */}
      <ellipse cx="320" cy="430" rx="220" ry="16" fill="#e8002d" opacity="0.16" filter="url(#cam-glow)" />

      {/* Viewfinder hump + hot shoe */}
      <rect x="248" y="44" width="144" height="64" rx="12" fill="url(#cam-body)" stroke="#4a3c41" />
      <rect x="288" y="36" width="64" height="10" rx="2" fill="#151013" stroke="#4a3c41" />
      <line x1="296" y1="41" x2="344" y2="41" stroke="#5a4a50" strokeWidth="2" />

      {/* Mode dial + shutter */}
      <circle cx="524" cy="74" r="24" fill="#1c1518" stroke="#4a3c41" />
      <circle cx="524" cy="74" r="18" stroke="#5a4a50" strokeDasharray="2 5" />
      <rect x="100" y="58" width="44" height="14" rx="7" fill="#1c1518" stroke="#4a3c41" />
      <circle cx="122" cy="64" r="9" fill="#e8002d" opacity="0.95" />

      {/* Body */}
      <rect x="40" y="92" width="560" height="296" rx="26" fill="url(#cam-body)" stroke="#4a3c41" strokeWidth="1.5" />
      {/* Top edge catching the light */}
      <line x1="68" y1="94" x2="572" y2="94" stroke="#6a585f" strokeWidth="1.5" opacity="0.8" />

      {/* Grip */}
      <rect x="52" y="110" width="74" height="260" rx="20" fill="#1a1316" stroke="#3a2f33" />
      <line x1="70" y1="130" x2="70" y2="350" stroke="#332a2d" strokeWidth="3" strokeDasharray="3 8" />

      {/* Blood rim light tracing the left edge */}
      <path
        d="M 66 92 Q 40 92 40 118 L 40 362 Q 40 388 66 388"
        stroke="#ff2244"
        strokeWidth="3"
        filter="url(#cam-glow)"
      />
      <path
        d="M 392 44 L 264 44 Q 248 44 248 60"
        stroke="#ff5a1f"
        strokeWidth="2.5"
        opacity="0.7"
        filter="url(#cam-glow)"
      />

      {/* Lens — mount, knurled rings, glass */}
      <circle cx="320" cy="240" r="124" fill="#0e0a0c" stroke="#4a3c41" strokeWidth="2" />
      <circle cx="320" cy="240" r="114" stroke="#2b2225" strokeWidth="10" />
      <circle cx="320" cy="240" r="114" stroke="#55454c" strokeWidth="8" strokeDasharray="2.5 6" />
      <circle cx="320" cy="240" r="96" stroke="#3a2f33" strokeWidth="6" />
      <circle cx="320" cy="240" r="86" fill="url(#cam-glass)" stroke="#55454c" />
      {/* Glass reflections */}
      <path d="M 262 196 A 74 74 0 0 1 348 172" stroke="#ff2244" strokeWidth="3.5" opacity="0.6" strokeLinecap="round" />
      <path d="M 380 292 A 74 74 0 0 1 350 308" stroke="#ff5a1f" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
      <ellipse cx="290" cy="206" rx="26" ry="14" fill="#ffffff" opacity="0.16" transform="rotate(-28 290 206)" />
      {/* Inner elements + aperture */}
      <circle cx="320" cy="240" r="56" stroke="#7a0018" strokeWidth="2" />
      <circle cx="320" cy="240" r="34" fill="#050304" stroke="#332a2d" />
      <circle cx="320" cy="240" r="33" stroke="#1a1316" strokeWidth="10" strokeDasharray="14 7" />
      <circle cx="311" cy="231" r="5" fill="#ff2244" opacity="0.7" />

      {/* Red focus index + REC tally */}
      <rect x="318" y="112" width="4" height="12" fill="#e8002d" />
      <circle cx="572" cy="116" r="5" fill="#e8002d" className="animate-blink" />

      {/* Engravings */}
      <text x="452" y="362" fill="#9a868c" fontFamily="monospace" fontSize="15" letterSpacing="4">
        TL670
      </text>
      <text x="138" y="118" fill="#6a585f" fontFamily="monospace" fontSize="11" letterSpacing="3">
        FULL FRAME / 140 BPM
      </text>
    </svg>
  );
}
