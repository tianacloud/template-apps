import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {build} from 'esbuild';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const css=await readFile('src/style.css','utf8'), body=await readFile('src/body.html','utf8'), app=await readFile('src/app.js','utf8');
const prefix=`import {createTianaFetch} from '@tianacloud/serverless';
export async function mount(root,{files}) {
root.innerHTML=${JSON.stringify(body)}; const style=document.createElement('style'); style.textContent=${JSON.stringify(css)};document.head.append(style);
`;
const db=await readFile('src/cloud.js','utf8');
await writeFile('dist/entry.js',prefix+db+'\n'+app+'\n}');
await build({entryPoints:['dist/entry.js'],bundle:true,format:'esm',outfile:'dist/assets/app.js'}); await rm('dist/entry.js'); await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
