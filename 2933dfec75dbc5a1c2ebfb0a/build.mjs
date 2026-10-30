import {build} from 'esbuild';
import {mkdir,rm,copyFile,readFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/entry.js'],outfile:'dist/assets/entry.js',bundle:true,format:'esm',loader:{'.html':'text','.css':'text'}});
await copyFile('public/icon.png','dist/icon.png'); await copyFile('THREE-LICENSE.txt','dist/THREE-LICENSE.txt');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/entry.js',...JSON.parse(await readFile('source.json','utf8'))}));
