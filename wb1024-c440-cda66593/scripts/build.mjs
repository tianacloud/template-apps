import { build } from "vite";
import { readFile } from "node:fs/promises";
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||"")) throw Error("需要完整源码提交号");
const source=JSON.parse(await readFile("source.json","utf8"));
await build();
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:source.git_instance_id,source_commit:commit}));
