"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Lang } from "@/lib/i18n";

const links = [
  { href: "#work", key: "work" },
  { href: "#archive", key: "archive" },
  { href: "#films", key: "films" },
  { href: "#booking", key: "booking" },
] as const;

export function Header() {
  const { lang, t, setLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const toggle = (next: Lang) => (
    <button
      key={next}
      type="button"
      onClick={() => setLang(next)}
      aria-pressed={lang === next}
      className={`px-1.5 py-0.5 font-mono text-[10px] tracking-[0.2em] transition-colors duration-150 ease-linear ${
        lang === next ? "bg-strobe text-void" : "text-ash hover:bg-cobalt hover:text-strobe"
      }`}
    >
      {next.toUpperCase()}
    </button>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200 ease-linear ${
        scrolled ? "border-hairline bg-void/90 backdrop-blur-md" : "border-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <a href="#top" className="label-block text-[12px] sm:text-[13px]">
          THRULENSES670
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link, i) => (
            <a
              key={link.key}
              href={link.href}
              className="snap-link font-mono text-[11px] tracking-[0.22em] text-strobe"
            >
              <span className="text-ash">0{i + 1}</span> {t.nav[link.key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-0.5 border border-hairline p-0.5">
          {toggle("en")}
          {toggle("es")}
        </div>
      </div>

      {/* Mobile nav strip — thumb-reachable, always visible */}
      <nav className="flex justify-between border-t border-hairline bg-void/90 px-4 py-2 md:hidden">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            className="snap-link font-mono text-[10px] tracking-[0.18em] text-bone"
          >
            {t.nav[link.key]}
          </a>
        ))}
      </nav>
    </header>
  );
}
