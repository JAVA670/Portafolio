"use client";

import { TextReveal } from "@/components/fx/TextReveal";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { LabelBlock } from "@/components/ui/LabelBlock";

type SectionHeaderProps = {
  label: string;
  title: string;
  sub?: string;
  /** Right-aligned metadata, e.g. a frame count. */
  aside?: string;
};

/**
 * Editorial section opener on the 12-column hairline grid: white label
 * block + metadata on the rule, massive tight display title, short sub.
 */
export function SectionHeader({ label, title, sub, aside }: SectionHeaderProps) {
  return (
    <div className="px-4 pb-10 pt-24 sm:px-8 md:pb-14 md:pt-36">
      <div className="flex items-center justify-between border-t border-hairline pt-3">
        <LabelBlock className="text-[11px] tracking-[0.16em]">{label}</LabelBlock>
        {aside && <span className="meta">{aside}</span>}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-12 md:items-end">
        <h2 className="font-display text-[8.6vw] font-extrabold uppercase leading-[0.86] tracking-[-0.05em] md:col-span-9 md:text-[6.4vw]">
          <TextReveal text={title} stagger={0.022} />
        </h2>
        {sub && (
          <BlurReveal className="md:col-span-3" distance={12}>
            <p className="max-w-xs text-[13px] leading-relaxed text-bone md:text-sm">{sub}</p>
          </BlurReveal>
        )}
      </div>
    </div>
  );
}
