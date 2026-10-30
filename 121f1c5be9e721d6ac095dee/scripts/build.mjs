import {cp, mkdir, rm, readFile, writeFile} from 'node:fs/promises';
const commit=process.argv[2];
if(!/^[a-f0-9]{40,64}$/.test(commit||'')) throw Error('需要完整源码提交');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && source.git_instance_id.startsWith('__TIANA_')) throw Error('请先绑定 Git 实例');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets/original',{recursive:true});
await cp('src','dist/assets/original',{recursive:true}); await cp('public/icon.png','dist/icon.png');
for (const page of ['index','computer','majors','regions','departments','cooccur','exclusive']) {
  const html=await readFile(`src/${page}.html`,'utf8');
  const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for (let i=0;i<inline.length;i++) await writeFile(`dist/assets/original/${page}-inline-${i}.js`,inline[i]);
}
await cp('scripts/runtime.js','dist/assets/app.js');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
