"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { SectionTitle } from "@/components/home/SectionTitle";
import { useLanguage } from "@/components/providers/LanguageProvider";

const EXPO = [0.16, 1, 0.3, 1] as const;
const STEPS = ["inquire", "plan", "shoot", "deliver"] as const;

/**
 * 04 — How it works. The title holds still on the left while the four
 * steps scroll past; a hairline draws itself down the steps as you read
 * and each numeral swings in on its own hinge.
 */
export function Process() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const draw = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="process" className="shell relative scroll-mt-20 py-28 md:py-44">
      <div className="grid grid-cols-12 gap-x-4 gap-y-14">
        <div className="col-span-12 md:col-span-5">
          <div className="md:sticky md:top-32">
            <SectionTitle label={t.process.label} title={t.process.title} />
          </div>
        </div>

        <ol ref={ref} className="relative col-span-12 md:col-span-6 md:col-start-7">
          <svg className="absolute bottom-0 left-0 top-0 h-full w-px overflow-visible" aria-hidden>
            <line x1="0" y1="0" x2="0" y2="100%" stroke="var(--color-line)" strokeWidth="1" />
            <motion.line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              stroke="var(--color-ink)"
              strokeWidth="1"
              style={reduceMotion ? undefined : { pathLength: draw }}
            />
          </svg>
          {STEPS.map((key, i) => {
            const step = t.process.steps[key];
            return (
              <motion.li
                key={key}
                className="relative pb-16 pl-10 last:pb-0 md:pb-24 md:pl-14 [perspective:900px]"
                initial={reduceMotion ? false : "hidden"}
                whileInView="shown"
                viewport={{ once: true, margin: "-15% 0px" }}
              >
                <span className="absolute -left-[3px] top-[0.9em] h-[7px] w-[7px] bg-ink" aria-hidden />
                <motion.span
                  className="serif block text-[clamp(64px,7vw,120px)] leading-none text-ash"
                  style={{ transformOrigin: "0% 100%" }}
                  variants={{
                    hidden: { rotateY: -80, opacity: 0 },
                    shown: { rotateY: 0, opacity: 1, transition: { duration: 1.2, ease: EXPO } },
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </motion.span>
                <motion.div
                  variants={{
                    hidden: { y: 24, opacity: 0 },
                    shown: { y: 0, opacity: 1, transition: { duration: 1, delay: 0.12, ease: EXPO } },
                  }}
                >
                  <h3 className="serif mt-4 text-[clamp(32px,3.2vw,52px)] leading-[1.05]">{step.title}</h3>
                  <p className="mt-3 max-w-[44ch] text-[16px] leading-[1.65] text-graphite md:text-[17px]">{step.text}</p>
                </motion.div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
