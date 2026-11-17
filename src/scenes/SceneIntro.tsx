import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { C, F, W, H, SAFE, FPS, sp, prog, SPRING, clamp01, rand } from "../lib";
import { MaskReveal, StaggerText, DrawLine, GlowDot } from "../components/primitives";

/**
 * Scene 0: Hook Intro (0 - 1.5s)
 * Bold text slam with accent line. 
 * Style: Brutalist, high-contrast, fast entry.
 */
export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // Main title slam
  const titleIn = sp(frame, 0.1, SPRING.snappy);
  const lineIn = prog(t, 0.3, 0.8, Easing.bezier(0.16, 1, 0.3, 1));
  const subtitleIn = sp(frame, 0.5, SPRING.default);
  const bgFlash = interpolate(frame, [0, 3, 8], [1, 0.95, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: `${SAFE.top + 40}px ${SAFE.right + 20}px ${SAFE.bottom + 40}px ${SAFE.left + 20}px`,
      }}
    >
      {/* Background pulse on entry */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 45%, ${C.accent}15 0%, transparent 70%)`,
          opacity: bgFlash,
        }}
      />

      {/* Accent line */}
      <div
        style={{
          width: 300 * lineIn,
          height: 4,
          backgroundColor: C.accent,
          marginBottom: 24,
          borderRadius: 2,
        }}
      />

      {/* Main title */}
      <div
        style={{
          fontFamily: F.display,
          fontSize: 72,
          fontWeight: 900,
          color: C.white,
          textTransform: "uppercase",
          letterSpacing: "-0.02em",
          lineHeight: 1.0,
          textAlign: "center",
          transform: `translateY(${(1 - titleIn) * 60}px) scale(${0.8 + titleIn * 0.2})`,
          opacity: titleIn,
        }}
      >
        MOTION
        <br />
        <span style={{ color: C.accent }}>GRAPHICS</span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: F.body,
          fontSize: 20,
          color: C.creamDim,
          marginTop: 20,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          transform: `translateY(${(1 - subtitleIn) * 30}px)`,
          opacity: subtitleIn,
        }}
      >
        EDITING SHOWCASE 2024
      </div>

      {/* Corner decorations */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 20,
          left: SAFE.left + 20,
          width: 40,
          height: 40,
          borderLeft: `3px solid ${C.accent}`,
          borderTop: `3px solid ${C.accent}`,
          opacity: lineIn,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: SAFE.bottom + 20,
          right: SAFE.right + 20,
          width: 40,
          height: 40,
          borderRight: `3px solid ${C.accent}`,
          borderBottom: `3px solid ${C.accent}`,
          opacity: lineIn,
        }}
      />
    </AbsoluteFill>
  );
};
