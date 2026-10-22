import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
const result = await build({
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
const script = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>青班 · 轮班日历</title></head><body><div id="app"></div><script>${script}</script></body></html>`;
if (Buffer.byteLength(html) > 500000)
  throw new Error("Showcase exceeds 500,000 bytes");
await mkdir("showcase", { recursive: true });
await writeFile("showcase/preview.html", html);
console.log(`Self-contained showcase: ${Buffer.byteLength(html)} bytes`);
