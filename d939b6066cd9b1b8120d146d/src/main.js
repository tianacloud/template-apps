import css from './app.css?inline';
import html from './index.html?raw';
import { preferences } from './preferences.js';
const style=document.createElement('style'); style.textContent=css; document.head.append(style);
const body=html.match(/<body[^>]*>([\s\S]*?)<script type="module"/i)?.[1];
if(!body) throw new Error('页面资源不完整');
document.body.innerHTML=body;
try {
  await preferences.load();
  const { init } = await import('./app.js');
  init();
} catch (error) {
  document.body.textContent='设置加载失败，请检查连接并刷新页面。';
}
