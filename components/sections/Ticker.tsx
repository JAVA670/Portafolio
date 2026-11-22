import { ChromeSigil } from "@/components/chrome/Ornaments";
import { ThornRule } from "@/components/chrome/ThornRule";

/**
 * Poster band: verified names crawling across the full bleed, alternating
 * solid white and hard-banded chrome, split by rendered thorn stars.
 * Decorative (the same names live in the Index), static under reduced
 * motion.
 */
export function Ticker({
  items,
  reverse = false,
  duration = 70,
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
}) {
  const run = (copy: number) =>
    items.map((name, i) => (
      <span key={`${copy}-${name}`} className="flex shrink-0 items-center">
        <span
          className={`display whitespace-nowrap px-6 text-[clamp(44px,6.4vw,104px)] normal-case md:px-10 ${
            i % 2 ? "chrome-text" : "text-strobe"
          }`}
        >
          {name}
        </span>
        <ChromeSigil className="w-[clamp(26px,3vw,48px)]" sizes="48px" />
      </span>
    ));

  return (
    <div className="relative overflow-hidden py-10 md:py-14" aria-hidden>
      <div className="shell">
        <ThornRule />
      </div>
      <div className="overflow-hidden py-6 md:py-8">
        <div
          className={`ticker-track flex w-max ${reverse ? "[animation-direction:reverse]" : ""}`}
          style={{ ["--ticker-duration" as string]: `${duration}s` }}
        >
          {run(0)}
          {run(1)}
        </div>
      </div>
      <div className="shell">
        <ThornRule />
      </div>
    </div>
  );
}
