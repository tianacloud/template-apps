import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { transform } from "esbuild";
const name = process.argv[2],
  root = path.resolve(name);
const metadata = JSON.parse(
  await readFile(path.join(root, "metadata.json"), "utf8"),
);
execFileSync("npm", ["ci", "--no-audit", "--no-fund"], {
  cwd: root,
  stdio: "pipe",
});
const sdkPath = path.join(
  root,
  "node_modules/@tianacloud/serverless/dist/index.js",
);
const originalSDK = await readFile(sdkPath);
let log;
try {
  await writeFile(
    sdkPath,
    "export const createTianaFetch = () => globalThis.fetch.bind(globalThis);",
  );
  log = execFileSync(
    "npm",
    [
      "run",
      "build",
      "--",
      execFileSync("git", ["rev-parse", "HEAD"]).toString().trim(),
    ],
    {
      cwd: root,
      env: { ...process.env, TIANA_TEMPLATE_BUILD: "1" },
      stdio: "pipe",
    },
  ).toString();
} finally {
  await writeFile(sdkPath, originalSDK);
}
const { entry } = JSON.parse(
  log
    .split("\n")
    .find((x) => x.startsWith("TIANA_PROJECT_PARAMS "))
    .slice(21),
);
const files = {};
async function collect(rel = "") {
  for (const f of await readdir(path.join(root, "dist", rel), {
    withFileTypes: true,
  })) {
    let n = path.posix.join(rel, f.name);
    if (f.isDirectory()) await collect(n);
    else files[n] = await readFile(path.join(root, "dist", n));
  }
}
await collect();
const mime = (n) =>
  ({
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    svg: "image/svg+xml",
    woff2: "font/woff2",
    css: "text/css",
    js: "text/javascript",
  })[n.split(".").pop()] || "application/octet-stream";
const data = (n) => `data:${mime(n)};base64,${files[n].toString("base64")}`;
const assets = Object.fromEntries(
  Object.keys(files)
    .filter((n) => n !== entry)
    .map((n) => ["/" + n, data(n)]),
);
let css = Object.entries(files)
  .filter(([n]) => n.endsWith(".css"))
  .map(([n, b]) =>
    b.toString().replace(/url\((['"]?)(.*?)\1\)/g, (all, q, url) => {
      const k = url.startsWith("/")
        ? url.slice(1)
        : path.posix.normalize(path.posix.join(path.posix.dirname(n), url));
      return files[k] ? `url("${data(k)}")` : all;
    }),
  )
  .join("\n")
  .replace(/@import\s*(?:"[^"]*"|'[^']*'|url\([^)]*\))\s*;/g, "");
let schema = metadata.schema
  ? await readFile(path.join(root, metadata.schema), "utf8")
  : "";
// The browser's embedded SQLite uses FTS4 for the same local search interactions.
schema = schema
  .replace(
    "fts5(terms, content='dining_events', content_rowid='rowid')",
    "fts4(terms)",
  )
  .replace(
    'INSERT INTO dining_search(dining_search, "rowid", terms) VALUES (\'delete\', old."rowid", old.terms);',
    "DELETE FROM dining_search WHERE rowid=old.rowid;",
  );
let seed = metadata.seeds
  ? await readFile(path.join(root, metadata.seeds), "utf8")
  : "";
const fixture = await readFile(
  new URL("./showcase-runtime.js", import.meta.url),
  "utf8",
);
const asm = await readFile(
  new URL("../node_modules/sql.js/dist/sql-asm.js", import.meta.url),
  "utf8",
);
let js = (
  await transform(files[entry].toString(), {
    format: "esm",
    target: "es2022",
    define: {
      "import.meta.url": JSON.stringify("https://preview.invalid/" + entry),
    },
  })
).code;
const safe = (s) => s.replace(/<\/script/gi, "<\\/script");
const license = await readFile(
  new URL("../node_modules/sql.js/LICENSE", import.meta.url),
  "utf8",
);
const html = `<!-- sql.js / SQLite preview runtime\n${license}\n-->\n<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${metadata.display_name}</title><style>${css}</style></head><body><div id="app"></div><script>${safe(asm)}</script><script>const showcase=${JSON.stringify({ name, schema, seed, assets })};\n${safe(fixture)}\nready.then(async()=>{${safe(js)}}).catch(error=>{console.error(error);document.body.append(document.createTextNode(error.message))});</script></body></html>`;
await mkdir(path.resolve("dist/live-showcases"), { recursive: true });
await writeFile(path.resolve("dist/live-showcases", name + ".html"), html);
console.log(name, html.length);
