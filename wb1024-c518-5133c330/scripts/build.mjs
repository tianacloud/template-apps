import {mkdir,copyFile,readFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('完整提交号必填');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && source.git_instance_id.startsWith('__TIANA_')) throw Error('请配置 Git 实例');
await mkdir('dist/assets',{recursive:true}); await copyFile('src/app.js','dist/assets/app.js'); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
