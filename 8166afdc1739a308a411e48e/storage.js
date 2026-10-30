import { createTianaFetch } from '@tianacloud/serverless';
let execute;
let queue = Promise.resolve();
let failed = false;
function fail(error) {
  failed = true;
  console.error('云端保存未确认', error);
  const notice = document.createElement('div');
  notice.setAttribute('role', 'alert');
  notice.style.cssText = 'position:fixed;z-index:9999;inset:0;background:#fff;padding:2rem;color:#333';
  notice.textContent = '云端保存未确认，请检查网络后重新打开应用并核对进度。';
  document.body.appendChild(notice);
}
async function connect() {
  if (!window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw new Error('运行环境未就绪');
  const c = await window.tiana.connection();
  if (c.sql_api !== 'hrana-v3') throw new Error('不支持的数据库协议');
  const request = createTianaFetch({ origin: c.origin, auth: window.tiana.auth, requestBodyMode: 'buffered' });
  execute = async (sql, args = []) => {
    const response = await request(`${c.origin}/v3/pipeline`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]}) });
    if (!response.ok) throw new Error('数据库请求失败');
    const body = await response.json(), statement = body.results?.[0];
    if (statement?.type !== 'ok' || statement.response?.type !== 'execute') throw new Error('数据库结果未确认');
    return statement.response.result;
  };
}
window.progressStore = {
  async load() { await connect(); const result = await execute('SELECT data FROM progress WHERE id = 1'); return result.rows?.[0]?.[0]?.value || null; },
  save(data) {
    if (failed) return;
    queue = queue.then(() => { if (!failed) return execute('INSERT INTO progress (id,data) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [{type:'text',value:data}]); }).catch(fail);
  }
};
