import { mkdir, copyFile, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
const commit=process.argv[2]; if(!/^[0-9a-f]{40,64}$/.test(commit||'')) throw Error('完整提交号必填');
const source=JSON.parse(await readFile('source.json','utf8'));
await mkdir('dist/assets',{recursive:true}); await build({entryPoints:['src/app.js'],bundle:true,format:'esm',outfile:'dist/assets/app.js'}); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
