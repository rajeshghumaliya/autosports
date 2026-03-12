/**
 * generate-audio.js
 * ------------------
 * Calls ElevenLabs TTS API to generate narration for each fact.
 * Rotates between 3 API keys based on day of month.
 * Uses dynamic voice emotions from styled.json (AI-generated).
 * Outputs audio segments + timing JSON.
 *
 * Usage:
 *   node scripts/generate-audio.js
 *   node scripts/generate-audio.js --dry-run
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ─── Config ──────────────────────────────────────────────────
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_DIR = path.join(ROOT, "public", "audio");
const DRY_RUN = process.argv.includes("--dry-run");

// Try styled.json first (has AI voice emotions), fallback to daily.json
const STYLED_PATH = path.join(ROOT, "content", "styled.json");
const DAILY_PATH = path.join(ROOT, "content", "daily.json");
const CONTENT_PATH = fs.existsSync(STYLED_PATH) ? STYLED_PATH : DAILY_PATH;

// ─── API Key Rotation ────────────────────────────────────────
function getApiKey() {
  const keys = [
    process.env.ELEVENLABS_KEY_1,
    process.env.ELEVENLABS_KEY_2,
    process.env.ELEVENLABS_KEY_3,
  ].filter(Boolean);

  if (keys.length === 0) {
    throw new Error("No ElevenLabs API keys found!");
  }

  const dayOfMonth = new Date().getDate();
  const keyIndex = dayOfMonth % keys.length;
  console.log(`🔑 Using API key ${keyIndex + 1} of ${keys.length} (day ${dayOfMonth})`);
  return keys[keyIndex];
}

function stripEmojis(str) {
  if (!str) return "";
  // Strip emojis and other non-standard unicode characters
  return str
    .replace(/[\u1000-\uFFFF]+/g, '') // remove emojis/symbols
    .replace(/[^\x00-\x7F]/g, '')     // remove non-ascii
    .trim();
}

// ─── Build narration with dynamic transitions ────────────────
function buildNarrationSegments(content) {
  const segments = [];

  // Hook
  segments.push({
    id: "hook",
    text: stripEmojis(content.hook),
    type: "hook",
    voiceSettings: { stability: 0.25, similarity_boost: 0.85, style: 0.9, use_speaker_boost: true },
  });

  // Facts with AI transition phrases or defaults
  const defaultTransitions = [
    "Coming in at number",
    "At number",
    "Next up, number",
    "Number",
    "And the number one spot goes to...",
  ];

  const items = content.facts || content.segments || [];
  
  items.forEach((item, i) => {
    const isLast = i === items.length - 1;

    // Use AI-generated narration transition if available
    const transition = item.narrationTransition
      ? item.narrationTransition
      : isLast
        ? defaultTransitions[defaultTransitions.length - 1]
        : `${defaultTransitions[i % (defaultTransitions.length - 1)]} ${item.rank || items.length - i}.`;

    // Use AI voice emotions if available, otherwise defaults
    const voiceSettings = item.voiceEmotion && typeof item.voiceEmotion === "object"
      ? { ...item.voiceEmotion, use_speaker_boost: true }
      : isLast
        ? { stability: 0.2, similarity_boost: 0.9, style: 1.0, use_speaker_boost: true }
        : { stability: 0.4, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true };

    const headingPart = item.heading ? `${item.heading}. ` : "";
    segments.push({
      id: `fact-${i}`,
      text: stripEmojis(`${transition} ${headingPart}${item.text}`),
      type: "fact",
      rank: item.rank || items.length - i,
      voiceSettings,
    });
  });

  // Outro
  segments.push({
    id: "outro",
    text: stripEmojis(content.outro),
    type: "outro",
    voiceSettings: { stability: 0.35, similarity_boost: 0.8, style: 0.7, use_speaker_boost: true },
  });

  return segments;
}

// ─── Call ElevenLabs TTS with dynamic voice settings ─────────
async function generateSpeech(text, outputPath, apiKey, voiceSettings) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${errorBody}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ✅ Saved: ${path.basename(outputPath)} (${buffer.length} bytes)`);
}

// ─── Get audio duration ──────────────────────────────────────
function getAudioDuration(filePath) {
  try {
    const result = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: "utf-8" }
    ).trim();
    return parseFloat(result);
  } catch {
    console.log(`  ⚠ ffprobe unavailable, estimating duration`);
    return null;
  }
}

function estimateWordTimings(text, startTime, duration) {
  const words = text.split(/\s+/);
  const timePerWord = duration / words.length;
  return words.map((word, i) => ({
    word,
    start: startTime + i * timePerWord,
    end: startTime + (i + 1) * timePerWord,
  }));
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log("🎙 Cricket Shorts — Audio Generator");
  console.log("━".repeat(50));

  const content = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf-8"));
  const isStyled = CONTENT_PATH.includes("styled");
  const items = content.facts || content.segments || [];
  console.log(`📄 Source: ${isStyled ? "styled.json (AI-enriched)" : "daily.json (manual)"}`);
  console.log(`📄 Title: ${content.title}`);
  console.log(`📊 Items: ${items.length}`);

  const segments = buildNarrationSegments(content);
  console.log(`🎬 Segments: ${segments.length}\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  if (DRY_RUN) {
    console.log("🏃 DRY RUN — Skipping API calls\n");
    segments.forEach((seg) => {
      console.log(`  [${seg.id}] voice=${JSON.stringify(seg.voiceSettings)}`);
      console.log(`           "${seg.text.substring(0, 60)}..."\n`);
    });

    const timing = {
      segments: segments.map((seg, i) => ({
        id: seg.id, type: seg.type,
        start: i * 5, end: (i + 1) * 5, duration: 5,
        text: seg.text, words: estimateWordTimings(seg.text, i * 5, 5),
      })),
      totalDuration: segments.length * 5,
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, "timing.json"), JSON.stringify(timing, null, 2));
    console.log("✅ Dry run complete!");
    return;
  }

  const apiKey = getApiKey();
  const timingData = [];
  let currentTime = 0;

  for (const seg of segments) {
    const outputPath = path.join(OUTPUT_DIR, `${seg.id}.mp3`);
    console.log(`🔊 ${seg.id} [${seg.type}]`);
    console.log(`   Voice: stability=${seg.voiceSettings.stability} style=${seg.voiceSettings.style}`);
    console.log(`   "${seg.text.substring(0, 70)}..."`);

    await generateSpeech(seg.text, outputPath, apiKey, seg.voiceSettings);

    let duration = getAudioDuration(outputPath);
    if (!duration) {
      duration = seg.text.split(/\s+/).length / 2.5;
    }

    timingData.push({
      id: seg.id, type: seg.type,
      start: currentTime, end: currentTime + duration, duration,
      text: seg.text, words: estimateWordTimings(seg.text, currentTime, duration),
    });
    currentTime += duration;
    console.log(`   ⏱ ${duration.toFixed(2)}s\n`);
  }

  // Concatenate
  console.log("🔗 Concatenating segments...");
  const listFile = path.join(OUTPUT_DIR, "concat-list.txt");
  fs.writeFileSync(listFile, timingData.map((s) => `file '${s.id}.mp3'`).join("\n"));

  try {
    execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${path.join(OUTPUT_DIR, "full-narration.mp3")}"`, { cwd: OUTPUT_DIR, stdio: "inherit" });
    console.log("✅ Created full-narration.mp3");
  } catch {
    console.log("⚠ ffmpeg concat failed — segments saved individually");
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, "timing.json"), JSON.stringify({ segments: timingData, totalDuration: currentTime }, null, 2));

  console.log("\n" + "━".repeat(50));
  console.log(`✅ Audio complete! ${currentTime.toFixed(2)}s total, ${timingData.length} segments`);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
