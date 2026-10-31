import { createTianaFetch } from '@tianacloud/serverless';
let client;
async function query(sql, values = []) {
  if (!client) {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw new Error('请在已登录的应用中连接数据库');
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3') throw new Error('当前数据库协议不支持课程保存');
    client = { c, fetch: createTianaFetch({ origin: c.origin, auth: window.tiana.auth, requestBodyMode: 'buffered' }) };
  }
  const response = await client.fetch(`${client.c.origin}/v3/pipeline`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql, args: values.map(value => ({type:'text', value:String(value)})), want_rows: true } }, { type:'close' }] }) });
  if (!response.ok) throw new Error('数据库响应未确认，请重新打开后核对');
  const body = await response.json();
  const statement = body.results?.[0];
  if (statement?.type !== 'ok' || statement.response?.type !== 'execute') throw new Error('数据库操作未确认，请重新打开后核对');
  const result = statement.response.result;
  return (result.rows || []).map(row => Object.fromEntries(result.cols.map((col, i) => [col.name, row[i]?.value ?? null])));
}
window.lessonDB = {
  async load() { return (await query('SELECT content, revision FROM lesson_draft WHERE id = 1'))[0] || null; },
  async save(content, revision) {
    const rows = revision === null ? await query('INSERT INTO lesson_draft (id, content, revision) VALUES (1, ?, 1) ON CONFLICT(id) DO NOTHING RETURNING revision', [content]) : await query('UPDATE lesson_draft SET content = ?, revision = revision + 1 WHERE id = 1 AND revision = CAST(? AS INTEGER) RETURNING revision', [content, revision]);
    if (!rows.length) throw new Error('课程已在其他页面修改，请导出当前内容并重新打开后核对');
    return rows[0].revision;
  }
};
