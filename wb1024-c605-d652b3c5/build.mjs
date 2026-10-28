import {cp, mkdir, rm, writeFile, readFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await cp('public','dist/assets',{recursive:true});
await cp('public/icon.png','dist/icon.png');
await writeFile('dist/assets/app.js',`const frame=document.createElement('iframe'); frame.title='3D 微缩世界'; frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0'; frame.src=new URL('./index.html',import.meta.url).href; document.body.style.margin='0'; document.body.appendChild(frame);`);
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
