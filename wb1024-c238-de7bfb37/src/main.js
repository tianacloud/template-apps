import { createTianaFetch } from '@tianacloud/serverless';
import body from './body.html?raw';
const assetRoot = new URL('../', import.meta.url);
document.title = '老李的世界Online｜我的人物面板';
for (const path of ['assets/css/style.css','assets/css/pets.css']) { const l=document.createElement('link'); l.rel='stylesheet'; l.href=new URL(path, assetRoot).href; document.head.append(l); }
document.getElementById('app').innerHTML=body;
async function start() {
  const c=await window.tiana.connection();
  if (!window.tiana.auth?.getAccessToken || c.sql_api !== 'hrana-v3') throw Error('数据库连接不可用');
  const f=createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  const text = value => ({type:'text',value:String(value)});
  async function sql(query,args=[]) {
    const response=await f(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args:args.map(text),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库请求失败');
    const result=(await response.json()).results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作失败');
    return result.response.result;
  }
  const unpack=p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,Object.values(v)[0]]));
  const database={
    async query({databaseId,pageSize=200,startCursor}) {
      const offset=Number(startCursor)||0;
      const r=await sql('SELECT id, properties FROM game_records WHERE kind = ? ORDER BY id LIMIT ? OFFSET ?',[databaseId,pageSize+1,offset]);
      const rows=r.rows.map(row=>({_id:row[0].value,...JSON.parse(row[1].value)}));
      return {results:rows.slice(0,pageSize),hasMore:rows.length>pageSize,nextCursor:String(offset+pageSize)};
    },
    async addRecord({databaseId,properties}) { const id=crypto.randomUUID(); await sql('INSERT INTO game_records (id,kind,properties) VALUES (?,?,?)',[id,databaseId,JSON.stringify(unpack(properties))]); return {id}; },
    async updateRecord({databaseId,recordId,properties}) { const r=await sql('SELECT properties FROM game_records WHERE id = ? AND kind = ?',[recordId,databaseId]); if(!r.rows.length) throw Error('记录不存在'); const merged={...JSON.parse(r.rows[0][0].value),...unpack(properties)}; await sql('UPDATE game_records SET properties = ? WHERE id = ? AND kind = ?',[JSON.stringify(merged),recordId,databaseId]); return {id:recordId}; },
    async deleteRecord({databaseId,recordId}) { await sql('DELETE FROM game_records WHERE id = ? AND kind = ?',[recordId,databaseId]); }
  };
  window.__SMART_PAGE__={database,__realImpls__:{database}};
  for (const path of ['assets/js/html2canvas.min.js','assets/js/boot.js','assets/js/app.js','assets/js/pets.js']) await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(path, assetRoot).href;s.onload=resolve;s.onerror=reject;document.body.append(s);});
}
start().catch(e=>{document.body.textContent='无法连接存档，请刷新重试。'; console.error(e)});
