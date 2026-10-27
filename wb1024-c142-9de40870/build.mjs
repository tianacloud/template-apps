import {cp, mkdir, rm, readFile, writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await cp('public','dist',{recursive:true});
await writeFile('dist/assets/app.js', `const f=document.createElement('iframe'); f.src=new URL('../app.html',import.meta.url).href; f.title='捉鸡麻将复盘训练工具'; f.allow='fullscreen'; f.allowFullscreen=true; Object.assign(f.style,{position:'fixed',inset:'0',width:'100%',height:'100%',border:'0'}); document.body.append(f);`);
const {git_instance_id}=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id}));
