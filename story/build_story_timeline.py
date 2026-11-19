"""
Dựng timeline từ giọng đọc + timestamp ký tự:
  story/vo/*.mp3 + *.align.json  ->  src/storyTimeline.ts  (Remotion đọc) + story/timeline.json (mix âm thanh đọc)

Chạy: python story/build_story_timeline.py
"""
import os, json, subprocess, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
VO_DIR = os.path.join(HERE, "vo")
FPS = 30

LEAD_IN = 0.7            # giây trống đầu video
GAP = {"p0": 1.1}        # khoảng nghỉ SAU mỗi đoạn (mặc định 0.5)
DEFAULT_GAP = 0.5
TAIL = 4.0               # end card sau khi hết giọng


def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", path], capture_output=True, text=True)
    return float(r.stdout.strip())


def norm(w):
    w = unicodedata.normalize("NFC", w.lower())
    return re.sub(r"[^\w]", "", w, flags=re.UNICODE)


def words_from_alignment(al, offset):
    chars = al["characters"]; st = al["character_start_times_seconds"]; en = al["character_end_times_seconds"]
    words, cur, ws, we = [], "", None, None
    for ch, a, b in zip(chars, st, en):
        if ch.isspace():
            if cur:
                words.append({"w": cur, "s": round(offset + ws, 3), "e": round(offset + we, 3)})
            cur, ws, we = "", None, None
        else:
            if ws is None:
                ws = a
            cur += ch; we = b
    if cur:
        words.append({"w": cur, "s": round(offset + ws, 3), "e": round(offset + we, 3)})
    return words


def chunk_words(words, max_words=4, max_chars=22):
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        text = " ".join(x["w"] for x in cur)
        end_punct = w["w"][-1] in ",.!?…"
        if len(cur) >= max_words or len(text) >= max_chars or end_punct:
            chunks.append(cur); cur = []
    if cur:
        # nối mảnh lẻ 1 từ vào chunk trước nếu ngắn
        if chunks and len(cur) == 1 and len(chunks[-1]) < max_words:
            chunks[-1].extend(cur)
        else:
            chunks.append(cur)
    return chunks


def find_phrase(words, phrase, after=0.0):
    toks = [norm(t) for t in phrase.split()]
    nw = [norm(w["w"]) for w in words]
    for i in range(len(words) - len(toks) + 1):
        if nw[i:i + len(toks)] == toks and words[i]["s"] >= after:
            return words[i]["s"]
    raise KeyError(phrase)


# (tên mark, đoạn, cụm từ)
MARK_DEFS = [
    ("hook_price", "p0", "một triệu rưỡi"),
    ("hook_night3", "p0", "đêm thứ ba"),
    ("hook_empty", "p0", "phòng trống suốt"),
    ("fb_post", "p1", "Lướt mấy hội nhóm"),
    ("price", "p1", "giá chỉ có"),
    ("cheap", "p1", "rẻ bất thường"),
    ("floor3", "p2", "tầng ba"),
    ("area", "p2", "mười lăm mét vuông"),
    ("landlady", "p2", "Cô chủ nhà"),
    ("warn", "p2", "sau mười một giờ"),
    ("window", "p2", "ô cửa sổ thông gió"),
    ("night1", "p3", "Hai đêm đầu tiên"),
    ("night3", "p3", "đêm thứ ba thì"),
    ("t0130", "p3", "một giờ rưỡi sáng"),
    ("aircon", "p3", "máy lạnh"),
    ("phone", "p3", "cầm điện thoại"),
    ("knock1", "p4", "cạch cạch"),
    ("knock2", "p4", "vang lên lần nữa"),
    ("rhythm", "p4", "nhịp điệu đều đặn"),
    ("fingertip", "p4", "đầu ngón tay"),
    ("chill", "p5", "rờn rợn sống lưng"),
    ("shaft", "p5", "giếng trời"),
    ("nobalcony", "p5", "không có ban công"),
    ("holdbreath", "p5", "nín thở"),
    ("screenoff", "p6", "Vừa tắt đèn"),
    ("streetlight", "p6", "ánh sáng từ đèn đường"),
    ("fivefingers", "p6", "năm ngón tay"),
    ("slide", "p6", "miết dài"),
    ("screech", "p6", "tiếng rít"),
    ("frozen", "p6", "cứng đờ"),
    ("sweat", "p6", "mồ hôi lạnh"),
    ("shadowstop", "p7", "trượt xuống"),
    ("breath", "p7", "tiếng thở hắt"),
    ("incense", "p7", "mùi nhang khói"),
    ("blanket", "p8", "trùm kín chăn"),
    ("traffic", "p8", "tiếng xe cộ"),
    ("morning", "p8", "Sáng sớm"),
    ("keys", "p8", "chùm chìa khóa"),
    ("landlady2", "p8", "giỏi hơn"),
    ("today", "p8", "Tới bây giờ"),
    ("coldnape", "p8", "lạnh gáy"),
]


def main():
    story = json.load(open(os.path.join(HERE, "story.json"), encoding="utf-8"))
    t = LEAD_IN
    paras, all_words, vo_tracks = [], [], []
    for p in story["paragraphs"]:
        mp3 = os.path.join(VO_DIR, p["id"] + ".mp3")
        al = json.load(open(os.path.join(VO_DIR, p["id"] + ".align.json"), encoding="utf-8"))
        dur = probe(mp3)
        words = words_from_alignment(al, t)
        # câu
        sents, cur = [], []
        for w in words:
            cur.append(w)
            if w["w"][-1] in ".!?":
                sents.append(cur); cur = []
        if cur:
            sents.append(cur)
        paras.append({"id": p["id"], "tag": p["tag"], "start": round(t, 3), "end": round(t + dur, 3),
                      "sentences": [{"s": s[0]["s"], "e": s[-1]["e"], "text": " ".join(x["w"] for x in s)} for s in sents]})
        vo_tracks.append({"id": p["id"], "file": f"story/vo/{p['id']}.mp3", "start": round(t, 3), "dur": round(dur, 3)})
        for w in words:
            w["p"] = p["id"]
        all_words += words
        t += dur + GAP.get(p["id"], DEFAULT_GAP)

    vo_end = paras[-1]["end"]
    total = round(vo_end + TAIL, 3)

    marks = {}
    for name, pid, phrase in MARK_DEFS:
        pw = [w for w in all_words if w["p"] == pid]
        try:
            marks[name] = find_phrase(pw, phrase)
        except KeyError:
            print("!! không tìm thấy mark:", name, "|", phrase)
    for pp in paras:
        marks[pp["id"]] = pp["start"]
        marks[pp["id"] + "_end"] = pp["end"]
    marks["vo_end"] = vo_end

    # chunk phụ đề (không cắt ngang đoạn)
    chunks = []
    for p in story["paragraphs"]:
        pw = [w for w in all_words if w["p"] == p["id"]]
        for ch in chunk_words(pw):
            chunks.append({"s": ch[0]["s"], "e": ch[-1]["e"], "words": [{"w": x["w"], "s": x["s"], "e": x["e"]} for x in ch]})
    for i, c in enumerate(chunks):
        nxt = chunks[i + 1]["s"] if i + 1 < len(chunks) else c["e"] + 0.4
        c["hold"] = round(min(nxt, c["e"] + 0.35), 3)

    out = {"fps": FPS, "total": total, "voEnd": vo_end, "paras": paras, "marks": {k: round(v, 3) for k, v in marks.items()},
           "chunks": chunks, "vo": vo_tracks}
    json.dump(out, open(os.path.join(HERE, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    ts = "// AUTO-GENERATED bởi story/build_story_timeline.py — đừng sửa tay\nexport const STORY = " + \
         json.dumps(out, ensure_ascii=False) + " as const;\nexport type Chunk = { s: number; e: number; hold: number; words: readonly { w: string; s: number; e: number }[] };\n"
    open(os.path.join(ROOT, "src", "storyTimeline.ts"), "w", encoding="utf-8").write(ts)
    print(f"Tổng {total:.1f}s ({int(total // 60)}p{int(total % 60):02d}) | VO hết {vo_end:.1f}s | {len(chunks)} chunk phụ đề | {len(marks)} mark")
    for k in ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"]:
        print(" ", k, marks[k])


if __name__ == "__main__":
    main()
