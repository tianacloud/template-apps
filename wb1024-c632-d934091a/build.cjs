const fs = require('node:fs');
fs.mkdirSync('dist/assets',{recursive:true});
const body = fs.readFileSync('body.html','utf8');
const css = fs.readFileSync('style.css','utf8');
const app = fs.readFileSync('app.js','utf8');
const entry = `export function mount(root) {\n document.title = "课堂白板";\nconst style = document.createElement("style"); style.textContent = ${JSON.stringify(css)}; document.head.append(style);\nroot.innerHTML = ${JSON.stringify(body)};\n${app}\n }`;
fs.writeFileSync('dist/assets/app.js',entry);
fs.copyFileSync('icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(fs.readFileSync('source.json')).git_instance_id}));
