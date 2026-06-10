"use client";

type MarqueeDividerProps = {
  text: string;
  /** Reverse scroll direction so stacked strips shear against each other. */
  reverse?: boolean;
  /** Hot variant: blood-red plate with black type. */
  hot?: boolean;
};

/** Industrial ticker strip used as a section divider. */
export function MarqueeDivider({ text, reverse, hot }: MarqueeDividerProps) {
  return (
    <div
      className={`relative z-10 overflow-hidden border-y py-2.5 ${
        hot
          ? "border-blood bg-blood"
          : "border-crimson bg-darkred"
      }`}
    >
      <div
        className={`flex w-max whitespace-nowrap motion-reduce:animate-none ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {[0, 1].map((copy) => (
          <span
            key={copy}
            aria-hidden={copy === 1}
            className={`pr-4 text-[10px] font-bold tracking-[0.35em] ${
              hot ? "text-void" : "text-laser"
            }`}
          >
            {text} {text}
          </span>
        ))}
      </div>
    </div>
  );
}
