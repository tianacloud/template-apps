import {createTianaFetch} from '@tianacloud/serverless';
let ready;
async function lifeSql(sql, values=[]) {
  if (!ready) ready=(async()=>{ if(typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('登录后使用'); const c=await window.tiana.connection(); if(c.sql_api!=='hrana-v3') throw Error('不支持的数据库协议'); return {c,http:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})}; })().catch(e=>{ready=undefined;throw e});
  const {c,http}=await ready;
  const response=await http(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
  if(!response.ok) throw Error('数据库结果未知');
  const body=await response.json(), statement=body.results?.[0];
  if(statement?.type!=='ok'||statement.response?.type!=='execute') throw Error('数据库操作未确认');
  const result=statement.response.result;
  return (result.rows||[]).map(row=>Object.fromEntries(result.cols.map((col,i)=>[col.name,row[i]?.value??null])));
}
