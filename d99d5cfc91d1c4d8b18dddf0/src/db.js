import { createTianaFetch } from '@tianacloud/serverless';

let channel;
function arg(value) { return { type: 'text', value: String(value) }; }
async function connection() {
  if (!channel) channel = (async () => {
    const auth = window.tiana?.auth;
    if (typeof auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function')
      throw new Error('账号连接还没准备好，请重新登录后打开。');
    const metadata = await window.tiana.connection();
    if (metadata.sql_api !== 'hrana-v3') throw new Error('当前数据库连接不支持此应用。');
    return { origin: metadata.origin, fetch: createTianaFetch({ origin: metadata.origin, auth, requestBodyMode: 'buffered' }) };
  })().catch(error => { channel = undefined; throw error; });
  return channel;
}
export async function sql(statement, values = []) {
  const transport = await connection();
  const response = await transport.fetch(`${transport.origin}/v3/pipeline`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ requests: [
      { type: 'execute', stmt: { sql: statement, args: values.map(arg), want_rows: true } },
      { type: 'close' },
    ] }),
  });
  if (!response.ok) throw new Error('连接暂时中断了，请保留输入的内容。');
  const body = await response.json();
  const result = body.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute')
    throw new Error('这次操作没有完成，请检查连接后再试。');
  const data = result.response.result;
  return {
    rows: (data.rows ?? []).map(row => Object.fromEntries(data.cols.map((col, i) => [col.name, row[i]?.type === 'null' ? null : row[i]?.value]))),
    affected: Number(data.affected_row_count ?? 0),
  };
}
