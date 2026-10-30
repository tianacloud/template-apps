import {readFile,writeFile,mkdir,rm,cp} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8')); const body=await readFile('src/body.html','utf8'); const css=await readFile('src/style.css','utf8');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({stdin:{contents:`import './src/database.js';\ndocument.getElementById('app').innerHTML=${JSON.stringify(body)};const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);\nrequire('./src/app.js');`,resolveDir:process.cwd(),sourcefile:'entry.js'},bundle:true,format:'iife',target:'es2020',outfile:'dist/assets/app.js'});
await cp('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
