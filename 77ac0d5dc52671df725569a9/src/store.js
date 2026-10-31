import {createTianaFetch} from '@tianacloud/serverless';
export async function openStore() {
  if (!window.tiana?.auth?.getAccessToken) throw Error('请登录后打开应用');
  const c = await window.tiana.connection();
  if (c.sql_api !== 'hrana-v3') throw Error('数据库连接不可用');
  const request = createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  async function sql(statement, values=[]) {
    const response=await request(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库响应失败');
    const result=(await response.json()).results?.[0];
    if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作未确认');
    return result.response.result.rows;
  }
  const rows=await sql('SELECT key, value FROM pet_settings');
  const cache=Object.fromEntries(rows.map(row=>[row[0].value,JSON.parse(row[1].value)]));
  let chain=Promise.resolve(), failed=false;
  const banner=document.createElement('div');
  banner.style.cssText='position:fixed;z-index:9999;top:0;left:0;right:0;padding:12px;background:#8b3030;color:white;text-align:center;display:none';
  document.body.appendChild(banner);
  return {get(k,d){return Object.hasOwn(cache,k)?cache[k]:d},set(k,v){
    cache[k]=structuredClone(v); if(k==='xm.state') return;
    const value=JSON.stringify(v);
    chain=chain.then(async()=>{if(failed) return; try {await sql('INSERT INTO pet_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[k,value]);} catch(e){failed=true;banner.textContent='保存未确认，请刷新核对后再操作。';banner.style.display='block';}});
  }};
}
