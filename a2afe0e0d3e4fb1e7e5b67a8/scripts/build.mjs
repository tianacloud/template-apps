import {mkdir,copyFile,readFile} from "node:fs/promises";
import {build} from "esbuild";
await mkdir("dist/assets",{recursive:true});
await build({entryPoints:["src/main.js"],bundle:true,format:"iife",outfile:"dist/assets/app.js"});
await copyFile("public/icon.png","dist/icon.png");
const source=JSON.parse(await readFile("source.json","utf8"));
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",...source}));
