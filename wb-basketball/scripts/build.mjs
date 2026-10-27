import {readFile, mkdir, rm, writeFile, copyFile} from 'node:fs/promises';
const commit=process.argv[2];
if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||'')) throw new Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (!/^[A-Za-z0-9_-]{1,128}$/.test(source.git_instance_id||'') || source.git_instance_id.startsWith('__TIANA_'))) throw new Error('请填写 Git 实例 ID');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const setup=`document.title='篮场纪事';const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./styles.css',import.meta.url).href;document.head.appendChild(link);const root=document.createElement('div');root.id='root';document.getElementById('app').appendChild(root);\n`;
await writeFile('dist/assets/app.js',setup+await readFile('client/game.js','utf8')); await copyFile('client/styles.css','dist/assets/styles.css'); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
