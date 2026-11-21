"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { SmartImage } from "@/components/ui/SmartImage";
import { LabelBlock } from "@/components/ui/LabelBlock";
import { TextReveal } from "@/components/fx/TextReveal";
import { Lightbox } from "@/components/sections/Lightbox";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { photos, type Photo } from "@/lib/mockData";

/** Hand-picked hero frames — mixed ratios so the columns never align. */
const SELECTED_IDS = ["p04", "p03", "p19", "p06", "p11", "p10", "p23", "p15"];
const selected = SELECTED_IDS.map((id) => photos.find((p) => p.id === id)).filter(
  (p): p is Photo => Boolean(p)
);

function Frame({
  photo,
  index,
  onOpen,
}: {
  photo: Photo;
  index: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      data-cursor="VIEW"
      onClick={onOpen}
      className="group pointer-events-auto relative block w-full border border-hairline bg-iron text-left transition-colors duration-150 ease-linear hover:border-strobe"
      aria-label={photo.alt}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: photo.ratio }}>
        <SmartImage
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 768px) 50vw, 30vw"
          className="grade-cool object-cover"
        />
        <span className="absolute left-0 top-0 bg-cobalt px-1.5 py-0.5 font-mono text-[10px] tracking-[0.2em] text-strobe">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 px-2 py-2">
        <span className="font-mono text-[10px] tracking-[0.18em] text-bone transition-colors duration-150 ease-linear group-hover:bg-strobe group-hover:text-void">
          {photo.caption}
        </span>
        <span className="meta">↗</span>
      </div>
    </button>
  );
}

function Column({
  items,
  offset,
  y,
  className,
  onOpen,
}: {
  items: Photo[];
  offset: number;
  y?: MotionValue<string>;
  className?: string;
  onOpen: (i: number) => void;
}) {
  return (
    <motion.div style={y ? { y } : undefined} className={`flex flex-col gap-[22vh] ${className ?? ""}`}>
      {items.map((photo, i) => (
        <Frame
          key={photo.id}
          photo={photo}
          index={offset + i * 2}
          onOpen={() => onOpen(offset + i * 2)}
        />
      ))}
    </motion.div>
  );
}

/**
 * A pinned title holds the center of the screen while two columns of
 * frames drift past at opposing speeds — one rising faster than the page,
 * one lagging behind.
 */
export function SelectedWork() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const fastY = useTransform(scrollYProgress, [0, 1], ["30vh", "-30vh"]);
  const slowY = useTransform(scrollYProgress, [0, 1], ["-15vh", "15vh"]);

  const left = selected.filter((_, i) => i % 2 === 0);
  const right = selected.filter((_, i) => i % 2 === 1);

  return (
    <section id="work" ref={ref} className="relative bg-void">
      {/* Desktop: pinned heading + parallax columns */}
      <div className="relative hidden overflow-clip md:block" style={{ minHeight: "300vh" }}>
        <div className="sticky top-0 grid h-screen place-items-center px-8">
          <div className="text-center">
            <LabelBlock className="text-[11px] tracking-[0.16em]">{t.work.label}</LabelBlock>
            <h2 className="mt-6 font-display text-[9.5vw] font-extrabold uppercase leading-[0.82] tracking-[-0.055em]">
              <TextReveal text={t.work.title} stagger={0.02} />
            </h2>
            <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-bone">{t.work.sub}</p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 mx-auto grid max-w-[1400px] grid-cols-12 px-8 py-[30vh]">
          <Column
            items={left}
            offset={0}
            y={reduceMotion ? undefined : fastY}
            className="col-span-3 col-start-1"
            onOpen={setActive}
          />
          <Column
            items={right}
            offset={1}
            y={reduceMotion ? undefined : slowY}
            className="col-span-3 col-start-10 pt-[40vh]"
            onOpen={setActive}
          />
        </div>
      </div>

      {/* Mobile: plain editorial stack */}
      <div className="px-4 pb-10 pt-24 md:hidden">
        <LabelBlock className="text-[11px] tracking-[0.16em]">{t.work.label}</LabelBlock>
        <h2 className="mt-6 font-display text-[13vw] font-extrabold uppercase leading-[0.84] tracking-[-0.05em]">
          <TextReveal text={t.work.title} stagger={0.02} />
        </h2>
        <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-bone">{t.work.sub}</p>
        <div className="mt-10 grid grid-cols-2 items-start gap-3">
          {selected.map((photo, i) => (
            <div key={photo.id} className={i % 2 === 1 ? "mt-12" : ""}>
              <Frame photo={photo} index={i} onOpen={() => setActive(i)} />
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        photos={selected}
        index={active}
        onClose={() => setActive(null)}
        onNavigate={setActive}
      />
    </section>
  );
}
