const css=document.createElement('link'); css.rel='stylesheet'; css.href=new URL('./app.css',import.meta.url).href; document.head.appendChild(css);
import './styles.css';
const root=document.getElementById('app');
root.outerHTML=`<div id="app" hidden><header id="appBar" class="app-bar"></header><main id="view" class="view"></main><nav id="tabBar" class="tab-bar"></nav></div><div id="overlayRoot"></div><div id="toastRoot" class="toast-root"></div><div id="boot" class="boot"><p class="boot-name">奶绿家今天的饭</p><p id="bootMsg" class="boot-msg">正在准备今天的菜单…</p></div>`;
import('./app.js');
