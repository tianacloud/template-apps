import { build } from "vite";
import { readFile } from "node:fs/promises";
const commit = process.argv[2];
if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit || ""))
  throw Error("Pass the verified full source commit.");
await build();
const source = JSON.parse(await readFile("source.json", "utf8"));
console.log(
  "TIANA_PROJECT_PARAMS " +
    JSON.stringify({
      entry: "assets/app.js",
      ...source,
      source_commit: commit,
    }),
);
