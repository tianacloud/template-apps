const base = new URL('./site/', import.meta.url);
const allowed = /^(?:index|games\/(?:2048|watermelon|minesweeper|sudoku|sokoban|memory|tetris|snake|whack|brick|linklink|match3|klotski|slide|gomoku))\.html$/;
let path = decodeURIComponent(location.hash.slice(1)) || 'index.html';
if (!allowed.test(path)) path = 'index.html';
const response = await fetch(new URL(path, base));
if (!response.ok) throw new Error('页面加载失败');
const page = new DOMParser().parseFromString(await response.text(), 'text/html');
document.title = page.title;
document.documentElement.setAttribute('data-theme', page.documentElement.getAttribute('data-theme') || 'light');
const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('assets/style.css', base); document.head.append(css);
for (const style of page.head.querySelectorAll('style')) document.head.append(style.cloneNode(true));
const app = document.getElementById('app'); app.replaceChildren(...Array.from(page.body.childNodes).filter(n => n.nodeName !== 'SCRIPT'));
document.addEventListener('click', event => {
  const a = event.target.closest('a[href]'); if (!a) return;
  const href = a.getAttribute('href');
  let target = href === '../index.html' || href === 'index.html' ? 'index.html' : href;
  if (allowed.test(target)) { event.preventDefault(); if (location.hash === '#'+target) location.reload(); else location.hash = target; }
}, true);
window.addEventListener('hashchange', () => location.reload());
for (const item of page.body.querySelectorAll('script[src]')) {
  const path = item.getAttribute('src').replace(/^\.\.\//,'');
  await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(path,base);script.onload=resolve;script.onerror=reject;document.body.append(script);});
}
