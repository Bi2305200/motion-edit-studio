import React from "react";
import { random } from "remotion";
import { F } from "../lib";
import { HC, M, Scene, Bg, Big, Tag, useT, useSpringAt, ramp, eo, lerp, clamp01, shake, easeInOut } from "./common";
import { GlassWindow, Hand, Building, ShaftDiagram, DigitalClock } from "./art";

/* ---------- tiện ích ---------- */
const Stage: React.FC<{ children: React.ReactNode; top?: number; height?: number; style?: React.CSSProperties }> = ({
  children,
  top = 200,
  height = 980,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top,
      width: 1080,
      height,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; from?: number }> = ({ at, children, style, from = 0.6 }) => {
  const s = useSpringAt(at);
  const t = useT();
  if (t < at) return null;
  return <div style={{ transform: `scale(${lerp(from, 1, s)})`, opacity: clamp01(s * 1.6), ...style }}>{children}</div>;
};

const Fade: React.FC<{ a: number; b: number; children: React.ReactNode; style?: React.CSSProperties; rise?: number }> = ({ a, b, children, style, rise = 0 }) => {
  const t = useT();
  const o = Math.min(ramp(t, a, a + 0.4), 1 - ramp(t, b - 0.3, b));
  if (o <= 0) return null;
  return <div style={{ opacity: o, transform: `translateY(${(1 - ramp(t, a, a + 0.5)) * rise}px)`, ...style }}>{children}</div>;
};

/* ================= 1. HOOK ================= */
export const SceneHook: React.FC = () => {
  const t = useT();
  const f = Math.round(t * 30);
  const night3 = t >= M.hook_night3;
  const sh = night3 ? shake(f, 5 * ramp(t, M.hook_night3, M.hook_night3 + 0.3), "h") : { x: 0, y: 0 };
  return (
    <Scene a={0} b={M.p1} fadeIn={0.05} fadeOut={0.5}>
      <Bg tint="#1a0f14" y={42} />
      <Stage>
        {!night3 && (
          <div style={{ textAlign: "center", opacity: 1 - ramp(t, M.hook_night3 - 0.25, M.hook_night3) }}>
            <Pop at={0.25}>
              <Tag color={HC.amber} size={28}>● CÂU CHUYỆN CÓ THẬT · NGƯỜI THUÊ KỂ LẠI</Tag>
            </Pop>
            <Pop at={0.35} style={{ marginTop: 40 }}>
              <Big size={136}>PHÒNG TRỌ</Big>
            </Pop>
            <Pop at={M.hook_price - 0.1} style={{ marginTop: 6 }}>
              <Big size={156} color={HC.red} style={{ textShadow: "0 0 60px rgba(229,32,46,0.7)" }}>
                1,5 TRIỆU
              </Big>
            </Pop>
            <Pop at={M.hook_price + 0.5} style={{ marginTop: 24 }}>
              <Tag color={HC.paper} size={36}>NGAY BÌNH THẠNH · TP.HCM</Tag>
            </Pop>
          </div>
        )}
        {night3 && (
          <div style={{ textAlign: "center", transform: `translate(${sh.x}px, ${sh.y}px)` }}>
            <Pop at={M.hook_night3 - 0.05} from={1.5}>
              <Big size={108} color={HC.paper}>ĐÊM THỨ</Big>
            </Pop>
            <Pop at={M.hook_night3 + 0.1} from={2.4} style={{ marginTop: 42 }}>
              <Big size={380} color={HC.red} style={{ lineHeight: 0.92, textShadow: "0 0 120px rgba(229,32,46,0.85)" }}>3</Big>
            </Pop>
            <Pop at={M.hook_empty - 0.1} style={{ marginTop: 28 }}>
              <Tag color={HC.paper} size={34}>VÌ SAO PHÒNG TRỐNG SUỐT?</Tag>
            </Pop>
          </div>
        )}
      </Stage>
    </Scene>
  );
};

/* ================= 2. TÌM TRỌ / GIÁ ================= */
const FEED = [
  ["Phòng trọ Quận 7 · 2.8tr", "Gần chợ · có gác"],
  ["Phòng Gò Vấp · 3.2tr", "Máy lạnh · wc riêng"],
  ["Cho thuê Q.10 · 3.5tr", "Full nội thất"],
  ["Phòng Phú Nhuận · 3tr", "Cọc 2 tháng"],
  ["Phòng Bình Thạnh · 3.8tr", "Gần công ty"],
  ["Hẻm Điện Biên Phủ · 1.5tr", "Phòng tầng 3 · còn trống"],
];

const FeedCard: React.FC<{ title: string; sub: string; hot?: boolean; y: number }> = ({ title, sub, hot, y }) => (
  <div
    style={{
      position: "absolute",
      left: 150,
      top: y,
      width: 780,
      height: 210,
      borderRadius: 26,
      background: hot ? "rgba(255,180,84,0.14)" : "rgba(255,255,255,0.05)",
      border: hot ? `3px solid ${HC.amber}` : "2px solid rgba(255,255,255,0.08)",
      boxShadow: hot ? "0 0 60px rgba(255,180,84,0.35)" : "none",
      display: "flex",
      alignItems: "center",
      padding: "0 34px",
      gap: 28,
    }}
  >
    <div style={{ width: 110, height: 110, borderRadius: 55, background: hot ? HC.amber : "rgba(255,255,255,0.12)" }} />
    <div>
      <div style={{ fontFamily: F.display, fontSize: 40, color: hot ? HC.paper : "rgba(234,229,217,0.7)", fontWeight: 900 }}>{title}</div>
      <div style={{ fontFamily: F.body, fontSize: 30, color: HC.dim, marginTop: 8 }}>{sub}</div>
    </div>
  </div>
);

export const SceneListing: React.FC = () => {
  const t = useT();
  const priceK = eo(t, M.price, M.price + 1.8);
  const priceNow = Math.round(1500000 * priceK);
  const stampT = M.cheap;
  const stampS = useSpringAt(stampT, { damping: 9, stiffness: 240, mass: 0.6 });
  const f = Math.round(t * 30);
  const sh = t > stampT && t < stampT + 0.35 ? shake(f, 9, "st") : { x: 0, y: 0 };
  // cuộn feed: dừng ở thẻ cuối đúng tại 'price'
  const scroll = easeInOut(ramp(t, M.fb_post, M.price - 0.2)) * (FEED.length - 1) * 240;
  return (
    <>
      {/* a) bản đồ */}
      <Scene a={M.p1} b={M.fb_post}>
        <Bg tint="#0e1c26" y={44} />
        <div
          style={{
            position: "absolute",
            left: 110,
            top: 230,
            width: 830,
            height: 880,
            borderRadius: 40,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(rgba(111,211,196,0.08) 1px, transparent 1px) 0 0/80px 80px, linear-gradient(90deg, rgba(111,211,196,0.08) 1px, transparent 1px) 0 0/80px 80px, #08111a",
          }}
        >
          <svg viewBox="0 0 830 880" width="830" height="880" style={{ position: "absolute", inset: 0 }}>
            <path d="M-20 680 Q 270 500 415 500 T 850 280" stroke="rgba(111,211,196,0.35)" strokeWidth="26" fill="none" />
            <path d="M180 -20 Q 230 380 470 500 T 630 900" stroke="rgba(255,255,255,0.12)" strokeWidth="16" fill="none" />
            <path d="M-20 250 L 850 400" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
          </svg>
          <div style={{ position: "absolute", left: 415 - 14, top: 486 }}>
            {[0, 1, 2].map((i) => {
              const k = ((t * 0.8 + i / 3) % 1);
              return <div key={i} style={{ position: "absolute", left: 14 - 120 * k, top: 14 - 120 * k, width: 240 * k, height: 240 * k, borderRadius: 999, border: `3px solid rgba(229,32,46,${0.7 * (1 - k)})` }} />;
            })}
            <div style={{ width: 28, height: 28, borderRadius: 14, background: HC.red, boxShadow: "0 0 30px #E5202E" }} />
          </div>
          <Pop at={M.p1 + 0.5} style={{ position: "absolute", left: 0, right: 0, top: 340, textAlign: "center" }}>
            <Big size={96}>BÌNH THẠNH</Big>
          </Pop>
          <Pop at={M.p1 + 1.4} style={{ position: "absolute", left: 24, right: 24, top: 650, textAlign: "center" }}>
            <Tag color={HC.amber} size={26}>CẦN TRỌ GẤP · GẦN CÔNG TY · TIẾT KIỆM</Tag>
          </Pop>
        </div>
      </Scene>

      {/* b) lướt nhóm tìm trọ */}
      <Scene a={M.fb_post} b={M.price}>
        <Bg tint="#101a2a" y={45} />
        <div style={{ position: "absolute", left: 0, top: 200, width: 1080, height: 980, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 380 - scroll }}>
            {FEED.map((c, i) => (
              <FeedCard key={i} title={c[0]} sub={c[1]} hot={i === FEED.length - 1} y={i * 240} />
            ))}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 180, background: "linear-gradient(180deg, #04060A, rgba(4,6,10,0))" }} />
        </div>
        <Fade a={M.fb_post} b={M.price} style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center" }}>
          <Tag color={HC.paper} size={32}>LƯỚT HỘI NHÓM · CẢ TUẦN TRỜI</Tag>
        </Fade>
      </Scene>

      {/* c) giá */}
      <Scene a={M.price} b={M.p2}>
        <Bg tint="#1d130a" y={42} />
        <Stage>
          <Tag color={HC.amber} size={30}>GIÁ THUÊ · MỖI THÁNG</Tag>
          <Big size={112} color={HC.paper} style={{ marginTop: 26, fontFamily: F.mono, letterSpacing: 0 }}>
            {priceNow.toLocaleString("vi-VN")}đ
          </Big>
          <div style={{ marginTop: 46, width: 760 }}>
            <Tag size={26} color={HC.dim}>TRUNG BÌNH KHU VỰC · 3.500.000đ</Tag>
            <div style={{ height: 26, borderRadius: 13, background: "rgba(255,255,255,0.18)", marginTop: 12, width: 760 * eo(t, M.price + 0.6, M.price + 1.4) }} />
            <Tag size={26} color={HC.amber} style={{ marginTop: 28 }}>PHÒNG NÀY · 1.500.000đ</Tag>
            <div style={{ height: 26, borderRadius: 13, background: HC.amber, marginTop: 12, width: 760 * 0.43 * eo(t, M.price + 1.0, M.price + 1.8), boxShadow: "0 0 30px rgba(255,180,84,0.6)" }} />
          </div>
          {t >= stampT && (
            <div
              style={{
                marginTop: 64,
                transform: `translate(${sh.x}px, ${sh.y}px) rotate(-5deg) scale(${lerp(2.2, 1, stampS)})`,
                opacity: clamp01(stampS * 2),
                border: `10px solid ${HC.red}`,
                borderRadius: 18,
                padding: "12px 34px",
                background: "rgba(229,32,46,0.12)",
              }}
            >
              <Big size={74} color={HC.red} style={{ textShadow: "none" }}>RẺ BẤT THƯỜNG</Big>
            </div>
          )}
        </Stage>
      </Scene>
    </>
  );
};

/* ================= 3. CĂN PHÒNG ================= */
export const SceneBuilding: React.FC = () => {
  const t = useT();
  // zoom vào cửa sổ tầng 3
  const z = easeInOut(ramp(t, M.p2 + 0.6, M.floor3 + 2.5));
  const scale = lerp(1.05, 2.0, z);
  // tâm cửa sổ tầng 3 trong khung 700x900 = (219, 438)
  const ox = 219, oy = 438;
  const ty = lerp(0, 120, z);
  return (
    <>
      <Scene a={M.p2} b={M.warn}>
        <Bg tint="#101820" y={40} />
        <div style={{ position: "absolute", left: 190, top: 200, width: 700, height: 840, overflow: "hidden", borderRadius: 24 }}>
          <div style={{ transformOrigin: `${ox}px ${oy}px`, transform: `translateY(${ty}px) scale(${scale})` }}>
            <Building litFlicker={0.75 + 0.25 * Math.sin(t * 9)} />
          </div>
        </div>
        <Fade a={M.floor3 - 0.1} b={M.area - 0.1} style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center" }} rise={20}>
          <Big size={84} color={HC.amber}>TẦNG 3</Big>
        </Fade>
        <Pop at={M.area} style={{ position: "absolute", left: 0, right: 0, top: 1055, textAlign: "center" }}>
          <div style={{ display: "inline-block", border: `4px solid ${HC.paper}`, borderRadius: 18, padding: "6px 28px", background: "rgba(0,0,0,0.72)" }}>
            <Big size={74}>TẦNG 3 · 15 m²</Big>
          </div>
        </Pop>
      </Scene>

      {/* lời dặn của cô chủ */}
      <Scene a={M.warn} b={M.p3}>
        <Bg tint="#1d0c10" y={40} />
        <Stage>
          <Pop at={M.warn}>
            <DigitalClock text="23:00" size={230} />
          </Pop>
          <Pop at={M.window - 0.2} style={{ marginTop: 40 }}>
            <div style={{ position: "relative" }}>
              <GlassWindow w={360} h={470} glow={0.1} />
              <div
                style={{
                  position: "absolute",
                  left: -20,
                  top: 30,
                  width: 400,
                  height: 400,
                  borderRadius: 999,
                  border: `20px solid ${HC.red}`,
                  boxShadow: "0 0 50px rgba(229,32,46,0.8)",
                }}
              />
              <div style={{ position: "absolute", left: 170, top: -10, width: 20, height: 470, background: HC.red, transform: "rotate(45deg)", transformOrigin: "50% 50%", boxShadow: "0 0 40px rgba(229,32,46,0.8)" }} />
            </div>
          </Pop>
          <Pop at={M.window + 0.8} style={{ marginTop: 40 }}>
            <Tag color={HC.red} size={36}>TUYỆT ĐỐI KHÔNG MỞ</Tag>
          </Pop>
        </Stage>
      </Scene>
    </>
  );
};

/* ================= 4. HAI ĐÊM ĐẦU / ĐÊM THỨ BA ================= */
const NightCard: React.FC<{ at: number; label: string; mark: string; color: string; bad?: boolean }> = ({ at, label, mark, color, bad }) => {
  const t = useT();
  const f = Math.round(t * 30);
  const s = useSpringAt(at, { damping: bad ? 9 : 14 });
  if (t < at) return <div style={{ height: 210 }} />;
  const sh = bad ? shake(f, 4 + 3 * Math.sin(t * 6), "nc") : { x: 0, y: 0 };
  return (
    <div
      style={{
        width: 800,
        height: 190,
        marginBottom: 24,
        borderRadius: 28,
        border: `4px solid ${color}`,
        background: bad ? "rgba(229,32,46,0.14)" : "rgba(255,255,255,0.05)",
        boxShadow: bad ? "0 0 70px rgba(229,32,46,0.5)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 50px",
        transform: `translate(${sh.x}px,${sh.y}px) scale(${lerp(0.8, 1, s)})`,
        opacity: clamp01(s * 1.8),
      }}
    >
      <Big size={92} color={color}>{label}</Big>
      <Big size={110} color={color} style={{ fontFamily: F.mono }}>{mark}</Big>
    </div>
  );
};

export const SceneNights: React.FC = () => {
  const t = useT();
  const hot = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <>
      <Scene a={M.p3} b={M.t0130}>
        <Bg tint="#0e1822" y={42} />
        <Stage>
          <Tag color={HC.dim} size={28} style={{ marginBottom: 36 }}>NHẬT KÝ Ở TRỌ</Tag>
          <NightCard at={M.night1 + 0.2} label="ĐÊM 1" mark="✓" color={HC.teal} />
          <NightCard at={M.night1 + 1.7} label="ĐÊM 2" mark="✓" color={HC.teal} />
          <NightCard at={M.night3 - 0.1} label="ĐÊM 3" mark="?" color={HC.red} bad />
        </Stage>
      </Scene>

      <Scene a={M.t0130} b={M.p4}>
        <Bg tint="#1b0e0e" y={40} />
        <Stage>
          <Pop at={M.t0130 - 0.1} from={1.4}>
            <DigitalClock text="01:30" size={250} />
          </Pop>
          <Tag color={HC.red} size={34} style={{ marginTop: 10 }}>SÁNG · ĐÊM THỨ BA</Tag>
          <Pop at={M.aircon - 0.1} style={{ marginTop: 70, display: "flex", alignItems: "center", gap: 36 }}>
            <div style={{ border: `4px solid ${HC.amber}`, borderRadius: 24, padding: "16px 34px", background: "rgba(255,180,84,0.1)" }}>
              <Big size={96} color={HC.amber} style={{ fontFamily: F.mono, letterSpacing: 0 }}>34°C</Big>
            </div>
            <div>
              <Tag color={HC.amber} size={28}>MÁY LẠNH CŨ</Tag>
              <svg width="360" height="70" viewBox="0 0 360 70" style={{ marginTop: 12 }}>
                {[0, 1, 2].map((i) => (
                  <path
                    key={i}
                    d={`M0 ${14 + i * 22} q 30 -${10 + hot * 8} 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`}
                    stroke={HC.amber}
                    strokeWidth="5"
                    fill="none"
                    opacity={0.8 - i * 0.2}
                  />
                ))}
              </svg>
            </div>
          </Pop>
          <Pop at={M.phone} style={{ marginTop: 70, width: 260, height: 100 }}>
            <div style={{ width: 260, height: 100, borderRadius: "40px 40px 0 0", background: "linear-gradient(180deg, rgba(191,215,230,0.55), rgba(191,215,230,0.05))", boxShadow: "0 -30px 90px rgba(191,215,230,0.45)" }} />
          </Pop>
        </Stage>
      </Scene>
    </>
  );
};

/* ================= 5. TIẾNG GÕ ================= */
const knockTimes = (() => {
  const arr = [M.knock1, M.knock1 + 0.45, M.knock2, M.knock2 + 0.55];
  for (let x = M.rhythm + 0.4; x < M.p5 - 1.2; x += 0.85) arr.push(x);
  return arr;
})();

export const SceneKnock: React.FC = () => {
  const t = useT();
  const f = Math.round(t * 30);
  // năng lượng gõ gần nhất
  let env = 0;
  for (const k of knockTimes) {
    const d = t - k;
    if (d >= 0 && d < 0.5) env = Math.max(env, Math.exp(-d * 9));
  }
  const last = [...knockTimes].reverse().find((k) => t >= k);
  const sh = shake(f, env * 5, "kn");
  return (
    <Scene a={M.p4} b={M.p5}>
      <Bg tint="#0d1a22" y={40} />
      <Stage top={190} height={900}>
        <div style={{ transform: `translate(${sh.x}px,${sh.y}px)` }}>
          <GlassWindow w={560} h={760} glow={0.12 + env * 0.15}>
            {knockTimes.map((k, i) => {
              const d = t - k;
              if (d < 0 || d > 0.9) return null;
              const x = 120 + random(`kx${i}`) * 260;
              const y = 200 + random(`ky${i}`) * 300;
              const r = 30 + d * 300;
              return (
                <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999, border: `4px solid rgba(255,255,255,${0.7 * (1 - d / 0.9)})` }} />
              );
            })}
            {last !== undefined && t - last < 0.45 && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", opacity: 1 - (t - last) / 0.45, transform: `scale(${1 + (t - last) * 0.5})` }}>
                <Big size={150} color={HC.paper} style={{ textShadow: "0 0 40px rgba(0,0,0,0.8)" }}>CẠCH!</Big>
              </div>
            )}
          </GlassWindow>
        </div>
      </Stage>
      {/* sóng âm */}
      <div style={{ position: "absolute", left: 140, top: 1100, width: 800, height: 90, display: "flex", alignItems: "center", gap: 6 }}>
        {Array.from({ length: 48 }).map((_, i) => {
          const base = 0.08 + 0.05 * random(`w${i}${Math.floor(t * 12)}`);
          const h = 6 + (base + env * (0.5 + 0.5 * random(`wb${i}${Math.floor(t * 20)}`))) * 90;
          return <div key={i} style={{ flex: 1, height: h, borderRadius: 4, background: env > 0.15 ? HC.paper : "rgba(234,229,217,0.35)" }} />;
        })}
      </div>
    </Scene>
  );
};

/* ================= 6. GIẾNG TRỜI ================= */
export const SceneShaft: React.FC = () => {
  const t = useT();
  const f = Math.round(t * 30);
  const reveal = eo(t, M.shaft, M.shaft + 1);
  const pulse = (t * 0.9) % 1;
  const showX = eo(t, M.nobalcony, M.nobalcony + 0.4);
  const chill = t > M.chill && t < M.chill + 1.6 ? shake(f, 4, "ch") : { x: 0, y: 0 };
  return (
    <Scene a={M.p5} b={M.p6}>
      <Bg tint="#0c1822" y={44} />
      <Stage top={200} height={960}>
        <div style={{ transform: `translate(${chill.x}px,${chill.y}px) scale(0.94)`, opacity: 0.35 + 0.65 * ramp(t, M.p5, M.p5 + 0.8) }}>
          <ShaftDiagram reveal={reveal} pulse={pulse} showX={showX} />
        </div>
      </Stage>
      <Fade a={M.nobalcony} b={M.holdbreath} style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center" }} rise={14}>
        <Tag color={HC.red} size={32}>KHÔNG BAN CÔNG · KHÔNG BỆ ĐỠ</Tag>
      </Fade>
      <Fade a={M.holdbreath} b={M.p6} style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center" }} rise={14}>
        <Tag color={HC.paper} size={36}>NÍN THỞ · NGHE NGÓNG</Tag>
      </Fade>
    </Scene>
  );
};

/* ================= 7. BÓNG BÀN TAY + HƠI THỞ ================= */
export const SceneHand: React.FC = () => {
  const t = useT();
  const f = Math.round(t * 30);
  // ánh sáng đèn đường hắt vào
  const glow = lerp(0.04, 0.95, eo(t, M.streetlight, M.streetlight + 1.4));
  // bàn tay xuất hiện
  const hAp = eo(t, M.fivefingers - 0.2, M.fivefingers + 1.2);
  const hBlur = lerp(14, 3, hAp);
  // trượt xuống tới mép dưới
  const slideK = easeInOut(ramp(t, M.slide - 0.1, M.shadowstop + 0.8));
  const dy = slideK * 330;
  const screech = t > M.screech && t < M.screech + 1.8;
  const sh = screech ? shake(f, 5, "sc") : { x: 0, y: 0 };
  const frozen = ramp(t, M.frozen, M.frozen + 6);
  // hơi thở
  const breathK = ramp(t, M.breath - 0.3, M.breath + 1.2);
  const fogPulse = 0.55 + 0.45 * Math.sin(Math.max(0, t - M.breath) * 2.2);
  return (
    <Scene a={M.p6} b={M.p8} fadeOut={0.6}>
      <Bg tint={t < M.streetlight ? "#05080c" : "#1c1208"} y={40} />
      <Stage top={175} height={930}>
        <div style={{ transform: `translate(${sh.x}px,${sh.y}px) scale(${1 + frozen * 0.08})` }}>
          <GlassWindow w={600} h={820} glow={glow * (1 - breathK * 0.25)}>
            {/* vệt xước theo ngón tay */}
            {[88, 134, 182, 226].map((x, i) => {
              const len = Math.max(0, dy - 20 + i * 6);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 36 + x * 1.6 - 10,
                    top: 90,
                    width: 6,
                    height: len,
                    background: "linear-gradient(180deg, rgba(255,255,255,0.0), rgba(255,235,200,0.5))",
                    borderRadius: 3,
                    filter: "blur(1px)",
                  }}
                />
              );
            })}
            {/* bàn tay */}
            <div style={{ position: "absolute", left: 95, top: 55 + dy * 0.85, opacity: hAp }}>
              <Hand width={400} blur={hBlur} />
            </div>
            {/* hơi ẩm đọng trên kính */}
            <div style={{ position: "absolute", left: -40, right: -40, bottom: -20, height: 480, opacity: breathK * fogPulse, background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(235,235,225,0.75), rgba(235,235,225,0.0) 70%)", filter: "blur(18px)" }} />
            {/* khói nhang */}
            {t > M.incense - 0.4 &&
              [0, 1, 2].map((i) => {
                const k = (((t - M.incense) * 0.35 + i / 3) % 1 + 1) % 1;
                return (
                  <div key={i} style={{ position: "absolute", left: 110 + i * 140 + Math.sin(k * 8 + i) * 40, bottom: -20 + k * 520, width: 120, height: 220, borderRadius: 999, background: "rgba(220,215,205,0.32)", filter: "blur(30px)", opacity: Math.sin(k * Math.PI) * 0.8 }} />
                );
              })}
          </GlassWindow>
        </div>
      </Stage>
      <Fade a={M.screech} b={M.sweat + 1} style={{ position: "absolute", left: 0, right: 0, top: 1125, textAlign: "center" }}>
        <Tag color={HC.red} size={34}>KÉT... KÉT... KÉT...</Tag>
      </Fade>
      <Fade a={M.breath} b={M.p8} style={{ position: "absolute", left: 0, right: 0, top: 1125, textAlign: "center" }}>
        <Tag color={HC.paper} size={32}>HƠI ẨM MỐC · MÙI NHANG KHÓI CŨ</Tag>
      </Fade>
    </Scene>
  );
};

/* ================= 8. SÁNG HÔM SAU ================= */
const clockText = (mins: number) => {
  const m = Math.floor(mins);
  const hh = String(Math.floor(m / 60) % 24).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const KeySvg: React.FC<{ swing: number }> = ({ swing }) => (
  <svg viewBox="0 0 260 520" width="240" height="480" style={{ transformOrigin: "50% 0%", transform: `rotate(${swing}deg)` }}>
    <line x1="130" y1="0" x2="130" y2="90" stroke="#8a93a1" strokeWidth="5" />
    <circle cx="130" cy="130" r="48" fill="none" stroke={HC.amber} strokeWidth="14" />
    <rect x="118" y="176" width="24" height="270" rx="8" fill={HC.amber} />
    <rect x="142" y="380" width="60" height="22" rx="6" fill={HC.amber} />
    <rect x="142" y="420" width="44" height="22" rx="6" fill={HC.amber} />
  </svg>
);

export const SceneMorning: React.FC = () => {
  const t = useT();
  // time-lapse 01:40 -> 05:50
  const k = easeInOut(ramp(t, M.p8 + 0.6, M.traffic + 1.5));
  const mins = lerp(100, 350, k);
  const dawn = ramp(t, M.traffic - 0.5, M.traffic + 3);
  const swing = Math.sin(t * 3) * 14 * Math.exp(-Math.max(0, t - M.keys) * 0.25);
  const handFlick = 0.12 + 0.2 * Math.max(0, Math.sin(t * 1.3)) * ramp(t, M.today, M.today + 2);
  return (
    <>
      {/* thức trắng đến sáng */}
      <Scene a={M.p8} b={M.morning}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgb(${lerp(4, 40, dawn)},${lerp(6, 60, dawn)},${lerp(10, 90, dawn)}), #04060A)` }} />
        <Stage>
          <Tag color={HC.dim} size={30} style={{ marginBottom: 20 }}>TRÙM CHĂN · THỨC TRẮNG</Tag>
          <DigitalClock text={clockText(mins)} color={dawn > 0.5 ? HC.ice : HC.red} size={250} />
          {t >= M.traffic - 0.2 && (
            <div style={{ marginTop: 70, display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} style={{ width: 16, height: 14 + random(`tr${i}${Math.floor(t * 10)}`) * 100 * eo(t, M.traffic - 0.2, M.traffic + 0.8), background: HC.ice, borderRadius: 4, opacity: 0.8 }} />
              ))}
            </div>
          )}
          {t >= M.traffic - 0.2 && (
            <Fade a={M.traffic - 0.2} b={M.morning} style={{ marginTop: 30 }}>
              <Tag color={HC.ice} size={30}>TIẾNG XE CỘ NGOÀI HẺM</Tag>
            </Fade>
          )}
        </Stage>
      </Scene>

      {/* trả phòng, bỏ cọc */}
      <Scene a={M.morning} b={M.keys}>
        <Bg tint="#13202a" y={42} />
        <Stage>
          <Pop at={M.morning}>
            <Big size={130}>TRẢ PHÒNG</Big>
          </Pop>
          <Pop at={M.morning + 0.5} style={{ marginTop: 30 }}>
            <Tag color={HC.amber} size={34}>SÁNG SỚM · GOM ĐỒ · XUỐNG GÕ CỬA</Tag>
          </Pop>
          <Pop at={M.morning + 2.4} style={{ marginTop: 70, position: "relative" }}>
            <Tag size={28} color={HC.dim}>TIỀN CỌC</Tag>
            <Big size={110} color={HC.paper} style={{ fontFamily: F.mono, letterSpacing: 0, position: "relative" }}>
              1.500.000đ
              <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 10, background: HC.red, transform: "rotate(-3deg)" }} />
            </Big>
            <Tag size={30} color={HC.red} style={{ marginTop: 12 }}>BỎ LUÔN · KHÔNG DÁM ĐÒI</Tag>
          </Pop>
        </Stage>
      </Scene>

      {/* chùm chìa khóa + lời cô chủ */}
      <Scene a={M.keys} b={M.today}>
        <Bg tint="#1a1408" y={36} />
        <div style={{ position: "absolute", left: 405, top: 150 }}>
          <KeySvg swing={swing} />
        </div>
        <Pop at={M.landlady2 - 0.4} style={{ position: "absolute", left: 110, top: 680, width: 830 }}>
          <div style={{ border: `3px solid ${HC.amber}`, borderRadius: 30, padding: "30px 38px", background: "rgba(0,0,0,0.62)", boxShadow: "0 0 60px rgba(255,180,84,0.2)" }}>
            <Tag color={HC.amber} size={24}>CÔ CHỦ NHÀ · NÓI NHỎ</Tag>
            <div style={{ fontFamily: F.body, fontSize: 44, lineHeight: 1.32, color: HC.paper, marginTop: 14, fontWeight: 800 }}>
              “Trụ được tới <span style={{ color: HC.red }}>đêm thứ ba</span> là giỏi hơn mấy đứa thuê trước nhiều rồi.”
            </div>
          </div>
        </Pop>
      </Scene>

      {/* đến bây giờ vẫn lạnh gáy */}
      <Scene a={M.today} b={M.vo_end} fadeOut={0.6}>
        <Bg tint="#0b1520" y={42} />
        <Stage top={190} height={950}>
          <div style={{ position: "relative" }}>
            <GlassWindow w={470} h={650} glow={0.45}>
              <div style={{ position: "absolute", left: 60, top: 120, opacity: handFlick }}>
                <Hand width={300} blur={6} />
              </div>
            </GlassWindow>
          </div>
        </Stage>
        <Fade a={M.today + 0.3} b={M.vo_end} style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center" }} rise={12}>
          <Tag color={HC.paper} size={30}>ĐẾN BÂY GIỜ · VẪN LẠNH GÁY</Tag>
        </Fade>
        <Fade a={M.coldnape - 0.2} b={M.vo_end} style={{ position: "absolute", left: 0, right: 0, top: 1060 }}>
          <div style={{ textAlign: "center", opacity: 0.0 }}>.</div>
        </Fade>
      </Scene>
    </>
  );
};

/* ================= 9. END CARD ================= */
export const SceneEnd: React.FC = () => {
  const t = useT();
  const s = useSpringAt(M.vo_end + 0.4);
  const btn = useSpringAt(M.vo_end + 1.8, { damping: 9 });
  const pulse = 1 + 0.04 * Math.sin(t * 5);
  return (
    <Scene a={M.vo_end + 0.1} b={9999} fadeIn={0.6}>
      <Bg tint="#1a0a0e" y={44} />
      <Stage>
        <div style={{ textAlign: "center", transform: `scale(${lerp(0.85, 1, s)})`, opacity: clamp01(s * 1.5), maxWidth: 830 }}>
          <Big size={88}>BẠN CÓ DÁM Ở</Big>
          <Big size={92} color={HC.red} style={{ textShadow: "0 0 70px rgba(229,32,46,0.7)" }}>ĐÊM THỨ 3?</Big>
        </div>
        <div style={{ marginTop: 64, textAlign: "center", opacity: ramp(t, M.vo_end + 1.0, M.vo_end + 1.6), maxWidth: 830 }}>
          <Tag color={HC.paper} size={30}>BÌNH LUẬN: “DÁM” HAY “KHÔNG DÁM”</Tag>
        </div>
        <div
          style={{
            marginTop: 64,
            transform: `scale(${lerp(0.6, 1, btn) * pulse})`,
            opacity: clamp01(btn * 2),
            background: HC.red,
            borderRadius: 999,
            padding: "24px 52px",
            boxShadow: "0 0 70px rgba(229,32,46,0.65)",
            maxWidth: 800,
          }}
        >
          <Big size={38} color="#fff" style={{ textShadow: "none", letterSpacing: 1 }}>THEO DÕI · NGHE TIẾP TRUYỆN</Big>
        </div>
      </Stage>
    </Scene>
  );
};
