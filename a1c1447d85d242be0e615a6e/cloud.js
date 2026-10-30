import {createTianaFetch} from '@tianacloud/serverless';
export async function openStore(onError) {
  if (!window.tiana?.auth?.getAccessToken) throw Error('账户认证未就绪');
  const conn = await window.tiana.connection();
  if (conn.sql_api !== 'hrana-v3') throw Error('当前数据库协议不支持');
  const fetchSql = createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  async function sql(query,args=[]) {
    const response=await fetchSql(conn.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args,want_rows:true}},{type:'close'}]})});
    if(!response.ok) throw Error('数据库操作结果未知，请重新打开检查');
    const item=(await response.json()).results?.[0];
    if(item?.type!=='ok'||item.response?.type!=='execute') throw Error('数据库操作失败或结果未知');
    return item.response.result;
  }
  const initialResult=await sql('SELECT data,revision FROM cooling_state WHERE id=1');
  if(!initialResult.rows?.length) throw Error('数据库尚未初始化');
  const initial=JSON.parse(initialResult.rows[0][0].value);
  let revision=Number(initialResult.rows[0][1].value), pending=null, busy=false, failed=false;
  async function flush(){
    if(busy||failed||!pending)return;
    busy=true; const snapshot=pending; pending=null;
    try {
      const result=await sql('UPDATE cooling_state SET data=?, revision=revision+1 WHERE id=1 AND revision=? RETURNING revision', [{type:'text',value:snapshot},{type:'integer',value:String(revision)}]);
      if(!result.rows?.length) throw Error('数据已在其他页面更改，请重新打开');
      revision=Number(result.rows[0][0].value);
    } catch(e) {failed=true; onError(e.message);}
    finally {busy=false; if(pending&&!failed) flush();}
  }
  return {initial,save(value){pending=JSON.stringify(value);flush();}};
}
