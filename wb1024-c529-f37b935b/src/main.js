import {createTianaFetch} from '@tianacloud/serverless';
import markup from './original.html?raw';
import css from './original.css?inline';
const style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);
const app=document.getElementById('app');
app.innerHTML=markup;
let connection, fetchSql;
async function execute(sql,values=[]){
  if(!connection){
    connection=await window.tiana.connection();
    if(connection.sql_api!=='hrana-v3' || !window.tiana.auth?.getAccessToken) throw Error('数据库连接不可用');
    fetchSql=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  }
  const args=values.map(value=>value===null?{type:'null'}:typeof value==='number'?Number.isInteger(value)?{type:'integer',value:String(value)}:{type:'float',value}:{type:'text',value:String(value)});
  const r=await fetchSql(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!r.ok) throw Error('数据库请求失败');
  const body=await r.json(), result=body.results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作未确认');
  const data=result.response.result;
  return data.rows.map(row=>Object.fromEntries(row.map((v,i)=>[data.cols[i].name,v.type==='null'?null:v.value])));
}
window.savePoint=async p=>execute('INSERT INTO points (id,type,name,district,spot,lat,lng,description,sterilized,cats,created_at,photo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',[String(p.id),p.type,p.name,p.district,p.spot,p.lat,p.lng,p.desc,p.sterilized,p.cats,new Date().toISOString(),p.photo||'']);
window.loadPoints=async()=>execute('SELECT * FROM points ORDER BY created_at DESC LIMIT 1000');
window.loadActivity=async()=>({checks:await execute('SELECT * FROM checkins ORDER BY created_at DESC LIMIT 1000'),favorites:await execute('SELECT * FROM favorites'),cats:await execute('SELECT * FROM cats ORDER BY created_at DESC LIMIT 1000')});
window.recordCheck=async(id,cats)=>execute('INSERT INTO checkins (id,point_id,created_at,cats) VALUES (?,?,?,?)',[crypto.randomUUID(),String(id),new Date().toISOString(),cats]);
window.recordFavorite=async id=>execute('INSERT OR IGNORE INTO favorites (point_id,created_at) VALUES (?,?)',[String(id),new Date().toISOString()]);
window.recordCat=async(name,description)=>execute('INSERT INTO cats (id,name,description,created_at) VALUES (?,?,?,?)',[crypto.randomUUID(),name,description,new Date().toISOString()]);
await import('./original.js');
