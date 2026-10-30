import {mkdir,copyFile,readFile} from "node:fs/promises";
await mkdir("dist/assets",{recursive:true});
for(const f of ["app.js","app.css"]) await copyFile(f,`dist/assets/${f}`);
await copyFile("icon.png","dist/icon.png");
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:JSON.parse(await readFile("source.json","utf8")).git_instance_id}));
