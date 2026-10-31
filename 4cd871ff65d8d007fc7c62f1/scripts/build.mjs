import {readFile,writeFile,mkdir,rm,copyFile} from 'node:fs/promises';
import { build } from 'esbuild';
const read=p=>readFile(p,'utf8');
async function page(file,assets){
 const html=await read(file), style=html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1], body=html.match(/<body[^>]*>([\s\S]*?)<script\s/i)?.[1], script=html.match(/<script>\s*([\s\S]*?)<\/script>/i)?.[1];
 if(!style||!body||!script)throw Error('missing page content '+file);
 return {style,body,code:(await Promise.all(assets.map(read))).join('\n')+'\n'+script};
}
const en=await page('source.html',['content.js','content-kg.js','content-zh.js','mnemonic.js']);
const math=await page('dino.html',['content-math-g2.js','content-math-kg.js']);
await rm('dist',{recursive:true,force:true});await mkdir('dist/assets',{recursive:true});
const setup=p=>`const st=document.createElement('style');st.textContent=${JSON.stringify(p.style)};document.head.append(st);document.body.innerHTML=${JSON.stringify(p.body)};`;
await writeFile('dist-entry.js', `import {openStorage} from './storage.js';\n(async()=>{ try { const storage = await openStorage(); const stateStore = storage; if(location.hash.startsWith('#math')){${setup(math)}\n${math.code}\n}else{${setup(en)}\n${en.code}\n} } catch(e) { document.body.textContent = '云端数据暂时不可用，请重新登录后重试。'; } })();`);
try { await build({entryPoints:['dist-entry.js'],bundle:true,format:'iife',outfile:'dist/assets/app.js',target:'es2020'}); } finally { await rm('dist-entry.js',{force:true}); }
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await read('source.json'));console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id}));
