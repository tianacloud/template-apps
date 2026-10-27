import {build} from 'vite';
import {readFile,stat} from 'node:fs/promises';
const commit=process.argv[2];
if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
await build(); await stat('dist/assets/app.js');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',database_instance_id:source.database_instance_id,git_instance_id:source.git_instance_id,source_commit:commit}));
