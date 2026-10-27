import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
const html=readFileSync('src/index.html','utf8');
const css=html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)[1];
const body=html.match(/<body[^>]*>([\s\S]*?)<script[^>]*>/i)[1];
const script=html.match(/<script[^>]*>([\s\S]*?)<\/script>/i)[1];
const names=[...script.matchAll(/function\s+(\w+)\s*\(/g)].map(m=>m[1]);
const js=`document.title='成绩分析看板 · 通用版';const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.body.innerHTML=${JSON.stringify(body)};\n${script}\nObject.assign(window,{${names.join(',')}});\n`;
rmSync('dist',{recursive:true,force:true});mkdirSync('dist/assets',{recursive:true});writeFileSync('dist/assets/app.js',js);cpSync('public/icon.png','dist/icon.png');
const source=JSON.parse(readFileSync('source.json'));console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
