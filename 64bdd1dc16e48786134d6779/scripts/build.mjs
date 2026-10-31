import { readFile, mkdir, copyFile, rm, writeFile } from 'node:fs/promises';
const commit=process.argv[2]; if(!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD !== '1' && (!source.git_instance_id || source.git_instance_id.startsWith('__TIANA_'))) throw Error('请填写 Git 实例 ID');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
let js=await readFile('src/app.js','utf8'); let css=await readFile('src/style.css','utf8');
await writeFile('dist/assets/app.js', `const style=document.createElement("style"); style.textContent=${JSON.stringify(css)}; document.head.append(style);\n`+js);
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
