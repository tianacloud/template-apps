const css=document.createElement("link"); css.rel="stylesheet"; css.href=new URL("./app.css",import.meta.url).href; document.head.append(css);
import "./style.css";
import body from "./body.html?raw";
import { cloud } from "./storage.js";
document.body.innerHTML=body;
window.wenmaiCloud=cloud;
import("./app.js");
