"use client";

import { useSyncExternalStore } from "react";

/** Session type pre-selected in the contact form (set by "Book this" links). */
export type InquiryType = "celebration" | "event" | "portrait" | "other";

let current: InquiryType = "celebration";
const listeners = new Set<() => void>();

export function setInquiryType(type: InquiryType) {
  current = type;
  listeners.forEach((l) => l());
}

export function useInquiryType() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => "celebration" as InquiryType
  );
}
