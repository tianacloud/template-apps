import { openStore } from './store.js';
try { window.fishboxStore = await openStore(); } catch (error) { document.body.innerHTML = '<p role="alert">云端存档加载失败，请检查网络或登录后刷新页面。</p>'; throw error; }
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
document.addEventListener('click', async event => {
  const a = event.target.closest('a[href]'); if (!a) return;
  const href = a.getAttribute('href');
  let target = href === '../index.html' || href === 'index.html' ? 'index.html' : href;
  if (allowed.test(target)) { event.preventDefault(); await window.fishboxStore.flush(); if (location.hash === '#'+target) location.reload(); else location.hash = target; }
}, true);
window.addEventListener('hashchange', () => location.reload());
for (const item of page.body.querySelectorAll('script[src]')) {
  const path = item.getAttribute('src').replace(/^\.\.\//,'');
  await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(path,base);script.onload=resolve;script.onerror=reject;document.body.append(script);});
}

const warning = document.createElement('div'); warning.id='storage-error'; warning.hidden=true; warning.setAttribute('role','alert'); warning.textContent='云端存档失败，请检查网络并刷新核对记录。'; warning.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#a22;color:white;padding:12px;z-index:999999'; document.body.append(warning);
