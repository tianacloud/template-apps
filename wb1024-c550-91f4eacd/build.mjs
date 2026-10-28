import {readFile, mkdir, rm, cp, writeFile} from 'node:fs/promises';
const body=await readFile('src/body.html','utf8');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await cp('public/vendor','dist/assets/vendor',{recursive:true});
await cp('public/icon.png','dist/icon.png'); await cp('src/lab.js','dist/assets/lab.js'); await cp('src/style.css','dist/assets/style.css');
const loader=`document.getElementById('app').innerHTML=${JSON.stringify(body)};\nfor (const file of ['style.css','vendor/katex.min.css']) { const link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL(file,import.meta.url); document.head.appendChild(link); }\nfor (const file of ['vendor/math.min.js','vendor/plotly.min.js','vendor/katex.min.js','lab.js']) await new Promise((resolve,reject)=>{const s=document.createElement('script');s.charset='utf-8';s.src=new URL(file,import.meta.url);s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});\n`;
await writeFile('dist/assets/app.js',loader);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(await readFile('source.json','utf8')).git_instance_id}));
