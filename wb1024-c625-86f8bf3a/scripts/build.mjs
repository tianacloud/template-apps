import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40,64}$/.test(commit||'')) throw Error('完整提交号必填');
const source=JSON.parse(await readFile('source.json','utf8'));
await mkdir('dist/assets',{recursive:true}); await copyFile('src/app.js','dist/assets/app.js'); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
