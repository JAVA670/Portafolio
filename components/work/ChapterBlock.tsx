"use client";

import { forwardRef } from "react";
import { PhotoCard } from "@/components/work/PhotoCard";
import { InfoPanel, OutroPanel } from "@/components/work/Panels";
import { TextReveal } from "@/components/fx/TextReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { chapterPhotoIds, frameNumber, photoById, type Chapter, type Row } from "@/lib/mockData";

const PORTRAIT_SIZES_TRIO_FIRST = "(min-width: 768px) 33vw, 100vw";
const PORTRAIT_SIZES = "(min-width: 768px) 33vw, 50vw";

type ChapterBlockProps = {
  chapter: Chapter;
  onOpen: (photoId: string) => void;
};

/**
 * One colour chapter: header on the grid, then its art-directed rows.
 * Every row is a clean rectangle — 4:5 portraits in threes, 16:9 frames
 * paired with a text panel, a full-width opener, and an outro panel.
 */
export const ChapterBlock = forwardRef<HTMLElement, ChapterBlockProps>(function ChapterBlock(
  { chapter, onOpen },
  ref
) {
  const { t } = useLanguage();
  const copy = t.work.chapters[chapter.id];
  const count = chapterPhotoIds(chapter.id).length;
  const chapterLabel = `${chapter.numeral} // ${copy.title}`;

  const card = (id: string, shape: "portrait" | "landscape", sizes: string, className = "", delay = 0) => {
    const photo = photoById.get(id);
    if (!photo) return null;
    return (
      <PhotoCard
        key={id}
        photo={photo}
        frame={frameNumber.get(id) ?? "000"}
        chapterLabel={chapterLabel}
        shape={shape}
        sizes={sizes}
        onOpen={() => onOpen(id)}
        className={className}
        delay={delay}
      />
    );
  };

  const outro = (
    <OutroPanel
      numeral={chapter.numeral}
      title={copy.title}
      text={copy.outro}
      count={count}
      framesLabel={t.work.frames}
      swatches={chapter.swatches}
    />
  );

  const renderRow = (row: Row, index: number) => {
    switch (row.kind) {
      case "opener":
        return (
          <div key={index} className="grid grid-cols-1">
            {card(row.id, "landscape", "(min-width: 1280px) 1360px, 100vw")}
          </div>
        );
      case "trio":
        return (
          <div key={index} className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {card(row.ids[0], "portrait", PORTRAIT_SIZES_TRIO_FIRST, "col-span-2 md:col-span-1")}
            {card(row.ids[1], "portrait", PORTRAIT_SIZES, "", 0.08)}
            {card(row.ids[2], "portrait", PORTRAIT_SIZES, "", 0.16)}
          </div>
        );
      case "wide": {
        const photo = photoById.get(row.id);
        if (!photo) return null;
        const image = (
          <div className={`col-span-12 md:col-span-8 ${row.side === "right" ? "md:order-2" : ""}`}>
            {card(row.id, "landscape", "(min-width: 768px) 66vw, 100vw")}
          </div>
        );
        const panel = (
          <div className={`col-span-12 md:col-span-4 ${row.side === "right" ? "md:order-1" : ""}`}>
            <InfoPanel
              photo={photo}
              frame={frameNumber.get(row.id) ?? "000"}
              chapterLabel={chapterLabel}
              viewLabel={t.work.view}
              onOpen={() => onOpen(row.id)}
            />
          </div>
        );
        return (
          <div key={index} className="grid grid-cols-12 gap-3">
            {image}
            {panel}
          </div>
        );
      }
      case "duo":
        return (
          <div key={index} className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {card(row.ids[0], "portrait", PORTRAIT_SIZES)}
            {card(row.ids[1], "portrait", PORTRAIT_SIZES, "", 0.08)}
            <div className="col-span-2 md:col-span-1">{outro}</div>
          </div>
        );
      case "solo":
        return (
          <div key={index} className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-4">{card(row.id, "portrait", "(min-width: 768px) 33vw, 100vw")}</div>
            <div className="col-span-12 md:col-span-8">{outro}</div>
          </div>
        );
    }
  };

  // Photos added to the data but not yet art-directed: simple trios.
  const placed = new Set(chapter.rows.flatMap((row) => ("ids" in row ? row.ids : [row.id])));
  const extras = chapterPhotoIds(chapter.id).filter((id) => !placed.has(id));

  return (
    <section ref={ref} id={`chapter-${chapter.id}`} data-chapter={chapter.id} className="scroll-mt-28">
      <header className="shell pb-8 pt-16 md:pb-10 md:pt-24">
        <div className="grid grid-cols-12 items-center gap-x-3 border-t border-divider pt-4">
          <p className="meta col-span-6 md:col-span-3">
            {t.work.chapter} {chapter.numeral}
          </p>
          <p className="meta col-span-6 text-right md:col-span-3 md:text-left">
            {String(count).padStart(3, "0")} {t.work.frames}
          </p>
          <div className="hidden justify-end gap-1 md:col-span-6 md:flex" aria-hidden>
            {chapter.swatches.map((color) => (
              <span key={color} className="h-3 w-3" style={{ background: color }} />
            ))}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-12 items-end gap-x-3 gap-y-4 md:mt-8">
          <h3 className="display col-span-12 text-[clamp(64px,9vw,148px)] md:col-span-8">
            <TextReveal text={copy.title} stagger={0.025} />
          </h3>
          <p className="col-span-12 max-w-[34ch] text-[15px] leading-[1.5] text-mute md:col-span-4 md:justify-self-end md:text-base">
            {copy.sub}
          </p>
        </div>
      </header>

      <div className="shell flex flex-col gap-3">
        {chapter.rows.map(renderRow)}
        {extras.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {extras.map((id) => card(id, "portrait", PORTRAIT_SIZES))}
          </div>
        )}
      </div>
    </section>
  );
});
