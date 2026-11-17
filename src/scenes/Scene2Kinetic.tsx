import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F, W, H, SAFE, FPS, sp, prog, SPRING, easeOut, easeOutExpo, easeInOut } from "../lib";
import { MaskReveal } from "../components/primitives";

/**
 * Scene 2: Kinetic Typography & 3D Motion Cards (3.6s - 7.4s, 114 frames)
 * Inspired by @danushkmotion & @huandaotaoyoutube — Dark high-energy neon/orange kinetic cards,
 * 3D perspective tilt, dynamic camera punch, floating motion badges, and audio-synced bars.
 */
export const Scene2Kinetic: React.FC = () => {
  const frame = useCurrentFrame(); // 0..113
  const t = frame / FPS;

  // Entry flash transition from Scene 1
  const entryFlash = prog(t, 0, 0.25, easeOut);
  const w1 = sp(frame, 0.08, SPRING.snappy);
  const w2 = sp(frame, 0.25, SPRING.snappy);
  const w3 = sp(frame, 0.45, SPRING.bounce);
  const w4 = sp(frame, 0.68, SPRING.snappy);
  const card3DIn = sp(frame, 0.85, SPRING.default);

  // Continuous 3D tilt & camera push
  const tiltX = Math.sin(t * 2.5) * 6;
  const tiltY = Math.cos(t * 2.0) * 8;
  const camScale = 1 + prog(t, 0, 3.8, easeOut) * 0.06;
  const exitSlide = t > 3.45 ? prog(t, 3.45, 3.8, easeInOut) * -1080 : 0;

  // Expanding concentric rings
  const ringProg = prog(t, 0.2, 2.5, easeOutExpo);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        transform: `translateX(${exitSlide}px)`,
      }}
    >
      {/* Radial Glowing Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 50% 38%, rgba(255,77,0,0.28) 0%, rgba(168,85,247,0.12) 42%, transparent 72%)
          `,
        }}
      />

      {/* Animated Concentric Radar Rings */}
      {[280, 460, 640].map((r, i) => {
        const radius = r * ringProg;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: W / 2 - radius,
              top: H * 0.44 - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: "50%",
              border: `2px solid rgba(255, 77, 0, ${0.22 - i * 0.05})`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* SAFE ZONE CONTAINER */}
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.top,
          width: SAFE.contentW,
          height: SAFE.contentH,
          transform: `scale(${camScale})`,
          transformOrigin: "50% 48%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top HUD Status Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "16px 26px",
            opacity: w1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: C.lime,
                boxShadow: `0 0 12px ${C.lime}`,
              }}
            />
            <span style={{ fontFamily: F.mono, fontSize: 20, color: C.white, fontWeight: 700 }}>
              ENGINE: REMOTION + SPRING PHYSICS
            </span>
          </div>
          <span style={{ fontFamily: F.mono, fontSize: 20, color: C.accent, fontWeight: 700 }}>
            F:{String(frame).padStart(3, "0")}
          </span>
        </div>

        {/* Kinetic Typography Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          {/* Line 1 */}
          <div
            style={{
              backgroundColor: C.white,
              color: C.ink,
              padding: "22px 34px",
              borderRadius: 20,
              alignSelf: "flex-start",
              transform: `translateX(${(1 - w1) * -120}px) rotate(-1.5deg)`,
              opacity: w1,
              boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ fontFamily: F.vnDisplay, fontSize: 60, lineHeight: 1.22 }}>
              <MaskReveal k={w1}>NHỊP DỰNG</MaskReveal>
            </div>
          </div>

          {/* Line 2 - Hero Highlight */}
          <div
            style={{
              backgroundColor: C.accent,
              color: C.white,
              padding: "26px 36px",
              borderRadius: 24,
              alignSelf: "stretch",
              textAlign: "center",
              transform: `scale(${0.75 + w2 * 0.25}) rotate(1deg)`,
              opacity: w2,
              boxShadow: `0 20px 55px rgba(255,77,0,0.45)`,
            }}
          >
            <div style={{ fontFamily: F.vnDisplay, fontSize: 70, lineHeight: 1.22, letterSpacing: "-0.01em" }}>
              <MaskReveal k={w2}>BẮT TRỌN BEAT</MaskReveal>
            </div>
          </div>

          {/* Line 3 & 4 Split Row */}
          <div style={{ display: "flex", gap: 20 }}>
            <div
              style={{
                flex: 1,
                backgroundColor: "#181820",
                border: `3px solid ${C.lime}`,
                padding: "24px 28px",
                borderRadius: 22,
                transform: `translateY(${(1 - w3) * 60}px)`,
                opacity: w3,
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.lime, marginBottom: 14 }}>
                01 // EASING
              </div>
              <div style={{ fontFamily: F.vnDisplay, fontSize: 42, color: C.white, lineHeight: 1.25 }}>
                MƯỢT MÀ
              </div>
            </div>

            <div
              style={{
                flex: 1,
                backgroundColor: C.lime,
                padding: "24px 28px",
                borderRadius: 22,
                transform: `translateY(${(1 - w4) * 60}px)`,
                opacity: w4,
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.ink, fontWeight: 700, marginBottom: 14 }}>
                02 // IMPACT
              </div>
              <div style={{ fontFamily: F.vnDisplay, fontSize: 42, color: C.ink, lineHeight: 1.25 }}>
                CUỐN HÚT
              </div>
            </div>
          </div>
        </div>

        {/* 3D Perspective Motion Timeline Card (Inspired by @huandaotaoyoutube Claude 3D UI) */}
        <div
          style={{
            backgroundColor: "rgba(24, 26, 34, 0.92)",
            border: "2px solid rgba(255,255,255,0.16)",
            borderRadius: 28,
            padding: "32px 34px",
            boxShadow: "0 30px 70px rgba(0,0,0,0.65)",
            transform: `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${(1 - card3DIn) * 80}px)`,
            opacity: card3DIn,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.accentAlt, fontWeight: 700 }}>
                CLAUDE OPUS × REMOTION TIMELINE
              </div>
              <div style={{ fontFamily: F.display, fontSize: 32, color: C.white, marginTop: 4 }}>
                KEYFRAME VELOCITY GRAPH
              </div>
            </div>
            <div
              style={{
                backgroundColor: C.accent,
                color: C.white,
                fontFamily: F.mono,
                fontSize: 20,
                fontWeight: 700,
                padding: "8px 18px",
                borderRadius: 12,
              }}
            >
              128 BPM
            </div>
          </div>

          {/* Animated Bezier Curve & Keyframe Tracks */}
          <svg width="100%" height="150" viewBox="0 0 740 150" style={{ overflow: "visible" }}>
            {/* Grid lines */}
            {[30, 75, 120].map((y, idx) => (
              <line key={idx} x1="0" y1={y} x2="740" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            ))}
            {/* S-Curve Bezier Path */}
            <path
              d="M 10 130 C 220 130, 260 20, 480 20 C 600 20, 640 90, 730 25"
              fill="none"
              stroke={C.accent}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="900"
              strokeDashoffset={900 * (1 - prog(t, 0.9, 2.4, easeOut))}
            />
            {/* Moving Playhead */}
            <line
              x1={prog(t, 0.8, 3.5, easeOut) * 720}
              y1="0"
              x2={prog(t, 0.8, 3.5, easeOut) * 720}
              y2="145"
              stroke={C.lime}
              strokeWidth="4"
            />
            <circle
              cx={prog(t, 0.8, 3.5, easeOut) * 720}
              cy="45"
              r="10"
              fill={C.lime}
            />
          </svg>

          {/* Audio Spectrum Visualizer Bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 64, marginTop: 18 }}>
            {Array.from({ length: 28 }).map((_, i) => {
              const wave = 0.25 + 0.75 * Math.abs(Math.sin(t * 7 + i * 0.45));
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${wave * 100}%`,
                    backgroundColor: i % 3 === 0 ? C.accent : i % 2 === 0 ? C.lime : "rgba(255,255,255,0.28)",
                    borderRadius: 4,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Footer Tag */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: F.mono,
            fontSize: 20,
            color: C.creamDim,
            opacity: card3DIn,
          }}
        >
          <span>[SCENE 02/04]</span>
          <span>STYLE: @DANUSHKMOTION</span>
          <span>SPRING K=300 D=24</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
