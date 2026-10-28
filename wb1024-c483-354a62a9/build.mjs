import {mkdir,copyFile,readFile} from "node:fs/promises";
await mkdir("dist/assets",{recursive:true}); await copyFile("app.js","dist/assets/app.js"); await copyFile("public/icon.png","dist/icon.png"); const source=JSON.parse(await readFile("source.json")); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:source.git_instance_id}));
