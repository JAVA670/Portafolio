/**
 * Four-point thorn star — the site's bullet. Concave, needle-tipped arms
 * drawn in SVG so it stays razor-sharp at 6px. Inherits `currentColor`.
 * Replaces every round dot (record lights, live states, list markers).
 */
export function Sigil({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" className={`inline-block shrink-0 ${className}`} aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M0 -12 C0.8 -4 1.6 -1.6 12 0 C1.6 1.6 0.8 4 0 12 C-0.8 4 -1.6 1.6 -12 0 C-1.6 -1.6 -0.8 -4 0 -12 Z"
      />
    </svg>
  );
}
