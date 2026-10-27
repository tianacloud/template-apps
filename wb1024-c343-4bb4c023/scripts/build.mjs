import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const body=await readFile('src/body.html','utf8'), css=await readFile('src/style.css','utf8'), engine=await readFile('src/engine.js','utf8');
await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`document.querySelector('#app').innerHTML = ${JSON.stringify(body)};\nconst style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.appendChild(style);\n${engine}`);
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
