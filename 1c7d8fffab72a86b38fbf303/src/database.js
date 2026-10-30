import { createTianaFetch } from '@tianacloud/serverless';
let client;
async function execute(sql, values=[]) {
  if (!client) {
    const auth=window.tiana?.auth;
    if (typeof auth?.getAccessToken !== 'function') throw Error('登录环境未就绪');
    const connection=await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw Error('不支持的数据库协议');
    client={origin:connection.origin, fetch:createTianaFetch({origin:connection.origin,auth,requestBodyMode:'buffered'})};
  }
  const args=values.map(v=>typeof v==='number'?{type:'float',value:v}:{type:'text',value:String(v)});
  const response=await client.fetch(`${client.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw Error('数据库请求未确认');
  const data=await response.json(), item=data.results?.[0];
  if (item?.type!=='ok' || item.response?.type!=='execute') throw Error('数据库操作未确认');
  const result=item.response.result; return (result.rows||[]).map(row=>Object.fromEntries(result.cols.map((c,i)=>[c.name,row[i]?.value??null])));
}
export const database={
  async getBudget(){const rows=await execute("SELECT value FROM ledger_settings WHERE key = ?",["budget"]); return rows.length ? Number(rows[0].value) : 3000},
  async setBudget(value){await execute("INSERT INTO ledger_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",["budget",value])},
  async getSchema(){return {properties:[]}},
  async query(){const rows=await execute('SELECT id, note, type, amount, category, date, created_at FROM ledger_records ORDER BY created_at DESC');return {results:rows.map(r=>({_id:r.id,'摘要':r.note,'类型':r.type,'金额':Number(r.amount),'分类':r.category,'日期':r.date,'时间':r.created_at})),hasMore:false}},
  async addRecord({properties:p}){await execute('INSERT INTO ledger_records (id,note,type,amount,category,date,created_at) VALUES (?,?,?,?,?,?,?)',[crypto.randomUUID(),p['摘要'].text,p['类型'].select,p['金额'].currency,p['分类'].select,p['日期'].date,p['时间'].text])},
  async deleteRecord({recordId}){await execute('DELETE FROM ledger_records WHERE id=?',[recordId])}
};
