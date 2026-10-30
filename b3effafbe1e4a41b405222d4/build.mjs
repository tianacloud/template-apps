import {readFileSync,writeFileSync,mkdirSync,cpSync,rmSync} from 'node:fs';
import {build} from 'esbuild';
rmSync('dist',{recursive:true,force:true}); mkdirSync('dist/assets',{recursive:true});
const body=readFileSync('src/body.html','utf8');
const arrow="url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M2.5 4.5L6 8l3.5-3.5' fill='none' stroke='%238b90a5' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>\")";
const script=`import {storage,loadStorage} from './storage.js';
document.documentElement.style.setProperty('--namesmith-select-arrow', ${JSON.stringify(arrow)});
const l=document.createElement('link');l.rel='stylesheet';l.href=new URL('styles.css',import.meta.url).href;document.head.appendChild(l);
document.getElementById('app').innerHTML=${JSON.stringify('<div id="storage-error" role="alert"></div>'+body)};
try { await loadStorage(); } catch(e) { document.getElementById('storage-error').textContent='无法读取云端数据，请检查连接并重新打开应用。'; throw e; }
`+readFileSync('src/dict.js','utf8')+'\n'+readFileSync('src/app.js','utf8');
await build({stdin:{contents:script,resolveDir:process.cwd()+'/src',sourcefile:'entry.js'},bundle:true,format:'esm',target:'es2022',outfile:'dist/assets/app.js'});
cpSync('src/styles.css','dist/assets/styles.css'); cpSync('icon.png','dist/icon.png');
const source=JSON.parse(readFileSync('source.json')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id}));
