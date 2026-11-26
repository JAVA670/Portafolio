"use client";

import { WordsReveal } from "@/components/fx/Reveal";

/** Eyebrow on a hairline, then a large serif title revealed word by word. */
export function SectionTitle({
  label,
  title,
  aside,
  dark = false,
  className = "",
}: {
  label: string;
  title: string;
  aside?: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className={`flex items-center justify-between gap-4 border-t pt-4 ${dark ? "border-fog" : "border-line"}`}>
        <p className={`eyebrow ${dark ? "text-white/60" : "text-stone"}`}>{label}</p>
        {aside}
      </div>
      <h2 className="serif mt-8 text-[clamp(44px,6.4vw,112px)] leading-[0.98] [perspective:800px] md:mt-12">
        <WordsReveal text={title} />
      </h2>
    </div>
  );
}
