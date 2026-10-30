import body from './body.html?raw';
import './style.css';
import {start} from './logic.js';
import {getLocal,putLocal} from './offline-store.js';
let installEvent,offlineReady=false;
window.addEventListener('beforeinstallprompt', e=>{e.preventDefault();installEvent=e;const b=document.getElementById('pwaInstallBtn');if(b && offlineReady)b.hidden=false;});
export async function mount(root, {files}) {
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./app.css',import.meta.url).href;document.head.appendChild(css);
  root.innerHTML=body;
  if(!window.__ironOffline) {
    const button=document.createElement('button');button.id='pwaInstallBtn';button.hidden=true;button.textContent='安装到桌面';button.style.cssText='position:fixed;top:70px;left:12px;z-index:9999;padding:11px 16px;border:0;border-radius:9px;background:#16202e;color:white;cursor:pointer';
    button.onclick=async()=>{if(installEvent){await installEvent.prompt();await installEvent.userChoice;installEvent=null;button.hidden=true;}};document.body.appendChild(button);
  } else {
    const bar=document.createElement('div');bar.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:10px;background:#3b3020;color:white';bar.textContent='离线模式：更改暂存在本机，联网后返回应用同步。';const sync=document.createElement('button');sync.textContent='联网同步';sync.style.marginLeft='12px';sync.onclick=async()=>{const active=await getLocal('active');if(active?.url)location.assign(active.url);};bar.appendChild(sync);document.body.appendChild(bar);
  }

  function showStorageError(message){let el=document.getElementById('storage-error');if(!el){el=document.createElement('div');el.id='storage-error';el.setAttribute('role','alert');el.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#a22;color:white;padding:12px';document.body.prepend(el)}el.textContent=message;}
  try {
    await Promise.all(['body-front.png','body-back.png'].map(async name=>{for(const img of root.querySelectorAll('img[data-asset="'+name+'"]')) await files.bindImage(img,'template-assets/'+name);}));
    await start(showStorageError);
    if(!window.__ironOffline) prepareOffline(files).catch(error=>{showStorageError('离线入口准备失败，当前仍可联网使用。');console.warn(error);});
  } catch(error) { root.textContent='数据或素材加载失败：'+(error?.message || '请检查网络并重新打开应用。'); console.error(error); }
}

async function prepareOffline(files) {
  if(!('serviceWorker' in navigator) || !window.tiana?.appId) return;
  const appId=window.tiana.appId, old=await getLocal('active');
  if(old && old.appId!==appId) throw Error('该浏览器的离线入口已绑定另一应用');
  const manifest=document.createElement('link');manifest.rel='manifest';manifest.href=new URL('./manifest.webmanifest',import.meta.url).href;document.head.appendChild(manifest);
  await navigator.serviceWorker.register(new URL('./sw.js',import.meta.url));
  const cache=await caches.open('iron-planner-media-v1');
  for(const name of ['body-front.png','body-back.png']) {const res=await files.get('template-assets/'+name);if(!res.ok)throw Error('离线素材准备失败');await cache.put(new URL('./offline-media/'+name,import.meta.url),res);}
  await putLocal('active',{appId,url:location.href});
  offlineReady=true;const button=document.getElementById('pwaInstallBtn');if(button && installEvent)button.hidden=false;
}
