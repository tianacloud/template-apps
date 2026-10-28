import {createTianaFetch} from '@tianacloud/serverless';
let channel;
const argument = value => Number.isSafeInteger(value)
  ? {type: 'integer', value: String(value)} : {type: 'text', value: String(value)};
async function connection() {
  if (!channel) channel = (async () => {
    const auth = window.tiana?.auth;
    if (typeof auth?.getAccessToken !== 'function') throw new Error('账号连接未就绪。');
    const metadata = await window.tiana.connection();
    if (metadata.sql_api !== 'hrana-v3') throw new Error('数据库连接未就绪。');
    return {origin: metadata.origin, fetch: createTianaFetch({origin: metadata.origin, auth, requestBodyMode: 'buffered'})};
  })().catch(error => { channel = undefined; throw error; });
  return channel;
}
export async function sql(statement, values = []) {
  const c = await connection();
  const response = await c.fetch(`${c.origin}/v3/pipeline`, {
    method: 'POST', headers: {'content-type': 'application/json'},
    body: JSON.stringify({requests: [
      {type: 'execute', stmt: {sql: statement, args: values.map(argument), want_rows: true}},
      {type: 'close'},
    ]}),
  });
  if (!response.ok) throw new Error('云端成绩响应未确认，请检查连接。');
  const body = await response.json(), first = body.results?.[0];
  if (first?.type !== 'ok' || first.response?.type !== 'execute' || !first.response.result)
    throw new Error('云端成绩读写未确认，请检查连接。');
  const result = first.response.result;
  return {rows: (result.rows || []).map(row => Object.fromEntries(result.cols.map((column, index) =>
    [column.name, row[index]?.type === 'null' ? null : row[index]?.value])))};
}
