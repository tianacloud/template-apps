import './style.css';
import view from './view.html?raw';
import {db} from './adapter.js';
import {mountApp} from './app.js';
const css = new URL('./app.css', import.meta.url).href;
const link=document.createElement('link'); link.rel='stylesheet'; link.href=css; document.head.appendChild(link);
document.getElementById('app').innerHTML=view;
window.yabaoDb=db;
mountApp();
