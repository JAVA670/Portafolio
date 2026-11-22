/**
 * Hairline rule whose ends grow into needle points with a curved thorn
 * barb — the camera's spikes reduced to a 1px editorial line.
 * `accent` colours the barbs (default signal red); the line is a hairline.
 */
function Thorn({ flip = false, accent }: { flip?: boolean; accent: string }) {
  return (
    <svg
      viewBox="0 0 72 14"
      className={`h-[14px] w-[72px] shrink-0 ${flip ? "-scale-x-100" : ""}`}
      aria-hidden
      focusable="false"
    >
      {/* needle: hairline thickening into the rule */}
      <path d="M0 7 L72 6.5 L72 7.5 Z" fill="rgba(255,255,255,0.55)" />
      {/* curved barbs */}
      <path d="M18 7 C27 6.6 34 4.4 44 0 C37 4.8 30 7.2 22 7.6 Z" className={accent} fill="currentColor" />
      <path d="M40 7 C46 7.4 51 9.4 57 14 C50 10.6 45 8.6 38 7.8 Z" className={accent} fill="currentColor" />
    </svg>
  );
}

export function ThornRule({
  className = "",
  accent = "text-signal",
}: {
  className?: string;
  accent?: string;
}) {
  return (
    <div className={`flex items-center ${className}`} aria-hidden>
      <Thorn accent={accent} />
      <span className="h-px flex-1 bg-divider" />
      <Thorn flip accent={accent} />
    </div>
  );
}
