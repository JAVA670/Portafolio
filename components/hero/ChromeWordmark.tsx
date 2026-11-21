import { useId } from "react";

/**
 * Ink box of "THRULENSES670" set in Unbounded 900 at 200 units (measured
 * in the browser): the glyphs start 4 units right of the origin, run
 * 2248.4 wide, rise 154 above the baseline and overshoot 4 below it.
 * Change the face or the word and these need re-measuring.
 */
const WORD = "THRULENSES670";
const INK = { x: 4, w: 2248.4, asc: 154, desc: 4 };
const PAD = 56;
const VB = { x: INK.x - PAD, y: -INK.asc - PAD, w: INK.w + PAD * 2, h: INK.asc + INK.desc + PAD * 2 };
const BAND = 300;

/** Sky → dark horizon → red/cobalt ground reflection: the camera's palette. */
const CHROME_STOPS: [number, string][] = [
  [0, "#ffffff"],
  [0.18, "#f4f8ff"],
  [0.36, "#b9c6dc"],
  [0.47, "#5d6b86"],
  [0.5, "#04060d"],
  [0.555, "#1a0714"],
  [0.6, "#c0132e"],
  [0.64, "#3a0c3a"],
  [0.72, "#1f4fff"],
  [0.82, "#7fb2ff"],
  [0.92, "#e9f3ff"],
  [1, "#ffffff"],
];

const pct = (n: number) => `${(n / INK.w) * 100}%`;

/** The SVG overhangs its box by PAD on every side so the glow isn't cut. */
const svgBox: React.CSSProperties = {
  display: "block",
  width: pct(VB.w),
  height: "auto",
  margin: `-${pct(PAD)} 0 -${pct(PAD)} -${pct(PAD)}`,
  overflow: "visible",
};

const textStyle: React.CSSProperties = {
  fontFamily: "var(--font-unbounded), var(--font-display)",
  fontWeight: 900,
  fontSize: 200,
};

/**
 * Liquid-chrome wordmark that matches the hero render: a warped chrome
 * gradient clipped to the letters, a specular bevel, a dark keyline, a
 * red/blue chromatic fringe and a cobalt glow — plus a highlight that
 * sweeps across every few seconds. The heavy filters sit in one static
 * SVG; the sweep is a separate light layer, so animating it never
 * re-runs them. Purely decorative: pair it with real text for readers.
 */
export function ChromeWordmark({ className = "" }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ref = (name: string) => `${id}-${name}`;
  const url = (name: string) => `url(#${ref(name)})`;
  const text = (props: React.SVGProps<SVGTextElement>) => (
    <text x={0} y={0} style={textStyle} {...props}>
      {WORD}
    </text>
  );

  return (
    <span className={`relative block ${className}`} aria-hidden>
      <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} style={svgBox} focusable="false">
        <defs>
          <linearGradient id={ref("chrome")} gradientUnits="userSpaceOnUse" x1={0} y1={-INK.asc} x2={0} y2={INK.desc}>
            {CHROME_STOPS.map(([offset, color]) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
          </linearGradient>
          <linearGradient id={ref("rim")} gradientUnits="userSpaceOnUse" x1={0} y1={-INK.asc} x2={0} y2={INK.desc}>
            <stop offset={0} stopColor="#ffffff" stopOpacity={0.95} />
            <stop offset={0.55} stopColor="#a5d8ff" stopOpacity={0.25} />
            <stop offset={1} stopColor="#ffffff" stopOpacity={0.8} />
          </linearGradient>

          {/* Liquid: low-frequency noise ripples the reflection bands */}
          <filter id={ref("warp")} x="-5%" y="-20%" width="110%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.012" numOctaves={2} seed={11} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={INK.asc * 0.45} xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Bevel: specular light raking the letter edges from upper left */}
          <filter id={ref("bevel")} x="-5%" y="-20%" width="110%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={INK.asc * 0.018} result="b" />
            <feSpecularLighting in="b" surfaceScale={5} specularConstant={1.15} specularExponent={24} lightingColor="#ffffff" result="s">
              <feDistantLight azimuth={235} elevation={38} />
            </feSpecularLighting>
            <feComposite in="s" in2="SourceAlpha" operator="in" />
          </filter>

          <filter id={ref("glow")} x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={INK.asc * 0.12} result="b1" />
            <feFlood floodColor="#2f6bff" floodOpacity={0.5} />
            <feComposite in2="b1" operator="in" result="g1" />
            <feGaussianBlur in="SourceAlpha" stdDeviation={INK.asc * 0.035} result="b2" />
            <feFlood floodColor="#a5d8ff" floodOpacity={0.3} />
            <feComposite in2="b2" operator="in" result="g2" />
            <feMerge>
              <feMergeNode in="g1" />
              <feMergeNode in="g2" />
            </feMerge>
          </filter>

          <filter id={ref("soft")}>
            <feGaussianBlur stdDeviation={INK.asc * 0.012} />
          </filter>

          <mask id={ref("mask")} maskUnits="userSpaceOnUse" x={VB.x} y={VB.y} width={VB.w} height={VB.h}>
            {text({ fill: "#fff" })}
          </mask>
        </defs>

        {text({ fill: "#fff", filter: url("glow") })}
        {text({ fill: "#ff2d3d", opacity: 0.7, transform: `translate(${-INK.asc * 0.03} 0)`, filter: url("soft") })}
        {text({ fill: "#3b82f6", opacity: 0.8, transform: `translate(${INK.asc * 0.03} 0)`, filter: url("soft") })}
        {text({ fill: "#02030a", stroke: "#02030a", strokeWidth: INK.asc * 0.07, strokeLinejoin: "round" })}
        <g mask={url("mask")}>
          <rect x={VB.x} y={-INK.asc - 24} width={VB.w} height={INK.asc + INK.desc + 48} fill={url("chrome")} filter={url("warp")} />
        </g>
        {text({ fill: "#000", filter: url("bevel"), style: { ...textStyle, mixBlendMode: "screen" } })}
        {text({ fill: "none", stroke: url("rim"), strokeWidth: INK.asc * 0.012 })}
      </svg>

      {/* Highlight sweep — its own layer so the filters above stay cached */}
      <svg
        viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
        style={{ ...svgBox, position: "absolute", inset: 0, willChange: "transform" }}
        focusable="false"
      >
        <defs>
          <linearGradient id={ref("band")} x1={0} y1={0} x2={1} y2={0}>
            <stop offset={0} stopColor="#ffffff" stopOpacity={0} />
            <stop offset={0.5} stopColor="#ffffff" stopOpacity={0.6} />
            <stop offset={1} stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
          <mask id={ref("mask2")} maskUnits="userSpaceOnUse" x={VB.x} y={VB.y} width={VB.w} height={VB.h}>
            {text({ fill: "#fff" })}
          </mask>
        </defs>
        <g mask={url("mask2")}>
          <polygon
            className="chrome-sweep"
            style={{ ["--sweep" as string]: `${VB.w + BAND * 2}px` }}
            points={`${VB.x - BAND},${INK.desc + 20} ${VB.x - BAND * 0.45},${-INK.asc - 20} ${VB.x},${-INK.asc - 20} ${VB.x - BAND * 0.55},${INK.desc + 20}`}
            fill={url("band")}
          />
        </g>
      </svg>
    </span>
  );
}
