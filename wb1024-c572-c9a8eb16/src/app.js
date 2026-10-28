
const STORE_KEY='self_discipline_app_v1';
const ICONS=['🚫','🏃','📚','💧','🥗','🛌','🧘','💪','🚭','✍️','🎯','🌅','🦷','📖','🍎','🐱'];
const COLORS=['#f87171','#34d399','#60a5fa','#38bdf8','#fbbf24','#a78bfa','#fb7185','#4ade80'];
const STAGES=[
  {lv:1,name:'蛋蛋',min:0,desc:'一颗安静的蛋，等待你的坚持来孵化'},
  {lv:2,name:'破壳',min:150,desc:'咔咔——小嘴啄开了壳'},
  {lv:3,name:'绒毛小鸡',min:400,desc:'毛茸茸的小黄球，摇摇晃晃学走路'},
  {lv:4,name:'少年鸡',min:800,desc:'长出小冠和小尾巴，开始有脾气'},
  {lv:5,name:'成年鸡',min:1400,desc:'神气十足的大鸡，陪你一起自律'}
];

let storageOK=true;
let state=load();
let editing=null; // habit being edited
let curKind='check';
let curIcon='🚫';
let curColor='#34d399';

function load(){
  try{
    const s=JSON.parse(localStorage.getItem(STORE_KEY));
    if(s&&s.habits) return s;
  }catch(e){ storageOK=false; }
  return seed();
}
function seed(){
  const t=todayStr();
  return {
    habits:[
      mk('戒酒','🚫','check','',0,'#f87171'),
      mk('跑步','🏃','count','km',3,'#34d399'),
      mk('学习','📚','count','分钟',60,'#60a5fa'),
      mk('喝水','💧','count','杯',8,'#38bdf8')
    ],
    chick:{name:'小豆芽',xp:0},
    version:1
  };
}
function mk(name,icon,kind,unit,goal,color){
  return {id:'h'+Date.now()+Math.random().toString(36).slice(2,6),name,icon,kind,unit,goal,color,records:{}};
}
function save(){ try{ localStorage.setItem(STORE_KEY,JSON.stringify(state)); }catch(e){ storageOK=false; } }

function todayStr(d){ d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function fmt(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function dateOffset(n){ const d=new Date(); d.setDate(d.getDate()+n); return d; }

function getHabit(id){ return state.habits.find(h=>h.id===id); }
function todayVal(h){ return h.records[todayStr()]||0; }
function isDone(h){ return (h.records[todayStr()]||0)>0; }

function streakOf(h){
  let s=0; const d=new Date();
  if(!h.records[fmt(d)]) d.setDate(d.getDate()-1);
  while(true){
    if(h.records[fmt(d)]>0) s++; else break;
    d.setDate(d.getDate()-1);
    if(s>9000) break;
  }
  return s;
}
function totalCompletions(h){ return Object.values(h.records).filter(v=>v>0).length; }
function computeXP(){
  let xp=0; const days=new Set();
  state.habits.forEach(h=>Object.keys(h.records).forEach(k=>{ if(h.records[k]>0) days.add(k); }));
  state.habits.forEach(h=>Object.values(h.records).forEach(v=>{ if(v>0) xp+=12; }));
  if(state.habits.length>0) days.forEach(k=>{ if(state.habits.every(h=>h.records[k]>0)) xp+=20; });
  return xp;
}
function getStage(xp){
  let st=STAGES[0];
  for(const s of STAGES){ if(xp>=s.min) st=s; }
  return st;
}

/* ---- chick SVGs ---- */
function chickSVG(lv){
  const egg=`<ellipse cx="100" cy="115" rx="52" ry="66" fill="#f3e4c4" stroke="#d8c195" stroke-width="3"/><ellipse cx="84" cy="98" rx="16" ry="20" fill="#fff" opacity=".45"/>`;
  if(lv<=1){
    return `<svg viewBox="0 0 200 200">${egg}
      <path d="M82 112 q9 9 18 0" stroke="#7a6a4a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M100 124 q9 9 18 0" stroke="#7a6a4a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="80" cy="128" r="4" fill="#f0a9a9" opacity=".7"/>
      <circle cx="120" cy="128" r="4" fill="#f0a9a9" opacity=".7"/>
      <text x="140" y="70" font-size="22" fill="#cbb890">z</text></svg>`;
  }
  if(lv===2){
    return `<svg viewBox="0 0 200 200">
      <path d="M48 115 a52 66 0 0 1 104 0 v8 l-12 -6 -10 8 -12 -8 -11 9 -12 -8 -10 8 -13 -7 z" fill="#f3e4c4" stroke="#d8c195" stroke-width="3"/>
      <circle cx="100" cy="78" r="30" fill="#ffd84d" stroke="#e9b83b" stroke-width="3"/>
      <circle cx="90" cy="74" r="4" fill="#3a2e12"/><circle cx="110" cy="74" r="4" fill="#3a2e12"/>
      <path d="M96 84 l8 0 l-4 7 z" fill="#f5972b"/>
      <path d="M70 86 q-14 6 -20 -2" stroke="#e9b83b" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
  }
  if(lv===3){
    return `<svg viewBox="0 0 200 200">
      <ellipse cx="100" cy="112" rx="48" ry="44" fill="#ffd84d" stroke="#e9b83b" stroke-width="3"/>
      <circle cx="100" cy="78" r="34" fill="#ffdf63" stroke="#e9b83b" stroke-width="3"/>
      <circle cx="89" cy="74" r="5" fill="#3a2e12"/><circle cx="111" cy="74" r="5" fill="#3a2e12"/>
      <circle cx="89" cy="73" r="1.6" fill="#fff"/><circle cx="111" cy="73" r="1.6" fill="#fff"/>
      <path d="M94 86 l12 0 l-6 9 z" fill="#f5972b"/>
      <path d="M62 104 q-18 4 -22 -8" stroke="#e9b83b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M138 104 q18 4 22 -8" stroke="#e9b83b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="74" cy="92" r="5" fill="#f0a9a9" opacity=".6"/><circle cx="126" cy="92" r="5" fill="#f0a9a9" opacity=".6"/></svg>`;
  }
  if(lv===4){
    return `<svg viewBox="0 0 200 200">
      <ellipse cx="100" cy="116" rx="50" ry="48" fill="#ffd84d" stroke="#e9b83b" stroke-width="3"/>
      <path d="M150 100 q26 -6 30 14 q-22 4 -30 -6" fill="#ffcf3d" stroke="#e9b83b" stroke-width="3"/>
      <circle cx="100" cy="74" r="36" fill="#ffdf63" stroke="#e9b83b" stroke-width="3"/>
      <path d="M92 44 q8 -14 18 0 q-9 6 -18 0" fill="#f87171" stroke="#e0533f" stroke-width="2"/>
      <path d="M100 56 q6 8 0 12" stroke="#f87171" stroke-width="3" fill="none"/>
      <circle cx="89" cy="72" r="5.5" fill="#3a2e12"/><circle cx="112" cy="72" r="5.5" fill="#3a2e12"/>
      <circle cx="89" cy="70" r="1.8" fill="#fff"/><circle cx="112" cy="70" r="1.8" fill="#fff"/>
      <path d="M93 84 l14 0 l-7 10 z" fill="#f5972b"/>
      <path d="M58 110 q-18 6 -22 -8" stroke="#e9b83b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M142 110 q18 6 22 -8" stroke="#e9b83b" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
  }
  return `<svg viewBox="0 0 200 200">
    <ellipse cx="100" cy="120" rx="54" ry="52" fill="#ffd84d" stroke="#e9b83b" stroke-width="3"/>
    <path d="M150 104 q30 -4 36 18 q-26 4 -36 -8" fill="#ffcf3d" stroke="#e9b83b" stroke-width="3"/>
    <path d="M56 110 q-26 -10 -30 12 q22 6 30 -4" fill="#ffcf3d" stroke="#e9b83b" stroke-width="3"/>
    <circle cx="100" cy="72" r="38" fill="#ffdf63" stroke="#e9b83b" stroke-width="3"/>
    <path d="M86 40 q14 -18 28 0 q-14 8 -28 0" fill="#f87171" stroke="#e0533f" stroke-width="2"/>
    <path d="M100 52 q8 12 0 16" stroke="#e0533f" stroke-width="3" fill="none"/>
    <circle cx="89" cy="70" r="6" fill="#3a2e12"/><circle cx="113" cy="70" r="6" fill="#3a2e12"/>
    <circle cx="89" cy="68" r="2" fill="#fff"/><circle cx="113" cy="68" r="2" fill="#fff"/>
    <path d="M90 84 l20 0 l-10 13 z" fill="#f5972b" stroke="#d97f1f" stroke-width="1.5"/>
    <path d="M64 116 q-20 8 -24 -10" stroke="#e9b83b" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M136 116 q20 8 24 -10" stroke="#e9b83b" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="72" cy="96" r="6" fill="#f0a9a9" opacity=".6"/><circle cx="128" cy="96" r="6" fill="#f0a9a9" opacity=".6"/></svg>`;
}

/* ---- render ---- */
function render(){
  state.chick.xp=computeXP();
  save();
  renderToday(); renderData(); renderChick(); renderHabitList();
  // date
  const d=new Date(); const wd=['日','一','二','三','四','五','六'][d.getDay()];
  document.getElementById('datepill').textContent=`${d.getMonth()+1}月${d.getDate()}日 周${wd}`;
  // storage warning
  if(!storageOK && !document.getElementById('storeWarn')){
    const b=document.createElement('div'); b.id='storeWarn';
    b.style.cssText='background:#3a2a12;color:#fbbf24;border-bottom:1px solid #5a4012;font-size:12px;text-align:center;padding:7px 10px;';
    b.textContent='⚠️ 当前环境无法保存数据（多为 file:// 限制），数据仅本次有效，建议用下方本地服务地址打开';
    document.querySelector('.topbar').before(b);
  }
}

function renderToday(){
  const wrap=document.getElementById('todayList'); wrap.innerHTML='';
  state.habits.forEach(h=>{
    const done=isDone(h);
    const div=document.createElement('div'); div.className='habit';
    let sub, bar='';
    if(h.kind==='check'){ sub= done?'今天已完成 ✓':'点击左侧圆圈完成'; }
    else{
      const v=todayVal(h); const goal=h.goal>0?h.goal:0;
      sub= v>0? `今日 ${v}${h.unit}`+(goal?` / 目标 ${goal}${h.unit}`:'') : `记录今日${h.unit||'数值'}`;
      if(goal){ const p=Math.min(100, Math.round(v/goal*100)); bar=`<div class="bar"><i style="width:${p}%;background:${h.color}"></i></div>`; }
    }
    div.innerHTML=`
      <div class="ic" style="background:${h.color}22;">${h.icon}</div>
      <div class="mid"><div class="nm">${esc(h.name)}</div><div class="sub">${sub}</div>${bar}</div>
      <button class="toggle ${done?'done':''}" style="${done?`background:${h.color}`:''}">✓</button>`;
    div.querySelector('.toggle').onclick=()=>onToggle(h.id);
    div.querySelector('.mid').onclick=()=>{ if(h.kind==='count') openCnt(h.id); };
    wrap.appendChild(div);
  });
  if(state.habits.length===0) wrap.innerHTML='<div class="empty">还没有习惯，点下面按钮添加一个吧 🐣</div>';
  // stats
  const doneCnt=state.habits.filter(isDone).length;
  document.getElementById('stToday').textContent=`${doneCnt}/${state.habits.length}`;
  document.getElementById('stTotal').textContent=state.habits.reduce((a,h)=>a+totalCompletions(h),0);
  document.getElementById('stBest').textContent=Math.max(0,...state.habits.map(streakOf));
  // chick mini
  const st=getStage(state.chick.xp);
  document.getElementById('chickMini').innerHTML=chickSVG(st.lv);
  document.getElementById('chickNameMini').textContent=state.chick.name||'小鸡';
  document.getElementById('chickLvMini').textContent=`Lv.${st.lv} ${st.name}`;
}

function onToggle(id){
  const h=getHabit(id); const t=todayStr();
  if(h.kind==='count'){ openCnt(id); return; }
  if(h.records[t]) delete h.records[t]; else h.records[t]=1;
  render(); toast(h.records[t]?`${h.name} 打卡成功 +12 🐤`:`已取消 ${h.name}`);
}

function renderData(){
  // week bars
  const bars=document.getElementById('weekBars'); bars.innerHTML='';
  const labels=['日','一','二','三','四','五','六'];
  for(let i=6;i>=0;i--){
    const d=dateOffset(-i); const k=fmt(d);
    const done=state.habits.filter(h=>h.records[k]>0).length;
    const rate=state.habits.length? Math.round(done/state.habits.length*100):0;
    const col=document.createElement('div'); col.className='col';
    col.innerHTML=`<div class="b" style="height:${Math.max(rate,4)}%" title="${rate}%"></div><div class="lab">${i===0?'今':labels[d.getDay()]}</div>`;
    bars.appendChild(col);
  }
  // habit score this week
  const hs=document.getElementById('habitScore'); hs.innerHTML='';
  state.habits.forEach(h=>{
    let wk=0; for(let i=6;i>=0;i--){ if(h.records[fmt(dateOffset(-i))]>0) wk++; }
    const p=Math.round(wk/7*100);
    const row=document.createElement('div'); row.className='hs';
    row.innerHTML=`<div class="nm">${h.icon} ${esc(h.name)}</div><div class="track"><i style="width:${p}%;background:${h.color}"></i></div><div class="v">${wk}/7天</div>`;
    hs.appendChild(row);
  });
  if(state.habits.length===0) hs.innerHTML='<div class="empty">暂无数据</div>';
  // totals
  let tot=0,days=new Set(),full=0;
  state.habits.forEach(h=>Object.keys(h.records).forEach(k=>{ if(h.records[k]>0){tot++; days.add(k);} }));
  if(state.habits.length>0) days.forEach(k=>{ if(state.habits.every(h=>h.records[k]>0)) full++; });
  document.getElementById('dTotal').textContent=tot;
  document.getElementById('dDays').textContent=days.size;
  document.getElementById('dFull').textContent=full;
}

function renderChick(){
  const st=getStage(state.chick.xp);
  document.getElementById('chickBig').innerHTML=chickSVG(st.lv);
  document.getElementById('chickNameBig').textContent=state.chick.name||'小鸡';
  document.getElementById('chickLvBig').textContent=`Lv.${st.lv} · ${st.name}`;
  document.getElementById('chickDescBig').textContent=st.desc;
  // xp bar
  const idx=STAGES.indexOf(st);
  const next=STAGES[idx+1];
  let pct, now, nxt;
  if(next){ pct=Math.round((state.chick.xp-st.min)/(next.min-st.min)*100); now=`${state.chick.xp} XP`; nxt=`距「${next.name}」还差 ${next.min-state.chick.xp}`; }
  else { pct=100; now=`${state.chick.xp} XP 满级`; nxt='已成年，继续陪伴你 🎉'; }
  document.getElementById('xpFill').style.width=pct+'%';
  document.getElementById('xpNow').textContent=now;
  document.getElementById('xpNext').textContent=nxt;
  // evo steps
  const ev=document.getElementById('evoSteps'); ev.innerHTML='';
  STAGES.forEach(s=>{
    const on=state.chick.xp>=s.min;
    const d=document.createElement('div'); d.className='s'+(on?' on':'');
    d.innerHTML=`<div class="dot"></div>${s.name}`;
    ev.appendChild(d);
  });
}

function renderHabitList(){
  const wrap=document.getElementById('habitList'); wrap.innerHTML='';
  state.habits.forEach(h=>{
    const div=document.createElement('div'); div.className='habit';
    div.innerHTML=`
      <div class="ic" style="background:${h.color}22;">${h.icon}</div>
      <div class="mid"><div class="nm">${esc(h.name)}</div><div class="sub">${h.kind==='check'?'打卡型':`计数型 · ${h.unit||''}${h.goal>0?` · 目标${h.goal}`:''}`} · 连续${streakOf(h)}天</div></div>
      <button class="del">删除</button>`;
    div.querySelector('.del').onclick=()=>{ if(confirm(`确定删除「${h.name}」？打卡记录也会一并清除。`)){ state.habits=state.habits.filter(x=>x.id!==h.id); render(); toast('已删除'); } };
    div.querySelector('.mid').onclick=()=>openModal(h);
    div.querySelector('.ic').onclick=()=>openModal(h);
    wrap.appendChild(div);
  });
  if(state.habits.length===0) wrap.innerHTML='<div class="empty">还没有习惯</div>';
}

function esc(s){ return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* ---- modal ---- */
function buildChips(){
  const ic=document.getElementById('iconChips'); ic.innerHTML='';
  ICONS.forEach(e=>{ const d=document.createElement('div'); d.className='c'+(e===curIcon?' on':''); d.textContent=e; d.onclick=()=>{curIcon=e; buildChips();}; ic.appendChild(d); });
  const cc=document.getElementById('colorChips'); cc.innerHTML='';
  COLORS.forEach(c=>{ const d=document.createElement('div'); d.className='c'+(c===curColor?' on':''); d.style.background=c+'33'; d.style.borderColor=c; d.style.color=c; d.textContent='●'; d.onclick=()=>{curColor=c; buildChips();}; cc.appendChild(d); });
}
function openModal(h){
  editing=h||null;
  document.getElementById('modalTitle').textContent=h?'编辑习惯':'新建习惯';
  document.getElementById('fName').value=h?h.name:'';
  document.getElementById('fUnit').value=h?h.unit:'';
  document.getElementById('fGoal').value=h?(h.goal||''):'';
  curKind=h?h.kind:'check'; curIcon=h?h.icon:'🚫'; curColor=h?h.color:'#34d399';
  syncKind(); buildChips();
  document.getElementById('modal').classList.add('show');
}
function syncKind(){
  document.querySelectorAll('#kindSeg button').forEach(b=>b.classList.toggle('on',b.dataset.k===curKind));
  document.getElementById('unitField').style.display=curKind==='count'?'block':'none';
  document.getElementById('goalField').style.display=curKind==='count'?'block':'none';
}
function closeModal(){ document.getElementById('modal').classList.remove('show'); }

/* count modal */
let cntId=null;
function openCnt(id){
  const h=getHabit(id); cntId=id;
  document.getElementById('cntTitle').textContent=`记录「${h.name}」`;
  document.getElementById('cntLabel').textContent=`数值（${h.unit||''}）`;
  document.getElementById('cntVal').value=todayVal(h)||'';
  document.getElementById('cntModal').classList.add('show');
  setTimeout(()=>document.getElementById('cntVal').focus(),200);
}

/* ---- events ---- */
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+b.dataset.tab).classList.add('active');
});
document.getElementById('addHabit').onclick=()=>openModal(null);
document.getElementById('addQuick').onclick=()=>openModal(null);
document.getElementById('cancelModal').onclick=closeModal;
document.getElementById('modal').onclick=e=>{ if(e.target.id==='modal') closeModal(); };
document.querySelectorAll('#kindSeg button').forEach(b=>b.onclick=()=>{ curKind=b.dataset.k; syncKind(); });
document.getElementById('saveHabit').onclick=()=>{
  const name=document.getElementById('fName').value.trim();
  if(!name){ toast('请填写名称'); return; }
  const unit=document.getElementById('fUnit').value.trim();
  const goal=parseFloat(document.getElementById('fGoal').value)||0;
  if(editing){
    editing.name=name; editing.icon=curIcon; editing.kind=curKind; editing.unit=unit; editing.goal=goal; editing.color=curColor;
  }else{
    state.habits.push({id:'h'+Date.now()+Math.random().toString(36).slice(2,6),name,icon:curIcon,kind:curKind,unit,goal,color:curColor,records:{}});
  }
  closeModal(); render(); toast('已保存');
};
document.getElementById('cntCancel').onclick=()=>document.getElementById('cntModal').classList.remove('show');
document.getElementById('cntModal').onclick=e=>{ if(e.target.id==='cntModal') document.getElementById('cntModal').classList.remove('show'); };
document.getElementById('cntSave').onclick=()=>{
  const v=parseFloat(document.getElementById('cntVal').value)||0;
  if(cntId){ const h=getHabit(cntId); if(v>0) h.records[todayStr()]=v; else delete h.records[todayStr()]; }
  document.getElementById('cntModal').classList.remove('show');
  render(); toast(v>0?`${getHabit(cntId).name} +${v}${getHabit(cntId).unit||''} 🐤`:'已清除今日记录');
};
document.getElementById('renameChick').onclick=()=>{
  const n=prompt('给小鸡取个名字：',state.chick.name||'小豆芽');
  if(n&&n.trim()){ state.chick.name=n.trim(); render(); toast('小鸡有了新名字 🐤'); }
};
document.getElementById('exportBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='打卡自律备份_'+todayStr()+'.json'; a.click();
  toast('已导出备份');
};
document.getElementById('importBtn').onclick=()=>document.getElementById('importFile').click();
document.getElementById('importFile').onchange=e=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader(); r.onload=()=>{
    try{ const s=JSON.parse(r.result); if(s&&s.habits){ state=s; render(); toast('导入成功'); } else toast('文件格式不正确'); }
    catch(err){ toast('导入失败：不是有效 JSON'); }
  }; r.readAsText(f); e.target.value='';
};

let toastTimer;
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),1600); }

render();
