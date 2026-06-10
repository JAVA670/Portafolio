"use client";

import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { djSets } from "@/lib/mockData";

export function DJSets() {
  const { t } = useLanguage();

  return (
    <section id="dj-sets" className="bg-iron">
      <SectionHeader
        label={t.djSets.label}
        title={t.djSets.title}
        sub={t.djSets.sub}
      />

      <div className="flex flex-col">
        {djSets.map((set, i) => (
          <BlurReveal key={set.id} distance={48}>
            <article className="group grid border-b border-smoke md:grid-cols-[1fr_320px]">
              {/* Cinematic 16:9 frame */}
              <div className="relative aspect-video overflow-hidden bg-void">
                <AutoVideo
                  src={set.src}
                  poster={set.poster}
                  className="h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="tech-label absolute left-4 top-4 bg-void/70 px-2 py-1">
                  REC ● {set.duration}
                </span>
              </div>

              {/* Technical sidecar */}
              <div className="flex flex-col justify-between border-smoke p-5 md:border-l md:p-6">
                <div>
                  <p className="tech-label mb-3">
                    SET / {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-3xl font-bold uppercase leading-none tracking-tight md:text-4xl">
                    {set.artist}
                  </h3>
                  <p className="mt-3 text-[11px] leading-relaxed tracking-[0.15em] text-bone">
                    {set.event}
                    <br />
                    {set.location}
                    <br />
                    {set.year}
                  </p>
                </div>
                <p className="tech-label mt-6">
                  16:9 / MULTI-CAM / {t.djSets.watch} ▶
                </p>
              </div>
            </article>
          </BlurReveal>
        ))}
      </div>
    </section>
  );
}
