import { build } from "vite";
import { readFile, copyFile } from "node:fs/promises";
await build();
await copyFile("public/icon.png", "dist/icon.png");
const source=JSON.parse(await readFile("source.json", "utf8"));
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id}));
