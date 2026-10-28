import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||''))throw Error('Pass a full source commit');
const css=await readFile('style.css','utf8'), shell=await readFile('shell.html','utf8'), app=await readFile('app.js','utf8');
await mkdir('dist',{recursive:true}); await writeFile('dist/app.js',`const style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.append(style); document.getElementById('app').innerHTML=${JSON.stringify(shell)};\n${app}`); await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js',...source,source_commit:commit}));
