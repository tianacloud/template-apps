import {mkdir,copyFile,readFile} from "node:fs/promises";
import {build} from "esbuild";
await mkdir("dist/assets",{recursive:true});
await build({entryPoints:["src/app.js"],outfile:"dist/assets/app.js",bundle:true,format:"esm",platform:"browser"});
await copyFile("public/icon.png","dist/icon.png");
const source=JSON.parse(await readFile("source.json","utf8"));
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id}));
