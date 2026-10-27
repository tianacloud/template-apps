import css from "./style.css?inline";
const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);
import body from "./body.html?raw";
document.title="本周工作台"; document.body.innerHTML=body;

/* ========== 数据层 ========== */
var LS_KEY='wb_weekdesk_tasks_v1', SEED_FLAG='wb_weekdesk_seeded_v1', OWNER_FLAG='wb_weekdesk_owner_v1';
var tasks=[], pendingImgs=[], editId=null, isOwner=false;

function load(){
  try{ tasks=JSON.parse(localStorage.getItem(LS_KEY))||[]; }
  catch(e){ tasks=[]; }
  isOwner=!!localStorage.getItem(OWNER_FLAG);
  if(!localStorage.getItem(SEED_FLAG) && tasks.length===0){ seed(); }
}
function save(){ localStorage.setItem(LS_KEY, JSON.stringify(tasks)); flashSync(); }
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
    return '<img src="'+src+'" alt="附件'+(i+1)+'" data-click="viewImg(this.src)">';
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
  editId=id;
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
  var t=tasks.find(function(x){return x.id===editId;}); if(!t)return;
  t.done=!t.done;
  var n=new Date();
  t.doneAt=t.done?(todayStr()+' '+pad(n.getHours())+':'+pad(n.getMinutes())):'';
  document.getElementById('edDoneBtn').textContent=t.done?'取消完成标记':'标记已完成';
  toast(t.done?'已标记完成':'已取消完成');
}
function edDelete(){
  var t=tasks.find(function(x){return x.id===editId;}); if(!t)return;
  if(!confirm('确定删除任务「'+t.title+'」吗？'))return;
  tasks=tasks.filter(function(x){return x.id!==editId;});
  closeEdit(); save(); refreshAll(); toast('已删除');
}
function viewImg(src){ document.getElementById('viewerImg').src=src; document.getElementById('viewer').classList.add('show'); }

/* 图片：压缩到 800px 宽，最多 9 张 */
function compress(file,cb){
  var rd=new FileReader();
  rd.onload=function(e){
    var img=new Image();
    img.onload=function(){
      var w=Math.min(img.width,800), sc=w/img.width;
      var cv=document.createElement('canvas');
      cv.width=w; cv.height=Math.round(img.height*sc);
      cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
      cb(cv.toDataURL('image/jpeg',0.8));
    };
    img.src=e.target.result;
  };
  rd.readAsDataURL(file);
}
function onPickImgs(input){
  var fs=Array.prototype.slice.call(input.files||[]);
  input.value='';
  fs.forEach(function(f){
    if(pendingImgs.length>=9){ toast('最多 9 张图片'); return; }
    compress(f,function(d){ if(pendingImgs.length<9){ pendingImgs.push(d); renderPending(); } });
  });
}
function renderPending(){
  document.getElementById('pendingImgs').innerHTML=pendingImgs.map(function(src,i){
    return '<div class="thumb"><img src="'+src+'" data-click="viewImg(this.src)"><button class="rm" data-click="rmPending('+i+')">×</button></div>';
  }).join('');
}
function rmPending(i){ pendingImgs.splice(i,1); renderPending(); }

/* 备份 */
function exportJSON(){
  var blob=new Blob([JSON.stringify(tasks,null,2)],{type:'application/json'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='本周工作台备份_'+todayStr()+'.json';
  a.click(); URL.revokeObjectURL(a.href); toast('已导出备份');
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
function importJSON(input){
  var f=input.files&&input.files[0]; input.value=''; if(!f)return;
  var rd=new FileReader();
  rd.onload=function(e){
    try{
      var arr=JSON.parse(e.target.result);
      if(!Array.isArray(arr)) throw 0;
      arr.forEach(function(t){ if(t&&t.title){ tasks.push({id:uid(),title:t.title,note:t.note||'',date:t.date||todayStr(),time:t.time||'',prio:t.prio == null ? 2 : +t.prio,done:!!t.done,doneAt:t.doneAt||'',images:t.images||[],createdAt:t.createdAt||new Date().toISOString()}); }});
      save(); refreshAll(); toast('导入成功');
    }catch(err){ toast('文件格式不正确'); }
  };
  rd.readAsText(f);
}
function clearSeed(){
  if(!confirm('确定清空示例数据吗？（你自己添加的任务也会一起清空，建议先导出备份）'))return;
  tasks=[]; save(); refreshAll(); toast('已清空');
}
/* ===== 一键盘成「我自己的工作台」 ===== */
function makeMine(){
  if(!confirm('将清空当前示例任务，换成一张空白工作台。你自己的数据只存在本机，确定继续？'))return;
  tasks=[]; localStorage.setItem(SEED_FLAG,'1'); localStorage.setItem(OWNER_FLAG,'1');
  save(); closeWelcome(); refreshAll(); toast('已建成你的工作台，开始添加任务吧');
}
function dismissWelcome(){
  localStorage.setItem(SEED_FLAG,'1'); localStorage.setItem(OWNER_FLAG,'1');
  closeWelcome(); renderTools();
}
function closeWelcome(){
  var w=document.getElementById('welcome'); if(w) w.style.display='none';
}
function shareLink(){
  var url=location.href.split('?')[0];
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){ toast('链接已复制，发给同事即可'); },function(){ prompt('复制这个链接分享：',url); });
  } else { prompt('复制这个链接分享：',url); }
}

/* 预置示例数据 */
function seed(){ tasks=[{id:uid(),title:'整理本周工作',note:'示例任务',date:todayStr(),time:'',prio:1,done:false,doneAt:'',images:[],createdAt:new Date().toISOString()}]; }

/* ========== 初始化 ========== */
function init(){
  var d=new Date();
  var wd='日一二三四五六'[d.getDay()];
  document.getElementById('dateLabel').textContent=d.getMonth()+1+'月'+d.getDate()+'日 周'+wd;
  document.getElementById('inpDate').value=todayStr();
  load();
  document.getElementById('inpTitle').addEventListener('keydown',function(e){ if(e.key==='Enter')addTask(); });
  // 粘贴：文本建任务，图片作附件
  document.getElementById('inpTitle').addEventListener('paste',function(e){
    var items=(e.clipboardData||{}).items||[];
    for(var i=0;i<items.length;i++){
      if(items[i].type.indexOf('image')===0){
        e.preventDefault();
        if(pendingImgs.length>=9){ toast('最多 9 张图片'); return; }
        compress(items[i].getAsFile(),function(d){ pendingImgs.push(d); renderPending(); toast('截图已粘贴为附件'); });
        return;
      }
    }
  });
  document.getElementById('editMask').addEventListener('click',function(e){ if(e.target===this)closeEdit(); });
  document.getElementById('viewer').addEventListener('click',function(e){ if(e.target===this)this.classList.remove('show'); });
  refreshAll();
}
init();

Object.assign(window,{load,save,flashSync,uid,toast,pad,fmt,todayStr,weekRange,inWeek,sorted,getTodayItems,getWeekTasks,weekStats,dayCounts,esc,prioChip,imgHtml,taskHtml,renderToday,renderWeekList,renderStats,renderTools,renderWelcome,refreshAll,toggleDone,delTask,addTask,openEdit,closeEdit,saveEdit,shiftDate,shiftNextWeek,edToggleDone,edDelete,viewImg,compress,onPickImgs,renderPending,rmPending,exportJSON,exportDone,importJSON,clearSeed,makeMine,dismissWelcome,closeWelcome,shareLink,seed});

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
for (const type of ['click','change']) document.addEventListener(type, event => {
  const el = event.target.closest('[data-' + type + ']');
  if (el) dispatchAction(el, el.getAttribute('data-' + type));
});
