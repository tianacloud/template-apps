import { build } from 'vite';
import { readFile } from 'node:fs/promises';
const commit=process.argv[2];
if(!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit||'')) throw new Error('完整源码提交号必填');
const source=JSON.parse(await readFile('source.json','utf8'));
await build();
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',database_instance_id:source.database_instance_id,git_instance_id:source.git_instance_id,source_commit:commit}));
