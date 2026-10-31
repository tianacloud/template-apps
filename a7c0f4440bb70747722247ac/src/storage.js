import { createTianaFetch } from '@tianacloud/serverless';

let channel;
async function sql(statement, values = []) {
  if (!channel) {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw new Error('账号连接未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('当前数据库协议不受支持');
    channel = { origin: connection.origin, fetch: createTianaFetch({origin: connection.origin, auth: window.tiana.auth, requestBodyMode: 'buffered'}) };
  }
  const response = await channel.fetch(`${channel.origin}/v3/pipeline`, {
    method: 'POST', headers: {'content-type': 'application/json'},
    body: JSON.stringify({requests: [{type: 'execute', stmt: {sql: statement, args: values.map(value => ({type:'text',value})), want_rows: true}}, {type:'close'}]})
  });
  if (!response.ok) throw new Error('数据库响应未确认');
  const body = await response.json();
  const result = body.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute' || !result.response.result) throw new Error('数据库操作未确认');
  return result.response.result;
}
async function read() {
  const result = await sql('SELECT data FROM game_progress WHERE id = 1');
  return result.rows?.[0]?.[0]?.value ?? null;
}
let queue = Promise.resolve();
let failed = false;
window.gameStorage = {
  read,
  save(data) {
    queue = queue.then(async () => {
      if (failed) return;
      try {
        await sql('INSERT INTO game_progress (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data', [data]);
      } catch (error) {
        try { if (await read() === data) return; } catch (_) {}
        failed = true;
        document.getElementById('storage-status').textContent = '进度保存未确认，请检查连接并重新打开应用。';
        document.getElementById('storage-status').hidden = false;
      }
    });
  }
};
