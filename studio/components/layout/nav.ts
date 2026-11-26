"use client";

import { usePathname } from "next/navigation";

export const NAV = [
  { id: "work", key: "work" },
  { id: "services", key: "services" },
  { id: "process", key: "process" },
  { id: "contact", key: "contact" },
] as const;

/** In-page anchors on the home page (Lenis glides to them), "/#id" elsewhere. */
export function useAnchor() {
  const pathname = usePathname();
  return (id: string) => (pathname === "/" ? `#${id}` : `/#${id}`);
}
