"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BlurReveal } from "@/components/fx/BlurReveal";
import { TextReveal } from "@/components/fx/TextReveal";

type SectionHeaderProps = {
  label: string;
  title: string;
  sub: string;
};

export function SectionHeader({ label, title, sub }: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Title shears sideways as it crosses the viewport — cheap parallax drama.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  return (
    <div ref={ref} className="overflow-hidden border-b border-crimson px-4 pb-8 pt-24 sm:px-8 md:pt-32">
      <BlurReveal>
        <p className="tech-label-red mb-4 animate-flicker motion-reduce:animate-none">
          ▮ {label}
        </p>
        <motion.h2
          style={reduceMotion ? undefined : { x }}
          className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight sm:text-7xl md:text-8xl"
        >
          <TextReveal text={title} stagger={0.03} />
          <span className="text-blood glow-red">.</span>
        </motion.h2>
        <p className="mt-5 max-w-md border-l-2 border-blood pl-3 text-xs leading-relaxed text-bone sm:text-sm">
          {sub}
        </p>
      </BlurReveal>
    </div>
  );
}
