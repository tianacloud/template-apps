import {mkdir,copyFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
const source=JSON.parse(await readFile('source.json','utf8'));
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/app.js'],bundle:true,format:'esm',outfile:'dist/assets/app.js',platform:'browser'});
await copyFile('src/app.css','dist/assets/app.css');
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id}));
