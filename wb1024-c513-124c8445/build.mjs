import {mkdir,copyFile,readFile} from "node:fs/promises";
const commit=process.argv[2]; if(!/^[a-f0-9]{40}$/.test(commit||"")) throw Error("full commit required");
await mkdir("dist",{recursive:true}); await copyFile("src/app.js","dist/app.js"); await copyFile("public/icon.png","dist/icon.png"); const source=JSON.parse(await readFile("source.json","utf8")); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"app.js",...source}));
