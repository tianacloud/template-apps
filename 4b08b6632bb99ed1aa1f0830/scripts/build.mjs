import {readFile, mkdir, cp, rm} from 'node:fs/promises';
import {build} from 'esbuild';
const html=await readFile('index.html','utf8');
const body=html.split('<body>')[1].split('<script src=')[0];
const app=await readFile('assets/js/app.js','utf8');
const names=['MDR_META','MDR_CN','MDR_CN_EXT','MDR_INTL','MDR_FLOW','MDR_REVIEW','MDR_SELFCHECK','MDR_FULLTEXT','MDR_MARKET'];
const entry=`import {openStorage} from './assets/js/storage.js';
export async function mount(root, context) {
 root.innerHTML=${JSON.stringify(body)};
 const l=document.createElement('link'); l.rel='stylesheet'; l.href=new URL('app.css',import.meta.url).href; document.head.appendChild(l);
 try {
  const names=${JSON.stringify(names)};
  await Promise.all(names.map(async name=>{const response=await context.files.get('template-assets/data/'+name+'.json'); if(!response.ok) throw Error('数据读取失败'); window[name]=await response.json();}));
  window.medregStorage=await openStorage(context.files);
  ${app}
 } catch(error) {root.textContent='无法读取应用数据，请检查登录和网络后重新打开。'; console.error(error);}
 return ()=>{l.remove();};
}`;
await rm('dist',{recursive:true,force:true});await mkdir('dist/assets',{recursive:true});
await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'generated.js'},bundle:true,format:'esm',outfile:'dist/assets/app.js'});
await cp('assets/css/app.css','dist/assets/app.css');await cp('icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8'));console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
