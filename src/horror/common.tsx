import React from "react";
import { useCurrentFrame, useVideoConfig, random, spring, Easing, staticFile } from "remotion";
import { STORY } from "../storyTimeline";
import { F } from "../lib";

export const HC = {
  bg: "#04060A",
  ink: "#0A0E16",
  red: "#E5202E",
  redDeep: "#6E0E17",
  amber: "#FFB454",
  teal: "#6FD3C4",
  ice: "#BFD7E6",
  paper: "#EAE5D9",
  yellow: "#FFD84A",
  dim: "rgba(234,229,217,0.55)",
};

export const M: Record<string, number> = STORY.marks as unknown as Record<string, number>;
export const TOTAL_SEC: number = STORY.total;
export const FPS_ = 30;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
export const eo = (t: number, a: number, b: number) => easeOut(ramp(t, a, b));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/** spring "bật" bắt đầu tại thời điểm a (giây) */
export const useSpringAt = (a: number, cfg?: { damping?: number; stiffness?: number; mass?: number }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: Math.max(0, f - a * fps),
    fps,
    config: { damping: 13, stiffness: 170, mass: 0.7, ...cfg },
  });
};

/** Khung cảnh: hiện trong [a, b], mờ vào/ra */
export const Scene: React.FC<{ a: number; b: number; fadeIn?: number; fadeOut?: number; children: React.ReactNode }> = ({
  a,
  b,
  fadeIn = 0.35,
  fadeOut = 0.35,
  children,
}) => {
  const t = useT();
  if (t < a - 0.02 || t > b + fadeOut) return null;
  const o = Math.min(ramp(t, a, a + fadeIn), 1 - ramp(t, b, b + fadeOut));
  return <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>;
};

/** Rung ngẫu nhiên (deterministic) */
export const shake = (frame: number, amp: number, seed = "s") => ({
  x: (random(`${seed}x${frame}`) - 0.5) * 2 * amp,
  y: (random(`${seed}y${frame}`) - 0.5) * 2 * amp,
});

export const Tag: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = HC.dim,
  size = 26,
  style,
}) => (
  <div
    style={{
      fontFamily: F.mono,
      fontSize: size,
      letterSpacing: 4,
      color,
      textTransform: "uppercase",
      fontWeight: 700,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 120,
  color = HC.paper,
  style,
}) => (
  <div
    style={{
      fontFamily: F.display,
      fontSize: size,
      lineHeight: 1.05,
      color,
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: -2,
      textShadow: "0 6px 30px rgba(0,0,0,0.55)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** nền tối + gradient lạnh dùng chung */
export const Bg: React.FC<{ tint?: string; y?: number; intensity?: number }> = ({ tint = "#10202B", y = 38, intensity = 1 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse 90% 60% at 50% ${y}%, ${tint} 0%, rgba(4,6,10,0) ${60 * intensity + 20}%), ${HC.bg}`,
    }}
  />
);

export const noiseUrl = () => staticFile("img/noise.png");
