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
          transition={{ duration: 0.18, ease: "linear" }}
          className="fixed inset-0 z-[90] flex flex-col bg-void/[0.98]"
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
        >
          <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3 sm:px-8">
            <span className="label-block label-block--cobalt truncate text-[11px] tracking-[0.18em]">
              ▶ NOW PLAYING — {video.title}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 border border-hairline px-4 py-1.5 font-mono text-[10px] tracking-[0.25em] transition-colors duration-150 ease-linear hover:border-cobalt hover:bg-cobalt"
            >
              {t.archive.close} [ESC]
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
              transition={{ duration: 0.2, ease: "linear" }}
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full border border-hairline"
              style={{ aspectRatio: video.ratio }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="flex items-center justify-between border-t border-hairline px-4 py-3 sm:px-8">
            <p className="meta">{video.event}</p>
            <p className="meta">
              {video.label} / {video.year}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
