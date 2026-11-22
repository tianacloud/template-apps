import {build} from 'vite';
import {readFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2];
if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||'')) throw Error('请提供完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
await build();
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',database_instance_id:source.database_instance_id,git_instance_id:source.git_instance_id,source_commit:commit}));
