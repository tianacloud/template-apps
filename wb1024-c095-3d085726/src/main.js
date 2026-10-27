import './app.css';
import './load-style.js';
import markup from './markup.html?raw';
import { sql } from './db.js';
import { createAtomicStore } from './atomic-store.js';
document.title = 'Custos';
document.getElementById('app').outerHTML = markup;
window.createTianaVaultAdapter = () => createAtomicStore(sql);
await import('./legacy.js');
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
