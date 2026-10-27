import {readFile,writeFile,mkdir,copyFile} from "node:fs/promises";
const css=await readFile("style.css","utf8"), body=await readFile("body.html","utf8"), engine=await readFile("engine.js","utf8");
await mkdir("dist/assets",{recursive:true});
await writeFile("dist/assets/app.js",`const style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.getElementById("app").innerHTML=${JSON.stringify(body)};\n${engine}`);
await copyFile("public/icon.png","dist/icon.png");
const source=JSON.parse(await readFile("source.json","utf8"));
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:source.git_instance_id}));
