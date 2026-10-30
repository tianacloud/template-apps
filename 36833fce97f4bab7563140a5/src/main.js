import { createTianaFetch } from '@tianacloud/serverless';
import markup from './markup.html';
import css from './style.css';
const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
document.getElementById('app').innerHTML = markup;
try {
  if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw new Error('登录环境尚未就绪');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw new Error('当前数据库协议不支持安全参数绑定');
  const sqlFetch = createTianaFetch({origin: connection.origin, auth: window.tiana.auth, requestBodyMode:'buffered'});
  async function sql(statement, args = []) {
    const response = await sqlFetch(`${connection.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw new Error('数据库请求结果未知');
    const body = await response.json(), r = body.results?.[0];
    if (r?.type !== 'ok' || r.response?.type !== 'execute') throw new Error('数据库未接受请求');
    return r.response.result;
  }
  window.familyStore = {
    async read() { const result = await sql("SELECT state, revision FROM family_state WHERE id = 'home'"); const row = result.rows?.[0]; if (!row) throw new Error('数据库未初始化'); return {state:JSON.parse(row[0].value), revision:Number(row[1].value)}; },
    async write(state, revision) { const r = await sql("UPDATE family_state SET state = ?, revision = revision + 1 WHERE id = 'home' AND revision = ?", [{type:'text',value:state},{type:'integer',value:String(revision)}]); return Number(r.affected_row_count) === 1; }
  };
  const script = document.createElement('script'); script.src = new URL('./legacy.js', import.meta.url).href; document.body.appendChild(script);
} catch (e) { console.error(e); document.getElementById('app').textContent = '家庭数据暂时无法连接，请检查网络后刷新页面。'; }
