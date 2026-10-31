import {prepareCloud} from './cloud.js';
export async function mount(root, context) {
 try {
  window.archiveCloud=await prepareCloud(context.files); window.archiveFiles=context.files;
  const base=new URL('.',import.meta.url);
  const response=await fetch(new URL('body.html',base));if(!response.ok)throw Error('页面资源读取失败');
  root.innerHTML=await response.text();
  const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('style.css',base);document.head.append(style);
  const marker=document.createElement('script');marker.dataset.ocrEntry='';marker.src=import.meta.url;marker.type='application/json';document.head.append(marker);
  for(let i=2;i<=12;i++) await new Promise((resolve,reject)=>{const s=document.createElement('script');s.charset='utf-8';s.src=new URL(`script${i}.js`,base);s.onload=resolve;s.onerror=reject;document.body.append(s)});
  document.dispatchEvent(new Event('DOMContentLoaded'));
  return ()=>{style.remove();marker.remove();root.innerHTML=''};
 }catch(e){root.textContent='无法打开档案：'+e.message+'。请检查连接后重试。';}
}
