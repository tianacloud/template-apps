import './style.css';
import body from './body.html?raw';
import { createTianaFetch } from '@tianacloud/serverless';
import './data-meta.js';
const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('./app.css', import.meta.url).href; document.head.appendChild(css);
document.getElementById('app').innerHTML = body;
async function setup() {
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
  window.cet6Store = {
    async read() { const result = await execute('SELECT payload FROM progress WHERE id = 1'); const value = result.rows?.[0]?.[0]?.value; return value ? JSON.parse(value) : null; },
    write(value) { const op = queue.then(() => execute('INSERT INTO progress (id,payload) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', [{type:'text',value}])); queue = op.catch(() => {}); return op; }
  };
  await import('./app.js');
}
setup().catch(e => { document.getElementById('app').textContent = '无法连接学习进度：' + e.message; });
