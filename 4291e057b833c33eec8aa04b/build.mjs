import {readFileSync, mkdirSync, writeFileSync, copyFileSync, rmSync} from "node:fs";
import {build} from "esbuild";
const out="dist"; rmSync(out,{recursive:true,force:true}); mkdirSync(out+"/assets",{recursive:true});
const body=readFileSync("body.html","utf8");
await build({entryPoints:["app.js"],bundle:true,format:"esm",platform:"browser",outfile:out+"/assets/app.js",banner:{js:`const l=document.createElement("link");l.rel="stylesheet";l.href=new URL("./styles.css",import.meta.url).href;document.head.appendChild(l);document.body.innerHTML=${JSON.stringify(body)};`}});
copyFileSync("styles.css",out+"/assets/styles.css");copyFileSync("icon.png",out+"/icon.png");
const s=JSON.parse(readFileSync("source.json","utf8")); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:s.git_instance_id,database_instance_id:s.database_instance_id}));
