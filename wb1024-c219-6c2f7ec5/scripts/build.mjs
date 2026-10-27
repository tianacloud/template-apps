import { readFile, writeFile, cp, mkdir, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
const commit=process.argv[2]; if (!/^[0-9a-f]{40,64}$/.test(commit||'')) throw Error('完整源码提交号必填');
const source=JSON.parse(await readFile('source.json','utf8'));
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await cp('src','dist/assets/src',{recursive:true}); await cp('public/icon.png','dist/icon.png');
async function rewrite(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory()) await rewrite(p); else if(p.endsWith('.js')) { let s=await readFile(p,'utf8'); let rel=path.relative(path.dirname(p),'dist/assets/src/vendor').replaceAll('\\','/'); if(!rel.startsWith('.')) rel='./'+rel; s=s.replace(/(['"])three\/addons\/([^'"]+)\1/g,(_,q,f)=>q+rel+'/addons/'+f+q).replace(/(['"])three\1/g,(_,q)=>q+rel+'/three.module.js'+q); await writeFile(p,s);}}}
await rewrite('dist/assets/src');
const html=await readFile('src/ui.html','utf8'), css=await readFile('src/style.css','utf8');
await writeFile('dist/assets/app.js',`document.title='GlassQuest · 365 擦玻璃'; const style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.append(style); document.body.innerHTML=${JSON.stringify(html)}; import('./src/main.js');`);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
