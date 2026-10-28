import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[a-f0-9]{40}$/.test(commit||'')) throw Error('full commit required');
const html=await readFile('src/index.html','utf8'); const body=html.match(/<body>([\s\S]*?)<script src=/)[1];
const css=await readFile('src/app.css','utf8'); let js=''; for(const f of ['calc','store','model','views','app']) js+='\n'+await readFile(`src/${f}.js`,'utf8');
await mkdir('dist',{recursive:true}); await writeFile('dist/app.js',`document.title="被动收入小账本";const s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.append(s);document.body.innerHTML=${JSON.stringify(body)};\n${js}`); await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js',...JSON.parse(await readFile('source.json','utf8'))}));
