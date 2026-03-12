import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Video,
  staticFile,
} from "remotion";

interface BackgroundProps {
  player: string;
}

export const Background: React.FC<BackgroundProps> = ({ player }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ─── Ken Burns: slow pan + zoom ────────────────
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.2], {
    extrapolateRight: "clamp",
  });
  const panX = interpolate(
    frame,
    [0, durationInFrames],
    [0, -3],
    { extrapolateRight: "clamp" }
  );
  const panY = interpolate(
    frame,
    [0, durationInFrames],
    [0, -2],
    { extrapolateRight: "clamp" }
  );

  // ─── Entry: fade in from black ─────────────────
  const entryOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ─── Ambient light sweep (diagonal) ────────────
  const lightX = interpolate(
    frame,
    [0, durationInFrames],
    [-50, 150],
    { extrapolateRight: "clamp" }
  );

  // ─── Vignette pulse ────────────────────────────
  const vignetteIntensity = interpolate(
    Math.sin(frame * 0.03),
    [-1, 1],
    [0.7, 0.85]
  );

  const clipPath = `clips/${player}/clip1.mp4`;

  return (
    <AbsoluteFill>
      {/* Video clip with Ken Burns */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
          transformOrigin: "center center",
          opacity: entryOpacity,
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
          playbackRate={0.7}
        />
      </AbsoluteFill>

      {/* Multi-layer dark overlay */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.75) 0%,
            rgba(0, 0, 0, 0.35) 25%,
            rgba(0, 0, 0, 0.30) 50%,
            rgba(0, 0, 0, 0.45) 75%,
            rgba(0, 0, 0, 0.85) 100%
          )`,
        }}
      />

      {/* Diagonal ambient light sweep */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(
            135deg,
            transparent ${lightX - 15}%,
            rgba(255, 215, 0, 0.04) ${lightX}%,
            transparent ${lightX + 15}%
          )`,
        }}
      />

      {/* Radial accent glow bottom */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(
            ellipse 80% 40% at 50% 100%,
            rgba(255, 215, 0, 0.06) 0%,
            transparent 60%
          )`,
        }}
      />

      {/* Cinematic vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(
            ellipse 70% 60% at 50% 50%,
            transparent 0%,
            rgba(0, 0, 0, ${vignetteIntensity}) 100%
          )`,
        }}
      />

      {/* Film grain texture (subtle) */}
      <AbsoluteFill
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
          transform: `translate(${(frame * 7) % 128}px, ${(frame * 3) % 128}px)`,
          mixBlendMode: "overlay",
        }}
      />
    </AbsoluteFill>
  );
};
