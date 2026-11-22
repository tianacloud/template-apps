import './style.css';
import shell from './shell.js';
import {makeAPI} from './api.js';
const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./app.css',import.meta.url).href;document.head.append(css);
async function start(){
  const root=document.getElementById('app');
  if(!root)throw Error('应用入口不存在');
  root.innerHTML=shell;
  if(!window.tiana?.files)throw Error('文件服务未就绪，请刷新后重试');
  window.API=makeAPI(window.tiana.files);
  await import('./store.js');await import('./barcode.js');await import('./ui.js');await import('./rack.js');await import('./print.js');
  document.getElementById('btnImport2').addEventListener('click',()=>document.getElementById('btnImport').click());
  document.getElementById('btnFields2').addEventListener('click',()=>document.getElementById('btnFields').click());
  function pendingNotice(){let existing=document.getElementById('upload-recovery');if(existing)existing.remove();if(!Object.keys(sessionStorage).some(k=>k.startsWith('am-pending-')))return;const notice=document.createElement('div');notice.id='upload-recovery';notice.className='upload-recovery';notice.textContent='有未确认的文件操作。';const button=document.createElement('button');button.textContent='检查上传状态';button.onclick=async()=>{button.disabled=true;try{const n=await window.API.recoverPending();window.UX.toast(n?'已恢复 '+n+' 个附件':'请检查未完成的备份操作',n?'success':'warn');pendingNotice();}catch(e){window.UX.toast(e.message,'error');button.disabled=false;}};notice.append(button);document.body.append(notice);}
  window.addEventListener('asset-upload-pending',pendingNotice);window.startAssetUI();pendingNotice();
}
start().catch(e=>{document.getElementById('app').textContent='应用无法启动：'+e.message;});
