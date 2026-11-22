/**
 * Viewfinder brackets with needle-tipped arms and a thorn barb — the
 * camera's AF frame crossed with its spikes. Absolutely positioned inside a
 * `relative group` parent; they snap in on hover/focus (or stay on with
 * `always`). Transform-only, no blur.
 */
const CORNERS = [
  "left-2 top-2",
  "right-2 top-2 -scale-x-100",
  "bottom-2 left-2 -scale-y-100",
  "bottom-2 right-2 -scale-100",
] as const;

export function ThornCorners({
  always = false,
  className = "text-strobe",
}: {
  always?: boolean;
  className?: string;
}) {
  return (
    <>
      {CORNERS.map((pos) => (
        <span key={pos} className={`pointer-events-none absolute z-10 ${pos}`} aria-hidden>
          <svg
            viewBox="0 0 28 28"
            className={`block h-6 w-6 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.77,0,0.175,1)] md:h-7 md:w-7 ${className} ${
              always
                ? "opacity-100"
                : "opacity-0 [transform:translate(-6px,-6px)] group-hover:opacity-100 group-hover:[transform:none] group-focus-visible:opacity-100 group-focus-visible:[transform:none]"
            }`}
            focusable="false"
          >
            {/* L-bracket arms tapering to needles */}
            <path fill="currentColor" d="M0 0 L28 0 L28 0.6 L2 2 L2 28 L0 28 Z" />
            {/* thorn barb off the corner */}
            <path fill="currentColor" d="M2 2 C6 4 9 7.5 11 13 C8 8.5 5.5 6 2 4.6 Z" />
          </svg>
        </span>
      ))}
    </>
  );
}
