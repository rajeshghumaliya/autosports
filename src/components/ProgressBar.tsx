import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: "clamp",
  });

  // ─── Glow pulse on the leading edge ────────────
  const glowIntensity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [8, 20]
  );

  // ─── Shimmer sweep along the bar ──────────────
  const shimmerX = (frame * 3) % 200 - 50;

  return (
    <AbsoluteFill style={{ zIndex: 100 }}>
      {/* Track */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "5px",
          background: "rgba(255, 255, 255, 0.06)",
        }}
      >
        {/* Fill gradient */}
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #00E676, #FFD700, #FF6B35)",
            borderRadius: "0 4px 4px 0",
            position: "relative",
            boxShadow: `0 0 ${glowIntensity}px rgba(255, 215, 0, 0.6)`,
          }}
        >
          {/* Shimmer highlight */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${shimmerX}%`,
              width: "40px",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
              borderRadius: "4px",
            }}
          />
          {/* Leading edge bright dot */}
          <div
            style={{
              position: "absolute",
              right: "-3px",
              top: "-2px",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "#FFD700",
              boxShadow: `0 0 ${glowIntensity}px rgba(255, 215, 0, 0.8), 0 0 ${glowIntensity * 2}px rgba(255, 215, 0, 0.4)`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
