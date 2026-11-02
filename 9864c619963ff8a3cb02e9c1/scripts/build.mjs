import { build } from "vite";
import { readFile } from "node:fs/promises";
const source=JSON.parse(await readFile("source.json","utf8"));
await build({configFile:false,build:{lib:{entry:"src/entry.js",formats:["es"],fileName:()=>"assets/app.js"},cssCodeSplit:false,rollupOptions:{output:{assetFileNames:asset=>asset.name?.endsWith(".css") ? "assets/app.css" : "assets/[name][extname]"}}}});
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",database_instance_id:source.database_instance_id,git_instance_id:source.git_instance_id}));
