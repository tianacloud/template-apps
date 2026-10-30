import { mount } from './main';
import type { Runtime } from './storage';

const root = document.getElementById('app');
if (!root) throw new Error('应用容器未就绪');
const runtime = (window as Window & {tiana?: Runtime}).tiana;
if (!runtime) { root.textContent = 'Tiana 运行环境未就绪，请刷新重试。'; }
else { void mount(root, runtime).catch(() => { root.textContent = '应用启动失败，请刷新重试。'; }); }
