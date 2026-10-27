import {readFile, mkdir, writeFile, copyFile} from 'node:fs/promises';
const html=await readFile('index.html','utf8');
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
const body=html.match(/<body[^>]*>([\s\S]*?)<script>/)[1];
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`document.title="工资计算器 · 离线版";const style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.body.innerHTML=${JSON.stringify(body)};\n${js}`);
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(await readFile('source.json','utf8')).git_instance_id}));
