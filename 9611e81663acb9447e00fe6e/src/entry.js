import { createTianaFetch } from '@tianacloud/serverless';
export async function mount(root, context) {
 try {
  if (!context.files?.bindImage || !window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw Error('账号或文件服务未就绪');
  const conn=await window.tiana.connection(); if(conn.sql_api!=='hrana-v3') throw Error('当前数据库协议不支持安全写入');
  const transport=createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  async function sql(statement,values=[]) {
   const res=await transport(conn.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})});
   if(!res.ok) throw Error('数据库响应未确认'); const item=(await res.json()).results?.[0]; if(item?.type!=='ok'||item.response?.type!=='execute') throw Error('数据库操作未确认'); return item.response.result;
  }
  async function read(){const r=await sql('SELECT value, version FROM training_state WHERE id=?',['main']);return r.rows?.[0]?{value:r.rows[0][0].value,version:Number(r.rows[0][1].value)}:null;}
  const current=await read(); window.trainingInitial=current?JSON.parse(current.value):{v:1,days:{}};
  let version=current?.version??null,failed=false,queue=Promise.resolve();
  window.trainingSave=(value)=>{queue=queue.then(async()=>{if(failed) throw Error('先重新打开并核对数据');const expected=version;try{const result=expected===null?await sql('INSERT INTO training_state(id,value,version) VALUES(?,?,1) ON CONFLICT(id) DO NOTHING',['main',value]):await sql('UPDATE training_state SET value=?,version=version+1 WHERE id=? AND version=?',[value,'main',expected]);if(Number(result.affected_row_count)!==1) throw Error('记录已被其他窗口更改');version=expected===null?1:expected+1;}catch(e){try{const actual=await read();if(actual?.value===value&&actual.version===(expected===null?1:expected+1)){version=actual.version;return;}}catch{}failed=true;throw e;}});return queue;};
  window.trainingFiles=context.files;root.innerHTML='<div id="app"></div>';await import('./app.js');return ()=>{root.innerHTML='';};
 }catch(e){root.textContent='无法连接应用数据或素材：'+e.message+'。请检查连接后重新打开。';}
}
