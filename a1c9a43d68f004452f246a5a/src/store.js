import { createTianaFetch } from '@tianacloud/serverless';
let channel;
async function execute(sql, values = []) {
  if (!channel) channel = (async () => {
    const auth = window.tiana?.auth;
    if (!auth?.getAccessToken || !window.tiana?.connection) throw new Error('数据库连接尚未就绪');
    const conn = await window.tiana.connection();
    if (conn.sql_api !== 'hrana-v3') throw new Error('不支持当前数据库协议');
    return { conn, fetch: createTianaFetch({origin: conn.origin, auth, requestBodyMode: 'buffered'}) };
  })();
  const {conn, fetch} = await channel;
  const args = values.map(v => typeof v === 'number' ? {type:'integer', value:String(v)} : {type:'text', value:String(v)});
  const response = await fetch(`${conn.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw new Error('数据库请求结果未知');
  const body = await response.json(), result = body.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库语句失败或结果未知');
  const data = result.response.result;
  return (data.rows || []).map(row => Object.fromEntries(data.cols.map((col,i) => [col.name,row[i]?.value ?? null])));
}
export async function ledgerLoad() {
  const records = await execute('SELECT id,type,cat,note,amount,date FROM ledger_records ORDER BY rowid DESC');
  const settings = await execute("SELECT value FROM ledger_settings WHERE key = 'budget'");
  return {records:records.map(r => ({...r,amount:Number(r.amount)})),budget:settings.length ? Number(settings[0].value) : 400000};
}
export function ledgerSave(r) { return execute('INSERT INTO ledger_records (id,type,cat,note,amount,date) VALUES (?,?,?,?,?,?)',[r.id,r.type,r.cat,r.note,r.amount,r.date]); }
export function ledgerBudget(value) { return execute("INSERT INTO ledger_settings (key,value) VALUES ('budget',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[value]); }
