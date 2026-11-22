"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { LangToggle, NAV_LINKS } from "@/components/layout/nav";
import { contact } from "@/lib/mockData";
import { ChromeWordmark } from "@/components/hero/ChromeWordmark";
import { ThornRule } from "@/components/chrome/ThornRule";

/**
 * Footer: four-column index on the grid, then the tall cyber-sigil chrome
 * wordmark set edge to edge as the closing poster.
 */
export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 md:mt-32">
      <div className="shell">
        <ThornRule />
      </div>
      <div className="shell grid grid-cols-2 gap-x-3 gap-y-10 py-14 md:grid-cols-12 md:py-20">
        <div className="col-span-2 flex flex-col gap-2 md:col-span-4">
          <span className="meta mb-2 text-dim">{t.footer.contact}</span>
          <a href={`mailto:${contact.email}`} className="snap-link meta w-fit text-strobe">
            {contact.email}
          </a>
          <a href={contact.phoneHref} className="snap-link meta w-fit text-strobe">
            {contact.phone}
          </a>
        </div>
        <div className="flex flex-col gap-2 md:col-span-3">
          <span className="meta mb-2 text-dim">{t.footer.social}</span>
          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="snap-link meta w-fit text-strobe"
          >
            INSTAGRAM ↗
          </a>
        </div>
        <nav className="flex flex-col gap-2 md:col-span-3" aria-label="Footer">
          <span className="meta mb-2 text-dim">{t.footer.navigate}</span>
          {NAV_LINKS.map((link, i) => (
            <a key={link.key} href={link.href} className="snap-link meta w-fit text-strobe">
              0{i + 1} {t.nav[link.key]}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-2 md:col-span-2">
          <span className="meta mb-2 text-dim">{t.footer.language}</span>
          <LangToggle />
        </div>
      </div>

      <div className="shell" aria-hidden>
        <ChromeWordmark variant="tall" className="w-full" sizes="(min-width: 1440px) 1360px, 100vw" />
      </div>

      <div className="shell">
        <ThornRule />
        <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="meta">
            © {year} — {t.footer.rights}
          </p>
          <a href="#top" className="snap-link meta w-fit text-strobe">
            ↑ {t.footer.top}
          </a>
        </div>
      </div>
    </footer>
  );
}
