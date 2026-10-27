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
export async function verifiedWrite(write, read, matches) {
  try { return await write(); }
  catch (error) {
    let actual;
    try { actual = await read(); }
    catch { throw new Error('暂时无法确认是否保存成功。内容还在，请恢复连接后再试。'); }
    if (!matches(actual)) throw error;
  }
}
export const getQuestions = async () => (await sql('SELECT * FROM questions ORDER BY created_at, id')).rows;
export const getStats = async () => (await sql('SELECT COUNT(*) AS total, COUNT(DISTINCT local_day) AS nights FROM answers')).rows[0];
export async function saveAnswer(answer) {
  const keys = ['id', 'session_id', 'question_id', 'question_text', 'topic', 'audience', 'responder', 'content', 'local_day', 'created_at'];
  await verifiedWrite(
    () => sql(`INSERT INTO answers (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, keys.map(key => answer[key])),
    async () => (await sql('SELECT * FROM answers WHERE id = ?', [answer.id])).rows[0],
    actual => actual && keys.every(key => actual[key] === answer[key]),
  );
}
export async function saveQuestion(question, isNew) {
  await verifiedWrite(
    () => isNew
      ? sql('INSERT INTO questions (id, audience, topic, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [question.id, question.audience, question.topic, question.content, question.created_at, question.updated_at])
      : sql('UPDATE questions SET audience = ?, topic = ?, content = ?, updated_at = ? WHERE id = ?', [question.audience, question.topic, question.content, question.updated_at, question.id]),
    async () => (await sql('SELECT * FROM questions WHERE id = ?', [question.id])).rows[0],
    actual => actual && ['audience', 'topic', 'content', 'updated_at'].every(key => actual[key] === question[key]),
  );
}
export async function deleteQuestion(id) {
  await verifiedWrite(() => sql('DELETE FROM questions WHERE id = ?', [id]),
    async () => (await sql('SELECT id FROM questions WHERE id = ?', [id])).rows,
    actual => actual.length === 0);
}
export async function getHistory({ search, responder, page }) {
  const where = "WHERE (? = '' OR instr(lower(content), lower(?)) > 0 OR instr(lower(question_text), lower(?)) > 0) AND (? = '' OR responder = ?)";
  const args = [search, search, search, responder, responder];
  const [rows, count] = await Promise.all([
    sql(`SELECT * FROM answers ${where} ORDER BY created_at DESC, id DESC LIMIT 30 OFFSET ?`, [...args, String((page - 1) * 30)]),
    sql(`SELECT COUNT(*) AS total FROM answers ${where}`, args),
  ]);
  return { rows: rows.rows, total: Number(count.rows[0].total) };
}
