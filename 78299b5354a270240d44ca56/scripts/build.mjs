import {build} from 'esbuild';
import {readFileSync,copyFileSync} from 'node:fs';
await build({entryPoints:['src/main.js'],bundle:true,format:'esm',outfile:'dist/assets/app.js',loader:{'.html':'text','.css':'text'},target:'es2022'});
copyFileSync('public/icon.png','dist/icon.png');
const source=JSON.parse(readFileSync('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id}));
