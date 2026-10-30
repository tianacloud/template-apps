import {mkdir,copyFile,readFile,writeFile} from "node:fs/promises";
await mkdir("dist/assets",{recursive:true}); await copyFile("app.js","dist/assets/app.js"); await copyFile("app.css","dist/assets/app.css"); await copyFile("icon.png","dist/icon.png"); const s=JSON.parse(await readFile("source.json")); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",...s}));
