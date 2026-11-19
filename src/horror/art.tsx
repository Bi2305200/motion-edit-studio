import React from "react";
import { random } from "remotion";
import { F } from "../lib";
import { HC, noiseUrl } from "./common";

/* ================= CỬA SỔ KÍNH MỜ ================= */
export const GlassWindow: React.FC<{
  w: number;
  h: number;
  glow?: number; // 0..1 ánh đèn đường bên ngoài
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ w, h, glow = 0.4, children, style }) => (
  <div style={{ position: "relative", width: w, height: h, ...style }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        background: "linear-gradient(145deg,#303846,#0d1118)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.85), inset 0 0 0 3px rgba(255,255,255,0.07)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 28,
        top: 28,
        right: 28,
        bottom: 28,
        borderRadius: 6,
        overflow: "hidden",
        background: `linear-gradient(180deg, rgba(255,184,96,${0.2 + glow * 0.55}) 0%, rgba(255,150,64,${0.1 + glow * 0.4}) 55%, rgba(110,66,28,${0.08 + glow * 0.25}) 100%)`,
      }}
    >
      {/* nhám kính mờ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${noiseUrl()})`,
          backgroundSize: "270px 270px",
          opacity: 0.35,
          mixBlendMode: "overlay",
        }}
      />
      {children}
      {/* vệt phản chiếu */}
      <div
        style={{
          position: "absolute",
          left: "-20%",
          top: 0,
          width: "40%",
          height: "100%",
          background: "linear-gradient(100deg, rgba(255,255,255,0.0), rgba(255,255,255,0.12), rgba(255,255,255,0))",
          transform: "skewX(-12deg)",
        }}
      />
    </div>
    {/* chốt cửa */}
    <div style={{ position: "absolute", right: 6, top: h / 2 - 34, width: 14, height: 68, borderRadius: 6, background: "#8a93a1" }} />
  </div>
);

/* ================= BÀN TAY (bóng đen, ngón dài bất thường) ================= */
export const Hand: React.FC<{ width?: number; blur?: number; opacity?: number; style?: React.CSSProperties }> = ({
  width = 330,
  blur = 3,
  opacity = 0.96,
  style,
}) => {
  const fingers = [
    { x: 46, y: 70, w: 34, h: 210, r: -6 }, // trỏ
    { x: 92, y: 14, w: 36, h: 266, r: -1 }, // giữa
    { x: 140, y: 40, w: 34, h: 240, r: 4 }, // áp út
    { x: 186, y: 108, w: 30, h: 172, r: 9 }, // út
  ];
  return (
    <svg viewBox="0 0 270 520" width={width} height={(width * 520) / 270} style={{ overflow: "visible", ...style }}>
      <defs>
        <filter id="handBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>
      <g filter="url(#handBlur)" fill="#04050a" opacity={opacity}>
        {fingers.map((f, i) => (
          <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} rx={f.w / 2} transform={`rotate(${f.r} ${f.x + f.w / 2} ${f.y + f.h})`} />
        ))}
        <rect x={40} y={250} width={190} height={210} rx={70} />
        <rect x={4} y={218} width={40} height={175} rx={20} transform="rotate(-24 44 378)" />
        <rect x={64} y={430} width={142} height={90} rx={30} />
      </g>
    </svg>
  );
};

/* ================= MẶT TIỀN DÃY NHÀ CŨ ================= */
export const FLOOR3 = { x: 160, y: 372, w: 118, h: 150 }; // cửa sổ tầng 3 (trong viewBox 700x900)

export const Building: React.FC<{ litFlicker?: number }> = ({ litFlicker = 1 }) => {
  const floors = 4;
  const rows: React.ReactNode[] = [];
  for (let fl = 0; fl < floors; fl++) {
    for (let c = 0; c < 3; c++) {
      const x = 160 + c * 160;
      const y = 120 + fl * 126 * 1.0 + (fl >= 2 ? 0 : 0);
      const yy = 120 + fl * 126 + fl * 8;
      void y;
      const isF3 = fl === 2 && c === 0;
      const lit = !isF3 && random(`lit${fl}${c}`) > 0.72;
      rows.push(
        <g key={`${fl}-${c}`}>
          <rect x={x} y={yy + 100} width={118} height={12} fill="#0b0f16" />
          <rect
            x={x}
            y={yy}
            width={118}
            height={100}
            fill={isF3 ? `rgba(255,180,84,${0.7 * litFlicker})` : lit ? "rgba(255,210,150,0.35)" : "#06080d"}
            stroke="#1f2733"
            strokeWidth={5}
          />
          <line x1={x + 59} y1={yy} x2={x + 59} y2={yy + 100} stroke="#1f2733" strokeWidth={4} />
          {isF3 && <rect x={x - 8} y={yy - 8} width={134} height={116} fill="none" stroke="#E5202E" strokeWidth={4} strokeDasharray="14 10" />}
        </g>,
      );
    }
  }
  return (
    <svg viewBox="0 0 700 900" width="700" height="900">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2230" />
          <stop offset="1" stopColor="#0a0d14" />
        </linearGradient>
      </defs>
      <rect x="90" y="60" width="520" height="780" fill="url(#wall)" stroke="#0a0d14" strokeWidth="6" />
      <rect x="70" y="48" width="560" height="26" fill="#121722" />
      {/* vết nứt tường */}
      <path d="M520 80 L505 190 L535 260 L500 360 L526 470" stroke="#07090e" strokeWidth="5" fill="none" />
      <path d="M130 600 L170 680 L150 760" stroke="#07090e" strokeWidth="4" fill="none" />
      {rows}
      {/* dây điện */}
      <path d="M0 40 Q 200 120 360 70 T 700 110" stroke="#05070b" strokeWidth="4" fill="none" />
      <path d="M0 78 Q 240 150 420 104 T 700 150" stroke="#05070b" strokeWidth="3" fill="none" />
      {/* cửa hẻm */}
      <rect x="300" y="700" width="110" height="140" fill="#05070b" />
    </svg>
  );
};

/* ================= MẶT CẮT GIẾNG TRỜI ================= */
export const ShaftDiagram: React.FC<{ reveal: number; pulse: number; showX: number }> = ({ reveal, pulse, showX }) => {
  const floorY = (i: number) => 150 + i * 150; // 0..3
  return (
    <svg viewBox="0 0 860 860" width="860" height="860">
      {/* nhà trái & phải */}
      <rect x="40" y="110" width="300" height="660" fill="#0f141d" stroke="#222b3a" strokeWidth="4" />
      <rect x="520" y="110" width="300" height="660" fill="#0f141d" stroke="#222b3a" strokeWidth="4" />
      {/* giếng trời */}
      <defs>
        <linearGradient id="shaftG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(191,215,230,0.55)" />
          <stop offset="0.35" stopColor="rgba(60,80,96,0.35)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.95)" />
        </linearGradient>
      </defs>
      <rect x="340" y="110" width="180" height="660" fill="url(#shaftG)" />
      {/* sàn các tầng */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1="40" x2="340" y1={floorY(i) + 120} y2={floorY(i) + 120} stroke="#222b3a" strokeWidth="4" />
          <line x1="520" x2="820" y1={floorY(i) + 120} y2={floorY(i) + 120} stroke="#222b3a" strokeWidth="4" />
          {i !== 1 && (
            <text x="56" y={floorY(i) + 100} fill="rgba(234,229,217,0.35)" fontFamily="Consolas, monospace" fontSize="22" letterSpacing="3">
              {`TẦNG ${4 - i}`}
            </text>
          )}
        </g>
      ))}
      {/* phòng của mình — tầng 3 (hàng i=1) */}
      <rect x="44" y={floorY(1) + 4} width="292" height="112" fill="rgba(255,180,84,0.13)" />
      <rect x="300" y={floorY(1) + 30} width="40" height="62" fill="rgba(255,180,84,0.8)" />
      <circle cx="320" cy={floorY(1) + 61} r={30 + pulse * 22} fill="none" stroke="#E5202E" strokeWidth="5" opacity={0.9 - pulse * 0.6} />
      <text x="64" y={floorY(1) + 70} fill="#FFB454" fontFamily="Consolas, monospace" fontSize="24" fontWeight="700" letterSpacing="2">
        PHÒNG T.3
      </text>
      {/* sân thượng & mặt đất */}
      <text x="352" y="96" fill="rgba(191,215,230,0.8)" fontFamily="Consolas, monospace" fontSize="22" letterSpacing="3">
        SÂN THƯỢNG
      </text>
      <text x="356" y="812" fill="rgba(234,229,217,0.5)" fontFamily="Consolas, monospace" fontSize="22" letterSpacing="3">
        MẶT ĐẤT
      </text>
      {/* mũi tên rơi thẳng */}
      <path d="M430 150 L430 740" stroke="rgba(234,229,217,0.35)" strokeWidth="3" strokeDasharray="10 12" opacity={reveal} />
      <path d="M418 724 L430 748 L442 724" fill="rgba(234,229,217,0.5)" opacity={reveal} />
      {/* dấu ✕ không bệ đỡ */}
      <g opacity={showX} transform={`translate(${430 - 0},${floorY(1) + 61})`}>
        <circle r="46" fill="rgba(0,0,0,0.78)" stroke="#E5202E" strokeWidth="6" />
        <line x1="-22" y1="-22" x2="22" y2="22" stroke="#E5202E" strokeWidth="10" strokeLinecap="round" />
        <line x1="22" y1="-22" x2="-22" y2="22" stroke="#E5202E" strokeWidth="10" strokeLinecap="round" />
      </g>
    </svg>
  );
};

/* ================= đồng hồ số ================= */
export const DigitalClock: React.FC<{ text: string; color?: string; size?: number; glitch?: number }> = ({
  text,
  color = HC.red,
  size = 220,
  glitch = 0,
}) => (
  <div
    style={{
      fontFamily: F.mono,
      fontSize: size,
      fontWeight: 900,
      color,
      letterSpacing: 6,
      textShadow: `0 0 ${24 + glitch * 30}px ${color}, 0 0 80px ${color}66`,
      transform: `translateX(${glitch * (Math.random() > 2 ? 0 : 0)}px)`,
    }}
  >
    {text}
  </div>
);
