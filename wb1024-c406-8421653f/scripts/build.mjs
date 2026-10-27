import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/assets',{recursive:true});
const body=await readFile('src/body.html','utf8');
const names=['util','knowledge','parser','analyzer','report','samples','app'];
let js=`document.title="第一现场 SceneOne · 日志与报错诊断台"; document.getElementById("app").innerHTML=${JSON.stringify(body)}; const link=document.createElement("link"); link.rel="stylesheet"; link.href=new URL("./style.css",import.meta.url).href; document.head.appendChild(link);\n`;
for(const n of names) js+=await readFile(`src/${n}.js`,'utf8')+'\n';
await writeFile('dist/assets/app.js',js); await copyFile('src/style.css','dist/assets/style.css'); await copyFile('icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
