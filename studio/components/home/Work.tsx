"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { SectionTitle } from "@/components/home/SectionTitle";
import { Frame } from "@/components/ui/Frame";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { sessions, type Photo, type Session } from "@/lib/sessions";

type Card = { key: string; session: Session; photo?: Photo; ratio: number };

/** Up to six frames per shoot; shoots still in the edit get one "coming soon" card, last. */
const CARDS: Card[] = [
  ...sessions
    .filter((s) => s.photos.length)
    .flatMap((session) =>
      session.photos.slice(0, 6).map((photo, i) => ({
        key: `${session.slug}-${i}`,
        session,
        photo,
        ratio: Math.min(1.5, Math.max(0.66, photo.ratio)),
      }))
    ),
  ...sessions
    .filter((s) => !s.photos.length)
    .map((session) => ({ key: `${session.slug}-soon`, session, ratio: 0.8 })),
];

function CoverCard({
  card,
  x,
  viewport,
  index,
}: {
  card: Card;
  x: MotionValue<number>;
  viewport: number;
  index: number;
}) {
  const { lang, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [center, setCenter] = useState(0);

  useEffect(() => {
    const measure = () => {
      const node = ref.current;
      if (node) setCenter(node.offsetLeft + node.offsetWidth / 2);
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Distance from the middle of the screen, in half-viewports.
  const d = useTransform(x, (v) => (center + v - viewport / 2) / (viewport / 2 || 1));
  const rotateY = useTransform(d, [-1.6, 0, 1.6], [42, 0, -42]);
  const scale = useTransform(d, [-1.6, 0, 1.6], [0.74, 1, 0.74]);
  const z = useTransform(d, [-1.6, 0, 1.6], [-280, 0, -280]);
  const opacity = useTransform(d, [-2.2, -1, 0, 1, 2.2], [0.15, 0.55, 1, 0.55, 0.15]);

  return (
    <Link
      ref={ref}
      href={`/work/${card.session.slug}`}
      className="group relative block shrink-0"
      style={{ width: `calc(var(--card-h) * ${card.ratio})` }}
      aria-label={`${card.session.title[lang]} — ${t.work.view}`}
    >
      <motion.div
        style={reduceMotion ? undefined : { rotateY, scale, z, opacity }}
        className="[transform-style:preserve-3d]"
      >
        <div className="relative h-[var(--card-h)] w-full overflow-hidden bg-night-2">
          <Frame
            photo={card.photo}
            sizes="(min-width: 768px) 40vw, 70vw"
            label={t.work.soon}
            className="transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <span className="serif truncate text-[clamp(20px,1.8vw,28px)] text-white">{card.session.title[lang]}</span>
          <span className="eyebrow shrink-0 text-white/50">
            {String(index + 1).padStart(2, "0")} — {t.categories[card.session.category]}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

/**
 * 03 — Selected work as a pinned 3D coverflow. While the section is pinned,
 * scrolling down slides the strip sideways; every frame turns, scales and
 * recedes by its distance from centre stage.
 */
export function Work() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ viewport: 1440, travel: 2400 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDims({ viewport: window.innerWidth, travel: Math.max(0, track.scrollWidth - window.innerWidth) });
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dims.travel]);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(CARDS.length - 1, Math.round(p * (CARDS.length - 1))));
  });

  return (
    <section
      ref={sectionRef}
      id="work"
      data-tone="dark"
      className="relative bg-night text-white"
      style={{ height: `calc(100svh + ${dims.travel}px)` }}
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-24 md:pt-28">
        <SectionTitle
          dark
          className="shell"
          label={t.work.label}
          title={t.work.title}
          aside={
            <p className="eyebrow tabular-nums text-white/60">
              {String(active + 1).padStart(2, "0")} / {String(CARDS.length).padStart(2, "0")}
            </p>
          }
        />
        <div className="relative flex flex-1 items-center [--card-h:46svh] [perspective:1400px] md:[--card-h:54svh]">
          <motion.div
            ref={trackRef}
            className="flex items-start gap-[5vw] [transform-style:preserve-3d] md:gap-[3.5vw]"
            style={{
              x,
              // First and last cards start/end centre stage.
              paddingLeft: `calc(50vw - var(--card-h) * ${(CARDS[0]?.ratio ?? 1) / 2})`,
              paddingRight: `calc(50vw - var(--card-h) * ${(CARDS[CARDS.length - 1]?.ratio ?? 1) / 2})`,
            }}
          >
            {CARDS.map((card, i) => (
              <CoverCard key={card.key} card={card} x={x} viewport={dims.viewport} index={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
