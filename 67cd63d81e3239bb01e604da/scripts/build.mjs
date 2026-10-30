import {build} from 'esbuild';
import {readFile,writeFile,mkdir,rm,cp} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8')); const body=await readFile('src/body.html','utf8'); const css=await readFile('src/style.css','utf8'); const result=await build({entryPoints:['src/app.js'],bundle:true,write:false,format:'iife',platform:'browser'}); const js=result.outputFiles[0].text;
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`document.getElementById("app").innerHTML=${JSON.stringify(body)}; const style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);\n${js}`); await cp('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
