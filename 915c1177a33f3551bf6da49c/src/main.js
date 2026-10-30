import body from './body.html?raw';
import './style.css';
import {start} from './logic.js';
export async function mount(root, {files}) {
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./app.css',import.meta.url).href;document.head.appendChild(css);
  root.innerHTML=body;
  function showStorageError(message){let el=document.getElementById('storage-error');if(!el){el=document.createElement('div');el.id='storage-error';el.setAttribute('role','alert');el.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#a22;color:white;padding:12px';document.body.prepend(el)}el.textContent=message;}
  try {
    await Promise.all(['body-front.png','body-back.png'].map(async name=>{for(const img of root.querySelectorAll('img[data-asset="'+name+'"]')) await files.bindImage(img,'template-assets/'+name);}));
    await start(showStorageError);
  } catch(error) { root.textContent='数据或素材加载失败，请检查网络并重新打开应用。'; console.error(error); }
}
