import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';
await mkdir('dist/assets',{recursive:true});
const css=await readFile('src/style.css','utf8');
const bundle=await build({entryPoints:['src/app.js'],bundle:true,write:false,format:'iife',platform:'browser'});
await writeFile('dist/assets/app.js',`const s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.appendChild(s);\n${bundle.outputFiles[0].text}`);
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id}));
