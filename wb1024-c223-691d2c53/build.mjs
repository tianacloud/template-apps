import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist/assets',{recursive:true});
await cp('public','dist/assets',{recursive:true});
await cp('public/icon.png','dist/icon.png');
const css=await readFile('src/style.css','utf8'), body=await readFile('src/body.html','utf8'), js=await readFile('src/app.js','utf8');
await writeFile('dist/assets/app.js',`const ASSET_BASE=new URL('./',import.meta.url).href;const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.body.innerHTML=${JSON.stringify(body)};\n${js}`);
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
