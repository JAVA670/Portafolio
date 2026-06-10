"use client";

import { useEffect, useRef, useState } from "react";

type AutoVideoProps = {
  src: string;
  poster: string;
  className?: string;
};

/**
 * Scroll-aware HTML5 video. Stays a poster frame until it enters the
 * viewport, then lazily attaches the source and autoplays muted + looped.
 * Pauses again off-screen so multiple vaults never fight for decode time.
 */
export function AutoVideo({ src, poster, className }: AutoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setActivated(true);
      },
      { rootMargin: "120px 0px", threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !activated) return;

    if (inView) {
      node.play().catch(() => {
        /* missing placeholder file or autoplay blocked — poster stays up */
      });
    } else {
      node.pause();
    }
  }, [inView, activated]);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      src={activated ? src : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
    />
  );
}
