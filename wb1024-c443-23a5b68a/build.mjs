import {readFileSync, mkdirSync, writeFileSync, copyFileSync, rmSync} from "node:fs";
const out="dist"; rmSync(out,{recursive:true,force:true}); mkdirSync(out+"/assets",{recursive:true});
const body=readFileSync("body.html","utf8"); const code=readFileSync("app.js","utf8");
writeFileSync(out+"/assets/app.js", `const l=document.createElement("link");l.rel="stylesheet";l.href=new URL("./styles.css",import.meta.url).href;document.head.appendChild(l);document.body.innerHTML=${JSON.stringify(body)};\n${code}`);
copyFileSync("styles.css",out+"/assets/styles.css");copyFileSync("icon.png",out+"/icon.png");
const s=JSON.parse(readFileSync("source.json","utf8")); console.log("TIANA_PROJECT_PARAMS="+JSON.stringify({entry:"assets/app.js",git_instance_id:s.git_instance_id}));
