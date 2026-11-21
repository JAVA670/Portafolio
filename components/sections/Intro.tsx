"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";

/** A word whose opacity is tied to the paragraph's scroll progress. */
function Word({
  children,
  progress,
  range,
  still,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  still: boolean;
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={still ? undefined : { opacity }} className="inline">
      {children}
    </motion.span>
  );
}

export function Intro() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });

  const words = t.intro.text.split(" ");

  return (
    <section className="shell relative py-24 md:py-36" aria-label={t.intro.label}>
      <div className="grid grid-cols-12 gap-x-3 gap-y-8 border-t border-hairline pt-10 md:pt-14">
        <p className="meta col-span-12 md:col-span-3">
          <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] bg-signal" aria-hidden />
          {t.intro.label}
        </p>
        <p
          ref={ref}
          className="col-span-12 text-[clamp(26px,3.6vw,56px)] font-normal leading-[1.08] tracking-[-0.015em] md:col-span-9"
        >
          {words.map((word, i) => (
            <span key={`${word}-${i}`}>
              <Word
                progress={scrollYProgress}
                range={[i / words.length, Math.min(1, (i + 1.5) / words.length)]}
                still={!!reduceMotion}
              >
                {word}
              </Word>{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
