import './style.css';
const style = document.createElement('link'); style.rel='stylesheet'; style.href=new URL('./star-checkin.css', import.meta.url).href; document.head.appendChild(style);
import './database.js';
import './logic.js';
import './charts.js';
import './store.js';
document.body.insertAdjacentHTML('afterbegin','<div class="bg-deco"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span></div>');
document.body.insertAdjacentHTML('beforeend','<div id="modal-root"></div><div id="toast-root" class="toast-root"></div><div id="fx-root" class="fx-root"></div>');
await import('./app.js');
