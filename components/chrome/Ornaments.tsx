import Image from "next/image";
import { chrome } from "@/lib/chrome";

/**
 * Rendered liquid-chrome ornaments (see lib/chrome.ts). Decorative only:
 * empty alt, never focusable, never intercepting the pointer.
 */

/** Thorn tendril between sections / chapters. */
export function ChromeDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      <Image
        src={chrome.divider.src}
        width={chrome.divider.width}
        height={chrome.divider.height}
        alt=""
        sizes="(min-width: 1280px) 1100px, 92vw"
        className="mx-auto h-auto w-full"
      />
    </div>
  );
}

/** Rendered thorn star — ticker separators, preloader, markers. */
export function ChromeSigil({ className = "", sizes = "48px" }: { className?: string; sizes?: string }) {
  return (
    <Image
      src={chrome.sigil.src}
      width={chrome.sigil.width}
      height={chrome.sigil.height}
      alt=""
      aria-hidden
      sizes={sizes}
      className={`pointer-events-none inline-block h-auto select-none ${className}`}
    />
  );
}

const FLIP = {
  tl: "",
  tr: "-scale-x-100",
  bl: "-scale-y-100",
  br: "-scale-100",
} as const;

const POS = {
  tl: "-left-3 -top-3 md:-left-5 md:-top-5",
  tr: "-right-3 -top-3 md:-right-5 md:-top-5",
  bl: "-bottom-3 -left-3 md:-bottom-5 md:-left-5",
  br: "-bottom-3 -right-3 md:-bottom-5 md:-right-5",
} as const;

/**
 * Rendered thorn bracket clusters hooked over the corners of a
 * `relative` panel. Pick which corners carry them.
 */
export function ChromeCorners({
  corners = ["tl", "br"],
  className = "w-[92px] md:w-[148px]",
}: {
  corners?: (keyof typeof FLIP)[];
  className?: string;
}) {
  return (
    <>
      {corners.map((c) => (
        <span key={c} className={`pointer-events-none absolute z-10 select-none ${POS[c]} ${className}`} aria-hidden>
          <Image
            src={chrome.corner.src}
            width={chrome.corner.width}
            height={chrome.corner.height}
            alt=""
            sizes="148px"
            className={`block h-auto w-full ${FLIP[c]}`}
          />
        </span>
      ))}
    </>
  );
}
