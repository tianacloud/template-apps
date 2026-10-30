import './style.css';
import { connectStore } from './database.js';
import { mountHandbook } from './view.js';

export async function mount(root, { files }) {
  const stylesheet = document.createElement('link'); stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('./app.css', import.meta.url).href; document.head.append(stylesheet);
  try {
    const store = await connectStore(window.tiana);
    const unmount = await mountHandbook(root, { store, files });
    return () => { unmount(); stylesheet.remove(); };
  } catch {
    root.replaceChildren();
    const panel = document.createElement('main'); panel.className = 'connection-error';
    const title = document.createElement('h1'); title.textContent = '暂时无法打开手册';
    const text = document.createElement('p'); text.textContent = '请稍后重新打开，或完成登录后继续。';
    const retry = document.createElement('button'); retry.textContent = '重新打开'; retry.addEventListener('click', () => location.reload());
    panel.append(title, text, retry); root.append(panel);
    return () => stylesheet.remove();
  }
}
