import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface HookProps {
  text: string;
  title: string;
}

export const Hook: React.FC<HookProps> = ({ text, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title zoom-in with spring
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 80 },
  });

  // Hook text slide up
  const hookY = interpolate(frame, [fps * 0.8, fps * 1.4], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hookOpacity = interpolate(frame, [fps * 0.8, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shake effect on title
  const shakeX =
    frame < fps * 0.5
      ? Math.sin(frame * 1.5) * interpolate(frame, [0, fps * 0.5], [15, 0])
      : 0;

  // Pulsing glow
  const glowIntensity = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [20, 40]
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      {/* Background radial flash */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at 50% 50%, rgba(255, 215, 0, ${interpolate(frame, [0, 15], [0.3, 0], { extrapolateRight: "clamp" })}) 0%, transparent 60%)`,
        }}
      />

      {/* Title */}
      <div
        style={{
          transform: `scale(${titleScale}) translateX(${shakeX}px)`,
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            fontFamily: "'Outfit', sans-serif",
            color: "#ffffff",
            textShadow: `0 0 ${glowIntensity}px rgba(255, 215, 0, 0.8), 0 4px 20px rgba(0, 0, 0, 0.8)`,
            lineHeight: 1.1,
            letterSpacing: "-2px",
          }}
        >
          {title}
        </div>
      </div>

      {/* Hook text */}
      <div
        style={{
          transform: `translateY(${hookY}px)`,
          opacity: hookOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "42px",
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            color: "#FFD700",
            textShadow: "0 2px 15px rgba(0, 0, 0, 0.9)",
            padding: "20px 30px",
            background: "rgba(255, 215, 0, 0.1)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 215, 0, 0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
