import {mkdir,readFile,copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2]; if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||''))throw Error('Pass a full source commit');
const css=await readFile('style.css','utf8'), shell=await readFile('shell.html','utf8'), app=await readFile('app.js','utf8');
await mkdir('dist',{recursive:true});
await build({stdin:{contents:`import { createTianaFetch } from '@tianacloud/serverless';\nexport async function mount(root, {files}) {\nconst style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.append(style); root.innerHTML=${JSON.stringify(shell)};\n${app}\n}`,resolveDir:process.cwd(),sourcefile:'app.js',loader:'js'},bundle:true,format:'esm',outfile:'dist/app.js'});
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js',...source,source_commit:commit}));
