import {mkdir,copyFile,readFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[a-f0-9]{40,64}$/.test(commit||'')) throw new Error('Full commit required');
await mkdir('dist',{recursive:true}); for(const f of ['app.js']) await copyFile(f,'dist/'+f); for(const f of ['film.mp4','icon.png']) await copyFile('public/'+f,'dist/'+f);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js',...JSON.parse(await readFile('source.json','utf8')),source_commit:commit}));
