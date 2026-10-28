import {mkdir,copyFile,readFile} from "node:fs/promises";
await mkdir("dist/assets",{recursive:true}); await copyFile("app.js","dist/assets/app.js"); await copyFile("public/icon.png","dist/icon.png"); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:JSON.parse(await readFile("source.json","utf8")).git_instance_id}));
