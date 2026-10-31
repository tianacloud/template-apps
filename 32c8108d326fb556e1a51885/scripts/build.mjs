import {readFile, mkdir, rm, writeFile, copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
const body=await readFile('body.html','utf8'), css=await readFile('assets/css/styles.css','utf8');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({stdin:{contents:`document.body.id="top"; document.getElementById("app").innerHTML=${JSON.stringify(body)}; const style=document.createElement("style"); style.textContent=${JSON.stringify(css)}; document.head.appendChild(style); await import("./assets/js/app.js");`,resolveDir:process.cwd(),sourcefile:'entry.js'},outfile:'dist/assets/app.js',bundle:true,format:'esm'});
await copyFile('icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
