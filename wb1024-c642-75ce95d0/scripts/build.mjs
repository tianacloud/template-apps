import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
const html=await readFile('app.html','utf8');
const js=html.match(/<script type="module" crossorigin>([\s\S]*?)<\/script>/)?.[1];
const css=html.match(/<style rel="stylesheet" crossorigin>([\s\S]*?)<\/style>/)?.[1];
if(!js||!css) throw Error('Missing app script or style');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`document.title="Indie Hacker 里程碑";const style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);\n${js}`);
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
