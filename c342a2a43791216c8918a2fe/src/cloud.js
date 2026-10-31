import {createTianaFetch} from '@tianacloud/serverless';
export async function connectStore() {
 const auth=window.tiana?.auth; if(!auth?.getAccessToken || !window.tiana?.connection) throw Error('数据库登录服务不可用');
 const conn=await window.tiana.connection(); if(conn.sql_api!=='hrana-v3') throw Error('数据库协议不支持');
 const send=createTianaFetch({origin:conn.origin,auth,requestBodyMode:'buffered'});
 async function sql(statement,args=[]) { const response=await send(conn.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})}); if(!response.ok) throw Error('数据库响应不可用'); const item=(await response.json()).results?.[0]; if(item?.type!=='ok'||item.response?.type!=='execute') throw Error('数据库操作结果未知'); return item.response.result; }
 const result=await sql('SELECT revision, settings, data FROM tomato_state WHERE id = 1'); if(!result.rows?.length) throw Error('数据库尚未初始化');
 let revision=Number(result.rows[0][0].value), queue=Promise.resolve(), failed=false, pending=0;
 const warning=document.createElement('div'); warning.style.cssText='position:fixed;z-index:99999;top:0;left:0;right:0;background:#a11;color:white;padding:12px;text-align:center'; warning.hidden=true; document.body.append(warning);
 function save(column,value) { if(failed) return; pending++; queue=queue.then(async()=>{ if(failed) return; const result=await sql(`UPDATE tomato_state SET ${column} = ?, revision = revision + 1 WHERE id = 1 AND revision = ?`,[{type:'text',value},{type:'integer',value:String(revision)}]); if(result.affected_row_count!==1) throw Error('数据已在其他页面修改'); revision++; }).catch(()=>{failed=true;warning.hidden=false;warning.textContent='保存失败或结果未知，请先导出备份，再重新打开核对数据。';}).finally(()=>pending--); }
 window.addEventListener('beforeunload',e=>{if(failed||pending){e.preventDefault();e.returnValue='';}});
 return {initial:{settings:result.rows[0][1].value||null,data:result.rows[0][2].value||null},save};
}
