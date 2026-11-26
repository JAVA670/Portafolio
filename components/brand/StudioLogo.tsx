/**
 * Thrulenses Studio logo (same geometry as studio/components/brand/Logo.tsx):
 * lens mark + THRU (semibold) LENSES (light) in Jost, hairline, STUDIO.
 * Everything takes `currentColor`.
 */
export function LensMark({ className = "", strokeWidth = 1.6 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={`block shrink-0 ${className}`} aria-hidden focusable="false">
      <circle cx="12" cy="12" r="10.6" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="12.9" cy="11.1" r="5" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
}

export function StudioLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.9em] ${className}`}>
      <LensMark className="h-[1.55em] w-[1.55em]" strokeWidth={1.7} />
      <span className="font-logo -mr-[0.28em] whitespace-nowrap uppercase tracking-[0.28em]">
        <span className="font-semibold">Thru</span>
        <span className="font-light">lenses</span>
      </span>
      <span className="h-[1.6em] w-px bg-current opacity-30" aria-hidden />
      <span className="font-logo font-normal uppercase tracking-[0.28em] opacity-60">Studio</span>
    </span>
  );
}
