import {mkdir,copyFile,readFile} from "node:fs/promises";
await mkdir("dist",{recursive:true}); await copyFile("app.js","dist/app.js"); await copyFile("public/icon.png","dist/icon.png"); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"app.js",...JSON.parse(await readFile("source.json","utf8"))}));
