import {mkdir,copyFile,readFile} from "node:fs/promises";
import {build} from "esbuild";
await mkdir("dist/assets",{recursive:true});
await build({entryPoints:["src/app.js"],bundle:true,format:"iife",platform:"browser",outfile:"dist/assets/app.js"});
await copyFile("public/icon.png","dist/icon.png");
const s=JSON.parse(await readFile("source.json"));
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:s.git_instance_id,database_instance_id:s.database_instance_id}));
