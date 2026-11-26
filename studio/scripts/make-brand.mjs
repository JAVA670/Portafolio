/**
 * Brand files for Thrulenses Studio, drawn from the same geometry as
 * components/brand/Logo.tsx (lens mark + THRU|LENSES | STUDIO).
 *
 *   node scripts/make-brand.mjs
 *
 * - app/icon.png             the lens mark, ink on bone (favicon / tab icon)
 * - app/apple-icon.png       the same, larger, for home-screen bookmarks
 * - app/opengraph-image.jpg  1200x630 share card: the lockup on night black
 *
 * The share card needs Jost for the wordmark; it is fetched once from
 * Google Fonts into the scratch folder below if missing.
 */
import sharp from "sharp";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const app = (f) => path.join(root, "app", f);
const INK = "#0b0b0c";
const BONE = "#f3f1ec";
const NIGHT = "#0a0a0b";

const lens = (color, stroke) => `
  <circle cx="12" cy="12" r="10.6" fill="none" stroke="${color}" stroke-width="${stroke}"/>
  <circle cx="12.9" cy="11.1" r="5" fill="none" stroke="${color}" stroke-width="${stroke}"/>`;

// ── Icons ──────────────────────────────────────────────────────────────
const icon = (size) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-3 -3 30 30">
    <rect x="-3" y="-3" width="30" height="30" fill="${BONE}"/>${lens(INK, 1.9)}</svg>`);
await sharp(icon(256)).png().toFile(app("icon.png"));
await sharp(icon(180)).png().toFile(app("apple-icon.png"));
console.log("✓ app/icon.png, app/apple-icon.png");

// ── Share card ─────────────────────────────────────────────────────────
const fontDir = path.join(root, ".brand-fonts");
await mkdir(fontDir, { recursive: true });
async function jost(weight) {
  const file = path.join(fontDir, `jost-${weight}.ttf`);
  if (!existsSync(file)) {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Jost:wght@${weight}`)).text();
    const url = css.match(/url\((https:[^)]+)\)/)?.[1];
    if (!url) throw new Error(`Could not resolve Jost ${weight}`);
    await writeFile(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  return (await readFile(file)).toString("base64");
}
const [j300, j400, j600] = await Promise.all([jost(300), jost(400), jost(600)]);

const W = 1200;
const H = 630;
const card = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    @font-face { font-family: J; font-weight: 300; src: url(data:font/ttf;base64,${j300}); }
    @font-face { font-family: J; font-weight: 400; src: url(data:font/ttf;base64,${j400}); }
    @font-face { font-family: J; font-weight: 600; src: url(data:font/ttf;base64,${j600}); }
    text { font-family: J; letter-spacing: 0.28em; fill: #ffffff; }
  </style>
  <rect width="100%" height="100%" fill="${NIGHT}"/>
  <g transform="translate(${W / 2 - 36} 150) scale(3)">${lens("#ffffff", 0.9)}</g>
  <text x="${W / 2 + 14}" y="345" text-anchor="middle" font-size="76">
    <tspan font-weight="600">THRU</tspan><tspan font-weight="300" dx="21">LENSES</tspan>
  </text>
  <line x1="${W / 2 - 280}" y1="410" x2="${W / 2 - 110}" y2="410" stroke="rgba(255,255,255,0.3)"/>
  <line x1="${W / 2 + 110}" y1="410" x2="${W / 2 + 280}" y2="410" stroke="rgba(255,255,255,0.3)"/>
  <text x="${W / 2 + 10}" y="420" text-anchor="middle" font-size="26" font-weight="400" style="letter-spacing:0.5em; fill: rgba(255,255,255,0.75)">STUDIO</text>
</svg>`);
await sharp(card).jpeg({ quality: 90, mozjpeg: true }).toFile(app("opengraph-image.jpg"));
console.log("✓ app/opengraph-image.jpg");
