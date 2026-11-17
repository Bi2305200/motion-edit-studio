import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, F, W, H, SAFE, FPS, sp, prog, SPRING, easeOut, easeInOut } from "../lib";
import { MaskReveal } from "../components/primitives";

/**
 * Scene 1: Brutalist Editorial & Brand Identity (0.0s - 3.6s, 108 frames)
 * Inspired by @rehmaneditor999 — High-contrast cream/ink/orange brutalist collage,
 * giant typography specimen, torn paper layers, spinning seal stamp, barcode & grid.
 */
export const Scene1Brutalist: React.FC = () => {
  const frame = useCurrentFrame(); // 0..107
  const t = frame / FPS;

  // Animations (all relative to t = 0..3.6s)
  const heroCardIn = sp(frame, 0.05, SPRING.snappy);
  const specimenIn = sp(frame, 0.25, SPRING.snappy);
  const paletteIn = sp(frame, 0.45, SPRING.default);
  const metricsIn = sp(frame, 0.65, SPRING.snappy);
  const stampIn = sp(frame, 0.55, SPRING.bounce);
  const tapeIn = prog(t, 0.15, 0.6, easeOut);
  const exitZoom = t > 3.25 ? 1 + prog(t, 3.25, 3.6, easeInOut) * 0.35 : 1 + t * 0.015;
  const exitOpacity = t > 3.35 ? 1 - prog(t, 3.35, 3.6, easeOut) : 1;

  // Micro continuous drift so no frame is ever frozen
  const driftY = Math.sin(t * 2.2) * 4;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgCream, opacity: exitOpacity }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${exitZoom})`,
          transformOrigin: "50% 45%",
        }}
      >
        {/* Architectural Grid Background */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <pattern id="brutalGrid" width="90" height="90" patternUnits="userSpaceOnUse">
              <path d="M 90 0 L 0 0 0 90" fill="none" stroke="rgba(11,11,14,0.08)" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#brutalGrid)" />
        </svg>

        {/* SAFE ZONE CONTAINER: X=110..940 (830px), Y=150..1540 (1390px) */}
        <div
          style={{
            position: "absolute",
            left: SAFE.left,
            top: SAFE.top,
            width: SAFE.contentW,
            height: SAFE.contentH,
          }}
        >
          {/* Top Editorial Header Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `4px solid ${C.ink}`,
              paddingBottom: 14,
              marginBottom: 24,
              transform: `translateY(${(1 - heroCardIn) * -40}px)`,
              opacity: heroCardIn,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 18, height: 18, backgroundColor: C.accent, borderRadius: "50%" }} />
              <span style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: "0.08em" }}>
                ISSUE // 01 — BRUTALIST
              </span>
            </div>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 20,
                fontWeight: 700,
                backgroundColor: C.ink,
                color: C.bgCream,
                padding: "4px 14px",
              }}
            >
              2026 EDITION
            </span>
          </div>

          {/* Giant Hero Brutalist Block */}
          <div
            style={{
              position: "relative",
              width: "100%",
              backgroundColor: C.ink,
              padding: "44px 40px 48px",
              border: `4px solid ${C.ink}`,
              boxShadow: `16px 16px 0px ${C.accent}`,
              transform: `translateY(${(1 - heroCardIn) * 90 + driftY}px) rotate(${(1 - heroCardIn) * -4 - 1}deg)`,
              opacity: heroCardIn,
            }}
          >
            {/* Accent Tag */}
            <div
              style={{
                display: "inline-block",
                backgroundColor: C.accent,
                color: C.white,
                fontFamily: F.body,
                fontSize: 20,
                padding: "6px 18px",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                marginBottom: 18,
              }}
            >
              ★ MOTION DESIGN SYSTEM
            </div>

            <div
              style={{
                fontFamily: F.vnDisplay,
                fontSize: 72,
                fontWeight: 900,
                color: C.white,
                lineHeight: 1.24,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
              }}
            >
              <MaskReveal k={heroCardIn}>ĐỒ HỌA</MaskReveal>
              <br />
              <span style={{ color: C.accent }}>
                <MaskReveal k={sp(frame, 0.16, SPRING.snappy)}>CHUYỂN ĐỘNG</MaskReveal>
              </span>
            </div>

            <div
              style={{
                fontFamily: F.bodyReg,
                fontSize: 23,
                color: C.creamDim,
                marginTop: 18,
                letterSpacing: "0.04em",
              }}
            >
              Hệ Thống Nhận Diện • Chuẩn Điện Ảnh 60FPS
            </div>

            {/* Spinning Red Stamp Seal */}
            <div
              style={{
                position: "absolute",
                right: 28,
                top: 28,
                width: 148,
                height: 148,
                borderRadius: "50%",
                border: `5px dashed ${C.lime}`,
                backgroundColor: "rgba(11,11,14,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${stampIn}) rotate(${frame * 1.8 - 15}deg)`,
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 20,
                  color: C.lime,
                  textAlign: "center",
                  lineHeight: 1.15,
                }}
              >
                PRO
                <br />
                STUDIO
                <br />
                ★ 100% ★
              </div>
            </div>
          </div>

          {/* Middle Row: Giant Typography Specimen + Color Swatches */}
          <div
            style={{
              display: "flex",
              gap: 28,
              marginTop: 42,
              height: 430,
            }}
          >
            {/* Left Card: Giant Typography Specimen */}
            <div
              style={{
                flex: 1.35,
                backgroundColor: C.white,
                border: `5px solid ${C.ink}`,
                boxShadow: `12px 12px 0px ${C.ink}`,
                padding: "32px 34px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transform: `translateX(${(1 - specimenIn) * -100}px) rotate(${(1 - specimenIn) * 6 + 1.2}deg)`,
                opacity: specimenIn,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 165,
                    color: C.ink,
                    lineHeight: 0.82,
                    letterSpacing: "-0.05em",
                  }}
                >
                  Aa
                </div>
                <div
                  style={{
                    backgroundColor: C.ink,
                    color: C.white,
                    fontFamily: F.mono,
                    fontSize: 18,
                    padding: "6px 12px",
                    fontWeight: 700,
                  }}
                >
                  900 BLACK
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 30,
                    color: C.accent,
                    letterSpacing: "0.02em",
                  }}
                >
                  MONTSERRAT PRO
                </div>
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 18,
                    color: "#555",
                    marginTop: 6,
                  }}
                >
                  ABCDEFGHIJKLMN • 0123456789
                </div>
                <div
                  style={{
                    width: `${tapeIn * 100}%`,
                    height: 8,
                    backgroundColor: C.ink,
                    marginTop: 16,
                  }}
                />
              </div>
            </div>

            {/* Right Card: Bold Swatch Stack */}
            <div
              style={{
                flex: 0.9,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transform: `translateX(${(1 - paletteIn) * 100}px)`,
                opacity: paletteIn,
              }}
            >
              {[
                { hex: "#FF4D00", name: "HYPER ORANGE", bg: C.accent, fg: C.white },
                { hex: "#0B0B0E", name: "CARBON INK", bg: C.ink, fg: C.white },
                { hex: "#CDF24F", name: "ACID LIME", bg: C.lime, fg: C.ink },
              ].map((sw, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    backgroundColor: sw.bg,
                    border: `4px solid ${C.ink}`,
                    boxShadow: `8px 8px 0px ${C.ink}`,
                    padding: "16px 22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontFamily: F.mono, fontSize: 18, fontWeight: 700, color: sw.fg, opacity: 0.85 }}>
                    {sw.name}
                  </span>
                  <span style={{ fontFamily: F.display, fontSize: 32, color: sw.fg }}>
                    {sw.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Brutalist Collage Strip (Fills lower safe zone) */}
          <div
            style={{
              marginTop: 38,
              backgroundColor: C.white,
              border: `5px solid ${C.ink}`,
              boxShadow: `12px 12px 0px ${C.ink}`,
              padding: "26px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transform: `translateY(${(1 - metricsIn) * 80}px)`,
              opacity: metricsIn,
            }}
          >
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.accent, fontWeight: 700 }}>
                // BỐ CỤC CHUẨN TIKTOK SAFE ZONE
              </div>
              <div style={{ fontFamily: F.vnDisplay, fontSize: 42, color: C.ink, marginTop: 4 }}>
                KHÔNG TRÀN VIỀN • 1080×1920
              </div>
            </div>

            {/* Simulated Barcode */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, height: 74 }}>
              {[6, 2, 8, 3, 6, 2, 4, 8, 2, 5, 3, 7, 2, 6].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: w * 2,
                    height: "100%",
                    backgroundColor: C.ink,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer Technical Spec Bar */}
          <div
            style={{
              marginTop: 26,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: F.mono,
              fontSize: 20,
              fontWeight: 700,
              color: C.ink,
              opacity: metricsIn,
            }}
          >
            <span>[SCENE 01/04]</span>
            <span>STYLE: @REHMANEDITOR999</span>
            <span>FPS: 30.0</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
