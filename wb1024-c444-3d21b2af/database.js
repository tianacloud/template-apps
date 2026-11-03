import { createTianaFetch } from '@tianacloud/serverless';
let conn, send;
async function execute(sql, values=[]) {
  if (!send) {
    conn=await window.tiana.connection();
    if(conn.sql_api !== 'hrana-v3' || !window.tiana.auth?.getAccessToken) throw Error('数据库连接不可用');
    send=createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  }
  const args=values.map(v=>typeof v==='number'?{type:'integer',value:String(v)}:{type:'text',value:String(v)});
  const response=await send(`${conn.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!response.ok) throw Error('数据库操作结果未知，请刷新核对');
  const data=await response.json(), result=data.results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作失败');
  return result.response.result;
}
export const database={
  async getSchema(){return execute('SELECT 1');},
  async addRecord({properties:p}){return execute('INSERT INTO checkins (id,date,focus,sport,late,mood,note) VALUES (?,?,?,?,?,?,?)',[crypto.randomUUID(),p['日期'].date,+p['专注'].checkbox,+p['运动'].checkbox,+p['熬夜'].checkbox,p['心情'].select,p['一句话'].text]);},
  async query(){const r=await execute('SELECT date,focus,sport,late,mood,note FROM checkins ORDER BY date DESC, rowid DESC');return {results:r.rows.map(row=>{const v=row.map(x=>x.value);return {'日期':v[0],'专注':+v[1],'运动':+v[2],'熬夜':+v[3],'心情':v[4],'一句话':v[5]};}),hasMore:false};}
};
