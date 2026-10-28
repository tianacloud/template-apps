import {readFile, writeFile, mkdir, cp, rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const body=await readFile('src/body.html','utf8');
const css=await readFile('src/style.css','utf8');
let js=`document.title='鼠标小达人 · 小学信息科技课堂'; document.getElementById('app').innerHTML=${JSON.stringify(body)};\nconst style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.append(style);\n`;
for(const f of ['core','learn','track','practice','games','challenge']) js+=await readFile(`src/${f}.js`,'utf8')+'\n';
js+=`\ndocument.dispatchEvent(new Event('DOMContentLoaded'));\n`;
await writeFile('dist/assets/app.js',js); await cp('public/img','dist/img',{recursive:true}); await cp('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(await readFile('source.json')).git_instance_id}));
