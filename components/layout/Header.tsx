"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Lang } from "@/lib/i18n";

const links = [
  { href: "#photography", key: "photos" },
  { href: "#videos", key: "videos" },
  { href: "#booking", key: "contact" },
] as const;

export function Header() {
  const { lang, t, setLang } = useLanguage();
  const { scrollY } = useScroll();
  const background = useTransform(
    scrollY,
    [0, 240],
    ["rgba(0,0,0,0)", "rgba(0,0,0,0.92)"]
  );

  const toggle = (next: Lang) => (
    <button
      key={next}
      type="button"
      onClick={() => setLang(next)}
      aria-pressed={lang === next}
      className={`px-1.5 py-0.5 text-[10px] tracking-[0.2em] transition-colors ${
        lang === next
          ? "bg-blood text-void"
          : "text-ash hover:text-strobe"
      }`}
    >
      {next.toUpperCase()}
    </button>
  );

  return (
    <motion.header
      style={{ backgroundColor: background }}
      className="fixed inset-x-0 top-0 z-50 border-b border-smoke/60 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-8">
        <a
          href="#top"
          className="font-display text-sm font-bold uppercase tracking-[0.18em] sm:text-base"
        >
          THRULENSES<span className="text-blood">670</span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className="text-[11px] tracking-[0.25em] text-bone transition-colors hover:bg-blood hover:text-void"
            >
              {t.nav[link.key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 border border-smoke p-0.5">
          {toggle("en")}
          {toggle("es")}
        </div>
      </div>

      {/* Mobile nav strip — thumb-reachable, always visible */}
      <nav className="flex justify-between border-t border-smoke/60 px-4 py-2 md:hidden">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            className="text-[10px] tracking-[0.18em] text-bone active:bg-blood active:text-void"
          >
            {t.nav[link.key]}
          </a>
        ))}
      </nav>
    </motion.header>
  );
}
