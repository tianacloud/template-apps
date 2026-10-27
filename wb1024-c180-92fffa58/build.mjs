import {mkdir,copyFile,readFile,writeFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await copyFile('src/app.js','dist/assets/app.js'); await copyFile('src/style.css','dist/assets/style.css'); await copyFile('public/icon.png','dist/icon.png');
const params=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({...params,entry:'assets/app.js'}));
