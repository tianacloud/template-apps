import {rm,mkdir,cp,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
const source=JSON.parse(await readFile('source.json','utf8'));
await rm('dist',{recursive:true,force:true});
await mkdir('dist/assets',{recursive:true});
await cp('public','dist/assets',{recursive:true});
await build({entryPoints:['public/entry.js'],bundle:true,format:'esm',external:['./app.js'],outfile:'dist/assets/entry.js'});
await cp('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/entry.js',...source}));
