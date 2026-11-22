"use client";

import type { Photo } from "@/lib/mockData";
import { Sigil } from "@/components/chrome/Sigil";
import { ThornCorners } from "@/components/chrome/ThornCorners";

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
      className="cut-lg group relative flex h-full w-full flex-col justify-between gap-6 bg-ink p-5 text-left transition-colors duration-150 ease-linear hover:bg-steel md:p-6"
    >
      <ThornCorners />
      <div className="flex items-start justify-between gap-4">
        <span className="meta">{chapterLabel}</span>
        <span className="meta">16:9</span>
      </div>
      <div>
        <span className="display chrome-text block text-[clamp(56px,6.4vw,104px)]">{frame}</span>
        <span className="wide mt-4 block text-[15px] font-bold uppercase leading-tight tracking-[0.12em] text-strobe md:text-[17px]">
          {photo.caption}
        </span>
        <span className="mt-2 block max-w-[36ch] text-[14px] leading-snug text-mute">{photo.alt}.</span>
        {details.length > 0 && <span className="meta mt-3 block text-strobe">{details.join(" — ")}</span>}
      </div>
      <span className="meta flex items-center gap-2 text-strobe">
        <span className="cut-sm bg-strobe px-2.5 py-1 text-void transition-colors duration-150 ease-linear group-hover:chrome-plate group-hover:text-void">
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
}: {
  numeral: string;
  title: string;
  text: string;
  count: number;
  framesLabel: string;
}) {
  return (
    <div className="cut-lg relative flex h-full flex-col justify-between gap-8 bg-ink p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="meta flex items-center gap-2">
          <Sigil className="h-2.5 w-2.5 text-chrome" />
          {`${numeral} // ${title}`}
        </span>
        <span className="meta">
          {String(count).padStart(3, "0")} {framesLabel}
        </span>
      </div>
      <p className="text-[clamp(22px,2.2vw,34px)] leading-[1.12] tracking-[-0.01em] text-strobe">{text}</p>
      <span className="display chrome-text text-[clamp(48px,5vw,88px)]">{numeral}</span>
    </div>
  );
}
