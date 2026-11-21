"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { stats } from "@/lib/mockData";

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

/** Counts up once when scrolled into view. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      const id = window.setTimeout(() => setShown(value), 0);
      return () => window.clearTimeout(id);
    }
    const start = performance.now();
    const duration = 1100;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {String(shown).padStart(2, "0")}
    </span>
  );
}

export function Intro() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });

  const words = t.intro.text.split(" ");
  const items = [
    { value: stats.frames, label: t.intro.frames },
    { value: stats.films, label: t.intro.films },
    { value: stats.stages, label: t.intro.stages },
    { value: stats.countries, label: t.intro.countries },
  ];

  return (
    <section className="shell relative pb-8 pt-24 md:pb-12 md:pt-36" aria-label={t.intro.label}>
      <div className="grid grid-cols-12 gap-x-3 gap-y-8">
        <p className="meta col-span-12 md:col-span-3">{t.intro.label}</p>
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

      <dl className="mt-20 grid grid-cols-2 border-t border-hairline md:mt-28 md:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`flex flex-col gap-2 border-hairline py-6 md:py-8 ${
              i % 2 === 1 ? "border-l pl-4 md:pl-6" : ""
            } ${i >= 2 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l md:pl-6" : ""}`}
          >
            <dt className="meta order-2">{item.label}</dt>
            <dd className="display order-1 text-[clamp(56px,7vw,112px)]">
              <CountUp value={item.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
