import {build} from "esbuild";
import {mkdir,copyFile,readFile,rm} from "node:fs/promises";
const source=JSON.parse(await readFile("source.json","utf8"));
await rm("dist",{recursive:true,force:true});await mkdir("dist/assets",{recursive:true});
await build({entryPoints:["src/app.js"],bundle:true,format:"esm",outfile:"dist/assets/app.js",loader:{".css":"text"}});
await copyFile("public/icon.png","dist/icon.png");
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:source.git_instance_id}));
