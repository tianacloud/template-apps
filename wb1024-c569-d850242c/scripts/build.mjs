import {readFile, mkdir, writeFile, copyFile, rm} from 'node:fs/promises';
const commit=process.argv[2];
if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (!source.git_instance_id || source.git_instance_id.startsWith('__TIANA_'))) throw Error('请配置 Git 实例');
const html=await readFile('index.html','utf8');
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
let body=html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1].replace(/<script>[\s\S]*?<\/script>/g,'');
// The module starts after DOMContentLoaded; register the same input listeners directly.
scripts[1]=scripts[1].replace("document.addEventListener('DOMContentLoaded',function(){\n    var el=$(id); if(el) el.addEventListener('input',saveCfg);\n  });", "var el=$(id); if(el) el.addEventListener('input',saveCfg);");
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.css',css);
await writeFile('dist/assets/bank.js',scripts[0]); await writeFile('dist/assets/logic.js',scripts[1]);
const entry=`const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./app.css',import.meta.url);document.head.append(style);document.body.innerHTML=${JSON.stringify(body)};function load(name){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(name,import.meta.url);s.onload=resolve;s.onerror=reject;document.body.append(s);});}await load('./bank.js');await load('./logic.js');`;
await writeFile('dist/assets/app.js',entry); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,source_commit:commit}));
