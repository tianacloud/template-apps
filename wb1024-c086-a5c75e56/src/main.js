import './style.css';
import markup from './markup.js';
import { sql } from './db.js';
import { start } from './play.js';
const link = document.createElement('link');
link.rel = 'stylesheet'; link.href = new URL('./app.css', import.meta.url).href; document.head.appendChild(link);
const root = document.querySelector('#app');
root.textContent = '正在准备学习乐园…';
try {
  const rows = (await sql('SELECT value FROM learning_state WHERE id = ?', ['main'])).rows;
  window.__learningState = rows[0]?.value || '';
  let pending = null, writing = false, stopped = false;
  const persist = async () => {
    if (writing || stopped) return;
    writing = true;
    while (pending !== null) {
      const value = pending; pending = null;
      try {
        await sql('INSERT INTO learning_state (id,value) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value', ['main', value]);
      } catch (error) {
        try { const current = (await sql('SELECT value FROM learning_state WHERE id = ?', ['main'])).rows[0]?.value; if (current === value) continue; } catch {}
        stopped = true;
        const notice = document.createElement('div'); notice.textContent = '保存状态未能确认，请检查网络后重新打开。';
        notice.style.cssText = 'position:fixed;z-index:99999;bottom:0;background:#fff0d1;color:#573;padding:12px;width:100%'; document.body.appendChild(notice);
      }
    }
    writing = false;
  };
  window.__saveLearningState = value => { pending = value; void persist(); };
  root.innerHTML = markup;
  start();
} catch (error) {
  root.textContent = '无法连接学习进度，请检查网络并重新打开。';
}
