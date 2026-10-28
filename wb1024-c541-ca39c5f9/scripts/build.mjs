import {mkdir,copyFile,readFile} from "node:fs/promises";
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||"")) throw Error("需要完整源码提交");
const source=JSON.parse(await readFile("source.json"));
await mkdir("dist/assets",{recursive:true}); await copyFile("src/app.js","dist/assets/app.js"); await copyFile("public/icon.png","dist/icon.png");
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",...source,source_commit:commit}));
