import {readFileSync,writeFileSync,mkdirSync,cpSync,rmSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true}); mkdirSync('dist/assets',{recursive:true});
const body=readFileSync('src/body.html','utf8'), css=readFileSync('src/style.css','utf8'), assets=readFileSync('src/assets.js','utf8'), app=readFileSync('src/app.js','utf8');
writeFileSync('dist/assets/app.js',`const style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.body.innerHTML=${JSON.stringify(body)};\n`+assets+'\n'+app);
cpSync('icon.png','dist/icon.png'); const source=JSON.parse(readFileSync('source.json')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
