let sqlFetch, connection, saveChain=Promise.resolve(), saveFailed=false;
async function execute(sql,args=[]) {
 const response=await sqlFetch(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
 if(!response.ok) throw Error('数据库请求结果未知');
 const body=await response.json(), statement=body.results?.[0];
 if(statement?.type!=='ok'||statement.response?.type!=='execute') throw Error('数据库操作未确认');
 return statement.response.result;
}
async function initializeStorage() {
 if(typeof window.tiana?.auth?.getAccessToken!=='function') throw Error('登录不可用');
 connection=await window.tiana.connection(); if(connection.sql_api!=='hrana-v3') throw Error('数据库协议不支持');
 sqlFetch=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
 const result=await execute('SELECT data FROM learning_state WHERE id=1');
 Store.data=result.rows?.length ? JSON.parse(result.rows[0][0].value) : null;
}
function queueSave(value) {
 if(saveFailed)return;
 saveChain=saveChain.then(async()=>{if(saveFailed)return;await execute('INSERT INTO learning_state (id,data) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',[{type:'text',value}]);}).catch(error=>{saveFailed=true;console.error(error);const notice=document.createElement('div');notice.setAttribute('role','alert');notice.style.cssText='position:fixed;top:0;z-index:99999;background:#fff3cd;color:#332;padding:12px';notice.textContent='保存结果未确认，请刷新后核对云端进度。';root.append(notice);});
}
