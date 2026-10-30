import {createTianaFetch} from '@tianacloud/serverless';
export async function openFavorites() {
 const auth=window.tiana?.auth;
 if(typeof auth?.getAccessToken!=='function') throw Error('账号连接未就绪');
 const c=await window.tiana.connection();
 if(c.sql_api!=='hrana-v3') throw Error('数据库协议不受支持');
 const fetchSQL=createTianaFetch({origin:c.origin,auth,requestBodyMode:'buffered'});
 async function sql(text,values=[]) {
  const res=await fetchSQL(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:text,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
  if(!res.ok) throw Error('操作结果未确认，请刷新核对');
  const result=(await res.json()).results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('操作结果未确认，请刷新核对');
  return result.response.result;
 }
 const rows=(await sql('SELECT key FROM avatar_favorites')).rows || [];
 const items=new Set(rows.map(row=>row[0].value));
 return {has:k=>items.has(k),async toggle(k){const add=!items.has(k); await sql(add?'INSERT OR IGNORE INTO avatar_favorites (key) VALUES (?)':'DELETE FROM avatar_favorites WHERE key=?',[k]); if(add)items.add(k);else items.delete(k);return add;}, all:()=>Array.from(items)};
}
