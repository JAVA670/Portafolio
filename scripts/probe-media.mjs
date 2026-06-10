import { readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";
import ffprobe from "ffprobe-static";

const PHOTO_DIR = "public/assets/photography";
const VIDEO_DIR = "public/assets/videos/aftermovies";

for (const file of (await readdir(PHOTO_DIR)).sort()) {
  if (!/\.jpe?g$/i.test(file) || /^photo-\d\d/.test(file)) continue;
  const meta = await sharp(path.join(PHOTO_DIR, file)).metadata();
  // EXIF orientations 5-8 swap the displayed axes
  const swapped = (meta.orientation ?? 1) >= 5;
  const w = swapped ? meta.height : meta.width;
  const h = swapped ? meta.width : meta.height;
  console.log(`PHOTO\t${file}\t${w}x${h}\t${w >= h ? "H" : "V"}`);
}

for (const file of (await readdir(VIDEO_DIR)).sort()) {
  if (!/\.mp4$/i.test(file)) continue;
  const out = execFileSync(ffprobe.path, [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height:stream_side_data=rotation",
    "-of", "csv=p=0",
    path.join(VIDEO_DIR, file),
  ]).toString().trim();
  console.log(`VIDEO\t${file}\t${out}`);
}
