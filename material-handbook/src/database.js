import { createTianaFetch } from '@tianacloud/serverless';

export async function connectStore(runtime) {
  if (typeof runtime?.auth?.getAccessToken !== 'function') throw new Error('ACCOUNT_RUNTIME_UNAVAILABLE');
  const connection = await runtime.connection();
  if (connection.sql_api !== 'hrana-v3') throw new Error('SQL_PROTOCOL_UNSUPPORTED');
  const sqlFetch = createTianaFetch({ origin: connection.origin, auth: runtime.auth, requestBodyMode: 'buffered' });
  async function execute(sql, values = []) {
    const response = await sqlFetch(`${connection.origin}/v3/pipeline`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requests: [
        { type: 'execute', stmt: { sql, args: values, want_rows: true } }, { type: 'close' },
      ] }),
    });
    if (!response.ok) throw new Error('SQL_OUTCOME_UNAVAILABLE');
    const body = await response.json();
    const statement = body.results?.[0];
    if (statement?.type !== 'ok' || statement.response?.type !== 'execute') throw new Error('SQL_OUTCOME_UNAVAILABLE');
    const result = statement.response.result;
    if (!Array.isArray(result?.cols) || !Array.isArray(result?.rows)) throw new Error('SQL_RESULT_UNAVAILABLE');
    return result.rows.map(row => Object.fromEntries(result.cols.map((column, index) => [column.name,
      row[index]?.type === 'null' ? null : row[index]?.value,
    ])));
  }
  const text = value => ({ type: 'text', value: String(value) });
  return {
    all: () => execute('SELECT id,title,kind,file_path,description,note,revision,last_mutation_id,updated_at FROM materials ORDER BY id LIMIT 128'),
    read: async id => (await execute('SELECT id,title,kind,file_path,description,note,revision,last_mutation_id,updated_at FROM materials WHERE id=?', [text(id)]))[0],
    async save(item, note, mutationId) {
      if (!/^\d+$/.test(String(item.revision))) throw new Error('REVISION_UNAVAILABLE');
      const rows = await execute('UPDATE materials SET note=?,revision=revision+1,last_mutation_id=?,updated_at=? WHERE id=? AND revision=? RETURNING id,title,kind,file_path,description,note,revision,last_mutation_id,updated_at',
        [text(note), text(mutationId), text(new Date().toISOString()), text(item.id), { type: 'integer', value: String(item.revision) }]);
      return rows[0] ?? null;
    },
  };
}
