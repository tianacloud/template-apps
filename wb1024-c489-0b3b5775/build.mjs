import {cp, mkdir, rm, readFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
for (const f of ['app.js','logic.js','style.css','body.html','vendor','icon.png']) await cp(f, f==='app.js'?'dist/assets/app.js':'dist/'+f,{recursive:true});
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
