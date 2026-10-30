import {openStore} from './cloud.js';
import {startApp} from './app.js';
import body from './body.js';
import css from './css.js';
export async function mount(root, context) {
  try {
    if (!context.files?.put || !context.files?.getUrl) throw Error('文件服务未就绪');
    const store=await openStore(message=>{const t=document.getElementById('toast');if(t){t.textContent=message;t.classList.add('on');}else alert(message);});
    const urls=new Map();
    const paths=new Set([...Object.keys(importedImages),...(store.initial.items||[]).map(item=>item.img).filter(Boolean)]);
    await Promise.all([...paths].map(async path=>urls.set(path,await context.files.getUrl(path))));
    root.innerHTML=body; const style=document.createElement('style');style.textContent=css;root.append(style);
    startApp(store,context.files,urls,store.initial);
    return ()=>style.remove();
  } catch(e){root.textContent='无法连接数据或文件服务：'+e.message+'。请检查连接后重新打开。';}
}
const importedImages=IMAGE_PATHS;
