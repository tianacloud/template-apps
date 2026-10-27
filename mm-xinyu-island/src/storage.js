import { createTianaFetch } from '@tianacloud/serverless';
let ready;
async function sql(statement, args=[]) {
  if (!ready) ready=(async()=>{
    const t=window.tiana;
    if(typeof t?.connection!=='function'||typeof t?.auth?.getAccessToken!=='function') throw new Error('账号连接尚未就绪，请刷新页面');
    if(typeof t.appId!=='string'||!t.appId) throw new Error('应用身份尚未就绪，请刷新页面');
    const c=await t.connection();
    if(c.sql_api!=='hrana-v3') throw new Error('当前数据连接协议暂不支持');
    return {c,fetch:createTianaFetch({origin:c.origin,auth:t.auth,requestBodyMode:'buffered'})};
  })();
  const {c,fetch}=await ready;
  const res=await fetch(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})});
  if(!res.ok) throw new Error('数据库连接失败，请刷新后核对数据');
  const payload=await res.json(), result=payload.results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw new Error('数据操作未确认，请刷新后核对');
  return result.response.result;
}
const text=v=>({type:'text',value:v});
const integer=v=>({type:'integer',value:String(v)});
export const storage={
  async read(){
    const r=await sql('SELECT revision,data FROM xinyu_islands WHERE app_id=?',[text(window.tiana.appId)]);
    if(!r.rows?.length) return {revision:0,data:null};
    return {revision:Number(r.rows[0][0].value),data:JSON.parse(r.rows[0][1].value)};
  },
  async write(data, revision){
    const json=JSON.stringify(data);
    const r=revision===0
      ? await sql('INSERT INTO xinyu_islands (app_id,revision,data) VALUES (?,1,?) ON CONFLICT(app_id) DO NOTHING RETURNING revision',[text(window.tiana.appId),text(json)])
      : await sql('UPDATE xinyu_islands SET revision=revision+1,data=? WHERE app_id=? AND revision=? RETURNING revision',[text(json),text(window.tiana.appId),integer(revision)]);
    if(!r.rows?.length) throw new Error('小岛已在另一处更新，请刷新后再试');
    return Number(r.rows[0][0].value);
  }
};
