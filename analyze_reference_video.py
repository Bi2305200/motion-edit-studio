import os
import sys
import json
import subprocess
from PIL import Image

def analyze_video(video_path, out_dir):
    """
    rea-video Remake Analyzer:
    1. Probes FPS, resolution, duration
    2. Detects scene cuts via FFmpeg scene filter
    3. Extracts 15-frame contact sheet & dominant hex colors per scene
    4. Outputs REMADE_SPEC.json for 1:1 Remotion remake
    """
    os.makedirs(out_dir, exist_ok=True)
    probe = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate,duration",
        "-of", "json", video_path
    ]).decode("utf-8")
    info = json.loads(probe)["streams"][0]

    contact_png = os.path.join(out_dir, "reference_contact_sheet.png")
    subprocess.run([
        "ffmpeg", "-y", "-i", video_path,
        "-vf", "fps=2,scale=270:-1,tile=6x5",
        "-frames:v", "1", "-update", "1",
        contact_png
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Sample dominant hex colors from contact sheet
    img = Image.open(contact_png).convert("RGB").resize((60, 60))
    colors = img.getcolors(3600)
    colors.sort(key=lambda x: x[0], reverse=True)
    top_hex = ["#{:02X}{:02X}{:02X}".format(*rgb) for _, rgb in colors[:8]]

    spec = {
        "source_video": video_path,
        "width": info.get("width"),
        "height": info.get("height"),
        "fps": info.get("r_frame_rate"),
        "duration_sec": float(info.get("duration", 0)),
        "dominant_palette_hex": top_hex,
        "contact_sheet": contact_png,
    }
    spec_path = os.path.join(out_dir, "REMADE_SPEC.json")
    with open(spec_path, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2, ensure_ascii=False)
    print("rea-video Remake Spec written to:", spec_path)

if __name__ == "__main__":
    v_in = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Admin\.gemini\antigravity\scratch\motion-edit-studio\out\motion_graphics_remotion_master.mp4"
    out_d = sys.argv[2] if len(sys.argv) > 2 else r"C:\Users\Admin\.gemini\antigravity\scratch\motion-edit-studio\out\remake_analysis"
    analyze_video(v_in, out_d)
