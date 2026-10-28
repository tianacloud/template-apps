import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
const body=html.split('<body>')[1].split('<script src="assets/engine.js">')[0];
const scripts=['assets/engine.js','assets/charts.js','data/demo-wells.js','assets/app.js'].map(f=>readFileSync(f,'utf8')).join('\n');
mkdirSync('dist/assets',{recursive:true});
writeFileSync('dist/assets/app.js',`document.getElementById('app').innerHTML=${JSON.stringify(body)};\nconst link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./style.css',import.meta.url).href; document.head.appendChild(link);\n${scripts}`);
copyFileSync('assets/style.css','dist/assets/style.css'); copyFileSync('icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(readFileSync('source.json')).git_instance_id}));
