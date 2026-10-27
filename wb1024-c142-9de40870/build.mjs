import {cp, mkdir, rm, readFile, writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await cp('public','dist',{recursive:true});
for (const [file,prefix] of [['app.html','main'],['zhuoji-tutorial.html','tutorial'],['docs/quiz/quiz.html','quiz']]) {
 let html=await readFile('dist/'+file,'utf8'), n=0;
 let matches=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
 for (const m of matches.reverse()) {
  let js=m[2]; if(!js.trim()) continue;
  if(file==='app.html') js=js.replaceAll('"img/','"assets/img/').replace('if(fr&&!fr.getAttribute("src")&&fr.getAttribute("data-src"))fr.setAttribute("src",fr.getAttribute("data-src"));','if(fr&&!fr.dataset.loaded&&fr.getAttribute("data-src")){fr.dataset.loaded="1";fetch(new URL(fr.getAttribute("data-src"),document.baseURI)).then(r=>r.text()).then(t=>{fr.srcdoc=t.replace(/<head([^>]*)>/i,`<head$1><base href="${document.baseURI}">`)});}');
  let name=`${prefix}-${n++}.js`; await writeFile('dist/assets/'+name,js);
  html=html.slice(0,m.index)+`<script src="assets/assets/${name}"></script>`+html.slice(m.index+m[0].length);
 }
 if(file==='app.html') html=html.replaceAll('data-src="zhuoji-tutorial.html"','data-src="assets/zhuoji-tutorial.html"').replaceAll('data-src="docs/quiz/quiz.html"','data-src="assets/docs/quiz/quiz.html"');
 await writeFile('dist/'+file,html);
}
await writeFile('dist/assets/events.js', `document.addEventListener('click',function(e){const el=e.target.closest('[onclick]');if(!el)return;const m=(el.getAttribute('onclick')||'').match(/^([A-Za-z_$][\\w$]*)\\(([^()]*)\\);?$/);if(!m)return;const allowed=['resetBuyNow','resetDo','closeResult','hideResult','guardDo','guardBuyNow','fbOpen','openReview'];if(!allowed.includes(m[1])||typeof window[m[1]]!=='function')return;let a=m[2].trim(),args=[];if(a==='this')args=[el];else if(/^['"](?:result)['"]$/.test(a))args=[a.slice(1,-1)];else if(a)return;e.preventDefault();window[m[1]](...args)},true);`);
let appHtml=await readFile('dist/app.html','utf8'); appHtml=appHtml.replace(/<head([^>]*)>/i,'<head$1><script src="assets/assets/events.js"></script>'); await writeFile('dist/app.html',appHtml);
await writeFile('dist/assets/app.js', `const base=new URL('../',import.meta.url); const f=document.createElement('iframe'); f.title='捉鸡麻将复盘训练工具'; f.allow='fullscreen'; f.allowFullscreen=true; Object.assign(f.style,{position:'fixed',inset:'0',width:'100%',height:'100%',border:'0'}); document.body.append(f); fetch(new URL('app.html',base)).then(r=>{if(!r.ok)throw Error('应用加载失败');return r.text()}).then(t=>{f.srcdoc=t.replace(/<head([^>]*)>/i,\`<head$1><base href="\${base.href}">\`)});`);
const {git_instance_id}=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id}));
