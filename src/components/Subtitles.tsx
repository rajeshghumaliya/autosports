import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";

interface SubtitlesProps {
  text: string;
  durationFrames: number;
}

export const Subtitles: React.FC<SubtitlesProps> = ({
  text,
  durationFrames,
}) => {
  const frame = useCurrentFrame();

  // Split text into words
  const words = text.split(" ");
  const totalWords = words.length;

  // Calculate which word is currently "active"
  const wordsPerFrame = totalWords / (durationFrames * 0.85); // leave 15% margin
  const wordDelay = 5; // start subtitles after 5 frames delay
  const currentWordIndex = Math.floor(
    (frame - wordDelay) * wordsPerFrame
  );

  // Group words into chunks of ~6 for display
  const chunkSize = 6;
  const chunks: string[][] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }

  // Determine which chunk to show
  const currentChunkIndex = Math.floor(currentWordIndex / chunkSize);
  const activeChunk = chunks[Math.min(currentChunkIndex, chunks.length - 1)];
  const wordOffsetInChunk = currentWordIndex - currentChunkIndex * chunkSize;

  if (!activeChunk || frame < wordDelay) return null;

  // Fade in/out
  const opacity = interpolate(
    frame,
    [wordDelay, wordDelay + 8, durationFrames - 10, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "200px",
        opacity,
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          padding: "16px 28px",
          maxWidth: "900px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "36px",
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.4,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {activeChunk.map((word, i) => {
            const isActive = i <= wordOffsetInChunk;
            const isCurrent = i === wordOffsetInChunk;
            return (
              <span
                key={`${currentChunkIndex}-${i}`}
                style={{
                  color: isCurrent
                    ? "#FFD700"
                    : isActive
                      ? "#ffffff"
                      : "rgba(255, 255, 255, 0.4)",
                  textShadow: isCurrent
                    ? "0 0 20px rgba(255, 215, 0, 0.6)"
                    : "none",
                  transform: isCurrent ? "scale(1.1)" : "scale(1)",
                  display: "inline-block",
                  transition: "all 0.1s ease",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
