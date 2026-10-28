import fs from 'node:fs';
fs.mkdirSync('dist/assets',{recursive:true});
const body=fs.readFileSync('src/body.html','utf8');
const css=fs.readFileSync('src/style.css','utf8');
const entry=`document.head.insertAdjacentHTML('beforeend', ${JSON.stringify('<style>'+css+'</style>')});\ndocument.getElementById('app').innerHTML = ${JSON.stringify(body)};\nconst s=document.createElement('script'); s.src=new URL('./game.js',import.meta.url).href; document.body.appendChild(s);\n`;
fs.writeFileSync('dist/assets/app.js',entry);
fs.copyFileSync('src/game.js','dist/assets/game.js');
fs.copyFileSync('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(fs.readFileSync('source.json','utf8'))}));
