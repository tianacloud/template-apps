import {readFile,writeFile,cp,mkdir,rm} from 'node:fs/promises';
const cfg=JSON.parse(await readFile('source.json','utf8'));
if(!process.env.TIANA_TEMPLATE_BUILD && cfg.git_instance_id.startsWith('__TIANA_')) throw Error('请填写 Git 实例 ID');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const css=await readFile('src/style.css','utf8'), body=await readFile('src/body.html','utf8'), data=await readFile('src/data.js','utf8'), app=await readFile('src/app.js','utf8');
await writeFile('dist/assets/app.js',`document.title='小可爱驾考刷题';const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);document.body.innerHTML=${JSON.stringify(body)};\n${data}\n${app}`);
await cp('public','dist',{recursive:true});
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...cfg}));
