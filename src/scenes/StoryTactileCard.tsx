import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, SAFE, clamp01, sp, prog, SPRING, easeOutExpo, easeOut } from "../lib";
import { Counter, Grain } from "../components/primitives";

export interface StoryCardItem {
  label: string;
  valueLabel: string;
  pct: number; // 0..1
  color: string;
  note?: string;
}

export interface StoryTactileCardProps {
  variant?: "friction_compare" | "data_bars" | "chapter_stamp";
  theme?: "warm_paper" | "dark_editorial";
  badge?: string;
  badgeRight?: string;
  title?: string;
  highlightText?: string;
  heroStat?: number;
  heroDecimals?: number;
  heroPrefix?: string;
  heroSuffix?: string;
  heroCaption?: string;
  items?: StoryCardItem[];
  footerNote?: string;
}

const DEFAULT_PROPS: Required<StoryTactileCardProps> = {
  variant: "friction_compare",
  theme: "warm_paper",
  badge: "PHÂN TÍCH HÀNH VI // 20S",
  badgeRight: "",
  title: "NÃO BỘ CHỌN VIỆC",
  highlightText: "ÍT MA SÁT NHẤT",
  heroStat: 20,
  heroDecimals: 0,
  heroPrefix: "",
  heroSuffix: " GIÂY",
  heroCaption: "Ngưỡng năng lượng kích hoạt thói quen",
  items: [
    { label: "LƯỚT ĐIỆN THOẠI TẠI GIƯỜNG", valueLabel: "2 giây", pct: 0.14, color: "#3B82F6", note: "Gần như bằng 0 rào cản" },
    { label: "ĐỨNG DẬY TÌM & MỞ SÁCH", valueLabel: "25 giây", pct: 0.90, color: "#EF4444", note: "Não từ chối vì tốn sức" },
  ],
  footerNote: "Rút ngắn 20 giây chuẩn bị → hành động xảy ra tự nhiên",
};

export const StoryTactileCard: React.FC<StoryTactileCardProps> = (rawProps) => {
  const props = { ...DEFAULT_PROPS, ...rawProps };
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const isVertical = height > width;
  const t = frame / fps;

  const isDark = props.theme === "dark_editorial";
  const backdropBg = isDark ? "#0B101B" : "#141821";
  const cardBg = isDark ? "#131B2B" : "#F3EDE2";
  const cardBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.14)";
  const inkCol = isDark ? "#F8FAFC" : "#111827";
  const subInk = isDark ? "rgba(226,232,240,0.72)" : "rgba(30,41,59,0.75)";
  const trackBg = isDark ? "rgba(255,255,255,0.10)" : "#E2DACB";
  const hlBg = isDark ? "#F59E0B" : "#FACC15";
  const hlInk = "#111827";

  const cardIn = sp(frame, 0.0, SPRING.snappy, fps);
  const hlW = prog(t, 0.15, 0.72, easeOutExpo);
  const statProg = prog(t, 0.18, 1.05, easeOut);
  const noteIn = sp(frame, 0.7, SPRING.default, fps);
  const microTilt = (1 - cardIn) * -1.8 + Math.sin(t * 0.9) * 0.22;

  const containerStyle: React.CSSProperties = isVertical
    ? {
        position: "absolute",
        left: SAFE.left,
        right: SAFE.right,
        top: SAFE.top + 40,
        bottom: SAFE.bottom + 140, // Keeps clear above bottom safe-zone captions
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }
    : {
        position: "absolute",
        left: 160,
        right: 160,
        top: 84,
        bottom: 165, // Leaves room below for 16:9 2-line captions
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };

  return (
    <AbsoluteFill style={{ backgroundColor: backdropBg }}>
      {/* Tactile Editorial Backdrop Grid */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="editorialSpot" cx="50%" cy="46%" r="65%">
            <stop offset="0%" stopColor={isDark ? "#1E293B" : "#262D3B"} stopOpacity="1" />
            <stop offset="100%" stopColor="#090D15" stopOpacity="1" />
          </radialGradient>
          <pattern id="dotGrid" width="38" height="38" patternUnits="userSpaceOnUse">
            <circle cx="19" cy="19" r="1.4" fill="rgba(255,255,255,0.08)" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#editorialSpot)" />
        <rect width={width} height={height} fill="url(#dotGrid)" />
      </svg>

      {/* Main Tactile Sheet */}
      <div style={containerStyle}>
        <div
          style={{
            width: "100%",
            maxWidth: isVertical ? 820 : 1240,
            backgroundColor: cardBg,
            borderRadius: 20,
            border: `2px solid ${cardBorder}`,
            boxShadow: "0 32px 80px rgba(0,0,0,0.58), 0 4px 12px rgba(0,0,0,0.28)",
            padding: isVertical ? "44px 38px" : "46px 56px",
            transform: `translateY(${(1 - cardIn) * 44}px) scale(${0.94 + cardIn * 0.06}) rotate(${microTilt}deg)`,
            opacity: clamp01(cardIn * 1.4),
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle inner paper ruled lines */}
          <svg
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: isDark ? 0.06 : 0.16 }}
          >
            <defs>
              <pattern id="paperDots" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1.2" fill={inkCol} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#paperDots)" />
          </svg>

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: isVertical ? 28 : 26 }}>
            {/* Top Tag Pill */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  backgroundColor: inkCol,
                  color: cardBg,
                  fontFamily: F.mono,
                  fontWeight: 700,
                  fontSize: isVertical ? 18 : 19,
                  padding: "7px 16px",
                  borderRadius: 6,
                  letterSpacing: "0.08em",
                }}
              >
                {props.badge}
              </span>
              {props.badgeRight && (
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 16,
                    color: subInk,
                    fontWeight: 700,
                  }}
                >
                  {props.badgeRight}
                </span>
              )}
            </div>

            {/* Headline + Sweeping Yellow Highlighter */}
            <div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: isVertical ? 46 : 52,
                  color: inkCol,
                  lineHeight: 1.24,
                  letterSpacing: "-0.015em",
                }}
              >
                {props.title}
              </div>
              {props.highlightText && (
                <div style={{ marginTop: 8 }}>
                  <span
                    style={{
                      position: "relative",
                      display: "inline-block",
                      padding: "4px 16px",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        bottom: 2,
                        width: `${hlW * 100}%`,
                        height: "88%",
                        backgroundColor: hlBg,
                        borderRadius: 6,
                        zIndex: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "relative",
                        zIndex: 1,
                        fontFamily: F.display,
                        fontSize: isVertical ? 42 : 48,
                        color: hlInk,
                        lineHeight: 1.2,
                      }}
                    >
                      {props.highlightText}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Hero Big Metric + Comparison Bars */}
            {props.variant !== "chapter_stamp" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: isVertical ? "column" : "row",
                  gap: isVertical ? 26 : 42,
                  alignItems: isVertical ? "stretch" : "center",
                }}
              >
                {/* Big Metric Box */}
                <div
                  style={{
                    flex: isVertical ? "none" : "0 0 320px",
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#E7DFCF",
                    borderRadius: 12,
                    padding: "22px 24px 22px 28px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 6,
                      backgroundColor: C.accent,
                    }}
                  />
                  <Counter
                    value={props.heroStat}
                    progress={statProg}
                    prefix={props.heroPrefix}
                    suffix={props.heroSuffix}
                    decimals={props.heroDecimals}
                    style={{
                      fontFamily: F.display,
                      fontSize: isVertical ? 54 : 60,
                      color: C.accent,
                      lineHeight: 1.05,
                    }}
                  />
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily: F.body,
                      fontSize: isVertical ? 21 : 20,
                      color: inkCol,
                      lineHeight: 1.35,
                    }}
                  >
                    {props.heroCaption}
                  </div>
                </div>

                {/* Comparison Bars */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
                  {(props.items || []).map((item, idx) => {
                    const itemDelay = idx * 0.14;
                    const p = prog(t, 0.28 + itemDelay, 1.15 + itemDelay, easeOutExpo);
                    const wPct = Math.round(clamp01(item.pct * p) * 100);
                    return (
                      <div key={idx}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                          <span style={{ fontFamily: F.body, fontSize: isVertical ? 21 : 21, color: inkCol }}>
                            {item.label}
                          </span>
                          <span style={{ fontFamily: F.display, fontSize: isVertical ? 24 : 26, color: item.color }}>
                            {item.valueLabel}
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: isVertical ? 28 : 30,
                            backgroundColor: trackBg,
                            borderRadius: 9,
                            overflow: "hidden",
                            border: `1px solid ${cardBorder}`,
                          }}
                        >
                          <div
                            style={{
                              width: `${wPct}%`,
                              height: "100%",
                              backgroundColor: item.color,
                              borderRadius: 8,
                            }}
                          />
                        </div>
                        {item.note && (
                          <div style={{ marginTop: 6, fontFamily: F.bodyReg, fontSize: 16, color: subInk }}>
                            {item.note}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Editorial Footer Callout */}
            {props.footerNote && (
              <div
                style={{
                  borderTop: `1.5px dashed ${cardBorder}`,
                  paddingTop: 18,
                  fontFamily: F.body,
                  fontSize: isVertical ? 22 : 23,
                  color: inkCol,
                  opacity: clamp01(noteIn),
                  transform: `translateY(${(1 - noteIn) * 14}px)`,
                }}
              >
                {props.footerNote}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtle 35mm Film Grain */}
      <Grain frame={frame} opacity={0.032} />
    </AbsoluteFill>
  );
};
