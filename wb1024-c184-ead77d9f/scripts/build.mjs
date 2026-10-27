import {readFile,mkdir,rm,writeFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2];
if(!/^[a-f0-9]{40}$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (!/^[A-Za-z0-9_-]{1,128}$/.test(source.git_instance_id||'') || source.git_instance_id.startsWith('__TIANA_'))) throw Error('请填写 Git 实例 ID');
const html=await readFile('client/index.html','utf8');
const css=html.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];
const body=html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g,'');
const script=html.match(/<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/)[1];
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`document.title='溪山清远';\nconst style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);\ndocument.getElementById('app').innerHTML=${JSON.stringify(body)};\n${script}
const neutralize=()=>{document.title='溪山清远';const e=document.querySelector('.eyebrow');if(e)e.innerHTML='<span>INK</span> / THREE WORLDS'};neutralize();setTimeout(neutralize,800);`);
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
