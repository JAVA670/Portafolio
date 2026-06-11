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

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[90] flex flex-col bg-void/[0.97]"
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-smoke px-4 py-3 sm:px-8">
            <p className="tech-label">
              {String((index ?? 0) + 1).padStart(2, "0")} /{" "}
              {String(photos.length).padStart(2, "0")}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="border border-smoke px-4 py-1.5 text-[10px] tracking-[0.25em] transition-colors hover:bg-blood hover:text-void"
            >
              {t.gallery.close} [ESC]
            </button>
          </div>

          {/* Frame */}
          <div className="relative flex-1" onClick={onClose}>
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, filter: "blur(16px)", scale: 0.98 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
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

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-smoke px-4 py-3 sm:px-8">
            <button
              type="button"
              onClick={() => step(-1)}
              className="border border-smoke px-4 py-1.5 text-[10px] tracking-[0.25em] transition-colors hover:bg-blood hover:text-void"
            >
              ← {t.gallery.prev}
            </button>
            <p className="hidden text-center text-[10px] font-bold tracking-[0.25em] text-laser sm:block">
              {photo.caption}
            </p>
            <button
              type="button"
              onClick={() => step(1)}
              className="border border-smoke px-4 py-1.5 text-[10px] tracking-[0.25em] transition-colors hover:bg-blood hover:text-void"
            >
              {t.gallery.next} →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
