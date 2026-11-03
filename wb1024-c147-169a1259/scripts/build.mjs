import {build} from 'vite';
import {readFile,stat} from 'node:fs/promises';
const commit=process.argv[2];
if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||''))throw Error('请传入已核验的完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(!process.env.TIANA_TEMPLATE_BUILD && Object.values(source).some(v=>v.startsWith('__TIANA_')))throw Error('请先填写本次应用实例绑定');
await build();await stat('dist/assets/app.js');await stat('dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
