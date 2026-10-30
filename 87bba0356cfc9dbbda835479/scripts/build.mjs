import {mkdir,copyFile,readFile,writeFile} from "node:fs/promises";
import {build} from "esbuild";
const commit=process.argv[2]; if(!/^[0-9a-f]{40,64}$/.test(commit||"")) throw Error("commit required");
const s=JSON.parse(await readFile("source.json")); await mkdir("dist/assets",{recursive:true});
const output=await build({entryPoints:["src/app.js"],bundle:true,write:false,format:"iife",platform:"browser"});
await writeFile("dist/assets/app.js",output.outputFiles[0].text); await copyFile("public/icon.png","dist/icon.png");
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",...s}));
