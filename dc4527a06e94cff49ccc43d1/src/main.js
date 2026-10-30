import './style.css';
import './food-images.js';
import view from './view.html?raw';
import {db} from './adapter.js';
import {loadStorage} from './storage.js';
import {mountApp} from './app.js';
const css = new URL('./app.css', import.meta.url).href;
const link=document.createElement('link'); link.rel='stylesheet'; link.href=css; document.head.appendChild(link);
export async function mount(root, context) {
async function start() {
  root.textContent = '正在连接数据…';
  try {
    if (!context.files) throw new Error('文件服务未就绪');
    const response = await context.files.get('template-assets/fonts/zcool.woff2');
    if (!response.ok) throw new Error('字体读取失败');
    const font = new FontFace('ZCOOL KuaiLe', await response.arrayBuffer());
    document.fonts.add(await font.load());
    window.appStorage = await loadStorage();
    root.innerHTML = view;
    const notice = document.createElement('div');
    notice.id = 'storage-error'; notice.setAttribute('role', 'alert');
    root.prepend(notice);
    window.yabaoDb = db;
    mountApp();
  } catch {
    root.textContent = '数据连接失败，请检查网络后重试。';
    const retry = document.createElement('button'); retry.textContent = '重试'; retry.onclick = start; root.appendChild(retry);
  }
}
await start();
}
