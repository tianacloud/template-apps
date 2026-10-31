import {mkdir,readFile,writeFile,cp,rm} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2]; if(!/^[0-9a-f]{40,64}$/.test(commit||'')) throw Error('需要完整源码提交号');
const html=await readFile('src/body.html','utf8'), js=await readFile('src/app.js','utf8');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const entry=`import {connectStore} from './persistence.js';
document.title='记账本 · MoneyBook';
document.body.innerHTML=${JSON.stringify(html)};
const link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./app.css',import.meta.url).href; document.head.appendChild(link);
try { window.moneybookPersistence = await connectStore();
${js}
} catch (e) { document.body.innerHTML=''; const msg=document.createElement('p'); msg.textContent='无法打开账本：'+e.message+'。请检查网络和登录状态后重新打开。'; document.body.appendChild(msg); }`;
await build({stdin:{contents:entry,resolveDir:process.cwd()+'/src',sourcefile:'entry.js',loader:'js'},bundle:true,format:'esm',target:'es2022',outfile:'dist/assets/app.js'});
await cp('src/styles.css','dist/assets/app.css'); await cp('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id}));
