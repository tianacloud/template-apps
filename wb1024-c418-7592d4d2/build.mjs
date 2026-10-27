import {cp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true}); await cp('public','dist/assets',{recursive:true}); await cp('public/icon.png','dist/icon.png');
const body=await readFile('public/body.html','utf8');
const code=`const base=new URL('.',import.meta.url);document.body.innerHTML=${JSON.stringify(body)};document.querySelectorAll('[src^="./assets/"]').forEach(e=>e.src=new URL(e.getAttribute('src'),base));const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('styles.css',base);document.head.append(css);for(const file of ['core.js','app.js']) await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(file,base);s.onload=resolve;s.onerror=reject;document.body.append(s)});import(new URL('scene.js',base));`;
await writeFile('dist/assets/entry.js',code);console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/entry.js'}));
