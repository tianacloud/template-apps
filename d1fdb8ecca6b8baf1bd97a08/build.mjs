import {mkdir,copyFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
const source=JSON.parse(await readFile('source.json','utf8'));
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['app.js'],bundle:true,format:'iife',platform:'browser',outfile:'dist/assets/app.js'});
await copyFile('icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
