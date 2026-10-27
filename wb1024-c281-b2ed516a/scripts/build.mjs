import {mkdir,copyFile,readFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40,64}$/.test(commit||'')) throw Error('需要完整源码提交');
const source=JSON.parse(await readFile('source.json','utf8'));
await mkdir('dist/assets',{recursive:true});
await Promise.all([copyFile('src/app.js','dist/assets/app.js'),copyFile('src/app.css','dist/assets/app.css'),copyFile('public/icon.png','dist/icon.png')]);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
