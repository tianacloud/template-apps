import {createTianaFetch} from '@tianacloud/serverless';

export async function connectPracticeStore(runtime,report) {
  if(typeof runtime?.auth?.getAccessToken!=='function'||!runtime.appId) throw new Error('当前登录或数据库连接尚未就绪');
  const connection=await runtime.connection();
  if(connection.sql_api!=='hrana-v3') throw new Error('当前数据库连接不受支持');
  const transport=createTianaFetch({origin:connection.origin,auth:runtime.auth,requestBodyMode:'buffered'});
  const text=value=>({type:'text',value:String(value)});
  async function execute(sql,args=[]) {
    const response=await transport(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if(!response.ok) throw new Error('无法确认云端结果');
    const body=await response.json(),statement=body.results?.[0];
    if(statement?.type!=='ok'||statement.response?.type!=='execute') throw new Error('无法确认云端结果');
    const result=statement.response.result;
    if(!Array.isArray(result?.rows)||!Array.isArray(result?.cols)) throw new Error('无法确认云端结果');
    return result.rows.map(row=>Object.fromEntries(result.cols.map((c,i)=>[c.name,row[i]?.type==='null'?null:row[i]?.value])));
  }
  return openPracticeStore(execute,runtime.appId,report);
}

export async function openPracticeStore(execute,appId,report) {
  const text=value=>({type:'text',value:String(value)});
  const read=async()=> (await execute('SELECT payload,revision,mutation_id FROM practice_progress WHERE app_id=?',[text(appId)]))[0];
  let row=await read();
  if(!row) {
    try {await execute('INSERT OR IGNORE INTO practice_progress(app_id) VALUES(?)',[text(appId)]);}
    catch(error) {row=await read();if(!row)throw error;}
    row=await read();
  }
  if(!row||!/^\d+$/.test(String(row.revision)))throw new Error('无法读取云端统计');
  JSON.parse(row.payload);
  let memory=row.payload,revision=String(row.revision),pending=null,active=false,failure=null;
  async function drain() {
    if(active||failure)return;
    active=true;
    try {
      while(pending) {
        const payload=pending;pending=null;
        const operation={payload,revision,id:crypto.randomUUID()};
        report('正在保存统计…');
        try {
          const changed=await execute('UPDATE practice_progress SET payload=?,revision=revision+1,mutation_id=?,updated_at=? WHERE app_id=? AND revision=? RETURNING payload,revision,mutation_id',[text(payload),text(operation.id),text(new Date().toISOString()),text(appId),{type:'integer',value:revision}]);
          if(!changed[0])throw new Error('统计已被其他页面更新');
          row=changed[0];revision=String(row.revision);
        } catch(error) {
          let observed;
          try {observed=await read();} catch {}
          if(observed?.mutation_id===operation.id&&observed.payload===payload) {row=observed;revision=String(row.revision);}
          else {failure=operation;pending=memory;report(observed&&String(observed.revision)!==operation.revision?'统计已被其他页面更新，当前页未覆盖它；请刷新读取云端版本。':'尚未确认保存，当前页统计仍保留。请核对后重试。',true);return;}
        }
      }
      report('统计已保存');
    } finally {active=false;}
  }
  return {
    available:true,
    get:()=>memory,
    set(value){JSON.parse(value);memory=value;pending=value;void drain();},
    async retry(){
      if(!failure)return;
      const observed=await read();
      if(observed?.mutation_id===failure.id&&observed.payload===failure.payload)revision=String(observed.revision);
      else if(!observed||String(observed.revision)!==failure.revision){report('云端已有其他页面保存的统计；当前页未覆盖它，请刷新读取云端版本。',true);return;}
      failure=null;await drain();
    },
    unsaved:()=>active||!!pending||!!failure,
  };
}
