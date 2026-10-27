import { build } from 'esbuild';
import { cp, mkdir, readFile, rm } from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',minify:true});
await cp('src/style.css','dist/assets/style.css'); await cp('src/game.js','dist/assets/game.js'); await cp('public','dist',{recursive:true});
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
