import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('full commit required');
const html=await readFile('index.html','utf8'); const css=html.match(/<style>([\s\S]*?)<\/style>/)[1]; const body=html.match(/<body>([\s\S]*?)<script type="module" src="app.js"><\/script>/)[1];
await mkdir('dist',{recursive:true}); for(const f of ['engine.js','scene.js']) await copyFile(f,'dist/'+f);
const app=await readFile('app.js','utf8'); await writeFile('dist/app.js',`const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);document.getElementById('app').innerHTML=${JSON.stringify(body)};\n${app}`); await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js',...JSON.parse(await readFile('source.json','utf8'))}));
