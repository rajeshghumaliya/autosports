/**
 * render-video.js
 * ----------------
 * Full pipeline orchestrator:
 *  1. Generate AI style (Gemini) → styled.json
 *  2. Generate audio (ElevenLabs TTS)
 *  3. Render video (Remotion)
 *  4. Merge audio + video (ffmpeg)
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const COMPOSITION_ID = "CricketShorts";
const OUTPUT_DIR = path.join(ROOT, "output");
const AUDIO_DIR = path.join(ROOT, "public", "audio");
const STYLED_PATH = path.join(ROOT, "content", "styled.json");
const DAILY_PATH = path.join(ROOT, "content", "daily.json");
const SKIP_AUDIO = process.argv.includes("--skip-audio");
const SKIP_STYLE = process.argv.includes("--skip-style");

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

async function main() {
  console.log("🏏 Cricket Shorts — Full Render Pipeline");
  console.log("═".repeat(50));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // ─── Step 1: Generate AI Style ─────────────────
  if (!SKIP_STYLE) {
    run("node scripts/generate-style.js", "Step 1/4 — AI Style Generation (Gemini)");
  } else {
    console.log("\n⏭ Skipping style generation (--skip-style)");
  }

  // ─── Step 2: Generate Audio ────────────────────
  if (!SKIP_AUDIO) {
    run("node scripts/generate-audio.js", "Step 2/4 — Generating Audio (ElevenLabs TTS)");
  } else {
    console.log("\n⏭ Skipping audio generation (--skip-audio)");
  }

  // Load content
  const contentPath = fs.existsSync(STYLED_PATH) ? STYLED_PATH : DAILY_PATH;
  const content = JSON.parse(fs.readFileSync(contentPath, "utf-8"));
  console.log(`\n📄 Title: ${content.title}`);
  console.log(`🎨 Theme: ${content.theme || "default"}`);
  console.log(`📊 Facts: ${content.facts.length}`);
  console.log(`📅 Date: ${getDateStr()}`);

  // Audio timing
  const timingPath = path.join(AUDIO_DIR, "timing.json");
  let audioTimings = null;
  let hasAudio = false;
  if (fs.existsSync(timingPath)) {
    audioTimings = JSON.parse(fs.readFileSync(timingPath, "utf-8"));
    hasAudio = true;
    console.log(`🎙 Audio: ${audioTimings.totalDuration.toFixed(2)}s`);
  } else {
    console.log("⚠ No audio — rendering silent video");
  }

  // ─── Step 3: Render ────────────────────────────
  const FPS = 60;
  const SECONDS_PER_FACT = 5;
  const HOOK_SECONDS = 3;
  const OUTRO_SECONDS = 3;

  let totalDurationSec;
  if (hasAudio) {
    totalDurationSec = Math.ceil(audioTimings.totalDuration) + 1;
  } else {
    totalDurationSec = HOOK_SECONDS + content.facts.length * SECONDS_PER_FACT + OUTRO_SECONDS;
  }

  const totalFrames = totalDurationSec * FPS;
  console.log(`🎬 ${totalDurationSec}s @ ${FPS}fps = ${totalFrames} frames`);

  const videoOnlyPath = path.join(OUTPUT_DIR, "video-only.mp4");
  const propsPath = path.join(OUTPUT_DIR, "input-props.json");
  fs.writeFileSync(propsPath, JSON.stringify({
    content, fps: FPS,
    secondsPerFact: SECONDS_PER_FACT,
    hookSeconds: HOOK_SECONDS,
    outroSeconds: OUTRO_SECONDS,
    audioTimings,
  }));

  run(
    `npx remotion render ${COMPOSITION_ID} "${videoOnlyPath}" --props="${propsPath}" --codec=h264 --image-format=jpeg --frames=0-${totalFrames - 1}`,
    "Step 3/4 — Rendering Video (Remotion 60fps)"
  );

  // ─── Step 4: Merge ─────────────────────────────
  const finalPath = path.join(OUTPUT_DIR, `cricket-shorts-${getDateStr()}.mp4`);
  const audioFile = path.join(AUDIO_DIR, "full-narration.mp3");

  if (hasAudio && fs.existsSync(audioFile)) {
    run(
      `ffmpeg -y -i "${videoOnlyPath}" -i "${audioFile}" -c:v copy -c:a aac -b:a 192k -shortest "${finalPath}"`,
      "Step 4/4 — Merging Audio + Video"
    );
    fs.unlinkSync(videoOnlyPath);
  } else {
    fs.renameSync(videoOnlyPath, finalPath);
  }

  const sizeMB = (fs.statSync(finalPath).size / (1024 * 1024)).toFixed(2);

  console.log("\n" + "═".repeat(50));
  console.log("✅ RENDER COMPLETE!");
  console.log("═".repeat(50));
  console.log(`📁 ${finalPath}`);
  console.log(`📊 ${sizeMB} MB | ${totalDurationSec}s | ${totalFrames} frames | ${FPS}fps`);
  console.log(`🎨 Theme: ${content.theme || "default"}`);
  console.log(`🔊 Audio: ${hasAudio ? "Yes" : "No"}`);
  console.log("═".repeat(50));
}

main().catch((err) => {
  console.error("\n❌ Pipeline failed:", err.message);
  process.exit(1);
});
