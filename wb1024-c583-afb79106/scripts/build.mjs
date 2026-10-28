import {readFile, mkdir, writeFile, copyFile} from 'node:fs/promises';
const html=await readFile('index.html','utf8');
await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`document.open();document.write(${JSON.stringify(html)});document.close();`);
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js'}));
