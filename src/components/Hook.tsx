import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { PremiumIcon } from "./PremiumIcon";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  glow: string;
}

interface HookProps {
  text: string;
  title: string;
  themeColors?: ThemeColors;
  icon?: string;
}

export const Hook: React.FC<HookProps> = ({ text, title, themeColors, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pal = themeColors || {
    primary: "#FFD700", secondary: "#FF8C00", accent: "#FFA500",
    bg: "rgba(255,215,0,0.08)", glow: "rgba(255,215,0,0.6)",
  };

  // ─── Background flash burst ────────────────────
  const flashOpacity = interpolate(frame, [0, 8, 20], [1, 0.6, 0], { extrapolateRight: "clamp" });
  const flashScale = interpolate(frame, [0, 20], [0.5, 3], { extrapolateRight: "clamp" });

  // ─── Title: 3D scale-in with overshoot ─────────
  const titleSpring = spring({ frame, fps, config: { damping: 6, stiffness: 60, mass: 0.8 } });
  const titleRotateX = interpolate(titleSpring, [0, 1], [90, 0]);
  const titleBlur = interpolate(frame, [0, fps * 0.4], [15, 0], { extrapolateRight: "clamp" });

  // ─── Shake on land ─────────────────────────────
  const shakePhase = Math.max(0, frame - fps * 0.3);
  const shakeDecay = Math.exp(-shakePhase * 0.08);
  const shakeX = Math.sin(shakePhase * 2.5) * 12 * shakeDecay;
  const shakeY = Math.cos(shakePhase * 3.1) * 6 * shakeDecay;

  // ─── Glow pulse ────────────────────────────────
  const glowRadius = interpolate(Math.sin(frame * 0.08), [-1, 1], [15, 50]);
  const glowOpacity = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.4, 0.9]);

  // ─── Hook text spring ─────────────────────────
  const hookSpring = spring({ frame: Math.max(0, frame - fps * 0.8), fps, config: { damping: 8, stiffness: 80, mass: 0.6 } });
  const hookY = interpolate(hookSpring, [0, 1], [120, 0]);
  const hookScale = interpolate(hookSpring, [0, 1], [0.8, 1]);

  // ─── Border sweep ─────────────────────────────
  const borderAngle = interpolate(frame, [fps * 0.8, fps * 2.5], [0, 360], { extrapolateLeft: "clamp", extrapolateRight: "extend" });

  // ─── Particles ─────────────────────────────────
  const particles = Array.from({ length: 20 }, (_, i) => {
    const speed = 0.015 + (i % 5) * 0.005;
    const radius = 30 + (i % 7) * 8;
    const phase = (i * Math.PI * 2) / 20;
    return {
      x: 50 + Math.sin(frame * speed + phase) * radius,
      y: 50 + Math.cos(frame * speed * 0.7 + phase) * radius * 1.2,
      size: 2 + Math.sin(frame * 0.03 + i) * 1.5,
      opacity: 0.08 + Math.sin(frame * 0.04 + i * 0.5) * 0.06,
    };
  });

  // ─── Cinematic bars ────────────────────────────
  const barHeight = interpolate(frame, [0, fps * 0.5], [200, 60], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // ─── Icon spring ───────────────────────────────
  const iconSpring = spring({ frame: Math.max(0, frame - fps * 1.2), fps, config: { damping: 6, stiffness: 100, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "60px" }}>
      {/* Radial flash */}
      <div style={{ position: "absolute", width: "100%", height: "100%", background: `radial-gradient(circle, ${pal.primary}${Math.round(flashOpacity * 255).toString(16).padStart(2, "0")} 0%, ${pal.secondary}${Math.round(flashOpacity * 128).toString(16).padStart(2, "0")} 30%, transparent 60%)`, transform: `scale(${flashScale})` }} />

      {/* Particles */}
      {particles.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%", background: i % 3 === 0 ? pal.primary : i % 3 === 1 ? pal.secondary : pal.accent, opacity: p.opacity, boxShadow: `0 0 ${p.size * 4}px currentColor` }} />
      ))}

      {/* Cinematic bars */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${barHeight}px`, background: "#000", zIndex: 10 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${barHeight}px`, background: "#000", zIndex: 10 }} />

      {/* Title with 3D flip */}
      <div style={{ transform: `translateX(${shakeX}px) translateY(${shakeY}px) perspective(800px) rotateX(${titleRotateX}deg) scale(${titleSpring})`, filter: `blur(${titleBlur}px)`, textAlign: "center", marginBottom: "30px" }}>
        <div style={{ fontSize: "76px", fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: "#ffffff", textShadow: `0 0 ${glowRadius}px ${pal.glow}, 0 0 ${glowRadius * 2}px ${pal.bg}, 0 6px 30px rgba(0,0,0,0.9)`, lineHeight: 1.05, letterSpacing: "-3px" }}>
          {title}
        </div>
      </div>

      {/* Premium Icon */}
      {icon && (
        <div style={{ transform: `scale(${iconSpring})`, marginBottom: "30px" }}>
          <PremiumIcon name={icon} size={80} color={pal.primary} glow={pal.glow} />
        </div>
      )}

      {/* Hook text */}
      <div style={{ transform: `translateY(${hookY}px) scale(${hookScale})`, opacity: interpolate(hookSpring, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }), textAlign: "center" }}>
        <div style={{ fontSize: "44px", fontWeight: 700, fontFamily: "'Inter', sans-serif", color: pal.primary, textShadow: `0 2px 20px rgba(0,0,0,0.9), 0 0 40px ${pal.bg}`, padding: "24px 36px", background: pal.bg, borderRadius: "20px", border: `2px solid ${pal.primary}40`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.4)`, backgroundImage: `conic-gradient(from ${borderAngle}deg, transparent 0%, ${pal.primary}20 10%, transparent 20%)` }}>
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
