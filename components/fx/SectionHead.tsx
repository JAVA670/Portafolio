"use client";

import { TextReveal } from "@/components/fx/TextReveal";

type SectionHeadProps = {
  id?: string;
  label: string;
  title: string;
  sub?: string;
  /** Right-aligned metadata on the rule, e.g. "055 FRAMES — 03 CHAPTERS". */
  aside?: string;
};

/**
 * Shared section opener on the 12-column grid: label block + metadata on a
 * hairline rule, then a condensed display title with a short line beside it.
 * Deliberately smaller than the work it introduces.
 */
export function SectionHead({ label, title, sub, aside }: SectionHeadProps) {
  return (
    <div className="shell pt-24 md:pt-32">
      <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4">
        <span className="label-block">{label}</span>
        {aside && <span className="meta text-right">{aside}</span>}
      </div>
      <div className="mt-10 grid grid-cols-12 items-end gap-x-3 gap-y-5 md:mt-14">
        <h2 className="display col-span-12 text-[clamp(60px,8vw,132px)] md:col-span-8">
          <TextReveal text={title} stagger={0.02} />
        </h2>
        {sub && (
          <p className="col-span-12 max-w-[34ch] text-[15px] leading-[1.5] text-mute md:col-span-4 md:justify-self-end md:text-base">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
