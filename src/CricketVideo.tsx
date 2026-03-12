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
  facts: Fact[];
  outro: string;
  theme?: string;
  themeColors?: ThemeColors;
  hookAnimation?: string;
  hookIcon?: string;
  outroAnimation?: string;
}

interface CricketVideoProps {
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

      {/* === FACTS === */}
      {content.facts.map((fact, index) => {
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
              <Background player={fact.player} />

              {/* Fact card with dynamic animation + icon */}
              <FactCard
                rank={fact.rank}
                heading={fact.heading}
                text={fact.text}
                highlight={fact.highlight}
                icon={fact.icon || "star"}
                totalFacts={content.facts.length}
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
        from={hookFrames + content.facts.length * factFrames}
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
