import {build} from 'esbuild';
import {mkdir,cp,readFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/app.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',minify:true});
await cp('public/site','dist/site',{recursive:true}); await cp('public/icon.png','dist/icon.png');
const s=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...s}));
