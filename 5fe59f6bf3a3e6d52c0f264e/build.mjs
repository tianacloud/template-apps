import {readFile, mkdir, copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
const body=await readFile('src/body.html','utf8'), css=await readFile('src/style.css','utf8'), code=await readFile('src/main.js','utf8');
await mkdir('dist/assets',{recursive:true});
await build({stdin:{contents:`import {createTianaFetch} from '@tianacloud/serverless';\nexport async function mount(root, {files}) {\nroot.innerHTML=${JSON.stringify(body)};\ntry { const background=await files.getUrl('template-assets/images/background.jpg'); const style=document.createElement('style');style.textContent=${JSON.stringify(css)}.replace('__CLASSROOM_BACKGROUND_URL__',JSON.stringify(background));document.head.appendChild(style);\n${code}\n} catch(error) {root.textContent='无法连接数据库或读取背景，请检查登录状态后刷新。';console.error(error);}\n}`,resolveDir:process.cwd(),sourcefile:'app.js'},bundle:true,format:'esm',outfile:'dist/assets/app.js'});
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
