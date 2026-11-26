import Image from "next/image";
import { brand } from "@/lib/site";

/**
 * Thrulenses Studio lockup: the chrome THRULENSES670 wordmark (same artwork
 * as the concert gallery) with STUDIO set beneath in tracked serif caps
 * between hairlines.
 *
 * tone="chrome" — silver metal, for night/photo backgrounds.
 * tone="ink"    — the same lettering as solid ink, for bone/paper pages.
 */
export function Logo({
  tone = "chrome",
  studio = true,
  glint = false,
  priority = false,
  sizes = "200px",
  className = "",
  studioClassName = "",
}: {
  tone?: "chrome" | "ink";
  studio?: boolean;
  glint?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  studioClassName?: string;
}) {
  const art = tone === "ink" ? brand.ink : brand.chrome;
  return (
    <span className={`relative flex select-none flex-col items-center ${className}`} aria-hidden>
      <span className="relative block w-full">
        <Image
          src={art.src}
          width={art.width}
          height={art.height}
          alt=""
          sizes={sizes}
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          draggable={false}
          className="block h-auto w-full"
        />
        {glint && tone === "chrome" && (
          <span
            className="glint pointer-events-none absolute inset-0 overflow-hidden"
            style={{ ["--mask" as string]: `url(${brand.chrome.mask})` }}
          />
        )}
      </span>
      {studio && (
        <span
          className={`serif mt-[0.4em] flex w-full items-center justify-center gap-[0.9em] uppercase tracking-[0.55em] ${
            tone === "ink" ? "text-ink" : "text-silver"
          } ${studioClassName}`}
        >
          <span className={`h-px flex-1 ${tone === "ink" ? "bg-ink/25" : "bg-white/25"}`} />
          <span className="-mr-[0.55em]">Studio</span>
          <span className={`h-px flex-1 ${tone === "ink" ? "bg-ink/25" : "bg-white/25"}`} />
        </span>
      )}
    </span>
  );
}
