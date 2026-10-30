import { createApp } from 'vue';
import App from './App.vue';
import { makeRouter } from './router.js';
import { start } from './store.js';
import { configureFiles } from './files.js';
import './style.css';

export async function mount(root, { files }) {
  configureFiles(files);
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = new URL('./app.css', import.meta.url).href;
  document.head.append(link);
  try {
    const response = await files.get('template-assets/fonts/zcool-xiaowei.ttf');
    if (!response.ok) throw new Error('字体文件读取失败');
    const face = new FontFace('ZCOOL XiaoWei', await response.arrayBuffer());
    document.fonts.add(await face.load());
  } catch (error) { console.error('字体暂时无法读取', error); }
  document.title = '大兜力量池';
  const app = createApp(App).use(makeRouter());
  app.mount(root); await start();
  return () => { app.unmount(); link.remove(); };
}
