"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { ramp } from "@/lib/motion";

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
  const opacity = useTransform(progress, (p) => ramp(p, range[0], range[1], 0.14, 1));
  return (
    <motion.span style={still ? undefined : { opacity }} className="inline">
      {children}
    </motion.span>
  );
}

/** 01 — The studio: one large serif sentence that lights up word by word as you read. */
export function Statement() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 50%"] });
  const words = t.statement.text.split(" ");

  return (
    <section className="shell relative py-28 md:py-44" aria-label={t.statement.label}>
      <div className="grid grid-cols-12 gap-x-4 gap-y-10">
        <p className="eyebrow col-span-12 text-stone md:col-span-3">{t.statement.label}</p>
        <p
          ref={ref}
          className="serif col-span-12 text-[clamp(32px,4.6vw,76px)] leading-[1.06] md:col-span-9"
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
