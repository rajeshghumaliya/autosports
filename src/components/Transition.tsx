import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

export const Transition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const transitionDuration = Math.round(fps * 0.3);

  // Fast wipe from right
  const wipeX = interpolate(
    frame,
    [0, transitionDuration / 2, transitionDuration],
    [100, 0, -100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = interpolate(
    frame,
    [0, transitionDuration / 2, transitionDuration],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ zIndex: 50 }}>
      {/* Main wipe bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #FFD700, #FF6B35)",
          transform: `translateX(${wipeX}%)`,
          opacity,
        }}
      />

      {/* Secondary line accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "8px",
          height: "100%",
          background: "#ffffff",
          transform: `translateX(${wipeX * 1.1}vw)`,
          opacity: opacity * 0.8,
          boxShadow: "0 0 30px rgba(255, 255, 255, 0.5)",
        }}
      />
    </AbsoluteFill>
  );
};
