import { build } from "vite";
import { readFile, stat } from "node:fs/promises";
const commit = process.argv[2];
if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit ?? ""))
  throw new Error("先按源码发布指引核验干净工作树，再运行 node scripts/build.mjs <完整提交号>。");
const source = JSON.parse(await readFile("source.json", "utf8"));
for (const key of process.env.TIANA_TEMPLATE_BUILD === "1" ? [] : ["database_instance_id", "git_instance_id"]) {
  if (typeof source[key] !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(source[key]) || source[key].startsWith("__TIANA_"))
    throw new Error("先按 metadata.json 在 source.json 填写已核实的 SQLite 和 Git 实例 ID。");
}
await build();
await stat("dist/assets/app.js");
await stat("dist/assets/app.css");
// Report parameters for the management command; no project metadata is published.
console.log("TIANA_PROJECT_PARAMS " + JSON.stringify({ entry: "assets/app.js", ...source, source_commit: commit }));
