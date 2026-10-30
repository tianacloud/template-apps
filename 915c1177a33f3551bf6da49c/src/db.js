import {createTianaFetch} from '@tianacloud/serverless';
import {getLocal,putLocal,offlineIdentity} from './offline-store.js';
let channel;
async function sql(text, values=[]) {
  if (!window.tiana?.appId || !window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw Error('账号连接未就绪');
  if (!channel) channel=window.tiana.connection().then(c=>{if(c.sql_api!=='hrana-v3') throw Error('数据库协议不支持');return {origin:c.origin,fetch:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};}).catch(e=>{channel=null;throw e});
  const c=await channel, args=values.map(v=>typeof v==='number'?{type:'integer',value:String(v)}:{type:'text',value:String(v)});
  const res=await c.fetch(c.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:text,args,want_rows:true}},{type:'close'}]})});
  if(!res.ok) throw Error('数据库请求失败');const data=await res.json(), item=data.results?.[0];
  if(item?.type!=='ok'||item.response?.type!=='execute')throw Error('数据库操作失败');
  const r=item.response.result; return {rows:(r.rows||[]).map(row=>Object.fromEntries(r.cols.map((col,i)=>[col.name,row[i]?.value]))),affected:Number(r.affected_row_count||0)};
}
async function cloudRead(){return (await sql('SELECT payload,version FROM iron_state WHERE app_id=?',[window.tiana.appId])).rows[0]||null;}
async function readStateUnlocked(){
  if(window.__ironOffline){const identity=await offlineIdentity();if(!identity)throw Error('尚未准备离线数据');const cached=await getLocal(identity.appId);if(!cached)throw Error('尚未准备离线数据');return {payload:cached.payload,version:cached.localVersion};}
  const id=window.tiana.appId, cached=await getLocal(id).catch(()=>null);let row=await cloudRead();
  if(cached?.dirty){const current=row?Number(row.version):null;const expected=cached.baseVersion===null?1:cached.baseVersion+1;if(current===expected && row?.payload===cached.payload){/* 上次同步可能已经成功 */}else{if(current!==cached.baseVersion)throw Error('离线记录与云端记录冲突，请保留本设备数据并联系应用维护者');const v=await cloudWrite(cached.payload,current);row={payload:cached.payload,version:v};}}
  if(row)await putLocal(id,{payload:row.payload,baseVersion:Number(row.version),localVersion:Number(row.version),dirty:false}).catch(()=>{});
  return row;
}
async function cloudWrite(payload,version){
  let r; try { r=version===null ? await sql('INSERT INTO iron_state(app_id,payload,version) VALUES(?,?,1) ON CONFLICT(app_id) DO NOTHING',[window.tiana.appId,payload]) : await sql('UPDATE iron_state SET payload=?,version=version+1 WHERE app_id=? AND version=?',[payload,window.tiana.appId,version]); }
  catch(e) { const row=await cloudRead(); if(row?.payload===payload && Number(row.version)===(version===null?1:version+1)) return Number(row.version); throw e; }
  if(r.affected!==1) throw Error('存档冲突'); return version===null?1:version+1;
}

async function writeStateUnlocked(payload,version){
 if(window.__ironOffline){const id=(await offlineIdentity())?.appId;if(!id)throw Error('离线身份不可用');const current=await getLocal(id);if(!current || current.localVersion!==version)throw Error('本地记录冲突');const next={...current,payload,localVersion:version+1,dirty:true};await putLocal(id,next);return next.localVersion;}
 const pending=await getLocal(window.tiana.appId).catch(()=>null);if(pending?.dirty)throw Error('存在尚未同步的离线记录，请重新打开应用');
 const next=await cloudWrite(payload,version);await putLocal(window.tiana.appId,{payload,baseVersion:next,localVersion:next,dirty:false}).catch(()=>{});return next;
}

async function withLock(action){
  const id=window.__ironOffline?(await offlineIdentity())?.appId:window.tiana?.appId;
  if(!id) throw Error('应用身份不可用');
  if(!navigator.locks) { if(window.__ironOffline) throw Error('浏览器不支持离线同步锁'); return action(); }
  return navigator.locks.request('iron-planner-'+id,action);
}
export const readState=()=>withLock(readStateUnlocked);
export const writeState=(payload,version)=>withLock(()=>writeStateUnlocked(payload,version));
