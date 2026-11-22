/**
 * Liquid-chrome ornaments generated in the hero camera's style (thorns,
 * biomech tendrils, mirror chrome) and cut out on transparency with
 * scripts/prepare-ornaments.mjs. Dimensions are the processed files'.
 */
export const chrome = {
  /** Primary logotype — wide, most legible. */
  wordmark: { src: "/assets/chrome/wordmark.png", mask: "/assets/chrome/wordmark-mask.png", width: 2400, height: 589 },
  /** Taller lattice cut of the logotype — poster moments (footer). */
  wordmarkTall: {
    src: "/assets/chrome/wordmark-tall.png",
    mask: "/assets/chrome/wordmark-tall-mask.png",
    width: 2400,
    height: 949,
  },
  /** Symmetric thorn tendril — section and chapter breaks. */
  divider: { src: "/assets/chrome/divider.png", width: 2400, height: 461 },
  /** Top-left thorn bracket — mirror it for the other corners. */
  corner: { src: "/assets/chrome/corner.png", width: 900, height: 900 },
  /** Four-point thorn star. */
  sigil: { src: "/assets/chrome/sigil.png", width: 512, height: 528 },
} as const;

export type ChromeAsset = (typeof chrome)[keyof typeof chrome];
