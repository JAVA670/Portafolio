"use client";

import { useEffect, useState } from "react";

const chapters = [
  { id: "top", num: "00" },
  { id: "photography", num: "01" },
  { id: "videos", num: "02" },
  { id: "booking", num: "03" },
];

/**
 * Fixed chapter index on the right edge — Cartier-style scroll storytelling.
 * Tracks the section currently on screen and lights its number red.
 */
export function ChapterRail() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A narrow band around the viewport's center decides the chapter.
      { rootMargin: "-45% 0px -45% 0px" }
    );
    for (const chapter of chapters) {
      const node = document.getElementById(chapter.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Chapters"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex"
    >
      {chapters.map((chapter) => {
        const isActive = active === chapter.id;
        return (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            className="group flex items-center gap-2"
          >
            <span
              className={`text-[9px] tracking-[0.25em] transition-colors ${
                isActive ? "text-blood glow-red" : "text-ash group-hover:text-bone"
              }`}
            >
              {chapter.num}
            </span>
            <span
              className={`h-px transition-all duration-300 ${
                isActive
                  ? "w-8 bg-blood shadow-[0_0_8px_rgba(232,0,45,0.9)]"
                  : "w-4 bg-smoke group-hover:bg-ash"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
