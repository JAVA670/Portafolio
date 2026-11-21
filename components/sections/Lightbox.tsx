"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { SmartImage } from "@/components/ui/SmartImage";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Photo } from "@/lib/mockData";

type LightboxProps = {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function Lightbox({ photos, index, onClose, onNavigate }: LightboxProps) {
  const { t } = useLanguage();
  const lenis = useLenis();
  const open = index !== null;
  const photo = open ? photos[index] : null;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onNavigate((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onNavigate]
  );

  useEffect(() => {
    if (!open) return;
    lenis?.stop();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, onClose, step, lenis]);

  const btn =
    "border border-hairline px-4 py-1.5 font-mono text-[10px] tracking-[0.25em] text-strobe transition-colors duration-150 ease-linear hover:border-cobalt hover:bg-cobalt";

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "linear" }}
          className="fixed inset-0 z-[90] flex flex-col bg-void/[0.98]"
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
        >
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-8">
            <span className="label-block text-[11px] tabular-nums">
              {String((index ?? 0) + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </span>
            <button type="button" onClick={onClose} className={btn}>
              {t.archive.close} [ESC]
            </button>
          </div>

          <div className="relative flex-1" onClick={onClose}>
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "linear" }}
              className="absolute inset-4 sm:inset-10"
              onClick={(e) => e.stopPropagation()}
            >
              <SmartImage
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-hairline px-4 py-3 sm:px-8">
            <button type="button" onClick={() => step(-1)} className={btn}>
              ← {t.archive.prev}
            </button>
            <span className="label-block hidden text-[11px] tracking-[0.18em] sm:inline-block">
              {photo.caption}
            </span>
            <button type="button" onClick={() => step(1)} className={btn}>
              {t.archive.next} →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
