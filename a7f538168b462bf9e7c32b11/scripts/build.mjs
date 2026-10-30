import {readFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2];
if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(!process.env.TIANA_TEMPLATE_BUILD && Object.values(source).some(v=>v.startsWith('__TIANA_'))) throw Error('请先填写 Git 和 SQLite 实例');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.js'],bundle:true,format:'iife',platform:'browser',outfile:'dist/assets/app.js'}); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
