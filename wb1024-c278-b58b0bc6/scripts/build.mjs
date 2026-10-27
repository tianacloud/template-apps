import {mkdir, readFile, writeFile, cp, rm} from 'node:fs/promises';
const commit=process.argv[2];
if (!/^[0-9a-f]{40,64}$/.test(commit||'')) throw new Error('需要完整源码提交号');
const js=await readFile('src/app.js','utf8');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js', `document.title='儿童习惯工作台';\ndocument.body.innerHTML='<div id="app"></div>';\nconst link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./app.css',import.meta.url).href; document.head.appendChild(link);\n${js}`);
await cp('src/styles.css','dist/assets/app.css'); await cp('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
