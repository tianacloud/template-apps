import { build } from 'vite';
import { readFile } from 'node:fs/promises';
const commit=process.argv[2];
if(!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit||'')) throw new Error('请传入完整源码提交号。');
const source=JSON.parse(await readFile('source.json','utf8'));
await build();
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
