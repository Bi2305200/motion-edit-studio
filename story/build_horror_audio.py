"""
Mix âm thanh hoàn chỉnh cho video truyện kinh dị 'PHÒNG TRỌ 1,5 TRIỆU':
  - Voiceover Adam (story/vo/p0..p8.mp3) đặt đúng timestamp từng đoạn + EQ ấm/rõ
  - Nền horror drone & room tone tổng hợp bằng numpy (44.1kHz stereo)
  - Foley đồng bộ khung hình Remotion: tiếng gõ kính CẠCH, tim đập (holdbreath->p8), tiếng rít kính KÉT, tiếng thở hắt
  - Kho SFX thực từ public/audio/sfx_user/ (Suspense, Glitch_01..05, Impact, Vine Boom, Riser, Woosh, Beep...)
  - Sidechain ducking nền dưới giọng đọc + chuẩn âm lượng TikTok (-14 LUFS) -> story/horror_master_audio.wav

Chạy: python story/build_horror_audio.py
"""
import os, json, wave, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
AUDIO_DIR = os.path.join(ROOT, "public", "audio")
USER_SFX = os.path.join(AUDIO_DIR, "sfx_user")
STEMS = os.path.join(HERE, "audio_stems")
os.makedirs(STEMS, exist_ok=True)

SR = 44100


def write_wav_stereo(path, data_2ch):
    # data_2ch shape: (2, N) float32 in [-1, 1]
    clipped = np.clip(data_2ch, -0.99, 0.99)
    pcm = (clipped.T * 32767.0).astype("<i2").tobytes()
    with wave.open(path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm)


def decode_audio_stereo(path, af=None):
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", path]
    if af:
        cmd += ["-af", af]
    cmd += ["-f", "f32le", "-acodec", "pcm_f32le", "-ar", str(SR), "-ac", "2", "pipe:1"]
    r = subprocess.run(cmd, capture_output=True, check=True)
    arr = np.frombuffer(r.stdout, dtype=np.float32)
    return arr.reshape(-1, 2).T  # shape (2, N)


def add_clip(buf, clip, start_sec, gain=1.0, max_sec=None):
    idx = int(round(start_sec * SR))
    if idx >= buf.shape[1] or idx + clip.shape[1] <= 0:
        return
    if max_sec is not None:
        m = int(max_sec * SR)
        if clip.shape[1] > m:
            clip = clip[:, :m].copy()
            fade = min(int(0.08 * SR), m)
            clip[:, -fade:] *= np.linspace(1.0, 0.0, fade, dtype=np.float32)
    s_dst = max(0, idx)
    s_src = max(0, -idx)
    n = min(buf.shape[1] - s_dst, clip.shape[1] - s_src)
    if n > 0:
        buf[:, s_dst:s_dst + n] += clip[:, s_src:s_src + n] * gain


def synth_drone(total_sec, M):
    n = int(np.ceil(total_sec * SR))
    t = np.linspace(0, total_sec, n, endpoint=False, dtype=np.float64)

    # Dark minor horror sub + bowed pad
    f1, f2, f3 = 46.25, 69.30, 138.59  # F#1, C#2, C#3 minor fifth dark resonance
    lfo = 0.72 + 0.28 * np.sin(2 * np.pi * 0.11 * t)
    detune = 0.25 * np.sin(2 * np.pi * 0.07 * t)
    pad = (
        0.52 * np.sin(2 * np.pi * f1 * t)
        + 0.30 * np.sin(2 * np.pi * (f2 + detune) * t + 0.4)
        + 0.14 * np.sin(2 * np.pi * (f3 - detune * 1.4) * t + 1.1)
    ) * lfo

    # Stereo eerie high harmonics swelling during horror section (p3 -> p8)
    rng = np.random.default_rng(42)
    noise = rng.normal(0, 1, n)
    # Smooth cold air hiss (moving average difference = gentle bandpass feel)
    air_l = np.convolve(noise, np.ones(14) / 14.0, mode="same") * 0.055
    air_r = np.convolve(np.roll(noise, 7), np.ones(16) / 16.0, mode="same") * 0.055

    # Dynamic tension envelope across story chapters
    env = np.ones(n, dtype=np.float64) * 0.38
    k_n3 = np.clip((t - (M["night3"] - 1.5)) / 4.0, 0.0, 1.0)
    k_p6 = np.clip((t - (M["p6"] - 1.0)) / 3.0, 0.0, 1.0)
    k_dawn = np.clip((t - M["traffic"]) / 4.0, 0.0, 1.0)
    k_end = np.clip((t - M["vo_end"]) / 3.5, 0.0, 1.0)
    env = 0.38 + 0.28 * k_n3 + 0.28 * k_p6 - 0.32 * k_dawn
    # Fade in first 0.6s & fade out last 2.2s
    fade_in = np.clip(t / 0.6, 0.0, 1.0)
    fade_out = np.clip((total_sec - t) / 2.2, 0.0, 1.0)
    env = np.clip(env * (1.0 - 0.35 * k_end), 0.15, 1.0) * fade_in * fade_out

    left = (pad + air_l * (0.3 + 0.7 * k_n3)) * env * 0.32
    right = (pad * 0.98 + 0.05 * np.sin(2 * np.pi * (f2 + 0.35) * t) + air_r * (0.3 + 0.7 * k_n3)) * env * 0.32
    return np.vstack([left, right]).astype(np.float32)


def synth_knock():
    # Hollow frosted-glass knock (~0.24s)
    dur = 0.24
    n = int(dur * SR)
    t = np.linspace(0, dur, n, endpoint=False)
    rng = np.random.default_rng(13)
    click = rng.normal(0, 1, n) * np.exp(-t * 140)
    body = (
        0.55 * np.sin(2 * np.pi * 240 * t * np.exp(-t * 2.5)) * np.exp(-t * 28)
        + 0.45 * np.sin(2 * np.pi * 510 * t) * np.exp(-t * 42)
        + 0.25 * np.sin(2 * np.pi * 920 * t) * np.exp(-t * 70)
    )
    sig = np.tanh((click * 0.45 + body * 0.85) * 1.4) * 0.82
    return np.vstack([sig, sig * 0.96]).astype(np.float32)


def synth_heartbeat():
    # Deep lub-dub thump (~0.48s)
    dur = 0.48
    n = int(dur * SR)
    t = np.linspace(0, dur, n, endpoint=False)
    # lub at 0.0s, dub at 0.17s
    lub = np.sin(2 * np.pi * (58 * np.exp(-t * 7) + 32) * t) * np.exp(-t * 24)
    t2 = np.maximum(0, t - 0.17)
    dub = np.where(t >= 0.17, np.sin(2 * np.pi * (52 * np.exp(-t2 * 8) + 28) * t2) * np.exp(-t2 * 26) * 0.78, 0.0)
    sig = np.tanh((lub + dub) * 1.6) * 0.85
    return np.vstack([sig, sig]).astype(np.float32)


def synth_glass_screech():
    # Eerie finger dragging on frosted glass (~1.75s)
    dur = 1.75
    n = int(dur * SR)
    t = np.linspace(0, dur, n, endpoint=False)
    rng = np.random.default_rng(99)
    # Slow friction stick-slip bursts + high resonant screech around 1850-2450 Hz
    glide = 1920 + 480 * np.sin(2 * np.pi * 0.65 * t) - 240 * (t / dur)
    phase = 2 * np.pi * np.cumsum(glide) / SR
    vib = 0.65 + 0.35 * np.sin(2 * np.pi * 24 * t)
    squeak = (
        0.55 * np.sin(phase)
        + 0.28 * np.sin(phase * 1.498)
        + 0.16 * np.sin(phase * 2.02)
    ) * vib
    grit = np.convolve(rng.normal(0, 1, n), np.array([1, -0.85]), mode="same") * 0.09
    env = np.clip(t / 0.15, 0, 1) * np.clip((dur - t) / 0.35, 0, 1) * (0.7 + 0.3 * np.sin(2 * np.pi * 2.1 * t))
    sig = np.tanh((squeak * 0.45 + grit) * env * 1.3) * 0.48
    return np.vstack([sig * 0.94, sig]).astype(np.float32)


def synth_heavy_breath():
    # Cold eerie exhale right behind the window (~2.0s)
    dur = 2.0
    n = int(dur * SR)
    t = np.linspace(0, dur, n, endpoint=False)
    rng = np.random.default_rng(77)
    raw = rng.normal(0, 1, n)
    # Shape airflow spectrum via simple resonant smoothing
    s1 = np.convolve(raw, np.ones(18) / 18.0, mode="same")
    s2 = np.convolve(raw, np.ones(65) / 65.0, mode="same")
    air = s1 - 0.7 * s2
    env = np.sin(np.pi * (t / dur)) ** 1.3 * (0.75 + 0.25 * np.sin(2 * np.pi * 4.5 * t))
    sig_l = air * env * 1.4
    sig_r = np.roll(air, 45) * env * 1.35
    return np.clip(np.vstack([sig_l, sig_r]), -0.8, 0.8).astype(np.float32)


def main():
    tl = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf-8"))
    M = tl["marks"]
    total = tl["total"]
    n_samples = int(np.ceil(total * SR))

    # 1. Voiceover stem (warm storytelling EQ + dynamic compression)
    vo_buf = np.zeros((2, n_samples), dtype=np.float32)
    vo_af = (
        "highpass=f=80,"
        "equalizer=f=160:t=o:w=1.4:g=2.5,"
        "equalizer=f=3200:t=o:w=1.4:g=2.5,"
        "acompressor=threshold=-18dB:ratio=3:attack=5:release=90"
    )
    for item in tl["vo"]:
        clip = decode_audio_stereo(os.path.join(ROOT, item["file"]), af=vo_af)
        add_clip(vo_buf, clip, item["start"], gain=1.45)
    vo_stem = os.path.join(STEMS, "stem_vo.wav")
    write_wav_stereo(vo_stem, vo_buf)

    # 2. Atmospheric Horror Drone stem
    drone_buf = synth_drone(total, M)
    drone_stem = os.path.join(STEMS, "stem_drone.wav")
    write_wav_stereo(drone_stem, drone_buf)

    # 3. Foley + User SFX Library stem
    sfx_buf = np.zeros((2, n_samples), dtype=np.float32)

    # Custom frame-synced horror foley
    knock_wav = synth_knock()
    knock_times = [M["knock1"], M["knock1"] + 0.45, M["knock2"], M["knock2"] + 0.55]
    x = M["rhythm"] + 0.4
    while x < M["p5"] - 1.2:
        knock_times.append(x)
        x += 0.85
    for i, kt in enumerate(knock_times):
        add_clip(sfx_buf, knock_wav, kt, gain=0.68 if i < 4 else 0.52)

    # Heartbeat from holdbreath -> p8 (accelerates smoothly)
    hb_wav = synth_heartbeat()
    ht = M["holdbreath"]
    while ht < M["p8"] - 0.5:
        progress = min(1.0, (ht - M["holdbreath"]) / max(1.0, M["p8"] - M["holdbreath"]))
        period = 0.82 - 0.28 * progress
        gain = 0.26 + 0.30 * progress
        add_clip(sfx_buf, hb_wav, ht, gain=gain)
        ht += period

    # Screech + Breath
    add_clip(sfx_buf, synth_glass_screech(), M["screech"], gain=0.58)
    add_clip(sfx_buf, synth_heavy_breath(), M["breath"], gain=0.72)

    # Real SFX from user's curated folders + core studio library
    sfx_files = {
        "suspense": os.path.join(USER_SFX, "sfx_capcut", "37. Intro Suspense.MP3"),
        "impact": os.path.join(USER_SFX, "sfx_main", "impact.MP3"),
        "boom": os.path.join(USER_SFX, "sfx_main", "vine-boom.mp3"),
        "woosh": os.path.join(USER_SFX, "sfx_main", "dramatic woosh.MP3"),
        "riser": os.path.join(USER_SFX, "sfx_main", "popular-riser-metallic-sound-effect.mp3"),
        "beep": os.path.join(USER_SFX, "sfx_capcut", "20. Beep.MP3"),
        "drama": os.path.join(USER_SFX, "sfx_main", "drama.MP3"),
        "g1": os.path.join(USER_SFX, "transitions", "Glitch_01.wav"),
        "g2": os.path.join(USER_SFX, "transitions", "Glitch_02.wav"),
        "g3": os.path.join(USER_SFX, "transitions", "Glitch_03.wav"),
        "g4": os.path.join(USER_SFX, "transitions", "Glitch_04.wav"),
        "g5": os.path.join(USER_SFX, "transitions", "Glitch_05.wav"),
        "click": os.path.join(AUDIO_DIR, "sfx_click.mp3"),
        "pop": os.path.join(AUDIO_DIR, "sfx_pop.mp3"),
    }
    cache = {}
    for k, p in sfx_files.items():
        if os.path.exists(p):
            cache[k] = decode_audio_stereo(p)

    cues = [
        # Hook
        ("suspense", 0.05, 0.34, 3.6),
        ("pop", M["hook_price"] - 0.08, 0.42, None),
        ("boom", M["hook_night3"] - 0.02, 0.56, 1.2),
        ("g1", M["hook_night3"], 0.28, 0.4),
        # Chapter transitions & UI cues
        ("woosh", M["p1"] - 0.15, 0.36, 1.3),
        ("click", M["fb_post"] + 0.4, 0.32, None),
        ("click", M["fb_post"] + 1.8, 0.32, None),
        ("click", M["fb_post"] + 3.2, 0.32, None),
        ("impact", M["cheap"] - 0.04, 0.52, 1.8),
        ("woosh", M["p2"] - 0.15, 0.34, 1.3),
        ("beep", M["warn"] - 0.05, 0.32, 0.65),
        ("drama", M["window"] + 0.4, 0.28, 3.2),
        ("woosh", M["p3"] - 0.15, 0.36, 1.3),
        ("pop", M["night1"] + 0.2, 0.38, None),
        ("pop", M["night1"] + 1.7, 0.38, None),
        ("g2", M["night3"] - 0.04, 0.32, 0.45),
        ("beep", M["t0130"] - 0.05, 0.34, 0.65),
        ("g3", M["knock1"], 0.22, 0.35),
        ("woosh", M["p5"] - 0.15, 0.34, 1.2),
        ("g4", M["chill"], 0.26, 0.4),
        ("impact", M["nobalcony"], 0.42, 1.4),
        ("riser", M["p6"] - 2.3, 0.38, 2.5),
        ("g5", M["p6"], 0.30, 0.45),
        ("boom", M["fivefingers"] - 0.04, 0.58, 1.25),
        ("g1", M["fivefingers"], 0.28, 0.4),
        ("g2", M["screech"], 0.24, 0.45),
        ("g3", M["breath"], 0.24, 0.45),
        ("woosh", M["p8"] - 0.15, 0.30, 1.2),
        ("impact", M["keys"] - 0.05, 0.38, 1.5),
        ("g4", M["landlady2"], 0.24, 0.45),
        ("impact", M["vo_end"] + 0.25, 0.48, 2.2),
    ]
    for k, sec, gain, max_d in cues:
        if k in cache:
            add_clip(sfx_buf, cache[k], sec, gain=gain, max_sec=max_d)

    sfx_stem = os.path.join(STEMS, "stem_sfx.wav")
    write_wav_stereo(sfx_stem, sfx_buf)

    # 4. Final Master Mix with Sidechain Ducking + TikTok Loudnorm (-14 LUFS)
    out_wav = os.path.join(HERE, "horror_master_audio.wav")
    pub_wav = os.path.join(AUDIO_DIR, "horror_master_audio.wav")
    fc = (
        "[0:a]asplit=2[vo_main][vo_sc];"
        "[1:a][vo_sc]sidechaincompress=threshold=0.03:ratio=5:attack=25:release=350[drone_d];"
        "[vo_main][drone_d][2:a]amix=inputs=3:duration=first:normalize=0,"
        f"atrim=duration={total},loudnorm=I=-14:TP=-1.5:LRA=11[out]"
    )
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", vo_stem, "-i", drone_stem, "-i", sfx_stem,
        "-filter_complex", fc, "-map", "[out]", "-ar", str(SR), "-ac", "2", out_wav
    ], check=True)

    # Also copy to public/audio so it can be staged in CapCut/artifacts
    import shutil
    shutil.copy2(out_wav, pub_wav)
    print(f"Mix hoàn tất: {out_wav} ({total:.1f}s)")


if __name__ == "__main__":
    main()
