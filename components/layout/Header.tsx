"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { LangToggle, NAV_LINKS } from "@/components/layout/nav";

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
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200 ease-linear ${
          scrolled ? "border-hairline bg-void/85 backdrop-blur-md" : "border-transparent"
        }`}
      >
        <div className="shell grid h-16 grid-cols-12 items-center gap-x-3">
          <a href="#top" className="col-span-6 lg:col-span-3" aria-label="THRULENSES670 — home">
            <span className="label-block">THRULENSES670</span>
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
              className="label-block label-block--cobalt hidden transition-colors duration-150 ease-linear hover:bg-strobe hover:text-void lg:inline-block"
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
