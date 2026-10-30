import {readFile,mkdir,copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && [source.git_instance_id,source.database_instance_id].some(v=>!v || v.startsWith('__TIANA_'))) throw Error('需要 Git 和 SQLite 实例 ID');
await mkdir('dist/assets',{recursive:true}); await build({entryPoints:['app.js'],outfile:'dist/assets/app.js',bundle:true,format:'iife',platform:'browser'}); await copyFile('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
