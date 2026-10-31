import { build } from "esbuild";
import { mkdir, readdir, rm, cp, readFile } from "node:fs/promises";
const source = JSON.parse(await readFile("source.json", "utf8"));
if (source.entry !== "assets/app.js")
  throw Error("Entry must be assets/app.js");
await mkdir("dist", { recursive: true });
for (const f of await readdir("dist"))
  await rm("dist/" + f, { recursive: true, force: true });
await mkdir("dist/assets", { recursive: true });
await build({
  entryPoints: ["src/main.tsx"],
  outfile: "dist/assets/app.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  minify: true,
  legalComments: "eof",
  loader: { ".css": "text" },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});
await cp("public", "dist", { recursive: true });
console.log("Built assets/app.js and icon.png");
console.log("TIANA_PROJECT_PARAMS " + JSON.stringify(source));
