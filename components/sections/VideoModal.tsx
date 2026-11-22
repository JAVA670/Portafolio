"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Video } from "@/lib/mockData";
import { Sigil } from "@/components/chrome/Sigil";

type VideoModalProps = {
  video: Video | null;
  onClose: () => void;
};

/** Full-screen theater: native controls, sound on, scroll locked behind. */
export function VideoModal({ video, onClose }: VideoModalProps) {
  const { t } = useLanguage();
  const lenis = useLenis();
  const open = video !== null;

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, onClose, lenis]);

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "linear" }}
          className="fixed inset-0 z-[90] flex flex-col bg-void"
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
        >
          <div className="shell flex h-16 shrink-0 items-center justify-between gap-4 border-b border-hairline">
            <span className="meta truncate">
              <Sigil className="mr-2 h-2.5 w-2.5 -translate-y-px animate-blink text-chrome" />
              <span className="text-strobe">{t.films.nowPlaying}</span> — {video.title}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="cut-sm shrink-0 bg-smoke px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-strobe transition-colors duration-150 ease-linear hover:bg-strobe hover:text-void"
            >
              {t.viewer.close} <span className="hidden sm:inline">[ESC]</span>
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-8" onClick={onClose}>
            <video
              key={video.id}
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full"
              style={{ aspectRatio: video.ratio }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="shell flex shrink-0 items-center justify-between gap-4 border-t border-hairline py-3">
            <p className="meta">{[video.meta, video.year].filter(Boolean).join(" — ") || video.title}</p>
            <p className="meta">{video.label}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
