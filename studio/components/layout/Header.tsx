"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { Logo } from "@/components/brand/Logo";
import { LangToggle } from "@/components/layout/LangToggle";
import { NAV, useAnchor } from "@/components/layout/nav";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { site } from "@/lib/site";

const HEADER = 72;

/**
 * Fixed header that changes tone with what's under it: transparent with the
 * white logo over night sections ([data-tone="dark"]), bone with the ink
 * logo everywhere else.
 */
export function Header() {
  const { t } = useLanguage();
  const lenis = useLenis();
  const anchor = useAnchor();
  const [dark, setDark] = useState(true);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const probe = HEADER / 2;
      const onDark = [...document.querySelectorAll<HTMLElement>('[data-tone="dark"]')].some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= probe && r.bottom > probe;
      });
      setDark(onDark);
      setSolid(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  const text = dark ? "text-white" : "text-ink";
  const bg = !solid ? "bg-transparent" : dark ? "bg-night border-fog" : "bg-bone border-line";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-transparent transition-colors duration-300 ${bg} ${text}`}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6">
          <Link href="/" aria-label={`${site.name} — home`} className="block">
            <Logo className="text-[11px] md:text-[12.5px]" />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {NAV.map((link) => (
              <a key={link.key} href={anchor(link.id)} className="wipe-link text-[14px] tracking-[0.01em]">
                {t.nav[link.key]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <LangToggle dark={dark} className="hidden lg:flex" />
            <a
              href={anchor("contact")}
              className={`hidden px-4 py-2.5 text-[13px] font-medium tracking-[0.02em] transition-colors duration-300 lg:inline-block ${
                dark ? "bg-white text-night hover:bg-silver" : "bg-ink text-bone hover:bg-graphite"
              }`}
            >
              {t.nav.book}
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="eyebrow lg:hidden"
              aria-expanded={open}
              aria-controls="studio-menu"
            >
              {t.nav.menu}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="studio-menu"
            className="fixed inset-0 z-[70] flex flex-col bg-night text-white"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
            role="dialog"
            aria-modal="true"
          >
            <div className="shell flex h-[72px] items-center justify-between">
              <Logo className="text-[11px]" />
              <button type="button" onClick={() => setOpen(false)} className="eyebrow">
                {t.nav.close}
              </button>
            </div>
            <nav className="shell flex flex-1 flex-col justify-center gap-1" aria-label="Mobile">
              {NAV.map((link, i) => (
                <motion.a
                  key={link.key}
                  href={anchor(link.id)}
                  onClick={() => setOpen(false)}
                  className="serif text-[15vw] leading-[1.05]"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.25 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  {t.nav[link.key]}
                </motion.a>
              ))}
            </nav>
            <div className="shell flex items-end justify-between gap-4 pb-8">
              <div className="flex flex-col gap-1 text-[14px] text-white/80">
                <a href={`mailto:${site.email}`}>{site.email}</a>
                <a href={site.phoneHref}>{site.phone}</a>
              </div>
              <LangToggle dark />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
