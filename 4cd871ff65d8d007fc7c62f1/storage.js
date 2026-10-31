import { createTianaFetch } from '@tianacloud/serverless';
export async function openStorage() {
  const auth = window.tiana?.auth;
  if (typeof auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw new Error('云端认证不可用');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw new Error('数据库连接方式不支持');
  const request = createTianaFetch({origin: connection.origin, auth, requestBodyMode: 'buffered'});
  async function execute(sql, args = []) {
    const response = await request(`${connection.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw new Error('数据库请求未确认');
    const data = await response.json();
    if (data.results?.[0]?.type !== 'ok' || data.results[0].response?.type !== 'execute') throw new Error('数据库操作未确认');
    return data.results[0].response.result;
  }
  const result = await execute('SELECT key, value FROM learning_state');
  const values = new Map(result.rows.map(row => [row[0].value, row[1].value]));
  let pending = Promise.resolve(), failed = false, dirty = 0;
  function report() {
    if (failed) return;
    failed = true;
    const warning = document.createElement('div');
    warning.setAttribute('role','alert');
    warning.style.cssText = 'position:fixed;z-index:99999;inset:0 0 auto;background:#8b1c1c;color:white;padding:14px;text-align:center;font:16px sans-serif';
    warning.textContent = '云端保存未确认。请停止操作并重新打开应用核对学习记录。';
    document.body.append(warning);
  }
  window.addEventListener('beforeunload', e => { if (dirty || failed) { e.preventDefault(); e.returnValue = ''; } });
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      if (failed) return;
      value = String(value); values.set(key, value); dirty++;
      pending = pending.then(() => { if (failed) return; return execute('INSERT INTO learning_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [{type:'text',value:key},{type:'text',value}]); }).then(() => { dirty--; }).catch(report);
    },
    async flush() { await pending; if (failed) throw new Error('保存未确认'); }
  };
}
