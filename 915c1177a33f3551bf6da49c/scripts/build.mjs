import {build} from 'vite';
import {readFile,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
await build(); await copyFile('public/icon.png','dist/icon.png');
for (const file of ['offline.html','offline-bootstrap.js','manifest.webmanifest','sw.js']) await copyFile('public/'+file,'dist/assets/'+file);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
