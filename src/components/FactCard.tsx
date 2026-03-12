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

interface FactCardProps {
  rank: number;
  heading: string;
  text: string;
  highlight: string;
  icon: string;
  totalFacts: number;
  animation?: string;
  themeColors?: ThemeColors;
}

// ─── Animation Variants ──────────────────────────────────────
function useEntrance(
  variant: string,
  frame: number,
  fps: number
): { transform: string; opacity: number; filter: string } {
  const progress = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 60, mass: 0.7 },
  });

  switch (variant) {
    case "slideLeft": {
      const x = interpolate(progress, [0, 1], [-600, 0]);
      const rotate = interpolate(progress, [0, 1], [-8, 0]);
      return {
        transform: `translateX(${x}px) rotate(${rotate}deg) scale(${0.8 + progress * 0.2})`,
        opacity: progress,
        filter: `blur(${(1 - progress) * 12}px)`,
      };
    }
    case "zoomIn": {
      const s = interpolate(progress, [0, 1], [0.2, 1]);
      const rot = interpolate(progress, [0, 1], [15, 0]);
      return {
        transform: `scale(${s}) rotate(${rot}deg)`,
        opacity: interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        filter: `blur(${(1 - progress) * 20}px)`,
      };
    }
    case "flipIn": {
      const rotX = interpolate(progress, [0, 1], [90, 0]);
      return {
        transform: `perspective(1000px) rotateX(${rotX}deg) scale(${progress})`,
        opacity: interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
        filter: `blur(${(1 - progress) * 8}px)`,
      };
    }
    case "fadeUp": {
      const y = interpolate(progress, [0, 1], [200, 0]);
      return {
        transform: `translateY(${y}px) scale(${0.9 + progress * 0.1})`,
        opacity: progress,
        filter: "none",
      };
    }
    case "bounceIn": {
      const bounce = spring({
        frame,
        fps,
        config: { damping: 4, stiffness: 120, mass: 0.5 },
      });
      return {
        transform: `scale(${bounce}) rotate(${(1 - bounce) * -10}deg)`,
        opacity: interpolate(bounce, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
        filter: "none",
      };
    }
    case "spiralIn": {
      const rot = interpolate(progress, [0, 1], [360, 0]);
      const s = interpolate(progress, [0, 1], [0, 1]);
      return {
        transform: `rotate(${rot}deg) scale(${s})`,
        opacity: interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        filter: `blur(${(1 - progress) * 15}px)`,
      };
    }
    default:
      return {
        transform: `translateY(${(1 - progress) * 150}px)`,
        opacity: progress,
        filter: "none",
      };
  }
}

export const FactCard: React.FC<FactCardProps> = ({
  rank,
  heading,
  text,
  highlight,
  icon,
  totalFacts,
  animation = "fadeUp",
  themeColors,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Default theme
  const pal = themeColors || {
    primary: "#FFD700",
    secondary: "#FF8C00",
    accent: "#FFA500",
    bg: "rgba(255,215,0,0.08)",
    glow: "rgba(255,215,0,0.6)",
  };

  // ─── Card entrance animation (dynamic) ─────────
  const entrance = useEntrance(animation, Math.max(0, frame - 8), fps);

  // ─── Rank badge spring ─────────────────────────
  const rankSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 50, mass: 1.2 },
  });
  const rankFloat = Math.sin(frame * 0.04) * 5;

  // ─── Border glow rotation ─────────────────────
  const borderAngle = (frame * 2) % 360;

  // ─── Heading: letter-by-letter ─────────────────
  const headingChars = heading.split("");
  const charsRevealed = interpolate(
    frame,
    [15, 15 + headingChars.length * 1.5],
    [0, headingChars.length],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ─── Underline spring ─────────────────────────
  const underlineSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // ─── Number count-up ──────────────────────────
  const highlightNum = parseFloat(highlight.replace(/[^0-9.]/g, ""));
  const isNumeric = !isNaN(highlightNum);
  const countRaw = interpolate(frame, [25, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const countProgress = Easing.out(Easing.cubic)(countRaw);
  const currentNum = isNumeric ? Math.round(highlightNum * countProgress) : 0;
  const displayNum = isNumeric ? currentNum.toLocaleString() : highlight;
  const highlightSuffix = isNumeric ? highlight.replace(/[0-9.,]/g, "").trim() : "";
  const numLanded = countRaw >= 0.99;
  const numPulse = numLanded
    ? 1 + Math.sin((frame - fps * 2.5) * 0.3) * 0.03
    : interpolate(countRaw, [0, 1], [0.7, 1]);
  const glowPulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [15, 45]);

  // ─── Icon entrance ────────────────────────────
  const iconSpring = spring({
    frame: Math.max(0, frame - fps * 2.8),
    fps,
    config: { damping: 5, stiffness: 120, mass: 0.5 },
  });
  const iconRotate = interpolate(iconSpring, [0, 1], [180, 0]);
  const iconFloat = Math.sin(frame * 0.06) * 4;

  // ─── Description fade ─────────────────────────
  const descOpacity = interpolate(frame, [fps * 1.5, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const descY = interpolate(frame, [fps * 1.5, fps * 2], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // ─── Sparkle ring around stat ──────────────────
  const sparkles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 + frame * 0.05;
    const dist = 60 + Math.sin(frame * 0.08 + i) * 20;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 2 + Math.sin(frame * 0.1 + i * 0.8) * 1.5,
      opacity: numLanded ? 0.3 + Math.sin(frame * 0.12 + i) * 0.2 : 0,
    };
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 44px",
      }}
    >
      {/* Giant rank watermark */}
      <div
        style={{
          position: "absolute",
          top: "120px",
          left: "-20px",
          fontSize: "280px",
          fontWeight: 900,
          fontFamily: "'Outfit', sans-serif",
          color: pal.primary,
          opacity: 0.05,
          transform: `translateX(${(1 - rankSpring) * -400}px) translateY(${rankFloat}px) rotate(-8deg)`,
          filter: `blur(${(1 - rankSpring) * 20}px)`,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        #{rank}
      </div>

      {/* Animated card container */}
      <div
        style={{
          transform: entrance.transform,
          opacity: entrance.opacity,
          filter: entrance.filter,
          width: "100%",
          maxWidth: "980px",
        }}
      >
        {/* Rank badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${pal.primary}, ${pal.secondary})`,
              color: "#000",
              fontSize: "34px",
              fontWeight: 900,
              fontFamily: "'Outfit', sans-serif",
              padding: "10px 28px",
              borderRadius: "14px",
              boxShadow: `0 4px 20px ${pal.glow}, 0 0 40px ${pal.bg}`,
              transform: `scale(${rankSpring})`,
            }}
          >
            #{rank}
          </div>
          <div style={{ fontSize: "24px", color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            of {totalFacts}
          </div>
        </div>

        {/* Glassmorphism card */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "28px",
            border: "1.5px solid rgba(255,255,255,0.1)",
            padding: "44px",
            boxShadow: `0 12px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 80px ${pal.bg}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Rotating border glow */}
          <div
            style={{
              position: "absolute",
              top: -2, left: -2, right: -2, bottom: -2,
              borderRadius: "30px",
              background: `conic-gradient(from ${borderAngle}deg, transparent 0%, ${pal.primary}33 8%, transparent 16%)`,
              zIndex: -1,
            }}
          />

          {/* Heading: letter reveal */}
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                fontSize: "44px",
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                color: "#ffffff",
                lineHeight: 1.15,
                textShadow: "0 2px 15px rgba(0,0,0,0.6)",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {headingChars.map((char, i) => {
                const revealed = i < charsRevealed;
                const justRevealed = Math.abs(i - charsRevealed) < 1;
                return (
                  <span
                    key={i}
                    style={{
                      opacity: revealed ? 1 : 0,
                      transform: revealed
                        ? `translateY(0) scale(${justRevealed ? 1.15 : 1})`
                        : "translateY(20px) scale(0.8)",
                      color: justRevealed ? pal.primary : "#ffffff",
                      display: "inline-block",
                      whiteSpace: char === " " ? "pre" : undefined,
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
            <div
              style={{
                height: "4px",
                width: `${underlineSpring * 100}%`,
                background: `linear-gradient(90deg, ${pal.primary}, ${pal.primary}00)`,
                borderRadius: "2px",
                marginTop: "10px",
                boxShadow: `0 0 12px ${pal.glow}`,
              }}
            />
          </div>

          {/* Highlight + Icon */}
          <div style={{ position: "relative", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
            {sparkles.map((s, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `calc(30% + ${s.x}px)`,
                  top: `calc(50% + ${s.y}px)`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  borderRadius: "50%",
                  background: pal.primary,
                  opacity: s.opacity,
                  boxShadow: `0 0 ${s.size * 3}px ${pal.glow}`,
                }}
              />
            ))}

            <span
              style={{
                fontSize: "100px",
                fontWeight: 900,
                fontFamily: "'Outfit', sans-serif",
                color: pal.primary,
                textShadow: `0 0 ${glowPulse}px ${pal.glow}, 0 0 ${glowPulse * 2}px ${pal.bg}, 0 4px 25px rgba(0,0,0,0.7)`,
                lineHeight: 1,
                transform: `scale(${numPulse})`,
                display: "inline-block",
              }}
            >
              {displayNum}
            </span>
            {highlightSuffix && (
              <span style={{ fontSize: "42px", fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: `${pal.primary}CC`, opacity: countRaw > 0.3 ? 1 : 0 }}>
                {highlightSuffix}
              </span>
            )}

            {/* Premium Icon instead of emoji */}
            <div
              style={{
                transform: `scale(${iconSpring}) rotate(${iconRotate}deg) translateY(${iconFloat}px)`,
                display: "inline-block",
                marginLeft: "8px",
              }}
            >
              <PremiumIcon name={icon || "star"} size={72} color={pal.primary} glow={pal.glow} />
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 400,
              fontFamily: "'Inter', sans-serif",
              color: "rgba(255,255,255,0.88)",
              lineHeight: 1.55,
              textShadow: "0 1px 10px rgba(0,0,0,0.6)",
              opacity: descOpacity,
              transform: `translateY(${descY}px)`,
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
