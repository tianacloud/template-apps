import { build } from 'esbuild';
import { readFile, mkdir, copyFile } from 'node:fs/promises';
const p=JSON.parse(await readFile('source.json','utf8')); await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['app.js'],bundle:true,format:'esm',outfile:'dist/assets/app.js',loader:{'.css':'css'}});
await copyFile('icon.png','dist/icon.png'); await copyFile('app.css','dist/assets/app.css');
console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',...p}));
