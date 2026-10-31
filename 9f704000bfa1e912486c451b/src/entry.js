import { startGame } from './main.js';
import html from './ui.html';
import css from './style.css';
export async function mount(root, {files}) {
  const style=document.createElement('style'); style.textContent=css; document.head.append(style);
  root.innerHTML=html;
  const error=document.createElement('div'); error.id='save-error'; error.hidden=true; error.setAttribute('role','alert'); error.style.cssText='position:fixed;top:0;left:0;right:0;z-index:10000;background:#fff3cd;color:#332;padding:12px;text-align:center'; error.textContent='存档未能确认保存。请刷新页面核对云端进度后继续。'; root.append(error);
  try { await startGame(files); }
  catch (e) { console.error(e); root.innerHTML='<div role="alert" style="padding:24px">无法读取云端存档，请检查登录和网络后刷新重试。</div>'; }
}
