import { createTianaFetch } from '@tianacloud/serverless';
export async function openProgress() {
  const auth = window.tiana?.auth;
  if (typeof auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw Error('账号连接未就绪');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw Error('数据库协议不支持');
  const request = createTianaFetch({ origin: connection.origin, auth, requestBodyMode: 'buffered' });
  async function sql(query, args = []) {
    const response = await request(connection.origin + '/v3/pipeline', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql: query, args, want_rows: true } }, { type: 'close' }] }) });
    if (!response.ok) throw Error('数据库响应未确认');
    const result = (await response.json()).results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
    return result.response.result;
  }
  const result = await sql('SELECT data FROM mouse_progress WHERE id = 1');
  const initial = result.rows?.length ? JSON.parse(result.rows[0][0].value) : null;
  let queue = Promise.resolve();
  function save(value) {
    queue = queue.then(() => sql('INSERT INTO mouse_progress (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [{ type: 'text', value }]));
    queue.catch(() => { const m = document.getElementById('storage-status'); if (m) { m.hidden = false; m.textContent = '保存结果未确认，请重新打开应用核对记录。'; } });
  }
  return { initial, save };
}
