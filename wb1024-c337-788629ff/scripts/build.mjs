import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (!source.git_instance_id || source.git_instance_id.startsWith('__TIANA_'))) throw new Error('请配置 Git 实例 ID');
await mkdir('dist/assets',{recursive:true});
await copyFile('src/app.js','dist/assets/app.js');
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
