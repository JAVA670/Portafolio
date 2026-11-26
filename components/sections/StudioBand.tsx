"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { LensMark, StudioLogo } from "@/components/brand/StudioLogo";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { contact } from "@/lib/mockData";

const EXPO = [0.16, 1, 0.3, 1] as const;

const FRAMES = [
  { src: "/assets/studio/studio-b.jpg", alt: "Birthday portrait with a blue bouquet in front of a tropical backdrop", fan: -1 },
  { src: "/assets/studio/studio-a.jpg", alt: "The birthday girl in a tiara and full blue ball gown on a hazy, violet-lit dance floor", fan: 0 },
  { src: "/assets/studio/studio-c.jpg", alt: "A slow dance silhouetted in blue haze", fan: 1 },
];

/** One print in the fan: starts stacked, spreads out and turns as you scroll. */
function FanFrame({
  frame,
  progress,
  still,
  priority,
}: {
  frame: (typeof FRAMES)[number];
  progress: MotionValue<number>;
  still: boolean;
  priority: boolean;
}) {
  const x = useTransform(progress, [0, 1], ["0%", `${frame.fan * 62}%`]);
  const rotateZ = useTransform(progress, [0, 1], [frame.fan * 2, frame.fan * 7]);
  const rotateY = useTransform(progress, [0, 1], [0, frame.fan * -18]);
  const y = useTransform(progress, [0, 1], ["6%", frame.fan === 0 ? "-4%" : "4%"]);
  return (
    <motion.div
      className={`absolute left-1/2 top-1/2 w-[44%] -translate-x-1/2 -translate-y-1/2 ${frame.fan === 0 ? "z-10" : "z-0"}`}
      style={still ? { x: `${frame.fan * 62}%`, rotate: frame.fan * 7 } : { x, y, rotateZ, rotateY }}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#e4e1da] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.45)]">
        <Image src={frame.src} alt={frame.alt} fill sizes="(min-width: 1024px) 20vw, 40vw" quality={80} preload={priority} className="object-cover" style={{ objectPosition: "50% 30%" }} />
      </div>
    </motion.div>
  );
}

/**
 * Thrulenses Studio, introduced inside the concert site: a calm bone band —
 * the studio's own palette and logo — with three prints that fan out in
 * 3D as the band scrolls through, and a link across to the studio site.
 */
export function StudioBand() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });

  return (
    <section ref={ref} id="studio" className="relative scroll-mt-16 bg-bone text-ink-dark" aria-label="Thrulenses Studio">
      <div className="shell grid grid-cols-12 items-center gap-x-6 gap-y-16 py-24 md:py-36">
        <div className="col-span-12 lg:col-span-5">
          <motion.p
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6e6b65]"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: EXPO }}
          >
            {t.studio.label}
          </motion.p>
          <motion.div
            className="mt-8"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1, delay: 0.1, ease: EXPO }}
          >
            <StudioLogo className="text-[13px] md:text-[15px]" />
          </motion.div>
          <motion.h2
            className="font-logo mt-10 text-[clamp(36px,4.4vw,68px)] font-light leading-[1.05] tracking-[-0.01em]"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.1, delay: 0.15, ease: EXPO }}
          >
            {t.studio.title}
          </motion.h2>
          <motion.p
            className="mt-6 max-w-[42ch] text-[16px] leading-[1.65] text-[#2b2b2e] md:text-[17px]"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.1, delay: 0.22, ease: EXPO }}
          >
            {t.studio.text}
          </motion.p>
          <motion.a
            href={contact.studioUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="OPEN"
            className="group mt-10 inline-flex items-center gap-4 bg-ink-dark px-6 py-4 text-bone transition-colors duration-300 hover:bg-[#2b2b2e]"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.1, delay: 0.3, ease: EXPO }}
          >
            <LensMark className="h-4 w-4" strokeWidth={2} />
            <span className="font-logo text-[13px] font-normal uppercase tracking-[0.22em]">{t.studio.cta}</span>
            <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
              ↗
            </span>
          </motion.a>
        </div>

        <div className="relative col-span-12 aspect-[4/3] [perspective:1400px] lg:col-span-7">
          {FRAMES.map((frame, i) => (
            <FanFrame key={frame.src} frame={frame} progress={scrollYProgress} still={!!reduceMotion} priority={i === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
