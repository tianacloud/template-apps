import {loadState, saveState} from './platform.js';
import "./style.css";
const css=document.createElement("link"); css.rel="stylesheet"; css.href=new URL("./app.css",import.meta.url).href; document.head.append(css);
import html from "./body.json";
export async function mount(root, {files}) {
let state;
try { state = await loadState(); } catch (error) { root.textContent = '无法连接数据库，请检查登录和网络后重新打开。'; return; }
try { window.initialAppData = state.build ? JSON.parse(state.build) : null; } catch { root.textContent = '保存的数据无法读取，请检查数据库。'; return; }
window.saveAppState = saveState;
window.ssdPreferences = {basket:state.basket || '[]', mode:state.mode || 'rows'};
window.saveSSDPreference = (key, value) => { window.ssdPreferences[key] = value; saveState(key,value).catch(() => alert('保存结果未确认，请刷新核对')); };
window.__exportSSD = async () => {
  const paths = ['index.html','compare.html','detail.html','about.html','assets/css/style.css','assets/js/core.js','assets/js/chart.js','assets/js/home.js','assets/js/compare.js','assets/js/detail.js','assets/js/about.js'];
  const base = new URL('../ssd/', import.meta.url);
  const entries = await Promise.all(paths.map(async path => { const r = await fetch(new URL(path, base)); if (!r.ok) throw Error('无法读取 SSD 页面'); return [path, await r.text()]; }));
  for (const name of ['index.json','meta.json','shards.json']) { const r = await files.get('template-assets/ssd/' + name); if (!r.ok) throw Error('无法读取 SSD 数据'); entries.push(['data/' + name, await r.text()]); }
  return Object.fromEntries(entries);
};
window.readSSDAsset = path => {
  const name = path.replace(/^data\//, '');
  if (!['index.json','meta.json','shards.json'].includes(name)) throw Error('无效素材路径');
  return files.get('template-assets/ssd/' + name);
};
document.title="装机购物单 · 工作台模板（可复制）";
window.__standaloneBody=html; window.__standaloneBase=new URL("../ssd/index.html",import.meta.url).href; window.__standaloneAssetBase=new URL("./",import.meta.url).href;
root.innerHTML = html.replaceAll("__SSD_URL__", new URL("../ssd/index.html", import.meta.url).href);
const ssdLink = [...root.querySelectorAll('a[target="_blank"]')].find(a => a.textContent.includes('新窗口打开'));
if (ssdLink) { const target = new URL(window.location.href); target.hash = 'ssd'; ssdLink.href = target.href; }
const script = document.createElement("script"); script.src = new URL("./" + "logic.js", import.meta.url).href; root.append(script);

const frame=document.querySelector('iframe[title="SSD 天梯榜"]');
const ssdBase=new URL('../ssd/',import.meta.url);
window.openSSD=async function(path='index.html') {
  const url=new URL(path,ssdBase);
  if(url.origin!==ssdBase.origin || !url.pathname.startsWith(ssdBase.pathname)) return;
  const response=await fetch(url); if(!response.ok) throw new Error('SSD 资源加载失败');
  const html=await response.text(); frame.dataset.url=url.href;
  frame.srcdoc=html.replace(/(href|src)="(assets\/[^"]+)"/g, (_,attr,path) => attr + '="' + new URL(path, ssdBase).href + '"');
};
frame.addEventListener('load',()=>{
  if (!frame.srcdoc) return;
  frame.contentDocument.addEventListener('click',event=>{
    const link=event.target.closest('a[href]'); if(!link || link.target==='_blank') return;
    const url=new URL(link.getAttribute('href'),ssdBase);
    if(url.origin===ssdBase.origin && url.pathname.startsWith(ssdBase.pathname)) {event.preventDefault(); window.openSSD(url.href);}
  });
});
frame.removeAttribute('src'); window.openSSD();

return () => { script.remove(); root.replaceChildren(); };
}
