"""
Sinh giọng đọc ElevenLabs (Adam, tiếng Việt) cho kịch bản story.json, KÈM timestamp từng ký tự
(endpoint /with-timestamps) -> dùng để đồng bộ phụ đề từng từ.

- Cache: mỗi đoạn lưu story/vo/<id>.mp3 + <id>.align.json. Đã có thì KHÔNG gọi API lại (tiết kiệm quota).
- Chạy:  python story/gen_story_voice.py            (bỏ qua đoạn đã cache)
         python story/gen_story_voice.py --force p3 (ép tạo lại 1 đoạn)
"""
import os, sys, json, base64, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
VO_DIR = os.path.join(HERE, "vo")
os.makedirs(VO_DIR, exist_ok=True)


def env(key, default=""):
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            if line.strip().startswith(key + "="):
                return line.split("=", 1)[1].strip()
    return os.environ.get(key, default)


API_KEY = env("ELEVENLABS_API_KEY")
VOICE_ID = "pNInz6obpgDQGcFmaJgB"  # Adam
MODEL = "eleven_turbo_v2_5"          # có tiếng Việt, 0.5 credit/ký tự
# Giọng kể chuyện kinh dị: ổn định vừa phải, nhiều cảm xúc, nói chậm hơn chút
SETTINGS = {"stability": 0.38, "similarity_boost": 0.85, "style": 0.65,
            "use_speaker_boost": True, "speed": 0.98}


def tts(text, prev_text, next_text, out_mp3, out_align):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps?output_format=mp3_44100_128"
    body = {"text": text, "model_id": MODEL, "language_code": "vi", "voice_settings": SETTINGS}
    if prev_text:
        body["previous_text"] = prev_text[-300:]
    if next_text:
        body["next_text"] = next_text[:300]
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), method="POST",
                                 headers={"xi-api-key": API_KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as r:
        data = json.loads(r.read().decode("utf-8"))
    open(out_mp3, "wb").write(base64.b64decode(data["audio_base64"]))
    json.dump(data.get("alignment") or data.get("normalized_alignment"),
              open(out_align, "w", encoding="utf-8"), ensure_ascii=False)


if __name__ == "__main__":
    force = set()
    if "--force" in sys.argv:
        force = set(sys.argv[sys.argv.index("--force") + 1:])
    story = json.load(open(os.path.join(HERE, "story.json"), encoding="utf-8"))
    paras = story["paragraphs"]
    for i, p in enumerate(paras):
        mp3 = os.path.join(VO_DIR, p["id"] + ".mp3")
        al = os.path.join(VO_DIR, p["id"] + ".align.json")
        if os.path.exists(mp3) and os.path.exists(al) and p["id"] not in force:
            print("cache:", p["id"])
            continue
        prev_t = paras[i - 1]["text"] if i > 0 else ""
        next_t = paras[i + 1]["text"] if i + 1 < len(paras) else ""
        print("gen:", p["id"], len(p["text"]), "ký tự ...", flush=True)
        try:
            tts(p["text"], prev_t, next_t, mp3, al)
        except urllib.error.HTTPError as e:
            print("LỖI", p["id"], e.code, e.read().decode("utf-8", "ignore")[:300])
            sys.exit(1)
    print("Xong giọng đọc ->", VO_DIR)
