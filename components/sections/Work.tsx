"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { SectionHead } from "@/components/fx/SectionHead";
import { ChapterBlock } from "@/components/work/ChapterBlock";
import { Lightbox } from "@/components/sections/Lightbox";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { chapterPhotoIds, chapters, photoById, photos, type ChapterId } from "@/lib/mockData";

type Filter = "all" | ChapterId;

/**
 * 01 WORK — colour chapters with a sticky filter. "All series" shows every
 * chapter in sequence; a chapter tab isolates one palette. The viewer always
 * navigates within what is currently shown.
 */
export function Work() {
  const { t } = useLanguage();
  const lenis = useLenis();
  const sectionRef = useRef<HTMLElement>(null);
  const chapterRefs = useRef<Record<string, HTMLElement | null>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [current, setCurrent] = useState<ChapterId>("inferno");
  const [active, setActive] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? chapters : chapters.filter((c) => c.id === filter)),
    [filter]
  );
  const viewerList = useMemo(
    () => visible.flatMap((c) => chapterPhotoIds(c.id)).map((id) => photoById.get(id)!),
    [visible]
  );

  // Which chapter is crossing the middle of the screen.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.getAttribute("data-chapter") as ChapterId);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    Object.values(chapterRefs.current).forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [visible]);

  const choose = (next: Filter) => {
    if (next === filter) return;
    setFilter(next);
    if (next !== "all") setCurrent(next);
    const node = sectionRef.current;
    if (node && node.getBoundingClientRect().top < 0) {
      const target = node.querySelector<HTMLElement>("[data-filterbar]");
      if (target) lenis?.scrollTo(target, { offset: -64, duration: 0.9 });
    }
  };

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: t.work.all, count: photos.length },
    ...chapters.map((c, i) => ({
      id: c.id,
      label: `0${i + 1}. ${t.work.chapters[c.id].title}`,
      count: chapterPhotoIds(c.id).length,
    })),
  ];

  const currentChapter = chapters.find((c) => c.id === current);

  return (
    <section ref={sectionRef} id="work" className="relative">
      <SectionHead
        label={t.work.label}
        title={t.work.title}
        sub={t.work.sub}
        aside={`${String(photos.length).padStart(3, "0")} ${t.work.frames} — 0${chapters.length} ${t.work.chapter}S`}
      />

      {/* Sticky chapter filter */}
      <div
        data-filterbar
        className="sticky top-16 z-30 mt-12 border-y border-hairline bg-void/90 backdrop-blur-md md:mt-16"
      >
        <div className="shell flex items-center justify-between gap-6">
          <div
            role="tablist"
            aria-label={t.work.title}
            className="-mx-1 flex gap-1 overflow-x-auto py-2.5 [mask-image:linear-gradient(to_right,#000_82%,transparent)] [scrollbar-width:none] md:[mask-image:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab) => {
              const selected = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => choose(tab.id)}
                  className={`shrink-0 whitespace-nowrap px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-150 ease-linear ${
                    selected ? "bg-cobalt text-strobe" : "text-strobe hover:bg-strobe hover:text-void"
                  }`}
                >
                  [ {tab.label} <span className={selected ? "text-strobe/70" : "text-dim"}>— {String(tab.count).padStart(2, "0")}</span> ]
                </button>
              );
            })}
          </div>
          {currentChapter && (
            <p className="meta hidden shrink-0 lg:block" aria-live="polite">
              {t.work.now}: <span className="text-strobe">{`${currentChapter.numeral} // ${t.work.chapters[currentChapter.id].title}`}</span>
            </p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "linear" }}
        >
          {visible.map((chapter) => (
            <ChapterBlock
              key={chapter.id}
              chapter={chapter}
              ref={(node) => {
                chapterRefs.current[chapter.id] = node;
              }}
              onOpen={(id) => setActive(viewerList.findIndex((p) => p.id === id))}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <Lightbox photos={viewerList} index={active} onClose={() => setActive(null)} onNavigate={setActive} />
    </section>
  );
}
