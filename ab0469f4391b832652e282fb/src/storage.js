import {createTianaFetch} from '@tianacloud/serverless';
let client;
async function sql(statement, values = []) {
  if (!client) {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('账号授权未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw Error('数据库协议不受支持');
    client = {connection, http:createTianaFetch({origin:connection.origin, auth:window.tiana.auth, requestBodyMode:'buffered'})};
  }
  const {connection, http} = client;
  const response = await http(`${connection.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw Error('数据库响应未确认');
  const body = await response.json(), result = body.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
  return result.response.result.rows || [];
}
window.danceStorage = {
  async load(){return (await sql('SELECT data FROM dance_custom_actions ORDER BY id')).map(row=>JSON.parse(row[0].value));},
  async save(action){await sql('INSERT INTO dance_custom_actions (id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',[action.id,JSON.stringify(action)]);},
  async remove(id){await sql('DELETE FROM dance_custom_actions WHERE id=?',[id]);},
  async loadSide(){const rows=await sql("SELECT value FROM dance_settings WHERE key='side_open'");return rows[0]?.[0]?.value ?? '1';},
  async saveSide(open){await sql("INSERT INTO dance_settings (key,value) VALUES ('side_open',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[open?'1':'0']);}
};
window.prepareDance = async function(context) {
  const failures = [];
  window.danceStorageReady = false;
  try { window.danceCustoms = await window.danceStorage.load(); window.danceSide = await window.danceStorage.loadSide(); window.danceStorageReady = true; } catch { window.danceCustoms = []; failures.push('自定义动作读取失败，保存前请检查数据库连接'); }
  try {
    const files=context?.files;
    if (!files) throw Error('文件服务未就绪');
    const names=['dancer.glb','costume-neon.jpg','costume-sakura.jpg','costume-flame.jpg','costume-galaxy.jpg'];
    const blobs=await Promise.all(names.map(async name=>{const response=await files.get('template-assets/'+name);if(!response.ok)throw Error('素材读取失败');return response.blob();}));
    window.CHEER_REAL_GLB=await blobs[0].arrayBuffer();
    window.CHEER_COSTUME_AI=['霓虹星纹','樱花粉渐变','烈焰火焰纹','银河星云纹'].map((name,i)=>({id:names[i+1],name,data:URL.createObjectURL(blobs[i+1])}));
  } catch { failures.push('人物模型或队服素材读取失败'); }
  return failures;
};
