import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first: roughly half the bytes of WebP for dark, grainy concert frames.
    formats: ["image/avif", "image/webp"],
    // 75 = UI default, 85 = photography and the hero render.
    qualities: [75, 85],
  },
};

export default nextConfig;
