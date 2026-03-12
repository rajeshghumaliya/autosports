import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
} from "remotion";
import { Hook } from "./components/Hook";
import { FactCard } from "./components/FactCard";
import { Subtitles } from "./components/Subtitles";
import { Background } from "./components/Background";
import { ProgressBar } from "./components/ProgressBar";
import { Transition } from "./components/Transition";
import { Outro } from "./components/Outro";
import "./styles.css";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  glow: string;
}

interface Fact {
  rank: number;
  heading: string;
  player: string;
  text: string;
  highlight: string;
  emoji?: string;
  icon?: string;
  animation?: string;
  transition?: string;
  narrationTransition?: string;
}

interface ContentData {
  title: string;
  hook: string;
  facts?: Fact[];
  segments?: { time: string; text: string; emoji: string }[];
  outro: string;
  theme?: string;
  themeColors?: ThemeColors;
  hookAnimation?: string;
  hookIcon?: string;
  outroAnimation?: string;
}

export interface CricketVideoProps {
  content: ContentData;
  fps: number;
  secondsPerFact: number;
  hookSeconds: number;
  outroSeconds: number;
  audioTimings?: { segments: { start: number; end: number; text: string }[] };
}

export const CricketVideo: React.FC<CricketVideoProps> = ({
  content,
  fps,
  secondsPerFact,
  hookSeconds,
  outroSeconds,
  audioTimings,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const hookFrames = hookSeconds * fps;
  const factFrames = secondsPerFact * fps;
  const transitionFrames = Math.round(0.3 * fps);
  const outroFrames = outroSeconds * fps;

  // Dynamic theme colors (from Gemini styling or defaults)
  const themeColors = content.themeColors || {
    primary: "#FFD700",
    secondary: "#FF8C00",
    accent: "#FFA500",
    bg: "rgba(255,215,0,0.08)",
    glow: "rgba(255,215,0,0.6)",
  };

  const items: Fact[] = content.facts || (content.segments ? content.segments.map((s, i, arr) => ({
    rank: arr.length - i,
    heading: `Part ${i + 1}`,
    player: "generic",
    text: s.text,
    highlight: s.emoji || "WOW",
    emoji: s.emoji,
    icon: "star"
  })) as Fact[] : []);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* === PROGRESS BAR === */}
      <ProgressBar />

      {/* === HOOK === */}
      <Sequence from={0} durationInFrames={hookFrames}>
        <Background player="generic" />
        <Hook
          text={content.hook}
          title={content.title}
          themeColors={themeColors}
          icon={content.hookIcon}
        />
      </Sequence>

      {/* === FACTS / SEGMENTS === */}
      {items.map((fact, index) => {
        const factStart = hookFrames + index * factFrames;
        return (
          <React.Fragment key={index}>
            {/* Dynamic transition between segments */}
            {index > 0 && (
              <Sequence
                from={factStart - transitionFrames}
                durationInFrames={transitionFrames * 2}
              >
                <Transition variant={fact.transition || "slash"} />
              </Sequence>
            )}

            <Sequence from={factStart} durationInFrames={factFrames}>
              {/* Player-specific background */}
              <Background player={fact.player || "generic"} />

              {/* Fact card with dynamic animation + icon */}
              <FactCard
                rank={fact.rank}
                heading={fact.heading || `Part ${index + 1}`}
                text={fact.text}
                highlight={fact.highlight || fact.emoji || "🔥"}
                icon={fact.icon || "star"}
                totalFacts={items.length}
                animation={fact.animation || "fadeUp"}
                themeColors={themeColors}
              />

              {/* Subtitles */}
              <Subtitles text={fact.text} durationFrames={factFrames} />
            </Sequence>
          </React.Fragment>
        );
      })}

      {/* === OUTRO === */}
      <Sequence
        from={hookFrames + items.length * factFrames}
        durationInFrames={outroFrames}
      >
        <Background player="generic" />
        <Outro
          text={content.outro}
          themeColors={themeColors}
        />
      </Sequence>

      {/* === AUDIO === */}
      {audioTimings && (
        <Audio src={staticFile("audio/full-narration.mp3")} volume={1} />
      )}
    </AbsoluteFill>
  );
};
