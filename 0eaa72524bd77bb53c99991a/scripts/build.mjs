import {build} from 'vite';
import {readFile,stat} from 'node:fs/promises';
const commit=process.argv[2];
if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit??''))throw Error('构建需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(!process.env.TIANA_TEMPLATE_BUILD && Object.values(source).some(x=>!/^[-A-Za-z0-9_]{1,128}$/.test(x)||x.startsWith('__TIANA_'))) throw Error('请先填写已核实的资源 ID');
await build();await stat('dist/assets/app.js');await stat('dist/assets/app.css');await stat('dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
