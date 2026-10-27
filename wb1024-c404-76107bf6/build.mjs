import {readFileSync, mkdirSync, writeFileSync, copyFileSync, rmSync} from 'node:fs';
const read = p => readFileSync(p,'utf8');
rmSync('dist',{recursive:true,force:true}); mkdirSync('dist/assets',{recursive:true});
const body=read('src/body.html');
const js=`document.querySelector('#app').innerHTML = ${JSON.stringify(body)};\n`+['jspdf.umd.min.js','palette.js','processor.js','renderer.js','export.js','ui.js'].map(f=>read('src/'+f)).join('\n;\n');
writeFileSync('dist/assets/app.js',`const link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./style.css',import.meta.url).href; document.head.appendChild(link);\n`+js);
copyFileSync('src/style.css','dist/assets/style.css'); copyFileSync('public/icon.png','dist/icon.png');
const source=JSON.parse(read('source.json')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
