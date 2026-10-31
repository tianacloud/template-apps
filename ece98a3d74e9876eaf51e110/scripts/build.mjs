import {build} from 'esbuild';
import {readFile, mkdir, rm, writeFile, copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && [source.git_instance_id,source.database_instance_id].some(x=>!x||x.startsWith('__TIANA_'))) throw Error('请填写 Git 和 SQLite 实例 ID');
const [body,css,js]=await Promise.all(['body.html','styles.css','app.js'].map(f=>readFile('client/'+f,'utf8')));
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({stdin:{contents:`document.title="毛孩子养护台";const style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.getElementById("app").innerHTML=${JSON.stringify(body)};\n${js}`,resolveDir:process.cwd(),sourcefile:'app.js'},bundle:true,format:'esm',outfile:'dist/assets/app.js'});
await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
