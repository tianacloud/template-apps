import "./style.css";
const css=document.createElement("link"); css.rel="stylesheet"; css.href=new URL("./app.css",import.meta.url).href; document.head.append(css);
import html from "./body.json";
document.title="装机购物单 · 工作台模板（可复制）";
window.__standaloneBody=html; window.__standaloneBase=new URL("../ssd/index.html",import.meta.url).href; window.__standaloneAssetBase=new URL("./",import.meta.url).href;
document.body.innerHTML = html.replaceAll("__SSD_URL__", new URL("../ssd/index.html", import.meta.url).href);
const script = document.createElement("script"); script.src = new URL("./" + "logic.js", import.meta.url).href; document.body.append(script);

const frame=document.querySelector('iframe[title="SSD 天梯榜"]');
const ssdBase=new URL('../ssd/',import.meta.url);
window.openSSD=async function(path='index.html') {
  const url=new URL(path,ssdBase);
  if(url.origin!==ssdBase.origin || !url.pathname.startsWith(ssdBase.pathname)) return;
  const response=await fetch(url); if(!response.ok) throw new Error('SSD 资源加载失败');
  const html=await response.text(); frame.dataset.url=url.href;
  frame.srcdoc=html.replace('<head>', '<head><base href="'+ssdBase.href+'">');
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
