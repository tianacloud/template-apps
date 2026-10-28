import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('dist/assets',{recursive:true});
const body=readFileSync('src/body.html','utf8');
const css=readFileSync('src/style.css','utf8');
const code=readFileSync('src/main.js','utf8');
writeFileSync('dist/assets/app.js',`document.getElementById("app").innerHTML=${JSON.stringify(body)};\nconst style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);\n${code}`);
copyFileSync('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(readFileSync('source.json')).git_instance_id}));
