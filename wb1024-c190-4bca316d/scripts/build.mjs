import {mkdir,copyFile,readFile} from 'node:fs/promises';
const source=JSON.parse(await readFile('source.json','utf8'));
await mkdir('dist/assets',{recursive:true});
await copyFile('src/app.js','dist/assets/app.js');
await copyFile('src/style.css','dist/assets/app.css');
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
