import {mkdir,copyFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['app.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',platform:'browser'});
await copyFile('game.js','dist/assets/game.js');
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
