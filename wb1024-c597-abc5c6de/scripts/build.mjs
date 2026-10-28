import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const html=await readFile('index.html','utf8'), css=await readFile('styles.css','utf8'), js=await readFile('app.js','utf8');
const body=html.match(/<body>([\s\S]*?)<script src="app.js"><\/script>/)[1];
await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`document.title="到期雷达 · 别再白扣费";const s=document.createElement("style");s.textContent=${JSON.stringify(css)};document.head.appendChild(s);document.body.innerHTML=${JSON.stringify(body)};\n`+js);
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
