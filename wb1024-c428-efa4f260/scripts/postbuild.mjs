import {copyFile,readFile,writeFile} from 'node:fs/promises';
await copyFile('public/icon.png','dist/icon.png');
const path='dist/assets/app.js';
const js=await readFile(path,'utf8');
await writeFile(path,`const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./wb1024-c428-efa4f260.css',import.meta.url).href;document.head.appendChild(css);\n`+js);
const config=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...config}));
