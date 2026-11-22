"use client";

import { TextReveal } from "@/components/fx/TextReveal";
import { ChromeDivider } from "@/components/chrome/Ornaments";
import { Sigil } from "@/components/chrome/Sigil";
import { ThornRule } from "@/components/chrome/ThornRule";

type SectionHeadProps = {
  id?: string;
  label: string;
  title: string;
  sub?: string;
  /** Right-aligned metadata on the rule, e.g. "055 FRAMES — 03 CHAPTERS". */
  aside?: string;
};

/**
 * Shared section opener: a chrome thorn tendril marks the break, then a
 * thorn-tipped rule, the razor-cut label and a hard-banded chrome title.
 * Deliberately smaller than the work it introduces.
 */
export function SectionHead({ label, title, sub, aside }: SectionHeadProps) {
  return (
    <div className="shell pt-20 md:pt-28">
      <ChromeDivider className="mx-auto mb-10 w-[min(88%,820px)] md:mb-14" />
      <ThornRule />
      <div className="flex items-center justify-between gap-4 pt-4">
        <span className="label-block">
          <Sigil className="mr-2 h-2.5 w-2.5 -translate-y-px text-void" />
          {label}
        </span>
        {aside && <span className="meta text-right">{aside}</span>}
      </div>
      <div className="mt-10 grid grid-cols-12 items-end gap-x-3 gap-y-5 md:mt-14">
        <h2 className="display col-span-12 text-[clamp(60px,8vw,132px)] md:col-span-8">
          <TextReveal text={title} stagger={0.02} charClassName="chrome-text" />
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
