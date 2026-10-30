import {build} from 'esbuild';
import {mkdir,copyFile,readFile} from 'node:fs/promises';
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/app.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',target:'es2022'});
await copyFile('public/icon.png','dist/icon.png');
await copyFile('THIRD_PARTY_NOTICES','dist/THIRD_PARTY_NOTICES.txt');
await copyFile('LICENSE-serverless.txt','dist/LICENSE-serverless.txt');
const s=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...s}));
