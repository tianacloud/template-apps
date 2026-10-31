import { createTianaFetch } from '@tianacloud/serverless';

export type Statement = { sql: string; args?: (string | number | null)[] };
type Cell = { type: string; value?: string | number };
export type Row = Record<string, string | number | null>;
type Result = { cols: { name: string }[]; rows: Cell[][]; affected_row_count: number };
export class DatabaseError extends Error {
  constructor(message: string, public certainty: 'REJECTED' | 'UNKNOWN', public code = '') { super(message); }
}
declare global {
  interface Window {
    tiana?: { appId?: string; auth: { getAccessToken: (...args: any[]) => Promise<string> };
      connection: () => Promise<{ origin: string; sql_api: string; instance_id?: string }> };
  }
}
let channel: Promise<{ origin: string; fetch: ReturnType<typeof createTianaFetch> }> | undefined;
async function connection() {
  if (!window.tiana?.auth || typeof window.tiana.connection !== 'function')
    throw new DatabaseError('账号连接未就绪，请在 Tiana 应用中打开。', 'REJECTED');
  if (!channel) channel = window.tiana.connection().then(metadata => {
    if (metadata.sql_api !== 'hrana-v3') throw new DatabaseError('当前数据库不支持所需的参数化事务。', 'REJECTED');
    return { origin: metadata.origin, fetch: createTianaFetch({ origin: metadata.origin, auth: window.tiana!.auth, requestBodyMode: 'buffered' }) };
  }).catch(error => { channel = undefined; throw error; });
  return channel;
}
export function arg(value: string | number | null) {
  if (value === null) return { type: 'null' };
  if (typeof value === 'number') return Number.isInteger(value) ? { type: 'integer', value: String(value) } : { type: 'float', value };
  return { type: 'text', value };
}
export function transactionSteps(statements: Statement[], write: boolean) {
  const all = [{ sql: 'PRAGMA foreign_keys=ON' }, { sql: write ? 'BEGIN IMMEDIATE' : 'BEGIN' }, ...statements, { sql: 'COMMIT' }];
  const steps: any[] = all.map((stmt, i) => ({
    ...(i ? { condition: { type: 'ok', step: i - 1 } } : {}),
    stmt: { sql: stmt.sql, args: ('args' in stmt ? stmt.args ?? [] : []).map(arg), want_rows: true },
  }));
  steps.push({ condition: { type: 'not', cond: { type: 'is_autocommit' } }, stmt: { sql: 'ROLLBACK', args: [], want_rows: false } });
  return steps;
}
function decode(result: Result): Row[] {
  return (result.rows ?? []).map(row => Object.fromEntries(result.cols.map((c, i) => [c.name, row[i]?.type === 'null' ? null : row[i]?.value ?? null])));
}
function describe(code: string, message: string): string {
  if (message.includes('facts_revision')) return '另一台设备已更新记录。当前输入已保留，请核实最新记录后保存。';
  if (message.includes('ZH_PERIOD_OVERLAP') || message.includes('start_date')) return '经期日期重叠，请调整范围。';
  if (code.includes('CONSTRAINT')) return '记录不符合保存规则，请检查日期和字段。';
  return '数据库未完成保存，当前输入已保留。';
}
export async function transaction(statements: Statement[], write = false): Promise<Row[][]> {
  const transport = await connection(), steps = transactionSteps(statements, write);
  let response: Response;
  let body: any;
  try {
    response = await transport.fetch(`${transport.origin}/v3/pipeline`, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requests: [{ type: 'batch', batch: { steps } }, { type: 'close' }] }) });
    if (!response.ok) throw new Error('HTTP');
    body = await response.json();
  } catch { throw new DatabaseError('保存结果暂时无法确认，请保留输入并核实云端记录。', 'UNKNOWN'); }
  const first = body.results?.[0];
  if (first?.type !== 'ok' || first.response?.type !== 'batch') throw new DatabaseError('数据库结果未确认。', 'UNKNOWN');
  const batch = first.response.result;
  if (!batch || !Array.isArray(batch.step_results) || !Array.isArray(batch.step_errors)) throw new DatabaseError('事务结果未确认。', 'UNKNOWN');
  const commitIndex = steps.length - 2;
  if (batch.step_results[commitIndex]) return statements.map((_, i) => decode(batch.step_results[i + 2]));
  const failed = batch.step_errors.find((error: any) => error !== null);
  const rolledBack = !!batch.step_results[steps.length - 1];
  const notStarted = !!batch.step_errors[0] || !!batch.step_errors[1];
  if (failed && (rolledBack || notStarted)) throw new DatabaseError(describe(failed.code ?? '', failed.message ?? ''), 'REJECTED', failed.code);
  throw new DatabaseError('事务结果未确认，请核实云端记录。', 'UNKNOWN');
}
export function revisionGuard(revision: number, writeId?: string): Statement {
  return writeId ? { sql: 'UPDATE zhiji_state SET facts_revision=CASE WHEN facts_revision=? THEN facts_revision+1 ELSE NULL END, last_write_id=? WHERE id=1', args: [revision, writeId] }
    : { sql: 'UPDATE zhiji_state SET facts_revision=CASE WHEN facts_revision=? THEN facts_revision ELSE NULL END WHERE id=1', args: [revision] };
}
export const finalRelations: Statement = { sql: `UPDATE zhiji_state SET facts_revision=NULL WHERE id=1 AND (
  EXISTS(SELECT 1 FROM zhiji_daily_logs d WHERE d.bleeding_type='MENSTRUATION' AND NOT EXISTS(SELECT 1 FROM zhiji_periods p WHERE p.start_date<=d.date AND (p.end_date IS NULL OR p.end_date>=d.date)))
  OR EXISTS(SELECT 1 FROM zhiji_daily_logs d JOIN zhiji_periods p ON p.start_date<=d.date AND (p.end_date IS NULL OR p.end_date>=d.date) WHERE d.bleeding_type IN ('SPOTTING','UNKNOWN'))
  OR EXISTS(SELECT 1 FROM zhiji_absence_confirmations a JOIN zhiji_periods p ON p.id=a.anchor_period_id WHERE a.through_date<p.start_date OR EXISTS(SELECT 1 FROM zhiji_periods n WHERE n.start_date>p.start_date AND n.start_date<=a.through_date))
)` };
