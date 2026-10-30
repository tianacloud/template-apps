import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';
const css = await readFile('src/style.css','utf8');
const body = await readFile('src/body.html','utf8');
const game = await readFile('src/game.js','utf8');
await mkdir('dist/assets',{recursive:true});
const source = `import { openSave } from './db.js';
const style = document.createElement("style"); style.textContent = ${JSON.stringify(css)}; document.head.append(style); document.body.innerHTML = ${JSON.stringify(body)};
(async () => { try { const cloudSave = /[?&]demo=1/.test(location.search) ? {data:null,save(){}} : await openSave();
${game}
} catch (error) { document.body.innerHTML = '<p role="alert" style="padding:2em">无法读取云端存档，请检查登录和网络后重新打开。</p>'; } })();`;
await build({stdin:{contents:source,resolveDir:process.cwd()+'/src',sourcefile:'entry.js'},bundle:true,format:'iife',target:'es2020',outfile:'dist/assets/app.js',supported:{'top-level-await':false}});
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(await readFile('source.json','utf8'))}));
