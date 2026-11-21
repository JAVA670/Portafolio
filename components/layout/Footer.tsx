"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { contact } from "@/lib/mockData";

/** Scroll-linked marquee row — drifts opposite to its sibling. */
function MarqueeRow({
  text,
  from,
  to,
  progress,
  variant,
}: {
  text: string;
  from: string;
  to: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  variant: "white" | "cobalt";
}) {
  const reduceMotion = useReducedMotion();
  const x = useTransform(progress, [0, 1], [from, to]);
  return (
    <div
      className={`overflow-hidden py-2 ${
        variant === "white" ? "bg-strobe text-void" : "bg-cobalt text-strobe"
      }`}
    >
      <motion.p
        style={reduceMotion ? undefined : { x }}
        className="whitespace-nowrap font-display text-2xl font-extrabold uppercase tracking-[-0.01em] md:text-4xl"
      >
        {`${text} ${text} ${text}`}
      </motion.p>
    </div>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

  return (
    <footer ref={ref} className="overflow-hidden bg-void">
      <div className="-rotate-1 scale-[1.02]">
        <MarqueeRow text={t.footer.marqueeA} from="0%" to="-30%" progress={scrollYProgress} variant="white" />
        <MarqueeRow text={t.footer.marqueeB} from="-30%" to="0%" progress={scrollYProgress} variant="cobalt" />
      </div>

      <div className="grid gap-6 px-4 pt-16 sm:px-8 md:grid-cols-12">
        <div className="flex flex-col gap-1 md:col-span-4">
          <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="snap-link meta w-fit text-strobe">
            IG / @{contact.instagram.toUpperCase()}
          </a>
          <a href={`mailto:${contact.email}`} className="snap-link meta w-fit text-strobe">
            {contact.email.toUpperCase()}
          </a>
          <a href={contact.phoneHref} className="snap-link meta w-fit text-strobe">
            {contact.phone}
          </a>
        </div>
        <p className="meta md:col-span-5">
          © {new Date().getFullYear()} — {t.footer.rights}
        </p>
        <a href="#top" className="snap-link meta w-fit text-strobe md:col-span-3 md:justify-self-end">
          ↑ {t.footer.top}
        </a>
      </div>

      {/* Edge-to-edge wordmark */}
      <p
        aria-hidden
        className="mt-10 select-none whitespace-nowrap text-center font-display text-[6.9vw] font-extrabold uppercase leading-[0.8] tracking-[-0.06em]"
      >
        THRULENSES<span className="text-chrome">670</span>
      </p>
    </footer>
  );
}
