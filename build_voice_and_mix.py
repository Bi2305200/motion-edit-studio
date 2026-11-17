"""
Tạo giọng đọc tiếng Việt (ElevenLabs) + nhạc nền + SFX -> public/audio/master_soundtrack_15s.wav

Cách dùng:
  python build_voice_and_mix.py                 # giọng mặc định (VOICE trong .env hoặc 'adam')
  python build_voice_and_mix.py khang           # đổi giọng
  python build_voice_and_mix.py --preview       # chỉ tạo 1 câu mẫu cho mọi giọng để nghe thử
  python build_voice_and_mix.py --mix-only      # không gọi API, chỉ mix lại (dùng VO đã có)

Lỗi giọng "lơ lớ" trước đây: model eleven_multilingual_v2 KHÔNG hỗ trợ tiếng Việt.
=> Dùng eleven_turbo_v2_5 + language_code="vi" (model hỗ trợ tiếng Việt).
"""
import os, sys, json, subprocess, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(ROOT, "public", "audio")
os.makedirs(AUDIO, exist_ok=True)

def env(key, default=""):
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            if line.strip().startswith(key + "="):
                return line.split("=", 1)[1].strip()
    return os.environ.get(key, default)

API_KEY = env("ELEVENLABS_API_KEY")
MODEL = "eleven_turbo_v2_5"          # hỗ trợ tiếng Việt
VOICES = {                           # id ElevenLabs
    "adam":   "pNInz6obpgDQGcFmaJgB",   # Adam (giọng gốc Mỹ, đọc tiếng Việt qua model v2.5)
    "khang":  "CNrmeY3b5ryfO4WKIKMJ",   # Khang - Deep & Confident (quảng cáo, giọng Nam Bộ)
    "giahuy": "2gohBomXaprQ214IIpWp",   # Gia Huy - TV Host
    "truong": "U0vnF55XGy05G83azOfJ",   # Trường - Calm & Clear Educator (giọng Bắc)
}
SETTINGS = {"stability": 0.42, "similarity_boost": 0.85, "style": 0.55, "use_speaker_boost": True, "speed": 1.08}

# (file, câu thoại, thời điểm bắt đầu trong video - giây)
SCRIPT = [
    ("vo_s1.mp3", "Đánh thức thị giác với đồ họa chuyển động chuẩn điện ảnh!", 0.15),
    ("vo_s2.mp3", "Nhịp dựng bùng nổ, bắt trọn từng nhịp beat!", 3.70),
    ("vo_s3.mp3", "Giao diện kính mờ sống động, chạm đến cảm xúc người xem.", 7.50),
    ("vo_s4.mp3", "Tăng tốc sáng tạo gấp mười lần. Bứt phá ngay hôm nay!", 11.45),
]

# SFX: tên file -> Mixkit id
SFX_LIB = {
    "whoosh": 1490, "impact": 1143, "pop": 2357, "rise": 1489, "click": 1125,
    "tick": 1117, "toggle": 1120, "flip": 1485, "shutter": 1430, "sparkle": 3083,
    "success": 2865, "typing": 2568, "bubble": 2364, "toast": 2573,
}
# (sfx, thời điểm giây, âm lượng) - khớp với chuyển động trong Remotion
CUES = [
    # cắt cảnh: riser trước, whoosh + impact đúng điểm cắt
    ("whoosh", 0.00, 0.8), ("impact", 0.05, 0.7),
    ("rise", 2.90, 0.45), ("whoosh", 3.45, 0.85), ("impact", 3.60, 0.75),
    ("rise", 6.70, 0.45), ("whoosh", 7.25, 0.85), ("impact", 7.40, 0.75),
    ("rise", 10.70, 0.5), ("whoosh", 11.25, 0.85), ("impact", 11.40, 0.75),
    # Scene 1 Brutalist: thẻ rơi, con dấu đóng, bảng màu
    ("flip", 0.25, 0.55), ("pop", 0.45, 0.6), ("shutter", 0.58, 0.7), ("click", 0.68, 0.5),
    ("typing", 1.20, 0.25),
    # Scene 2 Kinetic: từng khối chữ bật lên
    ("pop", 3.68, 0.6), ("bubble", 3.87, 0.6), ("pop", 4.07, 0.55), ("bubble", 4.30, 0.55),
    ("flip", 4.47, 0.5), ("tick", 4.9, 0.35), ("tick", 5.4, 0.35), ("tick", 5.9, 0.35),
    # Scene 3 UI: bật thẻ, toggle, thanh player
    ("toggle", 7.45, 0.5), ("pop", 7.52, 0.55), ("click", 7.65, 0.5), ("click", 7.75, 0.5),
    ("toast", 7.80, 0.5), ("sparkle", 9.2, 0.35),
    # Scene 4 số liệu: tick theo bộ đếm, success ở CTA
    ("click", 11.50, 0.5), ("tick", 11.65, 0.35), ("tick", 11.80, 0.35), ("tick", 11.95, 0.35),
    ("tick", 12.10, 0.35), ("tick", 12.25, 0.35), ("tick", 12.40, 0.35),
    ("success", 11.95, 0.55), ("sparkle", 13.6, 0.45),
]
BGM = ("bgm_cat_walk.mp3", 14.5, 0.50)    # file, giây bắt đầu (drop), âm lượng (tự duck dưới giọng)
DURATION = 15.0

def ff(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)

def tts(voice_id, text, out_path):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128"
    body = {"text": text, "model_id": MODEL, "language_code": "vi", "voice_settings": SETTINGS}
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST",
                                 headers={"xi-api-key": API_KEY, "Content-Type": "application/json"})
    raw = out_path + ".raw.mp3"
    with urllib.request.urlopen(req, timeout=60) as r:
        open(raw, "wb").write(r.read())
    # cắt khoảng lặng + EQ ấm/rõ + nén nhẹ
    ff("-i", raw, "-af",
       "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
       "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
       "highpass=f=80,equalizer=f=180:t=o:w=1.5:g=2,equalizer=f=3500:t=o:w=1.5:g=3,"
       "acompressor=threshold=-18dB:ratio=3:attack=5:release=80",
       "-ar", "44100", "-ac", "2", out_path)
    os.remove(raw)

def ensure_sfx():
    for name, mid in SFX_LIB.items():
        p = os.path.join(AUDIO, f"sfx_{name}.mp3")
        if not os.path.exists(p):
            url = f"https://assets.mixkit.co/active_storage/sfx/{mid}/{mid}-preview.mp3"
            try:
                data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=20).read()
                open(p, "wb").write(data)
            except Exception as e:
                print("SFX lỗi", name, e)

def mix():
    inputs, filters, labels = [], [], []
    bgm_file, bgm_start, bgm_vol = BGM
    inputs += ["-i", os.path.join(AUDIO, bgm_file)]
    filters.append(f"[0:a]atrim=start={bgm_start}:duration={DURATION},asetpts=PTS-STARTPTS,"
                   f"afade=t=in:d=0.2,afade=t=out:st={DURATION-0.8}:d=0.8,volume={bgm_vol}[bgm]")
    idx = 1
    vo_labels = []
    for fname, _, start in SCRIPT:
        inputs += ["-i", os.path.join(AUDIO, fname)]
        ms = int(start * 1000)
        filters.append(f"[{idx}:a]volume=1.6,adelay={ms}|{ms}[v{idx}]")
        vo_labels.append(f"[v{idx}]"); idx += 1
    sfx_idx = {}
    for name in sorted({c[0] for c in CUES}):
        p = os.path.join(AUDIO, f"sfx_{name}.mp3")
        if os.path.exists(p):
            inputs += ["-i", p]; sfx_idx[name] = idx; idx += 1
    # split mỗi SFX theo số lần dùng
    uses = {}
    for n, _, _ in CUES:
        uses[n] = uses.get(n, 0) + 1
    for n, i in sfx_idx.items():
        outs = "".join(f"[{n}{k}]" for k in range(uses[n]))
        filters.append(f"[{i}:a]asplit={uses[n]}{outs}" if uses[n] > 1 else f"[{i}:a]anull{outs}")
    counter = {}
    for n, t, vol in CUES:
        if n not in sfx_idx: continue
        k = counter.get(n, 0); counter[n] = k + 1
        ms = int(t * 1000)
        filters.append(f"[{n}{k}]volume={vol},adelay={ms}|{ms}[s_{n}{k}]")
        labels.append(f"[s_{n}{k}]")
    # giọng: gộp, rồi sidechain duck nhạc nền dưới giọng
    filters.append(f"{''.join(vo_labels)}amix=inputs={len(vo_labels)}:normalize=0,apad=whole_dur={DURATION}[vo]")
    filters.append("[vo]asplit=2[vo_a][vo_sc]")
    filters.append("[bgm][vo_sc]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=300[bgm_d]")
    filters.append(f"[bgm_d][vo_a]{''.join(labels)}amix=inputs={2+len(labels)}:duration=first:normalize=0,"
                   f"atrim=duration={DURATION},loudnorm=I=-14:TP=-1.5:LRA=11[out]")
    out = os.path.join(AUDIO, "master_soundtrack_15s.wav")
    ff(*inputs, "-filter_complex", ";".join(filters), "-map", "[out]", "-ar", "44100", "-ac", "2", out)
    print("Mix xong:", out)

if __name__ == "__main__":
    args = [a for a in sys.argv[1:]]
    ensure_sfx()
    if "--preview" in args:
        for name, vid in VOICES.items():
            p = os.path.join(AUDIO, f"preview_{name}.mp3")
            try:
                tts(vid, SCRIPT[0][1], p); print("Preview:", p)
            except Exception as e:
                print(f"Bỏ qua {name}: {e} (giọng Voice Library cần gói trả phí khi gọi qua API)")
        sys.exit(0)
    if "--mix-only" not in args:
        voice = next((a for a in args if a in VOICES), env("VOICE", "adam"))
        print("Giọng:", voice, "| model:", MODEL)
        for fname, text, _ in SCRIPT:
            tts(VOICES[voice], text, os.path.join(AUDIO, fname))
    mix()
