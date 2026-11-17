import os
import re
import json
import urllib.request
import subprocess

STUDIO_DIR = os.path.dirname(os.path.abspath(__file__))
FONTS_DIR = os.path.join(STUDIO_DIR, "public", "fonts")
AUDIO_DIR = os.path.join(STUDIO_DIR, "public", "audio")
os.makedirs(FONTS_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

# 1. Load .env safely
env_path = os.path.join(STUDIO_DIR, ".env")
api_key = ""
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip().startswith("ELEVENLABS_API_KEY="):
                api_key = line.strip().split("=", 1)[1].strip()

# 2. Download full Vietnamese upright Google Fonts (Be Vietnam Pro 900/700 & Plus Jakarta Sans 800)
def download_google_font_ttf(family_query, out_filename):
    css_url = f"https://fonts.googleapis.com/css2?family={family_query}&display=swap"
    # Use an older desktop UA so Google Fonts returns a single full TTF containing Vietnamese + Latin
    req = urllib.request.Request(css_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:31.0) Gecko/20100101 Firefox/31.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        css = resp.read().decode("utf-8")
    urls = re.findall(r"url\((https://[^)]+\.(?:ttf|otf|woff2))\)", css)
    if not urls:
        raise RuntimeError(f"No font URL found for {family_query}")
    font_url = urls[-1]
    out_path = os.path.join(FONTS_DIR, out_filename)
    urllib.request.urlretrieve(font_url, out_path)
    print(f"Downloaded font {out_filename}: {os.path.getsize(out_path):,} bytes")

try:
    download_google_font_ttf("Be+Vietnam+Pro:wght@900", "BeVietnamPro-BlackUpright.ttf")
    download_google_font_ttf("Be+Vietnam+Pro:wght@700", "BeVietnamPro-BoldUpright.ttf")
    download_google_font_ttf("Montserrat:wght@900", "Montserrat-Black-VN.ttf")
except Exception as e:
    print("Font download error:", e)

# 3. Generate Inspiring Vietnamese Voiceover with ElevenLabs Adam Voice (pNInz6obpgDQGcFmaJgB)
ADAM_VOICE_ID = "pNInz6obpgDQGcFmaJgB"

vo_scripts = [
    ("vo_s1.mp3", "Đánh thức thị giác với đồ họa chuyển động chuẩn điện ảnh! Từng khung hình bứt phá mọi giới hạn sáng tạo."),
    ("vo_s2.mp3", "Nhịp dựng bùng nổ, bắt trọn từng nhịp beat với chuyển động vật lý mượt mà và đầy cuốn hút!"),
    ("vo_s3.mp3", "Nâng tầm thiết kế giao diện hiện đại, hiệu ứng chiều sâu sống động chạm đến cảm xúc người xem."),
    ("vo_s4.mp3", "Tăng tốc hiệu suất sản xuất gấp mười lần. Biến mọi ý tưởng thành video triệu lượt xem ngay hôm nay!"),
]

def generate_elevenlabs_vo(voice_id, text, out_file):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128"
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.38,
            "similarity_boost": 0.85,
            "style": 0.70,
            "use_speaker_boost": True
        }
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
            "User-Agent": "Mozilla/5.0"
        },
        method="POST"
    )
    out_path = os.path.join(AUDIO_DIR, out_file)
    with urllib.request.urlopen(req, timeout=30) as resp:
        audio_bytes = resp.read()
        with open(out_path, "wb") as f:
            f.write(audio_bytes)
    print(f"ElevenLabs Adam generated {out_file}: {len(audio_bytes):,} bytes")

if api_key:
    for fname, script_text in vo_scripts:
        try:
            generate_elevenlabs_vo(ADAM_VOICE_ID, script_text, fname)
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            print(f"ElevenLabs HTTP {he.code} for {fname}: {err_body}")
        except Exception as e:
            print(f"ElevenLabs error for {fname}: {e}")
else:
    print("No ElevenLabs API key found in .env")

# 4. Download real studio background music track from Mixkit CDN (discovered via claude-motion-design & NateCue)
bgm_candidates = [
    ("bgm_tech_driving.mp3", "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3"),
    ("bgm_hiphop_beat.mp3", "https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3"),
    ("bgm_driving_ambition.mp3", "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3"),
    ("bgm_cat_walk.mp3", "https://assets.mixkit.co/music/371/371.mp3"),
    ("bgm_207.mp3", "https://assets.mixkit.co/music/207/207.mp3"),
]

downloaded_bgm = None
for name, url in bgm_candidates:
    out_bgm = os.path.join(AUDIO_DIR, name)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read()
            if len(content) > 50000:
                with open(out_bgm, "wb") as f:
                    f.write(content)
                print(f"Downloaded real studio BGM {name}: {len(content):,} bytes")
                if not downloaded_bgm:
                    downloaded_bgm = out_bgm
    except Exception as e:
        print(f"BGM candidate {name} skipped: {e}")

# Also query Openverse API (no key needed, from NateCue resources) if backup music/SFX needed
try:
    ov_url = "https://api.openverse.org/v1/audio/?q=synthwave+beat&mature=false&page_size=5"
    req = urllib.request.Request(ov_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        ov_data = json.loads(resp.read().decode("utf-8"))
        print(f"Openverse API connected: {ov_data.get('result_count', 0)} audio tracks available")
except Exception as e:
    print("Openverse check:", e)

# Download real Mixkit Studio SFX (whoosh, impact, pop, click)
sfx_list = [
    ("real_whoosh.mp3", "https://assets.mixkit.co/active_storage/sfx/1490/1490-preview.mp3"),
    ("real_impact.mp3", "https://assets.mixkit.co/active_storage/sfx/1143/1143-preview.mp3"),
    ("real_pop.mp3", "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3"),
    ("real_rise.mp3", "https://assets.mixkit.co/active_storage/sfx/1489/1489-preview.mp3"),
]
for sfx_name, sfx_url in sfx_list:
    out_sfx = os.path.join(AUDIO_DIR, sfx_name)
    try:
        req = urllib.request.Request(sfx_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            with open(out_sfx, "wb") as f:
                f.write(resp.read())
        print(f"Downloaded real SFX {sfx_name}: {os.path.getsize(out_sfx):,} bytes")
    except Exception as e:
        print(f"SFX {sfx_name} warning: {e}")
