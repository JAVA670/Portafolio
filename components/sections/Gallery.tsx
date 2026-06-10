"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { Lightbox } from "@/components/sections/Lightbox";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { photos } from "@/lib/mockData";

export function Gallery() {
  const { t } = useLanguage();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="photography" className="bg-void">
      <SectionHeader
        label={t.gallery.label}
        title={t.gallery.title}
        sub={t.gallery.sub}
      />

      {/* Asymmetric masonry — CSS columns keep it cheap, ratios from data
          shift the rhythm so no two rows align. */}
      <div className="columns-2 gap-2 px-2 py-2 sm:px-4 sm:py-4 md:columns-3 md:gap-3 lg:gap-4">
        {photos.map((photo, i) => (
          <BlurReveal
            key={photo.id}
            className="mb-2 break-inside-avoid md:mb-3 lg:mb-4"
            delay={(i % 3) * 0.08}
          >
            <motion.button
              type="button"
              data-cursor="VIEW"
              onClick={() => setActive(i)}
              whileHover="hover"
              className="latex-sheen group relative block w-full overflow-hidden border border-steel bg-iron text-left transition-all duration-300 hover:border-blood hover:box-glow-red"
              style={{ aspectRatio: photo.ratio }}
              aria-label={photo.alt}
            >
              <motion.div
                variants={{ hover: { scale: 1.06 } }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 grayscale transition-[filter] duration-500 group-hover:grayscale-0"
              >
                <SmartImage
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
              </motion.div>

              {/* Blood hover plate */}
              <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-blood px-3 py-2 transition-transform duration-300 group-hover:translate-y-0">
                <p className="text-[10px] font-bold tracking-[0.2em] text-void">
                  {photo.event}
                </p>
                <p className="text-[9px] tracking-[0.15em] text-void/70">
                  {photo.location} / {photo.year}
                </p>
              </div>

              <span className="tech-label-red absolute left-2 top-2 bg-void/70 px-1.5 py-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
            </motion.button>
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
