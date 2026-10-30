import {cp, mkdir, rm, readFile, writeFile, readdir} from 'node:fs/promises';
import {build} from 'esbuild';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await cp('public','dist',{recursive:true});
const inlineImages=new Map();
for (const [file,prefix] of [['app.html','main'],['zhuoji-tutorial.html','tutorial'],['docs/quiz/quiz.html','quiz']]) {
 let html=await readFile('dist/'+file,'utf8'), n=0;
 html=html.replace(/src="(data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)"/g,(_m,data)=>{const bytes=Buffer.from(data.split(',')[1],'base64');if(bytes.length>16384)throw Error('Inline image exceeds 16 KiB');if(!inlineImages.has(data))inlineImages.set(data,inlineImages.size);return `data-inline-image="${inlineImages.get(data)}"`});
 html=html.replace(/<head([^>]*)>/i,'<head$1><script defer src="assets/inline-images.js"></script>');
 let matches=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
 for (const m of matches.reverse()) {
  let js=m[2]; if(!js.trim()) continue; js=js.replaceAll("localStorage", "window.__gymjStore"); js="window.__gymjStore=window.parent.__gymjStore;window.__gymjAsset=window.parent.__gymjAsset;\n"+js;
  if(file==='app.html') js=js.replace('if(fr&&!fr.getAttribute("src")&&fr.getAttribute("data-src"))fr.setAttribute("src",fr.getAttribute("data-src"));',`if(fr&&!fr.dataset.loaded&&fr.getAttribute("data-src")){fr.dataset.loaded="1";fetch(new URL(fr.getAttribute("data-src"),window.parent.__gymjBase)).then(r=>r.text()).then(t=>{fr.srcdoc=t.replaceAll('src="assets/','src="'+new URL('assets/',window.parent.__gymjBase).href)});}`);
  let name=`${prefix}-${n++}.js`; await writeFile('dist/assets/'+name,js);
  html=html.slice(0,m.index)+`<script src="assets/${name}"></script>`+html.slice(m.index+m[0].length);
 }

 await writeFile('dist/'+file,html);
}
await writeFile('dist/assets/inline-images.js',`const images=${JSON.stringify([...inlineImages.keys()])};document.querySelectorAll('[data-inline-image]').forEach(el=>{el.src=images[Number(el.dataset.inlineImage)]});`);
await writeFile('dist/assets/events.js', `document.addEventListener('click',function(e){const el=e.target.closest('[onclick]');if(!el)return;const m=(el.getAttribute('onclick')||'').match(/^([A-Za-z_$][\\w$]*)\\(([^()]*)\\);?$/);if(!m)return;const allowed=['resetBuyNow','resetDo','closeResult','hideResult','guardDo','guardBuyNow','fbOpen','openReview'];if(!allowed.includes(m[1])||typeof window[m[1]]!=='function')return;let a=m[2].trim(),args=[];if(a==='this')args=[el];else if(/^['"](?:result)['"]$/.test(a))args=[a.slice(1,-1)];else if(a)return;e.preventDefault();window[m[1]](...args)},true);`);
let appHtml=await readFile('dist/app.html','utf8'); appHtml=appHtml.replace(/<head([^>]*)>/i,'<head$1><script src="assets/events.js"></script>'); await writeFile('dist/app.html',appHtml);
const names=await readdir('template-files/img');
await build({entryPoints:['src/entry.js'],bundle:true,format:'esm',platform:'browser',target:'es2020',outfile:'dist/assets/app.js',define:{ASSET_NAMES:JSON.stringify(names)}});
const {git_instance_id,database_instance_id}=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id,database_instance_id}));
