import { createTianaFetch } from '@tianacloud/serverless';
let connection, sqlFetch;
async function execute(sql) {
  if (!sqlFetch) {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw new Error('数据库登录尚未就绪');
    connection = await window.tiana.connection();
    if (!['hrana-v3', 'tiana-http'].includes(connection.sql_api)) throw new Error('数据库协议不受支持');
    sqlFetch = createTianaFetch({origin: connection.origin, auth: window.tiana.auth, ...(connection.sql_api === 'tiana-http' ? {protocol:'tiana-http'} : {requestBodyMode:'buffered'})});
  }
  const hrana = connection.sql_api === 'hrana-v3';
  const response = await sqlFetch(connection.origin + (hrana ? '/v3/pipeline' : '/v1/sql'), {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(hrana ? {requests:[{type:'execute',stmt:{sql,args:[],want_rows:true}},{type:'close'}]} : {sql})});
  if (!response.ok) throw new Error('数据库请求失败，写入结果可能未知');
  const body = await response.json();
  if (hrana) { const item=body.results?.[0]; if(item?.type !== 'ok' || item.response?.type !== 'execute') throw new Error('数据库操作失败'); return item.response.result.rows; }
  if (body.ok !== true || body.results?.[0]?.error) throw new Error('数据库操作失败');
  return body.results?.[0]?.result?.rows || [];
}
function fail() { alert('无法读取或保存 GPU 设置，请检查登录与数据库连接后重新打开应用。'); }
window.formaGpuPreference='auto';
try { const rows=await execute("SELECT value FROM settings WHERE key='gpu'"); const cell=rows?.[0]?.[0]; const value=typeof cell === 'string' ? cell : cell?.value; if (['auto','on','off'].includes(value)) window.formaGpuPreference=value; } catch { fail(); }
window.formaSaveGpuPreference = async value => {
  if (!['on','off'].includes(value)) return;
  try { await execute(`INSERT INTO settings(key,value) VALUES('gpu','${value}') ON CONFLICT(key) DO UPDATE SET value=excluded.value`); } catch { fail(); }
};
