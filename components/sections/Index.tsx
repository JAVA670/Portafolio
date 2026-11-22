"use client";

import { SectionHead } from "@/components/fx/SectionHead";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { artists, gear, stages } from "@/lib/mockData";
import { Sigil } from "@/components/chrome/Sigil";
import { ThornRule } from "@/components/chrome/ThornRule";

function ColumnHead({ letter, title, count }: { letter: string; title: string; count: number }) {
  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <span className="meta flex items-center gap-2 text-strobe">
          <Sigil className="h-2.5 w-2.5 text-chrome" />
          {letter} — {title}
        </span>
        <span className="meta">{String(count).padStart(2, "0")}</span>
      </div>
      <ThornRule />
    </div>
  );
}

const rowHover = "transition-colors duration-150 ease-linear hover:bg-strobe hover:text-void";

/**
 * 02 ARCHIVE — a Swiss index of the credentials promoters ask for: who has
 * been shot, which stages, and with what kit. Only verified entries.
 */
export function Index() {
  const { t } = useLanguage();

  return (
    <section id="archive" className="relative">
      <SectionHead label={t.archive.label} title={t.archive.title} sub={t.archive.sub} />

      <div className="shell mt-14 grid grid-cols-12 gap-x-3 gap-y-16 md:mt-20">
        {/* A — Artists */}
        <BlurReveal className="col-span-12 lg:col-span-5" distance={12}>
          <ColumnHead letter="A" title={t.archive.artists} count={artists.length} />
          <ul>
            {artists.map((name, i) => (
              <li key={name} className="group flex items-baseline gap-4 border-b border-hairline px-1 py-2">
                <span className="meta flex w-14 shrink-0 items-center gap-1.5">
                  <Sigil className="h-2.5 w-2.5 text-chrome opacity-0 transition-opacity duration-150 ease-linear group-hover:opacity-100" />
                  A.{String(i + 1).padStart(2, "0")}
                </span>
                <span className="display text-[clamp(40px,4.6vw,76px)] normal-case group-hover:chrome-text">{name}</span>
              </li>
            ))}
            <li className="px-1 py-3">
              <span className="meta">{t.archive.localScene}</span>
            </li>
          </ul>
        </BlurReveal>

        {/* B — Stages */}
        <BlurReveal className="col-span-12 md:col-span-7 lg:col-span-4" distance={12} delay={0.06}>
          <ColumnHead letter="B" title={t.archive.stages} count={stages.length} />
          <ul>
            {stages.map((stage, i) => (
              <li
                key={stage.name}
                className={`group grid grid-cols-12 items-baseline gap-2 border-b border-hairline px-1 py-3.5 ${rowHover}`}
              >
                <span className="meta col-span-2 group-hover:text-void">B.{String(i + 1).padStart(2, "0")}</span>
                <span className="wide col-span-6 text-[13px] font-bold uppercase tracking-[0.1em]">{stage.name}</span>
                <span className="meta col-span-4 text-right group-hover:text-void">
                  {stage.city ? `${stage.city}, ${stage.country}` : "—"}
                </span>
              </li>
            ))}
          </ul>
        </BlurReveal>

        {/* C — Kit */}
        <BlurReveal className="col-span-12 md:col-span-5 lg:col-span-3" distance={12} delay={0.12}>
          <ColumnHead letter="C" title={t.archive.kit} count={gear.length} />
          <ul>
            {gear.map((g, i) => (
              <li key={g.item} className={`group border-b border-hairline px-1 py-3.5 ${rowHover}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="wide text-[13px] font-bold uppercase tracking-[0.1em]">{g.item}</span>
                  <span className="meta group-hover:text-void">C.{String(i + 1).padStart(2, "0")}</span>
                </div>
                <span className="meta mt-1 block group-hover:text-void">
                  {g.kind} / {g.role}
                </span>
              </li>
            ))}
          </ul>
        </BlurReveal>
      </div>
    </section>
  );
}
