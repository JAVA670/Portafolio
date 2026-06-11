"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Video } from "@/lib/mockData";

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
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[90] flex flex-col bg-void/[0.97]"
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
        >
          <div className="flex items-center justify-between border-b border-smoke px-4 py-3 sm:px-8">
            <p className="tech-label-red animate-flicker">
              ▶ NOW PLAYING — {video.title}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="border border-smoke px-4 py-1.5 text-[10px] tracking-[0.25em] transition-colors hover:bg-blood hover:text-void"
            >
              {t.gallery.close} [ESC]
            </button>
          </div>

          <div
            className="flex flex-1 items-center justify-center p-4 sm:p-10"
            onClick={onClose}
          >
            <motion.video
              key={video.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full border border-crimson box-glow-red"
              style={{ aspectRatio: video.ratio }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="flex items-center justify-between border-t border-smoke px-4 py-3 sm:px-8">
            <p className="tech-label">{video.event}</p>
            <p className="tech-label">
              {video.label} / {video.year}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
