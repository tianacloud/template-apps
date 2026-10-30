import {createTianaFetch} from '@tianacloud/serverless';
import {WorkspaceSaveError} from './workspace-sync.js';
let pending;
function value(v){if(v===null)return {type:'null'};if(Number.isInteger(v))return {type:'integer',value:String(v)};if(typeof v==='number')return {type:'float',value:v};return {type:'text',value:String(v)};}
async function channel(){const auth=window.tiana?.auth;if(typeof auth?.getAccessToken!=='function'||typeof window.tiana?.connection!=='function')throw Error('账号连接未就绪。请从已登录的应用入口重新打开；当前草稿会保留在本页。');
 if(!pending)pending=window.tiana.connection().then(c=>{if(c.sql_api!=='hrana-v3')throw Error('数据库协议与此应用不兼容，请联系应用维护者。');return {origin:c.origin,request:createTianaFetch({origin:c.origin,auth,requestBodyMode:'buffered'})};}).catch(e=>{pending=null;throw e;});return pending;}
export async function sql(text,args=[]){const c=await channel();const res=await c.request(c.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:text,args:args.map(value),want_rows:true}},{type:'close'}]})});if(!res.ok)throw Error('数据库结果未确认。请保留输入并重新读取记录。');const data=await res.json(),first=data.results?.[0];if(first?.type!=='ok'||first.response?.type!=='execute')throw Error('数据库操作未确认，请检查当前记录。');const r=first.response.result,raw=r.affected_row_count,affected=(typeof raw==='number'||typeof raw==='string'&&/^\d+$/.test(raw))?Number(raw):null;return {affected,rows:(r.rows||[]).map(row=>Object.fromEntries(r.cols.map((col,i)=>[col.name,row[i]?.type==='null'?null:row[i]?.value??null])))};}
const TABLE="timecraft_workspace";
const decode=row=>row?{...JSON.parse(row.document),id:row.id,revision:Number(row.revision),updatedAt:row.updated_at}:null;
export class Repository{
 async list(){return (await sql('SELECT id,title,document,revision,updated_at FROM '+TABLE+' ORDER BY updated_at DESC LIMIT 1000')).rows.map(decode);}
 async get(id){return decode((await sql('SELECT id,title,document,revision,updated_at FROM '+TABLE+' WHERE id=?',[id])).rows[0]);}
 async save(doc){const copy=structuredClone(doc),old=copy.revision||0;delete copy.revision;delete copy.updatedAt;const payload=JSON.stringify(copy),time=new Date().toISOString();let result;
  if(old===0)result=await sql('INSERT INTO '+TABLE+'(id,title,document,revision,updated_at) VALUES(?,?,?,1,?)',[doc.id,doc.title||doc.name,payload,time]);
  else result=await sql('UPDATE '+TABLE+' SET title=?,document=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?',[doc.title||doc.name,payload,time,doc.id,old]);
  if(result.affected===0)throw new WorkspaceSaveError('CAS_CONFLICT','记录已在其他标签页更新。');
  if(result.affected!==1)throw new WorkspaceSaveError('UNKNOWN','写入回执未确认。');
  return {...structuredClone(doc),revision:old+1,updatedAt:time};
 }
 async remove(doc){await sql('DELETE FROM '+TABLE+' WHERE id=? AND revision=?',[doc.id,doc.revision]);if(await this.get(doc.id))throw Error('记录版本已变化，未删除，请先重新读取。');}
}
