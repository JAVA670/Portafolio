/**
 * Liquid-chrome ornaments generated in the hero camera's style (thorns,
 * biomech tendrils, mirror chrome), then cut out on transparency and
 * turned to neutral silver with scripts/prepare-ornaments.mjs
 * (`--mono --mix 0.35 --gamma 1.35`). Only the camera keeps its colour.
 * Dimensions are the processed files'. Change a file → change its name,
 * so image caches can't serve the old one.
 */
export const chrome = {
  /** Primary logotype — wide, most legible. */
  wordmark: {
    src: "/assets/chrome/wordmark-silver.png",
    mask: "/assets/chrome/wordmark-silver-mask.png",
    width: 2400,
    height: 589,
  },
  /** Taller lattice cut of the logotype — poster moments (footer). */
  wordmarkTall: {
    src: "/assets/chrome/wordmark-tall-silver.png",
    mask: "/assets/chrome/wordmark-tall-silver-mask.png",
    width: 2400,
    height: 946,
  },
  /** Symmetric thorn tendril — section and chapter breaks. */
  divider: { src: "/assets/chrome/divider-silver.png", width: 2400, height: 459 },
  /** Top-left thorn bracket — mirror it for the other corners. */
  corner: { src: "/assets/chrome/corner-silver.png", width: 900, height: 900 },
  /** Four-point thorn star. */
  sigil: { src: "/assets/chrome/sigil-silver.png", width: 512, height: 529 },
} as const;

export type ChromeAsset = (typeof chrome)[keyof typeof chrome];
