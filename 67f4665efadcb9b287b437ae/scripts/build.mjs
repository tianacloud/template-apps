import {build} from 'vite';
import {readFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[a-f0-9]{40,64}$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && Object.values(source).some(v=>v.startsWith('__TIANA_'))) throw Error('需要实例 ID');
await build();
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
