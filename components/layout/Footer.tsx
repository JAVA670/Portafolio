"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { contact } from "@/lib/mockData";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-smoke bg-void px-4 py-10 sm:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <p className="font-display text-2xl font-bold uppercase tracking-[0.14em] sm:text-3xl">
          THROUGHLENSES<span className="text-ash">670</span>
        </p>
        <div className="flex flex-col gap-1 text-[10px] tracking-[0.2em] text-ash md:items-end">
          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-strobe"
          >
            IG / @{contact.instagram.toUpperCase()}
          </a>
          <a href={`mailto:${contact.email}`} className="hover:text-strobe">
            {contact.email.toUpperCase()}
          </a>
          <p className="mt-2">
            © {new Date().getFullYear()} — {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
