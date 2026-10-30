import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && Object.values(source).some(v => !v || v.startsWith('__TIANA_'))) throw new Error('请配置 Git 和 SQLite 实例 ID');
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/app.js'],outfile:'dist/assets/app.js',bundle:true,format:'iife',platform:'browser'});
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
