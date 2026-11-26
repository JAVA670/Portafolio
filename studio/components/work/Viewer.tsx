"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Photo } from "@/lib/sessions";

function Full({ photo }: { photo: Photo }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      sizes="100vw"
      quality={90}
      className={`object-contain transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      onLoad={() => setLoaded(true)}
    />
  );
}

/** Full-screen viewer: uncropped photograph, keyboard + swipe navigation. */
export function Viewer({
  photos,
  index,
  title,
  onClose,
  onNavigate,
}: {
  photos: Photo[];
  index: number | null;
  title: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const { t } = useLanguage();
  const lenis = useLenis();
  const open = index !== null;
  const photo = open ? photos[index] : null;
  const touchX = useRef<number | null>(null);

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

  const btn = "eyebrow px-3 py-2 text-white/80 transition-colors duration-300 hover:text-white";

  return (
    <AnimatePresence>
      {photo && index !== null && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col bg-night text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="shell flex h-16 shrink-0 items-center justify-between gap-4">
            <p className="eyebrow truncate text-white/60">
              {title} — <span className="tabular-nums text-white">{String(index + 1).padStart(2, "0")}</span> /{" "}
              {String(photos.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={onClose} className={btn}>
              {t.viewer.close}
            </button>
          </div>
          <div className="relative min-h-0 flex-1" onClick={onClose}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={photo.src}
                className="absolute inset-3 sm:inset-8"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <Full photo={photo} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="shell flex h-16 shrink-0 items-center justify-between">
            <button type="button" onClick={() => step(-1)} className={btn}>
              ← {t.viewer.prev}
            </button>
            <p className="hidden max-w-[60ch] truncate text-[13px] text-white/50 md:block">{photo.alt}</p>
            <button type="button" onClick={() => step(1)} className={btn}>
              {t.viewer.next} →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
