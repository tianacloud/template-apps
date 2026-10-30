import {mkdir,readFile,copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('full commit required');
const html=await readFile('index.html','utf8'); const css=html.match(/<style>([\s\S]*?)<\/style>/)[1]; const body=html.match(/<body>([\s\S]*?)<script>/)[1]; const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
await mkdir('dist/assets',{recursive:true});
await build({stdin:{contents:`import './db.js';\nconst style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);document.getElementById('app').innerHTML=${JSON.stringify(body)};\n${scripts}`,resolveDir:process.cwd(),sourcefile:'entry.js'},bundle:true,format:'iife',outfile:'dist/assets/app.js'});
await copyFile('public/icon.png','dist/icon.png'); const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
