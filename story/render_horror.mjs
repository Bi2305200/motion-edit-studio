import path from "path";
import { fileURLToPath } from "url";
import { bundle } from "@remotion/bundler";
import { openBrowser, selectComposition, renderStill, renderMedia } from "@remotion/renderer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const mode = process.argv[2] || "--check";

const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts") });
const browser = await openBrowser("chrome");
const composition = await selectComposition({ serveUrl, id: "HorrorStory", puppeteerInstance: browser });

if (mode === "--check") {
  for (const f of [100, 3850, 4680]) {
    await renderStill({
      composition,
      serveUrl,
      output: path.join(ROOT, "out", "check", `v2_f${f}.png`),
      frame: f,
      puppeteerInstance: browser,
    });
    console.log("rendered check frame", f);
  }
} else {
  const outMp4 = path.join(ROOT, "out", "horror_story_raw.mp4");
  let lastPct = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf: 17,
    pixelFormat: "yuv420p",
    imageFormat: "jpeg",
    jpegQuality: 92,
    concurrency: 6,
    outputLocation: outMp4,
    puppeteerInstance: browser,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct >= lastPct + 10) {
        lastPct = pct;
        console.log(`Render progress: ${pct}%`);
      }
    },
  });
  console.log("Rendered raw video:", outMp4);
}

await browser.close({ silent: false });
