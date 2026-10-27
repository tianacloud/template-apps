import {readFile, writeFile, mkdir, cp, rm} from 'node:fs/promises';
const root = new URL('./', import.meta.url), out = new URL('./dist/',root);
await rm(out,{recursive:true,force:true}); await mkdir(new URL('assets/',out),{recursive:true});
await cp(new URL('public/',root),out,{recursive:true});
const html=await readFile(new URL('public/index.html',root),'utf8');
const body=html.match(/<body>([\s\S]*?)<script src="data.js">/)[1];
const scripts=['data.js','app.js','bank/catalog.js','mathbank.js','bank/cn-catalog.js','chinabank.js','bank/en-catalog.js','engbank.js','modules.js','pet.js'];
let js=`const assetBase = new URL('../', import.meta.url);\ndocument.body.innerHTML = ${JSON.stringify(body)};\nconst css = document.createElement('link'); css.rel='stylesheet'; css.href=new URL('styles.css',assetBase); document.head.appendChild(css);\n`;
for(const file of scripts){let text=await readFile(new URL('public/'+file,root),'utf8'); text=text.replace(/s\.src = ('bank\/[^;]+);/g,"s.src = new URL($1, assetBase).href;"); text=text.replace('s.src = src; s.async', 's.src = new URL(src, assetBase).href; s.async'); js += '\n'+text+'\n';}
js+='\nAPP.init();\n';
await writeFile(new URL('assets/app.js',out),js);
const params=JSON.parse(await readFile(new URL('source.json',root),'utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:params.git_instance_id}));
