"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * Next/Image wrapper that degrades gracefully while real assets are missing
 * from /public/assets — renders a technical "NO SIGNAL" frame instead of a
 * broken image, so the layout stays intact before media is dropped in.
 */
export function SmartImage({ alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-iron">
        <span className="tech-label">NO SIGNAL — {String(props.src)}</span>
      </div>
    );
  }

  return <Image {...props} alt={alt} onError={() => setFailed(true)} />;
}
