import {readFile,writeFile,mkdir,copyFile,rm} from "node:fs/promises";
const html=await readFile("app.html","utf8");
const style=html.match(/<style>([\s\S]*?)<\/style>/)[1];
const body=html.match(/<body>([\s\S]*?)<script>/)[1];
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
await rm("dist",{recursive:true,force:true}); await mkdir("dist/assets",{recursive:true});
await writeFile("dist/assets/app.js",`document.head.insertAdjacentHTML('beforeend',${JSON.stringify('<style>'+style+'</style>')});document.body.innerHTML=${JSON.stringify(body)};\n${script}`);
await copyFile("public/icon.png","dist/icon.png");
const source=JSON.parse(await readFile("source.json","utf8")); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",...source}));
