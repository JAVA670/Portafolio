"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Lang } from "@/lib/i18n";

export function LangToggle({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  const { lang, setLang } = useLanguage();
  const option = (value: Lang) => {
    const active = lang === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => setLang(value)}
        aria-pressed={active}
        className={`eyebrow px-1.5 py-0.5 transition-colors duration-200 ${
          active
            ? dark
              ? "bg-white text-night"
              : "bg-ink text-bone"
            : dark
              ? "text-white/60 hover:text-white"
              : "text-stone hover:text-ink"
        }`}
      >
        {value}
      </button>
    );
  };
  return (
    <div className={`flex items-center gap-0.5 ${className}`} role="group" aria-label="Language">
      {option("en")}
      {option("es")}
    </div>
  );
}
