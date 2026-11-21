import type { ReactNode } from "react";

type LabelBlockProps = {
  children: ReactNode;
  variant?: "white" | "cobalt" | "ghost";
  as?: "span" | "p" | "div" | "li";
  className?: string;
};

/**
 * The signature poster element: uppercase type set inside a tight, stark
 * rectangle (padding 2px 8px, radius 0) — stacked asymmetrically like an
 * underground club flyer.
 */
export function LabelBlock({
  children,
  variant = "white",
  as: Tag = "span",
  className = "",
}: LabelBlockProps) {
  const variantClass =
    variant === "cobalt"
      ? "label-block label-block--cobalt"
      : variant === "ghost"
        ? "label-block label-block--ghost"
        : "label-block";
  return <Tag className={`${variantClass} ${className}`}>{children}</Tag>;
}
