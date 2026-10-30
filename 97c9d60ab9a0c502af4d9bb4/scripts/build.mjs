import {readFile, mkdir, writeFile, rm, readdir} from 'node:fs/promises';
import {build} from 'esbuild';
const commit=process.argv[2];
if(!/^[0-9a-f]{40}$/.test(commit||'')) throw new Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if(process.env.TIANA_TEMPLATE_BUILD!=='1' && Object.values(source).some(v=>v.startsWith('__TIANA_'))) throw new Error('请绑定应用实例');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const {copyFile}=await import('node:fs/promises'); await copyFile('public/icon.png','dist/icon.png');
const body=await readFile('src/body.html','utf8'); const css=await readFile('src/style.css','utf8');
const small={}; for(const file of await readdir('public/assets')) { const bytes=await readFile('public/assets/'+file); if(bytes.length>16384) throw Error('小图超过限制: '+file); small['assets/'+file]='data:image/webp;base64,'+bytes.toString('base64'); }
const external=await readdir('template-files/assets');
let js=`import {prepareStorage} from './runtime.js';\nexport async function mount(root, context) {\nroot.innerHTML=${JSON.stringify(body)}; const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);\nconst notice=document.createElement('div');notice.style.cssText='position:fixed;z-index:99999;top:0;left:0;right:0;background:#5a1717;color:white;padding:12px';notice.hidden=true;root.append(notice);const fail=()=>{notice.hidden=false;notice.textContent='存档未能确认，请检查网络并刷新核对；当前进度可能未保存。';};\ntry {\nconst jadeStorage=await prepareStorage(fail); if(!context?.files) throw Error('文件服务未就绪');\nconst assetMap=${JSON.stringify(small)};\nconst externalNames=${JSON.stringify(external)}; for(let i=0;i<externalNames.length;i+=12) await Promise.all(externalNames.slice(i,i+12).map(async name=>{assetMap['assets/'+name]=await context.files.getUrl('template-assets/assets/'+name)}));\nfunction resolveAsset(path){return assetMap[path] || path;}\n`;
for(const f of ['data.js','render.js','ui.js','toyapi.js','audio.js','game.js']) js+=(await readFile('src/'+f,'utf8'))+'\n';
js+=`\n} catch(error){fail();notice.textContent='无法加载游戏数据或素材，请检查登录和网络后刷新。';} return ()=>style.remove();\n}`;
await writeFile('src/.build-entry.js',js);
try { await build({entryPoints:['src/.build-entry.js'],bundle:true,format:'esm',outfile:'dist/assets/app.js',platform:'browser'}); } finally { await rm('src/.build-entry.js',{force:true}); }
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
