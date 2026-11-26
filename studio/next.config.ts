import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The studio lives inside the gallery's repo; pin the workspace root to
  // this folder so Turbopack never resolves against the parent project.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // 75 = UI default, 90 = photography (client work is the product).
    qualities: [75, 90],
  },
};

export default nextConfig;
