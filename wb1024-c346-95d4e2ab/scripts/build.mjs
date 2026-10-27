import {readFile,mkdir,rm,writeFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2];
if(!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit||'')) throw new Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (!source.git_instance_id || source.git_instance_id.startsWith('__TIANA_'))) throw new Error('请填入 Git 实例 ID');
let [body,css,script]=await Promise.all(['body.html','styles.css','app.js'].map(f=>readFile('client/'+f,'utf8')));
body=body.replaceAll('onclick="','data-action="');
script=script.replaceAll('onclick="','data-action="');
const out=`document.title='小满 · 喂养记录';\nconst style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);\ndocument.getElementById('app').innerHTML=${JSON.stringify(body)};\n${script}
document.addEventListener('click', e=>{const a=e.target.closest('[data-action]')?.dataset.action; if(!a)return; const calls={'openButtonForm()':()=>openButtonForm(),"editProfile('name')":()=>editProfile(), 'exportData()':()=>exportData(),'loadDemo()':()=>loadDemo(),'clearAll()':()=>clearAll(),"switchTab('home')":()=>switchTab('home'),"switchTab('stats')":()=>switchTab('stats'),"switchTab('me')":()=>switchTab('me'),'closeSheet()':()=>closeSheet(),'saveSheet()':()=>saveSheet(),'stepAmt(-10)':()=>stepAmt(-10),'stepAmt(10)':()=>stepAmt(10)}; calls[a]?.();});`;
await rm('dist',{recursive:true,force:true});await mkdir('dist/assets',{recursive:true});await writeFile('dist/assets/app.js',out);await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
