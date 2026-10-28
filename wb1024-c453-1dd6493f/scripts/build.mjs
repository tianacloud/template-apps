import {readFile, mkdir, writeFile, copyFile, rm} from 'node:fs/promises';
const source=JSON.parse(await readFile('source.json','utf8'));
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const body=await readFile('src/body.html','utf8');
await writeFile('dist/assets/app.js',`document.getElementById("app").innerHTML=${JSON.stringify(body)};\nconst l=document.createElement("link");l.rel="stylesheet";l.href=new URL("style.css",import.meta.url);document.head.append(l);\nconst s=document.createElement("script");s.src=new URL("engine.js",import.meta.url);document.body.append(s);`);
await copyFile('src/style.css','dist/assets/style.css'); await copyFile('src/engine.js','dist/assets/engine.js'); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
