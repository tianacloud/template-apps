import { createTianaFetch } from '@tianacloud/serverless';
export async function openSave() {
  const auth = window.tiana?.auth;
  if (typeof auth?.getAccessToken !== 'function') throw new Error('账号连接未就绪，请重新登录。');
  const info = await window.tiana.connection();
  if (info.sql_api !== 'hrana-v3') throw new Error('当前数据库协议不受支持。');
  const fetchSql = createTianaFetch({origin: info.origin, auth, requestBodyMode: 'buffered'});
  async function sql(statement, args = []) {
    const response = await fetchSql(`${info.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw new Error('数据库响应未确认。');
    const result = (await response.json()).results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作未确认。');
    return result.response.result;
  }
  const result = await sql('SELECT data FROM game_save WHERE id = 1');
  let pending = Promise.resolve(), failed = false, last = result.rows?.[0]?.[0]?.value || null;
  return { data:last, save(data) {
    if (failed || data === last) return;
    last = data;
    pending = pending.then(async () => {
      if (failed) return;
      try { await sql('INSERT INTO game_save (id,data) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [{type:'text',value:data}]); }
      catch (e) { failed = true; const notice = document.createElement('div'); notice.setAttribute('role','alert'); notice.style.cssText='position:fixed;z-index:9999;top:0;left:0;right:0;background:#8a2525;color:white;padding:12px;text-align:center'; notice.textContent='存档结果暂时无法确认，请保持页面并检查网络；重新打开前请确认云端存档。'; document.body.append(notice); }
    });
  }};
}
