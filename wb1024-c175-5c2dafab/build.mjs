import {readFile, mkdir, writeFile, copyFile, rm} from 'node:fs/promises';
const out = 'dist';
await rm(out,{recursive:true,force:true}); await mkdir(`${out}/assets`,{recursive:true});
const body = await readFile('src/body.html','utf8');
const js = await readFile('src/app.js','utf8');
await writeFile(`${out}/assets/app.js`, `document.body.innerHTML=${JSON.stringify(body)};\nconst sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('./style.css',import.meta.url);document.head.appendChild(sheet);document.title='FORMA — 多格式 3D 查看器';\n${js}`);
await copyFile('src/style.css',`${out}/assets/style.css`); await copyFile('public/icon.png',`${out}/icon.png`);
console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(await readFile('source.json','utf8')).git_instance_id}));
