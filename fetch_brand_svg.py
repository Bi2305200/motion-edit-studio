import os
import sys
import json
import urllib.request

STUDIO_DIR = os.path.dirname(os.path.abspath(__file__))
LOGOS_DIR = os.path.join(STUDIO_DIR, "public", "logos")
os.makedirs(LOGOS_DIR, exist_ok=True)

def fetch_logo(slug):
    """
    Fetches official brand SVG from SimpleIcons / svgl CDN (inspired by NateCue theSVG & svgl_logos).
    """
    urls = [
        f"https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/{slug.lower()}.svg",
    ]
    for url in urls:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                svg = resp.read().decode("utf-8")
                out_path = os.path.join(LOGOS_DIR, f"{slug.lower()}.svg")
                with open(out_path, "w", encoding="utf-8") as f:
                    f.write(svg)
                print(f"Downloaded brand SVG: {out_path} ({len(svg)} bytes)")
                return out_path
        except Exception as e:
            print(f"Warning fetching {slug}: {e}")
    return None

if __name__ == "__main__":
    brands = sys.argv[1:] or ["tiktok", "spotify", "youtube", "openai", "anthropic", "apple", "google"]
    for b in brands:
        fetch_logo(b)
