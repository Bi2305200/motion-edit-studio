---
name: motion-video-graphics
description: Studio-grade Motion Video Graphics editing pipeline for TikTok/Reels/Shorts (9:16, 1080x1920) and CapCut PC Draft generation. Powered by Remotion (React/TypeScript), ElevenLabs Adam Voiceover, Studio BGM/SFX, NateCue Motion Ecosystem, and Self-Critique Contact Sheets. Use whenever the user asks to create, edit, or remake motion graphics videos, kinetic typography, UI/UX concept promos, brutalist branding animations, Vox-style explainers, or CapCut PC drafts.
---

# Motion Video Graphics Studio Skill (Remotion + ElevenLabs + NateCue Ecosystem + CapCut PC)

## 1. Core Architecture & Workspace
- **Remotion Studio Project:** `C:\Users\Admin\.gemini\antigravity\scratch\motion-edit-studio`
- **Skill Reference Repos:** `C:\Users\Admin\.gemini\antigravity\scratch\motion-skill-repos\` (`claude-motion`, `claude-motion-design`, `claude-video-2`, `hyperframes`, `awesome-claude-video-skills`)
- **CapCut PC Draft Targets:**
  - `D:\CapCut Drafts\<Draft_Name>`
  - `C:\Users\Admin\AppData\Local\CapCut\User Data\Projects\com.lveditor.draft\<Draft_Name>`

## 2. Mandatory TikTok Safe Zone & Vietnamese Typography Rules
1. **TikTok 9:16 Safe Box (1080×1920):**
   - `SAFE.top = 150px`, `SAFE.bottom = 380px`, `SAFE.left = 110px`, `SAFE.right = 140px`
   - Usable content area: `830px × 1390px` (`X: 110..940`, `Y: 150..1540`).
2. **Vietnamese Diacritic Anti-Clipping Rule (Zero Spelling/Diacritic Loss):**
   - Always use upright Vietnamese fonts (`BeVietnamPro-Black-VN.woff2` + `BeVietnamPro-Bold-VN.woff2`) loaded via `FontLoader.tsx` with `unicode-range`.
   - In `<MaskReveal>`, use generous vertical padding (`padding: "0.34em 0.14em 0.32em"`, `margin: "-0.34em -0.14em -0.32em"`) and switch `overflow` to `"visible"` when `k > 0.94` so `dấu nặng` (`.`) under `Ọ, Ộ, Ị, Ự` and stacked hats above `Ấ, Ắ, Ố, Ể` are NEVER clipped!
   - Always set `lineHeight >= 1.22` on uppercase Vietnamese display headings and `marginBottom >= 14px` on small eyebrow labels above Vietnamese headings.

## 3. Audio Pipeline (ElevenLabs Adam + Studio BGM + Real SFX)
- **Voiceover (ElevenLabs Adam - `pNInz6obpgDQGcFmaJgB`):**
  - Model: `eleven_multilingual_v2`
  - Inspiring settings: `stability: 0.35`, `similarity_boost: 0.85`, `style: 0.78`, `use_speaker_boost: True`
  - Post-process with `silenceremove`, `atempo=1.18..1.20`, and broadcast EQ boost (`+3dB @ 180Hz`, `+3.5dB @ 3800Hz`).
  - API Key is stored in `C:\Users\Admin\.gemini\antigravity\scratch\motion-edit-studio\.env` (`ELEVENLABS_API_KEY`). Never log or expose the key.
- **Background Music & SFX:**
  - Studio BGM tracks in `public/audio/bgm_cat_walk.mp3` (drop at `14.5s`, 130 BPM) and `bgm_207.mp3` (120 BPM).
  - Suno (`https://suno.com/`): When the user is signed in to Suno in the browser, delegate to the browser subagent to generate custom tracks per prompt.
  - Real SFX in `public/audio/`: `real_whoosh.mp3` (1490), `real_impact.mp3` (1143), `real_pop.mp3` (2357), `real_rise.mp3` (1489).
  - Free API fallback: **Openverse API** (`https://api.openverse.org/v1/audio/`) for 5.2M CC-licensed SFX & music tracks without an API key.

## 4. Curated Motion Graphics Ecosystem (From NateCue Resources)
- **Code-to-Video & Motion Skills:**
  - **Remotion** (React/TS deterministic frame engine) & **HyperFrames** (HTML/GSAP deterministic engine)
  - **Motion Skills** (51 agent skills across 15 packs: kinetic typography, animated charts, explainers, contact-sheet QA)
  - **Vox Director** (automated Vox-style paper-collage explainer pipeline with 9 theme presets & 14 narrative arcs)
  - **rea-video** (`github.com/JuneYaooo/rea-video` — shot boundary & motion style analyzer producing `VIDEO.md` remake plans)
  - **Motion Anything** (chat-native motion engine with 13 motion verbs & 403 recipes)
  - **Animate Text (Pixel Point)** (concrete text animation pacing & easing specs)
- **3D, Shaders, Textures & UI References:**
  - **EffectCraft** (Rust open-source AE alternative with 259 effects, graph editor, 3D DOF)
  - **PerspectiveMock** (`perspectivemock.vercel.app` — 3D camera keyframe tilt/zoom/DOF studio for UI & code snippets)
  - **Bitgrain** & **Ditther** (halftones, Risograph, Floyd-Steinberg/Atkinson dithering, 38 film LUTs)
  - **React Bits** (`reactbits.dev`), **Fancy Components**, **Transitions.dev** (microinteractions & smooth card/text transitions)
  - **Prompt Motion** & **Skillry** (675+ AI motion graphics reference videos & prompts)
  - **Fontshare**, **Free Faces Gallery**, **Lucide**, **theSVG** (6,492+ brand SVGs)

## 5. Self-Healing Critique Loop (Mandatory Before Delivery)
After every render, generate a 15-frame contact sheet and inspect it with `read_file`:
```powershell
ffmpeg -y -i out/motion_graphics_remotion_master.mp4 -vf "fps=1,scale=360:-1,tile=5x3" -frames:v 1 -update 1 contact_sheet.png
```
Verify:
- [ ] All scenes visible with zero blank cut frames
- [ ] Zero clipped Vietnamese diacritics (`dấu nặng`, `dấu mũ + sắc/huyền`)
- [ ] 100% compliance with TikTok Safe Zone
- [ ] Studio BGM + ElevenLabs Adam VO + SFX mixed cleanly
