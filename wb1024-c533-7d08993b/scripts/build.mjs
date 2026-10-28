import {build} from 'vite';
import {readFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2];
if(!/^[a-f0-9]{40}$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
await build();
await copyFile('src/logic.js','dist/assets/logic.js');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
