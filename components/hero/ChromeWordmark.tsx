import Image from "next/image";
import { chrome } from "@/lib/chrome";

/**
 * THRULENSES670 as liquid-chrome cyber-sigil lettering — rendered in the
 * hero camera's own style (thorns, biomech lattice, mirror chrome) and
 * cut out on transparency (scripts/prepare-ornaments.mjs). A hard white
 * glint, masked to the letters, crosses it every few seconds.
 *
 * Decorative: pair it with real text (e.g. an sr-only h1) for readers.
 */
export function ChromeWordmark({
  variant = "wide",
  className = "",
  priority = false,
  sizes = "(min-width: 1280px) 1100px, 94vw",
  glint = true,
}: {
  variant?: "wide" | "tall";
  className?: string;
  priority?: boolean;
  sizes?: string;
  glint?: boolean;
}) {
  const asset = variant === "tall" ? chrome.wordmarkTall : chrome.wordmark;
  return (
    <span className={`relative block select-none ${className}`} aria-hidden>
      <Image
        src={asset.src}
        width={asset.width}
        height={asset.height}
        alt=""
        sizes={sizes}
        preload={priority}
        fetchPriority={priority ? "high" : undefined}
        draggable={false}
        className="block h-auto w-full"
      />
      {glint && (
        <span
          className="chrome-glint pointer-events-none absolute inset-0 overflow-hidden"
          style={{ ["--mask" as string]: `url(${asset.mask})` }}
        />
      )}
    </span>
  );
}
