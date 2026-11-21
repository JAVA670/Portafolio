"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { SmartImage } from "@/components/ui/SmartImage";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { chapters, frameNumber, type Photo } from "@/lib/mockData";

type LightboxProps = {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

const btn =
  "border border-hairline px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-strobe transition-colors duration-150 ease-linear hover:border-signal hover:bg-signal";

/** Full-resolution frame that fades in over the cached card-size layer. */
function FullRes({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      quality={85}
      className={`object-contain transition-opacity duration-300 ease-linear ${loaded ? "opacity-100" : "opacity-0"}`}
      onLoad={() => setLoaded(true)}
    />
  );
}

/** Full-screen viewer: uncropped frame, keyboard + swipe, verified details. */
export function Lightbox({ photos, index, onClose, onNavigate }: LightboxProps) {
  const { t } = useLanguage();
  const lenis = useLenis();
  const open = index !== null && index >= 0;
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

  const chapter = photo ? chapters.find((c) => c.id === photo.chapter) : undefined;
  const chapterLabel = chapter ? `${chapter.numeral} // ${t.work.chapters[chapter.id].title}` : "";
  const details = photo ? [photo.artist, photo.venue, photo.date].filter(Boolean).join(" — ") : "";

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "linear" }}
          className="fixed inset-0 z-[90] flex flex-col bg-void"
          role="dialog"
          aria-modal="true"
          aria-label={photo.caption}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="shell flex h-16 shrink-0 items-center justify-between gap-4 border-b border-hairline">
            <span className="meta">
              <span className="text-strobe">FR.{frameNumber.get(photo.id)}</span> — {chapterLabel}
            </span>
            <button type="button" onClick={onClose} className={btn}>
              {t.viewer.close} <span className="hidden sm:inline">[ESC]</span>
            </button>
          </div>

          <div className="relative min-h-0 flex-1" onClick={onClose}>
            <motion.div
              key={photo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.22, ease: "linear" }}
              className="absolute inset-3 sm:inset-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Instant layer: the card-size file is already in cache. */}
              <SmartImage
                src={photo.src}
                alt=""
                aria-hidden
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                quality={85}
                className="object-contain"
              />
              {/* Full-resolution layer fades in once decoded. */}
              <FullRes key={photo.id} src={photo.src} alt={photo.alt} />
            </motion.div>
          </div>

          <div className="shell grid shrink-0 grid-cols-12 items-center gap-3 border-t border-hairline py-3">
            <button type="button" onClick={() => step(-1)} className={`${btn} col-span-3 justify-self-start md:col-span-2`}>
              ← {t.viewer.prev}
            </button>
            <div className="col-span-6 text-center md:col-span-8">
              <p className="wide truncate text-[12px] font-bold uppercase tracking-[0.12em] text-strobe">{photo.caption}</p>
              <p className="meta hidden truncate md:block">{details || photo.alt}</p>
            </div>
            <button type="button" onClick={() => step(1)} className={`${btn} col-span-3 justify-self-end md:col-span-2`}>
              {t.viewer.next} →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
