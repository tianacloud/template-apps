import './app.css';
import './load-style.js';
import markup from './markup.html?raw';
import { sql } from './db.js';
import { createAtomicStore } from './atomic-store.js';
export async function mount(root, { files }) {
  try {
    if (!files) throw new Error('文件服务不可用');
    await Promise.all([400, 600].map(async weight => {
      const response = await files.get(`template-assets/fonts/inter-${weight}.woff2`);
      if (!response.ok) throw new Error('字体读取失败');
      const font = new FontFace('Inter', await response.arrayBuffer(), {weight: String(weight)});
      document.fonts.add(await font.load());
    }));
  } catch (error) {
    root.textContent = '字体加载失败，请检查连接后刷新。';
    console.error(error);
    return;
  }
document.title = 'Custos';
root.outerHTML = markup;
window.createTianaVaultAdapter = () => createAtomicStore(sql);
const { startLegacy } = await import('./legacy.js');
startLegacy();
const actions = new Set(['triggerImport','openAddTodoModal','clearCompletedTodos','closeModal','openChangePasswordModal','openExternal','openCopyWholeCard','confirmDeleteCard','toggleEdit','cancelEdit','saveEdit','openNewCardTypePicker','doDeleteCard','openEncryptedCopyModal','doCopyFromModal','cancelImportPreview','exportCards','resetCards']);
document.addEventListener('click', event => {
  const el = event.target.closest('[data-custos-action]');
  if (!el || el.disabled) return;
  const expr = el.getAttribute('data-custos-action');
  const match = /^(?:window\.)?([A-Za-z]+)\((.*)\)$/.exec(expr);
  if (!match || !actions.has(match[1]) || typeof window[match[1]] !== 'function') return;
  const rest = match[2];
  if (rest && !/^'[^']*'(?:,\s*'[^']*')*$/.test(rest)) return;
  const args = [...rest.matchAll(/'([^']*)'/g)].map(x => decodeURIComponent(x[1]));
  window[match[1]](...args);
});

const mobileMenu=document.querySelector('#mobile-nav-toggle');
const sidebar=document.querySelector('.sidebar');
mobileMenu.addEventListener('click',()=>{const open=sidebar.classList.toggle('mobile-open');mobileMenu.setAttribute('aria-expanded',String(open));});
sidebar.addEventListener('click',e=>{if(e.target.closest('[data-nav]')){sidebar.classList.remove('mobile-open');mobileMenu.setAttribute('aria-expanded','false');}});
document.addEventListener('click',e=>{if(sidebar.classList.contains('mobile-open')&&!sidebar.contains(e.target)&&!mobileMenu.contains(e.target)){sidebar.classList.remove('mobile-open');mobileMenu.setAttribute('aria-expanded','false');}});

}
