import {readFile, mkdir, writeFile, copyFile, rm} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
const body=await readFile('src/body.html','utf8'); const css=await readFile('src/styles.css','utf8');
const image=await readFile('src/imgstore.js','utf8'); const app=await readFile('src/app.js','utf8');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`document.title='待办 · Todo'; document.body.dataset.view='tasks'; document.getElementById('app').innerHTML=${JSON.stringify(body)}; const style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.appendChild(style);\n${image}\n${app}`);
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,source_commit:commit}));
