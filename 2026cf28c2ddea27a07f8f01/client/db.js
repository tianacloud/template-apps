import {createTianaFetch} from '@tianacloud/serverless';
let channel;
async function sql(statement, values = []) {
  if (!channel) channel = (async () => {
    const auth = window.tiana?.auth;
    if (!auth || typeof auth.getAccessToken !== 'function') throw Error('账号连接未就绪');
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3') throw Error('数据库协议不受支持');
    return {origin:c.origin, fetch:createTianaFetch({origin:c.origin,auth,requestBodyMode:'buffered'})};
  })().catch(e => { channel = null; throw e; });
  const c = await channel;
  const response = await c.fetch(`${c.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw Error('数据库响应未确认');
  const body = await response.json(); const result = body.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
  return result.response.result.rows.map(row => row.map(cell => cell.value));
}
window.feedbackDB = {
  async load(){return (await sql('SELECT payload FROM feedback ORDER BY created_at, id')).map(row=>JSON.parse(row[0]));},
  async insert(id, rec){
    const payload=JSON.stringify(rec);
    try { await sql('INSERT INTO feedback (id, created_at, payload) VALUES (?, ?, ?)',[id,rec.ts,payload]); }
    catch (e) {
      const rows=await sql('SELECT payload FROM feedback WHERE id = ?',[id]);
      if (!rows.length || rows[0][0] !== payload) throw e;
    }
  }
};
