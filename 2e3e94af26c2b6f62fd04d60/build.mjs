import {readFile, mkdir, rm, copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/entry.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',loader:{'.html':'text','.css':'text'}});
await copyFile('icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(await readFile('source.json','utf8'))}));
