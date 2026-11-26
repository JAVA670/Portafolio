/**
 * Turns raw uploads into web-ready media for Thrulenses Studio.
 *
 *   node scripts/import-media.mjs
 *
 * Photos: photos/<shoot>/<anything>.(jpg|jpeg|png|webp|tif|tiff)
 *   → public/media/<shoot>/<shoot>-NN.jpg — EXIF orientation applied, all
 *     metadata stripped (no GPS leaves the studio), 2800px on the long
 *     edge, mozjpeg q88 (client work — crisp on large screens). Numbering continues after files already there.
 *     Loose photos directly in photos/ are grouped by their file name
 *     without the counter and digits: "Birthday 15th (3).jpg" → birthday.
 *
 * Videos: videos/<name>.(mp4|mov|m4v)
 *   → public/media/videos/<slug>.mp4            full cut, H.264, web-optimised
 *     public/media/videos/<slug>-preview.mp4    8 s silent loop for autoplay
 *     public/media/videos/<slug>-poster.jpg     first frame of the loop
 *   Phone exports are often anamorphic (e.g. 1080x720 pixels shown as 9:16),
 *   so everything is scaled to square pixels at the true shape first.
 *
 * Raw uploads are deleted once processed. A manifest (path, size, display
 * ratio) is printed for lib/sessions.ts. Requires ffmpeg/ffprobe on PATH.
 */
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const PHOTO_IN = path.join(root, "photos");
const VIDEO_IN = path.join(root, "videos");
const MEDIA = path.join(root, "public/media");
const PHOTO_EXT = /\.(jpe?g|png|webp|tiff?)$/i;
const VIDEO_EXT = /\.(mp4|mov|m4v)$/i;

const slugify = (s) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "media";

const naturalSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

const manifest = [];

// ── Photos ─────────────────────────────────────────────────────────────
async function importShoot(shoot, files) {
  const outDir = path.join(MEDIA, shoot);
  await mkdir(outDir, { recursive: true });
  const existing = (await readdir(outDir)).filter((f) => f.startsWith(`${shoot}-`) && f.endsWith(".jpg"));
  let n = existing.length;
  for (const file of files.sort(naturalSort)) {
    n += 1;
    const name = `${shoot}-${String(n).padStart(2, "0")}.jpg`;
    const out = path.join(outDir, name);
    const info = await sharp(file)
      .rotate()
      .resize({ width: 2800, height: 2800, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(out);
    await rm(file);
    manifest.push({
      kind: "photo",
      shoot,
      src: `/media/${shoot}/${name}`,
      from: path.basename(file),
      width: info.width,
      height: info.height,
      ratio: Number((info.width / info.height).toFixed(4)),
      kb: Math.round(info.size / 1024),
    });
  }
}

/** "Birthday 15th (3).jpg" → "birthday"; "IMG_0042.jpg" → "img" → "misc". */
const shootFromFileName = (name) => {
  const words = slugify(name)
    .split("-")
    .filter((w) => w && !/\d/.test(w));
  const slug = words.join("-");
  return !slug || slug === "img" || slug === "dsc" || slug === "photo" ? "misc" : slug;
};

if (existsSync(PHOTO_IN)) {
  const loose = new Map();
  for (const entry of await readdir(PHOTO_IN, { withFileTypes: true })) {
    const full = path.join(PHOTO_IN, entry.name);
    if (entry.isDirectory()) {
      const files = (await readdir(full)).filter((f) => PHOTO_EXT.test(f)).map((f) => path.join(full, f));
      if (files.length) await importShoot(slugify(entry.name), files);
    } else if (PHOTO_EXT.test(entry.name)) {
      const shoot = shootFromFileName(entry.name);
      loose.set(shoot, [...(loose.get(shoot) ?? []), full]);
    }
  }
  for (const [shoot, files] of loose) await importShoot(shoot, files);
}

// ── Videos ─────────────────────────────────────────────────────────────
const SQUARE =
  "scale='trunc(if(lt(sar,1),iw,iw*sar)/2)*2':'trunc(if(lt(sar,1),ih/sar,ih)/2)*2',setsar=1";

const probe = (file) => {
  const [w, h, sar] = execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,sample_aspect_ratio", "-of", "csv=p=0", file,
  ])
    .toString()
    .trim()
    .split(",");
  const [sn, sd] = (sar && sar !== "N/A" && sar !== "0:1" ? sar : "1:1").split(":").map(Number);
  const duration = Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file])
      .toString()
      .trim()
  );
  return { ratio: (Number(w) * sn) / sd / Number(h), duration };
};

if (existsSync(VIDEO_IN)) {
  const outDir = path.join(MEDIA, "videos");
  await mkdir(outDir, { recursive: true });
  for (const name of (await readdir(VIDEO_IN)).filter((f) => VIDEO_EXT.test(f)).sort(naturalSort)) {
    const src = path.join(VIDEO_IN, name);
    const slug = slugify(name);
    const { ratio, duration } = probe(src);
    const vertical = ratio < 1;
    const full = path.join(outDir, `${slug}.mp4`);
    const preview = path.join(outDir, `${slug}-preview.mp4`);
    const poster = path.join(outDir, `${slug}-poster.jpg`);

    // Full cut: square pixels, ≤1920 on the long edge, streams from the start.
    execFileSync("ffmpeg", [
      "-v", "error", "-y", "-i", src,
      "-vf", `${SQUARE},scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'`,
      "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
      full,
    ]);
    // Silent autoplay loop from 20% in.
    const start = Math.max(0, Math.round(duration * 0.2 * 10) / 10);
    execFileSync("ffmpeg", [
      "-v", "error", "-y", "-ss", String(start), "-t", "8", "-i", src,
      "-an", "-vf", `${SQUARE},scale=${vertical ? 720 : 1280}:-2,setsar=1,fps=30`,
      "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      preview,
    ]);
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", preview, "-frames:v", "1", "-q:v", "3", poster]);
    await rm(src);
    const { size } = await stat(full);
    manifest.push({
      kind: "video",
      src: `/media/videos/${slug}.mp4`,
      preview: `/media/videos/${slug}-preview.mp4`,
      poster: `/media/videos/${slug}-poster.jpg`,
      from: name,
      ratio: Number(ratio.toFixed(4)),
      seconds: Math.round(duration),
      mb: Number((size / 1048576).toFixed(1)),
    });
  }
}

if (!manifest.length) console.log("Nothing to import — photos/ and videos/ are empty.");
for (const item of manifest) console.log(JSON.stringify(item));
