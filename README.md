# 🏏 AutoSports — Cricket Shorts Generator

Automated daily **YouTube Shorts** (9:16) for cricket fun facts, records, and stats.

## 🔥 Features

- **Player-Specific Clips** — Shows actual cricket footage of the player being discussed
- **ElevenLabs TTS** — Human-like voiceover with emotion and natural accent
- **Viral Design** — Glassmorphism cards, kinetic typography, counting animations
- **2-Second Hook** — Grabs attention immediately to prevent scrolling
- **Progress Bar** — Keeps viewers watching till the end
- **Word-by-Word Subtitles** — Synced with voiceover
- **Countdown Format** — Builds anticipation (Top 5 → #1)
- **GitHub Actions** — Fully automated daily rendering

## 📁 Project Structure

```
content/daily.json       ← Daily facts/stats (edit this!)
public/clips/<player>/   ← Cricket clips per player
public/sfx/              ← Sound effects (optional)
src/                     ← Remotion video components
scripts/                 ← Audio & render pipeline
.github/workflows/       ← GitHub Actions automation
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Cricket Clips
Place `.mp4` clips in `public/clips/<player-slug>/`:
```
public/clips/virat-kohli/clip1.mp4
public/clips/ms-dhoni/clip1.mp4
public/clips/sachin-tendulkar/clip1.mp4
```

### 3. Preview in Browser
```bash
npm run dev
```

### 4. Render Video
```bash
# With audio (needs ELEVENLABS_KEY_1 env var)
npm run render

# Without audio
node scripts/render-video.js --skip-audio
```

## 🔑 GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `ELEVENLABS_KEY_1` | ElevenLabs API key (account 1) |
| `ELEVENLABS_KEY_2` | ElevenLabs API key (account 2) |
| `ELEVENLABS_KEY_3` | ElevenLabs API key (account 3) |

*3 keys rotate by day of month for ~30 free videos/month.*

## 📝 Daily Content Format

Edit `content/daily.json`:
```json
{
  "title": "5 Cricket Records That Will SHOCK You 🤯",
  "hook": "No one has EVER broken this record...",
  "facts": [
    {
      "rank": 5,
      "heading": "Most Sixes in ODI",
      "player": "chris-gayle",
      "text": "Chris Gayle smashed 553 sixes...",
      "highlight": "553",
      "emoji": "💥"
    }
  ],
  "outro": "Follow for more! 🔥"
}
```

## ⚙️ GitHub Actions

- **Daily auto-render** at 6:00 AM UTC (11:30 AM IST)
- **Manual trigger** via Actions tab → "Render Cricket Shorts" → Run
- Output `.mp4` uploaded as downloadable artifact (30-day retention)

## 🛠️ Tech Stack

- [Remotion](https://remotion.dev) — React → Video
- [ElevenLabs](https://elevenlabs.io) — AI Voice
- [ffmpeg](https://ffmpeg.org) — Audio/Video Merge
- [GitHub Actions](https://github.com/features/actions) — CI/CD
