import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const body=await readFile('body.html','utf8'), css=await readFile('app.css','utf8'), js=await readFile('app.js','utf8');
await writeFile('dist/assets/app.js', `document.title = "TimeAlign · 时区对齐器";
const style = document.createElement("style"); style.textContent = ${JSON.stringify(css)}; document.head.appendChild(style);
document.getElementById("app").innerHTML = ${JSON.stringify(body)};
${js}`);
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
