import {readFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {build} from 'esbuild';
const body=await readFile('src/body.html','utf8'); const css=await readFile('src/style.css','utf8'); const audio=await readFile('src/audio.js','utf8'); const app=await readFile('src/app.js','utf8');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const entry=`import {connectStore} from './src/cloud.js';\nexport async function mount(root, context) {\nroot.textContent='正在读取数据…';\ntry { const store=await connectStore(); const cloudInitial=store.initial, cloudSave=store.save, cloudFiles=context.files;\n document.title='番茄专注 · 一小时只做一件事'; document.head.insertAdjacentHTML('beforeend',${JSON.stringify('<style>'+css+'</style>')}); root.innerHTML=${JSON.stringify(body)};\n${audio}\n${app}\n} catch(e) { root.textContent='无法读取数据，请检查登录和网络后重新打开。'; console.error(e); }\n}`;
await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'entry.js'},bundle:true,format:'esm',outfile:'dist/assets/app.js'}); await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
