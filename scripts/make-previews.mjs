/**
 * Builds the lightweight, silent loop clips the FILMS grid autoplays while
 * scrolling, plus a poster taken from each clip's first frame (so the swap
 * from poster to video is seamless), and refreshes each film's theater
 * poster. The full-length files stay untouched and only load when someone
 * opens a film with sound.
 *
 *   node scripts/make-previews.mjs            # every film in the folder
 *   node scripts/make-previews.mjs mija lilith
 *
 * Films not listed in CUTS get 8 seconds starting 20% of the way in.
 *
 * Phone exports are often stored anamorphically (e.g. 1080x720 pixels with
 * a 3:8 pixel aspect = a 9:16 vertical video). Everything here is scaled
 * to square pixels at the true display shape first, so nothing stretches.
 * It prints each film's display ratio — keep lib/mockData.ts in sync.
 *
 * Requires ffmpeg/ffprobe on PATH.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public/assets/videos/aftermovies");

/**
 * slug → [start seconds, length seconds, width] — segments picked by eye.
 * Width applies to landscape films; vertical ones are encoded 720 wide.
 */
const CUTS = {
  "thrulenses-reel": [0, 16, 1280],
  "halloween-2026": [33.5, 8, 960],
  "aerotechno-fest": [2, 8, 960],
  "urban-fest-2025": [15.5, 8, 960],
  "fiesta-del-diablo": [9, 8, 960],
  "genesis-aftermovie": [5, 8, 960],
  mija: [1, 8, 960],
  "maluna-fest": [9, 8, 960],
  psicoddelic: [15, 8, 960],
  lilith: [6.5, 8, 720],
};

/** Square the pixels at the true display shape, never losing resolution. */
const SQUARE =
  "scale='trunc(if(lt(sar,1),iw,iw*sar)/2)*2':'trunc(if(lt(sar,1),ih/sar,ih)/2)*2',setsar=1";

/** Display aspect ratio (w/h) including the pixel aspect ratio. */
const displayRatio = (file) => {
  const [w, h, sar] = execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,sample_aspect_ratio", "-of", "csv=p=0", file,
  ])
    .toString()
    .trim()
    .split(",");
  const [n, d] = (sar && sar !== "N/A" && sar !== "0:1" ? sar : "1:1").split(":").map(Number);
  return (Number(w) * n) / d / Number(h);
};

const duration = (file) =>
  Number(
    execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file,
    ]).toString()
  );

const only = process.argv.slice(2);
const slugs = readdirSync(DIR)
  .filter((f) => f.endsWith(".mp4") && !f.endsWith("-preview.mp4"))
  .map((f) => f.replace(/\.mp4$/, ""));

for (const slug of slugs) {
  if (only.length && !only.includes(slug)) continue;
  const src = path.join(DIR, `${slug}.mp4`);
  if (!existsSync(src)) continue;
  const [start, length, width] = CUTS[slug] ?? [
    Math.round(duration(src) * 0.2 * 10) / 10,
    8,
    960,
  ];
  const ratio = displayRatio(src);
  const vertical = ratio < 1;
  const out = path.join(DIR, `${slug}-preview.mp4`);
  const still = path.join(DIR, `${slug}-preview.jpg`);
  const poster = path.join(DIR, `${slug}-poster.jpg`);
  const scale = `${SQUARE},scale=${vertical ? 720 : width}:-2,setsar=1`;

  execFileSync("ffmpeg", [
    "-v", "error", "-y",
    "-ss", String(start), "-t", String(length), "-i", src,
    "-an", "-vf", `${scale},fps=30`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "28",
    "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    out,
  ]);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", out, "-frames:v", "1", "-q:v", "4", still,
  ]);
  // Theater poster: frame at 2s, square pixels, capped for weight.
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-ss", "2", "-i", src, "-frames:v", "1",
    "-vf", `${SQUARE},scale='min(${vertical ? 720 : 1280},iw)':-2`, "-q:v", "4", poster,
  ]);
  console.log(`✓ ${slug}  display ratio ${ratio.toFixed(4)}${vertical ? " (vertical)" : ""}`);
}
