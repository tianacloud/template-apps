import {readFileSync,writeFileSync,mkdirSync,cpSync,rmSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});mkdirSync('dist/assets',{recursive:true});
const body=readFileSync('src/body.html','utf8'),app=readFileSync('src/app.js','utf8');
writeFileSync('dist/assets/app.js',`const l=document.createElement('link');l.rel='stylesheet';l.href=new URL('style.css',import.meta.url).href;document.head.appendChild(l);document.getElementById('app').innerHTML=${JSON.stringify(body)};\n`+app);
cpSync('src/style.css','dist/assets/style.css');cpSync('icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(readFileSync('source.json')).git_instance_id}));
