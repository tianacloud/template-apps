import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
const css = await readFile('src/style.css','utf8');
const body = await readFile('src/body.html','utf8');
const game = await readFile('src/game.js','utf8');
await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`const style = document.createElement("style"); style.textContent = ${JSON.stringify(css)}; document.head.append(style); document.body.innerHTML = ${JSON.stringify(body)};\n${game}`);
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',...JSON.parse(await readFile('source.json','utf8'))}));
