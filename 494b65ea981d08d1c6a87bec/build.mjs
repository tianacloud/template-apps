import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2]; if(!/^[a-f0-9]{40}$/.test(commit||'')) throw Error('full commit required');
const html=await readFile('src/index.html','utf8'); const body=html.match(/<body>([\s\S]*?)<script src=/)[1];
const css=await readFile('src/app.css','utf8'); let js=''; for(const f of ['calc','store','model','views','app']) js+='\n'+await readFile(`src/${f}.js`,'utf8');
await mkdir('dist',{recursive:true});
const entry=`import {openStorage} from './src/cloud.js';\ndocument.title="被动收入小账本";const s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.append(s);document.body.innerHTML=${JSON.stringify(body)};\n(async()=>{ try { window.PILStorage = await openStorage();\n${js}\n} catch(e) { document.body.textContent='无法打开账本：'+e.message; } })();`;
await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'entry.js'},bundle:true,format:'iife',platform:'browser',target:'es2020',outfile:'dist/app.js'});
await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js',...JSON.parse(await readFile('source.json','utf8'))}));
