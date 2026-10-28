import fs from 'node:fs/promises';
const html=await fs.readFile('src/page.html','utf8');
const styles=[...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(x=>x[1]).join('\n');
const body=html.match(/<body[^>]*>([\s\S]*?)<script>/)[1];
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
await fs.mkdir('dist/assets',{recursive:true});
await fs.writeFile('dist/assets/app.js',`const style=document.createElement('style');style.textContent=${JSON.stringify(styles)};document.head.appendChild(style);document.body.innerHTML=${JSON.stringify(body)};\n${script}`);
await fs.copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(await fs.readFile('source.json','utf8'))}));
