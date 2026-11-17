import React from "react";
import { C, F, clamp01, lerp } from "../lib";

/**
 * 1. VOX DIRECTOR PACK: Highlighter Stroke + Animated Donut/Ring Gauge + Line Chart
 */
export const VoxHighlighter: React.FC<{
  children: React.ReactNode;
  progress: number;
  color?: string;
  textColor?: string;
}> = ({ children, progress, color = C.yellow, textColor = C.ink }) => (
  <span style={{ position: "relative", display: "inline-block", padding: "2px 14px" }}>
    <span
      style={{
        position: "absolute",
        left: 0,
        bottom: 4,
        width: `${clamp01(progress) * 100}%`,
        height: "86%",
        backgroundColor: color,
        borderRadius: 4,
        zIndex: 0,
      }}
    />
    <span style={{ position: "relative", zIndex: 1, color: textColor }}>{children}</span>
  </span>
);

export const AnimatedDonutGauge: React.FC<{
  percent: number; // 0..100
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}> = ({ percent, progress, size = 160, strokeWidth = 16, color = C.accent, label }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const currentPct = clamp01(progress) * (percent / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - currentPct)}
        />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontFamily: F.display, fontSize: size * 0.24, color: C.white }}>
          {Math.round(lerp(0, percent, clamp01(progress)))}%
        </div>
        {label && (
          <div style={{ fontFamily: F.mono, fontSize: size * 0.09, color: C.creamDim }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 2. PERSPECTIVEMOCK & HOLO CARD STUDIO PACK: 3D Tilt Container + Holographic Glare
 */
export const Perspective3DCard: React.FC<{
  children: React.ReactNode;
  frame: number;
  entranceProgress: number;
  intensity?: number;
  glare?: boolean;
  style?: React.CSSProperties;
}> = ({ children, frame, entranceProgress, intensity = 7, glare = true, style }) => {
  const t = frame / 30;
  const rx = Math.sin(t * 2.2) * intensity;
  const ry = Math.cos(t * 1.8) * (intensity * 1.2);
  const glarePos = ((Math.sin(t * 2.0) + 1) / 2) * 100;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        transform: `perspective(950px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${(1 - clamp01(entranceProgress)) * 70}px) scale(${0.88 + 0.12 * clamp01(entranceProgress)})`,
        opacity: clamp01(entranceProgress),
        ...style,
      }}
    >
      {children}
      {glare && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(115deg, transparent ${glarePos - 25}%, rgba(255,255,255,0.14) ${glarePos}%, transparent ${glarePos + 25}%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
