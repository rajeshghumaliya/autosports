import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface FactCardProps {
  rank: number;
  heading: string;
  text: string;
  highlight: string;
  emoji: string;
  totalFacts: number;
}

export const FactCard: React.FC<FactCardProps> = ({
  rank,
  heading,
  text,
  highlight,
  emoji,
  totalFacts,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rank number flies in from left
  const rankX = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const rankScale = spring({
    frame: frame - 3,
    fps,
    config: { damping: 8, stiffness: 120 },
  });

  // Card slides up
  const cardY = interpolate(frame, [5, 20], [200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlight number counts up
  const highlightNum = parseFloat(highlight.replace(/[^0-9.]/g, ""));
  const isNumeric = !isNaN(highlightNum);
  const countProgress = interpolate(frame, [15, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayNum = isNumeric
    ? Math.round(highlightNum * countProgress).toLocaleString()
    : highlight;
  const highlightSuffix = isNumeric
    ? highlight.replace(/[0-9.,]/g, "").trim()
    : "";

  // Emoji bounce
  const emojiScale = spring({
    frame: frame - 25,
    fps,
    config: { damping: 6, stiffness: 150 },
  });

  // Heading underline width
  const underlineWidth = interpolate(frame, [10, 30], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow on highlight
  const glowPulse = interpolate(Math.sin(frame * 0.12), [-1, 1], [10, 30]);

  // Determine accent color based on rank
  const accentColors: Record<number, string> = {
    1: "#FFD700", // Gold
    2: "#FF6B35", // Orange
    3: "#00E676", // Green
    4: "#448AFF", // Blue
    5: "#E040FB", // Purple
  };
  const accent = accentColors[rank] || "#FFD700";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 40px",
      }}
    >
      {/* Rank number - large background */}
      <div
        style={{
          position: "absolute",
          top: "180px",
          left: "40px",
          fontSize: "200px",
          fontWeight: 900,
          fontFamily: "'Outfit', sans-serif",
          color: accent,
          opacity: 0.15,
          transform: `scale(${rankScale}) translateX(${(1 - rankX) * -200}px)`,
          lineHeight: 1,
        }}
      >
        #{rank}
      </div>

      {/* Main card */}
      <div
        style={{
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
          width: "100%",
          maxWidth: "960px",
        }}
      >
        {/* Rank badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
            transform: `translateX(${(1 - rankX) * -100}px)`,
          }}
        >
          <div
            style={{
              background: accent,
              color: "#000",
              fontSize: "32px",
              fontWeight: 900,
              fontFamily: "'Outfit', sans-serif",
              padding: "8px 24px",
              borderRadius: "12px",
              boxShadow: `0 0 20px ${accent}66`,
            }}
          >
            #{rank}
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}
          >
            of {totalFacts}
          </div>
        </div>

        {/* Glassmorphism card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "24px",
            border: `1px solid rgba(255, 255, 255, 0.12)`,
            padding: "40px",
            boxShadow: `0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "40px",
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                color: "#ffffff",
                lineHeight: 1.2,
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              {heading}
            </div>
            {/* Animated underline */}
            <div
              style={{
                height: "4px",
                width: `${underlineWidth}%`,
                background: `linear-gradient(90deg, ${accent}, transparent)`,
                borderRadius: "2px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* Highlight number */}
          <div
            style={{
              fontSize: "96px",
              fontWeight: 900,
              fontFamily: "'Outfit', sans-serif",
              color: accent,
              textShadow: `0 0 ${glowPulse}px ${accent}88, 0 4px 20px rgba(0,0,0,0.6)`,
              lineHeight: 1,
              marginBottom: "20px",
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
            }}
          >
            <span>{displayNum}</span>
            {highlightSuffix && (
              <span style={{ fontSize: "40px", opacity: 0.8 }}>
                {highlightSuffix}
              </span>
            )}
            <span
              style={{
                fontSize: "64px",
                transform: `scale(${Math.max(0, emojiScale)})`,
                display: "inline-block",
              }}
            >
              {emoji}
            </span>
          </div>

          {/* Description text */}
          <div
            style={{
              fontSize: "30px",
              fontWeight: 400,
              fontFamily: "'Inter', sans-serif",
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: 1.5,
              textShadow: "0 1px 8px rgba(0,0,0,0.5)",
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
