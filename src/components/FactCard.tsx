import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

interface FactCardProps {
  rank: number;
  heading: string;
  text: string;
  highlight: string;
  emoji: string;
  totalFacts: number;
}

export const FactCard: React.FC<FactCardProps> = ({
  rank,
  heading,
  text,
  highlight,
  emoji,
  totalFacts,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── Color palette per rank ────────────────────
  const palettes: Record<number, { primary: string; glow: string; bg: string }> = {
    1: { primary: "#FFD700", glow: "rgba(255,215,0,0.6)", bg: "rgba(255,215,0,0.08)" },
    2: { primary: "#FF6B35", glow: "rgba(255,107,53,0.6)", bg: "rgba(255,107,53,0.08)" },
    3: { primary: "#00E676", glow: "rgba(0,230,118,0.6)", bg: "rgba(0,230,118,0.08)" },
    4: { primary: "#448AFF", glow: "rgba(68,138,255,0.6)", bg: "rgba(68,138,255,0.08)" },
    5: { primary: "#E040FB", glow: "rgba(224,64,251,0.6)", bg: "rgba(224,64,251,0.08)" },
  };
  const pal = palettes[rank] || palettes[1];

  // ─── Giant rank number: 3D fly-in from left ────
  const rankSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 50, mass: 1.2 },
  });
  const rankX = interpolate(rankSpring, [0, 1], [-400, 0]);
  const rankRotateZ = interpolate(rankSpring, [0, 1], [-30, -8]);
  const rankBlur = interpolate(rankSpring, [0, 0.5], [20, 0], {
    extrapolateRight: "clamp",
  });
  // Subtle float after landing
  const rankFloat = Math.sin(frame * 0.04) * 5;

  // ─── Card: slide up + scale with elastic ───────
  const cardSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 7, stiffness: 70, mass: 0.7 },
  });
  const cardY = interpolate(cardSpring, [0, 1], [250, 0]);
  const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ─── Card border glow rotation ─────────────────
  const borderAngle = (frame * 2) % 360;

  // ─── Heading: letter-by-letter reveal ──────────
  const headingChars = heading.split("");
  const charsRevealed = interpolate(
    frame,
    [15, 15 + headingChars.length * 1.5],
    [0, headingChars.length],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ─── Underline: grow with bounce ───────────────
  const underlineSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // ─── Highlight number: count-up + scale pulse ──
  const highlightNum = parseFloat(highlight.replace(/[^0-9.]/g, ""));
  const isNumeric = !isNaN(highlightNum);
  const countEasing = Easing.out(Easing.cubic);
  const countRaw = interpolate(frame, [25, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const countProgress = countEasing(countRaw);
  const currentNum = isNumeric
    ? Math.round(highlightNum * countProgress)
    : 0;
  const displayNum = isNumeric ? currentNum.toLocaleString() : highlight;
  const highlightSuffix = isNumeric ? highlight.replace(/[0-9.,]/g, "").trim() : "";

  // Number lands with a pulse
  const numLanded = countRaw >= 0.99;
  const numPulse = numLanded
    ? 1 + Math.sin((frame - fps * 2.5) * 0.3) * 0.03
    : interpolate(countRaw, [0, 1], [0.7, 1]);

  // ─── Highlight glow ───────────────────────────
  const glowPulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [15, 45]);

  // ─── Emoji: spring bounce-in from 0 ────────────
  const emojiSpring = spring({
    frame: Math.max(0, frame - fps * 2.8),
    fps,
    config: { damping: 5, stiffness: 120, mass: 0.5 },
  });
  const emojiRotate = interpolate(emojiSpring, [0, 1], [180, 0]);

  // ─── Description text: fade in line by line ────
  const descOpacity = interpolate(frame, [fps * 1.5, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const descY = interpolate(frame, [fps * 1.5, fps * 2], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // ─── Sparkle particles around highlight ────────
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
          opacity: 0.07,
          transform: `translateX(${rankX}px) translateY(${rankFloat}px) rotate(${rankRotateZ}deg)`,
          filter: `blur(${rankBlur}px)`,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        #{rank}
      </div>

      {/* Main card container */}
      <div
        style={{
          transform: `translateY(${cardY}px) scale(${cardScale})`,
          opacity: cardOpacity,
          width: "100%",
          maxWidth: "980px",
        }}
      >
        {/* Rank badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${pal.primary}, ${pal.primary}CC)`,
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
          <div
            style={{
              fontSize: "24px",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}
          >
            of {totalFacts}
          </div>
        </div>

        {/* Glassmorphism card */}
        <div
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))`,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "28px",
            border: `1.5px solid rgba(255,255,255,0.1)`,
            padding: "44px",
            boxShadow: `
              0 12px 60px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.12),
              0 0 80px ${pal.bg}
            `,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Rotating border glow */}
          <div
            style={{
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: "30px",
              background: `conic-gradient(from ${borderAngle}deg, transparent 0%, ${pal.primary}33 8%, transparent 16%)`,
              zIndex: -1,
            }}
          />

          {/* Heading with letter reveal */}
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
            {/* Animated underline */}
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

          {/* Highlight number with sparkles */}
          <div
            style={{
              position: "relative",
              marginBottom: "24px",
              display: "flex",
              alignItems: "baseline",
              gap: "10px",
            }}
          >
            {/* Sparkle particles */}
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
                textShadow: `
                  0 0 ${glowPulse}px ${pal.glow},
                  0 0 ${glowPulse * 2}px ${pal.bg},
                  0 4px 25px rgba(0,0,0,0.7)
                `,
                lineHeight: 1,
                transform: `scale(${numPulse})`,
                display: "inline-block",
              }}
            >
              {displayNum}
            </span>
            {highlightSuffix && (
              <span
                style={{
                  fontSize: "42px",
                  fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif",
                  color: `${pal.primary}CC`,
                  opacity: countRaw > 0.3 ? 1 : 0,
                }}
              >
                {highlightSuffix}
              </span>
            )}
            <span
              style={{
                fontSize: "72px",
                transform: `scale(${emojiSpring}) rotate(${emojiRotate}deg)`,
                display: "inline-block",
                filter: `drop-shadow(0 0 10px ${pal.glow})`,
              }}
            >
              {emoji}
            </span>
          </div>

          {/* Description text */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 400,
              fontFamily: "'Inter', sans-serif",
              color: "rgba(255, 255, 255, 0.88)",
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
