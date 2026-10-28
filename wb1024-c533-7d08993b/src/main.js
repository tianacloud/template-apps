import "./style.css";
const css=document.createElement("link"); css.rel="stylesheet"; css.href=new URL("./app.css",import.meta.url).href; document.head.append(css);
import html from "./body.json";
document.title="装机购物单 · 工作台模板（可复制）";
window.__standaloneBody=html; window.__standaloneBase=new URL("../ssd/index.html",import.meta.url).href; window.__standaloneAssetBase=new URL("./",import.meta.url).href;
document.body.innerHTML = html.replaceAll("__SSD_URL__", new URL("../ssd/index.html", import.meta.url).href);
const script = document.createElement("script"); script.src = new URL("./" + "logic.js", import.meta.url).href; document.body.append(script);
