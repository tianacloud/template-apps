import {readFile, mkdir, writeFile, copyFile} from "node:fs/promises";
const body=await readFile("src/body.html","utf8"), css=await readFile("src/style.css","utf8"), js=await readFile("src/app.js","utf8");
await mkdir("dist/assets",{recursive:true});
await writeFile("dist/assets/app.js",`document.title="3D 打印耗材库";document.head.insertAdjacentHTML("beforeend",${JSON.stringify("<style>"+css+"</style>")});document.getElementById("app").innerHTML=${JSON.stringify(body)};\n${js}`);
await copyFile("icon.png","dist/icon.png");
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",...JSON.parse(await readFile("source.json","utf8"))}));
