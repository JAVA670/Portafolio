"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { dictionary, type Dictionary, type Lang } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Lang;
  t: Dictionary;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "tl-studio-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Server always renders EN; the stored/browser preference is applied
  // after hydration so the markup matches.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage blocked — fall back to the browser language */
    }
    const preferred: Lang =
      stored === "en" || stored === "es"
        ? stored
        : navigator.language.toLowerCase().startsWith("es")
          ? "es"
          : "en";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time post-hydration sync
    setLangState(preferred);
    document.documentElement.lang = preferred;
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    document.documentElement.lang = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, t: dictionary[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
