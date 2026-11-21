"use client";

import { useState } from "react";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { Lightbox } from "@/components/sections/Lightbox";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { photos } from "@/lib/mockData";

/**
 * The full contact sheet: hairline-framed masonry. Hover snaps a white
 * caption block over the frame and lifts the cool grade to full color.
 */
export function Gallery() {
  const { t } = useLanguage();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="archive" className="bg-void">
      <SectionHeader
        label={t.archive.label}
        title={t.archive.title}
        sub={t.archive.sub}
        aside={`${String(photos.length).padStart(3, "0")} ${t.archive.frames}`}
      />

      <div className="columns-2 gap-px border-y border-hairline bg-hairline md:columns-3 xl:columns-4">
        {photos.map((photo, i) => (
          <BlurReveal key={photo.id} className="mb-px break-inside-avoid" delay={(i % 4) * 0.04} distance={16}>
            <button
              type="button"
              data-cursor="VIEW"
              onClick={() => setActive(i)}
              className="group relative block w-full overflow-hidden bg-void text-left"
              style={{ aspectRatio: photo.ratio }}
              aria-label={photo.alt}
            >
              <SmartImage
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="grade-cool object-cover"
                loading="lazy"
              />
              <span className="absolute left-0 top-0 bg-void/80 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.2em] text-bone transition-colors duration-150 ease-linear group-hover:bg-cobalt group-hover:text-strobe">
                {String(i + 1).padStart(3, "0")}
              </span>
              <span className="label-block absolute bottom-2 left-2 hidden text-[10px] tracking-[0.16em] group-hover:inline-block">
                {photo.caption}
              </span>
            </button>
          </BlurReveal>
        ))}
      </div>

      <Lightbox
        photos={photos}
        index={active}
        onClose={() => setActive(null)}
        onNavigate={setActive}
      />
    </section>
  );
}
