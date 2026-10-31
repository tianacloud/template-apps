import {build} from 'esbuild';
import {readFile, mkdir, writeFile, copyFile, rm} from 'node:fs/promises';
const commit=process.argv[2];
if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && [source.git_instance_id,source.database_instance_id].some(x=>!x||x.startsWith('__TIANA_'))) throw Error('请配置 Git 和 SQLite 实例');
const html=await readFile('index.html','utf8');
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const markup=html.replace(/<script>[\s\S]*?<\/script>/g,'');
let body=markup.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
body=body.replace(/\bon(click|change|input)=/g,'data-handler-$1=');
scripts[0]=scripts[0].replace(/\bon(click|change|input)=/g,'data-handler-$1=');
// The module starts after DOMContentLoaded; register the same input listeners directly.
scripts[0]=scripts[0].replace(/document\.addEventListener\('DOMContentLoaded',function\(\)\{\s*var el=\$\(id\); if\(el\) el\.addEventListener\('input',saveCfg\);\s*\}\);/, "var el=$(id); if(el) el.addEventListener('input',saveCfg);");
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.css',css);
await writeFile('dist/assets/logic.js',scripts[0]);
await build({entryPoints:['scripts/runtime.js'],bundle:true,format:'esm',platform:'browser',outfile:'dist/assets/runtime.js'});
const entry=`import {prepare} from './runtime.js'; export async function mount(root,context){const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./app.css',import.meta.url);document.head.append(style);root.innerHTML=${JSON.stringify(body)};function load(name){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(name,import.meta.url);s.onload=resolve;s.onerror=reject;document.body.append(s);});}try{await prepare(context);await load('./logic.js');}catch(error){root.innerHTML='<div style="padding:2em;color:#a22">应用未能连接数据库或题库，请检查登录与网络后重新打开。</div>';throw error;}
for(const type of ['click','change','input']) document.addEventListener(type,event=>{const el=event.target.closest('[data-handler-'+type+']');if(!el)return;const action=el.getAttribute('data-handler-'+type);if(action==="document.getElementById('txtInput').click()"){document.getElementById('txtInput').click();return;}const match=action.match(/^([a-zA-Z]+)\\((.*)\\)$/);if(!match)return;const name=match[1],raw=match[2];const allow=['importTxt','applyWeights','closePreview','confirmPaper','dl','doDraw','goStep','preview','printPreview','reloadBank','reroll','resetWeights','onAlloc','onRule'];if(!allow.includes(name)||typeof window[name]!=='function')return;const args=raw?raw.split(',').map(v=>{v=v.trim();if(v==='this.files')return el.files;if(v==='this.value')return el.value;if(/^'[^']*'$/.test(v))return v.slice(1,-1);if(/^\\d+$/.test(v))return Number(v);return undefined;}):[];window[name](...args);}); return ()=>{style.remove();root.replaceChildren();};}`;
await writeFile('dist/assets/app.js',entry); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id,source_commit:commit}));
