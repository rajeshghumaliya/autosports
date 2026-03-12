import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

interface TransitionProps {
  variant?: string;
}

export const Transition: React.FC<TransitionProps> = ({ variant = "slash" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.round(fps * 0.3);
  const mid = dur / 2;

  const renderVariant = () => {
    switch (variant) {
      // ─── WIPE: horizontal bar sweep ──────────────
      case "wipe": {
        const x = interpolate(frame, [0, mid, dur], [-110, 0, 110], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        const opacity = interpolate(frame, [0, mid * 0.4, mid, dur], [0, 1, 1, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        return (
          <>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.8), transparent)", transform: `translateX(${x}%)`, opacity }} />
            <div style={{ position: "absolute", top: "48%", left: 0, width: "100%", height: "4%", background: "#fff", transform: `translateX(${x * 1.1}%)`, opacity: opacity * 0.5 }} />
          </>
        );
      }

      // ─── SLASH: diagonal triple slash ─────────────
      case "slash": {
        const slashes = [
          { delay: 0, width: "120%", color: "rgba(255,215,0,0.9)", skew: -15 },
          { delay: 2, width: "60%", color: "rgba(255,107,53,0.7)", skew: -15 },
          { delay: 4, width: "30%", color: "rgba(255,255,255,0.4)", skew: -15 },
        ];
        return (
          <>
            {slashes.map((s, i) => {
              const f = Math.max(0, frame - s.delay);
              const x = interpolate(f, [0, mid, dur - s.delay], [-120, 0, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const o = interpolate(f, [0, mid * 0.5, mid, dur - s.delay], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return <div key={i} style={{ position: "absolute", top: 0, left: 0, width: s.width, height: "100%", background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, transform: `translateX(${x}%) skewX(${s.skew}deg)`, opacity: o }} />;
            })}
          </>
        );
      }

      // ─── ZOOM: radial zoom burst ─────────────────
      case "zoom": {
        const scale = interpolate(frame, [0, mid, dur], [3, 1, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const opacity = interpolate(frame, [0, mid * 0.3, mid, dur], [0, 0.8, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div style={{ position: "absolute", top: "50%", left: "50%", width: "200%", height: "200%", transform: `translate(-50%, -50%) scale(${scale})`, background: "radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 50%)", opacity }} />
        );
      }

      // ─── DISSOLVE: pixel/noise dissolve ───────────
      case "dissolve": {
        const opacity = interpolate(frame, [0, mid, dur], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const noiseOpacity = interpolate(frame, [0, mid * 0.5, mid, dur], [0, 0.3, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <>
            <AbsoluteFill style={{ background: "#0a0a0a", opacity }} />
            <AbsoluteFill style={{ opacity: noiseOpacity, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px", mixBlendMode: "screen" }} />
          </>
        );
      }

      // ─── FLASH: bright white flash ────────────────
      case "flash": {
        const flashOpacity = interpolate(frame, [0, 2, mid, dur], [0, 1, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const ringScale = interpolate(frame, [2, dur], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const ringOpacity = interpolate(frame, [2, dur], [0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <>
            <AbsoluteFill style={{ background: "#ffffff", opacity: flashOpacity }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", width: "200px", height: "200px", borderRadius: "50%", border: "3px solid rgba(255,215,0,0.8)", transform: `translate(-50%, -50%) scale(${ringScale})`, opacity: ringOpacity }} />
          </>
        );
      }

      // ─── GLITCH: digital glitch effect ────────────
      case "glitch": {
        const glitchActive = frame >= 2 && frame <= dur - 2;
        const offset1 = glitchActive ? Math.sin(frame * 5.7) * 30 : 0;
        const offset2 = glitchActive ? Math.cos(frame * 7.3) * 20 : 0;
        const skew = glitchActive ? Math.sin(frame * 3.1) * 5 : 0;
        const sliceHeight = 60 + Math.sin(frame * 4.2) * 40;
        const sliceY = 50 + Math.sin(frame * 6.8) * 40;
        const opacity = interpolate(frame, [0, 2, dur - 2, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
            {/* Red channel offset */}
            <div style={{ position: "absolute", top: `${sliceY}%`, left: 0, width: "100%", height: `${sliceHeight}px`, background: "rgba(255,0,0,0.3)", transform: `translateX(${offset1}px) skewX(${skew}deg)` }} />
            {/* Cyan channel offset */}
            <div style={{ position: "absolute", top: `${sliceY + 10}%`, left: 0, width: "100%", height: `${sliceHeight * 0.6}px`, background: "rgba(0,255,255,0.2)", transform: `translateX(${offset2}px) skewX(${-skew}deg)` }} />
            {/* Scan lines */}
            <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)", opacity: 0.6 }} />
          </AbsoluteFill>
        );
      }

      default:
        return null;
    }
  };

  // Flash overlay for slash/wipe variants
  const showFlash = variant === "slash" || variant === "wipe";

  return (
    <AbsoluteFill style={{ zIndex: 50, overflow: "hidden" }}>
      {renderVariant()}
      {showFlash && (
        <AbsoluteFill style={{ background: "#fff", opacity: interpolate(frame, [mid - 2, mid, mid + 4], [0, 0.25, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      )}
    </AbsoluteFill>
  );
};
