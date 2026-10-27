import css from './app.css?inline';
const style=document.createElement('style'); style.textContent=css; document.head.append(style);
import html from './index.html?raw';
import { init } from './app.js';
const body=html.match(/<body[^>]*>([\s\S]*?)<script type="module"/i)?.[1];
if(!body) throw new Error('页面资源不完整');
document.body.innerHTML=body;
init();
