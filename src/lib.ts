import { Easing, spring, SpringConfig } from "remotion";

// === Canvas & Safe Zone (TikTok 9:16 Standard) ===
export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const DURATION_SEC = 15;
export const TOTAL_FRAMES = FPS * DURATION_SEC; // 450 frames

// TikTok Safe Zone Margins (Verified strictly no overflow)
export const SAFE = {
  top: 150,
  bottom: 380,
  left: 110,
  right: 140,
  contentW: 1080 - 110 - 140, // 830px safe width
  contentH: 1920 - 150 - 380, // 1390px safe height
};

// === Color Palette (Rich Studio Looks) ===
export const C = {
  bg: "#09090B",
  bgDark: "#0D1117",
  bgWarm: "#F4EFE6",
  bgCream: "#EDE8DC",
  panel: "#16181D",
  panelLight: "#FFFFFF",
  accent: "#FF4D00",
  accentGlow: "#FF7733",
  accentAlt: "#00E5FF",
  lime: "#CDF24F",
  spotify: "#1DB954",
  spotifyDark: "#0A1910",
  ink: "#0B0B0E",
  cream: "#F2EFE9",
  creamDim: "rgba(242,239,233,0.68)",
  muted: "rgba(242,239,233,0.42)",
  white: "#FFFFFF",
  red: "#EF4444",
  orange: "#FF6D00",
  yellow: "#FACC15",
  blue: "#3B82F6",
  purple: "#A855F7",
};

// === Font Stacks (Loaded via FontLoader - Upright 100% Vietnamese Diacritic Safe) ===
export const F = {
  display: "'BeVietnamUprightBlack', 'MontserratBlack', sans-serif",
  vnDisplay: "'BeVietnamUprightBlack', sans-serif",
  body: "'BeVietnamUprightBold', 'InterBold', sans-serif",
  bodyReg: "'BeVietnamUprightBold', 'InterReg', sans-serif",
  headline: "'BebasNeue', 'BeVietnamUprightBlack', sans-serif",
  mono: "'Consolas', 'Courier New', monospace",
};

// === Math Utilities ===
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};

// === Easing Presets ===
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.6, 0, 0.9, 0.35);
export const easeOutExpo = Easing.bezier(0.19, 1, 0.22, 1);
export const easeOutBack = Easing.bezier(0.34, 1.56, 0.64, 1);

// === Progress helper (t in seconds relative to scene start) ===
export const prog = (
  t: number,
  t0: number,
  t1: number,
  ease: (x: number) => number = easeOut
) => ease(clamp01((t - t0) / Math.max(0.0001, t1 - t0)));

// === Spring Helper (frame is LOCAL scene frame 0..N, startSec is relative to scene start!) ===
export const sp = (
  localFrame: number,
  startSec: number,
  config: Partial<SpringConfig> = {},
  fps: number = FPS
) => {
  const fr = localFrame - startSec * fps;
  if (fr <= 0) return 0;
  return spring({
    frame: fr,
    fps,
    config: { damping: 16, mass: 0.75, stiffness: 180, ...config },
  });
};

export const SPRING = {
  snappy: { damping: 24, stiffness: 300, mass: 0.7 } as Partial<SpringConfig>,
  default: { damping: 20, stiffness: 180, mass: 0.8 } as Partial<SpringConfig>,
  heavy: { damping: 22, stiffness: 130, mass: 1.0 } as Partial<SpringConfig>,
  bounce: { damping: 11, stiffness: 220, mass: 0.65 } as Partial<SpringConfig>,
  ui: { damping: 18, stiffness: 240, mass: 0.6 } as Partial<SpringConfig>,
};

export const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// === Scene Timing (in seconds, total 15.0s) ===
export const SCENES = {
  scene1: { start: 0.0, duration: 3.6 },  // Brutalist Branding (@rehmaneditor999)
  scene2: { start: 3.6, duration: 3.8 },  // Kinetic 3D Motion (@danushkmotion + @huandaotaoyoutube)
  scene3: { start: 7.4, duration: 4.0 },  // Spotify 2.0 Glass UI (@xzelogos)
  scene4: { start: 11.4, duration: 3.6 }, // Vox Data Explainer + Finale (@huandaotaoyoutube)
};
