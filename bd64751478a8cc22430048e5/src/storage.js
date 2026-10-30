import {createTianaFetch} from '@tianacloud/serverless';
import {uid,clone,validateRecord} from './domain.js';

export function parseRows(result) {
  if(!result||!Array.isArray(result.cols)||!Array.isArray(result.rows))throw new Error('数据库返回了无效数据');
  return result.rows.map(row=>Object.fromEntries(result.cols.map((c,i)=>{const v=row[i];return[c.name,v?.type==='integer'?Number(v.value):v?.type==='null'?null:v?.value??v];})));
}
export async function connectDatabase() {
  const runtime=window.tiana;
  if(typeof runtime?.auth?.getAccessToken!=='function'||typeof runtime?.connection!=='function')throw new Error('请从 Tiana 应用入口登录后打开');
  const connection=await runtime.connection();
  if(connection.sql_api!=='hrana-v3')throw new Error('当前数据库未提供应用所需的参数化 SQL 通道');
  const transport=createTianaFetch({origin:connection.origin,auth:runtime.auth,requestBodyMode:'buffered'});
  return async (sql,values=[])=>{
    const args=values.map(v=>v===null?{type:'null'}:typeof v==='number'?{type:Number.isInteger(v)?'integer':'float',value:Number.isInteger(v)?String(v):v}:{type:'text',value:String(v)});
    const response=await transport(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if(!response.ok)throw new Error(response.status===401||response.status===403?'登录已失效，请重新登录；本页输入仍保留':'网络响应异常，正在核对云端结果');
    const body=await response.json();const first=body.results?.[0];
    if(first?.type==='error')throw new Error('数据库未接受此操作，请保留输入并检查连接');
    if(first?.type!=='ok'||first.response?.type!=='execute')throw new Error('保存结果未知，正在核对云端');
    return parseRows(first.response.result);
  };
}
const keyOf=(kind,id)=>`${kind}:${id}`;
export class GymStore {
  constructor(execute=null,demoRecords=[]) {this.execute=execute;this.rows=new Map();this.dirty=new Map();this.listeners=new Set();this.error='';this.ready=!execute;this.busy=false;this.tick=0;this.lastSaved=null;this.demo=!execute;this.seed=clone(demoRecords);for(const r of demoRecords)this.rows.set(keyOf(r.kind,r.id),{...r,revision:1,deleted:0});}
  subscribe=(f)=>{this.listeners.add(f);return()=>this.listeners.delete(f);};
  snapshot=()=>this.tick;
  emit(){this.tick++;this.listeners.forEach(f=>f());}
  list(kind){return [...this.rows.values()].filter(r=>r.kind===kind&&!r.deleted).map(r=>({...clone(r.payload),id:r.id}));}
  get(kind,id){const r=this.rows.get(keyOf(kind,id));return !r?.deleted&&r?clone(r.payload):null;}
  setting(id,fallback){return this.get('setting',id)?.value??fallback;}
  async load(){if(!this.execute)return;const rows=await this.execute('SELECT kind,id,payload,revision,deleted,mutation_id,updated_at FROM gym_records');for(const r of rows){const k=keyOf(r.kind,r.id);if(!this.dirty.has(k))this.rows.set(k,{...r,payload:JSON.parse(r.payload)});}this.ready=true;this.emit();}
  set(kind,id,value,deleted=false){if(!deleted&&!validateRecord(kind,value,id))throw new Error('请检查输入：必填值或数字范围不正确');const key=keyOf(kind,id);const old=this.rows.get(key);const record={kind,id,payload:clone(value),revision:old?.revision||0,deleted:deleted?1:0,mutation_id:uid(),updated_at:new Date().toISOString()};this.rows.set(key,record);this.dirty.set(key,record);this.emit();clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),350);}
  remove(kind,id){const r=this.rows.get(keyOf(kind,id));if(r)this.set(kind,id,r.payload,true);}
  setSetting(id,value){this.set('setting',id,{value});}
  async flush(){
    clearTimeout(this.timer);if(this.pending)return this.pending;if(this.error)return false;
    this.pending=this.doFlush().finally(()=>{this.pending=null;this.busy=false;this.emit();});return this.pending;
  }
  async doFlush(){
    this.busy=true;this.emit();
    for(const [key,snapshot] of this.dirty){
      const base=this.rows.get(key)?.revision||0;
      try{
        let saved;
        if(this.execute){
          const values=[snapshot.kind,snapshot.id,JSON.stringify(snapshot.payload),snapshot.deleted,snapshot.mutation_id,snapshot.updated_at,base];
          try{
            const rows=await this.execute('INSERT INTO gym_records(kind,id,payload,deleted,mutation_id,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(kind,id) DO UPDATE SET payload=excluded.payload,deleted=excluded.deleted,mutation_id=excluded.mutation_id,updated_at=excluded.updated_at,revision=gym_records.revision+1 WHERE gym_records.revision=? RETURNING revision,mutation_id',values);
            if(!rows.length)throw new Error('这条记录已在另一窗口更新。已保留本页输入，请先导出备份或读取云端版本。');
            saved=rows[0];
          }catch(error){
            // A lost write response is checked with an independent read, never replayed.
            const checked=await this.execute('SELECT revision,mutation_id FROM gym_records WHERE kind=? AND id=?',[snapshot.kind,snapshot.id]).catch(()=>[]);
            if(checked[0]?.mutation_id===snapshot.mutation_id)saved=checked[0];else throw error;
          }
        }else saved={revision:base+1};
        const latest=this.rows.get(key);latest.revision=saved.revision;
        if(this.dirty.get(key)===snapshot)this.dirty.delete(key);
        else {const newer=this.dirty.get(key);newer.revision=saved.revision;}
        this.lastSaved=new Date();this.emit();
      }catch(e){this.error=e.message||'保存失败，本页输入已保留';this.emit();return false;}
    }
    if(this.dirty.size)return this.doFlush();
    return true;
  }
  async reconcile(){
    if(!this.execute)return true;
    for(const [key,draft] of this.dirty){const rows=await this.execute('SELECT revision,mutation_id FROM gym_records WHERE kind=? AND id=?',[draft.kind,draft.id]);const remote=rows[0];if(remote?.mutation_id===draft.mutation_id){draft.revision=remote.revision;this.dirty.delete(key);}else if((remote?.revision||0)!==draft.revision){this.error='云端存在另一版本，请导出本页备份后读取云端。';this.emit();return false;}}
    this.error='';return this.flush();
  }
  async discardAndReload(){this.dirty.clear();this.error='';this.rows.clear();await this.load();}
  export(){return {format:'opengym-tiana',version:1,exportedAt:new Date().toISOString(),records:[...this.rows.values()].filter(r=>!r.deleted).map(r=>({kind:r.kind,id:r.id,payload:clone(r.payload)}))};}
  reset(){this.rows.clear();this.dirty.clear();this.error='';for(const r of clone(this.seed))this.rows.set(keyOf(r.kind,r.id),{...r,revision:1,deleted:0});this.emit();}
}
