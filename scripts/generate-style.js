/**
 * generate-style.js
 * ------------------
 * Calls Gemini API to dynamically decide animation styles,
 * color themes, transitions, and voice emotions based on
 * the user-provided script in content/daily.json.
 *
 * Outputs: content/styled.json (enriched version of daily.json)
 *
 * Usage:
 *   node scripts/generate-style.js
 *   node scripts/generate-style.js --dry-run   (use random defaults)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const CONTENT_PATH = path.join(ROOT, "content", "daily.json");
const OUTPUT_PATH = path.join(ROOT, "content", "styled.json");
const DRY_RUN = process.argv.includes("--dry-run");

// ─── Available Variants ──────────────────────────────────────
const ANIMATIONS = ["slideLeft", "zoomIn", "flipIn", "fadeUp", "bounceIn", "spiralIn"];
const TRANSITIONS = ["wipe", "slash", "zoom", "dissolve", "flash", "glitch"];
const THEMES = {
  fire: {
    primary: "#FF6B35", secondary: "#FF0000", accent: "#FFD700",
    bg: "rgba(255,107,53,0.08)", glow: "rgba(255,107,53,0.6)",
  },
  neon: {
    primary: "#00F5FF", secondary: "#FF00FF", accent: "#39FF14",
    bg: "rgba(0,245,255,0.08)", glow: "rgba(0,245,255,0.6)",
  },
  ocean: {
    primary: "#0EA5E9", secondary: "#06B6D4", accent: "#22D3EE",
    bg: "rgba(14,165,233,0.08)", glow: "rgba(14,165,233,0.6)",
  },
  electric: {
    primary: "#A855F7", secondary: "#7C3AED", accent: "#E879F9",
    bg: "rgba(168,85,247,0.08)", glow: "rgba(168,85,247,0.6)",
  },
  royal: {
    primary: "#FFD700", secondary: "#FF8C00", accent: "#FFA500",
    bg: "rgba(255,215,0,0.08)", glow: "rgba(255,215,0,0.6)",
  },
  emerald: {
    primary: "#10B981", secondary: "#059669", accent: "#34D399",
    bg: "rgba(16,185,129,0.08)", glow: "rgba(16,185,129,0.6)",
  },
};

const VOICE_EMOTIONS = {
  hook: { stability: 0.25, similarity_boost: 0.85, style: 0.9 },
  dramatic: { stability: 0.2, similarity_boost: 0.9, style: 1.0 },
  excited: { stability: 0.3, similarity_boost: 0.8, style: 0.8 },
  casual: { stability: 0.5, similarity_boost: 0.75, style: 0.5 },
  intense: { stability: 0.15, similarity_boost: 0.9, style: 0.95 },
};

const ICONS = {
  "fire": "fire",
  "trophy": "trophy",
  "crown": "crown",
  "bolt": "bolt",
  "explosion": "explosion",
  "target": "target",
  "star": "star",
  "rocket": "rocket",
  "shield": "shield",
  "swords": "swords",
};

// ─── Gemini API ──────────────────────────────────────────────
async function callGemini(content) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set!");

const items = content.facts || content.segments || [];
  const contentString = items.map((f, i) => {
    if (f.heading) return `#${f.rank}: ${f.heading} - ${f.text}`;
    return `Segment ${i + 1}: ${f.text}`;
  }).join("\n");

  const prompt = `You are a creative director for viral YouTube Shorts cricket videos. Based on this content, decide the visual style for each section. Return ONLY valid JSON with no markdown.

CONTENT:
Title: ${content.title}
Hook: ${content.hook}
Content items: ${contentString}

Available options:
- animations: ${ANIMATIONS.join(", ")}
- transitions: ${TRANSITIONS.join(", ")}
- themes: ${Object.keys(THEMES).join(", ")}
- icons (premium SVG): ${Object.keys(ICONS).join(", ")}
- voiceEmotions: hook, dramatic, excited, casual, intense

Return this JSON structure:
{
  "theme": "pick ONE theme for the whole video",
  "hookAnimation": "pick animation for hook",
  "hookIcon": "pick icon for hook",
  "facts": [
    {
      "heading": "write a 2-3 word punchy heading summarizing the text",
      "highlight": "write 1-3 words to display HUGE on screen (e.g. '100 MPH', 'THE KING', 'REVENGE')",
      "animation": "pick DIFFERENT animation for each item",
      "transition": "pick DIFFERENT transition for each item",
      "icon": "pick MOST FITTING premium icon",
      "voiceEmotion": "pick emotion based on text content"
    }
  ],
  "outroAnimation": "pick animation for outro",
  "narrationTransitions": [
    "write a unique 5-8 word dramatic transition phrase for each item, like 'But wait, this next one is insane...' or 'You won't believe number three...'"
  ]
}

Rules:
- NEVER use the same animation twice in a row
- NEVER use the same transition twice in a row
- Make #1 or last item always "dramatic" voiceEmotion
- Make hook always "hook" voiceEmotion
- Each icon must match the content (use "crown" for records, "bolt" for speed, etc.)
- Make narration transitions viral and binge-worthy`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  try {
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code block
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[1] || match[0]);
    throw new Error("Failed to parse Gemini response as JSON");
  }
}

// ─── Random fallback (for dry-run or API failure) ────────────
function generateRandomStyle(content) {
  const shuffled = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const anims = shuffled(ANIMATIONS);
  const trans = shuffled(TRANSITIONS);
  const themeKeys = Object.keys(THEMES);
  const iconKeys = Object.keys(ICONS);
  const emotionKeys = Object.keys(VOICE_EMOTIONS);

  const transitions = [
    "But wait, this next one is insane...",
    "You won't believe what's coming next!",
    "Hold on, this gets even crazier...",
    "And at the top spot...",
    "The number one will blow your mind!"
  ];

  const items = content.facts || content.segments || [];
  return {
    theme: themeKeys[Math.floor(Math.random() * themeKeys.length)],
    hookAnimation: anims[0],
    hookIcon: "fire",
    facts: items.map((_, i) => ({
      heading: `Part ${i + 1}`,
      highlight: `WOW`,
      animation: anims[(i + 1) % anims.length],
      transition: trans[i % trans.length],
      icon: iconKeys[i % iconKeys.length],
      voiceEmotion: i === items.length - 1 ? "dramatic" : emotionKeys[(i + 2) % emotionKeys.length],
    })),
    outroAnimation: anims[anims.length - 1],
    narrationTransitions: items.map((_, i) => transitions[i % transitions.length]),
  };
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log("🎨 Cricket Shorts — Dynamic Style Generator");
  console.log("━".repeat(50));

  const content = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf-8"));
  console.log(`📄 Title: ${content.title}`);
  const items = content.facts || content.segments || [];
  console.log(`📊 Items: ${items.length}\n`);

  let styleDirectives;

  if (DRY_RUN || !process.env.GEMINI_API_KEY) {
    console.log("🎲 Using random style (dry-run or no API key)\n");
    styleDirectives = generateRandomStyle(content);
  } else {
    console.log("🤖 Calling Gemini for style decisions...\n");
    try {
      styleDirectives = await callGemini(content);
      console.log("✅ Gemini responded!\n");
    } catch (err) {
      console.log(`⚠️  Gemini failed: ${err.message}`);
      console.log("🎲 Falling back to random style\n");
      styleDirectives = generateRandomStyle(content);
    }
  }

  // Validate and fix theme
  if (!THEMES[styleDirectives.theme]) {
    styleDirectives.theme = "royal";
  }

  // Build enriched content
  const styled = {
    ...content,
    theme: styleDirectives.theme,
    themeColors: THEMES[styleDirectives.theme],
    hookAnimation: styleDirectives.hookAnimation || "zoomIn",
    hookIcon: styleDirectives.hookIcon || "fire",
    facts: items.map((item, i) => {
      const directive = styleDirectives.facts[i] || {};
      return {
        ...item,
        rank: item.rank || items.length - i,
        heading: directive.heading || item.heading || `Part ${i + 1}`,
        player: item.player || "generic",
        text: item.text,
        highlight: directive.highlight || item.highlight || "WOW",
        animation: ANIMATIONS.includes(directive.animation) ? directive.animation : ANIMATIONS[i % ANIMATIONS.length],
        transition: TRANSITIONS.includes(directive.transition) ? directive.transition : TRANSITIONS[i % TRANSITIONS.length],
        icon: ICONS[directive.icon] ? directive.icon : "star",
        voiceEmotion: VOICE_EMOTIONS[directive.voiceEmotion] || VOICE_EMOTIONS.excited,
        narrationTransition: (styleDirectives.narrationTransitions || [])[i] || "",
      };
    }),
    outroAnimation: styleDirectives.outroAnimation || "fadeUp",
  };
  delete styled.segments; // remove segments so other scripts only see facts

  // Write styled content
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(styled, null, 2));

  console.log("📋 Style Decisions:");
  console.log(`   Theme: ${styled.theme}`);
  console.log(`   Hook Animation: ${styled.hookAnimation}`);
  styled.facts.forEach((f, i) => {
    console.log(`   Fact #${f.rank}: anim=${f.animation} trans=${f.transition} icon=${f.icon}`);
  });

  console.log(`\n✅ Saved to: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("❌ Style generation failed:", err.message);
  process.exit(1);
});
