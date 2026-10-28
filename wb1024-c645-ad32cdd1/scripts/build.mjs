import {readFile,mkdir,rm,writeFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
const html=await readFile('client/index.html','utf8'); const body=html.match(/<body>([\s\S]*?)<script src="food-db.js"><\/script>/)[1];
const css=await readFile('client/style.css','utf8'); const scripts=await Promise.all(['food-db.js','sample-photos.js','sample-data.js','app.js'].map(x=>readFile('client/'+x,'utf8')));
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js', `document.title='知食 · 每天知道自己吃了什么';const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.body.innerHTML=${JSON.stringify(body)};\n`+scripts.join('\n;\n')+'\nObject.assign(window,{Onb,App,Add,Me,Sheet,Sample});\n'+await readFile('client/events.js','utf8'));
await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
