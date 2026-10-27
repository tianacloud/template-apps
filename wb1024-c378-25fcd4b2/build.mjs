import {mkdir,copyFile,readFile} from "node:fs/promises";
await mkdir("dist/assets",{recursive:true});
for(const f of ["app.js","echarts.js","guide.js","data.js"]) await copyFile(f,"dist/assets/"+f);
await copyFile("public/icon.png","dist/icon.png");
const s=JSON.parse(await readFile("source.json","utf8"));
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:s.git_instance_id}));
