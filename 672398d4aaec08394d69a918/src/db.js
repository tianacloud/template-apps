import { createTianaFetch } from '@tianacloud/serverless';

const arg = (value) => {
  if (value === null || value === undefined) return { type: 'null' };
  if (Number.isInteger(value)) return { type: 'integer', value: String(value) };
  if (typeof value === 'number') return { type: 'float', value };
  return { type: 'text', value: String(value) };
};

// 传输层只建立一次：每次调用都新建 createTianaFetch 会重复换取令牌，
// 连续写入时容易拿到失效凭证。
let transport;

function channel() {
  if (!transport) {
    transport = (async () => {
      const auth = window.tiana?.auth;
      if (typeof auth?.getAccessToken !== 'function') throw new Error('Tiana 账号鉴权未就绪，请重新登录');
      const connection = await window.tiana.connection();
      if (connection.sql_api !== 'hrana-v3') throw new Error('当前数据库连接不支持此应用');
      return {
        origin: connection.origin,
        fetch: createTianaFetch({ origin: connection.origin, auth, requestBodyMode: 'buffered' }),
      };
    })().catch((error) => { transport = undefined; throw error; });
  }
  return transport;
}

export async function sql(statement, values = []) {
  const conn = await channel();
  const response = await conn.fetch(`${conn.origin}/v3/pipeline`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ requests: [
      { type: 'execute', stmt: { sql: statement, args: values.map(arg), want_rows: true } },
      { type: 'close' },
    ] }),
  });
  if (!response.ok) throw new Error(`数据库操作未完成（HTTP ${response.status}），请刷新查看当前数据`);
  const body = await response.json();
  const first = body.results?.[0];
  if (first?.type === 'error') throw new Error('数据库拒绝了本次操作，请检查输入内容');
  if (first?.type !== 'ok' || first.response?.type !== 'execute' || !first.response.result) {
    throw new Error('数据库操作结果未知，请刷新查看当前数据');
  }
  const result = first.response.result;
  return {
    rows: (result.rows || []).map((row) => Object.fromEntries(
      result.cols.map((column, index) => [column.name, row[index]?.value ?? null]),
    )),
    affectedRows: Number(result.affected_row_count || 0),
  };
}

export const rows = async (statement, values) => (await sql(statement, values)).rows;
export const one = async (statement, values) => (await rows(statement, values))[0] ?? null;
export const run = async (statement, values) => (await sql(statement, values)).affectedRows;

export function newId(prefix = 'id') {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `${prefix}_${[...bytes].map((b) => b.toString(36).padStart(2, '0')).join('')}`;
}

export const nowIso = () => new Date().toISOString();
