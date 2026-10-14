import {build} from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
const commit=process.argv[2];
if(!/^[a-f0-9]{40}$/.test(commit||''))throw Error('Pass the verified full source commit: npm run build -- COMMIT');
await fs.rm('dist',{recursive:true,force:true});await fs.mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'eof'});
await fs.copyFile('public/icon.png','dist/icon.png');
await fs.copyFile('src/style.css','dist/assets/style.css');await fs.cp('assets','dist/assets/game',{recursive:true});await fs.cp('licenses','dist/licenses',{recursive:true});await fs.copyFile('ATTRIBUTION.md','dist/ATTRIBUTION.md');
async function size(dir){let n=0;for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);n+=e.isDirectory()?await size(p):(await fs.stat(p)).size;}return n;}
const bytes=await size('dist');if(bytes>16*1024*1024)throw Error('Web resources exceed 16 MiB');
console.log('Web resources: '+bytes+' bytes');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(await fs.readFile('source.json','utf8')),source_commit:commit}));
