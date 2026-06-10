/**
 * One-time import pipeline for the uploaded media drop:
 *  - photos: EXIF-normalize, resize to 2000px long edge, recompress,
 *    rename to clean slugs, emit a manifest with real aspect ratios
 *  - videos: rename to URL-safe slugs, extract a poster frame via ffmpeg
 */
import { readdir, rename, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

const PHOTO_DIR = "public/assets/photography";
const VIDEO_DIR = "public/assets/videos/aftermovies";

// originalName → [slug, event, location]  (event mapping is provisional)
const photoMap = {
  "Thrulenses670-082.jpg": ["aero-01", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses670-103.jpg": ["aero-02", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses670-105.jpg": ["aero-03", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses670-106.jpg": ["aero-04", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses670-107.jpg": ["aero-05", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses670-111.jpg": ["aero-06", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses670-175.jpg": ["aero-07", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses670-185.jpg": ["aero-08", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses670-188.jpg": ["aero-09", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses670-201.jpg": ["aero-10", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses670-240.jpg": ["aero-11", "AEROTECHNO FESTIVAL", "Medellín"],
  "Thrulenses-12.jpg": ["diablo-01", "FIESTA DEL DIABLO", "Medellín"],
  "Thrulenses-14.jpg": ["diablo-02", "FIESTA DEL DIABLO", "Medellín"],
  "Thrulenses-27.jpg": ["diablo-03", "FIESTA DEL DIABLO", "Medellín"],
  "Thrulenses-105.jpg": ["diablo-04", "FIESTA DEL DIABLO", "Medellín"],
  "Thrulenses-135.jpg": ["diablo-05", "FIESTA DEL DIABLO", "Medellín"],
  "Thrulenses-366.jpg": ["diablo-06", "FIESTA DEL DIABLO", "Medellín"],
  "Thrulenses-368.jpg": ["diablo-07", "FIESTA DEL DIABLO", "Medellín"],
  "Thrulenses-387.jpg": ["diablo-08", "FIESTA DEL DIABLO", "Medellín"],
  "DSC08262.jpg": ["solar-01", "LA SOLAR", "Medellín"],
  "DSC08358.jpg": ["solar-02", "LA SOLAR", "Medellín"],
  "DSC08577-Enhanced-NR.jpg": ["solar-03", "LA SOLAR", "Medellín"],
  "DSC08661.jpg": ["solar-04", "LA SOLAR", "Medellín"],
  "DSC08754-Enhanced-NR.jpg": ["solar-05", "LA SOLAR", "Medellín"],
  "DSC03553-Enhanced-NR.jpg": ["hocus-01", "HOCUS POCUS", "Miami"],
  "DSC03764-Enhanced-NR-2.jpg": ["hocus-02", "HOCUS POCUS", "Miami"],
  "DSC04237-Enhanced-NR-2.jpg": ["hocus-03", "HOCUS POCUS", "Miami"],
  "DSC04514-Enhanced-NR-2.jpg": ["hocus-04", "HOCUS POCUS", "Miami"],
  "DONE (7).jpg": ["urban-01", "URBAN FEST", "Medellín"],
  "DONE (9).jpg": ["urban-02", "URBAN FEST", "Medellín"],
  "DONE (22).jpg": ["urban-03", "URBAN FEST", "Medellín"],
  "DONE (69).jpg": ["urban-04", "URBAN FEST", "Medellín"],
  "232 (25).jpg": ["genesis-01", "GENESIS", "Medellín"],
  "232 (113).jpg": ["genesis-02", "GENESIS", "Medellín"],
  "123-094.jpg": ["maluna-01", "MALUNA FEST", "Medellín"],
  "Untitled-17.jpg": ["club-01", "CLUB SESSION", "Medellín"],
};

const videoMap = {
  "Aerotechno Fes.mp4": ["aerotechno-fest", "AEROTECHNO FESTIVAL", "MEDELLÍN"],
  "Aftermovie Genesis(2).mp4": ["genesis-aftermovie", "GENESIS", "MEDELLÍN"],
  "Cero Kkk Maluna Fest(1).mp4": ["maluna-fest", "MALUNA FEST", "MEDELLÍN"],
  "Fiesta Del Diablo(2).mp4": ["fiesta-del-diablo", "FIESTA DEL DIABLO", "MEDELLÍN"],
  "Lilith.mp4": ["lilith", "LILITH", "MEDELLÍN"],
  "Mija Dj.mp4": ["mija", "MIJA", "LIVE SET"],
  "Thrulenses670-912.mp4": ["thrulenses-reel", "THROUGHLENSES670", "SHOWREEL"],
  "Urban Fest Medellin 2025.mp4": ["urban-fest-2025", "URBAN FEST", "MEDELLÍN 2025"],
};

const manifest = { photos: [], videos: [] };

for (const [original, [slug, event, location]] of Object.entries(photoMap)) {
  const src = path.join(PHOTO_DIR, original);
  const out = path.join(PHOTO_DIR, `${slug}.jpg`);
  const image = sharp(src).rotate();
  const meta = await image.metadata();
  const swapped = (meta.orientation ?? 1) >= 5;
  const w = swapped ? meta.height : meta.width;
  const h = swapped ? meta.width : meta.height;
  const buf = await image
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  await writeFile(out, buf);
  await rm(src);
  manifest.photos.push({
    slug,
    event,
    location,
    ratio: Number((w / h).toFixed(4)),
    kb: Math.round(buf.length / 1024),
  });
  console.log(`photo ${original} → ${slug}.jpg (${Math.round(buf.length / 1024)}KB)`);
}

// Drop the now-unused placeholder frames
for (const file of await readdir(PHOTO_DIR)) {
  if (/^photo-\d\d\.jpg$/.test(file)) await rm(path.join(PHOTO_DIR, file));
}
for (const dir of [VIDEO_DIR, "public/assets/videos/dj-sets"]) {
  for (const file of await readdir(dir)) {
    if (/-poster\.jpg$/.test(file) && /^(set|aftermovie)-\d\d/.test(file)) {
      await rm(path.join(dir, file));
    }
  }
}

for (const [original, [slug, title, sub]] of Object.entries(videoMap)) {
  const src = path.join(VIDEO_DIR, original);
  const out = path.join(VIDEO_DIR, `${slug}.mp4`);
  await rename(src, out);
  const poster = path.join(VIDEO_DIR, `${slug}-poster.jpg`);
  execFileSync(ffmpegPath, [
    "-y", "-v", "error",
    "-ss", "2", "-i", out,
    "-frames:v", "1", "-vf", "scale='min(1280,iw)':-2", "-q:v", "4",
    poster,
  ]);
  const probe = execFileSync(
    "node_modules/ffprobe-static/bin/linux/x64/ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", out]
  ).toString().trim();
  const [w, h] = probe.split(",").map(Number);
  manifest.videos.push({ slug, title, sub, ratio: Number((w / h).toFixed(4)) });
  console.log(`video ${original} → ${slug}.mp4 (${w}x${h})`);
}

await writeFile("/tmp/media-manifest.json", JSON.stringify(manifest, null, 2));
console.log("manifest → /tmp/media-manifest.json");
