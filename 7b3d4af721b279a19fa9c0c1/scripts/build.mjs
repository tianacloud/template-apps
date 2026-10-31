import {mkdir,copyFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2];
if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/app.js'],outfile:'dist/assets/app.js',bundle:true,format:'iife',platform:'browser'}); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id,source_commit:commit}));
