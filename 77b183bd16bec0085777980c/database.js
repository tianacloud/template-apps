import { createTianaFetch } from '@tianacloud/serverless';
let client;
async function execute(sql, args = []) {
  if (!client) {
    const auth = window.tiana?.auth;
    if (typeof auth?.getAccessToken !== 'function') throw new Error('账号连接未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('数据库协议不支持参数化保存');
    client = { origin: connection.origin, fetch: createTianaFetch({origin: connection.origin, auth, requestBodyMode: 'buffered'}) };
  }
  const response = await client.fetch(`${client.origin}/v3/pipeline`, {
    method: 'POST', headers: {'content-type': 'application/json'},
    body: JSON.stringify({requests: [{type: 'execute', stmt: {sql, args, want_rows: true}}, {type: 'close'}]})
  });
  if (!response.ok) throw new Error('数据库请求未确认');
  const body = await response.json(), item = body.results?.[0];
  if (item?.type !== 'ok' || item.response?.type !== 'execute') throw new Error('数据库操作未确认');
  return item.response.result;
}
export const wordDatabase = {
  async read() {
    const r = await execute('SELECT data, revision FROM word_progress WHERE id = 1');
    if (!r.rows?.length) return null;
    return Object.fromEntries(r.cols.map((c, i) => [c.name, r.rows[0][i]?.value ?? null]));
  },
  async save(data, revision) {
    const r = await execute('UPDATE word_progress SET data = ?, revision = revision + 1 WHERE id = 1 AND revision = ?', [
      {type:'text', value:data}, {type:'integer', value:String(revision)}
    ]);
    return Number(r.affected_row_count) === 1;
  }
};
