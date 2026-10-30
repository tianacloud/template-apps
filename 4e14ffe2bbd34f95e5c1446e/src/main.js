import './style.css';
import body from './body.html?raw';
const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./app.css',import.meta.url).href;document.head.append(link);
document.body.innerHTML=body;
import('./original-ui.js');
