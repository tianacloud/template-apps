import {createTianaFetch} from '@tianacloud/serverless';
let ready;
async function client() {
  if (!ready) ready = (async () => {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw Error('数据库服务未就绪');
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3') throw Error('当前数据库协议不支持安全保存');
    return {c, http: createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'})};
  })().catch(e => {ready = undefined; throw e;});
  return ready;
}
export async function execute(sql, values=[]) {
  const {c,http}=await client();
  const args=values.map(value=>({type:'text',value:String(value)}));
  const res=await http(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!res.ok) throw Error('数据库结果未确认');
  const body=await res.json(), result=body.results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库结果未确认');
  const data=result.response.result;
  return (data.rows||[]).map(row=>Object.fromEntries(data.cols.map((col,i)=>[col.name,row[i]?.value??null])));
}
