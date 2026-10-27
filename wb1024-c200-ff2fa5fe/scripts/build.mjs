import {readFileSync,writeFileSync,mkdirSync,cpSync,rmSync} from 'node:fs';
const body=readFileSync('src/body.html','utf8'), css=readFileSync('src/style.css','utf8'), logic=readFileSync('src/logic.js','utf8');
rmSync('dist',{recursive:true,force:true}); mkdirSync('dist/assets',{recursive:true});
writeFileSync('dist/assets/app.js',`document.head.insertAdjacentHTML('beforeend',${JSON.stringify('<style>'+css+'</style>')});\ndocument.getElementById('app').innerHTML=${JSON.stringify(body)};\n${logic}`);
cpSync('public/icon.png','dist/icon.png');
const source=JSON.parse(readFileSync('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
