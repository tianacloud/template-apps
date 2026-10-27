import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||'')) throw Error('完整源码 commit 必需');
await mkdir('dist/assets',{recursive:true}); await cp('site','dist/assets/site',{recursive:true}); await cp('src/app.js','dist/assets/app.js'); await cp('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
