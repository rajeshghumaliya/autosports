import React from "react";

// ─── Premium SVG Icons ──────────────────────────────────────
// Hand-crafted, clean, premium look — no cheap emojis

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  glow?: string;
}

const iconPaths: Record<string, React.ReactNode> = {
  fire: (
    <>
      <path d="M12 2C10.5 5.5 8 8 8 11.5C8 14 9.5 16 12 17C14.5 16 16 14 16 11.5C16 8 13.5 5.5 12 2Z" fill="currentColor" opacity="0.9" />
      <path d="M12 6C11 8 10 9.5 10 11.5C10 13 11 14 12 14.5C13 14 14 13 14 11.5C14 9.5 13 8 12 6Z" fill="currentColor" opacity="0.5" />
      <path d="M9 18C8 19 8 20 9.5 21C10 21.5 11 22 12 22C13 22 14 21.5 14.5 21C16 20 16 19 15 18C14.5 18.5 13.5 19 12 19C10.5 19 9.5 18.5 9 18Z" fill="currentColor" opacity="0.7" />
    </>
  ),
  trophy: (
    <>
      <path d="M6 4H18V6C18 9.31 15.31 12 12 12C8.69 12 6 9.31 6 6V4Z" fill="currentColor" opacity="0.9" />
      <path d="M4 4H6V7C6 7 4.5 7 4 6C3.5 5 4 4 4 4Z" fill="currentColor" opacity="0.6" />
      <path d="M18 4H20C20 4 20.5 5 20 6C19.5 7 18 7 18 7V4Z" fill="currentColor" opacity="0.6" />
      <path d="M10 12H14V14H10V12Z" fill="currentColor" opacity="0.8" />
      <path d="M8 14H16V16C16 16 15 17 12 17C9 17 8 16 8 16V14Z" fill="currentColor" opacity="0.7" />
      <path d="M9 17H15V19H9V17Z" fill="currentColor" opacity="0.5" />
      <path d="M7 19H17V21H7V19Z" fill="currentColor" opacity="0.8" />
    </>
  ),
  crown: (
    <>
      <path d="M3 18L5 8L9 12L12 6L15 12L19 8L21 18H3Z" fill="currentColor" opacity="0.9" />
      <path d="M5 8L5.5 9L9 12L5 8Z" fill="currentColor" opacity="0.5" />
      <path d="M19 8L18.5 9L15 12L19 8Z" fill="currentColor" opacity="0.5" />
      <circle cx="5" cy="7" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="19" cy="7" r="1.5" fill="currentColor" opacity="0.8" />
      <path d="M4 18H20V20C20 20 18 21 12 21C6 21 4 20 4 20V18Z" fill="currentColor" opacity="0.7" />
    </>
  ),
  bolt: (
    <>
      <path d="M13 2L4 14H11L10 22L20 10H13L13 2Z" fill="currentColor" opacity="0.9" />
      <path d="M13 2L11 8H13L13 2Z" fill="currentColor" opacity="0.5" />
      <path d="M11 14L10 22L14 15H11Z" fill="currentColor" opacity="0.6" />
    </>
  ),
  explosion: (
    <>
      <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.9" />
      <path d="M12 2L13 7L12 5L11 7L12 2Z" fill="currentColor" opacity="0.7" />
      <path d="M22 12L17 13L19 12L17 11L22 12Z" fill="currentColor" opacity="0.7" />
      <path d="M12 22L11 17L12 19L13 17L12 22Z" fill="currentColor" opacity="0.7" />
      <path d="M2 12L7 11L5 12L7 13L2 12Z" fill="currentColor" opacity="0.7" />
      <path d="M18.5 5.5L15 9L16 7.5L14.5 8L18.5 5.5Z" fill="currentColor" opacity="0.6" />
      <path d="M5.5 5.5L9 9L7.5 8L8 9.5L5.5 5.5Z" fill="currentColor" opacity="0.6" />
      <path d="M18.5 18.5L15 15L16 16.5L14.5 16L18.5 18.5Z" fill="currentColor" opacity="0.6" />
      <path d="M5.5 18.5L9 15L8 16L9.5 16L5.5 18.5Z" fill="currentColor" opacity="0.6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" strokeWidth="1.5" opacity="0.4" />
      <circle cx="12" cy="12" r="7" stroke="currentColor" fill="none" strokeWidth="1.5" opacity="0.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" fill="none" strokeWidth="1.5" opacity="0.8" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="1" />
    </>
  ),
  star: (
    <>
      <path d="M12 2L14.5 8.5L21.5 9.3L16.5 14L17.8 21L12 17.5L6.2 21L7.5 14L2.5 9.3L9.5 8.5L12 2Z" fill="currentColor" opacity="0.9" />
      <path d="M12 2L14.5 8.5L12 7L9.5 8.5L12 2Z" fill="currentColor" opacity="0.5" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2C12 2 8 6 8 14L10 16H14L16 14C16 6 12 2 12 2Z" fill="currentColor" opacity="0.9" />
      <path d="M8 14L5 17L8 16V14Z" fill="currentColor" opacity="0.7" />
      <path d="M16 14L19 17L16 16V14Z" fill="currentColor" opacity="0.7" />
      <circle cx="12" cy="10" r="2" fill="currentColor" opacity="0.4" />
      <path d="M10 16L11 22H13L14 16H10Z" fill="currentColor" opacity="0.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2L4 6V12C4 17 8 20.5 12 22C16 20.5 20 17 20 12V6L12 2Z" fill="currentColor" opacity="0.8" />
      <path d="M12 4L6 7.5V12C6 16 9 19 12 20.5C15 19 18 16 18 12V7.5L12 4Z" fill="currentColor" opacity="0.3" />
      <path d="M12 8L14 12L12 11L10 12L12 8Z" fill="currentColor" opacity="0.9" />
    </>
  ),
  swords: (
    <>
      <path d="M5 3L15 13L13 15L3 5L5 3Z" fill="currentColor" opacity="0.9" />
      <path d="M3 5L2 8L5 7L3 5Z" fill="currentColor" opacity="0.7" />
      <path d="M19 3L9 13L11 15L21 5L19 3Z" fill="currentColor" opacity="0.9" />
      <path d="M21 5L22 8L19 7L21 5Z" fill="currentColor" opacity="0.7" />
      <path d="M7 17L5 19L6 21L8 20L10 18L8 16L7 17Z" fill="currentColor" opacity="0.7" />
      <path d="M17 17L19 19L18 21L16 20L14 18L16 16L17 17Z" fill="currentColor" opacity="0.7" />
    </>
  ),
};

export const PremiumIcon: React.FC<IconProps> = ({
  name,
  size = 64,
  color = "#FFD700",
  glow = "rgba(255,215,0,0.5)",
}) => {
  const paths = iconPaths[name] || iconPaths.star;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        filter: `drop-shadow(0 0 ${size * 0.3}px ${glow}) drop-shadow(0 0 ${size * 0.15}px ${glow})`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ color }}
      >
        {paths}
      </svg>
    </div>
  );
};

export default PremiumIcon;
