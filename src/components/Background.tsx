import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Video,
  staticFile,
  Img,
} from "remotion";

interface BackgroundProps {
  player: string;
}

export const Background: React.FC<BackgroundProps> = ({ player }) => {
  const frame = useCurrentFrame();

  // Ken Burns slow zoom effect
  const zoom = interpolate(frame, [0, 300], [1, 1.15], {
    extrapolateRight: "clamp",
  });

  // Try to load a player-specific clip or fall back to placeholder
  const clipPath = `clips/${player}/clip1.mp4`;

  return (
    <AbsoluteFill>
      {/* Video clip layer */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <Video
          src={staticFile(clipPath)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          startFrom={0}
          volume={0}
          playbackRate={0.8}
        />
      </AbsoluteFill>

      {/* Dark gradient overlay for text readability */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.4) 30%,
            rgba(0, 0, 0, 0.4) 60%,
            rgba(0, 0, 0, 0.8) 100%
          )`,
        }}
      />

      {/* Colored accent glow at bottom */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(
            ellipse at 50% 100%,
            rgba(255, 215, 0, 0.08) 0%,
            transparent 50%
          )`,
        }}
      />
    </AbsoluteFill>
  );
};
