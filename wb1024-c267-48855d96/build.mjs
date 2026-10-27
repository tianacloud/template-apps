import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist/assets',{recursive:true});
for(const f of ['app.css','bg.jpg']) await copyFile('public/'+f,'dist/assets/'+f);
await copyFile('public/icon.png','dist/icon.png');
const body=await readFile('public/body.html','utf8'), logic=await readFile('public/logic.js','utf8');
await writeFile('dist/assets/app.js',`const l=document.createElement("link");l.rel="stylesheet";l.href=new URL("app.css",import.meta.url);document.head.append(l);document.body.insertAdjacentHTML("beforeend",${JSON.stringify(body)});\n${logic}`);
const {git_instance_id}=JSON.parse(await readFile('source.json','utf8'));console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id}));
