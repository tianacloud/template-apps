import {mkdir,copyFile,readFile} from "node:fs/promises";
const commit=process.argv[2]; if(!/^[0-9a-f]{40,64}$/.test(commit||"")) throw Error("commit required");
const s=JSON.parse(await readFile("source.json")); await mkdir("dist/assets",{recursive:true}); await copyFile("src/app.js","dist/assets/app.js"); await copyFile("public/icon.png","dist/icon.png"); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:s.git_instance_id}));
