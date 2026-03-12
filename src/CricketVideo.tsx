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

interface Fact {
  rank: number;
  heading: string;
  player: string;
  text: string;
  highlight: string;
  emoji: string;
}

interface ContentData {
  title: string;
  hook: string;
  facts: Fact[];
  outro: string;
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
  const transitionFrames = Math.round(0.3 * fps); // 0.3s transitions
  const outroFrames = outroSeconds * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* === PROGRESS BAR (always on top) === */}
      <ProgressBar />

      {/* === HOOK SECTION === */}
      <Sequence from={0} durationInFrames={hookFrames}>
        <Background player="generic" />
        <Hook text={content.hook} title={content.title} />
      </Sequence>

      {/* === FACT SECTIONS === */}
      {content.facts.map((fact, index) => {
        const factStart = hookFrames + index * factFrames;
        return (
          <React.Fragment key={index}>
            {/* Transition between segments */}
            {index > 0 && (
              <Sequence
                from={factStart - transitionFrames}
                durationInFrames={transitionFrames * 2}
              >
                <Transition />
              </Sequence>
            )}

            <Sequence from={factStart} durationInFrames={factFrames}>
              {/* Player-specific background clip */}
              <Background player={fact.player} />

              {/* Fact card with animated stats */}
              <FactCard
                rank={fact.rank}
                heading={fact.heading}
                text={fact.text}
                highlight={fact.highlight}
                emoji={fact.emoji}
                totalFacts={content.facts.length}
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
        <Outro text={content.outro} />
      </Sequence>

      {/* === AUDIO TRACK (if generated) === */}
      {audioTimings && (
        <Audio src={staticFile("audio/full-narration.mp3")} volume={1} />
      )}
    </AbsoluteFill>
  );
};
