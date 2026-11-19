import React from "react";
import { useCurrentFrame, useVideoConfig, random, interpolate } from "remotion";
import { STORY } from "../storyTimeline";
import type { Chunk } from "../storyTimeline";
import { F } from "../lib";
import { HC, M, useT, noiseUrl, clamp01 } from "./common";

const chunks = STORY.chunks as unknown as Chunk[];

/* ---------- PHỤ ĐỀ từng từ, bám timestamp ElevenLabs ---------- */
const SCARY = new Set([
  "bóng", "ngón", "tay", "bàn", "cạch", "gõ", "thở", "nhang", "rít", "ken", "két", "kính", "giếng", "trời", "lạnh", "gáy",
  "rờn", "rợn", "hắt", "ẩm", "mốc", "cứng", "đờ", "mồ", "hôi", "nín", "thứ", "ba", "một", "giờ", "rưỡi", "miết", "áp", "sát",
  "trống", "suốt", "đừng", "tuyệt", "đối", "tê", "rần", "khói",
]);
const normW = (w: string) => w.toLowerCase().replace(/[.,!?…"“”]/g, "");

export const Captions: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const cur = chunks.find((c) => t >= c.s - 0.04 && t < c.hold);
  if (!cur) return null;
  const age = (t - cur.s + 0.04) * fps;
  const sc = interpolate(age, [0, 3, 6], [0.86, 1.05, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const op = clamp01(age / 2);
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 140,
        top: 1210,
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${sc})`,
        opacity: op,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 22px", maxWidth: 830, padding: "12px 0" }}>
        {cur.words.map((w, i) => {
          const active = t >= w.s - 0.02 && t < w.e + 0.04;
          const past = t >= w.e + 0.04;
          const scary = SCARY.has(normW(w.w));
          const color = active ? (scary ? "#FF4B57" : HC.yellow) : past ? "#FFFFFF" : "rgba(255,255,255,0.5)";
          return (
            <span
              key={i}
              style={{
                fontFamily: F.display,
                fontSize: 76,
                lineHeight: 1.2,
                fontWeight: 900,
                textTransform: "uppercase",
                color,
                letterSpacing: -1,
                WebkitTextStroke: "10px rgba(0,0,0,0.92)",
                paintOrder: "stroke fill",
                textShadow: active && scary ? "0 0 36px rgba(229,32,46,0.9)" : "0 6px 22px rgba(0,0,0,0.7)",
                transform: `scale(${active ? 1.08 : 1}) translateY(${active ? -4 : 0}px)`,
                display: "inline-block",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Lớp hiệu ứng điện ảnh dùng chung ---------- */
const GLITCH_AT = [M.hook_night3, M.night3, M.knock1, M.fivefingers, M.screech, M.breath, M.landlady2, M.p6, M.p7, M.chill];

export const Cinematic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // nhịp tim: tăng dần từ "nín thở" tới hết cảnh bàn tay
  const hbOn = t > M.holdbreath && t < M.p8 + 0.5;
  const hbK = hbOn ? clamp01((t - M.holdbreath) / 25) : 0;
  const beat = hbOn ? Math.pow(Math.max(0, Math.sin(t * (2.6 + hbK * 1.6) * Math.PI)), 6) : 0;

  // flicker đèn
  const flickRate = t > M.screenoff && t < M.p8 ? 0.07 : 0.025;
  const flick = random(`fl${frame}`) < flickRate ? 0.32 + random(`fa${frame}`) * 0.3 : 0;

  // glitch bursts
  const g = GLITCH_AT.find((x) => t >= x && t < x + 0.22);
  const gi = g !== undefined ? Math.floor((t - g) * fps) : -1;

  return (
    <>
      {/* hạt phim */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          backgroundImage: `url(${noiseUrl()})`,
          backgroundSize: "540px 540px",
          backgroundPosition: `${Math.floor(random(`gx${frame}`) * 540)}px ${Math.floor(random(`gy${frame}`) * 540)}px`,
          mixBlendMode: "overlay",
          opacity: 0.2,
        }}
      />
      {/* scanline */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 4px)",
          opacity: 0.5,
        }}
      />
      {/* vignette + nhịp tim đỏ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 75% 62% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,${0.78 + beat * 0.1}) 100%)`,
        }}
      />
      {hbOn && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 80% 65% at 50% 50%, rgba(0,0,0,0) 45%, rgba(229,32,46,${(0.12 + hbK * 0.3) * beat}) 100%)`,
          }}
        />
      )}
      {flick > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${flick})` }} />}
      {/* glitch */}
      {gi >= 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const y = random(`gy${gi}_${i}`) * height;
          const h = 14 + random(`gh${gi}_${i}`) * 90;
          const dx = (random(`gd${gi}_${i}`) - 0.5) * 120;
          const col = ["rgba(255,40,60,0.35)", "rgba(40,255,230,0.3)", "rgba(255,255,255,0.28)"][i % 3];
          return <div key={i} style={{ position: "absolute", left: dx, width, top: y, height: h, background: col, mixBlendMode: "screen" }} />;
        })}
    </>
  );
};

/* ---------- HUD kiểu camera ghi hình ---------- */
const chapterOf = (t: number) => {
  if (t < M.p1) return "PROLOGUE";
  if (t < M.p3) return "01 · CĂN PHÒNG";
  if (t < M.p6) return "02 · ĐÊM THỨ BA";
  if (t < M.p8) return "03 · BÓNG TAY";
  if (t < M.vo_end) return "04 · SÁNG HÔM SAU";
  return "KẾT";
};
const tc = (t: number) => {
  const s = Math.floor(t);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export const Hud: React.FC = () => {
  const t = useT();
  const blink = Math.floor(t * 1.6) % 2 === 0;
  const prog = clamp01(t / STORY.total);
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 122, height: 5, width: 1080 * prog, background: HC.red, boxShadow: "0 0 14px rgba(229,32,46,0.9)" }} />
      <div style={{ position: "absolute", left: 110, top: 150, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: blink ? HC.red : "rgba(229,32,46,0.25)", boxShadow: blink ? "0 0 18px #E5202E" : "none" }} />
        <div style={{ fontFamily: F.mono, fontSize: 28, color: HC.paper, letterSpacing: 4, fontWeight: 700 }}>REC {tc(t)}</div>
      </div>
      <div style={{ position: "absolute", right: 140, top: 154, fontFamily: F.mono, fontSize: 24, color: HC.dim, letterSpacing: 4, fontWeight: 700 }}>
        {chapterOf(t)}
      </div>
    </>
  );
};
