/**
 * Prepare a camera render for the hero / booking slots.
 *
 *   node scripts/prepare-hero-render.mjs <input> <output.png> [--bg r,g,b]
 *
 * Renders often come back on a flat, slightly lifted background (the
 * supplied ones sit on #212132), which shows as a visible box on the
 * #050507 page. This script:
 *   1. samples the corners to find the background colour (or takes --bg),
 *   2. remaps each channel so that background becomes true black while the
 *      highlights keep their full range: out = (in - bg) * 255 / (255 - bg),
 *   3. "unscreens" the result into a PNG with alpha (alpha = max(r,g,b),
 *      colour = rgb / alpha), so the render composites cleanly over any
 *      background — glow edges stay translucent instead of muddy.
 *
 * Dropping in a new render later: run this on it, or simply place a PNG
 * with a black or transparent background at the same path — the hero also
 * uses mix-blend-mode: lighten as a safety net.
 */
import sharp from "sharp";

const [input, output, ...rest] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/prepare-hero-render.mjs <input> <output.png> [--bg r,g,b]");
  process.exit(1);
}

/**
 * Median colour of the four corner patches, read from raw pixels.
 * (Note: sharp's stats() reports whole-image statistics even after
 * extract(), so it must not be used for region sampling.)
 */
async function sampleBackground(file) {
  const meta = await sharp(file).metadata();
  const size = 24;
  const corners = [
    [0, 0],
    [meta.width - size, 0],
    [0, meta.height - size],
    [meta.width - size, meta.height - size],
  ];
  const values = [[], [], []];
  for (const [left, top] of corners) {
    const buf = await sharp(file)
      .extract({ left, top, width: size, height: size })
      .removeAlpha()
      .raw()
      .toBuffer();
    for (let i = 0; i < buf.length; i += 3) {
      for (let c = 0; c < 3; c++) values[c].push(buf[i + c]);
    }
  }
  return values.map((v) => {
    v.sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  });
}

const bgFlag = rest.indexOf("--bg");
const bg = bgFlag >= 0 ? rest[bgFlag + 1].split(",").map(Number) : await sampleBackground(input);

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(info.width * info.height * 4);

for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
  const r = Math.max(0, ((data[i] - bg[0]) * 255) / (255 - bg[0]));
  const g = Math.max(0, ((data[i + 1] - bg[1]) * 255) / (255 - bg[1]));
  const b = Math.max(0, ((data[i + 2] - bg[2]) * 255) / (255 - bg[2]));
  const a = Math.max(r, g, b);
  if (a < 1) {
    out[o + 3] = 0;
    continue;
  }
  out[o] = Math.min(255, Math.round((r / a) * 255));
  out[o + 1] = Math.min(255, Math.round((g / a) * 255));
  out[o + 2] = Math.min(255, Math.round((b / a) * 255));
  out[o + 3] = Math.round(a);
}

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(output);

const { size } = await import("node:fs").then((fs) => fs.statSync(output));
console.log(
  JSON.stringify({ input, output, bg, width: info.width, height: info.height, kb: Math.round(size / 1024) })
);
