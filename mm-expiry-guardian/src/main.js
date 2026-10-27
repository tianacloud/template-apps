import { initView } from './view.js';
import './style.css';
import './load-style.js';
import html from './view.html?raw';
document.title='蹬王之王';
document.body.innerHTML=html;
initView();
