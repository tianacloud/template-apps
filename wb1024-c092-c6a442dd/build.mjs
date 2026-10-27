import {readFileSync,writeFileSync,mkdirSync,cpSync,rmSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true}); mkdirSync('dist/assets',{recursive:true});
const body=readFileSync('src/body.html','utf8'); const dict=readFileSync('src/dict.js','utf8'); const app=readFileSync('src/app.js','utf8');
writeFileSync('dist/assets/app.js',`const l=document.createElement("link");l.rel="stylesheet";l.href=new URL("styles.css",import.meta.url).href;document.head.appendChild(l);\ndocument.getElementById("app").innerHTML = ${JSON.stringify(body)};\n`+dict+'\n'+app);
cpSync('src/styles.css','dist/assets/styles.css'); cpSync('icon.png','dist/icon.png');
const source=JSON.parse(readFileSync('source.json')); console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
