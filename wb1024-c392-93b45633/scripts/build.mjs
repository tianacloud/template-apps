import {readFile,mkdir,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (!source.git_instance_id || source.git_instance_id.startsWith('__TIANA_'))) throw Error('需要 Git 实例 ID');
await mkdir('dist/assets',{recursive:true}); for(const f of ['app.js','logic.js']) await copyFile(f,'dist/assets/'+f); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
