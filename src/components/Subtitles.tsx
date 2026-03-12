import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
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
  const { fps } = useVideoConfig();

  const words = text.split(" ");
  const totalWords = words.length;

  // Start subtitles after a brief delay
  const wordDelay = Math.round(fps * 0.15);
  const wordsPerFrame = totalWords / (durationFrames * 0.85);
  const currentWordIndex = Math.floor((frame - wordDelay) * wordsPerFrame);

  // Group words into chunks of ~5
  const chunkSize = 5;
  const chunks: string[][] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }

  const currentChunkIndex = Math.floor(currentWordIndex / chunkSize);
  const prevChunkIndex = Math.max(0, currentChunkIndex - 1);
  const activeChunk = chunks[Math.min(currentChunkIndex, chunks.length - 1)];
  const wordOffsetInChunk = currentWordIndex - currentChunkIndex * chunkSize;

  if (!activeChunk || frame < wordDelay) return null;

  // ─── Chunk transition: slide up + scale ────────
  const chunkTransitionKey = currentChunkIndex;
  const isNewChunk = wordOffsetInChunk === 0;

  // ─── Container fade ─────────────────────────────
  const containerOpacity = interpolate(
    frame,
    [wordDelay, wordDelay + 12, durationFrames - 15, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ─── Background bar glow ───────────────────────
  const barGlow = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.5, 0.8]
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "220px",
        opacity: containerOpacity,
      }}
    >
      {/* Subtitle container with glass effect */}
      <div
        style={{
          background: `rgba(0, 0, 0, ${barGlow})`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "18px",
          padding: "18px 32px",
          maxWidth: "920px",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            fontSize: "38px",
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.4,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {activeChunk.map((word, i) => {
            const isActive = i <= wordOffsetInChunk;
            const isCurrent = i === wordOffsetInChunk;

            // Each word gets a mini spring
            const wordScale = isCurrent ? 1.12 : isActive ? 1 : 0.95;
            const wordY = isActive ? 0 : 8;

            return (
              <span
                key={`${currentChunkIndex}-${i}`}
                style={{
                  color: isCurrent
                    ? "#FFD700"
                    : isActive
                      ? "#ffffff"
                      : "rgba(255, 255, 255, 0.3)",
                  textShadow: isCurrent
                    ? "0 0 24px rgba(255, 215, 0, 0.7), 0 0 50px rgba(255, 215, 0, 0.3)"
                    : isActive
                      ? "0 1px 4px rgba(0,0,0,0.3)"
                      : "none",
                  transform: `scale(${wordScale}) translateY(${wordY}px)`,
                  display: "inline-block",
                  transition: "all 0.08s ease-out",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Active word indicator dot */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          gap: "6px",
          alignItems: "center",
        }}
      >
        {activeChunk.map((_, i) => (
          <div
            key={i}
            style={{
              width: i <= wordOffsetInChunk ? "16px" : "6px",
              height: "6px",
              borderRadius: "3px",
              background:
                i <= wordOffsetInChunk
                  ? "#FFD700"
                  : "rgba(255,255,255,0.2)",
              boxShadow:
                i === wordOffsetInChunk
                  ? "0 0 10px rgba(255,215,0,0.5)"
                  : "none",
              transition: "all 0.1s ease",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
