import './storage.js';
import html from './ui.html';
import css from './public/styles.css';
export async function mount(root, {files}) {
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  root.innerHTML = html;
  window.loadBank = async name => {
    const response = await files.get('template-assets/bank/' + name + '.json');
    if (!response.ok) throw new Error('题库读取失败');
    return response.json();
  };
  try {
    const content = await files.get('template-assets/content.json');
    if (!content.ok) throw new Error('学习内容读取失败');
    window.APP_DATA = await content.json();
    await import('./public/data.js');
    await import('./public/app.js');
    await import('./public/mathbank.js');
    await import('./public/chinabank.js');
    await import('./public/engbank.js');
    await import('./public/modules.js');
    await import('./public/pet.js');
    const [math, cn, en] = await Promise.all(['catalog','cn-catalog','en-catalog'].map(window.loadBank));
    window.MATH_BANK_CATALOG = math; window.CN_BANK_CATALOG = cn; window.EN_BANK_CATALOG = en;
    await window.APP.init();
  } catch (error) { console.error(error); root.innerHTML = '<p role="alert">无法读取云端数据或题库，请检查网络和登录状态后重新打开。</p>'; }
}
