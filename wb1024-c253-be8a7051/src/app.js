import {createTianaFetch} from '@tianacloud/serverless';
import body from './body.html?raw';
import css from './style.css?raw';
const style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);
document.getElementById('app').innerHTML=body;
async function initializeDatabase(){
  if(typeof window.tiana?.connection!=='function'||typeof window.tiana?.auth?.getAccessToken!=='function') return;
  const connection=await window.tiana.connection();
  if(connection.sql_api!=='hrana-v3') throw new Error('不支持的数据库协议');
  const request=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  async function execute(sql,values=[]){
    const args=values.map(value=>value===null?{type:'null'}:{type:'text',value:String(value)});
    const response=await request(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if(!response.ok) throw new Error('数据库请求失败，写入结果需核实');
    const data=await response.json(), item=data.results?.[0];
    if(item?.type!=='ok'||item.response?.type!=='execute') throw new Error('数据库语句失败或结果未知');
    const result=item.response.result;
    return (result.rows||[]).map(row=>Object.fromEntries(result.cols.map((col,i)=>[col.name,row[i]?.value??null])));
  }
  const kind=id=>id==='profile'?'profile':'record';
  const flatten=props=>Object.fromEntries(Object.entries(props).map(([k,v])=>[k,v.text??v.select??v.date??v.number??null]));
  window.__SMART_PAGE__={database:{
    async query({databaseId,pageSize=200,startCursor,filter}){
      let rows=await execute('SELECT id, document FROM baby_documents WHERE kind = ? ORDER BY id',[kind(databaseId)]);
      rows=rows.map(r=>({...JSON.parse(r.document),_id:r.id}));
      if(filter) rows=rows.filter(r=>r['本地编号']===filter.property.number.equals);
      const start=Number(startCursor)||0, page=rows.slice(start,start+pageSize);
      return {results:page,hasMore:start+pageSize<rows.length,nextCursor:String(start+pageSize)};
    },
    async addRecord({databaseId,properties}){const id=crypto.randomUUID(); await execute('INSERT INTO baby_documents (id,kind,document) VALUES (?,?,?)',[id,kind(databaseId),JSON.stringify(flatten(properties))]);return {id};},
    async updateRecord({recordId,properties}){await execute('UPDATE baby_documents SET document = ? WHERE id = ?',[JSON.stringify(flatten(properties)),recordId]);},
    async deleteRecord({recordId}){await execute('DELETE FROM baby_documents WHERE id = ?',[recordId]);}
  }};
}
(async()=>{ try { await initializeDatabase(); } catch(error) { console.error('数据库连接失败',error); } await import('./original.js'); })();
