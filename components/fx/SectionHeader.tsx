"use client";

import { BlurReveal } from "@/components/fx/BlurReveal";

type SectionHeaderProps = {
  label: string;
  title: string;
  sub: string;
};

export function SectionHeader({ label, title, sub }: SectionHeaderProps) {
  return (
    <div className="border-b border-smoke px-4 pb-8 pt-24 sm:px-8 md:pt-32">
      <BlurReveal>
        <p className="tech-label mb-4">{label}</p>
        <h2 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight sm:text-7xl md:text-8xl">
          {title}
        </h2>
        <p className="mt-5 max-w-md text-xs leading-relaxed text-bone sm:text-sm">
          {sub}
        </p>
      </BlurReveal>
    </div>
  );
}
