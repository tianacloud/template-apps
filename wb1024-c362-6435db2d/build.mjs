import {readFileSync, mkdirSync, writeFileSync, copyFileSync} from 'node:fs';
mkdirSync('dist/assets',{recursive:true});
const body=readFileSync('body.html','utf8'), css=readFileSync('style.css','utf8'), xlsx=readFileSync('xlsx.full.min.js','utf8'), code=readFileSync('app.js','utf8');
writeFileSync('dist/assets/app.js',`document.head.insertAdjacentHTML('beforeend',${JSON.stringify(`<style>${css}</style>`)});document.getElementById('app').innerHTML=${JSON.stringify(body)};\n${xlsx}\n${code}`);
copyFileSync('icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(readFileSync('source.json')).git_instance_id}));
