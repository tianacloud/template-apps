import {mkdir,copyFile,readFile,cp,rm} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[a-f0-9]{40,64}$/.test(commit||'')) throw new Error('Full commit required');
await rm('dist',{recursive:true,force:true}); await mkdir('dist',{recursive:true}); await cp('public/clips','dist/clips',{recursive:true}); for(const f of ['app.js']) await copyFile(f,'dist/'+f); for(const f of ['icon.png']) await copyFile('public/'+f,'dist/'+f);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js',...JSON.parse(await readFile('source.json','utf8')),source_commit:commit}));
