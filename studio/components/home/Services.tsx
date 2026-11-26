"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { SectionTitle } from "@/components/home/SectionTitle";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAnchor } from "@/components/layout/nav";
import { setInquiryType, type InquiryType } from "@/lib/inquiry";
import { imageFor, type Category, type Photo } from "@/lib/sessions";

const EXPO = [0.16, 1, 0.3, 1] as const;

type ServiceKey = "celebrations" | "events" | "portraits" | "more";

const SERVICES: { key: ServiceKey; category?: Category; inquiry: InquiryType }[] = [
  { key: "celebrations", category: "celebrations", inquiry: "celebration" },
  { key: "events", category: "events", inquiry: "event" },
  { key: "portraits", category: "portraits", inquiry: "portrait" },
  { key: "more", inquiry: "other" },
];

/**
 * 02 — Services as an editorial index. Rows hinge up into place from flat
 * (rotateX) as they enter; on desktop, hovering a row floats its photograph
 * beside the cursor, leaning into the direction of travel.
 */
export function Services() {
  const { t } = useLanguage();
  const anchor = useAnchor();
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  const images: (Photo | undefined)[] = SERVICES.map((s) => (s.category ? imageFor(s.category) : undefined));

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 26, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 26, mass: 0.6 });
  const vx = useVelocity(x);
  const tilt = useSpring(useTransform(vx, [-1600, 1600], [-12, 12], { clamp: true }), {
    stiffness: 200,
    damping: 24,
  });

  const [fine, setFine] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFine(window.matchMedia("(pointer: fine)").matches));
    return () => cancelAnimationFrame(id);
  }, []);

  const preview = hovered !== null ? images[hovered] : undefined;

  return (
    <section id="services" className="shell relative scroll-mt-20 pb-28 md:pb-40">
      <SectionTitle label={t.services.label} title={t.services.title} />

      <ol
        className="mt-14 border-b border-line md:mt-20"
        onPointerMove={(e) => {
          mx.set(e.clientX);
          my.set(e.clientY);
        }}
        onPointerLeave={() => setHovered(null)}
      >
        {SERVICES.map((service, i) => {
          const copy = t.services.items[service.key];
          const image = images[i];
          return (
            <motion.li
              key={service.key}
              className="group border-t border-line [perspective:1200px]"
              onPointerEnter={() => setHovered(i)}
              initial={reduceMotion ? false : "hidden"}
              whileInView="shown"
              viewport={{ once: true, margin: "-8% 0px" }}
            >
              <motion.div
                className="grid grid-cols-12 items-baseline gap-x-4 gap-y-4 py-8 md:py-10"
                style={{ transformOrigin: "50% 0%" }}
                variants={{
                  hidden: { rotateX: -75, opacity: 0, y: 30 },
                  shown: {
                    rotateX: 0,
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.1, delay: i * 0.09, ease: EXPO },
                  },
                }}
              >
                <span className="eyebrow col-span-2 text-stone md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="serif col-span-10 text-[clamp(44px,7vw,120px)] leading-[0.95] transition-[transform,font-style] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 group-hover:italic md:col-span-6">
                  {copy.title}
                </h3>
                <div className="col-span-12 flex flex-col gap-5 md:col-span-5 md:pl-6">
                  {image && (
                    <span className="relative block aspect-video w-full overflow-hidden bg-night-2 md:hidden">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="100vw"
                        quality={75}
                        className="object-cover"
                        style={{ objectPosition: image.focus ?? "50% 50%" }}
                      />
                    </span>
                  )}
                  <p className="max-w-[40ch] text-[16px] leading-[1.6] text-graphite md:text-[17px]">{copy.text}</p>
                  <a
                    href={anchor("contact")}
                    onClick={() => setInquiryType(service.inquiry)}
                    className="wipe-link w-fit text-[14px] font-medium"
                  >
                    {t.services.cta} →
                  </a>
                </div>
              </motion.div>
            </motion.li>
          );
        })}
      </ol>

      {/* Cursor-following photograph (desktop). Always rendered so SSR markup matches. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 hidden w-[300px] lg:block"
        style={{ x, y }}
      >
        <motion.div className="-translate-x-1/2 -translate-y-[60%]" style={{ rotate: reduceMotion ? 0 : tilt }}>
        <AnimatePresence>
          {fine && preview && (
            <motion.div
              key={preview.src}
              className="relative aspect-[4/5] w-full overflow-hidden bg-night-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
              initial={{ clipPath: "inset(100% 0 0 0)", scale: 0.9 }}
              animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
              exit={{ clipPath: "inset(0 0 100% 0)", scale: 0.95 }}
              transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1] }}
            >
              <Image
                src={preview.src}
                alt=""
                fill
                sizes="300px"
                quality={75}
                className="object-cover"
                style={{ objectPosition: preview.focus ?? "50% 50%" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}
