import {readFile, mkdir, writeFile, copyFile, rm} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('需要完整源码提交号');
const body=await readFile('src/body.html','utf8'), logic=await readFile('src/logic.js','utf8');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const moduleText=`const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./app.css',import.meta.url);document.head.appendChild(css);\ndocument.getElementById('app').innerHTML=${JSON.stringify(body)};\nfor(const img of document.querySelectorAll('img[src="body-front.png"],img[src="body-back.png"]')) img.src=new URL('./'+img.getAttribute('src'),import.meta.url).href;\n${logic}
const manifest=document.createElement('link');manifest.rel='manifest';manifest.href=new URL('./manifest.webmanifest',import.meta.url);document.head.appendChild(manifest);
if('serviceWorker' in navigator) navigator.serviceWorker.register(new URL('./sw.js',import.meta.url)).catch(()=>{});
let deferred;const install=document.createElement('button');install.textContent='安装到桌面';install.id='pwaInstallBtn';install.style.cssText='position:fixed;top:calc(var(--nav-h) + 8px);left:12px;z-index:9999;display:none;padding:11px 16px;min-height:44px;border:0;border-radius:9px;background:#16202e;color:#fff;cursor:pointer';document.body.appendChild(install);window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;install.style.display='block'});install.addEventListener('click',async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;install.style.display='none'}});`;
await writeFile('dist/assets/app.js',moduleText); await copyFile('src/style.css','dist/assets/app.css');
for(const f of ['body-front.png','body-back.png','sw.js','offline.html','manifest.webmanifest','icon.png']) await copyFile('public/'+f,'dist/assets/'+f);
await copyFile('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
