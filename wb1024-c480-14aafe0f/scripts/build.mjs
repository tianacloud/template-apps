import {readFile, mkdir, writeFile, copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
const html=await readFile('app.html','utf8'); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`const frame=document.createElement('iframe');frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0';frame.srcdoc=${JSON.stringify(html)};document.body.appendChild(frame);`);
await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
