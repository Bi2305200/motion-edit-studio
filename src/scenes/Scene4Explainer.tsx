import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F, W, H, SAFE, FPS, sp, prog, SPRING, easeOut, easeOutExpo } from "../lib";
import { Counter, MaskReveal } from "../components/primitives";

/**
 * Scene 4: Vox-Style Journalistic Data Explainer + Brand Finale (11.4s - 15.0s, 108 frames)
 * Inspired by @huandaotaoyoutube Vox documentary style — Cream grid paper, yellow highlighter
 * strokes, animated giant data bars, rolling counters, and clean Call-To-Action finale.
 */
export const Scene4Explainer: React.FC = () => {
  const frame = useCurrentFrame(); // 0..107
  const t = frame / FPS; // 0..3.6s

  const titleIn = 0.3 + 0.7 * sp(frame, 0.0, SPRING.snappy);
  const highlightW = prog(t, 0.1, 0.65, easeOutExpo);
  const kpiIn = sp(frame, 0.12, SPRING.snappy);
  const chartIn = prog(t, 0.2, 1.2, easeOutExpo);
  const calloutIn = sp(frame, 0.5, SPRING.bounce);

  const bars = [
    { label: "PILLOW CŨ", pct: 0.24, val: "24%", color: "#94A3B8" },
    { label: "CAPCUT THỦ CÔNG", pct: 0.58, val: "58%", color: "#475569" },
    { label: "REMOTION + AI SKILL", pct: 0.98, val: "98%", color: C.accent },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgWarm }}>
      {/* Vox Documentary Dot & Grid Texture */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="voxDots" width="45" height="45" patternUnits="userSpaceOnUse">
            <circle cx="22" cy="22" r="2" fill="rgba(11,11,14,0.14)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#voxDots)" />
      </svg>

      {/* SAFE ZONE CONTAINER: 830 x 1390 */}
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.top,
          width: SAFE.contentW,
          height: SAFE.contentH,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Vox Header */}
        <div>
          <div
            style={{
              display: "inline-block",
              backgroundColor: C.ink,
              color: C.yellow,
              fontFamily: F.mono,
              fontSize: 20,
              fontWeight: 700,
              padding: "8px 20px",
              letterSpacing: "0.1em",
              marginBottom: 18,
              opacity: titleIn,
            }}
          >
            VOX EXPLAINER // DATA REPORT
          </div>

          <div
            style={{
              fontFamily: F.vnDisplay,
              fontSize: 58,
              color: C.ink,
              lineHeight: 1.28,
              transform: `translateY(${(1 - titleIn) * 40}px)`,
              opacity: titleIn,
            }}
          >
            HIỆU SUẤT DỰNG
            <br />
            {/* Yellow Highlighter Bar Behind Text */}
            <span style={{ position: "relative", display: "inline-block", padding: "2px 14px", marginTop: 8 }}>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 4,
                  width: `${highlightW * 100}%`,
                  height: "86%",
                  backgroundColor: C.yellow,
                  zIndex: 0,
                }}
              />
              <span style={{ position: "relative", zIndex: 1 }}>TĂNG GẤP 10 LẦN</span>
            </span>
          </div>
        </div>

        {/* 3 Giant KPI Metric Cards */}
        <div
          style={{
            display: "flex",
            gap: 22,
            transform: `translateY(${(1 - kpiIn) * 50}px)`,
            opacity: kpiIn,
          }}
        >
          {[
            { num: 63.4, suf: "K+", label: "LIKES MẪU THAM KHẢO", dec: 1, bg: C.white },
            { num: 100, suf: "%", label: "CHUẨN SAFE ZONE", dec: 0, bg: C.white },
            { num: 60, suf: "FPS", label: "SPRING MOTION", dec: 0, bg: C.yellow },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: item.bg,
                border: `4px solid ${C.ink}`,
                boxShadow: `10px 10px 0px ${C.ink}`,
                borderRadius: 20,
                padding: "26px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: F.display, fontSize: 56, color: C.ink, lineHeight: 1.0 }}>
                <Counter value={item.num} progress={chartIn} suffix={item.suf} decimals={item.dec} />
              </div>
              <div
                style={{
                  fontFamily: F.body,
                  fontSize: 17,
                  color: C.ink,
                  marginTop: 12,
                  letterSpacing: "0.04em",
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal Comparison Chart Card */}
        <div
          style={{
            backgroundColor: C.white,
            border: `4px solid ${C.ink}`,
            boxShadow: `14px 14px 0px ${C.ink}`,
            borderRadius: 26,
            padding: "34px 36px",
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 20,
              fontWeight: 700,
              color: C.ink,
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>SO SÁNH CHẤT LƯỢNG MOTION GRAPHICS</span>
            <span style={{ color: C.accent }}>★ BENCHMARK</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            {bars.map((b, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: F.body,
                    fontSize: 24,
                    color: C.ink,
                    marginBottom: 10,
                  }}
                >
                  <span>{b.label}</span>
                  <span style={{ color: i === 2 ? C.accent : C.ink }}>{b.val}</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 36,
                    backgroundColor: "#E2E8F0",
                    borderRadius: 10,
                    border: `2px solid ${C.ink}`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${b.pct * chartIn * 100}%`,
                      height: "100%",
                      backgroundColor: b.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Finale Banner */}
        <div
          style={{
            backgroundColor: C.ink,
            border: `4px solid ${C.ink}`,
            boxShadow: `12px 12px 0px ${C.accent}`,
            borderRadius: 24,
            padding: "28px 34px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transform: `scale(${0.85 + calloutIn * 0.15})`,
            opacity: calloutIn,
          }}
        >
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 18, color: C.lime, fontWeight: 700 }}>
              ★ SẴN SÀNG XUẤT BẢN TIKTOK & CAPCUT PC
            </div>
            <div style={{ fontFamily: F.vnDisplay, fontSize: 42, color: C.white, marginTop: 4 }}>
              AI MOTION STUDIO 2026
            </div>
          </div>
          <div
            style={{
              backgroundColor: C.accent,
              color: C.white,
              fontFamily: F.display,
              fontSize: 24,
              padding: "16px 26px",
              borderRadius: 16,
              whiteSpace: "nowrap",
            }}
          >
            PRO STUDIO
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
