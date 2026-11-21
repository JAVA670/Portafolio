/**
 * Builds the lightweight, silent loop clips the FILMS grid autoplays while
 * scrolling, plus a poster taken from each clip's first frame (so the swap
 * from poster to video is seamless). The full-length files stay untouched
 * and only load when someone opens a film with sound.
 *
 *   node scripts/make-previews.mjs            # every film in the folder
 *   node scripts/make-previews.mjs mija lilith
 *
 * Films not listed in CUTS get 8 seconds starting 20% of the way in.
 *
 * Requires ffmpeg on PATH.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public/assets/videos/aftermovies");

/** slug → [start seconds, length seconds, width] — segments picked by eye. */
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
  lilith: [3, 8, 720],
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
  const out = path.join(DIR, `${slug}-preview.mp4`);
  const poster = path.join(DIR, `${slug}-preview.jpg`);
  const scale = `scale=${width}:-2,setsar=1`;

  execFileSync("ffmpeg", [
    "-v", "error", "-y",
    "-ss", String(start), "-t", String(length), "-i", src,
    "-an", "-vf", `${scale},fps=30`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "28",
    "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    out,
  ]);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", out, "-frames:v", "1", "-q:v", "4", poster,
  ]);
  console.log(`✓ ${slug}`);
}
