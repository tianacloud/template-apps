import {mkdir,copyFile,readFile} from "node:fs/promises";
const commit=process.argv[2]; if(!/^[a-f0-9]{40}$/.test(commit||"")) throw Error("完整提交号必填");
await mkdir("dist/assets",{recursive:true}); await copyFile("app.js","dist/assets/app.js"); await copyFile("public/icon.png","dist/icon.png");
const source=JSON.parse(await readFile("source.json","utf8")); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:source.git_instance_id}));
