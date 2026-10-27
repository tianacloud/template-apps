import {readFile, mkdir, writeFile, copyFile} from 'node:fs/promises';
const read = p => readFile(p,'utf8');
const source = JSON.parse(await read('source.json'));
await mkdir('dist/assets',{recursive:true});
const body=await read('src/body.html'), css=await read('src/styles.css');
const scripts=await Promise.all(['data.js','realexam.js','app.js'].map(x=>read('src/'+x)));
await writeFile('dist/assets/app.js', `document.querySelector('#app').innerHTML=${JSON.stringify(body)};\nconst s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.appendChild(s);\n${scripts.join('\n')}\n`);
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
