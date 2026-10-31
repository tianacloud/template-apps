import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
const r = await build({
  entryPoints: ["src/demo.tsx"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  minify: true,
  legalComments: "inline",
  loader: { ".css": "text" },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});
const s = r.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>行迹 · 油耗账本</title></head><body><div id="app"></div><script>${s}</script></body></html>`;
if (Buffer.byteLength(html) > 500000)
  throw Error("Showcase exceeds 500,000 bytes");
await mkdir("showcase", { recursive: true });
await writeFile("showcase/preview.html", html);
console.log(Buffer.byteLength(html) + " bytes");
