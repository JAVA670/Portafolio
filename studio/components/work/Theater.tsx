"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { Frame } from "@/components/ui/Frame";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Film, Photo } from "@/lib/sessions";

/** Privacy-friendly embed URL; nothing loads until someone presses play. */
function embedUrl(film: Film) {
  if (film.youtube) {
    return `https://www.youtube-nocookie.com/embed/${film.youtube}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }
  if (film.vimeo) {
    return `https://player.vimeo.com/video/${film.vimeo}?autoplay=1&byline=0&title=0&portrait=0&dnt=1`;
  }
  return null;
}

/**
 * The session's film: a full-bleed poster (silent loop if there is one,
 * else a photo) with a play button. Playing opens a full-screen night
 * theater with the full-quality YouTube/Vimeo player — the film itself
 * is streamed from there, never from this site.
 */
export function Theater({ film, title, poster }: { film: Film; title: string; poster?: Photo }) {
  const { t } = useLanguage();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const src = embedUrl(film);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, lenis]);

  if (!src) return null;
  const ratio = film.ratio ?? 16 / 9;

  return (
    <section className="shell pb-24 md:pb-40" aria-label={`${t.session.film} — ${title}`}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden bg-night text-left text-white"
        style={{ aspectRatio: ratio >= 1 ? ratio : 4 / 5 }}
        aria-label={`${t.session.play} — ${title}`}
      >
        {film.preview ? (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            src={film.preview}
            poster={film.poster}
            muted
            loop
            playsInline
            autoPlay
            aria-hidden
          />
        ) : (
          <span className="absolute inset-0 opacity-80 transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
            <Frame photo={poster} sizes="100vw" />
          </span>
        )}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-night/30">
          <span className="flex h-20 w-20 items-center justify-center border border-white/70 transition-colors duration-500 group-hover:bg-white group-hover:text-night md:h-24 md:w-24">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" aria-hidden>
              <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="eyebrow text-white/85">
            {t.session.play} — {t.session.film}
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col bg-night text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="shell flex h-16 shrink-0 items-center justify-between gap-4">
              <p className="eyebrow truncate text-white/60">{title}</p>
              <button type="button" onClick={() => setOpen(false)} className="eyebrow px-3 py-2 text-white/80 hover:text-white">
                {t.viewer.close}
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-8" onClick={() => setOpen(false)}>
              <div
                className="relative max-h-full w-full"
                style={{ aspectRatio: ratio, maxWidth: `calc((100svh - 8rem) * ${ratio})` }}
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  src={src}
                  title={title}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
