import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { PremiumIcon } from "./PremiumIcon";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  glow: string;
}

interface OutroProps {
  text: string;
  themeColors?: ThemeColors;
}

export const Outro: React.FC<OutroProps> = ({ text, themeColors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pal = themeColors || {
    primary: "#FFD700", secondary: "#FF8C00", accent: "#FFA500",
    bg: "rgba(255,215,0,0.08)", glow: "rgba(255,215,0,0.6)",
  };

  // ─── CTA spring ────────────────────────────────
  const textSpring = spring({ frame, fps, config: { damping: 8, stiffness: 60, mass: 0.8 } });
  const textRotateX = interpolate(textSpring, [0, 1], [40, 0]);
  const textBlur = interpolate(textSpring, [0, 0.4], [10, 0], { extrapolateRight: "clamp" });

  // ─── Subscribe button ─────────────────────────
  const btnSpring = spring({ frame: Math.max(0, frame - fps * 0.6), fps, config: { damping: 7, stiffness: 90, mass: 0.6 } });
  const btnY = interpolate(btnSpring, [0, 1], [100, 0]);
  const pulse = 1 + Math.sin(frame * 0.08) * 0.04;
  const glowSize = interpolate(Math.sin(frame * 0.08), [-1, 1], [20, 50]);

  // ─── Bell ──────────────────────────────────────
  const bellActive = frame > fps * 1.2;
  const bellRotate = bellActive ? Math.sin((frame - fps * 1.2) * 0.5) * 20 * Math.exp(-(frame - fps * 1.2) * 0.02) : 0;
  const bellScale = spring({ frame: Math.max(0, frame - fps * 1.0), fps, config: { damping: 5, stiffness: 150 } });

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
      color: i % 4 === 0 ? pal.primary : i % 4 === 1 ? pal.secondary : i % 4 === 2 ? pal.accent : "#fff",
    };
  });

  // ─── Rising lines ─────────────────────────────
  const risingLines = Array.from({ length: 6 }, (_, i) => {
    const x = 15 + i * 14;
    const yOffset = ((frame * (1.5 + i * 0.3)) % 200) - 100;
    return { x, y: 100 - yOffset, opacity: interpolate(yOffset, [-100, 0, 100], [0, 0.08, 0]), height: 80 + i * 10 };
  });

  // ─── Typewriter ────────────────────────────────
  const channelName = "@AutoSports";
  const charsRevealed = interpolate(frame, [fps * 1.8, fps * 1.8 + channelName.length * 3], [0, channelName.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ─── Icons float ───────────────────────────────
  const iconSpring = spring({ frame: Math.max(0, frame - fps * 0.4), fps, config: { damping: 6, stiffness: 80 } });
  const iconFloat = Math.sin(frame * 0.05) * 8;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "60px" }}>
      {/* Orbiting particles */}
      {orbitParticles.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%", background: p.color, opacity: p.opacity, boxShadow: `0 0 ${p.size * 4}px ${p.color}` }} />
      ))}

      {/* Rising lines */}
      {risingLines.map((line, i) => (
        <div key={i} style={{ position: "absolute", left: `${line.x}%`, bottom: `${line.y}%`, width: "2px", height: `${line.height}px`, background: `linear-gradient(to top, transparent, ${pal.primary}${Math.round(line.opacity * 255).toString(16).padStart(2, "0")}, transparent)`, borderRadius: "1px" }} />
      ))}

      {/* Premium icon trio */}
      <div style={{ display: "flex", gap: "30px", marginBottom: "40px", transform: `scale(${iconSpring}) translateY(${iconFloat}px)` }}>
        <PremiumIcon name="trophy" size={56} color={pal.primary} glow={pal.glow} />
        <PremiumIcon name="fire" size={64} color={pal.secondary} glow={pal.glow} />
        <PremiumIcon name="star" size={56} color={pal.accent} glow={pal.glow} />
      </div>

      {/* CTA text */}
      <div style={{ transform: `perspective(600px) rotateX(${textRotateX}deg) scale(${textSpring})`, filter: `blur(${textBlur}px)`, textAlign: "center", marginBottom: "60px" }}>
        <div style={{ fontSize: "60px", fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: "#ffffff", textShadow: `0 0 30px ${pal.glow}, 0 0 60px ${pal.bg}, 0 6px 30px rgba(0,0,0,0.9)`, lineHeight: 1.15 }}>
          {text}
        </div>
      </div>

      {/* Subscribe button */}
      <div style={{ transform: `translateY(${btnY}px) scale(${btnSpring * pulse})`, display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ background: "linear-gradient(135deg, #FF0000, #CC0000)", color: "#ffffff", fontSize: "38px", fontWeight: 800, fontFamily: "'Outfit', sans-serif", padding: "22px 52px", borderRadius: "60px", boxShadow: `0 8px 30px rgba(255,0,0,0.5), 0 0 ${glowSize}px rgba(255,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)`, letterSpacing: "3px", textTransform: "uppercase" as const, border: "2px solid rgba(255,255,255,0.15)" }}>
          SUBSCRIBE
        </div>
        <div style={{ transform: `rotate(${bellRotate}deg) scale(${bellScale})`, display: "inline-flex" }}>
          <PremiumIcon name="star" size={52} color="#FFD700" glow="rgba(255,215,0,0.5)" />
        </div>
      </div>

      {/* Channel name typewriter */}
      <div style={{ position: "absolute", bottom: "140px", fontSize: "26px", fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "5px", textTransform: "uppercase" as const }}>
        {channelName.split("").map((char, i) => (
          <span key={i} style={{ opacity: i < charsRevealed ? 1 : 0, display: "inline-block" }}>{char}</span>
        ))}
        <span style={{ opacity: Math.sin(frame * 0.2) > 0 ? 0.6 : 0, color: pal.primary, marginLeft: "2px" }}>|</span>
      </div>
    </AbsoluteFill>
  );
};
