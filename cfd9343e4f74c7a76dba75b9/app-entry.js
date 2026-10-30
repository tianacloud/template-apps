import body from './body.html';
import css from './app.css';
import mathCss from './vendor/katex/katex.min.css';
import katex from './vendor/katex/katex.min.cjs';
import {connectPracticeStore} from './cloud-store.js';
import {startPractice} from './logic.js';

export async function mount(root,{files}) {
  root.innerHTML='<p role="status">正在读取练习统计与公式字体…</p>';
  let store;
  const styles=[];
  const addStyle=text=>{const el=document.createElement('style');el.textContent=text;document.head.append(el);styles.push(el);};
  const beforeUnload=event=>{if(store?.unsaved()){event.preventDefault();event.returnValue='';}};
  try {
    if(!files)throw new Error('当前应用的文件目录尚未就绪');
    const names=[...new Set([...mathCss.matchAll(/url\(fonts\/([^\)]+)\)/g)].map(match=>match[1]))];
    const urls=new Map(await Promise.all(names.map(async name=>[name,await files.getUrl('template-assets/fonts/'+name)])));
    addStyle(mathCss.replace(/url\(fonts\/([^\)]+)\)/g,(_,name)=>`url(${JSON.stringify(urls.get(name))})`));
    addStyle(css);
    store=await connectPracticeStore(window.tiana,(message,failed=false)=>{
      const label=root.querySelector('#cloud-status'),retry=root.querySelector('#cloud-retry');
      if(label){label.textContent=' '+message;label.dataset.state=failed?'error':'ready';}
      if(retry)retry.hidden=!failed;
    });
    root.innerHTML=body;
    window.katex=katex;
    root.querySelector('#cloud-retry').addEventListener('click',()=>store.retry().catch(()=>{root.querySelector('#cloud-status').textContent='暂时无法核对保存，请稍后重试。';}));
    startPractice(store);
    window.addEventListener('beforeunload',beforeUnload);
  } catch(error) {
    root.innerHTML='';
    const message=document.createElement('p');message.setAttribute('role','alert');message.textContent='无法打开练习：'+error.message+'。请稍后重新打开。';root.append(message);
  }
  return ()=>{styles.forEach(el=>el.remove());window.removeEventListener('beforeunload',beforeUnload);};
}
