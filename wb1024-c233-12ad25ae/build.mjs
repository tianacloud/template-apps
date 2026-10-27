import {readFile, writeFile, mkdir, cp, rm} from 'node:fs/promises';
const root = new URL('./', import.meta.url), out = new URL('./dist/',root);
await rm(out,{recursive:true,force:true}); await mkdir(new URL('assets/',out),{recursive:true});
await cp(new URL('public/',root),out,{recursive:true});
await writeFile(new URL('assets/app.js',out), "location.replace(new URL('../index.html', import.meta.url).href + location.hash);\n");
const params=JSON.parse(await readFile(new URL('source.json',root),'utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:params.git_instance_id}));
