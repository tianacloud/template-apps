import {build} from 'esbuild';
import {mkdir,copyFile,rm,readFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.js'],bundle:true,format:'esm',outfile:'dist/assets/app.js',loader:{'.html':'text'}});
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
