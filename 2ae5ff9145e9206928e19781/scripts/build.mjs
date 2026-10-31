import {mkdir,copyFile,readFile,rm} from "node:fs/promises";
import {build} from "esbuild";
await rm("dist",{recursive:true,force:true});
await mkdir("dist/assets",{recursive:true});
await build({entryPoints:["src/main.js"],outfile:"dist/assets/app.js",bundle:true,format:"esm"});
for(const [a,b] of [["src/style.css","dist/assets/app.css"],["public/icon.png","dist/icon.png"]]) await copyFile(a,b);
const s=JSON.parse(await readFile("source.json","utf8")); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",...s}));
