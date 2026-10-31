import {cp, mkdir, rm, readFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true}); await cp('src','dist/assets',{recursive:true}); await cp('src/entry.js','dist/assets/app.js'); await cp('icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
