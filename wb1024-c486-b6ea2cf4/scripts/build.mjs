import {readFile, mkdir, cp, rm} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (!source.git_instance_id || source.git_instance_id.startsWith('__TIANA_'))) throw Error('需要 Git 实例');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true}); await cp('src/main.js','dist/assets/app.js'); for(let i=0;i<3;i++) await cp(`src/plan${i}.js`,`dist/assets/plan${i}.js`); await cp('public/icon.png','dist/icon.png'); for(const f of ['offline.html','manifest.webmanifest','sw.js']) await cp('public/'+f,'dist/'+f);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,source_commit:commit}));
