import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
const html=await readFile('src/view.html','utf8'),css=await readFile('src/style.css','utf8'),js=await readFile('src/app.js','utf8');
await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`document.getElementById("app").innerHTML=${JSON.stringify(html)};\nconst style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);\n${js}`);
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(await readFile('source.json','utf8')).git_instance_id}));
