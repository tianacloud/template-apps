import { createTianaFetch } from '@tianacloud/serverless';

const TAGS = ["消费","熬夜","情绪","拖延","人际"];
const COLORS = ["#5b8def","#9b6bef","#ef6b81","#e0a63f","#3fbf9f"];
const todayStr = () => { const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
let data=[], unlocked=false, sqlFetch, origin;
const records = () => data;
const textArg = value => ({type:'text',value:String(value)});
async function execute(sql,args=[]){
  const response=await sqlFetch(`${origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!response.ok) throw Error('数据库请求失败，结果可能未知，请刷新后核对');
  const result=(await response.json()).results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作失败，请刷新后核对');
  return result.response.result;
}
async function refreshData(){
  const result=await execute('SELECT date, text, tag, next, ts FROM regret_records ORDER BY date DESC');
  data=result.rows.map(row=>({date:row[0].value,text:row[1].value,tag:Number(row[2].value),next:row[3].value,ts:Number(row[4].value)}));
  const settings=await execute("SELECT value FROM regret_settings WHERE key = 'report_unlocked'");
  unlocked=settings.rows[0]?.[0]?.value==='1';
}
async function change(sql,args){
  try { await execute(sql,args); await refreshData(); return true; }
  catch(e){ try { await refreshData(); } catch(_) {} toast('保存结果未确认，请刷新后核对'); return false; }
}
let selTag = -1, curFilter = -1, curCard = null;

function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2000); }
function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

/* tabs */
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("on"));
  b.classList.add("on");
  ["today","timeline","stats","report"].forEach(t=>document.getElementById("tab-"+t).style.display = b.dataset.tab===t?"":"none");
  if(b.dataset.tab==="timeline") renderTimeline();
  if(b.dataset.tab==="stats") renderStats();
  if(b.dataset.tab==="report") renderReport();
});

/* 今日 */
const wd=["日","一","二","三","四","五","六"];
document.getElementById("todayDate").innerHTML = "今天是 <b>"+todayStr()+"</b> 星期"+wd[new Date().getDay()];
const picker = document.getElementById("tagPicker");
TAGS.forEach((t,i)=>{
  const s=document.createElement("span"); s.className="tag t"+i; s.textContent=t;
  s.onclick=()=>{ if(selTag===i){selTag=-1;s.classList.remove("sel")} else {selTag=i;picker.querySelectorAll(".tag").forEach(x=>x.classList.remove("sel"));s.classList.add("sel")} };
  picker.appendChild(s);
});
const inp=document.getElementById("inputText");
inp.oninput=()=>document.getElementById("charCount").textContent=inp.value.length;

function renderToday(){
  const rec = records().find(r=>r.date===todayStr());
  if(rec){
    document.getElementById("todayForm").style.display="none";
    const el=document.getElementById("todayDone");
    el.style.display="";
    el.innerHTML = '<div style="text-align:center;padding:12px 0"><div style="font-size:34px">✅</div><p style="color:var(--muted);font-size:13px;margin:8px 0 14px">今天已经记过了，明天再来 · 今日这条：</p><div style="font-size:16px;line-height:1.7">「'+esc(rec.text)+'」</div>'+(rec.next?'<div style="font-size:13px;color:var(--tag5);margin-top:10px">下次：'+esc(rec.next)+'</div>':'')+'<div style="margin-top:16px"><button class="btn ghost" id="shareBtn2">生成分享卡片</button></div></div>';
    document.getElementById("shareBtn2").onclick=()=>openCard(rec);
  } else {
    document.getElementById("todayForm").style.display="";
    document.getElementById("todayDone").style.display="none";
  }
}
document.getElementById("saveBtn").onclick=async()=>{
  const text=inp.value.trim();
  if(!text){ toast("先写下今天后悔的事"); return; }
  const rs=records();
  if(rs.some(r=>r.date===todayStr())){ toast("今天已经记过一条啦"); return; }
  const button=document.getElementById("saveBtn"); button.disabled=true;
  const ok=await change("INSERT INTO regret_records(date,text,tag,next,ts) VALUES(?,?,?,?,?)", [textArg(todayStr()),textArg(text),{type:"integer",value:String(selTag)},textArg(document.getElementById("inputNext").value.trim()),{type:"integer",value:String(Date.now())}]);
  button.disabled=false; if(!ok){renderToday();return;}
  inp.value=""; document.getElementById("inputNext").value=""; selTag=-1; picker.querySelectorAll(".tag").forEach(x=>x.classList.remove("sel"));
  document.getElementById("charCount").textContent="0";
  renderToday(); toast("已记下，明天见 👋");
};

/* 时间线 */
function renderTimeline(){
  const bar=document.getElementById("filterBar");
  bar.innerHTML="";
  const all=document.createElement("span"); all.className="tag"+(curFilter===-1?" sel t0":""); all.textContent="全部";
  all.onclick=()=>{curFilter=-1;renderTimeline()}; bar.appendChild(all);
  TAGS.forEach((t,i)=>{
    const s=document.createElement("span"); s.className="tag t"+i+(curFilter===i?" sel":""); s.textContent=t;
    s.onclick=()=>{curFilter=i;renderTimeline()}; bar.appendChild(s);
  });
  const list=document.getElementById("timelineList");
  const rs=records().filter(r=>curFilter===-1||r.tag===curFilter);
  if(!rs.length){ list.innerHTML='<div class="empty">还没有记录<br>每天一句话，从今天开始 👆</div>'; return; }
  list.innerHTML = rs.map(r=>`<div class="record">
    <button class="del" data-d="${r.date}" title="删除">✕</button>
    <div class="r-date">${r.date}</div>
    <div class="r-text">「${esc(r.text)}」</div>
    ${r.next?'<div class="r-next">↪ 下次：'+esc(r.next)+'</div>':''}
    <div class="r-tags">${r.tag>=0?'<span class="r-tag" style="color:'+COLORS[r.tag]+'">'+TAGS[r.tag]+'</span>':''}
    <span class="r-tag share" style="cursor:pointer" data-d="${r.date}">卡片</span></div>
  </div>`).join("");
  list.querySelectorAll(".del").forEach(b=>b.onclick=async()=>{
    if(confirm("确定删除 "+b.dataset.d+" 这条记录吗？")){ b.disabled=true; await change("DELETE FROM regret_records WHERE date=?",[textArg(b.dataset.d)]); renderTimeline(); }
  });
  list.querySelectorAll(".share").forEach(b=>b.onclick=()=>openCard(records().find(r=>r.date===b.dataset.d)));
}

/* 统计 */
function renderStats(){
  const rs=records();
  const days=new Set(rs.map(r=>r.date)).size;
  document.getElementById("statGrid").innerHTML =
    '<div class="stat"><div class="num">'+rs.length+'</div><div class="lbl">累计记录</div></div>'+
    '<div class="stat"><div class="num">'+days+'</div><div class="lbl">记录天数</div></div>'+
    '<div class="stat"><div class="num">'+(days?Math.round(rs.length/days*10)/10:0)+'</div><div class="lbl">日均后悔</div></div>';
  const counts=TAGS.map((t,i)=>({t,i,c:rs.filter(r=>r.tag===i).length})).sort((a,b)=>b.c-a.c);
  const max=Math.max(1,...counts.map(x=>x.c));
  document.getElementById("tagBars").innerHTML = counts.map(x=>
    '<div class="bar-row"><div class="bl">'+x.t+'</div><div class="bar-track"><div class="bar-fill" style="width:'+(x.c/max*100)+'%;background:'+COLORS[x.i]+'">'+x.c+'</div></div></div>'
  ).join("") + (rs.length?"":'<div class="empty">暂无数据</div>');
}

/* 年度报告 */
function renderReport(){
  const year=new Date().getFullYear();
  const rs=records().filter(r=>r.date.startsWith(year));
  const free=document.getElementById("reportFree");
  const lock=document.getElementById("reportLock");
  if(!unlocked){ free.innerHTML=""; lock.style.display=""; return; }
  lock.style.display="none";
  const counts=TAGS.map((t,i)=>({t,i,c:rs.filter(r=>r.tag===i).length})).sort((a,b)=>b.c-a.c);
  const top=counts[0];
  const months=Array(12).fill(0);
  rs.forEach(r=>{months[parseInt(r.date.slice(5,7))-1]++});
  const maxM=Math.max(1,...months);
  const tips=[];
  if(top && top.c>0){
    const map={"消费":"可以试试给自己设一个 24 小时消费冷静期。","熬夜":"今晚试试把手机放到卧室之外。","情绪":"下次情绪上头时，先深呼吸十秒再开口。","拖延":"把大任务拆成 15 分钟就能开始的小块。","人际":"重要的话先在心里过一遍，重话缓一缓再说。"};
    tips.push("今年「"+top.t+"」类后悔出现了 "+top.c+" 次，是最高频。"+map[top.t]);
  }
  const q=Math.floor((new Date().getMonth())/3);
  const qs=[0,1,2,3].map(i=>rs.filter(r=>{const m=parseInt(r.date.slice(5,7));return i*3<m&&m<=i*3+3}).length);
  if(q>0){ tips.push(qs[q]>qs[q-1] ? "本季度后悔记录比上季度多（"+qs[q]+" vs "+qs[q-1]+"），节奏放慢一点，照顾好自己。" : qs[q]<qs[q-1] ? "本季度后悔记录比上季度少（"+qs[q]+" vs "+qs[q-1]+"），正在变好，继续保持。" : "本季度与上季度记录持平，稳定觉察也是一种进步。"); }
  free.innerHTML =
    '<div class="card" style="text-align:center"><div style="font-size:30px;font-weight:700">'+year+' 年度后悔清单</div><div style="color:var(--muted);font-size:13px;margin-top:6px">共 '+rs.length+' 条后悔 · 看见自己，才能改变</div></div>'+
    '<div class="sec-title">高频后悔类型</div><div class="card">'+
    (rs.length?counts.map(x=>'<div class="bar-row"><div class="bl">'+x.t+'</div><div class="bar-track"><div class="bar-fill" style="width:'+(x.c/Math.max(1,top.c)*100)+'%;background:'+COLORS[x.i]+'">'+x.c+'</div></div></div>').join(""):'<div class="empty">今年还没有记录</div>')+'</div>'+
    '<div class="sec-title">逐月趋势</div><div class="card"><div class="months">'+
    months.map((v,i)=>'<div class="month"><div class="mcol" style="height:'+(v/maxM*90)+'px" title="'+(i+1)+'月: '+v+'条"></div><div class="mlbl">'+(i+1)+'</div></div>').join("")+
    '</div></div>'+
    '<div class="sec-title">个性化复盘</div><div class="card">'+(tips.length?tips.map(t=>'<div class="tip">'+t+'</div>').join(""):'<div class="empty">记录积累后会生成复盘建议</div>')+'</div>'+
    '<div class="center"><button class="btn" id="yearCard">生成年度海报</button> <button class="btn ghost" id="relock">收起报告</button></div>';
  document.getElementById("yearCard").onclick=()=>openYearCard(rs,counts,months,maxM);
  document.getElementById("relock").onclick=async()=>{await change("DELETE FROM regret_settings WHERE key=?",[textArg("report_unlocked")]);renderReport()};
}
document.getElementById("unlockBtn").onclick=async()=>{
  const ok=await change("INSERT INTO regret_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[textArg("report_unlocked"),textArg("1")]);
  if(ok) toast("已解锁（免费体验）");
  renderReport();
};

/* 导出 */
document.getElementById("exportMd").onclick=()=>{
  const rs=records();
  let md="# "+new Date().getFullYear()+" 后悔清单\n\n";
  rs.forEach(r=>{ md+="- **"+r.date+"** "+esc(r.text)+(r.tag>=0?" `"+TAGS[r.tag]+"`":"")+(r.next?"　↪ "+esc(r.next):"")+"\n"; });
  download("后悔清单.md",md,"text/markdown");
};
document.getElementById("exportCsv").onclick=()=>{
  let csv="日期,内容,标签,下次怎么做\n";
  records().forEach(r=>{ csv+=[r.date,'"'+r.text.replace(/"/g,'""')+'"',r.tag>=0?TAGS[r.tag]:"","\""+(r.next||"").replace(/"/g,'""')+"\""].join(",")+"\n"; });
  download("后悔清单.csv","\ufeff"+csv,"text/csv");
};
function download(name,content,type){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([content],{type:type+";charset=utf-8"}));
  a.download=name; a.click(); URL.revokeObjectURL(a.href);
}

/* 分享卡片 */
function openCard(r){
  curCard=r;
  const c=document.getElementById("cardCanvas"),x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,600,800); g.addColorStop(0,"#1b1e2b"); g.addColorStop(1,"#2b2030");
  x.fillStyle=g; x.fillRect(0,0,600,800);
  x.fillStyle="#f0a35e"; x.font="bold 40px sans-serif"; x.fillText("💊 后悔药",50,100);
  x.fillStyle="#8b91a3"; x.font="20px sans-serif"; x.fillText("如果人生可以撤回，你最想撤回哪件事？",50,145);
  x.fillStyle="#e8eaf0"; x.font="28px sans-serif";
  wrapText(x,"「"+r.text+"」",50,260,500,46);
  if(r.next){ x.fillStyle="#3fbf9f"; x.font="20px sans-serif"; wrapText(x,"↪ 下次："+r.next,50,560,500,32); }
  if(r.tag>=0){ x.fillStyle=COLORS[r.tag]; x.font="bold 22px sans-serif"; x.fillText("#"+TAGS[r.tag],50,640); }
  x.fillStyle="#8b91a3"; x.font="18px sans-serif"; x.fillText(r.date,50,720);
  x.fillText("记录每天的后悔，少踩重复的坑",50,755);
  document.getElementById("cardModal").classList.add("show");
}
function openYearCard(rs,counts,months,maxM){
  const c=document.getElementById("cardCanvas"),x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,600,800); g.addColorStop(0,"#1b1e2b"); g.addColorStop(1,"#2b2030");
  x.fillStyle=g; x.fillRect(0,0,600,800);
  const y=new Date().getFullYear();
  x.fillStyle="#f0a35e"; x.font="bold 44px sans-serif"; x.fillText(y+" 年度后悔清单",50,110);
  x.fillStyle="#e8eaf0"; x.font="24px sans-serif"; x.fillText("共 "+rs.length+" 条后悔 · 看见自己，才能改变",50,160);
  counts.slice(0,5).forEach((t,i)=>{
    x.fillStyle="#8b91a3"; x.font="20px sans-serif"; x.fillText(t.t,60,250+i*50);
    x.fillStyle="#2c3140"; x.fillRect(150,234+i*50,340*t.c/Math.max(1,counts[0].c),26)||0;
    x.fillStyle=COLORS[t.i]; x.fillRect(150,234+i*50,Math.max(4,340*t.c/Math.max(1,counts[0].c)),26);
    x.fillStyle="#e8eaf0"; x.fillText(t.c,160+Math.max(4,340*t.c/Math.max(1,counts[0].c)),255+i*50);
  });
  x.fillStyle="#8b91a3"; x.font="18px sans-serif";
  x.fillText("💊 后悔药 · 记录每天的后悔，少踩重复的坑",50,760);
  document.getElementById("cardModal").classList.add("show");
}
function wrapText(x,text,px,py,maxW,lh){
  let line="",yy=py;
  for(const ch of text){ if(x.measureText(line+ch).width>maxW){ x.fillText(line,px,yy); line=ch; yy+=lh; } else line+=ch; }
  x.fillText(line,px,yy);
}
document.getElementById("dlCard").onclick=()=>{
  const a=document.createElement("a");
  a.href=document.getElementById("cardCanvas").toDataURL("image/png");
  a.download="后悔药卡片.png"; a.click();
};
document.getElementById("closeModal").onclick=()=>document.getElementById("cardModal").classList.remove("show");
document.getElementById("cardModal").onclick=e=>{ if(e.target.id==="cardModal") e.target.classList.remove("show"); };

async function start(){
  const controls=document.querySelectorAll('button, input, textarea'); controls.forEach(el=>el.disabled=true);
  try{
    if(typeof window.tiana?.auth?.getAccessToken!=='function') throw Error('登录服务未就绪');
    const connection=await window.tiana.connection();
    if(connection.sql_api!=='hrana-v3') throw Error('数据库协议不支持');
    origin=connection.origin;
    sqlFetch=createTianaFetch({origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
    await refreshData(); renderToday(); controls.forEach(el=>el.disabled=false);
  }catch(e){document.querySelector('.wrap').insertAdjacentHTML('afterbegin','<div class="card">数据库连接失败，请检查登录后刷新页面。</div>');}
}
start();
