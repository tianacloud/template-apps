import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { decodeRequestFrameBytes, encodeResponseFrameBytes } from '../../node_modules/@tianacloud/serverless/dist/codec.js';

export function createFixture() {
  const db = new DatabaseSync(':memory:'); db.exec(readFileSync(new URL('../../schema.sql',import.meta.url),'utf8'));
  const calls: { sql: string; args: unknown[] }[] = [];
  let failure: 'before' | 'after' | 'read' | null = null, resume: (() => void) | null = null;
  let pause: { started: () => void; wait: Promise<void> } | null = null;
  function statement(stmt: any) {
    const args = (stmt.args ?? []).map((a: any) => a.type === 'null' ? null : a.type === 'integer' ? Number(a.value) : a.value);
    calls.push({ sql: stmt.sql,args });
    const query = db.prepare(stmt.sql), columns = query.columns();
    const rows = columns.length ? query.all(...args) : [];
    const changed = columns.length ? 0 : Number(query.run(...args).changes);
    return { cols: columns.map(c => ({ name: c.name,decltype: null })),rows: rows.map(row => columns.map(c => {
      const value = row[c.name]; return value === null ? { type: 'null' } : typeof value === 'number' ? Number.isInteger(value) ? { type: 'integer',value: String(value) } : { type: 'float',value } : { type: 'text',value: String(value) };
    })),affected_row_count: changed,last_insert_rowid: null };
  }
  function condition(c: any, results: any[], errors: any[]): boolean {
    if (!c) return true;
    if (c.type === 'ok') return !!results[c.step];
    if (c.type === 'error') return !!errors[c.step];
    if (c.type === 'not') return !condition(c.cond,results,errors);
    if (c.type === 'is_autocommit') return !db.isTransaction;
    throw new Error('Unsupported fixture condition');
  }
  async function handle(frame: Buffer | Uint8Array) {
    const request = decodeRequestFrameBytes(new Uint8Array(frame));
    const pipeline = JSON.parse(new TextDecoder().decode(request.body));
    const write = pipeline.requests[0]?.batch?.steps?.some((s: any) => s.stmt.sql === 'BEGIN IMMEDIATE');
    if (write && pause) { const p = pause; pause = null; p.started(); await p.wait; }
    if ((failure === 'before' && write) || (failure === 'read' && !write)) { failure = null; throw new Error('Fixture connection lost'); }
    const results = pipeline.requests.map((operation: any) => {
      if (operation.type === 'close') return { type: 'ok',response: { type: 'close' } };
      const step_results: any[] = [], step_errors: any[] = [];
      for (const step of operation.batch.steps) {
        if (!condition(step.condition,step_results,step_errors)) { step_results.push(null); step_errors.push(null); continue; }
        try { step_results.push(statement(step.stmt)); step_errors.push(null); }
        catch (error) { step_results.push(null); step_errors.push({ code: 'SQLITE_CONSTRAINT',message: (error as Error).message }); }
      }
      return { type: 'ok',response: { type: 'batch',result: { step_results,step_errors } } };
    });
    if (failure === 'after' && write) { failure = null; throw new Error('Fixture response lost after commit'); }
    const body = Buffer.from(JSON.stringify({ results }));
    return encodeResponseFrameBytes({ metadata_version: 1,request_id: request.metadata.request_id,status: 200,status_text: 'OK',
      headers: [{ name: 'content-type',value: 'application/json' },{ name: 'content-length',value: String(body.length) }],body_length: body.length },body);
  }
  return { db,calls,handle,failNext: (when: typeof failure) => { failure = when; },
    pauseNextWrite() { let started!: () => void; const signal = new Promise<void>(r => started = r); const wait = new Promise<void>(r => resume = r); pause = { started,wait }; return { started: signal,resume: () => resume?.() }; },
    close: () => db.close() };
}
