import fs from 'node:fs/promises';
await fs.mkdir('dist/assets',{recursive:true});
const css=await fs.readFile('src/style.css','utf8'), body=await fs.readFile('src/body.html','utf8'), game=await fs.readFile('src/game.js','utf8');
await fs.writeFile('dist/assets/app.js',`const style=document.createElement("style");style.textContent=${JSON.stringify(css)};document.head.appendChild(style);document.getElementById("app").innerHTML=${JSON.stringify(body)};\n${game}\nrefreshHomeUnlock();`);
await fs.copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(await fs.readFile('source.json','utf8'))}));
