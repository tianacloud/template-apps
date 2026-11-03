import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
const source = JSON.parse(await readFile('source.json', 'utf8'));
const [body, css, script] = await Promise.all(['src/body.html','src/style.css','src/app.js'].map(p => readFile(p, 'utf8')));
await mkdir('dist/assets', {recursive:true});
await writeFile('dist/assets/app.js', `document.title='日常集 · 生活工作台';\nconst style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);\ndocument.body.innerHTML=${JSON.stringify(body)};\n${script}`);
await copyFile('public/icon.png', 'dist/icon.png');
console.log('TIANA_PROJECT_PARAMS ' + JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
