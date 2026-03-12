import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ zIndex: 100 }}>
      {/* Track */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "6px",
          background: "rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Fill */}
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #00E676, #FFD700, #FF6B35)",
            borderRadius: "0 3px 3px 0",
            boxShadow: "0 0 12px rgba(255, 215, 0, 0.5)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
