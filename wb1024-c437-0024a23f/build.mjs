import { build } from 'esbuild';
import { mkdir, cp, readFile } from 'node:fs/promises';
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.js'],bundle:true,format:'esm',target:'es2022',outfile:'dist/assets/app.js',loader:{'.html':'text','.css':'text'},define:{'process.env.NODE_ENV':'"production"'}});
await cp('public/legacy.js','dist/assets/legacy.js');
await cp('public/icon.png','dist/icon.png');
const params=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',...params}));
