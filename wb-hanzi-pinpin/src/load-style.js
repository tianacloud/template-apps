// Bootstrap imports only the entry; the entry owns its stylesheets.
// 应用样式随构建产出到 assets/，字体样式与字体文件放在静态目录：Vite 库模式会
// 忽略 assetsInlineLimit，把 CSS 里 url() 引用的 98 个 woff2 全部内联成 base64，
// 因此字体样式必须由运行时 <link> 单独加载。
import { webRoot } from './web-root.js';

for (const href of ['assets/app.css', 'fonts.css']) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = webRoot() + href;
  document.head.append(link);
}
