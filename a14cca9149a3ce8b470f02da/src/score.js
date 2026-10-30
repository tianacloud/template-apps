import { createTianaFetch } from '@tianacloud/serverless';
let connection;
async function query(sql) {
  if (!connection) {
    const c = await window.tiana.connection();
    if (typeof window.tiana.auth?.getAccessToken !== 'function') throw Error('请登录');
    if (c.sql_api !== 'hrana-v3') throw Error('不支持的数据库协议');
    connection = {c, http:createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'})};
  }
  const {c,http} = connection;
  const response = await http(`${c.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:[],want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw Error('数据库结果未知');
  const body = await response.json(), statement = body.results?.[0];
  if (statement?.type !== 'ok' || statement.response?.type !== 'execute') throw Error('数据库操作未确认');
  const result = statement.response.result;
  return (result.rows || []).map(row => Object.fromEntries(result.cols.map((col,i) => [col.name,row[i]?.value ?? null])));
}
function score(row) { return {points:Number(row?.points || 0), wins:Number(row?.wins || 0)}; }
export async function readScore() { return score((await query('SELECT points, wins FROM disco_score WHERE id = 1'))[0]); }
export async function awardWin() { const rows = await query('INSERT INTO disco_score (id, points, wins) VALUES (1, 100, 1) ON CONFLICT(id) DO UPDATE SET points = points + 100, wins = wins + 1 RETURNING points, wins'); if (rows.length !== 1) throw Error('积分结果未确认'); return score(rows[0]); }
