import {mkdir,copyFile,readFile,writeFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const css=await readFile('src/style.css','utf8'); const js=await readFile('src/app.js','utf8');
await writeFile('dist/assets/app.js',`const s=document.createElement("style");s.textContent=${JSON.stringify(css)};document.head.append(s);\n${js}`);
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',...source}));
