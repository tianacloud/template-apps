import { createTianaFetch } from '@tianacloud/serverless';
export async function openStore() {
  const auth = window.tiana?.auth;
  if (typeof auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw new Error('云端存档服务不可用');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw new Error('当前数据库协议不支持存档');
  const send = createTianaFetch({origin: connection.origin, auth, requestBodyMode: 'buffered'});
  async function execute(sql, args = []) {
    const res = await send(`${connection.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if (!res.ok) throw new Error('数据库请求失败');
    const body = await res.json(), item = body.results?.[0];
    if (item?.type !== 'ok' || item.response?.type !== 'execute') throw new Error('数据库操作失败');
    return item.response.result;
  }
  const result = await execute('SELECT key, value FROM fishbox_store');
  const cache = Object.create(null);
  for (const row of result.rows) { try { cache[row[0].value] = JSON.parse(row[1].value); } catch {} }
  let pending = Promise.resolve();
  return {
    flush() { return pending; },
    get(key, fallback) { return Object.hasOwn(cache,key) ? cache[key] : fallback; },
    set(key, value) {
      cache[key] = JSON.parse(JSON.stringify(value));
      const json = JSON.stringify(value);
      pending = pending.then(() => execute('INSERT INTO fishbox_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [{type:'text',value:key},{type:'text',value:json}])).catch(error => { console.error('存档失败', error); const el=document.getElementById('storage-error'); if(el) el.hidden=false; });
    }
  };
}
