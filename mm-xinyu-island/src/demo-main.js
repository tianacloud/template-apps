import css from './app.css?inline';
import html from './index.html?raw';
import { storage } from './demo-storage.js';
import { preferences } from './preferences.js';
const {init,load}=await import('./app.js');
const style=document.createElement('style');style.textContent=css;document.head.append(style);
document.body.innerHTML=html.match(/<body[^>]*>([\s\S]*?)<script type="module"/i)[1];
const banner=document.createElement('div');banner.style.cssText='position:relative;z-index:4;text-align:center;background:#fff5d7;color:#3f342c;padding:7px;font:600 13px system-ui';banner.innerHTML='示例体验，数据仅保留在本页 <button type="button" id="demo-reset">恢复示例数据</button>';document.body.prepend(banner);
// allow-forms is absent in the marketplace iframe; dispatch the same application handlers explicitly.
document.addEventListener('click',e=>{const b=e.target.closest('button[type=submit]');if(!b||!b.form)return;e.preventDefault();b.form.dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true,submitter:b}));},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter' && e.target.matches('input') && e.target.form){e.preventDefault();e.target.form.dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true}));}},true);
document.querySelector('#demo-reset').onclick=async()=>{storage.reset();preferences.reset();await load();};
init();
