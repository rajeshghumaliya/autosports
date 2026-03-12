/**
 * render-video.js
 * ----------------
 * Full pipeline orchestrator:
 *  1. Generate audio (ElevenLabs TTS)
 *  2. Bundle Remotion project
 *  3. Render video
 *  4. Merge audio + video with ffmpeg
 *
 * Usage:
 *   node scripts/render-video.js
 *   node scripts/render-video.js --skip-audio   (skip TTS, use existing audio)
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ─── Config ──────────────────────────────────────────────────
const COMPOSITION_ID = "CricketShorts";
const OUTPUT_DIR = path.join(ROOT, "output");
const AUDIO_DIR = path.join(ROOT, "public", "audio");
const CONTENT_PATH = path.join(ROOT, "content", "daily.json");
const SKIP_AUDIO = process.argv.includes("--skip-audio");

// ─── Helpers ─────────────────────────────────────────────────
function run(cmd, label) {
  console.log(`\n${"━".repeat(50)}`);
  console.log(`📦 ${label}`);
  console.log(`${"━".repeat(50)}`);
  console.log(`$ ${cmd}\n`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function getDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Main Pipeline ───────────────────────────────────────────
async function main() {
  console.log("🏏 Cricket Shorts — Video Render Pipeline");
  console.log("═".repeat(50));

  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Load content for logging
  const content = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf-8"));
  console.log(`\n📄 Title: ${content.title}`);
  console.log(`📊 Facts: ${content.facts.length}`);
  console.log(`📅 Date: ${getDateStr()}`);

  // ─── Step 1: Generate Audio ──────────────────────────────
  if (!SKIP_AUDIO) {
    run("node scripts/generate-audio.js", "Step 1/4 — Generating Audio (ElevenLabs TTS)");
  } else {
    console.log("\n⏭️  Skipping audio generation (--skip-audio)");
  }

  // Check if audio timing exists
  const timingPath = path.join(AUDIO_DIR, "timing.json");
  let audioTimings = null;
  let hasAudio = false;

  if (fs.existsSync(timingPath)) {
    audioTimings = JSON.parse(fs.readFileSync(timingPath, "utf-8"));
    hasAudio = true;
    console.log(`\n🎙️  Audio timing loaded: ${audioTimings.totalDuration.toFixed(2)}s total`);
  } else {
    console.log("\n⚠️  No audio timing found — rendering video without audio");
  }

  // ─── Step 2: Calculate video duration ─────────────────────
  const FPS = 60;
  const SECONDS_PER_FACT = 5;
  const HOOK_SECONDS = 3;
  const OUTRO_SECONDS = 3;

  // If we have audio, use audio duration; otherwise use defaults
  let totalDurationSec;
  if (hasAudio) {
    totalDurationSec = Math.ceil(audioTimings.totalDuration) + 1; // +1s buffer
  } else {
    totalDurationSec = HOOK_SECONDS + content.facts.length * SECONDS_PER_FACT + OUTRO_SECONDS;
  }

  const totalFrames = totalDurationSec * FPS;
  console.log(`🎬 Video: ${totalDurationSec}s @ ${FPS}fps = ${totalFrames} frames`);

  // ─── Step 3: Render with Remotion ────────────────────────
  const videoOnlyPath = path.join(OUTPUT_DIR, "video-only.mp4");
  const inputPropsJson = JSON.stringify({
    content,
    fps: FPS,
    secondsPerFact: SECONDS_PER_FACT,
    hookSeconds: HOOK_SECONDS,
    outroSeconds: OUTRO_SECONDS,
    audioTimings,
  });

  // Write props to temp file to avoid shell escaping issues
  const propsPath = path.join(OUTPUT_DIR, "input-props.json");
  fs.writeFileSync(propsPath, inputPropsJson);

  run(
    `npx remotion render ${COMPOSITION_ID} "${videoOnlyPath}" --props="${propsPath}" --codec=h264 --image-format=jpeg --frames=0-${totalFrames - 1}`,
    "Step 2/4 — Rendering Video (Remotion)"
  );

  // ─── Step 4: Merge Audio + Video ─────────────────────────
  const finalOutputPath = path.join(
    OUTPUT_DIR,
    `cricket-shorts-${getDateStr()}.mp4`
  );

  const fullAudioPath = path.join(AUDIO_DIR, "full-narration.mp3");

  if (hasAudio && fs.existsSync(fullAudioPath)) {
    run(
      `ffmpeg -y -i "${videoOnlyPath}" -i "${fullAudioPath}" -c:v copy -c:a aac -b:a 192k -shortest "${finalOutputPath}"`,
      "Step 3/4 — Merging Audio + Video (ffmpeg)"
    );

    // Clean up video-only file
    fs.unlinkSync(videoOnlyPath);
  } else {
    // No audio — just rename
    fs.renameSync(videoOnlyPath, finalOutputPath);
  }

  // ─── Step 4: Summary ─────────────────────────────────────
  const stats = fs.statSync(finalOutputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log("\n" + "═".repeat(50));
  console.log("✅ RENDER COMPLETE!");
  console.log("═".repeat(50));
  console.log(`📁 Output: ${finalOutputPath}`);
  console.log(`📊 Size: ${sizeMB} MB`);
  console.log(`⏱️  Duration: ${totalDurationSec}s`);
  console.log(`🎬 Frames: ${totalFrames}`);
  console.log(`🔊 Audio: ${hasAudio ? "Yes" : "No"}`);
  console.log("═".repeat(50));
}

main().catch((err) => {
  console.error("\n❌ Render pipeline failed:", err.message);
  process.exit(1);
});
