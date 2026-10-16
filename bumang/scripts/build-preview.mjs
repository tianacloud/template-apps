// Build showcase/preview.html: the production UI with an in-memory store,
// inlined into one self-contained page for a sandbox="allow-scripts" iframe.
import { build } from "vite";
import { readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "dist-preview");
const swap = {
  [path.join(root, "src/store.js")]: path.join(root, "src/preview-store.js"),
  [path.join(root, "src/load-style.js")]: "\0preview-empty",
};
await build({
  root,
  configFile: false,
  logLevel: "warn",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  plugins: [
    {
      name: "preview-swap",
      enforce: "pre",
      async resolveId(source, importer) {
        if (!importer || !source.startsWith(".")) return null;
        const target = swap[path.resolve(path.dirname(importer), source)];
        return target ?? null;
      },
      load: (id) => (id === "\0preview-empty" ? "" : null),
    },
  ],
  build: {
    lib: { entry: path.join(root, "src/preview.js"), formats: ["es"], fileName: "preview", cssFileName: "preview" },
    outDir,
    emptyOutDir: true,
  },
});
const js = (await readFile(path.join(outDir, "preview.js"), "utf8")).replace(/<\/script/gi, "<\\/script");
const css = (await readFile(path.join(outDir, "preview.css"), "utf8")).replace(/<\/style/gi, "<\\/style");
const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>不忙 · 示例体验</title>
<style>${css}</style>
</head>
<body><div id="app"></div><script type="module">${js}</script></body>
</html>
`;
await writeFile(path.join(root, "showcase/preview.html"), html);
await rm(outDir, { recursive: true, force: true });
console.log(`showcase/preview.html ${Buffer.byteLength(html)} bytes`);
