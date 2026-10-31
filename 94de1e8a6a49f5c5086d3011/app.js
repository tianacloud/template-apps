
/* ============ 法定节假日数据（2025-2026 官方安排） ============ */
const HOLIDAYS = {
  "2025-01-01":"元旦",
  "2025-01-28":"春节","2025-01-29":"春节","2025-01-30":"春节","2025-01-31":"春节","2025-02-01":"春节","2025-02-02":"春节","2025-02-03":"春节","2025-02-04":"春节",
  "2025-04-04":"清明","2025-04-05":"清明","2025-04-06":"清明",
  "2025-05-01":"劳动节","2025-05-02":"劳动节","2025-05-03":"劳动节","2025-05-04":"劳动节","2025-05-05":"劳动节",
  "2025-05-31":"端午","2025-06-01":"端午","2025-06-02":"端午",
  "2025-10-01":"国庆中秋","2025-10-02":"国庆中秋","2025-10-03":"国庆中秋","2025-10-04":"国庆中秋","2025-10-05":"国庆中秋","2025-10-06":"国庆中秋","2025-10-07":"国庆中秋","2025-10-08":"国庆中秋",
  "2026-01-01":"元旦","2026-01-02":"元旦","2026-01-03":"元旦",
  "2026-02-15":"春节","2026-02-16":"春节","2026-02-17":"春节","2026-02-18":"春节","2026-02-19":"春节","2026-02-20":"春节","2026-02-21":"春节","2026-02-22":"春节","2026-02-23":"春节",
  "2026-04-04":"清明","2026-04-05":"清明","2026-04-06":"清明",
  "2026-05-01":"劳动节","2026-05-02":"劳动节","2026-05-03":"劳动节","2026-05-04":"劳动节","2026-05-05":"劳动节",
  "2026-06-19":"端午","2026-06-20":"端午","2026-06-21":"端午",
  "2026-09-25":"中秋","2026-09-26":"中秋","2026-09-27":"中秋",
  "2026-10-01":"国庆","2026-10-02":"国庆","2026-10-03":"国庆","2026-10-04":"国庆","2026-10-05":"国庆","2026-10-06":"国庆","2026-10-07":"国庆",
};
const WORKDAYS = {
  "2025-01-26":1,"2025-02-08":1,"2025-04-27":1,"2025-09-28":1,"2025-10-11":1,
  "2026-01-04":1,"2026-02-14":1,"2026-02-28":1,"2026-05-09":1,"2026-09-20":1,"2026-10-10":1,
};

/* ============ 数据层（服务端同步，多端轮询） ============ */
let state = { tasks:{q1:[],q2:[],q3:[],q4:[]}, plans:{}, vips:[], imgs:[], routines:[] };
let revision = 0, db, writeQueue = Promise.resolve(), writable = false;
function mergeState(d){
  d=d||{};
  return {tasks:Object.assign({q1:[],q2:[],q3:[],q4:[]},d.tasks||{}), plans:d.plans||{}, vips:Array.isArray(d.vips)?d.vips:[], imgs:[], routines:Array.isArray(d.routines)?d.routines:[]};
}
function markDeleted(){} function clearTombstone(){} function saveTombstones(){}
let tombstones={tasks:[],vips:[],routines:[],imgs:[],plans:[]};
async function execute(sql,args=[]){
  const r=await db.fetch(`${db.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!r.ok) throw Error('数据库响应不可用');
  const result=(await r.json()).results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作未确认');
  return result.response.result;
}
async function readState(){
  const result=await execute('SELECT revision, data FROM task_state WHERE id = 1');
  if(!result.rows?.length) throw Error('数据库未初始化');
  return {revision:Number(result.rows[0][0].value),data:result.rows[0][1].value};
}
function saveState(){
  if(!writable){toast('数据库未就绪，请重新打开应用');return;}
  const data=JSON.stringify({...state,imgs:[]});
  writeQueue=writeQueue.then(async()=>{
    if(!writable) return;
    const expected=revision;
    try {
      const result=await execute('UPDATE task_state SET data = ?, revision = revision + 1 WHERE id = 1 AND revision = ?', [{type:'text',value:data},{type:'integer',value:String(expected)}]);
      if(Number(result.affected_row_count)!==1) throw Error('数据已在其他页面更改');
      revision=expected+1;
    } catch(error){
      // A lost response can still mean the update committed. Read before deciding.
      try { const latest=await readState(); if(latest.revision===expected+1 && latest.data===data){revision=latest.revision;return;} } catch(_) {}
      writable=false; console.error('保存未确认',error); const warning=document.createElement('div'); warning.setAttribute('role','alert'); warning.style.cssText='position:fixed;z-index:9999;top:0;left:0;right:0;background:#fff1d6;color:#602900;padding:12px;text-align:center'; warning.textContent='保存未确认或数据冲突。请在数据管理中导出备份，然后重新打开应用。'; document.body.append(warning); toast('保存未确认');
    }
  });
}
/* ============ 数据管理 ============ */
function openSettings(){
  showSheet(`<h3>数据管理</h3>
    <label>任务和计划保存在云端数据库；图片保存在应用文件空间。</label>
    <div class="row" style="margin-top:8px">
      <button class="btn-ghost" id="dExport">导出备份</button>
    </div>
    <div class="row">
      <button class="btn-ghost" id="dImport">导入并覆盖</button>
      <button class="btn-primary" data-close-sheet>完成</button>
    </div>`);
  document.getElementById("dExport").onclick=()=>{
    const blob=new Blob([JSON.stringify({...state,imgs:[]},null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download="任务列表备份_"+ymd(new Date())+".json"; a.click();
    toast("✅ 备份文件已下载");
  };
  document.getElementById("dImport").onclick=()=>{
    const inp=document.createElement("input"); inp.type="file"; inp.accept=".json,application/json";
    inp.onchange=async()=>{
      const f=inp.files[0]; if(!f) return;
      try{
        const d=JSON.parse(await f.text()); state=mergeState(d);
        // 导入的是用户想恢复的数据，清空墓碑，避免被过滤掉
        tombstones={tasks:[],vips:[],routines:[],imgs:[],plans:[]}; saveTombstones();
        saveState(); renderAll(); closeSheet();
        toast("✅ 已导入");
      }catch(e){ toast("⚠️ 文件格式不对"); }
    };
    inp.click();
  };
}

/* ============ 图片层（压缩后上传服务端，多端可见） ============ */
function compressImage(blob, maxDim=1400, quality=0.82){
  return new Promise((resolve)=>{
    const url=URL.createObjectURL(blob);
    const img=new Image();
    img.onload=()=>{
      let w=img.naturalWidth, h=img.naturalHeight;
      const scale=Math.min(1, maxDim/Math.max(w,h));
      w=Math.max(1,Math.round(w*scale)); h=Math.max(1,Math.round(h*scale));
      const c=document.createElement("canvas"); c.width=w; c.height=h;
      const ctx=c.getContext("2d");
      ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h);
      ctx.drawImage(img,0,0,w,h);
      URL.revokeObjectURL(url);
      c.toBlob((out)=>{
        if(out) resolve(out);
        else { try{ resolve(dataURLtoBlob(c.toDataURL("image/jpeg",quality))); }catch(e){ resolve(blob); } }
      }, "image/jpeg", quality);
    };
    img.onerror=()=>{ URL.revokeObjectURL(url); resolve(blob); };
    img.src=url;
  });
}
function dataURLtoBlob(d){
  const [head, body] = d.split(",");
  const mime = (head.match(/:(.*?);/)||[])[1] || "image/jpeg";
  const bin = atob(body); const arr = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
  return new Blob([arr], {type:mime});
}
/* 上传一张图片到服务端，并让服务端写入 state.imgs */
async function refreshImages(){
  if(!files) throw Error('文件服务未就绪');
  let cursor, all=[]; do { const page=await files.list('images/',{cursor}); all.push(...(page.items||[]).filter(x=>x.path&&!x.isDirectory)); cursor=page.cursor||page.next_cursor; } while(cursor);
  state.imgs=await Promise.all(all.map(async x=>({id:x.path,url:await files.getUrl(x.path)}))); renderImages();
}
async function addImage(blob, name){
  if(sessionStorage.getItem('pending-image')) throw Error('已有未确认的上传，请重新打开应用以检查');
  const out=await compressImage(blob), path='images/'+Date.now().toString(36)+'-'+crypto.randomUUID()+'.jpg';
  let uploadId; try { await files.put(path,out,{onPrepared:r=>{uploadId=r.id; sessionStorage.setItem('pending-image',JSON.stringify({path,uploadId}));}}); }
  catch(e){ if(!uploadId)throw e; let s=await files.uploadStatus(uploadId); if(!s.completed)s=await files.completeUpload(uploadId); if(!s.completed)throw e; }
  sessionStorage.removeItem('pending-image'); await refreshImages();
}
async function delImage(id){
  if(!confirm('确定删除这张图片吗？'))return;
  try{await files.delete(id); await refreshImages(); toast('已删除');}catch(e){toast('删除失败，请重试');}
}
/* ============ 工具 ============ */
function ymd(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function parseYmd(s){ const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),1900); }
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function emptyBox(text){ return `<div class="empty"><svg class="ic"><use href="#i-inbox"/></svg><span>${text}</span></div>`; }

/* ============ 顶部概览 ============ */
function updateHeaderStats(){
  const t=state.tasks||{}; let done=0,total=0;
  ["q1","q2","q3","q4"].forEach(q=>(t[q]||[]).forEach(x=>{ total++; if(x.done) done++; }));
  const el=document.getElementById("hdrStats"); if(!el) return;
  el.innerHTML=`<span class="stat"><b>${total-done}</b>待办</span><span class="stat"><b>${done}</b>已完成</span><span class="stat"><b>${(state.routines||[]).length}</b>固定</span>`;
}

/* ============ 四象限 ============ */
const QNAMES={q1:"重要且紧急",q2:"重要不紧急",q3:"紧急不重要",q4:"不紧急不重要"};
/* 计算「完成时间」还剩几天 */
function dueInfo(due){
  if(!due) return {cls:"", txt:""};
  const t=new Date(); t.setHours(0,0,0,0);
  const d=parseYmd(due); d.setHours(0,0,0,0);
  const n=Math.round((d-t)/86400000);
  if(n<0) return {cls:"over", txt:"逾期"+(-n)+"天", n};
  if(n===0) return {cls:"soon", txt:"今天", n};
  if(n===1) return {cls:"soon", txt:"明天", n};
  if(n<=3) return {cls:"soon", txt:n+"天", n};
  return {cls:"", txt:n+"天", n};
}
function renderTasks(){
  ["q1","q2","q3","q4"].forEach(q=>{
    const ul=document.getElementById("list-"+q); ul.innerHTML="";
    if(!state.tasks[q].length){ ul.innerHTML=emptyBox("暂无任务"); return; }
    state.tasks[q].forEach(t=>{
      const li=document.createElement("li");
      li.dataset.id=t.id;
      if(t.done) li.className="is-done";
      const di=dueInfo(t.due);
      const dueHtml=t.due?`<span class="due ${di.cls}" title="完成时间 ${t.due}">${di.txt}</span>`:"";
      li.innerHTML=`<span class="chk"></span><span class="txt">${escapeHtml(t.text)}</span>${dueHtml}<span class="del" aria-label="删除">✕</span>`;
      ul.appendChild(li);
    });
  });
  updateHeaderStats();
}
/* 添加 / 编辑任务（含完成时间） */
function taskForm(q, t){
  const isEdit=!!t;
  const cur=t||{text:"",due:""};
  showSheet(`<h3>${isEdit?"编辑":"添加"}任务 · ${QNAMES[q]}</h3>
    <label>任务内容</label><textarea id="taskTxt" placeholder="输入任务…">${escapeHtml(cur.text||"")}</textarea>
    <label>完成时间（可选，会提示还剩几天）</label><input id="taskDue" type="date" value="${cur.due||""}">
    <div class="row"><button class="btn-ghost" data-close-sheet>取消</button><button class="btn-primary" id="taskSave">${isEdit?"保存":"添加"}</button></div>`);
  document.getElementById("taskSave").onclick=()=>{
    const text=document.getElementById("taskTxt").value.trim();
    const due=document.getElementById("taskDue").value||"";
    if(!text){ toast("请输入内容"); return; }
    if(isEdit){ t.text=text; t.due=due; }
    else state.tasks[q].push({id:uid(),text,done:false,due});
    saveState(); closeSheet(); renderTasks(); toast(isEdit?"已保存":"已添加");
  };
}

/* ============ 日历 ============ */
let calY, calM;
function renderCalendar(){
  const grid=document.getElementById("calGrid"); grid.innerHTML="";
  const first=new Date(calY,calM,1);
  const startDay=first.getDay();
  const daysInMonth=new Date(calY,calM+1,0).getDate();
  const daysInPrev=new Date(calY,calM,0).getDate();
  const NOTE = (calY>2026) ? "<small>节假日未公布</small>" : (calY<2025 ? "<small>数据不全</small>" : "");
  document.getElementById("calTitle").innerHTML=calY+" 年 "+(calM+1)+" 月"+NOTE;
  const today=ymd(new Date());
  for(let i=startDay-1;i>=0;i--){ const d=daysInPrev-i; grid.appendChild(mkDay(calY,calM-1,d,true)); }
  for(let d=1;d<=daysInMonth;d++){ grid.appendChild(mkDay(calY,calM,d,false)); }
  const total=startDay+daysInMonth; const trail=(Math.ceil(total/7)*7)-total;
  for(let d=1;d<=trail;d++){ grid.appendChild(mkDay(calY,calM+1,d,true)); }
  function mkDay(y,m,d,other){
    const dt=new Date(y,m,d); const ymdStr=ymd(dt);
    const cell=document.createElement("div");
    cell.className="day";
    if(other) cell.classList.add("other");
    const dow=dt.getDay();
    if(!other && (dow===0||dow===6) && !HOLIDAYS[ymdStr] && !WORKDAYS[ymdStr]) cell.classList.add("weekend");
    if(HOLIDAYS[ymdStr]) cell.classList.add("holiday");
    if(WORKDAYS[ymdStr]) cell.classList.add("workday");
    if(ymdStr===today) cell.classList.add("today");
    if(selDay && ymdStr===selDay) cell.classList.add("selected");
    if(state.plans[ymdStr] && state.plans[ymdStr].length) cell.classList.add("has-plan");
    const hd=HOLIDAYS[ymdStr]?HOLIDAYS[ymdStr]:(WORKDAYS[ymdStr]?"班":"");
    cell.innerHTML=`<div>${d}</div>`+(hd?`<div class="hd">${hd}</div>`:"");
    cell.onclick=()=>openDay(ymdStr);
    return cell;
  }
}

/* ============ 当日安排 ============ */
let selDay=null;
function renderDayPanel(dateStr){
  document.getElementById("planTitle").textContent=dateStr+" 当日安排 "+(HOLIDAYS[dateStr]?("· "+HOLIDAYS[dateStr]):(WORKDAYS[dateStr]?"· 调休上班":""));
  const list=document.getElementById("planList"); list.innerHTML="";
  const arr=state.plans[dateStr]||[];
  if(!arr.length){ list.innerHTML=emptyBox("暂无安排"); }
  else arr.forEach((p,i)=>{ const d=document.createElement("div"); d.className="pi";
    d.innerHTML=`<span>${escapeHtml(p)}</span><span class="del" data-i="${i}">✕</span>`; list.appendChild(d); });
  document.getElementById("addPlan").onclick=()=>{
    showSheet(`<h3>添加安排 · ${dateStr}</h3>
      <label>安排内容</label><textarea id="planTxt" placeholder="例如：提交周报、团建活动…"></textarea>
      <div class="row"><button class="btn-ghost" data-close-sheet>取消</button><button class="btn-primary" id="planSave">保存</button></div>`);
    document.getElementById("planSave").onclick=()=>{
      const v=document.getElementById("planTxt").value.trim(); if(!v){ toast("请输入内容"); return; }
      (state.plans[dateStr]=state.plans[dateStr]||[]).push(v);
      clearTombstone("plans", dateStr+"::"+v);   // 重新添加同内容时撤销墓碑
      saveState(); closeSheet(); openDay(dateStr); renderCalendar(); toast("已保存");
    };
  };
  list.querySelectorAll(".del").forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;
    const txt=state.plans[dateStr][i];
    state.plans[dateStr].splice(i,1); if(!state.plans[dateStr].length) delete state.plans[dateStr];
    markDeleted("plans", dateStr+"::"+txt);
    saveState(); renderDayPanel(dateStr); renderCalendar();
  });
}
function openDay(dateStr){
  selDay=dateStr;
  const dt=parseYmd(dateStr); calY=dt.getFullYear(); calM=dt.getMonth();
  renderDayPanel(dateStr);
  switchView("cal");
}

/* ============ VIP ============ */
function daysLeft(exp){ const t=new Date(); t.setHours(0,0,0,0); const e=parseYmd(exp); e.setHours(0,0,0,0); return Math.round((e-t)/86400000); }
function safeLink(value){ try { const url=new URL(value); return ['http:','https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } }
function renderVips(){
  const box=document.getElementById("vipList"); box.innerHTML="";
  if(!state.vips.length){ box.innerHTML='<div class="card">'+emptyBox("暂无 VIP，点上方按钮添加")+'</div>'; return; }
  const sorted=[...state.vips].sort((a,b)=>parseYmd(a.expire)-parseYmd(b.expire));
  sorted.forEach(v=>{
    const dl=daysLeft(v.expire);
    const cls = dl<0?"urgent":(dl<=7?"urgent":(dl<=30?"warn":""));
    const dlTxt = dl<0?`已过期 ${-dl} 天`:(dl===0?"今天到期":`剩 ${dl} 天`);
    const card=document.createElement("div"); card.className="vip-card "+cls;
    card.innerHTML=`<div class="top"><span class="name">${escapeHtml(v.name)}</span><span class="days">${dlTxt}</span></div>
      <div class="meta">到期：${v.expire}${v.note?(" · "+escapeHtml(v.note)):""}</div>
      <div class="acts">
        ${safeLink(v.link)?`<a class="link" href="${escapeHtml(safeLink(v.link))}" target="_blank" rel="noopener">打开链接</a>`:`<span class="link" style="background:var(--bg);color:var(--faint)">未设链接</span>`}
        <button class="edit" data-id="${v.id}">编辑</button>
        <button class="del" data-id="${v.id}">删除</button>
      </div>`;
    box.appendChild(card);
  });
  box.querySelectorAll(".edit").forEach(b=>b.onclick=()=>editVip(b.dataset.id));
  box.querySelectorAll(".del").forEach(b=>b.onclick=()=>{
    const id=b.dataset.id;
    state.vips=state.vips.filter(x=>x.id!==id);
    markDeleted("vips", id);
    saveState(); renderVips(); toast("已删除");
  });
}
function vipForm(v){
  v=v||{}; const isEdit=!!v.id;
  showSheet(`<h3>${isEdit?"编辑":"添加"} VIP 到期提醒</h3>
    <label>名称</label><input id="vName" value="${escapeHtml(v.name||"")}" placeholder="例如：爱奇艺会员、百度网盘 SVIP">
    <label>到期日期</label><input id="vExp" type="date" value="${v.expire||""}">
    <label>服务链接（可选，点开查看账户）</label><input id="vLink" value="${escapeHtml(v.link||"")}" placeholder="https://...">
    <label>备注（可选）</label><input id="vNote" value="${escapeHtml(v.note||"")}" placeholder="例如：连续包月、自动续费">
    <div class="row"><button class="btn-ghost" data-close-sheet>取消</button><button class="btn-primary" id="vSave">保存</button></div>`);
  document.getElementById("vSave").onclick=()=>{
    const name=document.getElementById("vName").value.trim();
    const expire=document.getElementById("vExp").value;
    const link=document.getElementById("vLink").value.trim();
    const note=document.getElementById("vNote").value.trim();
    if(link && !safeLink(link)){ toast("请输入有效的 HTTP 或 HTTPS 链接"); return; }
    if(!name||!expire){ toast("请填写名称和到期日期"); return; }
    if(isEdit){ Object.assign(v,{name,expire,link,note}); }
    else state.vips.push({id:uid(),name,expire,link,note});
    saveState(); closeSheet(); renderVips(); toast("已保存");
  };
}
function editVip(id){ const v=state.vips.find(x=>x.id===id); if(v) vipForm(v); }

/* ============ 每日固定安排 ============ */
function renderRoutines(){
  const box=document.getElementById("fixedList"); box.innerHTML="";
  const arr=[...state.routines].sort((a,b)=> (a.time<b.time?-1:(a.time>b.time?1:0)));
  if(!arr.length){ box.innerHTML='<div class="card">'+emptyBox("暂无固定安排，点上方按钮添加")+'</div>'; return; }
  arr.forEach(r=>{
    const card=document.createElement("div"); card.className="fixed-card";
    card.innerHTML=`<div class="time">${escapeHtml(r.time)}</div><div class="ftxt">${escapeHtml(r.text)}</div>
      <div class="acts"><button class="edit" data-id="${r.id}">编辑</button><button class="del" data-id="${r.id}">删除</button></div>`;
    box.appendChild(card);
  });
  box.querySelectorAll(".edit").forEach(b=>b.onclick=()=>editFixed(b.dataset.id));
  box.querySelectorAll(".del").forEach(b=>b.onclick=()=>{
    const id=b.dataset.id;
    state.routines=state.routines.filter(x=>x.id!==id);
    markDeleted("routines", id);
    saveState(); renderRoutines(); toast("已删除");
  });
  updateHeaderStats();
}
function fixedForm(v){
  v=v||{}; const isEdit=!!v.id;
  showSheet(`<h3>${isEdit?"编辑":"添加"}每日固定安排</h3>
    <label>时间（每天固定）</label><input id="fTime" type="time" value="${escapeHtml(v.time||"")}">
    <label>要做的安排</label><textarea id="fText" placeholder="例如：健身、看书 30 分钟、背单词…">${escapeHtml(v.text||"")}</textarea>
    <div class="row"><button class="btn-ghost" data-close-sheet>取消</button><button class="btn-primary" id="fSave">保存</button></div>`);
  document.getElementById("fSave").onclick=()=>{
    const time=document.getElementById("fTime").value;
    const text=document.getElementById("fText").value.trim();
    if(!time||!text){ toast("请填写时间和内容"); return; }
    if(isEdit){ Object.assign(v,{time,text}); }
    else state.routines.push({id:uid(),time,text});
    saveState(); closeSheet(); renderRoutines(); toast("已保存");
  };
}
function editFixed(id){ const v=state.routines.find(x=>x.id===id); if(v) fixedForm(v); }

/* ============ 图片 ============ */
function renderImages(){
  const grid=document.getElementById("imgGrid"); grid.innerHTML="";
  const imgs=[...state.imgs].reverse();
  if(!imgs.length){ grid.innerHTML='<div class="empty" style="grid-column:1/-1"><svg class="ic"><use href="#i-inbox"/></svg><span>暂无图片</span></div>'; return; }
  imgs.forEach(im=>{
    const it=document.createElement("div"); it.className="item";
    it.innerHTML=`<img src="${im.url}" alt="" loading="lazy"><button class="del" data-id="${im.id}" aria-label="删除">✕</button>`;
    it.querySelector("img").onclick=()=>{ const p=document.getElementById("imgPopImg"); p.src=im.url; document.getElementById("imgPop").classList.add("show"); };
    it.querySelector(".del").onclick=()=>delImage(im.id);
    grid.appendChild(it);
  });
}

/* ============ 弹窗 ============ */
function showSheet(html){ document.getElementById("sheet").innerHTML=html; document.getElementById("mask").classList.add("show"); }
function closeSheet(){ document.getElementById("mask").classList.remove("show"); }
document.getElementById("mask").onclick=e=>{ if(e.target.id==="mask" || e.target.closest("[data-close-sheet]")) closeSheet(); };

/* ============ 视图切换 ============ */
function switchView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("view-"+name).classList.add("active");
  document.querySelectorAll(".tabbar button").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  if(name==="cal") renderCalendar();
  if(name==="img") refreshImages().catch(()=>toast("图片加载失败"));
  if(name==="fixed") renderRoutines();
}
function renderAll(){
  renderTasks(); renderVips();
  if(document.getElementById("view-cal").classList.contains("active")) renderCalendar();
  if(document.getElementById("view-img").classList.contains("active")) renderImages();
  if(document.getElementById("view-fixed").classList.contains("active")) renderRoutines();
  updateHeaderStats();
}

/* ============ 事件绑定 ============ */
document.querySelectorAll(".tabbar button").forEach(b=>b.onclick=()=>switchView(b.dataset.view));
document.querySelectorAll(".quad .add").forEach(b=>b.onclick=()=>taskForm(b.dataset.q));
document.querySelectorAll("#view-quad .quad ul").forEach(ul=>{
  ul.addEventListener("click",e=>{
    const li=e.target.closest("li"); if(!li) return;
    const el=e.target;
    const q=ul.id.replace("list-","");
    const id=li.dataset.id;
    const t=state.tasks[q].find(x=>x.id===id); if(!t) return;
    if(el.classList.contains("del")){
      state.tasks[q]=state.tasks[q].filter(x=>x.id!==id);
      markDeleted("tasks", id);
      saveState();
      li.style.opacity="0"; li.style.transform="translateX(10px)";
      setTimeout(()=>{ renderTasks(); }, 170);
      return;
    }
    if(el.classList.contains("chk")){
      t.done=!t.done; saveState();
      li.classList.toggle("is-done", t.done);
      updateHeaderStats();
      return;
    }
    if(el.classList.contains("txt") || el.classList.contains("due")){
      taskForm(q, t);
    }
  });
});
document.getElementById("prevM").onclick=()=>{ calM--; if(calM<0){calM=11;calY--;} renderCalendar(); };
document.getElementById("nextM").onclick=()=>{ calM++; if(calM>11){calM=0;calY++;} renderCalendar(); };
document.getElementById("addVip").onclick=()=>vipForm();
document.getElementById("addFixed").onclick=()=>fixedForm();
document.getElementById("addImg").onclick=()=>document.getElementById("imgInput").click();
document.getElementById("imgInput").onchange=async e=>{
  const files=e.target.files; if(!files.length) return;
  let ok=0, fail=0;
  for(const f of files){
    try{ await addImage(f, f.name||"拍照图片"); ok++; }
    catch(err){ console.error("add image fail", err); fail++; }
  }
  e.target.value="";
  renderImages();
  if(ok) toast(fail?("✅ 已添加 "+ok+" 张，失败 "+fail+" 张"):("✅ 已添加 "+ok+" 张"));
  else toast("⚠️ 添加失败，请重试");
};
/* 支持 Ctrl+V / 长按粘贴 复制的图片 */
document.addEventListener("paste", async (e)=>{
  const dt = e.clipboardData || window.clipboardData; if(!dt) return;
  const items = dt.items || []; let pasted=0, fail=0;
  for(const it of items){
    if(it.type && it.type.indexOf("image/")===0){
      const blob = it.getAsFile(); if(!blob) continue;
      try{ await addImage(blob, "粘贴图片"); pasted++; }
      catch(err){ console.error("paste add fail", err); fail++; }
    }
  }
  if(pasted){ switchView("img"); renderImages(); toast(fail?("✅ 已添加 "+pasted+" 张，失败 "+fail+" 张"):("✅ 已添加 "+pasted+" 张")); }
  else if(fail){ toast("⚠️ 添加失败，请重试"); }
});
document.getElementById("imgPopClose").onclick=()=>document.getElementById("imgPop").classList.remove("show");
document.getElementById("setBtn").onclick=openSettings;

/* ============ 初始化 ============ */

async function boot(){
  const now=new Date();
  document.getElementById("todayStr").textContent=now.getFullYear()+"年"+(now.getMonth()+1)+"月"+now.getDate()+"日 · 星期"+"日一二三四五六"[now.getDay()];
  calY=now.getFullYear(); calM=now.getMonth(); selDay=ymd(now);
  const app=root; app.inert=true;
  try {
    if(typeof window.tiana?.auth?.getAccessToken!=='function') throw Error('登录服务未就绪');
    const connection=await window.tiana.connection();
    if(connection.sql_api!=='hrana-v3') throw Error('当前数据库协议不支持');
    db={origin:connection.origin,fetch:createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};
    const loaded=await readState(); revision=loaded.revision; state=mergeState(JSON.parse(loaded.data)); writable=true;
    renderAll(); renderDayPanel(selDay); app.inert=false;
    try {
      const pending=JSON.parse(sessionStorage.getItem('pending-image')||'null');
      if(pending?.uploadId){
        let receipt=await files.uploadStatus(pending.uploadId);
        if(!receipt.completed) receipt=await files.completeUpload(pending.uploadId);
        if(receipt.completed) sessionStorage.removeItem('pending-image');
        else toast('上次图片上传仍待确认');
      }
      await refreshImages();
    } catch(error) { console.error(error); toast('图片加载或上传确认失败'); }
  } catch(error) { console.error(error); app.innerHTML='<p role="alert" style="padding:24px">数据库连接失败，请重新打开应用。</p>'; app.inert=false; }

}
window.closeSheet=closeSheet; boot();
