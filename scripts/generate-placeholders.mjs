/**
 * Generates dark industrial placeholder JPGs at the exact paths referenced in
 * lib/mockData.ts, so the site renders before real media is dropped in.
 * Overwrite the files in /public/assets with real shots — same names — and
 * they appear everywhere automatically.
 *
 * Run: node scripts/generate-placeholders.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..", "public", "assets");

function frameSvg(width, height, label, sub) {
  const cx = width / 2;
  const cy = height / 2;
  const fontSize = Math.round(Math.min(width, height) / 16);
  const subSize = Math.round(fontSize * 0.45);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#0c0a0a"/>
  <rect x="12" y="12" width="${width - 24}" height="${height - 24}" fill="none" stroke="#4a000e" stroke-width="2"/>
  <line x1="0" y1="0" x2="${width}" y2="${height}" stroke="#1c0006" stroke-width="2"/>
  <line x1="${width}" y1="0" x2="0" y2="${height}" stroke="#1c0006" stroke-width="2"/>
  <text x="${cx}" y="${cy - subSize}" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="${fontSize}" letter-spacing="6">${label}</text>
  <text x="${cx}" y="${cy + subSize * 1.6}" text-anchor="middle" fill="#e8002d" font-family="monospace" font-size="${subSize}" letter-spacing="4">${sub}</text>
  <text x="24" y="${height - 26}" fill="#7a3a44" font-family="monospace" font-size="${subSize}" letter-spacing="3">THROUGHLENSES670 / PLACEHOLDER</text>
</svg>`;
}

async function render(file, width, height, label) {
  const svg = frameSvg(width, height, label, `${width}×${height} — DROP MEDIA HERE`);
  const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 70 }).toBuffer();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, jpg);
  console.log("wrote", path.relative(process.cwd(), file));
}

const BASE = 1200;
const photoRatios = {
  "photo-01": 2 / 3, "photo-02": 3 / 2, "photo-03": 4 / 5, "photo-04": 16 / 9,
  "photo-05": 1, "photo-06": 2 / 3, "photo-07": 3 / 2, "photo-08": 4 / 5,
  "photo-09": 16 / 9, "photo-10": 2 / 3, "photo-11": 1, "photo-12": 3 / 2,
};

for (const [name, ratio] of Object.entries(photoRatios)) {
  const width = ratio >= 1 ? BASE : Math.round(BASE * ratio);
  const height = Math.round(width / ratio);
  await render(
    path.join(ROOT, "photography", `${name}.jpg`),
    width,
    height,
    name.toUpperCase()
  );
}

for (let i = 1; i <= 4; i++) {
  const n = String(i).padStart(2, "0");
  await render(
    path.join(ROOT, "videos", "dj-sets", `set-${n}-poster.jpg`),
    1280,
    720,
    `DJ SET ${n}`
  );
  await render(
    path.join(ROOT, "videos", "aftermovies", `aftermovie-${n}-poster.jpg`),
    720,
    1280,
    `REEL ${n}`
  );
}
