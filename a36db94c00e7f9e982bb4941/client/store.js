import { createTianaFetch } from '@tianacloud/serverless';
async function execute(sql, args = []) {
  const auth = window.tiana?.auth;
  if (typeof auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw new Error('Database unavailable');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw new Error('Unsupported SQL API');
  const send = createTianaFetch({ origin: connection.origin, auth, requestBodyMode: 'buffered' });
  const response = await send(`${connection.origin}/v3/pipeline`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]}) });
  if (!response.ok) throw new Error('Database request failed');
  const result = (await response.json()).results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('Database statement failed');
  return result.response.result;
}
window.scoreStore = {
  async read() { const result = await execute('SELECT best FROM game_record WHERE id = 1'); return Number(result.rows?.[0]?.[0]?.value || 0); },
  async save(score) { await execute('INSERT INTO game_record (id,best) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET best = max(best,excluded.best)', [{type:'integer',value:String(Math.max(0,Math.floor(score)))}]); }
};
