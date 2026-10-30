import body from "./body.html?raw";
import "./styles.css";
document.title="营养计算器"; document.body.innerHTML=body;
const link=document.createElement("link");link.rel="stylesheet";link.href=new URL("./app.css",import.meta.url).href;document.head.appendChild(link);
await import("./app.js");
