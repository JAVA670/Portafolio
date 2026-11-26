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
