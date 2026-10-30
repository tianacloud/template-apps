import { createTianaFetch } from '@tianacloud/serverless';
let send, origin;
async function execute(sql, args = []) {
  const response = await send(`${origin}/v3/pipeline`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]}) });
  if (!response.ok) throw Error('数据库响应不可用');
  const body = await response.json();
  const result = body.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
  return result.response.result;
}
window.mathProgress = {
  async load() {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw Error('数据库连接尚未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw Error('不支持当前数据库连接协议');
    origin = connection.origin;
    send = createTianaFetch({origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
    const result = await execute('SELECT stars, done, correct FROM math_progress WHERE id = 1');
    const row = result.rows?.[0];
    return row ? row.map(cell => Number(cell.value)) : [0,0,0];
  },
  async increment(stars, done, correct) {
    await execute('INSERT INTO math_progress (id, stars, done, correct) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET stars=stars+excluded.stars, done=done+excluded.done, correct=correct+excluded.correct', [stars,done,correct].map(value=>({type:'integer',value:String(value)})));
  }
};
