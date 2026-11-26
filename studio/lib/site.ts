/** Brand + contact details for Thrulenses Studio. */
export const site = {
  name: "Thrulenses Studio",
  email: "Thrulenses670@gmail.com",
  phone: "239-777-1732",
  phoneHref: "tel:+12397771732",
  instagram: "thrulenses670",
  instagramUrl: "https://www.instagram.com/thrulenses670/",
  /** The concert & festival archive (separate site). */
  galleryUrl: process.env.NEXT_PUBLIC_GALLERY_URL ?? "https://thrulenses670.netlify.app",
} as const;

/** Logo files (same chrome artwork as the concert gallery). */
export const brand = {
  chrome: { src: "/brand/wordmark-silver.png", mask: "/brand/wordmark-silver-mask.png", width: 2400, height: 589 },
  chromeTall: { src: "/brand/wordmark-tall-silver.png", width: 2400, height: 946 },
  ink: { src: "/brand/wordmark-ink.png", width: 2400, height: 589 },
  sigil: { src: "/brand/sigil-silver.png", width: 512, height: 529 },
} as const;
