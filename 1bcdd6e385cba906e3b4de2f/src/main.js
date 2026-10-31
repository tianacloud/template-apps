import './style.css';
import body from './body.html?raw';
import { createTianaFetch } from '@tianacloud/serverless';
import { makeUpdate } from './merge.js';
const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('./app.css', import.meta.url).href; document.head.appendChild(css);
export async function mount(root, { files }) {
 root.innerHTML = body;
 try {
 window.cet6Files = files;
 const index = await files.get('template-assets/vocabulary/index.json');
 if (!index.ok) throw new Error('词库索引读取失败');
 window.CET6_META = await index.json();
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3' || typeof window.tiana.auth?.getAccessToken !== 'function') throw new Error('数据库连接不可用');
  const fetchSql = createTianaFetch({origin: connection.origin, auth: window.tiana.auth, requestBodyMode: 'buffered'});
  async function execute(sql, args = []) {
    const response = await fetchSql(`${connection.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw new Error('数据库请求失败');
    const body = await response.json(); const result = body.results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作失败');
    return result.response.result;
  }
  let queue = Promise.resolve();
  let baseline = null;
  let failed = false;
  window.cet6Store = {
    async read() {
      const result = await execute('SELECT payload FROM progress WHERE id = 1');
      const value = result.rows?.[0]?.[0]?.value;
      baseline = value ? JSON.parse(value) : {archive:{}, favorites:{}, stats:{answered:0,correct:0,rounds:0}, theme:'light'};
      return value ? structuredClone(baseline) : null;
    },
    write(value) {
      const next = JSON.parse(value);
      const change = makeUpdate(baseline, next);
      baseline = structuredClone(next);
      if (!change) return queue;
      const operation = queue.then(() => {
        if (failed) throw new Error('保存状态不明，请重新加载后检查');
        return execute(change.sql, change.args);
      });
      queue = operation.catch(() => { failed = true; });
      return operation;
    }
  };
  await import('./app.js');
 } catch (e) { root.textContent = '无法加载词库或学习进度：' + e.message; throw e; }
}
