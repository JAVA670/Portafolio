"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { SectionHead } from "@/components/fx/SectionHead";
import { ChapterBlock } from "@/components/work/ChapterBlock";
import { Lightbox } from "@/components/sections/Lightbox";
import { Sigil } from "@/components/chrome/Sigil";
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
  const [current, setCurrent] = useState<ChapterId>(chapters[0].id);
  const [active, setActive] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? chapters : chapters.filter((c) => c.id === filter)),
    [filter]
  );
  const viewerList = useMemo(
    () => visible.flatMap((c) => chapterPhotoIds(c.id)).map((id) => photoById.get(id)!),
    [visible]
  );

  // The last chapter whose top has passed the middle of the screen, read
  // from layout once per frame while scrolling — so jumps (anchors,
  // filters, back-to-top) always report the right chapter.
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const middle = window.innerHeight / 2;
      let next: ChapterId | null = null;
      for (const chapter of visible) {
        const node = chapterRefs.current[chapter.id];
        if (node && node.getBoundingClientRect().top < middle) next = chapter.id;
      }
      if (next) setCurrent(next);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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
        className="sticky top-16 z-30 mt-12 border-y border-hairline bg-void md:mt-16"
      >
        <div className="shell flex items-center justify-between gap-6">
          <div
            role="tablist"
            aria-label={t.work.title}
            className="-mx-1 flex gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  className={`cut-sm shrink-0 whitespace-nowrap px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-150 ease-linear ${
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
              <Sigil className="mr-1.5 h-2.5 w-2.5 -translate-y-px animate-blink text-signal" />
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
          {visible.map((chapter, i) => (
            <ChapterBlock
              key={chapter.id}
              chapter={chapter}
              first={i === 0}
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
