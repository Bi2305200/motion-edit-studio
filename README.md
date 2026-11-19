# 🎬 Motion Edit Studio: Motion Graphics TikTok (Remotion + ElevenLabs + CapCut PC)

Dùng để làm video motion graphics 9:16 (1080×1920) đúng vùng an toàn TikTok, có giọng đọc AI tiếng Việt, nhạc nền, SFX, và xuất draft CapCut PC.

## 1. Cài trên máy mới (chạy một lần)

```powershell
winget install OpenJS.NodeJS.LTS Git.Git Gyan.FFmpeg Python.Python.3.12
git clone <URL-repo-của-bạn> motion-edit-studio
cd motion-edit-studio
npm install
copy .env.example .env      # rồi mở .env và dán ELEVENLABS_API_KEY của bạn
```

## 2. Quy trình làm một video

| Bước | Lệnh | Kết quả |
|---|---|---|
| Xem trước / sửa motion | `npm run dev` | Mở Remotion Studio trên trình duyệt |
| Tạo giọng và mix âm thanh | `python build_voice_and_mix.py adam` | `public/audio/master_soundtrack_15s.wav` |
| Nghe thử các giọng | `python build_voice_and_mix.py --preview` | `public/audio/preview_*.mp3` |
| Chỉ mix lại (không tốn credit) | `python build_voice_and_mix.py --mix-only` | Mix lại SFX/nhạc |
| Render video | `npx remotion render MotionShowcase out/showcase_v3.mp4 --crf 16` | Video không tiếng |
| Ghép tiếng và xuất CapCut | `python package_final_deliverables.py` | `out/motion_graphics_remotion_master.mp4` + draft CapCut |
| Kiểm tra khung hình | `ffmpeg -i out/motion_graphics_remotion_master.mp4 -vf "fps=1,scale=360:-1,tile=5x3" -frames:v 1 -update 1 out/contact.png` | Ảnh 15 khung để soát lỗi |

## 3. Sửa nội dung ở đâu

- **Lời thoại, giọng, SFX, nhạc nền:** đầu file `build_voice_and_mix.py`, gồm `SCRIPT`, `VOICES`, `CUES` và `BGM`.
- **Các cảnh motion:** `src/scenes/Scene1Brutalist.tsx`, `Scene2Kinetic.tsx`, `Scene3SpotifyUI.tsx`, `Scene4Explainer.tsx`.
- **Thời lượng cảnh, màu, vùng an toàn:** `src/lib.ts` (`SCENES`, `C`, `SAFE`).
- **Hiệu ứng tái sử dụng:** `src/components/primitives.tsx` và `src/components/NateCuePack.tsx`.
- **Phân tích video mẫu:** `python analyze_reference_video.py <video.mp4>`
- **Logo thương hiệu SVG:** `python fetch_brand_svg.py tiktok spotify ...`
- **Quy tắc cho AI agent:** `skill/SKILL.md`. Copy file này vào `~/.gemini/antigravity/skills/motion-video-graphics/` để agent dùng lại.

## 3.5. Quy trình dự án truyện kinh dị dài (`HorrorStory` - 9 cảnh, 218.9s)

File voiceover `story/vo/p0..p8.mp3` & timestamp `story/vo/*.align.json` đã được lưu sẵn trong repo (không tốn lại credit ElevenLabs khi mở trên máy khác).

```powershell
python story/build_story_timeline.py   # Tạo story/timeline.json & src/storyTimeline.ts
python story/build_horror_audio.py     # Mix lại master audio + 3 stems WAV (VO, Drone, SFX)
node story/render_horror.mjs --full    # Render raw MP4 1080x1920 @ 30fps -> out/horror_story_raw.mp4
python story/package_horror.py         # Mux audio + xuất CapCut Draft 4 track (Phong_Tro_1tr5_TikTok)
```

## 4. Lưu ý

- **Không commit file `.env`** vì nó chứa API key. File này đã nằm trong `.gitignore`.
- **Để repo ở chế độ Private.** Nhạc nền và SFX lấy từ Mixkit (miễn phí dùng trong video nhưng không nên phát tán lại).
- **Giọng tiếng Việt phải dùng model `eleven_turbo_v2_5` với `language_code="vi"`.** Model `eleven_multilingual_v2` không hỗ trợ tiếng Việt nên sẽ đọc lơ lớ.
- **Đổi giọng:** thêm `voice_id` vào `VOICES` trong `build_voice_and_mix.py`. Có thể tìm giọng Việt trong Voice Library của ElevenLabs.
