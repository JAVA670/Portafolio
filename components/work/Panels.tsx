"use client";

import type { Photo } from "@/lib/mockData";

/**
 * Editorial text panel paired with a 16:9 frame in "wide" rows. It stretches
 * to the photo's height so every row stays a clean rectangle.
 */
export function InfoPanel({
  photo,
  frame,
  chapterLabel,
  viewLabel,
  onOpen,
}: {
  photo: Photo;
  frame: string;
  chapterLabel: string;
  viewLabel: string;
  onOpen: () => void;
}) {
  const details = [photo.artist, photo.venue, photo.date].filter(Boolean);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col justify-between gap-6 border border-hairline p-5 text-left transition-colors duration-150 ease-linear hover:border-divider md:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="meta">{chapterLabel}</span>
        <span className="meta">16:9</span>
      </div>
      <div>
        <span className="display block text-[clamp(56px,6.4vw,104px)] text-strobe">{frame}</span>
        <span className="wide mt-4 block text-[15px] font-bold uppercase leading-tight tracking-[0.12em] text-strobe md:text-[17px]">
          {photo.caption}
        </span>
        <span className="mt-2 block max-w-[36ch] text-[14px] leading-snug text-mute">{photo.alt}.</span>
        {details.length > 0 && <span className="meta mt-3 block text-strobe">{details.join(" — ")}</span>}
      </div>
      <span className="meta flex items-center gap-2 text-strobe">
        <span className="bg-strobe px-2 py-1 text-void transition-colors duration-150 ease-linear group-hover:bg-cobalt group-hover:text-strobe">
          {viewLabel} ↗
        </span>
      </span>
    </button>
  );
}

/** Closing statement for a chapter, filling the space beside its last frames. */
export function OutroPanel({
  numeral,
  title,
  text,
  count,
  framesLabel,
  swatches,
}: {
  numeral: string;
  title: string;
  text: string;
  count: number;
  framesLabel: string;
  swatches: string[];
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-8 border border-hairline p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="meta">
          {`${numeral} // ${title}`}
        </span>
        <span className="flex gap-1" aria-hidden>
          {swatches.map((color) => (
            <span key={color} className="h-2.5 w-2.5" style={{ background: color }} />
          ))}
        </span>
      </div>
      <p className="text-[clamp(22px,2.2vw,34px)] leading-[1.12] tracking-[-0.01em] text-strobe">{text}</p>
      <span className="meta">
        {String(count).padStart(3, "0")} {framesLabel}
      </span>
    </div>
  );
}
