import {createTianaFetch} from '@tianacloud/serverless';
let client;
async function getClient() {
  if (!client) client = (async () => {
    if (!window.tiana?.auth?.getAccessToken) throw new Error('请在已登录的应用中打开');
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3') throw new Error('数据库协议不兼容');
    return {c,http:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};
  })().catch(e => {client=undefined;throw e;});
  return client;
}
window.gameStorage = async (sql, values) => {
  const {c,http}=await getClient();
  const args=values.map(value=>({type:'integer',value:String(value)}));
  const res=await http(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!res.ok) throw new Error('数据库请求失败');
  const result=(await res.json()).results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw new Error('数据库操作失败');
  const data=result.response.result;
  return (data.rows||[]).map(row=>Object.fromEntries(data.cols.map((col,i)=>[col.name,row[i]?.value??null])));
};
