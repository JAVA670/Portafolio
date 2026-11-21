"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Lang } from "@/lib/i18n";

export const NAV_LINKS = [
  { href: "#work", key: "work" },
  { href: "#archive", key: "archive" },
  { href: "#films", key: "films" },
  { href: "#booking", key: "booking" },
] as const;

export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const option = (value: Lang) => (
    <button
      key={value}
      type="button"
      onClick={() => setLang(value)}
      aria-pressed={lang === value}
      className={`px-1.5 py-0.5 font-mono text-[11px] tracking-[0.15em] transition-colors duration-150 ease-linear ${
        lang === value ? "bg-strobe text-void" : "text-mute hover:bg-cobalt hover:text-strobe"
      }`}
    >
      {value.toUpperCase()}
    </button>
  );
  return (
    <div className={`flex items-center gap-0.5 ${className}`} role="group" aria-label="Language">
      {option("en")}
      {option("es")}
    </div>
  );
}
