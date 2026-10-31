import {readFile, mkdir, cp, rm} from 'node:fs/promises';
import {build} from 'esbuild';
const root = new URL('./',import.meta.url), out = new URL('./dist/',root);
await rm(out,{recursive:true,force:true}); await mkdir(new URL('assets/',out),{recursive:true});
await build({entryPoints:[new URL('./entry.js',root).pathname],bundle:true,format:'esm',outfile:new URL('./dist/assets/app.js',root).pathname,loader:{'.html':'text','.css':'text'}});
await cp(new URL('public/icon.png',root),new URL('icon.png',out));
const params=JSON.parse(await readFile(new URL('source.json',root),'utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:params.git_instance_id,database_instance_id:params.database_instance_id}));
