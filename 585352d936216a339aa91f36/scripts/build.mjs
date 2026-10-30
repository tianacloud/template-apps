import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist/assets',{recursive:true});
const js=await readFile('src/app.js','utf8');
await writeFile('dist/assets/app.js',`const l=document.createElement("link");l.rel="stylesheet";l.href=new URL("./style.css",import.meta.url);document.head.appendChild(l);\n${js}`);
await copyFile('src/style.css','dist/assets/style.css'); await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
