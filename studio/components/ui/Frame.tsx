import Image from "next/image";
import type { Photo } from "@/lib/sessions";

/**
 * A photo filling its box — or, while a shoot's images are still being
 * edited, a quiet night frame carrying its label (never a fake image).
 */
export function Frame({
  photo,
  sizes,
  label,
  priority = false,
  quality = 90,
  className = "",
}: {
  photo?: Photo;
  sizes: string;
  label?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
}) {
  if (!photo) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-night-2 ${className}`}>
        <div className="absolute inset-3 border border-fog" aria-hidden />
        {label && <span className="eyebrow relative px-4 text-center text-white/60">{label}</span>}
      </div>
    );
  }
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      quality={quality}
      preload={priority}
      className={`object-cover ${className}`}
      style={{ objectPosition: photo.focus ?? "50% 50%" }}
    />
  );
}
