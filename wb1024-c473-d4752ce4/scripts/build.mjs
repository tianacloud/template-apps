import {readFile, mkdir, rm, writeFile, copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (!/^[A-Za-z0-9_-]{1,128}$/.test(source.git_instance_id||'') || source.git_instance_id.startsWith('__TIANA_'))) throw Error('请填写 Git 实例 ID');
const [css,body,js]=await Promise.all(['client/styles.css','client/body.html','client/app.js'].map(x=>readFile(x,'utf8')));
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js', `document.title="职称题库";const style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.getElementById("app").innerHTML=${JSON.stringify(body)};\n`+js);
await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
