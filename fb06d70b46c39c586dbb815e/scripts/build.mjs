import {build} from 'esbuild';
import {readFile,mkdir,rm,writeFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[a-f0-9]{40,64}$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (source.git_instance_id.startsWith('__TIANA_') || source.database_instance_id.startsWith('__TIANA_'))) throw Error('请填写 Git 实例 ID');
const h=await readFile('client/index.html','utf8'); const css=h.match(/<style>([\s\S]*?)<\/style>/)[1] + '\nbody{display:block;min-width:0} #app{width:100%;min-height:100vh;display:flex;align-items:center;justify-content:center}'; const body=h.match(/<body>([\s\S]*?)<script>/)[1]; const js=h.match(/<script>([\s\S]*?)<\/script>/)[1];
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/entry.js',`import {createTianaFetch} from '@tianacloud/serverless';\ndocument.title='2048 · AI自动玩';const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.getElementById('app').innerHTML=${JSON.stringify(body)};\n${js}`); await build({entryPoints:['dist/assets/entry.js'],bundle:true,format:'iife',outfile:'dist/assets/app.js'}); await rm('dist/assets/entry.js'); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
