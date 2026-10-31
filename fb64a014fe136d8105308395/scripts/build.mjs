import {readFile, mkdir, copyFile, rm} from 'node:fs/promises';
import {build} from 'esbuild';
const body=await readFile('src/body.html','utf8'), css=await readFile('src/style.css','utf8'), engine=await readFile('src/engine.js','utf8');
const source=JSON.parse(await readFile('source.json','utf8'));
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({stdin:{contents:`import {loadTheme,saveTheme} from './src/theme.js';\ndocument.querySelector('#app').innerHTML = ${JSON.stringify(body)};\nconst style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.appendChild(style);\n${engine}`,resolveDir:process.cwd(),sourcefile:'entry.js'},bundle:true,format:'iife',platform:'browser',outfile:'dist/assets/app.js'});
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
