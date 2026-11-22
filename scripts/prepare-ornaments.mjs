/**
 * Turn a chrome ornament rendered on black (Higgsfield / any renderer) into
 * a trimmed PNG with real transparency for the site.
 *
 *   node scripts/prepare-ornaments.mjs <input> <output.png> <width>
 *     [--gain 3] [--floor 8] [--pad 24] [--mono] [--mix 0.6] [--gamma 1]
 *
 * 1. Samples the corners (raw pixels — sharp's stats() ignores extract())
 *    and subtracts that background so it becomes true black.
 * 2. Builds alpha from brightness: alpha = min(1, (max(r,g,b) - floor) * gain).
 *    The floor drops the renderer's near-black haze, which would otherwise
 *    show as a faint box around the trimmed image on a dark page.
 *    gain 1 is a pure "unscreen" (glow stays additive and see-through);
 *    higher gain makes the chrome body solid so it reads over busy
 *    imagery, while the faint outer glow still fades out.
 * 3. Un-premultiplies the colour (rgb / alpha) so, over black, every
 *    pixel matches the render exactly.
 * 4. Trims to the visible content plus padding and resizes to <width>.
 *
 * --mono turns any coloured reflections into neutral silver chrome:
 * grey = mix * luminance + (1 - mix) * max(r,g,b), then a gamma curve
 * (gamma < 1 brightens the metal, > 1 deepens it). Done before step 2,
 * so the alpha follows the grey metal, not the original colours.
 */
import sharp from "sharp";

const [input, output, widthArg, ...rest] = process.argv.slice(2);
if (!input || !output || !widthArg) {
  console.error("usage: node scripts/prepare-ornaments.mjs <input> <output.png> <width> [--gain 3] [--floor 8] [--pad 24]");
  process.exit(1);
}
const opt = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? Number(rest[i + 1]) : fallback;
};
const width = Number(widthArg);
const gain = opt("gain", 3);
const pad = opt("pad", 24);
const floor = opt("floor", 8);
const mono = rest.includes("--mono");
const mix = opt("mix", 0.6);
const gamma = opt("gamma", 1);

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;

// Background: median of the four 24px corner patches.
const samples = [];
const patch = 24;
for (const [x0, y0] of [[0, 0], [w - patch, 0], [0, h - patch], [w - patch, h - patch]]) {
  for (let y = y0; y < y0 + patch; y++) {
    for (let x = x0; x < x0 + patch; x++) {
      const i = (y * w + x) * 3;
      samples.push([data[i], data[i + 1], data[i + 2]]);
    }
  }
}
const median = (c) => samples.map((s) => s[c]).sort((a, b) => a - b)[samples.length >> 1];
const bg = [median(0), median(1), median(2)];

const out = Buffer.alloc(w * h * 4);
let minX = w, minY = h, maxX = -1, maxY = -1;
for (let p = 0; p < w * h; p++) {
  let r = Math.max(0, data[p * 3] - bg[0]);
  let g = Math.max(0, data[p * 3 + 1] - bg[1]);
  let b = Math.max(0, data[p * 3 + 2] - bg[2]);
  if (mono) {
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const grey = 255 * Math.pow((mix * lum + (1 - mix) * Math.max(r, g, b)) / 255, gamma);
    r = g = b = grey;
  }
  const peak = Math.max(r, g, b);
  const a = Math.min(255, Math.max(0, Math.round((peak - floor) * gain)));
  if (a > 0) {
    // Composited over black this reproduces the original pixel exactly
    // (rgb_out * a = rgb_in); over brighter backgrounds the body stays solid.
    out[p * 4] = Math.min(255, Math.round((r * 255) / a));
    out[p * 4 + 1] = Math.min(255, Math.round((g * 255) / a));
    out[p * 4 + 2] = Math.min(255, Math.round((b * 255) / a));
    out[p * 4 + 3] = a;
    if (a > 10) {
      const x = p % w, y = (p / w) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const left = Math.max(0, minX - pad);
const top = Math.max(0, minY - pad);
const cropW = Math.min(w, maxX + pad + 1) - left;
const cropH = Math.min(h, maxY + pad + 1) - top;

await sharp(out, { raw: { width: w, height: h, channels: 4 } })
  .extract({ left, top, width: cropW, height: cropH })
  .resize({ width, withoutEnlargement: true })
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(output);

const meta = await sharp(output).metadata();
console.log(`${output}: ${meta.width}x${meta.height} (bg ${bg.join(",")}, gain ${gain})`);
