import {readFile, mkdir, writeFile, cp, copyFile} from 'node:fs/promises';
const html=await readFile('src/view.html','utf8'), css=await readFile('src/style.css','utf8');
await mkdir('dist/assets',{recursive:true});
await cp('src/core','dist/assets/src/core',{recursive:true});
await copyFile('src/worker.js','dist/assets/src/worker.js');
await copyFile('src/app.js','dist/assets/main.js');
await copyFile('public/icon.png','dist/icon.png');
await writeFile('dist/assets/app.js',`document.getElementById('app').innerHTML=${JSON.stringify(html)}; const style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.appendChild(style); await import('./main.js');`);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(await readFile('source.json','utf8')).git_instance_id}));
