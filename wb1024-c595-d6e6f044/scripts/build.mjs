import {cp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await cp('src','dist/hall',{recursive:true}); await cp('public/icon.png','dist/icon.png');
for (const page of ['','life/','dynasty/','office/','gongdou/','groupchat/','doom/']) {
  const file=`dist/hall/${page}index.html`; let html=await readFile(file,'utf8'); let count=0, pending=[];
  html=html.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi,(all,attrs='',body)=>{
    if (/\bsrc\s*=/.test(attrs) || !body.trim()) return all;
    const name=`inline-${++count}.js`; pending.push(writeFile(`dist/hall/${page}${name}`,body)); return `<script src="./${name}"></script>`;
  });
  await Promise.all(pending); await writeFile(file,html);
}
await writeFile('dist/assets/app.js',`location.replace(new URL('../hall/index.html', import.meta.url).href);`);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(await readFile('source.json','utf8')).git_instance_id}));
