"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { LangToggle, NAV_LINKS } from "@/components/layout/nav";
import { contact } from "@/lib/mockData";
import { ChromeWordmark } from "@/components/hero/ChromeWordmark";
import { ChromeDivider } from "@/components/chrome/Ornaments";

const EASE = [0.77, 0, 0.175, 1] as const;

/** Full-screen menu for touch devices: huge condensed links, contact lines. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, onClose, lenis]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[70] flex flex-col bg-void"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="shell flex h-16 items-center justify-between border-b border-hairline">
            <ChromeWordmark glint={false} className="w-[128px]" sizes="160px" />
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-strobe"
            >
              {t.nav.close} <span className="text-dim">[×]</span>
            </button>
          </div>

          <nav className="shell flex flex-1 flex-col justify-center" aria-label="Mobile">
            <ChromeDivider className="mb-6 w-full opacity-90" />
            {NAV_LINKS.map((link, i) => (
              <span key={link.key} className="block overflow-hidden border-b border-hairline">
                <motion.a
                  href={link.href}
                  onClick={onClose}
                  className="flex items-baseline gap-4 py-2"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.25 + i * 0.06 }}
                >
                  <span className="meta w-6">0{i + 1}</span>
                  <span className="display text-[17vw]">{t.nav[link.key]}</span>
                </motion.a>
              </span>
            ))}
          </nav>

          <div className="shell flex items-end justify-between gap-6 pb-8">
            <div className="flex flex-col gap-1">
              <a href={`mailto:${contact.email}`} className="meta text-strobe">
                {contact.email}
              </a>
              <a href={contact.phoneHref} className="meta text-strobe">
                {contact.phone}
              </a>
              <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="meta text-strobe">
                IG @{contact.instagram}
              </a>
              <a href={contact.studioUrl} target="_blank" rel="noopener noreferrer" className="meta text-strobe">
                THRULENSES STUDIO ↗
              </a>
            </div>
            <LangToggle />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
