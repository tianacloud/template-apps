import {mkdir,copyFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/app.js'],bundle:true,format:'esm',outfile:'dist/assets/app.js'});
await copyFile('src/style.css','dist/assets/style.css');
await copyFile('public/icon.png','dist/icon.png');
const p=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:p.git_instance_id,database_instance_id:p.database_instance_id}));
