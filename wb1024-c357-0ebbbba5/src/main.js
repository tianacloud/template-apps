import './base.css'; import './components.css'; import './themes.css';
import body from './body.html?raw';
import './storage.js';
const css = document.createElement('link'); css.rel='stylesheet'; css.href=new URL('./app.css',import.meta.url).href; document.head.append(css);
document.title='四书修习 · 卷'; document.body.innerHTML=body;
async function start(){
 await import('./bus.js'); await import('./data.js'); await import('./ui.js'); await import('./flow.js'); await import('./picker.js'); await import('./app.js');
 document.getElementById('backupDownload').onclick=async()=>{try{let {files}=await window.GXStorage.read();let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(files,null,2)],{type:'application/json'}));a.download='四书修习备份.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}catch(e){window.UI.toast('备份失败：'+e.message)}};
} start().catch(e=>{document.body.textContent='启动失败：'+e.message});
