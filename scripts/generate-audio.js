/**
 * generate-audio.js
 * ------------------
 * Calls ElevenLabs TTS API to generate narration for each fact.
 * Rotates between 3 API keys based on day of month.
 * Outputs audio segments + timing JSON.
 *
 * Usage:
 *   node scripts/generate-audio.js
 *   node scripts/generate-audio.js --dry-run   (skip API calls)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ─── Config ──────────────────────────────────────────────────
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel — clear, natural English
const MODEL_ID = "eleven_monolingual_v1";
const OUTPUT_DIR = path.join(ROOT, "public", "audio");
const CONTENT_PATH = path.join(ROOT, "content", "daily.json");
const DRY_RUN = process.argv.includes("--dry-run");

// ─── API Key Rotation (3 keys, rotates by day of month) ─────
function getApiKey() {
  const keys = [
    process.env.ELEVENLABS_KEY_1,
    process.env.ELEVENLABS_KEY_2,
    process.env.ELEVENLABS_KEY_3,
  ].filter(Boolean);

  if (keys.length === 0) {
    throw new Error(
      "No ElevenLabs API keys found! Set ELEVENLABS_KEY_1, ELEVENLABS_KEY_2, ELEVENLABS_KEY_3 as environment variables."
    );
  }

  const dayOfMonth = new Date().getDate();
  const keyIndex = dayOfMonth % keys.length;
  console.log(
    `🔑 Using API key ${keyIndex + 1} of ${keys.length} (day ${dayOfMonth})`
  );
  return keys[keyIndex];
}

// ─── Build narration script from content ─────────────────────
function buildNarrationSegments(content) {
  const segments = [];

  // Hook
  segments.push({
    id: "hook",
    text: content.hook,
    type: "hook",
  });

  // Facts (with transition phrases)
  const transitions = [
    "Coming in at number",
    "At number",
    "Next up, number",
    "Number",
    "And the number one spot goes to...",
  ];

  content.facts.forEach((fact, i) => {
    const isLast = i === content.facts.length - 1;
    const transition = isLast
      ? transitions[transitions.length - 1]
      : `${transitions[i % (transitions.length - 1)]} ${fact.rank}.`;

    segments.push({
      id: `fact-${i}`,
      text: `${transition} ${fact.heading}. ${fact.text}`,
      type: "fact",
      rank: fact.rank,
    });
  });

  // Outro
  segments.push({
    id: "outro",
    text: content.outro.replace(/🔥|!/g, ""),
    type: "outro",
  });

  return segments;
}

// ─── Call ElevenLabs TTS API ─────────────────────────────────
async function generateSpeech(text, outputPath, apiKey) {
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
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8,
        style: 0.6,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `ElevenLabs API error ${response.status}: ${errorBody}`
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ✅ Saved: ${path.basename(outputPath)} (${buffer.length} bytes)`);
}

// ─── Get audio duration using ffprobe ────────────────────────
function getAudioDuration(filePath) {
  try {
    const result = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: "utf-8" }
    ).trim();
    return parseFloat(result);
  } catch {
    // Fallback: estimate from text length (~150 words/min narration)
    console.log(`  ⚠️  ffprobe not available, estimating duration`);
    return null;
  }
}

// ─── Estimate word-level timing ──────────────────────────────
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
  console.log("🎙️  Cricket Shorts — Audio Generator");
  console.log("━".repeat(45));

  // Load content
  const content = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf-8"));
  console.log(`📄 Loaded: ${content.title}`);
  console.log(`📊 Facts: ${content.facts.length}`);

  // Build segments
  const segments = buildNarrationSegments(content);
  console.log(`🎬 Segments: ${segments.length}\n`);

  // Ensure output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  if (DRY_RUN) {
    console.log("🏃 DRY RUN — Skipping API calls\n");
    segments.forEach((seg) => {
      console.log(`  [${seg.id}] "${seg.text.substring(0, 60)}..."`);
    });

    // Generate dummy timing
    const timing = {
      segments: segments.map((seg, i) => ({
        id: seg.id,
        type: seg.type,
        start: i * 5,
        end: (i + 1) * 5,
        duration: 5,
        text: seg.text,
        words: estimateWordTimings(seg.text, i * 5, 5),
      })),
      totalDuration: segments.length * 5,
    };
    fs.writeFileSync(
      path.join(OUTPUT_DIR, "timing.json"),
      JSON.stringify(timing, null, 2)
    );
    console.log("\n✅ Dry run complete! timing.json generated.");
    return;
  }

  // Get API key
  const apiKey = getApiKey();

  // Generate audio for each segment
  const timingData = [];
  let currentTime = 0;

  for (const seg of segments) {
    const outputPath = path.join(OUTPUT_DIR, `${seg.id}.mp3`);
    console.log(`🔊 Generating: ${seg.id}`);
    console.log(`   "${seg.text.substring(0, 80)}..."`);

    await generateSpeech(seg.text, outputPath, apiKey);

    // Get duration
    let duration = getAudioDuration(outputPath);
    if (!duration) {
      // Estimate: ~2.5 words per second for narration
      const wordCount = seg.text.split(/\s+/).length;
      duration = wordCount / 2.5;
    }

    timingData.push({
      id: seg.id,
      type: seg.type,
      start: currentTime,
      end: currentTime + duration,
      duration,
      text: seg.text,
      words: estimateWordTimings(seg.text, currentTime, duration),
    });

    currentTime += duration;
    console.log(`   ⏱️  Duration: ${duration.toFixed(2)}s\n`);
  }

  // Concatenate all segments into one audio file
  console.log("🔗 Concatenating audio segments...");
  const listFile = path.join(OUTPUT_DIR, "concat-list.txt");
  const concatEntries = timingData
    .map((seg) => `file '${seg.id}.mp3'`)
    .join("\n");
  fs.writeFileSync(listFile, concatEntries);

  try {
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${path.join(OUTPUT_DIR, "full-narration.mp3")}"`,
      { cwd: OUTPUT_DIR, stdio: "inherit" }
    );
    console.log("✅ Created full-narration.mp3");
  } catch {
    console.log("⚠️  ffmpeg concat failed — segments saved individually");
  }

  // Save timing data
  const timing = {
    segments: timingData,
    totalDuration: currentTime,
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "timing.json"),
    JSON.stringify(timing, null, 2)
  );

  console.log("\n" + "━".repeat(45));
  console.log(`✅ Audio generation complete!`);
  console.log(`   Total duration: ${currentTime.toFixed(2)}s`);
  console.log(`   Segments: ${timingData.length}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("❌ Audio generation failed:", err.message);
  process.exit(1);
});
