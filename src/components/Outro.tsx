import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface OutroProps {
  text: string;
}

export const Outro: React.FC<OutroProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main text scale in
  const textScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Subscribe button slide up
  const btnY = interpolate(frame, [fps * 0.5, fps * 1], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const btnOpacity = interpolate(frame, [fps * 0.5, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing effect on subscribe
  const pulse = interpolate(
    Math.sin(frame * 0.2),
    [-1, 1],
    [1, 1.08]
  );

  // Bell icon wiggle
  const bellRotate = frame > fps * 1.2
    ? Math.sin((frame - fps * 1.2) * 0.8) * 15
    : 0;

  // Background particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    x: 50 + Math.sin(i * 0.8 + frame * 0.03) * 40,
    y: 50 + Math.cos(i * 1.1 + frame * 0.025) * 35,
    size: 4 + Math.sin(i + frame * 0.05) * 2,
    opacity: 0.15 + Math.sin(i * 2 + frame * 0.04) * 0.1,
  }));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "60px",
      }}
    >
      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: "#FFD700",
            opacity: p.opacity,
            boxShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
          }}
        />
      ))}

      {/* Main CTA text */}
      <div
        style={{
          transform: `scale(${textScale})`,
          textAlign: "center",
          marginBottom: "50px",
        }}
      >
        <div
          style={{
            fontSize: "56px",
            fontWeight: 900,
            fontFamily: "'Outfit', sans-serif",
            color: "#ffffff",
            textShadow: "0 0 30px rgba(255, 215, 0, 0.4), 0 4px 20px rgba(0,0,0,0.8)",
            lineHeight: 1.2,
          }}
        >
          {text}
        </div>
      </div>

      {/* Subscribe button */}
      <div
        style={{
          transform: `translateY(${btnY}px) scale(${pulse})`,
          opacity: btnOpacity,
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #FF0000, #CC0000)",
            color: "#ffffff",
            fontSize: "36px",
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            padding: "20px 48px",
            borderRadius: "60px",
            boxShadow: "0 8px 30px rgba(255, 0, 0, 0.4), 0 0 60px rgba(255, 0, 0, 0.15)",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          SUBSCRIBE
        </div>

        {/* Bell icon */}
        <div
          style={{
            fontSize: "48px",
            transform: `rotate(${bellRotate}deg)`,
            display: "inline-block",
          }}
        >
          🔔
        </div>
      </div>

      {/* Channel watermark area */}
      <div
        style={{
          position: "absolute",
          bottom: "120px",
          opacity: interpolate(frame, [fps * 1.5, fps * 2], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          fontSize: "24px",
          fontFamily: "'Inter', sans-serif",
          color: "rgba(255, 255, 255, 0.5)",
          letterSpacing: "4px",
          textTransform: "uppercase",
        }}
      >
        @AutoSports
      </div>
    </AbsoluteFill>
  );
};
