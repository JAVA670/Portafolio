"use client";

import { BlurReveal } from "@/components/fx/BlurReveal";
import { SectionHeader } from "@/components/fx/SectionHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { gear } from "@/lib/mockData";

/** Gear manifest as a technical spec sheet on the hairline grid. */
export function Specs() {
  const { t } = useLanguage();

  return (
    <section id="specs" className="bg-void">
      <SectionHeader label={t.specs.label} title={t.specs.title} />
      <div className="px-4 pb-24 sm:px-8 md:pb-36">
        <ul className="border-t border-hairline">
          {gear.map((g, i) => {
            const [kind, ...role] = g.role.split(" / ");
            return (
              <BlurReveal key={g.item} distance={10} delay={i * 0.04}>
                <li className="group grid grid-cols-12 items-baseline gap-3 border-b border-hairline py-4 transition-colors duration-150 ease-linear hover:bg-strobe hover:text-void md:py-5">
                  <span className="col-span-2 font-mono text-[11px] tracking-[0.2em] text-ash group-hover:text-void md:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="col-span-10 font-display text-2xl font-extrabold uppercase tracking-[-0.02em] md:col-span-6 md:text-4xl">
                    {g.item}
                  </span>
                  <span className="col-span-6 col-start-3 font-mono text-[10px] tracking-[0.2em] text-ice group-hover:text-cobalt md:col-span-2 md:col-start-auto md:text-[11px]">
                    {kind}
                  </span>
                  <span className="col-span-4 text-right font-mono text-[10px] tracking-[0.2em] text-bone group-hover:text-void md:col-span-3 md:text-[11px]">
                    {role.join(" / ")}
                  </span>
                </li>
              </BlurReveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
