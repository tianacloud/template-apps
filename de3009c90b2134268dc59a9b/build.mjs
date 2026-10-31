import {mkdir,cp,readFile,rm} from 'node:fs/promises';
import {build} from 'esbuild';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true}); await cp('src','dist/assets',{recursive:true}); await cp('public/icon.png','dist/icon.png');
await build({entryPoints:['src/entry.js'],bundle:true,format:'esm',platform:'browser',target:'es2020',outfile:'dist/assets/app.js'});
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
