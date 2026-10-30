import { build } from "esbuild";
import { spriteFix } from "./scripts/jsnes-sprite-fix.mjs";
import { mapper25 } from "./scripts/jsnes-mapper25.mjs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
const commit = process.argv[2];
if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit ?? ""))
  throw new Error(
    "Build with the verified full source commit: npm run build -- <commit>",
  );
await mkdir("dist", { recursive: true });
await copyFile("public/icon.png", "dist/icon.png");
const speakerPath = "node_modules/jsnes/src/browser/speakers.js";
const original = await readFile(speakerPath, "utf8");
const match = original.match(/const workletCode = `([\s\S]*?)`;/);
if (!match) throw new Error("Cannot extract JSNES audio worklet");
await writeFile("dist/audio-worklet.js", match[1]);
await build({
  entryPoints: ["src/app.js"],
  outfile: "dist/app.js",
  bundle: true,
  format: "esm",
  minify: true,
  loader: { ".css": "text" },
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [
    spriteFix,
    mapper25,
    {
      name: "static-audio-worklet",
      setup(builder) {
        builder.onLoad(
          { filter: /jsnes\/src\/browser\/speakers\.js$/ },
          async () => ({
            contents: original
              .replace(match[0], "")
              .replace(
                "new window.AudioContext()",
                "new window.AudioContext({ sampleRate: 44100 })",
              )
              .replace(
                'const blob = new Blob([workletCode], { type: "application/javascript" });',
                "const audioCtx = this.audioCtx;",
              )
              .replace(
                "const workletUrl = URL.createObjectURL(blob);",
                'const workletUrl = new URL("./audio-worklet.js", import.meta.url).href;',
              )
              .replace(
                "await this.audioCtx.audioWorklet.addModule(workletUrl);",
                "await audioCtx.audioWorklet.addModule(workletUrl);\n    if (this.audioCtx !== audioCtx) return;",
              )
              .replace("URL.revokeObjectURL(workletUrl);", ""),
            loader: "js",
          }),
        );
      },
    },
  ],
});
const source = JSON.parse(await readFile("source.json", "utf8"));
console.log(
  "TIANA_PROJECT_PARAMS " +
    JSON.stringify({ entry: "app.js", ...source, source_commit: commit }),
);
