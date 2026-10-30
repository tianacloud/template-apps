import {readFile,mkdir,writeFile,copyFile,rm} from 'node:fs/promises';
import {build} from 'esbuild';
const html=await readFile('app.html','utf8');
const style=html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1];
const body=html.match(/<body[^>]*>([\s\S]*?)<script>/i)?.[1];
let script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
if(!style||!body||!script) throw Error('Invalid application HTML');
script=script.replaceAll('window.LESSON_LIB_V','LESSON_LIB_V').replaceAll('window.LESSON_LIB','LESSON_LIB');
script=script.replace('(function init(){','async function init(){').replace(/\}\)\(\);\s*$/, '}\nstorageReady().then(init).catch(()=>{});');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const banner=`document.title="课后反馈生成器";const style=document.createElement("style");style.textContent=${JSON.stringify(style)};document.head.appendChild(style);document.body.innerHTML=${JSON.stringify(body)};`;
await writeFile('scripts/.generated-entry.mjs',`import {localStorage, storageReady} from './storage.mjs';\n${banner}\n${script}`);
try {await build({entryPoints:['scripts/.generated-entry.mjs'],bundle:true,format:'iife',target:'es2022',outfile:'dist/assets/app.js'});} finally {await rm('scripts/.generated-entry.mjs',{force:true});}
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',database_instance_id:source.database_instance_id,git_instance_id:source.git_instance_id}));
