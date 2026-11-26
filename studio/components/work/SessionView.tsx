"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ImageReveal, Rise, WordsReveal } from "@/components/fx/Reveal";
import { Frame } from "@/components/ui/Frame";
import { Viewer } from "@/components/work/Viewer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { setInquiryType, type InquiryType } from "@/lib/inquiry";
import { coverOf, sessionBySlug, sessions, type Category, type Photo } from "@/lib/sessions";
import { site } from "@/lib/site";
import { ramp } from "@/lib/motion";

const INQUIRY: Record<Category, InquiryType> = {
  celebrations: "celebration",
  events: "event",
  portraits: "portrait",
};

type GalleryRow =
  | { kind: "wide"; i: number }
  | { kind: "pair"; a: number; b: number }
  | { kind: "single"; i: number; side: "left" | "right" };

/** Editorial rhythm: landscapes run full width, portraits pair up or sit offset. */
function buildRows(photos: Photo[]): GalleryRow[] {
  const rows: GalleryRow[] = [];
  let pending: number | null = null;
  let singles = 0;
  let pairs = 0;
  photos.forEach((photo, i) => {
    if (photo.ratio >= 1.2) {
      if (pending !== null) {
        rows.push({ kind: "single", i: pending, side: singles++ % 2 ? "right" : "left" });
        pending = null;
      }
      rows.push({ kind: "wide", i });
      return;
    }
    if (pending === null) {
      // Every third portrait group stands alone, offset — breaks the grid.
      if (pairs > 0 && pairs % 2 === 0 && singles < pairs / 2) {
        rows.push({ kind: "single", i, side: singles++ % 2 ? "right" : "left" });
        pairs++;
        return;
      }
      pending = i;
    } else {
      rows.push({ kind: "pair", a: pending, b: i });
      pending = null;
      pairs++;
    }
  });
  if (pending !== null) rows.push({ kind: "single", i: pending, side: singles % 2 ? "right" : "left" });
  return rows;
}

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    const id = requestAnimationFrame(update);
    mq.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", update);
    };
  }, []);
  return desktop;
}

/** A photograph drifting at its own speed as you scroll — depth between frames. */
function DepthFrame({
  photo,
  speed,
  sizes,
  onOpen,
  className = "",
  delay = 0,
}: {
  photo: Photo;
  speed: number;
  sizes: string;
  onOpen: () => void;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const desktop = useDesktop();
  const ref = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 10}%`, `${-speed * 10}%`]);
  const parallax = desktop && !reduceMotion;

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onOpen}
      style={parallax ? { y } : undefined}
      className={`group relative block w-full text-left ${className}`}
      aria-label={photo.alt}
    >
      <ImageReveal delay={delay} className="w-full bg-night-2" style={{ aspectRatio: photo.ratio }}>
        <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={sizes}
            quality={90}
            className="object-cover"
            style={{ objectPosition: photo.focus ?? "50% 50%" }}
          />
        </div>
      </ImageReveal>
    </motion.button>
  );
}

export function SessionView({ slug }: { slug: string }) {
  const { lang, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const session = sessionBySlug(slug)!;
  const cover = coverOf(session);
  const title = session.title[lang];
  const [active, setActive] = useState<number | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const shade = useTransform(scrollYProgress, (p) => ramp(p, 0, 1, 0.35, 0.85));
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);

  const rows = useMemo(() => buildRows(session.photos), [session.photos]);
  const next = sessions[(sessions.findIndex((s) => s.slug === slug) + 1) % sessions.length];
  const meta = [t.categories[session.category], session.date, session.location].filter(Boolean);

  return (
    <>
      {/* Cinematic opening: the cover pulls back into the screen as you scroll */}
      <section ref={headerRef} id="top" data-tone="dark" className="relative h-[150svh] bg-night text-white">
        <div className="sticky top-0 h-svh overflow-hidden [perspective:1200px]">
          <motion.div
            className="absolute inset-0 origin-[50%_30%]"
            style={reduceMotion ? undefined : { scale, rotateX }}
          >
            <Frame photo={cover} priority sizes="100vw" label={t.work.soon} />
            <motion.div className="absolute inset-0 bg-night" style={{ opacity: reduceMotion ? 0.45 : shade }} />
          </motion.div>
          <motion.div
            className="shell relative z-10 flex h-full flex-col justify-end pb-14 md:pb-20"
            style={reduceMotion ? undefined : { y: titleY }}
          >
            <Link href="/#work" className="eyebrow wipe-link mb-8 w-fit text-white/70">
              ← {t.session.back}
            </Link>
            <p className="eyebrow text-white/70">{meta.join(" — ")}</p>
            <h1 className="serif mt-4 text-[clamp(60px,11vw,200px)] leading-[0.92] [perspective:900px]">
              <WordsReveal text={title} immediate delay={0.2} />
            </h1>
            <p className="eyebrow mt-8 text-white/60">
              {session.photos.length ? `${String(session.photos.length).padStart(2, "0")} ${t.session.photos}` : t.work.soon}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blurb */}
      <section className="shell py-24 md:py-36">
        <div className="grid grid-cols-12 gap-x-4 gap-y-8 border-t border-line pt-6">
          <p className="eyebrow col-span-12 text-stone md:col-span-3">{t.categories[session.category]}</p>
          <Rise className="col-span-12 md:col-span-9">
            <p className="serif text-[clamp(30px,3.8vw,60px)] leading-[1.1]">{session.blurb[lang]}</p>
          </Rise>
        </div>
      </section>

      {/* Gallery */}
      {session.photos.length > 0 ? (
        <section className="shell flex flex-col gap-4 pb-24 md:gap-10 md:pb-40" aria-label={title}>
          {rows.map((row, r) => {
            if (row.kind === "wide") {
              return (
                <DepthFrame
                  key={r}
                  photo={session.photos[row.i]}
                  speed={0.6}
                  sizes="100vw"
                  onOpen={() => setActive(row.i)}
                />
              );
            }
            if (row.kind === "pair") {
              return (
                <div key={r} className="grid grid-cols-1 items-start gap-4 md:grid-cols-12 md:gap-10">
                  <DepthFrame
                    photo={session.photos[row.a]}
                    speed={0.5}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    onOpen={() => setActive(row.a)}
                    className="md:col-span-6"
                  />
                  <DepthFrame
                    photo={session.photos[row.b]}
                    speed={1.4}
                    sizes="(min-width: 768px) 42vw, 100vw"
                    onOpen={() => setActive(row.b)}
                    className="md:col-span-5 md:col-start-8 md:mt-[14vh]"
                    delay={0.1}
                  />
                </div>
              );
            }
            return (
              <div key={r} className="grid grid-cols-1 md:grid-cols-12">
                <DepthFrame
                  photo={session.photos[row.i]}
                  speed={1}
                  sizes="(min-width: 768px) 58vw, 100vw"
                  onOpen={() => setActive(row.i)}
                  className={row.side === "left" ? "md:col-span-7 md:col-start-2" : "md:col-span-7 md:col-start-5"}
                />
              </div>
            );
          })}
        </section>
      ) : (
        <section className="shell pb-24 md:pb-40">
          <div className="relative flex min-h-[46svh] flex-col items-center justify-center gap-8 bg-night px-6 py-20 text-center text-white">
            <div className="absolute inset-4 border border-fog" aria-hidden />
            <p className="serif relative max-w-[26ch] text-[clamp(28px,3.4vw,52px)] leading-[1.1]">{t.session.soon}</p>
            <Link
              href="/#contact"
              onClick={() => setInquiryType(INQUIRY[session.category])}
              className="relative bg-white px-6 py-4 text-[14px] font-medium text-night transition-colors duration-300 hover:bg-silver"
            >
              {t.session.book}
            </Link>
          </div>
        </section>
      )}

      {session.archive && (
        <section className="shell pb-20">
          <a
            href={site.galleryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-6 border-y border-line py-8"
          >
            <span className="serif text-[clamp(28px,3.6vw,56px)] leading-none transition-transform duration-500 group-hover:translate-x-2 group-hover:italic">
              {t.session.archive}
            </span>
            <span className="text-[28px]" aria-hidden>
              ↗
            </span>
          </a>
        </section>
      )}

      {/* Book + next */}
      <section className="shell grid grid-cols-12 gap-x-4 gap-y-10 pb-28 md:pb-40">
        <div className="col-span-12 md:col-span-5">
          <p className="eyebrow text-stone">{t.categories[session.category]}</p>
          <Link
            href="/#contact"
            onClick={() => setInquiryType(INQUIRY[session.category])}
            className="mt-6 inline-flex items-center gap-4 bg-ink px-6 py-5 text-[15px] font-medium text-bone transition-colors duration-300 hover:bg-graphite"
          >
            {t.session.book} <span aria-hidden>→</span>
          </Link>
        </div>
        {next && next.slug !== slug && (
          <Link
            href={`/work/${next.slug}`}
            className="group col-span-12 block border-t border-line pt-6 md:col-span-7"
          >
            <p className="eyebrow text-stone">{t.session.next}</p>
            <div className="mt-6 flex items-end justify-between gap-6">
              <span className="serif text-[clamp(44px,6vw,104px)] leading-[0.95] transition-transform duration-500 group-hover:translate-x-3 group-hover:italic">
                {next.title[lang]}
              </span>
              <span className="relative hidden aspect-[4/5] w-[140px] shrink-0 overflow-hidden bg-night-2 sm:block">
                <Frame photo={coverOf(next)} sizes="140px" quality={75} />
              </span>
            </div>
          </Link>
        )}
      </section>

      <Viewer
        photos={session.photos}
        index={active}
        title={title}
        onClose={() => setActive(null)}
        onNavigate={setActive}
      />
    </>
  );
}
