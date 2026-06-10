"use client";

import { motion } from "framer-motion";
import { TextReveal } from "@/components/fx/TextReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { contact } from "@/lib/mockData";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-void">
      {/* Oversized editorial CTA */}
      <motion.a
        href="#booking"
        data-cursor="GO"
        whileHover="hover"
        className="group block overflow-hidden border-t border-crimson px-4 py-16 sm:px-8 md:py-24"
      >
        <p className="tech-label-red mb-4 animate-flicker motion-reduce:animate-none">
          ▮ {t.footer.ctaLabel}
        </p>
        <div className="flex flex-wrap items-baseline gap-x-6">
          <h2 className="font-display text-[11vw] font-bold uppercase leading-[0.85] tracking-tighter transition-colors duration-300 group-hover:text-blood md:text-[9vw]">
            <TextReveal text={t.footer.cta} stagger={0.03} />
          </h2>
          <motion.span
            variants={{ hover: { x: 24 } }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[11vw] font-bold leading-[0.85] text-blood glow-red md:text-[9vw]"
            aria-hidden
          >
            →
          </motion.span>
        </div>
      </motion.a>

      <div className="border-t border-smoke px-4 py-10 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="font-display text-2xl font-bold uppercase tracking-[0.14em] sm:text-3xl">
            THROUGHLENSES<span className="text-blood">670</span>
          </p>
          <div className="flex flex-col gap-1 text-[10px] tracking-[0.2em] text-ash md:items-end">
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-laser"
            >
              IG / @{contact.instagram.toUpperCase()}
            </a>
            <a href={`mailto:${contact.email}`} className="hover:text-laser">
              {contact.email.toUpperCase()}
            </a>
            <p className="mt-2">
              © {new Date().getFullYear()} — {t.footer.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
