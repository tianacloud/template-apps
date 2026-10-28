import fs from "node:fs/promises";
const html=await fs.readFile("src/editor.html","utf8");
await fs.mkdir("dist/assets",{recursive:true});
await fs.writeFile("dist/assets/app.js",`const f=document.createElement("iframe"); f.style.cssText="position:fixed;inset:0;width:100%;height:100%;border:0"; f.srcdoc=${JSON.stringify(html)}; document.body.append(f);`);
await fs.copyFile("public/icon.png","dist/icon.png");
console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",...JSON.parse(await fs.readFile("source.json","utf8"))}));
