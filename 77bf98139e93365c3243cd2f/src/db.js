import { createTianaFetch } from '@tianacloud/serverless';
let client;
async function execute(sql, args = []) {
  if (!client) {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('登录服务未就绪');
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3') throw Error('当前数据库协议不支持安全参数化');
    client = { c, fetch: createTianaFetch({ origin: c.origin, auth: window.tiana.auth, requestBodyMode: 'buffered' }) };
  }
  const response = await client.fetch(`${client.c.origin}/v3/pipeline`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]}) });
  if (!response.ok) throw Error('数据库响应未确认');
  const result = (await response.json()).results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
  return result.response.result;
}
export async function loadSave() {
  const result = await execute('SELECT data FROM racer_save WHERE id = 1');
  return result.rows?.[0]?.[0]?.value ?? null;
}
let pending = Promise.resolve(), failed = false;
export function queueSave(data) {
  pending = pending.then(async () => {
    if (failed) return;
    try { await execute('INSERT INTO racer_save (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data', [{type:'text',value:data}]); }
    catch (error) { failed = true; const notice = document.createElement('div'); notice.textContent = '存档保存结果未确认，请刷新核对后再继续。'; notice.style.cssText = 'position:fixed;z-index:999999;top:0;left:0;right:0;background:#9b1c1c;color:white;padding:12px;text-align:center'; document.body.appendChild(notice); }
  });
}
