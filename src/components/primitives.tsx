import React from "react";
import { AbsoluteFill, useVideoConfig, useCurrentFrame } from "remotion";
import { C, clamp01, lerp, rand } from "../lib";

/**
 * Masked text reveal - word slides up into view with slight rotation
 * Inspired by claude-motion primitives
 */
export const MaskReveal: React.FC<{
  k: number;
  out?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  tilt?: number;
}> = ({ k, out = 0, children, style, tilt = 3 }) => (
  <span
    style={{
      display: "inline-block",
      overflow: k > 0.94 && out === 0 ? "visible" : "hidden",
      verticalAlign: "bottom",
      padding: "0.34em 0.14em 0.32em",
      margin: "-0.34em -0.14em -0.32em",
    }}
  >
    <span
      style={{
        display: "inline-block",
        transform: `translateY(${(1 - k - out) * 110}%) rotate(${(1 - k) * tilt}deg)`,
        transformOrigin: "0% 100%",
        ...style,
      }}
    >
      {children}
    </span>
  </span>
);

/**
 * Word-by-word staggered reveal
 */
export const StaggerText: React.FC<{
  text: string;
  progress: number;
  stagger?: number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
}> = ({ text, progress, stagger = 0.08, style, wordStyle }) => {
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2em", ...style }}>
      {words.map((word, i) => {
        const wordProgress = clamp01((progress - i * stagger) / (1 - words.length * stagger + stagger));
        return (
          <MaskReveal key={i} k={wordProgress}>
            <span style={wordStyle}>{word}</span>
          </MaskReveal>
        );
      })}
    </div>
  );
};

/**
 * Animated counter that rolls up from 0 to target
 */
export const Counter: React.FC<{
  value: number;
  progress: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: React.CSSProperties;
}> = ({ value, progress, prefix = "", suffix = "", decimals = 0, style }) => {
  const current = lerp(0, value, clamp01(progress));
  return (
    <span style={style}>
      {prefix}
      {current.toFixed(decimals)}
      {suffix}
    </span>
  );
};

/**
 * Film grain overlay
 */
export const Grain: React.FC<{ frame: number; opacity?: number }> = ({
  frame,
  opacity = 0.06,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}
    >
      <svg width={width} height={height}>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves={3}
            seed={Math.floor(frame / 2) % 97}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={width} height={height} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Scanlines overlay for retro/brutalist look
 */
export const Scanlines: React.FC<{ opacity?: number }> = ({
  opacity = 0.03,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <svg width={width} height={height}>
        <defs>
          <pattern
            id="scanlines"
            x="0"
            y="0"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <rect width="4" height="2" fill="black" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#scanlines)" />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Animated line that draws itself
 */
export const DrawLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  color?: string;
  width?: number;
}> = ({ x1, y1, x2, y2, progress, color = C.accent, width = 3 }) => {
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const p = clamp01(progress);
  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
      />
    </svg>
  );
};

/**
 * Glowing accent dot / circle
 */
export const GlowDot: React.FC<{
  x: number;
  y: number;
  size: number;
  progress: number;
  color?: string;
}> = ({ x, y, size, progress, color = C.accent }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      transform: `scale(${clamp01(progress)})`,
      boxShadow: `0 0 ${size}px ${size / 2}px ${color}40`,
    }}
  />
);

/**
 * Safe zone debug overlay (remove in production)
 */
export const SafeZoneDebug: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Top danger zone */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 150,
        background: "rgba(255,0,0,0.15)",
        borderBottom: "1px dashed rgba(255,0,0,0.5)",
      }}
    />
    {/* Bottom danger zone */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 380,
        background: "rgba(255,0,0,0.15)",
        borderTop: "1px dashed rgba(255,0,0,0.5)",
      }}
    />
    {/* Left danger zone */}
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 0,
        width: 120,
        bottom: 380,
        background: "rgba(255,0,0,0.08)",
        borderRight: "1px dashed rgba(255,0,0,0.3)",
      }}
    />
    {/* Right danger zone */}
    <div
      style={{
        position: "absolute",
        top: 150,
        right: 0,
        width: 150,
        bottom: 380,
        background: "rgba(255,0,0,0.08)",
        borderLeft: "1px dashed rgba(255,0,0,0.3)",
      }}
    />
  </AbsoluteFill>
);
