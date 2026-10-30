import './base.css'; import './components.css'; import './themes.css';
import body from './body.html?raw';
import { initPreferences } from './storage.js';
export async function mount(root, { files }) {
window.GXFiles = files;
const css = document.createElement('link'); css.rel='stylesheet'; css.href=new URL('./app.css',import.meta.url).href; document.head.append(css);
document.title='四书修习 · 卷'; root.innerHTML=body;
async function start(){
 await initPreferences();
 await import('./bus.js'); await import('./data.js'); await import('./ui.js'); await import('./flow.js'); await import('./picker.js'); await import('./app.js');
 document.getElementById('backupDownload').onclick=async()=>{try{let {files}=await window.GXStorage.read();let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(files,null,2)],{type:'application/json'}));a.download='四书修习备份.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}catch(e){window.UI.toast('备份失败：'+e.message)}};
} await start().catch(e=>{root.textContent='启动失败：'+e.message});
return () => { root.innerHTML = ''; css.remove(); };
}
