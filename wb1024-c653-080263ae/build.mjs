import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from "node:fs";
const html=readFileSync("index.html","utf8");
const css=html.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];
const body=html.match(/<body[^>]*>([\s\S]*?)<script[^>]*>([\s\S]*?)<\/script>/);
const names=[...body[2].matchAll(/^(?:async )?function (\w+)\(/gm)].map(x=>x[1]);
mkdirSync("dist/assets",{recursive:true});
writeFileSync("dist/assets/app.js",`const style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.appendChild(style); document.body.innerHTML=${JSON.stringify(body[1])};\n${body[2]}\nObject.assign(window,{${names.join(',')}});
for (const el of document.querySelectorAll('[onclick], [onchange]')) {
 for (const eventName of ['click','change']) {
  const attr='on'+eventName, code=el.getAttribute(attr); if (!code) continue; el.removeAttribute(attr);
  const file=code.match(/^document\\.getElementById\\('([^']+)'\\)\\.click\\(\\)$/);
  const call=code.match(/^(\\w+)\\((?:'([^']*)'|(event))?\\)$/);
  if (file) el.addEventListener(eventName,()=>document.getElementById(file[1]).click());
  else if (call) el.addEventListener(eventName,e=>window[call[1]](call[3]?e:call[2]));
 }
}`);
copyFileSync("icon.png","dist/icon.png");
console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(readFileSync('source.json')).git_instance_id}));
