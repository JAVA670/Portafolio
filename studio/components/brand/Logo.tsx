/**
 * Thrulenses Studio logo — built in code (crisp at any size, any colour):
 *
 *   ◎  THRULENSES  │  STUDIO
 *
 * A lens mark (outer ring with an offset inner ring), THRU in semibold and
 * LENSES in light, tracked caps; a hairline divider; STUDIO in a quieter
 * tone. Everything takes `currentColor`, so the same logo works on night
 * and bone backgrounds.
 */

export function LensMark({
  className = "",
  strokeWidth = 1.6,
  draw = false,
}: {
  className?: string;
  strokeWidth?: number;
  /** Animate the rings drawing themselves in (CSS, reduced-motion safe). */
  draw?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" className={`block shrink-0 ${className}`} aria-hidden focusable="false">
      <circle
        cx="12"
        cy="12"
        r="10.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        pathLength={1}
        className={draw ? "lens-draw" : undefined}
      />
      <circle
        cx="12.9"
        cy="11.1"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        pathLength={1}
        className={draw ? "lens-draw lens-draw--late" : undefined}
      />
    </svg>
  );
}

/** THRU (semibold) + LENSES (light), tracked. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-logo whitespace-nowrap uppercase tracking-[0.28em] ${className}`}>
      <span className="font-semibold">Thru</span>
      <span className="font-light">lenses</span>
    </span>
  );
}

/**
 * Horizontal lockup for the header / footer bar. `size` sets the cap height
 * scale via font-size; the mark and divider follow it in em.
 */
export function Logo({ className = "", studio = true }: { className?: string; studio?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-[0.9em] ${className}`}>
      <LensMark className="h-[1.55em] w-[1.55em]" strokeWidth={1.7} />
      <Wordmark className="-mr-[0.28em]" />
      {studio && (
        <>
          <span className="h-[1.6em] w-px bg-current opacity-30" aria-hidden />
          <span className="font-logo font-normal uppercase tracking-[0.28em] opacity-60">Studio</span>
        </>
      )}
    </span>
  );
}
