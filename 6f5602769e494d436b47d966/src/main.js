import { createTianaFetch } from '@tianacloud/serverless';
import css from "./style.css?inline";
import body from "./body.html?raw";
let appRoot, files;

/* ========== 数据层 ========== */
var tasks=[], pendingImgs=[], pendingUploads=0, editId=null, editDone=null, isOwner=false;
var sqlFetch, connection, revision=0, saving=Promise.resolve(), saveFailed=false;
var imageUrls=new Map();
const textArg=value=>({type:'text',value:String(value)});
async function execute(sql,args=[]){
  const res=await sqlFetch(connection.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!res.ok) throw Error('数据库操作结果未知');
  const result=(await res.json()).results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作失败或结果未知');
  return result.response.result;
}
async function load(){
  if(!window.tiana?.auth?.getAccessToken || !files?.put) throw Error('数据或文件服务未就绪');
  connection=await window.tiana.connection();
  if(connection.sql_api!=='hrana-v3') throw Error('数据库协议不支持');
  sqlFetch=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  const result=await execute('SELECT data, revision FROM weekdesk_state WHERE id=1');
  if(!result.rows?.length) throw Error('数据库初始化未完成');
  const state=JSON.parse(result.rows[0][0].value); revision=Number(result.rows[0][1].value);
  tasks=state.tasks; isOwner=!!state.isOwner;
  if(!state.initialized){ seed(); save(); }
  await Promise.all(tasks.flatMap(t=>t.images||[]).map(resolveImage));
}
async function resolveImage(path){
  if(!imageUrls.has(path)) imageUrls.set(path,await files.getUrl(path));
  return imageUrls.get(path);
}
function save(){
  if(saveFailed) return;
  const data=JSON.stringify({tasks,isOwner,initialized:true});
  document.getElementById('syncText').textContent='保存中…';
  saving=saving.then(async()=>{
    if(saveFailed) return;
    const result=await execute('UPDATE weekdesk_state SET data=?, revision=revision+1 WHERE id=1 AND revision=?',[textArg(data),{type:'integer',value:String(revision)}]);
    if(Number(result.affected_row_count)!==1) throw Error('数据已在其他页面更改');
    revision++; flashSync();
  }).catch(e=>{saveFailed=true; document.getElementById('syncText').textContent='保存失败'; alert('保存未确认：'+e.message+'。请先备份当前内容，再重新打开检查。');});
}
function flashSync(){ var t=document.getElementById('syncText'); t.textContent='已保存'; }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function toast(msg){ var el=document.getElementById('toast'); el.textContent=msg; el.style.display='block'; clearTimeout(el._t); el._t=setTimeout(function(){el.style.display='none';},1800); }

function pad(n){ return n<10?'0'+n:''+n; }
function fmt(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function todayStr(){ return fmt(new Date()); }
function weekRange(){
  var now=new Date(); var wd=(now.getDay()+6)%7; // 周一=0
  var mon=new Date(now); mon.setDate(now.getDate()-wd);
  var sun=new Date(mon); sun.setDate(mon.getDate()+6);
  return [fmt(mon),fmt(sun)];
}
function inWeek(ds){ var r=weekRange(); return ds>=r[0]&&ds<=r[1]; }

/* ========== 计算层 ========== */
function sorted(list){
  return list.slice().sort(function(a,b){
    if(a.done!==b.done) return a.done?1:-1;
    if(a.date!==b.date) return a.date<b.date?-1:1;
    var ta=a.time||'99:99', tb=b.time||'99:99';
    if(ta!==tb) return ta<tb?-1:1;
    return a.prio-b.prio;
  });
}
function getTodayItems(){
  var td=todayStr();
  return sorted(tasks.filter(function(t){ return !t.done && t.date<=td; }));
}
function getWeekTasks(){ return sorted(tasks.filter(function(t){ return inWeek(t.date); })); }
function weekStats(){
  var list=getWeekTasks(); var done=0, overdue=0, td=todayStr();
  list.forEach(function(t){ if(t.done)done++; else if(t.date<td)overdue++; });
  return {total:list.length, done:done, overdue:overdue};
}
function dayCounts(){
  var r=weekRange(), m={}; for(var i=0;i<7;i++){ var d=new Date(r[0]); d.setDate(d.getDate()+i); m[fmt(d)]={total:0,done:0}; }
  tasks.forEach(function(t){ if(m[t.date]){ m[t.date].total++; if(t.done)m[t.date].done++; } });
  return m;
}

/* ========== 渲染层（互不调用，统一由 refreshAll 调度） ========== */
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
var ICON_CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
var ICON_ED='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>';
var ICON_DEL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>';

function prioChip(p){ return '<span class="prio p'+p+'">P'+p+'</span>'; }
function imgHtml(t,ctx){
  if(!t.images||!t.images.length) return '';
  return '<div class="t-imgs">'+t.images.map(function(src,i){
    return '<img src="'+esc(imageUrls.get(src)||'')+'" alt="附件'+(i+1)+'" data-click="viewImg(this.src)">';
  }).join('')+'</div>';
}
function taskHtml(t,opts){
  var td=todayStr();
  var overdue=!t.done&&t.date<td;
  var cls='task'+(t.done?' done':'')+(overdue?' overdue':'');
  var h='<div class="'+cls+'" data-id="'+t.id+'">'
    +'<div class="chk" data-click="toggleDone(\''+t.id+'\')">'+ICON_CHECK+'</div>'
    +'<div class="t-body" data-click="openEdit(\''+t.id+'\')" style="cursor:pointer"><div class="t-title">'+esc(t.title)+'</div>'
    +(t.note?'<div class="t-note">'+esc(t.note)+'</div>':'')
    +'<div class="t-meta">'+prioChip(t.prio)
    +(t.time?'<span class="time-chip">'+t.time+'</span>':'')
    +'<span class="sub" style="font-size:12px">'+t.date+'</span>'
    +(overdue?'<span class="overdue-tag">已逾期</span>':'')
    +(t.done&&t.doneAt?'<span class="sub" style="font-size:12px">完成于 '+t.doneAt+'</span>':'')
    +'</div>'+imgHtml(t)+'</div>'
    +'<div class="t-ops">'
    +'<button class="icon-btn" title="编辑" data-click="openEdit(\''+t.id+'\')">'+ICON_ED+'</button>'
    +'<button class="icon-btn" title="删除" data-click="delTask(\''+t.id+'\')">'+ICON_DEL+'</button>'
    +'</div></div>';
  return h;
}
function renderToday(){
  var box=document.getElementById('todayList'), list=getTodayItems();
  document.getElementById('todayCnt').textContent=list.length?list.length+' 项':'';
  if(!list.length){ box.innerHTML='<div class="empty">今天没有待处理事项，太棒了 🎉</div>'.replace(' 🎉',''); return; }
  box.innerHTML=list.map(function(t){
    var td=todayStr(), overdue=t.date<td;
    return '<div class="today-item'+(overdue?' overdue':'')+'">'
      +'<div class="chk" data-click="toggleDone(\''+t.id+'\')">'+ICON_CHECK+'</div>'
      +'<div class="t-title">'+(overdue?'<span class="overdue-tag">逾期 </span>':'')
      +(t.time?'<span class="time-chip">'+t.time+'</span>':'')+esc(t.title)
      +(t.date<td?'<span class="sub" style="font-size:12px">（原定 '+t.date+'，已顺延）</span>':'')
      +'</div></div>';
  }).join('');
}
function renderWeekList(){
  var box=document.getElementById('weekList'), list=getWeekTasks();
  if(!list.length){ box.innerHTML='<div class="empty">本周暂无任务，在上方添加吧</div>'; return; }
  var names=['周一','周二','周三','周四','周五','周六','周日'];
  var r=weekRange(), td=todayStr(), html='';
  for(var i=0;i<7;i++){
    var d=new Date(r[0]); d.setDate(d.getDate()+i); var ds=fmt(d);
    var items=list.filter(function(t){ return t.date===ds; });
    if(!items.length) continue;
    var isToday=ds===td;
    html+='<div class="day-group"><div class="day-head'+(isToday?' today-hl':'')+'">'
      +(isToday?'★ ':'')+names[i]+' '+ds.slice(5).replace('-','月')+'日'
      +'<span class="cnt">'+items.filter(function(t){return !t.done;}).length+' 项待办</span></div>'
      +items.map(function(t){return taskHtml(t);}).join('')+'</div>';
  }
  box.innerHTML=html;
}
function renderStats(){
  var s=weekStats();
  document.getElementById('stTotal').textContent=s.total;
  document.getElementById('stDone').textContent=s.done;
  document.getElementById('stOverdue').textContent=s.overdue;
  var pct=s.total?Math.round(s.done/s.total*100):0;
  var C=2*Math.PI*40, off=C*(1-pct/100);
  document.getElementById('ringSvg').innerHTML=
    '<circle cx="48" cy="48" r="40" fill="none" stroke="#e0f5f2" stroke-width="10"/>'
    +'<circle cx="48" cy="48" r="40" fill="none" stroke="#0e9488" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'" transform="rotate(-90 48 48)"/>'
    +'<text x="48" y="45" text-anchor="middle" font-size="20" font-weight="700" fill="#1f2d3d">'+pct+'%</text>'
    +'<text x="48" y="62" text-anchor="middle" font-size="11" fill="#8a939c">完成率</text>';
  document.getElementById('ringLabel').innerHTML='本周完成 <b>'+s.done+'</b> / '+s.total;
  var r=weekRange();
  document.getElementById('weekRange').textContent=r[0].slice(5).replace('-','/')+' - '+r[1].slice(5).replace('-','/');
  // 7 天柱状
  var dc=dayCounts(), names=['一','二','三','四','五','六','日'], td=todayStr();
  var max=1; Object.keys(dc).forEach(function(k){ if(dc[k].total>max)max=dc[k].total; });
  var r2=weekRange(), html='';
  for(var i=0;i<7;i++){
    var d=new Date(r2[0]); d.setDate(d.getDate()+i); var ds=fmt(d), c=dc[ds];
    var hPct=Math.round(c.total/max*64);
    html+='<div class="day'+(ds===td?' today':'')+'"><span>'+c.done+'/'+c.total+'</span>'
      +'<div class="col" style="height:'+(hPct+4)+'px"><i style="height:'+(c.total?Math.round(c.done/c.total*hPct):0)+'px"></i></div>'
      +'<span class="lbl">'+names[i]+'</span></div>';
  }
  document.getElementById('weekBar').innerHTML=html;
}
function renderTools(){
  document.getElementById('clearSeedBtn').style.display=isOwner?'inline-flex':'none';
  var mt=document.getElementById('modeTag'); if(mt){ mt.className='mode-tag'+(isOwner?' mine':''); mt.textContent=isOwner?'我的工作台':'访客模式'; }
}
function renderWelcome(){
  var w=document.getElementById('welcome'); if(!w) return;
  w.style.display=isOwner?'none':'block';
}
/* 统一刷新入口 */
function refreshAll(){
  renderWelcome();
  renderToday();
  renderWeekList();
  renderStats();
  renderTools();
}

/* ========== 事件与操作（改数据 → refreshAll） ========== */
function toggleDone(id){
  var t=tasks.find(function(x){return x.id===id;}); if(!t)return;
  t.done=!t.done; t.doneAt=t.done?(todayStr()+' '+pad(new Date().getHours())+':'+pad(new Date().getMinutes())):'';
  save(); refreshAll();
}
function delTask(id){
  var t=tasks.find(function(x){return x.id===id;}); if(!t)return;
  if(!confirm('确定删除任务「'+t.title+'」吗？'))return;
  tasks=tasks.filter(function(x){return x.id!==id;});
  save(); refreshAll(); toast('已删除');
}
function addTask(){
  if(pendingUploads){toast('请等待图片上传完成');return;}
  var inp=document.getElementById('inpTitle');
  var title=inp.value.trim(); if(!title){ toast('请输入任务内容'); return; }
  tasks.push({ id:uid(), title:title, note:'', date:document.getElementById('inpDate').value||todayStr(),
    time:document.getElementById('inpTime').value||'', prio:+document.getElementById('inpPrio').value,
    done:false, doneAt:'', images:pendingImgs.slice(), createdAt:new Date().toISOString() });
  inp.value=''; document.getElementById('inpTime').value=''; document.getElementById('inpPrio').value='2';
  pendingImgs=[]; renderPending();
  save(); refreshAll(); toast('已添加');
}
function openEdit(id){
  var t=tasks.find(function(x){return x.id===id;}); if(!t)return;
  editId=id; editDone=t.done;
  document.getElementById('edTitle').value=t.title;
  document.getElementById('edNote').value=t.note||'';
  document.getElementById('edDate').value=t.date;
  document.getElementById('edTime').value=t.time||'';
  document.getElementById('edPrio').value=String(t.prio);
  document.getElementById('edDoneBtn').textContent=t.done?'取消完成标记':'标记已完成';
  document.getElementById('editMask').classList.add('show');
}
function closeEdit(){ document.getElementById('editMask').classList.remove('show'); editId=null; }
function saveEdit(){
  var t=tasks.find(function(x){return x.id===editId;}); if(!t){closeEdit();return;}
  var ti=document.getElementById('edTitle').value.trim(); if(!ti){toast('内容不能为空');return;}
  if(t.done!==editDone){t.done=editDone; t.doneAt=editDone?(todayStr()+' '+pad(new Date().getHours())+':'+pad(new Date().getMinutes())):'';}
  t.title=ti; t.note=document.getElementById('edNote').value.trim();
  t.date=document.getElementById('edDate').value||t.date;
  t.time=document.getElementById('edTime').value||'';
  t.prio=+document.getElementById('edPrio').value;
  closeEdit(); save(); refreshAll(); toast('已保存');
}
function shiftDate(offset){
  var d=new Date(); d.setDate(d.getDate()+offset);
  document.getElementById('edDate').value=fmt(d);
  toast('已设为 '+fmt(d));
}
function shiftNextWeek(){
  var now=new Date(), wd=(now.getDay()+6)%7;
  var next=new Date(now); next.setDate(now.getDate()-wd+7);
  document.getElementById('edDate').value=fmt(next);
  toast('已设为下周一 '+fmt(next));
}
function edToggleDone(){
  if(!editId)return; editDone=!editDone;
  document.getElementById('edDoneBtn').textContent=editDone?'取消完成标记':'标记已完成';
}
function edDelete(){
  var t=tasks.find(function(x){return x.id===editId;}); if(!t)return;
  if(!confirm('确定删除任务「'+t.title+'」吗？'))return;
  tasks=tasks.filter(function(x){return x.id!==editId;});
  closeEdit(); save(); refreshAll(); toast('已删除');
}
function viewImg(src){ document.getElementById('viewerImg').src=src; document.getElementById('viewer').classList.add('show'); }

/* 图片：压缩到 800px 宽，最多 9 张 */
async function storeImage(file){
  if(!file || !file.type.startsWith('image/')) throw Error('请选择图片');
  const path='attachments/'+crypto.randomUUID(); let uploadId;
  try { await files.put(path,file,{onPrepared:r=>{uploadId=r.id;}}); }
  catch(e){ if(!uploadId) throw e; let status=await files.uploadStatus(uploadId); if(!status.completed) status=await files.completeUpload(uploadId); if(!status.completed) throw Error('图片上传结果未知，请稍后检查'); }
  await resolveImage(path); return path;
}
async function onPickImgs(input){
  const fs=Array.from(input.files||[]); input.value='';
  pendingUploads++; try { for(const file of fs){ if(pendingImgs.length>=9){toast('最多 9 张图片');break;} try{ pendingImgs.push(await storeImage(file)); renderPending(); }catch(e){alert('图片上传失败：'+e.message);break;} } } finally {pendingUploads--;}
}
function renderPending(){
  document.getElementById('pendingImgs').innerHTML=pendingImgs.map(function(src,i){
    return '<div class="thumb"><img src="'+esc(imageUrls.get(src)||'')+'" data-click="viewImg(this.src)"><button class="rm" data-click="rmPending('+i+')">×</button></div>';
  }).join('');
}
function rmPending(i){ pendingImgs.splice(i,1); renderPending(); }

/* 备份 */
async function exportJSON(){
  try {
    const copy=await Promise.all(tasks.map(async t=>({...t,images:await Promise.all((t.images||[]).map(async path=>{
      const response=await files.get(path); if(!response.ok) throw Error('图片读取失败');
      const blob=await response.blob(); return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
    }))})));
    const blob=new Blob([JSON.stringify(copy,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='本周工作台备份_'+todayStr()+'.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); toast('已导出备份');
  }catch(e){alert('导出失败：'+e.message);}
}
/* 一键导出本周已完成工作：格式化文本下载 + 复制到剪贴板 */
function exportDone(){
  var wdName='日一二三四五六';
  var done=getWeekTasks().filter(function(t){ return t.done; });
  if(!done.length){ toast('本周还没有已完成的任务'); return; }
  var lines=['本周已完成工作（截至 '+todayStr()+'）',''];
  var byDate={};
  done.forEach(function(t){ (byDate[t.date]=byDate[t.date]||[]).push(t); });
  Object.keys(byDate).sort().forEach(function(ds){
    var d=new Date(ds+'T00:00:00');
    lines.push('【'+ds.slice(5).replace('-','月')+'日 周'+wdName[d.getDay()]+'】');
    byDate[ds].forEach(function(t){
      var tm=(t.time?t.time+' ':'')+(t.doneAt?('（完成于 '+t.doneAt.slice(11)+'）'):'');
      lines.push('- '+t.title+(tm?' '+tm:''));
    });
    lines.push('');
  });
  var text=lines.join('\n');
  var blob=new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='本周已完成工作_'+todayStr()+'.txt';
  a.click(); URL.revokeObjectURL(a.href);
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){ toast('已导出并复制到剪贴板，共 '+done.length+' 项'); },function(){ toast('已导出文件，共 '+done.length+' 项'); });
  } else { toast('已导出文件，共 '+done.length+' 项'); }
}
async function importJSON(input){
  const f=input.files?.[0]; input.value=''; if(!f)return;
  try{
    const arr=JSON.parse(await f.text()); if(!Array.isArray(arr)) throw Error('文件格式不正确');
    const imported=[];
    for(const t of arr){ if(!t?.title) continue; const images=[]; for(const image of t.images||[]){if(typeof image!=='string'||!image.startsWith('data:image/')) throw Error('备份图片格式不正确'); const blob=await (await fetch(image)).blob(); images.push(await storeImage(blob));} imported.push({id:uid(),title:String(t.title),note:String(t.note||''),date:t.date||todayStr(),time:t.time||'',prio:t.prio==null?2:+t.prio,done:!!t.done,doneAt:t.doneAt||'',images,createdAt:t.createdAt||new Date().toISOString()}); }
    tasks.push(...imported); save(); refreshAll(); toast('已导入，正在保存');
  }catch(e){alert('导入失败：'+e.message);}
}
function clearSeed(){
  if(!confirm('确定清空示例数据吗？（你自己添加的任务也会一起清空，建议先导出备份）'))return;
  tasks=[]; save(); refreshAll(); toast('已清空');
}
/* ===== 一键盘成「我自己的工作台」 ===== */
function makeMine(){
  if(!confirm('将清空当前工作台的任务，确定继续？'))return;
  tasks=[]; isOwner=true;
  save(); closeWelcome(); refreshAll(); toast('已建成你的工作台，开始添加任务吧');
}
function dismissWelcome(){
  isOwner=true; save();
  closeWelcome(); renderTools();
}
function closeWelcome(){
  var w=document.getElementById('welcome'); if(w) w.style.display='none';
}
function shareLink(){
  var url=location.href.split('?')[0];
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){ toast('链接已复制，请先通过平台授权分享'); },function(){ prompt('复制这个链接分享：',url); });
  } else { prompt('复制这个链接分享：',url); }
}

/* 预置示例数据 */
function seed(){ tasks=[{id:uid(),title:'整理本周工作',note:'示例任务',date:todayStr(),time:'',prio:1,done:false,doneAt:'',images:[],createdAt:new Date().toISOString()}]; }

/* ========== 初始化 ========== */
async function init(){
  var d=new Date();
  var wd='日一二三四五六'[d.getDay()];
  document.getElementById('dateLabel').textContent=d.getMonth()+1+'月'+d.getDate()+'日 周'+wd;
  document.getElementById('inpDate').value=todayStr();
  try { await load(); } catch(e) { appRoot.innerHTML='<p style="padding:24px">无法加载工作台，请检查数据和文件连接后重新打开。</p>'; return; }
  document.getElementById('inpTitle').addEventListener('keydown',function(e){ if(e.key==='Enter')addTask(); });
  // 粘贴：文本建任务，图片作附件
  document.getElementById('inpTitle').addEventListener('paste',function(e){
    var items=(e.clipboardData||{}).items||[];
    for(var i=0;i<items.length;i++){
      if(items[i].type.indexOf('image')===0){
        e.preventDefault();
        if(pendingImgs.length>=9){ toast('最多 9 张图片'); return; }
        pendingUploads++; storeImage(items[i].getAsFile()).then(d=>{if(pendingImgs.length<9){pendingImgs.push(d);renderPending();toast('截图已粘贴为附件');}}).catch(()=>alert('图片上传失败，请检查后重试')).finally(()=>pendingUploads--); 
        return;
      }
    }
  });
  document.getElementById('editMask').addEventListener('click',function(e){ if(e.target===this)closeEdit(); });
  document.getElementById('viewer').addEventListener('click',function(e){ if(e.target===this)this.classList.remove('show'); });
  refreshAll(); appRoot.style.pointerEvents='';
}
Object.assign(window,{load,save,flashSync,uid,toast,pad,fmt,todayStr,weekRange,inWeek,sorted,getTodayItems,getWeekTasks,weekStats,dayCounts,esc,prioChip,imgHtml,taskHtml,renderToday,renderWeekList,renderStats,renderTools,renderWelcome,refreshAll,toggleDone,delTask,addTask,openEdit,closeEdit,saveEdit,shiftDate,shiftNextWeek,edToggleDone,edDelete,viewImg,onPickImgs,renderPending,rmPending,exportJSON,exportDone,importJSON,clearSeed,makeMine,dismissWelcome,closeWelcome,shareLink,seed});

const allowedActions = new Set(["addTask","clearSeed","closeEdit","dismissWelcome","edDelete","edToggleDone","exportDone","exportJSON","makeMine","saveEdit","shareLink","shiftDate","shiftNextWeek","delTask","openEdit","rmPending","toggleDone","viewImg","importJSON","onPickImgs"]);
function dispatchAction(el, action) {
  if (action === "document.getElementById('importFile').click()") return document.getElementById('importFile').click();
  if (action === "document.getElementById('inpImgs').click()") return document.getElementById('inpImgs').click();
  if (action === "document.getElementById('viewer').classList.remove('show')") return document.getElementById('viewer').classList.remove('show');
  const match = /^(\w+)\((.*?)\)$/.exec(action); if (!match || !allowedActions.has(match[1])) return;
  let arg = match[2];
  if (arg === 'this') arg = el; else if (arg === 'this.src') arg = el.src;
  else if (/^'[^']*'$/.test(arg)) arg = arg.slice(1,-1);
  else if (/^\d+$/.test(arg)) arg = Number(arg);
  else if (arg !== '') return;
  window[match[1]](arg);
}
function handleAction(event){
  const el=event.target.closest('[data-'+event.type+']');
  if(el && appRoot.contains(el)) dispatchAction(el,el.getAttribute('data-'+event.type));
}
export async function mount(root, context){
  appRoot=root; files=context.files; document.title='本周工作台'; root.innerHTML=body; root.style.pointerEvents='none';
  const style=document.createElement('style'); style.textContent=css; root.append(style);
  for(const type of ['click','change']) root.addEventListener(type,handleAction);
  await init();
  return ()=>{for(const type of ['click','change']) root.removeEventListener(type,handleAction);style.remove();};
}
