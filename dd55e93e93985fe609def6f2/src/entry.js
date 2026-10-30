import './styles.css';
const app = document.getElementById('app');
app.classList.add('app-shell');
app.hidden = true;
app.insertAdjacentHTML('beforebegin','<div id="app-loading" class="boot"><div class="boot-mark">客</div><p>正在载入门店数据…</p></div>');
app.insertAdjacentHTML('afterend','<div id="overlay-root"></div><div id="toast-root" class="toast-root"></div>');
await import('./main.js');
