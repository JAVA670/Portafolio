"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { LangToggle, NAV_LINKS } from "@/components/layout/nav";
import { ChromeWordmark } from "@/components/hero/ChromeWordmark";
import { ThornRule } from "@/components/chrome/ThornRule";

export function Header() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ease-linear ${
          scrolled ? "bg-void/95" : "bg-transparent"
        }`}
      >
        <ThornRule
          className={`pointer-events-none absolute inset-x-0 -bottom-[7px] transition-opacity duration-200 ease-linear ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="shell grid h-16 grid-cols-12 items-center gap-x-3">
          <a href="#top" className="col-span-6 w-fit lg:col-span-3" aria-label="THRULENSES670 — home">
            <ChromeWordmark glint={false} className="w-[128px] md:w-[148px]" sizes="160px" />
          </a>

          <nav className="col-span-6 hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.key}
                href={link.href}
                className="snap-link font-mono text-[11px] uppercase tracking-[0.15em] text-strobe"
              >
                <span className="text-dim">0{i + 1}</span> {t.nav[link.key]}
              </a>
            ))}
          </nav>

          <div className="col-span-6 flex items-center justify-end gap-4 lg:col-span-3">
            <LangToggle className="hidden lg:flex" />
            <a
              href="#booking"
              className="label-block label-block--chrome hidden transition-colors duration-150 ease-linear hover:bg-none hover:bg-strobe lg:inline-block"
            >
              {t.nav.book}
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-strobe lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {t.nav.menu} <span className="text-dim">[+]</span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
