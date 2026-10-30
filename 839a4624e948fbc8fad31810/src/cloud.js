import { createTianaFetch } from '@tianacloud/serverless';
export async function cloud(files) {
  const auth = window.tiana?.auth;
  if (!files || typeof auth?.getAccessToken !== 'function') throw new Error('云端连接未就绪');
  const c = await window.tiana.connection();
  if (c.sql_api !== 'hrana-v3') throw new Error('数据库协议不受支持');
  const fetchSql = createTianaFetch({origin:c.origin,auth,requestBodyMode:'buffered'});
  async function sql(query, values=[]) {
    const response = await fetchSql(`${c.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args:values.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw new Error('数据库操作结果未确认');
    const body=await response.json(), first=body.results?.[0];
    if(first?.type !== 'ok' || first.response?.type !== 'execute') throw new Error('数据库操作未完成');
    const result=first.response.result;
    return (result.rows || []).map(row=>Object.fromEntries(result.cols.map((col,i)=>[col.name,row[i]?.value ?? null])));
  }
  const state=Object.fromEntries((await sql('SELECT key,value FROM museum_state')).map(x=>[x.key,JSON.parse(x.value)]));
  let writes=Promise.resolve(true), failed=false;
  const enqueue = action => {
    if (failed) return Promise.resolve(false);
    writes=writes.then(async()=>{
      if (failed) return false;
      try { await action(); return true; }
      catch { failed=true; alert('保存结果未确认。请重新加载并检查云端记录后再继续操作。'); return false; }
    });
    return writes;
  };
  const save=(key,value)=>{
    const snapshot=JSON.stringify(value);
    return enqueue(async()=>{ await sql('INSERT INTO museum_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,snapshot]); state[key]=JSON.parse(snapshot); });
  };
  const clearUserData=()=>enqueue(async()=>{
    await sql("UPDATE museum_state SET value='[]' WHERE key IN ('gbg_fav_m','gbg_fav_a','gbg_fav_g','gbg_visited')");
    for (const key of ['gbg_fav_m','gbg_fav_a','gbg_fav_g','gbg_visited']) state[key]=[];
  });
  return {state,save,clearUserData,files,sql};
}
