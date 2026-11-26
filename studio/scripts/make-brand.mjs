/**
 * Derives the studio's brand files from the silver chrome logo
 * (public/brand/wordmark-silver.png — same artwork as the concert gallery).
 *
 *   node scripts/make-brand.mjs
 *
 * - wordmark-ink.png: the same spiky lettering as solid ink for light
 *   pages. Chrome glow would read as grey haze on white, so the shape is
 *   rebuilt from the metal's brightness (floor + gain) and filled with ink.
 * - og.jpg: 1200x630 share image — chrome logo + STUDIO on night black.
 * - app/icon.png: the chrome sigil as the favicon.
 */
import sharp from "sharp";
import { copyFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const brand = (f) => path.join(root, "public/brand", f);
const INK = [11, 11, 12];

// ── Ink wordmark ───────────────────────────────────────────────────────
{
  const { data, info } = await sharp(brand("wordmark-silver.png"))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  const floor = 40;
  const gain = 3.5;
  for (let p = 0; p < info.width * info.height; p++) {
    const a = data[p * 4 + 3] / 255;
    // Brightness the metal shows over black.
    const lum = Math.max(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]) * a;
    const alpha = Math.max(0, Math.min(255, Math.round((lum - floor) * gain)));
    out[p * 4] = INK[0];
    out[p * 4 + 1] = INK[1];
    out[p * 4 + 2] = INK[2];
    out[p * 4 + 3] = alpha;
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(brand("wordmark-ink.png"));
  console.log("✓ wordmark-ink.png", info.width, info.height);
}

// ── Share image ────────────────────────────────────────────────────────
{
  const W = 1200;
  const H = 630;
  const logo = await sharp(brand("wordmark-silver.png")).resize({ width: 920 }).toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const label = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="80">
      <text x="50%" y="50" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="30" letter-spacing="18" fill="#c9cdd3">STUDIO</text>
      <line x1="${W / 2 - 230}" y1="40" x2="${W / 2 - 130}" y2="40" stroke="#5a5e66" stroke-width="1"/>
      <line x1="${W / 2 + 130}" y1="40" x2="${W / 2 + 230}" y2="40" stroke="#5a5e66" stroke-width="1"/>
    </svg>`
  );
  const top = Math.round((H - logoMeta.height - 90) / 2);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#0a0a0b" } })
    .composite([
      { input: logo, top, left: Math.round((W - logoMeta.width) / 2) },
      { input: label, top: top + logoMeta.height + 4, left: 0 },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(brand("og.jpg"));
  console.log("✓ og.jpg");
}

// ── Favicon ────────────────────────────────────────────────────────────
await sharp(brand("sigil-silver.png"))
  .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(root, "app/icon.png"));
await copyFile(brand("og.jpg"), path.join(root, "app/opengraph-image.jpg"));
console.log("✓ app/icon.png, app/opengraph-image.jpg");
