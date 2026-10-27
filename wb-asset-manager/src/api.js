import {sql} from './db.js';
import fieldTemplates from './fields.json';
import {zipSync,unzipSync,strToU8,strFromU8} from 'fflate';
const id=(prefix)=>prefix+'-'+crypto.randomUUID();
const parse=(s)=>JSON.parse(s);
let execute=sql;
const rows=async(q,args=[]) => (await execute(q,args)).rows;
const write=async(q,args=[]) => execute(q,args);
const asset=(r)=>({id:r.id,...parse(r.data_json),_updated:r.updated_at});
const getTable=async(tid)=>(await rows('SELECT * FROM am_tables WHERE id=?',[tid]))[0];
const allAssets=async()=> (await rows('SELECT a.*,t.type AS table_type FROM am_assets a JOIN am_tables t ON t.id=a.table_id')).map(r=>({...asset(r),tableId:r.table_id,tableType:r.table_type}));
const getRack=async(rid)=>(await rows('SELECT * FROM am_racks WHERE id=?',[rid]))[0];
function device(a){return {assetId:a.id,tableId:a.tableId,name:a.name||'',assetCode:a.assetCode||'',ip:a.ip||'',category:a.category||'其他',model:a.model||'',vendor:a.vendor||'',owner:a.owner||'',status:a.status||'',remark:a.remark||'',location:a.location||'',rackId:a.rackId||'',uStart:Number(a.uStart)||0,uSize:Number(a.uSize)||1};}
async function checkSlot(rackId,start,size,exceptId){
  const rack=await getRack(rackId);if(!rack) throw Error('机柜不存在');
  start=Number(start);size=Number(size);
  if(!Number.isInteger(start)||!Number.isInteger(size)||start<1||size<1||start+size-1>rack.u_total) throw Error('U 位超出机柜范围');
  const occupied=(await allAssets()).filter(a=>a.rackId===rackId&&a.id!==exceptId);
  const clash=occupied.find(a=>start<=Number(a.uStart)+Number(a.uSize||1)-1&&start+size-1>=Number(a.uStart));
  if(clash) throw Error('U 位已被「'+(clash.name||clash.assetCode)+'」占用，请调整后保存');
  return rack;
}
async function locate(text){
  const m=String(text||'').match(/(?:^|\s)([a-z][a-z0-9-]*)\s*(?:柜)?\s+U(\d+)(?:\s*[-~]\s*(?:U)?(\d+))?/i);
  if(!m)return {status:'no_rack'};
  const code=m[1].toUpperCase(),start=Number(m[2]),end=Number(m[3]||m[2]);
  const list=await rows('SELECT r.*,t.name AS room FROM am_racks r JOIN am_tables t ON t.id=r.table_id WHERE UPPER(r.code)=?', [code]);
  const matches=list.filter(r=>text.includes(r.room)||text.includes(r.room.split(' · ')[0]));const rack=matches.length===1?matches[0]:list.length===1?list[0]:null;
  if(!rack)return {status:'rack_missing',code};
  const result={room:rack.room,code:rack.code,rackId:rack.id,uStart:start,uSize:end-start+1,uTotal:rack.u_total};
  return {...result,status:start<1||end<start||end>rack.u_total?'out_of_range':'ok'};
}
async function layout(tid){
  const all=await allAssets();const rr=await rows('SELECT * FROM am_racks WHERE table_id=? ORDER BY rowid',[tid]);
  const racks=rr.map(r=>{const devices=all.filter(a=>a.rackId===r.id).map(device);return {id:r.id,tableId:r.table_id,code:r.code,name:r.name,uTotal:Number(r.u_total),rowLabel:r.row_label,x:Number(r.x),y:Number(r.y),devices,usedU:devices.reduce((n,a)=>n+a.uSize,0)};});
  const usedU=racks.reduce((n,r)=>n+r.usedU,0),totalU=racks.reduce((n,r)=>n+r.uTotal,0),devices=racks.reduce((n,r)=>n+r.devices.length,0);
  return {racks,unlinked:all.filter(a=>(a.tableType==='asset'||a.tableType==='rack')&&!a.rackId&&a.ip).map(device),stats:{racks:racks.length,devices,usedU,freeU:totalU-usedU,pct:totalU?Math.round(usedU/totalU*100):0}};
}
export function makeAPI(files, executor=sql){
 execute=executor;
 const fileUrls=new Map(), assetCache=new Map();
 async function putChecked(path,blob,details){let uploadId='';const key='am-pending-'+details.id;
   try {const done=await files.put(path,blob,{onPrepared:r=>{uploadId=String(r.id);sessionStorage.setItem(key,JSON.stringify({...details,path,uploadId}));}});if(!done?.completed)throw Error('上传结果未确认');return;}
   catch(e){if(!uploadId)throw e;try{let status=await files.uploadStatus(uploadId);if(!status.completed)status=await files.completeUpload(uploadId);if(status.completed)return;}catch(_){}window.dispatchEvent(new Event('asset-upload-pending'));throw Error('上传结果未确认，请保留原文件并检查上传 '+uploadId);}
 }
 const api={
  async getTables(){return rows('SELECT t.id,t.name,t.type,t.description,t.color,t.sort_order,(SELECT count(*) FROM am_assets a WHERE a.table_id=t.id) AS count FROM am_tables t ORDER BY sort_order,id');},
  async createTable(name,type,description,color){const tid=id('t'),fields=fieldTemplates[type]??fieldTemplates.asset;await write('INSERT INTO am_tables(id,name,type,description,color,sort_order,fields_json) VALUES(?,?,?,?,?,?,?)',[tid,name,type,description,color,Date.now(),JSON.stringify(fields)]);return {id:tid};},
  async renameTable(tid,name){await write('UPDATE am_tables SET name=? WHERE id=?',[name,tid]);},
  async deleteTable(tid){for(const a of (await api.getAssets(tid)).rows)await api.deleteAsset(tid,a.id);const rr=await rows('SELECT id FROM am_racks WHERE table_id=?',[tid]);for(const r of rr)await api.req('DELETE','/racks/'+r.id+'?force=1');await write('DELETE FROM am_tables WHERE id=?',[tid]);},
  async getFields(tid){const t=await getTable(tid);if(!t)throw Error('数据表不存在');return parse(t.fields_json);},
  async saveFields(tid,fields){await write('UPDATE am_tables SET fields_json=? WHERE id=?',[JSON.stringify(fields),tid]);},
  async getAssets(tid){const a=await rows('SELECT a.*,(SELECT count(*) FROM am_files f WHERE f.asset_id=a.id) AS file_count FROM am_assets a WHERE a.table_id=? ORDER BY a.rowid',[tid]);const result=a.map(r=>({...asset(r),fileCount:Number(r.file_count)}));assetCache.set(tid,result);return {rows:result,total:a.length};},
  async getAsset(tid,aid){const r=(await rows('SELECT * FROM am_assets WHERE table_id=? AND id=?',[tid,aid]))[0];return r?asset(r):null;},
  async saveAsset(tid,aid,data){
    const fields=await api.getFields(tid);const missing=fields.filter(f=>f.required&&!String(data[f.key]??'').trim());if(missing.length)throw Error('请填写必填项：'+missing.map(f=>f.title).join('、'));
    const prev=aid?await api.getAsset(tid,aid):null;const obj={...(prev||{}),...data};delete obj.id;delete obj._updated;delete obj.tableId;delete obj.tableType;delete obj.fileCount;
    if(data.rackId){const r=await checkSlot(data.rackId,Number(data.uStart),Number(data.uSize)||1,aid),t=await getTable(r.table_id),start=Number(data.uStart),size=Number(data.uSize)||1;Object.assign(obj,{rackId:r.id,uStart:start,uSize:size,location:`${t.name} ${r.code} U${start}${size>1?'-'+(start+size-1):''}`});}
    else if('location' in data){Object.assign(obj,{rackId:'',uStart:'',uSize:''});if(data.location){const loc=await locate(data.location);if(loc.status==='out_of_range')throw Error('U 位超出机柜范围');if(loc.status==='ok'){await checkSlot(loc.rackId,loc.uStart,loc.uSize,aid);Object.assign(obj,{rackId:loc.rackId,uStart:loc.uStart,uSize:loc.uSize,location:`${loc.room} ${loc.code} U${loc.uStart}${loc.uSize>1?'-'+(loc.uStart+loc.uSize-1):''}`});}}}
    const newId=aid||id('a'),values=[newId,tid,JSON.stringify(obj),new Date().toISOString()];
    if(obj.rackId){const start=Number(obj.uStart),end=start+Number(obj.uSize)-1;const result=await write(`INSERT INTO am_assets(id,table_id,data_json,updated_at) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM am_assets WHERE id<>? AND json_extract(data_json,'$.rackId')=? AND CAST(json_extract(data_json,'$.uStart') AS INTEGER)<=? AND CAST(json_extract(data_json,'$.uStart') AS INTEGER)+CAST(json_extract(data_json,'$.uSize') AS INTEGER)-1>=?) ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json,updated_at=excluded.updated_at`,[...values,newId,obj.rackId,end,start]);if(!result.affectedRows)throw Error('U 位已被占用，请刷新后重试');}
    else await write('INSERT INTO am_assets(id,table_id,data_json,updated_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json,updated_at=excluded.updated_at',values);
    return {id:newId};
  },
  async deleteAsset(tid,aid){const list=await api.getFiles(tid,aid);for(const f of list)await api.deleteFile(tid,aid,f.id);await write('DELETE FROM am_assets WHERE table_id=? AND id=?',[tid,aid]);},
  async bulkDelete(tid,ids){for(const aid of ids)await api.deleteAsset(tid,aid);},
  async bulkUpdate(tid,ids,key,value){for(const aid of ids){const a=await api.getAsset(tid,aid);if(a)await api.saveAsset(tid,aid,{...a,[key]:value});}},
  async lookupByIp(ip){const a=(await allAssets()).find(x=>(x.tableType==='asset'||x.tableType==='rack')&&(x.ip===ip||x.mgmtIp===ip));if(!a)return {found:false};const t=await getTable(a.tableId);return {found:true,asset:a,tableName:t?.name,matchOn:a.ip===ip?'ip':'mgmtIp'};},
  async recoverPending(){const pending=Object.keys(sessionStorage).filter(k=>k.startsWith('am-pending-'));let recovered=0;for(const key of pending){const info=JSON.parse(sessionStorage.getItem(key));if(!['attachment','revision'].includes(info.kind))continue;let status=await files.uploadStatus(info.uploadId);if(!status.completed)status=await files.completeUpload(info.uploadId);if(!status.completed)throw Error('上传 '+info.uploadId+' 尚未确认');const old=await rows('SELECT id,path FROM am_files WHERE id=?',[info.id]);try{if(old.length)await write('UPDATE am_files SET path=?,size=? WHERE id=?',[info.path,info.size,info.id]);else await write('INSERT INTO am_files(id,table_id,asset_id,name,path,size,created_at) VALUES(?,?,?,?,?,?,?)',[info.id,info.tid,info.aid,info.name,info.path,info.size,new Date().toISOString()]);}catch(e){const verify=await rows('SELECT path FROM am_files WHERE id=?',[info.id]);if(!verify.some(x=>x.path===info.path))throw Error('附件记录结果未确认，请稍后检查');}sessionStorage.removeItem(key);recovered++;}return recovered;},
  async getFiles(tid,aid){const list=await rows('SELECT * FROM am_files WHERE table_id=? AND asset_id=? ORDER BY created_at',[tid,aid]);for(const f of list){fileUrls.set(f.id,await files.getUrl(f.path));f.ext=f.name.split('.').pop().toLowerCase();f.ftype=/^(png|jpg|jpeg|gif|webp|svg)$/.test(f.ext)?'image':'text';}return list;},
  async uploadFiles(tid,aid,fileList){const saved=[];for(const f of fileList){if(f.size>20*1048576){saved.push({error:'文件超过 20MB'});continue;}const fid=id('f'),path=`assets/${aid}/${fid}/content`;try{await putChecked(path,f,{id:fid,kind:'attachment',tid,aid,name:f.name,size:f.size});try{await write('INSERT INTO am_files(id,table_id,asset_id,name,path,size,created_at) VALUES(?,?,?,?,?,?,?)',[fid,tid,aid,f.name,path,f.size,new Date().toISOString()]);}catch(e){const existing=await rows('SELECT id,path FROM am_files WHERE id=?',[fid]);if(!existing.some(x=>x.path===path))throw Error('附件记录结果未确认，请检查上传后再操作');}sessionStorage.removeItem('am-pending-'+fid);saved.push({id:fid});}catch(e){if(sessionStorage.getItem('am-pending-'+fid))window.dispatchEvent(new Event('asset-upload-pending'));saved.push({error:e.message});}}return {saved};},
  async deleteFile(tid,aid,fid){const f=(await rows('SELECT * FROM am_files WHERE id=? AND table_id=? AND asset_id=?',[fid,tid,aid]))[0];if(!f)return;await files.delete(f.path);await write('DELETE FROM am_files WHERE id=?',[fid]);fileUrls.delete(fid);},
  async renameFile(tid,aid,fid,name){await write('UPDATE am_files SET name=? WHERE id=? AND table_id=? AND asset_id=?',[name,fid,tid,aid]);},
  async updateFileContent(tid,aid,fid,text){const f=(await rows('SELECT * FROM am_files WHERE id=? AND table_id=? AND asset_id=?',[fid,tid,aid]))[0];if(!f)throw Error('文件不存在');const path=`assets/${aid}/${id('revision')}/content`,blob=new Blob([text],{type:'text/plain'});await putChecked(path,blob,{id:fid,kind:'revision',tid,aid,name:f.name,size:blob.size});await write('UPDATE am_files SET path=?,size=? WHERE id=?',[path,blob.size,fid]);fileUrls.set(fid,await files.getUrl(path));sessionStorage.removeItem('am-pending-'+fid);},
  filePreviewUrl(tid,aid,fid){return fileUrls.get(fid)||'';},
  async fileDownloadUrl(tid,aid,fid){const f=(await rows('SELECT * FROM am_files WHERE id=? AND table_id=? AND asset_id=?',[fid,tid,aid]))[0];if(!f)throw Error('文件不存在');const r=await files.get(f.path);if(!r.ok)throw Error('文件下载失败');return URL.createObjectURL(await r.blob());},
  async fetchText(url){const r=await fetch(url);if(!r.ok)throw Error('读取失败');return r.text();},
  exportUrl(tid,ids){const fields=JSON.parse(window.Store?JSON.stringify(window.Store.getFields(tid)):'[]'),data=(assetCache.get(tid)||[]).filter(a=>!ids||ids.includes(a.id));const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const csv='\ufeff'+[fields.map(f=>quote(f.title)).join(','),...data.map(a=>fields.map(f=>quote(a[f.key])).join(','))].join('\r\n');return URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));},
  async importCsv(tid,file){const text=(await file.text()).replace(/^\ufeff/,'');const lines=[];let line=[],v='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){v+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){line.push(v);v='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;line.push(v);lines.push(line);line=[];v='';}else v+=c;}if(v||line.length){line.push(v);lines.push(line);}if(!lines.length)return {imported:0};const fields=await api.getFields(tid),header=lines.shift(),missing=fields.filter(f=>f.required&&!header.includes(f.title)).map(f=>f.title);if(missing.length)return {imported:0,missing};let imported=0;for(const vals of lines){if(!vals.some(Boolean))continue;const obj={};header.forEach((h,i)=>{const f=fields.find(x=>x.title===h||x.key===h);if(f)obj[f.key]=vals[i]||'';});await api.saveAsset(tid,null,obj);imported++;}return {imported,missing:[]};},
  async backupBlob(){const tables=await rows('SELECT * FROM am_tables'),assets=await rows('SELECT * FROM am_assets'),racks=await rows('SELECT * FROM am_racks'),attachments=await rows('SELECT * FROM am_files');const parts={'data.json':strToU8(JSON.stringify({format:'asset-manager-v1',tables,assets,racks,attachments}))};for(const f of attachments){const r=await files.get(f.path);if(!r.ok)throw Error('附件读取失败：'+f.name);parts['uploads/'+f.id]=new Uint8Array(await r.arrayBuffer());}return new Blob([zipSync(parts)],{type:'application/zip'});},
  async backupUrl(){return URL.createObjectURL(await api.backupBlob());},
  async restore(file){const archive=unzipSync(new Uint8Array(await file.arrayBuffer())),raw=archive['data.json'];if(!raw)throw Error('备份缺少 data.json');const data=JSON.parse(strFromU8(raw));if(data.format!=='asset-manager-v1'||!Array.isArray(data.tables)||!Array.isArray(data.assets)||!Array.isArray(data.racks)||!Array.isArray(data.attachments))throw Error('备份格式不受支持');for(const f of data.attachments)if(!archive['uploads/'+f.id])throw Error('备份缺少附件：'+f.name);
    const oldBlob=await api.backupBlob(),backupId=id('before-restore');await putChecked('backups/'+backupId+'.zip',oldBlob,{id:backupId,kind:'backup'});sessionStorage.removeItem('am-pending-'+backupId);
    const imported=[];for(const f of data.attachments){const uploadId=id('restored'),path='restored/'+uploadId+'/content';await putChecked(path,new Blob([archive['uploads/'+f.id]]),{id:uploadId,kind:'restore-file'});sessionStorage.removeItem('am-pending-'+uploadId);imported.push({...f,path});}
    const restoreId=id('restore'),payload=JSON.stringify({...data,attachments:imported});
    try{await write('INSERT INTO am_restore_queue(id,payload) VALUES(?,?)',[restoreId,payload]);}catch(e){let completed;try{completed=await rows('SELECT id FROM am_restore_history WHERE id=?',[restoreId]);}catch(_){throw Error('恢复结果未确认，请保留备份并检查数据');}if(!completed.length)throw Error('恢复未确认，请保留备份并检查数据');}
    return {restored:{assets:data.assets.length,files:imported.length}};},
  async req(method,path,opts={}){
    let m;
    if(method==='GET'&&(m=path.match(/^\/tables\/([^/]+)\/rack-layout$/)))return layout(m[1]);
    if(method==='GET'&&(m=path.match(/^\/tables\/([^/]+)\/resolve-location\?text=(.*)$/)))return locate(decodeURIComponent(m[2]));
    if(method==='POST'&&(m=path.match(/^\/tables\/([^/]+)\/racks$/))){const d=opts.json,rid=id('rack');await write('INSERT INTO am_racks(id,table_id,code,name,u_total,row_label,x,y) VALUES(?,?,?,?,?,?,?,?)',[rid,m[1],d.code.toUpperCase(),d.name||d.code,Number(d.uTotal)||42,d.rowLabel||'',Number(d.x)||0,Number(d.y)||0]);let linked=0;for(const a of await allAssets()){if(a.rackId||!a.location)continue;const l=await locate(a.location);if(l.status==='ok'&&l.rackId===rid){try{await api.saveAsset(a.tableId,a.id,a);linked++;}catch(e){/* 留待用户处理冲突 */}}}return {id:rid,relinked:{linked}};}
    if(method==='PUT'&&(m=path.match(/^\/racks\/([^/]+)$/))){const d=opts.json,r=await getRack(m[1]);if(!r)throw Error('机柜不存在');const max=(await allAssets()).filter(a=>a.rackId===m[1]).reduce((n,a)=>Math.max(n,Number(a.uStart)+Number(a.uSize||1)-1),0);if(Number(d.uTotal)<max)throw Error('机柜容量小于现有设备位置');await write('UPDATE am_racks SET code=?,name=?,u_total=?,row_label=? WHERE id=?',[d.code,d.name||d.code,d.uTotal,d.rowLabel||'',m[1]]);return {};}
    if(method==='DELETE'&&(m=path.match(/^\/racks\/([^/?]+)(?:\?force=1)?$/))){for(const a of (await allAssets()).filter(a=>a.rackId===m[1]))await api.saveAsset(a.tableId,a.id,{...a,rackId:'',uStart:'',uSize:'',location:''});await write('DELETE FROM am_racks WHERE id=?',[m[1]]);return {};}
    if(method==='POST'&&(m=path.match(/^\/racks\/([^/]+)\/move$/))){await write('UPDATE am_racks SET x=?,y=? WHERE id=?',[opts.json.x,opts.json.y,m[1]]);return {};}
    if(method==='POST'&&(m=path.match(/^\/racks\/([^/]+)\/devices$/))){const d=opts.json,a=await api.getAsset(d.tableId,d.assetId);if(!a)throw Error('设备不存在');await checkSlot(m[1],d.uStart,d.uSize,d.assetId);await api.saveAsset(d.tableId,d.assetId,{...a,rackId:m[1],uStart:d.uStart,uSize:d.uSize});return {};}
    if(method==='DELETE'&&(m=path.match(/^\/racks\/([^/]+)\/devices\/([^?]+)\?tableId=(.*)$/))){const tid=decodeURIComponent(m[3]),a=await api.getAsset(tid,m[2]);if(a)await api.saveAsset(tid,m[2],{...a,rackId:'',uStart:'',uSize:'',location:''});return {};}
    throw Error('该操作尚未完成');
  }
 };
 return api;
}
