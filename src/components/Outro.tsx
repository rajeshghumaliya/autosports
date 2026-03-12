import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

interface OutroProps {
  text: string;
}

export const Outro: React.FC<OutroProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── Background radial burst ───────────────────
  const burstScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 40 },
  });
  const burstOpacity = interpolate(burstScale, [0, 0.5, 1], [0, 0.15, 0.05]);

  // ─── Main CTA: scale with 3D perspective ───────
  const textSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 60, mass: 0.8 },
  });
  const textRotateX = interpolate(textSpring, [0, 1], [40, 0]);
  const textBlur = interpolate(textSpring, [0, 0.4], [10, 0], {
    extrapolateRight: "clamp",
  });

  // ─── Subscribe button ─────────────────────────
  const btnSpring = spring({
    frame: Math.max(0, frame - fps * 0.6),
    fps,
    config: { damping: 7, stiffness: 90, mass: 0.6 },
  });
  const btnY = interpolate(btnSpring, [0, 1], [100, 0]);
  const btnScale = interpolate(btnSpring, [0, 1], [0.5, 1]);

  // Pulsing glow
  const pulse = 1 + Math.sin(frame * 0.08) * 0.04;
  const glowSize = interpolate(Math.sin(frame * 0.08), [-1, 1], [20, 50]);

  // ─── Bell wiggle ──────────────────────────────
  const bellActive = frame > fps * 1.2;
  const bellRotate = bellActive
    ? Math.sin((frame - fps * 1.2) * 0.5) * 20 * Math.exp(-(frame - fps * 1.2) * 0.02)
    : 0;
  const bellScale = spring({
    frame: Math.max(0, frame - fps * 1.0),
    fps,
    config: { damping: 5, stiffness: 150 },
  });

  // ─── Orbiting particles ───────────────────────
  const orbitParticles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2 + frame * 0.03;
    const dist = 180 + Math.sin(frame * 0.04 + i) * 40;
    const vertDist = 120 + Math.cos(frame * 0.035 + i * 0.7) * 50;
    return {
      x: 50 + (Math.cos(angle) * dist) / 10.8,
      y: 50 + (Math.sin(angle) * vertDist) / 19.2,
      size: 3 + Math.sin(frame * 0.06 + i * 1.2) * 2,
      opacity: 0.1 + Math.sin(frame * 0.05 + i * 0.9) * 0.08,
      color: i % 4 === 0 ? "#FFD700" : i % 4 === 1 ? "#FF0000" : i % 4 === 2 ? "#00E676" : "#FF6B35",
    };
  });

  // ─── Rising lines (energy effect) ─────────────
  const risingLines = Array.from({ length: 6 }, (_, i) => {
    const x = 15 + i * 14;
    const yOffset = ((frame * (1.5 + i * 0.3)) % 200) - 100;
    return {
      x,
      y: 100 - yOffset,
      opacity: interpolate(yOffset, [-100, 0, 100], [0, 0.08, 0]),
      height: 80 + i * 10,
    };
  });

  // ─── Channel name: typewriter ──────────────────
  const channelName = "@AutoSports";
  const charsRevealed = interpolate(
    frame,
    [fps * 1.8, fps * 1.8 + channelName.length * 3],
    [0, channelName.length],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "60px",
      }}
    >
      {/* Radial burst */}
      <div
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          left: "-50%",
          top: "-50%",
          background: `radial-gradient(circle, rgba(255,0,0,${burstOpacity}) 0%, transparent 50%)`,
          transform: `scale(${burstScale})`,
        }}
      />

      {/* Orbiting particles */}
      {orbitParticles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
        />
      ))}

      {/* Rising energy lines */}
      {risingLines.map((line, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${line.x}%`,
            bottom: `${line.y}%`,
            width: "2px",
            height: `${line.height}px`,
            background: `linear-gradient(to top, transparent, rgba(255,215,0,${line.opacity}), transparent)`,
            borderRadius: "1px",
          }}
        />
      ))}

      {/* Main CTA text */}
      <div
        style={{
          transform: `perspective(600px) rotateX(${textRotateX}deg) scale(${textSpring})`,
          filter: `blur(${textBlur}px)`,
          textAlign: "center",
          marginBottom: "60px",
        }}
      >
        <div
          style={{
            fontSize: "60px",
            fontWeight: 900,
            fontFamily: "'Outfit', sans-serif",
            color: "#ffffff",
            textShadow: `
              0 0 30px rgba(255, 215, 0, 0.5),
              0 0 60px rgba(255, 100, 0, 0.2),
              0 6px 30px rgba(0, 0, 0, 0.9)
            `,
            lineHeight: 1.15,
          }}
        >
          {text}
        </div>
      </div>

      {/* Subscribe button */}
      <div
        style={{
          transform: `translateY(${btnY}px) scale(${btnScale * pulse})`,
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #FF0000, #CC0000)",
            color: "#ffffff",
            fontSize: "38px",
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            padding: "22px 52px",
            borderRadius: "60px",
            boxShadow: `
              0 8px 30px rgba(255, 0, 0, 0.5),
              0 0 ${glowSize}px rgba(255, 0, 0, 0.2),
              inset 0 1px 0 rgba(255,255,255,0.2)
            `,
            letterSpacing: "3px",
            textTransform: "uppercase",
            border: "2px solid rgba(255,255,255,0.15)",
          }}
        >
          SUBSCRIBE
        </div>

        {/* Bell icon */}
        <div
          style={{
            fontSize: "52px",
            transform: `rotate(${bellRotate}deg) scale(${bellScale})`,
            display: "inline-block",
            filter: "drop-shadow(0 0 12px rgba(255,215,0,0.5))",
          }}
        >
          🔔
        </div>
      </div>

      {/* Channel name - typewriter */}
      <div
        style={{
          position: "absolute",
          bottom: "140px",
          fontSize: "26px",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.5)",
          letterSpacing: "5px",
          textTransform: "uppercase",
        }}
      >
        {channelName.split("").map((char, i) => (
          <span
            key={i}
            style={{
              opacity: i < charsRevealed ? 1 : 0,
              display: "inline-block",
            }}
          >
            {char}
          </span>
        ))}
        {/* Cursor blink */}
        <span
          style={{
            opacity: Math.sin(frame * 0.2) > 0 ? 0.6 : 0,
            color: "#FFD700",
            marginLeft: "2px",
          }}
        >
          |
        </span>
      </div>
    </AbsoluteFill>
  );
};
