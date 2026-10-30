import { createTianaFetch } from '@tianacloud/serverless';

// A write whose response was lost may still have committed: callers re-read before deciding.
export class DatabaseError extends Error {
  constructor(message, certainty) { super(message); this.certainty = certainty; }
}

let channel;
async function connection() {
  if (!window.tiana?.auth || typeof window.tiana.connection !== 'function')
    throw new DatabaseError('账号连接未就绪，请在 Tiana 应用中打开。', 'REJECTED');
  if (!channel) channel = window.tiana.connection().then(metadata => {
    if (metadata.sql_api !== 'hrana-v3') throw new DatabaseError('当前数据库不支持此应用。', 'REJECTED');
    return { origin: metadata.origin, fetch: createTianaFetch({ origin: metadata.origin, auth: window.tiana.auth, requestBodyMode: 'buffered' }) };
  }).catch(error => { channel = undefined; throw error; });
  return channel;
}

function arg(value) {
  if (value === null || value === undefined) return { type: 'null' };
  if (typeof value === 'number') return Number.isInteger(value) ? { type: 'integer', value: String(value) } : { type: 'float', value };
  return { type: 'text', value: String(value) };
}

function decode(result) {
  return (result.rows ?? []).map(row => Object.fromEntries(result.cols.map((col, i) => {
    const cell = row[i];
    if (!cell || cell.type === 'null') return [col.name, null];
    return [col.name, cell.type === 'integer' ? Number(cell.value) : cell.value];
  })));
}

// Runs statements as one transaction; returns each statement's rows.
export async function transaction(statements, write = true) {
  const all = [{ sql: write ? 'BEGIN IMMEDIATE' : 'BEGIN' }, ...statements, { sql: 'COMMIT' }];
  const steps = all.map((stmt, i) => ({
    ...(i ? { condition: { type: 'ok', step: i - 1 } } : {}),
    stmt: { sql: stmt.sql, args: (stmt.args ?? []).map(arg), want_rows: true },
  }));
  steps.push({ condition: { type: 'not', cond: { type: 'is_autocommit' } }, stmt: { sql: 'ROLLBACK', args: [], want_rows: false } });
  const transport = await connection();
  let body;
  try {
    const response = await transport.fetch(`${transport.origin}/v3/pipeline`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requests: [{ type: 'batch', batch: { steps } }, { type: 'close' }] }),
    });
    if (!response.ok) throw new Error('HTTP');
    body = await response.json();
  } catch { throw new DatabaseError('保存结果暂时无法确认，请稍后刷新查看。', 'UNKNOWN'); }
  const first = body.results?.[0], batch = first?.response?.result;
  if (first?.type !== 'ok' || first.response?.type !== 'batch' || !Array.isArray(batch?.step_results))
    throw new DatabaseError('保存结果暂时无法确认，请稍后刷新查看。', 'UNKNOWN');
  if (batch.step_results[all.length - 1]) return statements.map((_, i) => decode(batch.step_results[i + 1]));
  const rolledBack = !!batch.step_results[all.length] || !!batch.step_errors?.[0];
  throw new DatabaseError(rolledBack ? '保存没有完成，请再试一次。' : '保存结果暂时无法确认，请稍后刷新查看。', rolledBack ? 'REJECTED' : 'UNKNOWN');
}
