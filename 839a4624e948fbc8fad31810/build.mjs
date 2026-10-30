import { readFile, mkdir, writeFile, rm, readdir, stat, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';
const read = p => readFile(new URL(p, import.meta.url), 'utf8');
await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
await copyFile('public/icon.png', 'dist/icon.png');
let css = await read('./src/style.css');
const body = await read('./src/body.html');
const scripts = await Promise.all(JSON.parse(await read('./src/scripts.json')).map(f => read('./src/' + f)));
const small = {}, large = [];
for (const name of await readdir('src/small-images')) small['images/'+name]='data:image/webp;base64,'+(await readFile('src/small-images/'+name)).toString('base64');
for (const folder of ['images','fonts']) for (const name of await readdir('template-files/'+folder)) large.push(folder+'/'+name);
// Small images are part of the JS bundle; only larger objects are seeded.
const setup = `import {cloud} from './src/cloud.js';\nexport async function mount(root, context) {\ntry {\nconst store=await cloud(context.files); const assetUrls=${JSON.stringify(small)}; await Promise.all(${JSON.stringify(large)}.map(async path=>{assetUrls[path]=await context.files.getUrl('template-assets/'+path)}));\nlet css=${JSON.stringify(css)}; for(const path of ${JSON.stringify(large.filter(x=>x.startsWith('fonts/')))}) css=css.replaceAll('fonts/'+path.slice(6),assetUrls[path]); const style=document.createElement('style');style.textContent=css;document.head.appendChild(style); root.innerHTML=${JSON.stringify(body)};\n${scripts.join('\n;\n')}\nreturn ()=>style.remove();\n} catch(error) { console.error(error); root.textContent='云端数据或素材加载失败，请检查连接后重新打开。'; }\n}`;
await build({stdin:{contents:setup,resolveDir:process.cwd(),sourcefile:'entry.js'},bundle:true,format:'esm',platform:'browser',outfile:'dist/assets/app.js'});
const source=JSON.parse(await read('./source.json'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id,database_instance_id:source.database_instance_id}));
