
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
const API = "/api";
const LS_KEY = "hy_taskmanager_v1";
const LS_TOMB = "hy_taskmanager_tomb";
let state = { tasks:{q1:[],q2:[],q3:[],q4:[]}, plans:{}, vips:[], imgs:[], routines:[] };

/* 墓碑：记录本机删除过的条目 id，防止被服务端旧副本"复活"
 * 结构 { tasks:[id], vips:[id], routines:[id], imgs:[id], plans:["日期::内容"] }
 * 只保留最近 300 条，避免无限增长 */
let tombstones = { tasks:[], vips:[], routines:[], imgs:[], plans:[] };
const TOMB_MAX = 300;
function loadTombstones(){
  try{
    const r = localStorage.getItem(LS_TOMB);
    if(r){
      const t = JSON.parse(r)||{};
      tombstones = {
        tasks: Array.isArray(t.tasks)?t.tasks:[],
        vips: Array.isArray(t.vips)?t.vips:[],
        routines: Array.isArray(t.routines)?t.routines:[],
        imgs: Array.isArray(t.imgs)?t.imgs:[],
        plans: Array.isArray(t.plans)?t.plans:[]
      };
    }
  }catch(e){ console.error("loadTombstones", e); }
}
function saveTombstones(){
  try{
    ["tasks","vips","routines","imgs","plans"].forEach(k=>{
      if(tombstones[k].length > TOMB_MAX) tombstones[k] = tombstones[k].slice(-TOMB_MAX);
    });
    localStorage.setItem(LS_TOMB, JSON.stringify(tombstones));
  }catch(e){}
}
/* 记录一次删除 */
function markDeleted(kind, id){
  if(!id) return;
  const k = tombstones[kind] || (tombstones[kind]=[]);
  if(!k.includes(id)) k.push(id);
  saveTombstones();
}
/* 清除墓碑（例如用户重新添加了同 id，或从备份导入恢复了它） */
function clearTombstone(kind, id){
  if(!tombstones[kind]) return;
  tombstones[kind] = tombstones[kind].filter(x=>x!==id);
  saveTombstones();
}
function isDeleted(kind, id){ return (tombstones[kind]||[]).includes(id); }
/* 同步成功后，把服务端已确认不含的墓碑清理掉（省空间）。
 * 简化处理：只清超过 100 条的老墓碑 */
function pruneTombstones(){
  ["tasks","vips","routines","imgs","plans"].forEach(k=>{
    if(tombstones[k].length > 100) tombstones[k] = tombstones[k].slice(-100);
  });
  saveTombstones();
}

let serverRev = -1;          // 已知的服务端版本号
let syncBadgeEl = null;      // 顶栏同步状态
let syncState = "idle";      // idle | syncing | ok | off
let lastPushAt = 0;
let pushing = false;
const POLL_MS = 4000;        // 轮询间隔，与参考站一致

function mergeState(d){
  d = d||{};
  return {
    tasks: Object.assign({q1:[],q2:[],q3:[],q4:[]}, d.tasks||{}),
    plans: (d.plans && typeof d.plans==="object") ? d.plans : {},
    vips: Array.isArray(d.vips) ? d.vips : [],
    imgs: Array.isArray(d.imgs) ? d.imgs.filter(x=>x && x.id) : [],
    routines: Array.isArray(d.routines) ? d.routines.filter(x=>x && x.time && x.text) : []
  };
}

/* 本机兜底缓存：断网时至少能看，联网后以服务端为准 */
function cacheLocal(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){}
}
function loadLocalCache(){
  try{
    const r = localStorage.getItem(LS_KEY);
    if(r){ return mergeState(JSON.parse(r)); }
  }catch(e){ console.error("loadLocalCache", e); }
  return null;
}

/* 把服务端带来的墓碑并入本机，保证后续推送也带上去 */
function absorbServerTomb(d){
  if(!d || !d.tomb) return false;
  let changed = false;
  ["tasks","vips","routines","imgs","plans"].forEach(k=>{
    const inc = Array.isArray(d.tomb[k]) ? d.tomb[k] : [];
    const cur = tombstones[k] || (tombstones[k]=[]);
    inc.forEach(id=>{ if(!cur.includes(id)){ cur.push(id); changed = true; } });
  });
  if(changed) saveTombstones();
  return changed;
}

/* 拉取服务端全量状态 */
async function pullState(){
  const r = await fetch(API+"/state", {cache:"no-store"});
  if(!r.ok) throw new Error("HTTP "+r.status);
  const d = await r.json();
  const rev = Number(d.rev)||0;
  if(rev === serverRev) return false;      // 没变化
  serverRev = rev;
  absorbServerTomb(d);
  // 拉下来的数据也要过一遍墓碑，避免已删条目被服务端旧数据带回
  state = mergeState(deepMerge(mergeState(d), state));
  cacheLocal();
  return true;
}

/* 把本地改动提交到服务端（先拉最新、合并、再推，避免多端互相覆盖） */
let pendingPush = null;
async function pushState(){
  if(pushing){ pendingPush = true; return false; }
  pushing = true;
  setSync("syncing");
  try{
    // 1) 先取服务端最新，与本机合并，防止覆盖别的设备的改动
    let merged = state;
    try{
      const lr = await fetch(API+"/state", {cache:"no-store"});
      if(lr.ok){
        const latest = await lr.json();
        merged = mergeState(deepMerge(mergeState(latest), state));
        serverRev = Number(latest.rev)||serverRev;
      }
    }catch(e){ /* 网络问题就用本机数据推 */ }

    // 2) 推送合并结果（带上墓碑，让删除对其他设备也生效）
    merged.tomb = tombstones;
    const r = await fetch(API+"/state", {
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ data: merged, baseRev: serverRev })
    });
    if(!r.ok) throw new Error("HTTP "+r.status);
    const d = await r.json();
    serverRev = Number(d.rev)||serverRev;
    state = mergeState(merged);
    // 服务端返回的墓碑（含其他设备的删除记录）合并回本机
    if(d.tomb){
      ["tasks","vips","routines","imgs","plans"].forEach(k=>{
        tombstones[k] = Array.from(new Set([...(tombstones[k]||[]), ...((d.tomb||{})[k]||[])]));
      });
      saveTombstones();
    }
    pruneTombstones();
    cacheLocal();
    lastPushAt = Date.now();
    setSync("ok");
    if(!d.conflict) renderAll();
    return true;
  }catch(e){
    console.error("pushState", e);
    setSync("off");
    toast("⚠️ 同步失败：连不上服务端，改动已暂存本机");
    return false;
  }finally{
    pushing = false;
    if(pendingPush){ pendingPush = null; setTimeout(()=>pushState(), 300); }
  }
}

/* 合并策略：本地新增 + 服务端新增，取并集；但任一方删过的条目（墓碑）一律剔除，绝不复活
 * server 可能是完整 state（含 tomb）也可能是纯数据，统一从 server.tomb 取服务端墓碑 */
function deepMerge(server, local){
  const out = mergeState(local);
  const st = (server && server.tomb) || {};
  const stArr = (k) => (Array.isArray(st[k]) ? st[k] : []);
  /* 本机墓碑 + 服务端墓碑 合并判断 */
  const goneTask = (id) => isDeleted("tasks", id) || stArr("tasks").includes(id);
  const goneAny  = (kind, id) => isDeleted(kind, id) || stArr(kind).includes(id);
  const gonePlan = (k, txt) => {
    const key = k + "::" + txt;
    return isDeleted("plans", key) || stArr("plans").includes(key);
  };

  const bt = server.tasks||{}, lt = local.tasks||{};
  ["q1","q2","q3","q4"].forEach(q=>{
    const lm = new Map((lt[q]||[]).map(x=>[x.id,x]));
    // 服务端有、本机没有的条目补上，但任何一方墓碑里的都不要
    const extra = (bt[q]||[]).filter(x=>x && x.id && !lm.has(x.id) && !goneTask(x.id));
    // 本机自己的条目也要过一遍墓碑（服务端可能删掉了它在别处的副本）
    const mine = (lt[q]||[]).filter(x=>x && x.id && !goneTask(x.id));
    out.tasks[q] = [...mine, ...extra];
  });
  // 计划：按日期取并集，剔除任一方已删的「日期::内容」
  const sp = server.plans||{}, lp = local.plans||{};
  const planOut = {};
  new Set([...Object.keys(sp), ...Object.keys(lp)]).forEach(k=>{
    const merged = Array.from(new Set([...(lp[k]||[]), ...(sp[k]||[])]))
      .filter(txt=>!gonePlan(k, txt));
    if(merged.length) planOut[k] = merged;
  });
  out.plans = planOut;
  // VIP / 固定安排 / 图片：按 id 并集，剔除任一方墓碑
  const byId = (a, b, kind) => {
    const m = new Map();
    (a||[]).forEach(x=>x && x.id && m.set(x.id, x));
    (b||[]).forEach(x=>x && x.id && m.set(x.id, x));
    return Array.from(m.values()).filter(x=>!goneAny(kind, x.id));
  };
  out.vips = byId(local.vips, server.vips, "vips");
  out.routines = byId(local.routines, server.routines, "routines");
  out.imgs = byId(local.imgs, server.imgs, "imgs");
  return out;
}

/* 本地保存：仅存本机 localStorage，不与任何服务端同步 */
function saveState(){
  cacheLocal();
}

/* 顶栏同步徽标：不同步版本已移除 */
function setSync(s){}

/* 轮询：把别处的改动拉过来 */
async function pollOnce(force){
  try{
    const r = await fetch(API+"/state", {cache:"no-store"});
    if(!r.ok) throw new Error("HTTP "+r.status);
    const d = await r.json();
    const rev = Number(d.rev)||0;
    if(rev === serverRev) { if(force) setSync("ok"); return; }
    serverRev = rev;
    absorbServerTomb(d);
    // 过一遍墓碑：本机删过的条目不能被服务端数据带回来
    state = mergeState(deepMerge(mergeState(d), state));
    cacheLocal();
    renderAll();
    setSync("ok");
  }catch(e){
    if(force) console.error("pollOnce", e);
    setSync("off");
  }
}
function startPolling(){
  setInterval(()=>{
    // 刚推过就不马上拉，避免自己覆盖自己
    if(Date.now() - lastPushAt < 1500) return;
    pollOnce(false);
  }, POLL_MS);
  // 回到前台立刻同步一次
  document.addEventListener("visibilitychange", ()=>{ if(!document.hidden) pollOnce(true); });
  window.addEventListener("focus", ()=>pollOnce(true));
}

/* ============ 数据管理 ============ */
function openSettings(){
  showSheet(`<h3>数据管理</h3>
    <label>数据仅保存在本机浏览器（localStorage），不上传、不同步。换设备或清浏览器数据前请先导出备份。</label>
    <div class="row" style="margin-top:8px">
      <button class="btn-ghost" id="dExport">导出备份</button>
    </div>
    <div class="row">
      <button class="btn-ghost" id="dImport">导入并覆盖</button>
      <button class="btn-primary" onclick="closeSheet()">完成</button>
    </div>`);
  document.getElementById("dExport").onclick=()=>{
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
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
  const files=window.tiana?.files; if(!files) throw Error('文件服务未就绪');
  let cursor, all=[]; do { const page=await files.list('images/',{cursor}); all.push(...(page.items||[]).filter(x=>x.path&&!x.isDirectory)); cursor=page.cursor||page.next_cursor; } while(cursor);
  state.imgs=await Promise.all(all.map(async x=>({id:x.path,url:await files.getUrl(x.path)}))); renderImages();
}
async function addImage(blob, name){
  const out=await compressImage(blob), path='images/'+Date.now().toString(36)+'-'+crypto.randomUUID()+'.jpg';
  let uploadId; try { await window.tiana.files.put(path,out,{onPrepared:r=>{uploadId=r.id; sessionStorage.setItem('pending-image',JSON.stringify({path,uploadId}));}}); }
  catch(e){ if(!uploadId)throw e; let s=await window.tiana.files.uploadStatus(uploadId); if(!s.completed)s=await window.tiana.files.completeUpload(uploadId); if(!s.completed)throw e; }
  sessionStorage.removeItem('pending-image'); await refreshImages();
}
async function delImage(id){
  if(!confirm('确定删除这张图片吗？'))return;
  try{await window.tiana.files.delete(id); await refreshImages(); toast('已删除');}catch(e){toast('删除失败，请重试');}
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
    <div class="row"><button class="btn-ghost" onclick="closeSheet()">取消</button><button class="btn-primary" id="taskSave">${isEdit?"保存":"添加"}</button></div>`);
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
      <div class="row"><button class="btn-ghost" onclick="closeSheet()">取消</button><button class="btn-primary" id="planSave">保存</button></div>`);
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
        ${v.link?`<a class="link" href="${escapeHtml(v.link)}" target="_blank" rel="noopener">打开链接</a>`:`<span class="link" style="background:var(--bg);color:var(--faint)">未设链接</span>`}
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
    <div class="row"><button class="btn-ghost" onclick="closeSheet()">取消</button><button class="btn-primary" id="vSave">保存</button></div>`);
  document.getElementById("vSave").onclick=()=>{
    const name=document.getElementById("vName").value.trim();
    const expire=document.getElementById("vExp").value;
    const link=document.getElementById("vLink").value.trim();
    const note=document.getElementById("vNote").value.trim();
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
    <div class="row"><button class="btn-ghost" onclick="closeSheet()">取消</button><button class="btn-primary" id="fSave">保存</button></div>`);
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
document.getElementById("mask").onclick=e=>{ if(e.target.id==="mask") closeSheet(); };

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
  // 先加载墓碑，再读缓存（顺序很重要：墓碑先就位才能正确过滤）
  loadTombstones();
  // 先用本机缓存渲染，避免白屏
  const cached = loadLocalCache();
  if(cached) state = cached;
  renderAll();
}
window.closeSheet=closeSheet; boot();
