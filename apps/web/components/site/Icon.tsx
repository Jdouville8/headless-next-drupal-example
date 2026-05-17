// Icon.tsx
//
// Pure SVG icon set ported verbatim from `article-components.jsx`. No CSS
// module — sizing/color is controlled by props, and the SVG inherits color
// via `stroke="currentColor"` / `fill="currentColor"` by default.

import type { CSSProperties } from "react";

export type IconName =
  | "search"
  | "finder"
  | "map"
  | "tag"
  | "mail"
  | "home"
  | "chev"
  | "play"
  | "fb"
  | "x"
  | "li"
  | "email"
  | "print"
  | "link"
  | "yt"
  | "ig"
  | "arrow"
  | "up"
  | "chat";

export type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
};

export function Icon({
  name,
  size = 18,
  stroke = 1.6,
  color = "currentColor",
}: IconProps) {
  const strokeStyle: CSSProperties = {
    width: size,
    height: size,
    stroke: color,
    strokeWidth: stroke,
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    display: "block",
  };
  const filledStyle: CSSProperties = {
    width: size,
    height: size,
    fill: color,
    stroke: "none",
    display: "block",
  };

  switch (name) {
    case "search":
      return (
        <svg viewBox="0 0 24 24" style={strokeStyle}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "finder":
      return (
        <svg viewBox="0 0 24 24" style={strokeStyle}>
          <rect x="3" y="4" width="14" height="16" rx="1" />
          <path d="M7 8h6M7 12h6M7 16h4" />
          <path d="M17 10l4 4-4 4" />
        </svg>
      );
    case "map":
      return (
        <svg viewBox="0 0 24 24" style={strokeStyle}>
          <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z" />
          <path d="M9 3v16M15 5v16" />
        </svg>
      );
    case "tag":
      return (
        <svg viewBox="0 0 24 24" style={strokeStyle}>
          <path d="M3 12V4h8l10 10-8 8L3 12Z" />
          <circle cx="7.5" cy="7.5" r="1.5" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" style={strokeStyle}>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="m3 7 9 7 9-7" />
        </svg>
      );
    case "home":
      return (
        <svg viewBox="0 0 24 24" style={filledStyle}>
          <path d="M12 3 3 11h2v9h5v-5h4v5h5v-9h2L12 3Z" />
        </svg>
      );
    case "chev":
      return (
        <svg viewBox="0 0 24 24" style={strokeStyle}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 24 24" style={filledStyle}>
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    case "fb":
      return (
        <svg viewBox="0 0 24 24" style={filledStyle}>
          <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5Z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" style={filledStyle}>
          <path d="M17 4h3l-7 8 8 8h-6l-5-6-5 6H2l7-9-7-7h6l4 5 5-5Z" />
        </svg>
      );
    case "li":
      return (
        <svg viewBox="0 0 24 24" style={filledStyle}>
          <path d="M5 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-2 5h4v11H3V9Zm6 0h4v1.5c.7-1 2-1.8 3.5-1.8 3 0 3.5 2 3.5 4.5V20h-4v-5.6c0-1.4-.4-2.4-1.7-2.4-1.2 0-1.8.9-1.8 2.3V20H9V9Z" />
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" style={filledStyle}>
          <path d="M3 6h18v12H3V6Zm2 1v.4l7 4.6 7-4.6V7H5Z" />
        </svg>
      );
    case "print":
      return (
        <svg viewBox="0 0 24 24" style={filledStyle}>
          <path d="M7 3h10v5H7V3Zm-3 6h16v8h-3v4H7v-4H4V9Zm5 7h6v3H9v-3Z" />
        </svg>
      );
    case "link":
      return (
        <svg viewBox="0 0 24 24" style={strokeStyle}>
          <path d="M10 14a4 4 0 0 1 0-6l3-3a4 4 0 1 1 6 6l-1.5 1.5" />
          <path d="M14 10a4 4 0 0 1 0 6l-3 3a4 4 0 1 1-6-6l1.5-1.5" />
        </svg>
      );
    case "yt":
      return (
        <svg viewBox="0 0 24 24" style={filledStyle}>
          <path d="M22 8.5c-.2-1.4-.8-2.2-2.2-2.4C18 5.8 12 5.8 12 5.8s-6 0-7.8.3c-1.4.2-2 1-2.2 2.4C1.8 10.2 1.8 12 1.8 12s0 1.8.2 3.5c.2 1.4.8 2.2 2.2 2.4 1.8.3 7.8.3 7.8.3s6 0 7.8-.3c1.4-.2 2-1 2.2-2.4.2-1.7.2-3.5.2-3.5s0-1.8-.2-3.5ZM10 15V9l5 3-5 3Z" />
        </svg>
      );
    case "ig":
      return (
        <svg viewBox="0 0 24 24" style={strokeStyle}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r=".8" fill={color} />
        </svg>
      );
    case "arrow":
      return (
        <svg viewBox="0 0 24 24" style={strokeStyle}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "up":
      return (
        <svg viewBox="0 0 24 24" style={filledStyle}>
          <path d="m12 7-7 9h14l-7-9Z" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" style={filledStyle}>
          <path d="M3 4h18v13H8l-5 4V4Zm5 5v2h2V9H8Zm4 0v2h2V9h-2Zm4 0v2h2V9h-2Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default Icon;
