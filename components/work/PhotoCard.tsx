"use client";

import { ImageReveal } from "@/components/fx/ImageReveal";
import { SmartImage } from "@/components/ui/SmartImage";
import type { Photo } from "@/lib/mockData";

type PhotoCardProps = {
  photo: Photo;
  frame: string;
  chapterLabel: string;
  /** "portrait" crops to 4:5, "landscape" to 16:9. */
  shape: "portrait" | "landscape";
  sizes: string;
  onOpen: () => void;
  className?: string;
  delay?: number;
};

/**
 * A single frame. Consistent crop (4:5 or 16:9), frame number always
 * visible, and on hover a solid black data bar slides up with verified
 * information only.
 */
export function PhotoCard({
  photo,
  frame,
  chapterLabel,
  shape,
  sizes,
  onOpen,
  className = "",
  delay = 0,
}: PhotoCardProps) {
  const details = [photo.artist, photo.venue, photo.date].filter(Boolean).join(" — ");

  return (
    <button
      type="button"
      data-cursor="VIEW"
      onClick={onOpen}
      className={`group relative block w-full overflow-hidden text-left ${className}`}
      aria-label={`${photo.caption}. ${photo.alt}`}
    >
      <ImageReveal className={shape === "portrait" ? "aspect-[4/5]" : "aspect-video"} delay={delay}>
        <div className="absolute inset-0 bg-ink transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]">
          <SmartImage
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={sizes}
            quality={85}
            className="object-cover"
            style={{ objectPosition: photo.focus ?? "50% 50%" }}
          />
        </div>
      </ImageReveal>

      {/* Frame number — always visible */}
      <span className="pointer-events-none absolute left-0 top-0 bg-void px-2 py-1 font-mono text-[10px] tracking-[0.15em] text-strobe">
        FR.{frame}
      </span>

      {/* Hover data bar */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full overflow-hidden bg-void px-3 py-2.5 transition-transform duration-200 ease-linear group-hover:translate-y-0 group-focus-visible:translate-y-0 md:block">
        <span className="meta block text-mute">
          FR.{frame} — {chapterLabel}
        </span>
        <span className="wide mt-0.5 block text-[12px] font-bold uppercase tracking-[0.12em] text-strobe">
          {photo.caption}
        </span>
        {details && <span className="meta mt-0.5 block text-strobe">{details}</span>}
      </span>
    </button>
  );
}
