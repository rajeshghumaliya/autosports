import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

export const Transition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dur = Math.round(fps * 0.3); // 0.3 seconds at 60fps = 18 frames
  const mid = dur / 2;

  // ─── Multiple diagonal slashes ─────────────────
  const slashes = [
    { delay: 0, width: "120%", color: "rgba(255,215,0,0.9)", skew: -15 },
    { delay: 2, width: "60%", color: "rgba(255,107,53,0.7)", skew: -15 },
    { delay: 4, width: "30%", color: "rgba(255,255,255,0.4)", skew: -15 },
  ];

  return (
    <AbsoluteFill style={{ zIndex: 50, overflow: "hidden" }}>
      {slashes.map((slash, i) => {
        const adjustedFrame = Math.max(0, frame - slash.delay);
        const x = interpolate(
          adjustedFrame,
          [0, mid, dur - slash.delay],
          [-120, 0, 120],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const opacity = interpolate(
          adjustedFrame,
          [0, mid * 0.5, mid, dur - slash.delay],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: slash.width,
              height: "100%",
              background: `linear-gradient(90deg, transparent, ${slash.color}, transparent)`,
              transform: `translateX(${x}%) skewX(${slash.skew}deg)`,
              opacity,
            }}
          />
        );
      })}

      {/* Flash overlay */}
      <AbsoluteFill
        style={{
          background: "#fff",
          opacity: interpolate(
            frame,
            [mid - 2, mid, mid + 4],
            [0, 0.3, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      />
    </AbsoluteFill>
  );
};
