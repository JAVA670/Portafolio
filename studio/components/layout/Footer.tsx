"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { LangToggle } from "@/components/layout/LangToggle";
import { NAV, useAnchor } from "@/components/layout/nav";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { LensMark } from "@/components/brand/Logo";
import { site } from "@/lib/site";

/**
 * Width of "THRULENSES" in Jost (THRU 600 + LENSES 300) at 0.14em tracking,
 * in em — measured in the browser. 100cqw / ratio fills the margins exactly.
 */
const WORDMARK_EM = 7.16;

/**
 * Night footer: an index of links on the grid, then THRULENSES set edge to
 * edge, rising and tilting up into place as the page ends, with the lens
 * mark and STUDIO beneath.
 */
export function Footer() {
  const { t } = useLanguage();
  const anchor = useAnchor();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const rise = useTransform(scrollYProgress, [0, 1], ["18%", "0%"]);
  const tilt = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const year = new Date().getFullYear();

  return (
    <footer ref={ref} data-tone="dark" className="relative overflow-hidden bg-night text-white">
      <div className="shell grid grid-cols-2 gap-x-4 gap-y-10 pb-16 pt-24 md:grid-cols-12 md:pt-32">
        <div className="col-span-2 flex flex-col gap-2 md:col-span-4">
          <p className="eyebrow mb-2 text-white/50">{t.footer.contact}</p>
          <a href={`mailto:${site.email}`} className="wipe-link w-fit text-[15px]">
            {site.email}
          </a>
          <a href={site.phoneHref} className="wipe-link w-fit text-[15px]">
            {site.phone}
          </a>
        </div>
        <nav className="flex flex-col gap-2 md:col-span-3" aria-label="Footer">
          <p className="eyebrow mb-2 text-white/50">{t.footer.index}</p>
          {NAV.map((link) => (
            <a key={link.key} href={anchor(link.id)} className="wipe-link w-fit text-[15px]">
              {t.nav[link.key]}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-2 md:col-span-3">
          <p className="eyebrow mb-2 text-white/50">{t.footer.follow}</p>
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="wipe-link w-fit text-[15px]">
            Instagram ↗
          </a>
          <a href={site.galleryUrl} target="_blank" rel="noopener noreferrer" className="wipe-link w-fit text-[15px]">
            {t.footer.gallery} ↗
          </a>
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <p className="eyebrow mb-2 text-white/50">{t.footer.language}</p>
          <LangToggle dark />
        </div>
      </div>

      <div className="shell [perspective:1200px]" aria-hidden>
        <motion.div
          style={reduceMotion ? undefined : { y: rise, rotateX: tilt }}
          className="origin-bottom"
        >
          <div className="[container-type:inline-size]">
            <p
              className="font-logo select-none whitespace-nowrap uppercase leading-[0.82] tracking-[0.14em]"
              style={{ fontSize: `calc(100cqw / ${WORDMARK_EM})`, marginRight: "-0.14em" }}
            >
              <span className="font-semibold">Thru</span>
              <span className="font-light">lenses</span>
            </p>
          </div>
          <p className="mt-6 flex items-center justify-center gap-6 text-silver md:mt-8">
            <span className="h-px flex-1 bg-white/20" />
            <LensMark className="h-[clamp(22px,2.4vw,34px)] w-[clamp(22px,2.4vw,34px)]" strokeWidth={1.3} />
            <span className="font-logo -mr-[0.5em] text-[clamp(13px,1.6vw,22px)] uppercase tracking-[0.5em]">Studio</span>
            <span className="h-px flex-1 bg-white/20" />
          </p>
        </motion.div>
      </div>

      <div className="shell">
        <div className="mt-12 flex flex-col gap-2 border-t border-fog py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow text-white/50">
            © {year} — {t.footer.rights}
          </p>
          <a href="#top" className="eyebrow wipe-link w-fit text-white/80">
            ↑ {t.footer.top}
          </a>
        </div>
      </div>
    </footer>
  );
}
