/**
 * Import raw uploads into the site's media folders.
 *
 *   node scripts/import-media.mjs <file> [<file> ...]
 *
 * Photos (.jpg/.jpeg/.png/.webp): EXIF-rotate, resize to a 2000px long
 * edge, re-encode as mozjpeg q78 into public/assets/photography/, then
 * delete the raw file. Slugs: "Thrulenses670-121.jpg" → "tl670-121.jpg",
 * "Thrulenses-055.jpg" → "tl-055.jpg", anything else → lowercased kebab.
 *
 * Videos (.mp4/.mov): move to public/assets/videos/aftermovies/<slug>.mp4
 * and extract a poster frame at 2s.
 *
 * Prints a JSON manifest (slug, path, ratio, kb) for wiring into
 * lib/mockData.ts. Raw files are removed only after their output is
 * written successfully.
 */
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";

const PHOTO_DIR = "public/assets/photography";
const VIDEO_DIR = "public/assets/videos/aftermovies";

function slugFor(file) {
  const base = path.basename(file, path.extname(file));
  const m670 = base.match(/^thrulenses670-(\d+)$/i);
  if (m670) return `tl670-${m670[1]}`;
  const mTl = base.match(/^thrulenses-(\d+)$/i);
  if (mTl) return `tl-${mTl[1]}`;
  // "Thrulenses EDC (109)" → edc-109
  const mEvent = base.match(/^thrulenses\s+([a-z0-9]+)\s*\((\d+)\)$/i);
  if (mEvent) return `${mEvent[1].toLowerCase()}-${mEvent[2]}`;
  // "hOLYpRIEST, Thrulenses-177" → holypriest-177 (artist credit first)
  const mArtist = base.match(/^([a-z0-9 ]+),\s*thrulenses\d*-(\d+)$/i);
  if (mArtist) return `${mArtist[1].toLowerCase().replace(/[^a-z0-9]+/g, "")}-${mArtist[2]}`;
  return base
    .toLowerCase()
    .replace(/\(\d+\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function importPhoto(file) {
  const slug = slugFor(file);
  const out = path.join(PHOTO_DIR, `${slug}.jpg`);
  const image = sharp(file).rotate();
  const meta = await image.metadata();
  const swapped = (meta.orientation ?? 1) >= 5;
  const w = swapped ? meta.height : meta.width;
  const h = swapped ? meta.width : meta.height;
  const buf = await image
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  await mkdir(PHOTO_DIR, { recursive: true });
  await writeFile(out, buf);
  if (path.resolve(file) !== path.resolve(out)) await rm(file);
  return {
    kind: "photo",
    from: file,
    slug,
    path: out,
    ratio: Number((w / h).toFixed(4)),
    orientation: w >= h ? "H" : "V",
    kb: Math.round(buf.length / 1024),
  };
}

async function importVideo(file) {
  const slug = slugFor(file);
  const out = path.join(VIDEO_DIR, `${slug}.mp4`);
  const poster = path.join(VIDEO_DIR, `${slug}-poster.jpg`);
  await mkdir(VIDEO_DIR, { recursive: true });
  await rename(file, out);
  execFileSync(ffmpegPath, [
    "-y", "-v", "error",
    "-ss", "2", "-i", out,
    // Square pixels first: phone exports are often anamorphic (e.g. a
    // 9:16 vertical clip stored as 1080x720 with a 3:8 pixel aspect).
    "-frames:v", "1",
    "-vf", "scale='trunc(if(lt(sar,1),iw,iw*sar)/2)*2':'trunc(if(lt(sar,1),ih/sar,ih)/2)*2',setsar=1,scale='min(1280,iw)':-2",
    "-q:v", "4",
    poster,
  ]);
  const [rawW, rawH, sar] = execFileSync(ffprobe.path, [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,sample_aspect_ratio", "-of", "csv=p=0", out,
  ])
    .toString()
    .trim()
    .split(",");
  const [sn, sd] = (sar && sar !== "N/A" && sar !== "0:1" ? sar : "1:1").split(":").map(Number);
  // Display size (what viewers see), not the stored pixel grid.
  const w = Math.round((Number(rawW) * sn) / sd);
  const h = Number(rawH);
  const { size } = await stat(out);
  return {
    kind: "video",
    from: file,
    slug,
    path: out,
    poster,
    ratio: Number((w / h).toFixed(4)),
    width: w,
    height: h,
    mb: Number((size / 1048576).toFixed(1)),
  };
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: node scripts/import-media.mjs <file> [<file> ...]");
  process.exit(1);
}

const manifest = [];
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    manifest.push(await importPhoto(file));
  } else if ([".mp4", ".mov"].includes(ext)) {
    manifest.push(await importVideo(file));
  } else {
    console.error(`skipping unsupported file: ${file}`);
  }
}
console.log(JSON.stringify(manifest, null, 2));
