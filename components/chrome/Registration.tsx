/**
 * Print registration crosshairs in the four corners of a `relative`
 * parent — the poster's trim marks.
 */
const SPOTS = ["left-0 top-0", "right-0 top-0", "bottom-0 left-0", "bottom-0 right-0"] as const;

export function Registration({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {SPOTS.map((spot) => (
        <svg
          key={spot}
          viewBox="-10 -10 20 20"
          className={`absolute h-5 w-5 text-strobe/50 ${spot}`}
          focusable="false"
        >
          <path d="M-10 0 H10 M0 -10 V10" stroke="currentColor" strokeWidth="0.8" />
          <rect x="-3.5" y="-3.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      ))}
    </div>
  );
}
