import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F, W, H, SAFE, FPS, sp, prog, SPRING, easeOut, easeInOut } from "../lib";

/**
 * Scene 3: Spotify 2.0 Glassmorphic UI/UX Concept (7.4s - 11.4s, 120 frames)
 * Inspired by @xzelogos (63.4K Likes viral video) — Full-sized glassmorphic mobile UI
 * filling the TikTok Safe Zone, floating 3D vinyl/album card, live lyrics pill, animated equalizer.
 */
export const Scene3SpotifyUI: React.FC = () => {
  const frame = useCurrentFrame(); // 0..119
  const t = frame / FPS;

  // Staggered UI entrances (instant at frame 0 so zero blank gap on cut)
  const shellIn = 0.35 + 0.65 * sp(frame, 0.0, SPRING.snappy);
  const topPillIn = sp(frame, 0.02, SPRING.snappy);
  const heroAlbumIn = sp(frame, 0.08, SPRING.bounce);
  const gridIn = sp(frame, 0.22, SPRING.snappy);
  const playerIn = sp(frame, 0.35, SPRING.snappy);

  // Subtle floating hover
  const floatY = Math.sin(t * 2.4) * 6;
  const playheadPct = 32 + prog(t, 0.5, 3.8, easeOut) * 48;

  // Exit scale
  const exitZoom = t > 3.65 ? 1 - prog(t, 3.65, 4.0, easeInOut) * 0.15 : 1;
  const exitOpacity = t > 3.7 ? 1 - prog(t, 3.7, 4.0, easeOut) : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#07120C", opacity: exitOpacity }}>
      {/* Ambient Emerald & Teal Aurora Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 30% 25%, rgba(29, 185, 84, 0.38) 0%, transparent 55%),
            radial-gradient(circle at 75% 70%, rgba(0, 229, 255, 0.22) 0%, transparent 55%)
          `,
        }}
      />

      {/* SAFE ZONE CONTAINER: 830 x 1390 */}
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.top,
          width: SAFE.contentW,
          height: SAFE.contentH,
          transform: `scale(${shellIn * exitZoom}) translateY(${(1 - shellIn) * 120}px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Floating Glass Category Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1.5px solid rgba(255,255,255,0.16)",
            borderRadius: 999,
            padding: "14px 24px",
            transform: `translateY(${(1 - topPillIn) * -40}px)`,
            opacity: topPillIn,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span
              style={{
                backgroundColor: C.spotify,
                color: C.ink,
                fontFamily: F.body,
                fontSize: 20,
                padding: "8px 22px",
                borderRadius: 999,
              }}
            >
              ● Spotify 2.0 Concept
            </span>
            <span style={{ fontFamily: F.bodyReg, fontSize: 20, color: C.white, padding: "8px 16px" }}>
              Lossless Spatial
            </span>
            <span style={{ fontFamily: F.bodyReg, fontSize: 20, color: C.creamDim, padding: "8px 16px" }}>
              AI DJ
            </span>
          </div>
          <span style={{ fontFamily: F.mono, fontSize: 18, color: C.spotify, fontWeight: 700 }}>
            UI/UX
          </span>
        </div>

        {/* Hero Glass Card: Now Playing Spatial Experience */}
        <div
          style={{
            backgroundColor: "rgba(20, 28, 24, 0.85)",
            border: "2px solid rgba(29, 185, 84, 0.45)",
            borderRadius: 36,
            padding: "36px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.2)",
            transform: `translateY(${floatY}px) scale(${0.85 + heroAlbumIn * 0.15})`,
            opacity: heroAlbumIn,
          }}
        >
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {/* 3D Album Art + Spinning Vinyl Disc */}
            <div style={{ position: "relative", width: 250, height: 250, flexShrink: 0 }}>
              {/* Spinning Vinyl Behind */}
              <div
                style={{
                  position: "absolute",
                  right: -35,
                  top: 15,
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #1DB954 0%, #1DB954 18%, #111 20%, #222 45%, #0a0a0a 100%)",
                  border: "3px solid rgba(255,255,255,0.18)",
                  transform: `rotate(${frame * 4}deg)`,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
                }}
              />
              {/* Front Cover */}
              <div
                style={{
                  position: "relative",
                  width: 220,
                  height: 250,
                  borderRadius: 24,
                  background: "linear-gradient(135deg, #1DB954 0%, #009688 50%, #0D47A1 100%)",
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 20px 45px rgba(0,0,0,0.55)",
                  border: "2px solid rgba(255,255,255,0.25)",
                }}
              >
                <span style={{ fontFamily: F.mono, fontSize: 16, color: C.white, letterSpacing: "0.1em" }}>
                  DOLBY ATMOS
                </span>
                <div style={{ fontFamily: F.display, fontSize: 38, color: C.white, lineHeight: 1.0 }}>
                  FUTURE
                  <br />
                  PULSE
                </div>
              </div>
            </div>

            {/* Right Track Metadata & Live Lyrics */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: "rgba(29, 185, 84, 0.2)",
                  border: `1.5px solid ${C.spotify}`,
                  color: C.spotify,
                  fontFamily: F.mono,
                  fontSize: 16,
                  fontWeight: 700,
                  padding: "4px 14px",
                  borderRadius: 999,
                  marginBottom: 12,
                }}
              >
                ★ TRENDING #1 CONCEPT
              </div>
              <div style={{ fontFamily: F.vnDisplay, fontSize: 44, color: C.white, lineHeight: 1.25 }}>
                ÁNH SÁNG ĐÔ THỊ
              </div>
              <div style={{ fontFamily: F.bodyReg, fontSize: 22, color: C.creamDim, marginTop: 8 }}>
                Motion Studio • Hòa Âm Điện Tử
              </div>

              {/* Synced Lyrics Highlight Pill */}
              <div
                style={{
                  marginTop: 20,
                  backgroundColor: "rgba(255,255,255,0.07)",
                  borderRadius: 18,
                  padding: "16px 20px",
                  borderLeft: `5px solid ${C.spotify}`,
                }}
              >
                <div style={{ fontFamily: F.body, fontSize: 21, color: C.white, lineHeight: 1.35 }}>
                  ♪ "Chuyển động mượt mà từng khung hình..."
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid: 4 Interactive Smart Widgets */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
            transform: `translateY(${(1 - gridIn) * 60}px)`,
            opacity: gridIn,
          }}
        >
          {[
            { title: "Spatial Audio 360°", sub: "Head Tracking ON", accent: "#1DB954", badge: "ACTIVE" },
            { title: "AI Beat Match", sub: "128 BPM Auto-Sync", accent: "#00E5FF", badge: "SMART" },
            { title: "Glassmorphism 2.0", sub: "Real-time Blur 40px", accent: "#A855F7", badge: "SHADER" },
            { title: "Hi-Res 24-Bit", sub: "192kHz Studio Master", accent: "#FACC15", badge: "FLAC" },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1.5px solid rgba(255,255,255,0.14)",
                borderRadius: 26,
                padding: "26px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: 185,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: `${card.accent}25`,
                    border: `2px solid ${card.accent}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: F.display,
                    fontSize: 22,
                    color: card.accent,
                  }}
                >
                  0{i + 1}
                </div>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 16,
                    fontWeight: 700,
                    color: card.accent,
                    backgroundColor: `${card.accent}18`,
                    padding: "6px 14px",
                    borderRadius: 999,
                  }}
                >
                  {card.badge}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: F.body, fontSize: 28, color: C.white }}>{card.title}</div>
                <div style={{ fontFamily: F.bodyReg, fontSize: 20, color: C.creamDim, marginTop: 4 }}>
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Floating Playback Scrubber Bar */}
        <div
          style={{
            backgroundColor: C.spotify,
            borderRadius: 28,
            padding: "26px 34px",
            boxShadow: "0 20px 50px rgba(29, 185, 84, 0.35)",
            transform: `translateY(${(1 - playerIn) * 80}px)`,
            opacity: playerIn,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: F.display, fontSize: 26, color: C.ink }}>
              NOW PLAYING • @XZELOGOS STYLE
            </span>
            <span style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 700, color: C.ink }}>
              01:42 / 03:15
            </span>
          </div>

          {/* Progress Scrubber */}
          <div
            style={{
              width: "100%",
              height: 14,
              backgroundColor: "rgba(0,0,0,0.22)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${playheadPct}%`,
                height: "100%",
                backgroundColor: C.ink,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
