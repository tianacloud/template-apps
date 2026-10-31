import { createTianaFetch } from '@tianacloud/serverless';

export async function openStorage() {
  if (typeof window.tiana?.auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw Error('应用数据库连接尚未就绪，请重新打开应用。');
  const conn = await window.tiana.connection();
  if (conn.sql_api !== 'hrana-v3') throw Error('当前数据库连接协议暂不支持，请联系管理员。');
  const fetchSql = createTianaFetch({origin: conn.origin, auth: window.tiana.auth, requestBodyMode: 'buffered'});
  async function query(sql, args = []) {
    const response = await fetchSql(`${conn.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库请求未完成，结果可能未知。');
    const body = await response.json(); const statement = body.results?.[0];
    if (statement?.type !== 'ok' || statement.response?.type !== 'execute') throw Error('数据库操作未确认。');
    return statement.response.result;
  }
  const loaded = await query('SELECT revision, payload FROM ledger_state WHERE id = 1');
  let revision = loaded.rows?.length ? Number(loaded.rows[0][0].value) : 0;
  let values = loaded.rows?.length ? JSON.parse(loaded.rows[0][1].value) : {};
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw Error('数据库记录格式有误。');
  let scheduled = false, failed = false, generation = 0;
  const mask = document.createElement('div');
  mask.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;padding:24px;color:white;text-align:center;font:16px sans-serif';
  document.body.appendChild(mask);
  async function flush() {
    const savedGeneration = generation;
    const payload = JSON.stringify(values), next = revision + 1;
    try {
      let result;
      if (revision === 0) result = await query('INSERT INTO ledger_state(id, revision, payload) VALUES(1, ?, ?) ON CONFLICT(id) DO NOTHING', [{type:'integer',value:String(next)},{type:'text',value:payload}]);
      else result = await query('UPDATE ledger_state SET revision = ?, payload = ? WHERE id = 1 AND revision = ?', [{type:'integer',value:String(next)},{type:'text',value:payload},{type:'integer',value:String(revision)}]);
      if (Number(result.affected_row_count) !== 1) throw Error('记录已在其他页面更改。');
      revision = next;
      if (generation !== savedGeneration) { await flush(); return; }
      scheduled = false; mask.style.display = 'none';
    } catch (error) {
      failed = true; scheduled = false;
      mask.textContent = '保存未确认或记录已被其他页面更改。请重新打开应用并核对数据，避免重复操作。';
    }
  }
  return {
    get(key) { return values[key] ?? null; },
    set(key, value) {
      if (failed) throw Error('保存未确认');
      values[key] = value; generation++;
      mask.textContent = '正在保存…'; mask.style.display = 'flex';
      if (!scheduled) { scheduled = true; queueMicrotask(flush); }
    }
  };
}
