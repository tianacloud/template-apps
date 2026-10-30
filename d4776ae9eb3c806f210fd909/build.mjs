import {mkdir,copyFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/app.js'],bundle:true,format:'esm',platform:'browser',target:'es2020',outfile:'dist/assets/app.js',banner:{js:`const style=document.createElement('style');style.textContent=${JSON.stringify(await readFile('src/style.css','utf8'))};document.head.appendChild(style);`}});
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id}));
