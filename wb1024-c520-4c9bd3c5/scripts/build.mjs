import {readFile,mkdir,rm,writeFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[a-f0-9]{40}$/.test(commit||'')) throw Error('需要完整提交');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && source.git_instance_id.startsWith('__TIANA_')) throw Error('需要 Git ID');
const html=await readFile('client/index.html','utf8');
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1] + '\nbody{display:block;padding:0} #app{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px}'; const body=html.match(/<body>([\s\S]*?)<script>/)[1]; const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`document.title="2048 · 合并数字挑战";const style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.getElementById("app").innerHTML=${JSON.stringify(body)};\n`+js);
await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
