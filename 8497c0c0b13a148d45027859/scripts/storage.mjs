import {createTianaFetch} from '@tianacloud/serverless';
const cache = Object.create(null);
let channel, timer, pending = Promise.resolve(), failed = false;
const status = document.createElement('div');
status.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:9999;background:#fff;padding:6px;color:#333;border:1px solid #ccc';
status.textContent = '正在连接云端记录…';

async function sql(statement, values=[]) {
  const response=await channel.fetch(`${channel.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
  if(!response.ok) throw Error('数据库响应未确认');
  const body=await response.json(), first=body.results?.[0];
  if(first?.type!=='ok'||first.response?.type!=='execute') throw Error('数据库操作未确认');
  return first.response.result;
}
export async function storageReady() {
  document.body.append(status);
  try {
    if(typeof window.tiana?.auth?.getAccessToken!=='function') throw Error('登录未就绪');
    const c=await window.tiana.connection();
    if(c.sql_api!=='hrana-v3') throw Error('数据库协议不支持');
    channel={origin:c.origin,fetch:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};
    const result=await sql('SELECT key, value FROM feedback_state');
    for(const row of result.rows||[]) cache[row[0].value]=row[1].value;
    status.textContent='云端记录已连接';
  } catch(e) {status.textContent='云端记录不可用，请检查连接后重新打开。'; throw e;}
}
function schedule(key,value) {
  if(failed) return;
  status.textContent='正在保存…';
  pending=pending.then(async()=>{
    if(failed)return;
    try {await sql('INSERT INTO feedback_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]);status.textContent='已保存到云端';}
    catch(e){failed=true;status.textContent='保存结果未确认，请重新打开核对记录。';}
  });
}
export const localStorage={getItem(key){return cache[key]??null;},setItem(key,value){cache[key]=String(value);schedule(key,String(value));}};
