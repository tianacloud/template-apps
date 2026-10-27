import {createTianaFetch} from '@tianacloud/serverless';
let conn, transport;
async function execute(sql, values=[]) {
  if (!conn) {
    if (!window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw Error('账号连接未就绪');
    conn = await window.tiana.connection();
    if (conn.sql_api !== 'hrana-v3') throw Error('当前数据库协议不支持参数化操作');
    transport = createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  }
  const args=values.map(v=>v===null||v===undefined?{type:'null'}:typeof v==='number'||typeof v==='boolean'?{type:'integer',value:String(Number(v))}:{type:'text',value:typeof v==='object'?JSON.stringify(v):String(v)});
  const resp=await transport(`${conn.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if (!resp.ok) throw Error('数据库请求未确认，请刷新后核对');
  const body=await resp.json(), item=body.results?.[0];
  if (item?.type==='error') throw Error(item.error?.message||'数据库操作失败');
  if (item?.type!=='ok'||item.response?.type!=='execute') throw Error('数据库结果未确认，请刷新后核对');
  const r=item.response.result;
  return r.rows.map(row=>Object.fromEntries(r.cols.map((c,i)=>{const v=row[i];let x=v.type==='null'?null:v.type==='integer'?Number(v.value):v.value; if(c.name==='active')x=!!x;return [c.name,x]})));
}
const names=new Set(['profiles','children','tasks','rewards','goals','records','points_log','child_events','redeems']);
class Query {
  constructor(table){if(!names.has(table))throw Error('表不存在');this.table=table;this.action='select';this.filters=[];this.orders=[];this.columns='*';this.returning=false;this.single=false;}
  select(cols='*'){if(this.action==='select')this.columns=cols;else this.returning=true;return this}
  maybeSingle(){this.single=true;return this}
  order(k,o={}){this.orders.push(`${ident(k)} ${o.ascending===false?'DESC':'ASC'}`);return this}
  limit(n){this.lim=Math.max(0,Math.min(5000,Number(n)||0));return this}
  eq(k,v){this.filters.push([k,'=',v]);return this}
  neq(k,v){this.filters.push([k,'!=',v]);return this}
  insert(v){this.action='insert';this.rows=Array.isArray(v)?v:[v];return this}
  update(v){this.action='update';this.row=v;return this}
  delete(){this.action='delete';return this}
  then(resolve,reject){return this.run().then(resolve,reject)}
  async run(){try {let data=[];const where=this.filters.length?' WHERE '+this.filters.map(([k,op])=>`${ident(k)} ${op} ?`).join(' AND '):'';const args=this.filters.map(x=>x[2]);
    if(this.action==='select'){let cols=this.columns==='*'?'*':this.columns.split(',').map(x=>ident(x.trim())).join(','); data=await execute(`SELECT ${cols} FROM ${ident(this.table)}${where}${this.orders.length?' ORDER BY '+this.orders.join(','):''}${this.lim?' LIMIT '+this.lim:''}`,args)}
    if(this.action==='insert'){for(const row of this.rows){const keys=Object.keys(row);data.push(...await execute(`INSERT INTO ${ident(this.table)} (${keys.map(ident).join(',')}) VALUES (${keys.map(()=>'?').join(',')}) RETURNING *`,keys.map(k=>row[k])));}}
    if(this.action==='update'){const keys=Object.keys(this.row);data=await execute(`UPDATE ${ident(this.table)} SET ${keys.map(k=>ident(k)+' = ?').join(',')}${where} RETURNING *`,[...keys.map(k=>this.row[k]),...args]);}
    if(this.action==='delete')data=await execute(`DELETE FROM ${ident(this.table)}${where} RETURNING *`,args);
    return {data:this.single?(data[0]||null):data,error:null};
  }catch(e){return {data:null,error:{message:e.message}}}}
}
function ident(s){if(!/^[a-z_]+$/.test(s))throw Error('无效字段');return '"'+s+'"'}
window.AppDatabase={createAppDatabase:()=>({database:{from:t=>new Query(t)},auth:{getSession:async()=>({data:{user:{id:'parent',email:''}}})}})};
