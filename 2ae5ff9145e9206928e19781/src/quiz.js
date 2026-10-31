import {sql} from "./db.js";

export async function start(context) {
let STOCKS, CONCEPT_NAME, CONCEPTS;
try {
  const response=await context.files.get("template-assets/bank.json");
  if(!response.ok) throw Error("题库读取失败");
  ({STOCKS,CONCEPT_NAME,CONCEPTS}=await response.json());
} catch (error) {
  document.body.textContent="无法读取题库，请检查连接后重新打开。";
  throw error;
}
/* ================= 股票知识库（最新快照） ================= */

/* ================= 热点题材概念（近半年涨幅前30） ================= */

/* ================= 王者荣耀段位体系 ================= */
const TIER_COLOR = {青铜:"#b87333", 白银:"#9aa5b1", 黄金:"#e0a50e", 铂金:"#27a9b8", 钻石:"#3a9bff", 星耀:"#8b5cf6", 王者:"#ff7a00"};
const RANKS = [
  {t:"青铜",lv:1,min:0},{t:"青铜",lv:2,min:1001},{t:"青铜",lv:3,min:2001},
  {t:"白银",lv:1,min:3001},{t:"白银",lv:2,min:5001},{t:"白银",lv:3,min:7001},
  {t:"黄金",lv:1,min:9001},{t:"黄金",lv:2,min:13001},{t:"黄金",lv:3,min:17001},
  {t:"铂金",lv:1,min:21001},{t:"铂金",lv:2,min:29001},{t:"铂金",lv:3,min:37001},
  {t:"钻石",lv:1,min:45001},{t:"钻石",lv:2,min:61001},{t:"钻石",lv:3,min:77001},
  {t:"星耀",lv:1,min:93001},{t:"星耀",lv:2,min:125001},{t:"星耀",lv:3,min:157001}
];
const KING_MIN=189001, KING_STEP=10000, KING_MAX=99;
function rankOf(p){
  if(p>=KING_MIN){
    let lv=Math.floor((p-KING_MIN)/KING_STEP)+1;
    if(lv>KING_MAX)lv=KING_MAX;
    return {t:"王者",lv,name:"王者"+lv,min:KING_MIN+(lv-1)*KING_STEP,isKing:true,maxed:lv>=KING_MAX};
  }
  let r=RANKS[0];
  for(const x of RANKS)if(p>=x.min)r=x;
  return {t:r.t,lv:r.lv,name:r.t+r.lv,min:r.min};
}
function nextOf(p){
  const r=rankOf(p);
  if(r.isKing){ return r.maxed?null:{name:"王者"+(r.lv+1),min:r.min+KING_STEP}; }
  const i=RANKS.findIndex(x=>x.t===r.t&&x.lv===r.lv);
  const nx=RANKS[i+1];
  return nx?{name:nx.t+nx.lv,min:nx.min}:null;
}
function trophyIcon(color,size,king){
  size=size||24;
  if(king){
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M3 8l4.2 3.4L12 3.5l4.8 7.9L21 8l-1.6 9H4.6L3 8z" fill="${color}" stroke="${color}" stroke-width="0.6"/><rect x="5" y="18.5" width="14" height="2.4" rx="1.2" fill="${color}"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="${color}" stroke-width="1.7"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="${color}" stroke-width="1.7"/>
    <path d="M4 21.5h16" stroke="${color}" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M10 14.7V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 21.5" stroke="${color}" stroke-width="1.7"/>
    <path d="M14 14.7V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 21.5" stroke="${color}" stroke-width="1.7"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="${color}" fill-opacity="0.16" stroke="${color}" stroke-width="1.7"/>
    <path d="M12 5.8l1.15 2.3 2.55.35-1.85 1.8.45 2.55-2.3-1.25-2.3 1.25.45-2.55-1.85-1.8 2.55-.35z" fill="${color}"/>
  </svg>`;
}

/* ================= 积分/挑战规则 ================= */
const BASE_SINGLE=20, BASE_MULTI=30, BONUS=50, MAX_ROUNDS=10;
function roundMult(r){ return r<=3?1:(r<=6?2:3); }
function baseOf(q){ return q.t==="multi"?BASE_MULTI:BASE_SINGLE; }

const ACH = [
  {id:"first",t:"首战告捷",d:"完成第一次挑战"},
  {id:"perfect",t:"零失误通关",d:"一次挑战 10 题全对"},
  {id:"streak10",t:"十日打卡",d:"连续打卡 10 天"},
  {id:"hundred",t:"百题斩",d:"累计答对 100 题"},
  {id:"killer",t:"错题克星",d:"重做错题并答对"}
];

/* ---------- 存储 ---------- */
const K="stockq_";
const cache = Object.create(null);
const syncText = document.querySelector("#syncBar span");
function failure(message){
  syncText.textContent=message;
  const overlay=document.createElement("div");
  overlay.setAttribute("role","alert");
  overlay.style.cssText="position:fixed;inset:0;z-index:9999;background:#fff;display:grid;place-content:center;padding:24px;text-align:center;color:#b42318";
  overlay.textContent=message+" 请检查连接后刷新页面，确认云端数据。";
  document.body.appendChild(overlay);
}
try {
  const rows=await sql("SELECT key, value FROM stock_progress");
  for(const row of rows) cache[row.key]=JSON.parse(row.value);
  syncText.textContent="学习进度已连接云端";
} catch(e) { failure("无法读取学习进度。"); throw e; }
let writes=Promise.resolve(), pending=0, failed=false;
window.addEventListener("beforeunload",e=>{if(pending||failed){e.preventDefault();e.returnValue="";}});
function ls(k,v){
  if(v===undefined)return cache[k]??null;
  const value=JSON.stringify(v);
  cache[k]=JSON.parse(value);
  syncText.textContent="正在保存学习进度…";
  pending++;
  writes=writes.then(()=>{if(failed)return;return sql("INSERT INTO stock_progress (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[k,value]);}).then(()=>{if(!failed && pending===1)syncText.textContent="学习进度已保存到云端";}).catch(()=>{if(!failed){failed=true;failure("保存结果未确认。");}}).finally(()=>{pending--;});
}
function todayStr(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function yStr(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}

/* ---------- 随机 ---------- */
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function pickN(arr,n,rng){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
function shuffle(a,rng){for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ---------- 题目生成 ---------- */
function makeBiz(st,rng){const opts=[st.b];while(opts.length<4){const d=STOCKS[Math.floor(rng()*STOCKS.length)].b;if(!opts.includes(d))opts.push(d);}shuffle(opts,rng);return {t:"biz",si:STOCKS.indexOf(st),opts,answer:st.b};}
function makeCode(st,rng){const opts=[st.c];while(opts.length<4){const d=STOCKS[Math.floor(rng()*STOCKS.length)].c;if(!opts.includes(d))opts.push(d);}shuffle(opts,rng);return {t:"code",si:STOCKS.indexOf(st),opts,answer:st.c};}
function makeMulti(kind,rng){
  if(kind==="ind"){
    const byInd={};STOCKS.forEach((s,i)=>{if(s.s)(byInd[s.s]=byInd[s.s]||[]).push(i);});
    const cands=Object.keys(byInd).filter(k=>byInd[k].length>=3);
    const ind=cands[Math.floor(rng()*cands.length)];
    const good=pickN(byInd[ind],3,rng);
    const others=STOCKS.map((_,i)=>i).filter(i=>STOCKS[i].s!==ind);
    const bad=pickN(others,3,rng);
    const all=shuffle(good.concat(bad),rng);
    return {t:"multi",kind:"ind",label:ind,opts:all.map(i=>({n:STOCKS[i].n,c:STOCKS[i].c})),correct:good.map(i=>STOCKS[i].c)};
  }else{
    const boards=["科创板","创业板","北交所"];
    const bd=boards[Math.floor(rng()*boards.length)];
    const good=[],others=[];
    STOCKS.forEach((s,i)=>{if(s.bd===bd)good.push(i);else others.push(i);});
    const g=pickN(good,3,rng),b=pickN(others,3,rng);
    const all=shuffle(g.concat(b),rng);
    return {t:"multi",kind:"board",label:bd,opts:all.map(i=>({n:STOCKS[i].n,c:STOCKS[i].c})),correct:g.map(i=>STOCKS[i].c)};
  }
}
/* ---------- 概念题工具 ---------- */
const TOP_SET=new Set(STOCKS.map(s=>s.c));
function concTop(ci){const m=CONCEPTS[ci].c;return m.filter(c=>TOP_SET.has(c));}
function concCorrect(ci,n,rng){const t=concTop(ci);const all=CONCEPTS[ci].c;if(t.length>=n)return pickN(t,n,rng);if(all.length>=n)return pickN(all,n,rng);return all.slice();}
function concDistract(ci,n,rng){
  const member=new Set(CONCEPTS[ci].c);
  const pool=Object.keys(CONCEPT_NAME).filter(c=>!member.has(c));
  const res=[];let guard=0;
  while(res.length<n&&guard++<200){const d=pool[Math.floor(rng()*pool.length)];if(!res.includes(d))res.push(d);}
  return res;
}
function makeConcReverse(ci,rng){
  const C=CONCEPTS[ci];
  const good=concCorrect(ci,1,rng)[0];
  const bad=concDistract(ci,3,rng);
  const all=shuffle([good].concat(bad),rng);
  return {t:"conc",cidx:ci,opts:all.map(c=>({n:CONCEPT_NAME[c]||c,c})),answer:good};
}
function makeConcMulti(rng){
  const ci=Math.floor(rng()*CONCEPTS.length);
  const C=CONCEPTS[ci];
  const good=concCorrect(ci,3,rng);
  const bad=concDistract(ci,3,rng);
  const all=shuffle(good.concat(bad),rng);
  return {t:"multi",kind:"conc",label:C.n,opts:all.map(c=>({n:CONCEPT_NAME[c]||c,c})),correct:good};
}
function dailyQuestions(round){
  const rng=mulberry32(hashStr(todayStr()+"#r"+round));
  const singles=[];
  const sc=pickN(STOCKS.map((_,i)=>i),3,rng);
  singles.push(makeBiz(STOCKS[sc[0]],mulberry32(hashStr(todayStr()+"#r"+round+"#b0"))));
  singles.push(makeCode(STOCKS[sc[1]],mulberry32(hashStr(todayStr()+"#r"+round+"#c0"))));
  singles.push(makeCode(STOCKS[sc[2]],mulberry32(hashStr(todayStr()+"#r"+round+"#c1"))));
  const cc=pickN(CONCEPTS.map((_,i)=>i),4,rng);
  cc.forEach((ci,k)=>{singles.push(makeConcReverse(ci,mulberry32(hashStr(todayStr()+"#r"+round+"#k"+k))));});
  shuffle(singles,rng);
  const multis=[];
  multis.push(makeMulti("ind",mulberry32(hashStr(todayStr()+"#r"+round+"#mi"))));
  multis.push(makeMulti("board",mulberry32(hashStr(todayStr()+"#r"+round+"#mb"))));
  multis.push(makeConcMulti(mulberry32(hashStr(todayStr()+"#r"+round+"#mc"))));
  const final=[];let mi=0;
  for(let i=0;i<7;i++){final.push(singles[i]);if(i===1||i===4||i===6){if(mi<3)final.push(multis[mi++]);}}
  while(mi<3)final.push(multis[mi++]);
  return final;
}

/* ---------- 状态 ---------- */
let state=ls("state")||{points:0,streak:0,lastDone:null,todayRounds:0,todayPts:0,todayDate:null,totalCorrect:0,totalAnswered:0,ach:[],wrong:[]};
function saveState(){ls("state",state);}
function addPts(x){state.points+=x;state.todayPts+=x;}

/* ---------- 工具 ---------- */
const $=s=>document.querySelector(s);
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2000);}
function fmtM(m){return "约 "+m.toLocaleString("zh-CN")+" 亿元";}
function tier(m){return m>=1000?"大盘股":m>=200?"中盘股":"小盘股";}
function boardCls(bd){return bd==="科创板"?"kc":bd==="创业板"?"cy":bd==="北交所"?"bj":"zs";}
function signed(n){return n>=0?("+"+n):(""+n);}

/* ---------- 渲染：头部 / 今日 / 段位 ---------- */
function renderHead(){
  $("#hPts").textContent=state.points;
  const r=rankOf(state.points);
  $("#hRank").textContent=r.name;
  $("#hRankPill").querySelector("svg").outerHTML=trophyIcon(TIER_COLOR[r.t],16,r.isKing);
}
function renderToday(){
  const today=todayStr();
  const R=state.todayRounds;
  const box=$("#todayBox");box.classList.remove("overdue","going","done");
  const b=$("#todayBtn");
  if(R>=MAX_ROUNDS){
    box.classList.add("done");
    $("#todayIcon").innerHTML='<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>';
    $("#todayIcon").setAttribute("stroke","#16a34a");
    $("#todayTitle").textContent="今日 10 次挑战已用完";
    $("#todaySub").textContent=`今日净得 ${signed(state.todayPts)} 积分 · 明天再来`;
    b.textContent="查看段位";b.className="tbtn ghost";
    b.onclick=()=>switchView("points");
  }else if(R>0){
    box.classList.add("going");
    $("#todayIcon").innerHTML='<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
    $("#todayIcon").setAttribute("stroke","#2f6fed");
    $("#todayTitle").textContent=`今日已挑战 ${R}/${MAX_ROUNDS} 次`;
    $("#todaySub").textContent=`第 ${R+1} 次挑战积分 ×${roundMult(R+1)} · 答对加分答错扣分`;
    b.textContent="继续挑战";b.className="tbtn";
    b.onclick=()=>switchView("challenge");
  }else{
    box.classList.add("overdue");
    $("#todayIcon").innerHTML='<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
    $("#todayIcon").setAttribute("stroke","#e5484d");
    $("#todayTitle").textContent="今日第 1 次挑战待开始";
    $("#todaySub").textContent="每天最多 10 次挑战，答错要重做两遍才过关";
    b.textContent="去闯关";b.className="tbtn";
    b.onclick=()=>switchView("challenge");
  }
}
function renderPoints(){
  const p=state.points, r=rankOf(p), nx=nextOf(p);
  $("#lvTrophy").innerHTML=trophyIcon(TIER_COLOR[r.t],78,r.isKing);
  $("#lvName").textContent=r.name;
  $("#lvName").style.color=TIER_COLOR[r.t];
  const bar=$("#lvBar");
  let frac=1;
  if(nx){frac=Math.max(0,Math.min(1,(p-r.min)/(nx.min-r.min)));}
  if(!nx){frac=1;}
  bar.style.width=(frac*100)+"%";
  bar.style.background=TIER_COLOR[r.t];
  if(nx){$("#lvNext").textContent=`距离「${nx.name}」还需 ${Math.max(0,nx.min-p)} 积分`;}
  else{$("#lvNext").textContent="已达最高段位：王者99（满级）";}
  $("#ptsNum").textContent=p;
  $("#todayPts").textContent=signed(state.todayPts);
  $("#stStreak").textContent=state.streak;
  $("#stCorrect").textContent=state.totalCorrect;
  $("#stRate").textContent=(state.totalAnswered?Math.round(state.totalCorrect/state.totalAnswered*100):0)+"%";
  $("#stRounds").textContent=(state.todayDate===todayStr()?state.todayRounds:0)+"/"+MAX_ROUNDS;
  // 段位一览
  const rl=$("#rankLadder");rl.innerHTML="";
  const tiers=[
    {t:"青铜",r:"0 – 3000"},{t:"白银",r:"3001 – 9000"},{t:"黄金",r:"9001 – 21000"},
    {t:"铂金",r:"21001 – 45000"},{t:"钻石",r:"45001 – 93000"},{t:"星耀",r:"93001 – 189000"}
  ];
  tiers.forEach(t=>{
    const row=document.createElement("div");row.className="rrow";
    if(r.t===t.t)row.classList.add("cur");
    row.innerHTML=`<span class="ric">${trophyIcon(TIER_COLOR[t.t],28,false)}</span>
      <span class="rn" style="color:${TIER_COLOR[t.t]}">${t.t}1-3</span>
      <span class="rr">${t.r} 分</span>`;
    rl.appendChild(row);
  });
  const krow=document.createElement("div");krow.className="rrow";
  if(r.isKing)krow.classList.add("cur");
  krow.innerHTML=`<span class="ric">${trophyIcon(TIER_COLOR["王者"],28,true)}</span>
    <span class="rn" style="color:${TIER_COLOR["王者"]}">王者</span>
    <span class="rr">189001 分起，每 1 万分升 1 级，王者99 满级</span>`;
  rl.appendChild(krow);
  // 成就
  const al=$("#achList");al.innerHTML="";
  ACH.forEach(a=>{
    const on=state.ach.includes(a.id);
    const el=document.createElement("div");el.className="badge"+(on?" on":"");
    el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
      <div><div class="bt">${a.t}</div><div class="bd">${a.d}</div></div>`;
    al.appendChild(el);
  });
}

/* ---------- 挑战流程 ---------- */
let qs=[],cur=0,qStreak=[],qWrong=[],roundWrong=0,currentRound=1,curMult=1,locked=false;
function saveProgress(pending=null){saveState();ls("daily",{date:todayStr(),round:currentRound,qs,cur,qStreak,qWrong,roundWrong,pending});}

function renderChallenge(){
  const body=$("#challengeBody");
  const today=todayStr();
  if(state.todayDate!==today){state.todayDate=today;state.todayRounds=0;state.todayPts=0;saveState();}
  if(state.todayRounds>=MAX_ROUNDS){
    body.innerHTML=`<div class="empty">今日 10 次挑战已用完。<br>今日净得 <b>${signed(state.todayPts)}</b> 积分，明天再来！</div>`;
    return;
  }
  currentRound=state.todayRounds+1;
  curMult=roundMult(currentRound);
  const saved=ls("daily");
  if(saved&&saved.date===today&&saved.round===currentRound){
    qs=saved.qs;cur=saved.cur;qStreak=saved.qStreak;qWrong=saved.qWrong;roundWrong=saved.roundWrong;
    if(saved.pending){
      if(saved.pending.advance){if(cur+1>=qs.length){finishRound();return;}cur++;}
      else qs[cur].opts=shuffle(qs[cur].opts.slice(),()=>Math.random());
      saveProgress();
    }
  }else{
    qs=dailyQuestions(currentRound);cur=0;
    qStreak=qs.map(()=>0);qWrong=qs.map(()=>false);roundWrong=0;
    saveProgress();
  }
  locked=false;
  renderQ();
}
function renderQ(){
  const body=$("#challengeBody");
  const q=qs[cur];
  const prog=Math.round(cur/qs.length*100);
  const roundHtml=`<div class="roundinfo"><span class="roundtag">今日第 ${currentRound} 次挑战</span><span class="multtag">本题积分 ×${curMult}</span></div>`;
  body.innerHTML=roundHtml+(q.t==="multi"?multiHTML(q,prog):(q.t==="conc"?concHTML(q,prog):singleHTML(q,prog)));
  if(q.t==="multi")bindMulti(q);else if(q.t==="conc")bindConc();else bindSingle();
}
function singleHTML(q,prog){
  const st=STOCKS[q.si];
  const isCode=q.t==="code";
  const badge=isCode?`<span class="btag">${st.bd}</span>`
    :`<span class="qcode"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" stroke-width="2.4" style="vertical-align:-1px"><path d="M3 17l5-5 4 4 8-9"/><path d="M21 7v5h-5"/></svg> ${st.c}</span><span class="btag">${st.bd}</span>`;
  const ask=isCode?`「${st.n}」的股票代码是？`:`「${st.n}」的主营业务是？`;
  let h=`<div class="qmeta"><span class="qprog">第 ${cur+1} / ${qs.length} 题</span><span class="qtype single">${isCode?"单选题 · 选代码":"单选题 · 选主营业务"}</span></div>
    <div class="qbar"><i style="width:${prog}%"></i></div>
    <div class="qname">${st.n}</div><div class="qbadges">${badge}</div>
    <div class="qask">${ask}</div><div id="optBox">`;
  q.opts.forEach((o,i)=>{h+=`<button class="opt" data-i="${i}"><span class="k">${"ABCD"[i]}</span>${o}</button>`;});
  h+=`</div><div id="fbBox"></div>`;
  return h;
}
function bindSingle(){
  document.querySelectorAll("#optBox .opt").forEach(b=>b.onclick=()=>chooseSingle(+b.dataset.i));
}
function concHTML(q,prog){
  const C=CONCEPTS[q.cidx];
  const ask=`以下哪只股票属于「${C.n}」概念？`;
  let h=`<div class="qmeta"><span class="qprog">第 ${cur+1} / ${qs.length} 题</span><span class="qtype single">单选题 · 题材找股</span></div>
    <div class="qbar"><i style="width:${prog}%"></i></div>
    <div class="qname">${C.n}</div>
    <div class="qbadges"><span class="btag">近半年涨幅 ${C.g>=0?"+":""}${C.g}%</span></div>
    <div class="qask">${ask}</div><div id="optBox">`;
  q.opts.forEach((o,i)=>{h+=`<button class="opt" data-i="${i}"><span class="k">${"ABCD"[i]}</span>${o.n}<span class="oc">${o.c}</span></button>`;});
  h+=`</div><div id="fbBox"></div>`;
  return h;
}
function bindConc(){document.querySelectorAll("#optBox .opt").forEach(b=>b.onclick=()=>chooseConc(+b.dataset.i));}
function chooseConc(i){
  if(locked)return;locked=true;
  const q=qs[cur];const base=baseOf(q);
  const correct=q.opts[i].c===q.answer;
  let advance=false;
  if(correct){
    qStreak[cur]=(qStreak[cur]||0)+1;
    addPts(base*curMult);state.totalCorrect++;state.totalAnswered++;
    if(qStreak[cur]>=(qWrong[cur]?2:1))advance=true;
  }else{
    qWrong[cur]=true;qStreak[cur]=0;roundWrong++;
    addPts(-base*curMult);state.totalAnswered++;
  }
  paintConc(q,i,correct);
  const delta=base*curMult;
  const icon=correct?okIcon():noIcon();
  const fb=document.getElementById("fbBox");
  let msg;
  if(correct&&advance)msg=`答对了 <span class="ptsdelta up">+${delta}</span>`;
  else if(correct&&!advance)msg=`答对了 <span class="ptsdelta up">+${delta}</span> · 再巩固一次（选项已重排）`;
  else msg=`答错了 <span class="ptsdelta down">−${delta}</span> · 重新作答`;
  const C=CONCEPTS[q.cidx];
  const ans=q.opts.find(o=>o.c===q.answer);
  fb.innerHTML=`<div class="feedback"><div class="fb-h">${icon}${msg}</div>
    <div class="kv"><span class="lab">正确答案</span><span class="val">${ans.n}（${ans.c}）</span></div>
    <div class="kv"><span class="lab">所属概念</span><span class="val">${C.n}</span></div></div>
    <div class="row"><button class="btn" id="nextBtn">${advance?(cur+1<qs.length?"下一题":"完成本次挑战"):"继续答题"}</button></div>`;
  document.getElementById("nextBtn").onclick=advance?nextQ:retryQ;
  saveProgress({advance});
}
function paintConc(q,i,correct){
  const box=document.getElementById("optBox");
  box.querySelectorAll(".opt").forEach((b,j)=>{
    b.disabled=true;
    if(j===i)b.classList.add(correct?"correct":"wrong");
    else if(q.opts[j].c===q.answer)b.classList.add("correct");
    else b.classList.add("dim");
  });
}
function multiHTML(q,prog){
  const noun=q.kind==="ind"?"行业":(q.kind==="board"?"板块":"概念");
  const ask=q.kind==="ind"?`以下哪些公司属于「${q.label}」行业？（多选，选完点确认）`
    :(q.kind==="board"?`以下哪些是「${q.label}」股票？（多选，选完点确认）`
    :`以下哪些股票属于「${q.label}」概念？（多选，选完点确认）`);
  const showCode=q.kind!=="board";
  let h=`<div class="qmeta"><span class="qprog">第 ${cur+1} / ${qs.length} 题</span><span class="qtype multi">多选题 · 选${noun}</span></div>
    <div class="qbar"><i style="width:${prog}%"></i></div>
    <div class="qask">${ask}</div><div id="optBox">`;
  q.opts.forEach((o,i)=>{const code=showCode?`<span class="oc">${o.c}</span>`:"";h+=`<button class="opt" data-i="${i}"><span class="k">${"ABCDEF"[i]}</span>${o.n}${code}</button>`;});
  h+=`</div><button class="btn" id="confirmBtn" style="margin-top:4px">确认答案</button><div id="fbBox"></div>`;
  return h;
}
function bindMulti(q){
  const sel=new Set();
  document.querySelectorAll("#optBox .opt").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(sel.has(i)){sel.delete(i);b.classList.remove("selected");}else{sel.add(i);b.classList.add("selected");}});
  document.getElementById("confirmBtn").onclick=()=>confirmMulti(q,sel);
}

function chooseSingle(i){
  if(locked)return;locked=true;
  const q=qs[cur],st=STOCKS[q.si],base=baseOf(q);
  const correct=q.opts[i]===q.answer;
  let advance=false;
  if(correct){
    qStreak[cur]=(qStreak[cur]||0)+1;
    addPts(base*curMult);state.totalCorrect++;state.totalAnswered++;
    if(qStreak[cur]>=(qWrong[cur]?2:1))advance=true;
  }else{
    qWrong[cur]=true;qStreak[cur]=0;roundWrong++;
    addPts(-base*curMult);state.totalAnswered++;
    addWrong(st,q,i);
  }
  paintSingle(q,i,correct);
  const delta=base*curMult;
  const icon=correct?okIcon():noIcon();
  const st2=STOCKS[q.si];
  const fb=document.getElementById("fbBox");
  let msg;
  if(correct&&advance)msg=`答对了 <span class="ptsdelta up">+${delta}</span>`;
  else if(correct&&!advance)msg=`答对了 <span class="ptsdelta up">+${delta}</span> · 再巩固一次（选项已重排）`;
  else msg=`答错了 <span class="ptsdelta down">−${delta}</span> · 重新作答`;
  fb.innerHTML=`<div class="feedback"><div class="fb-h">${icon}${msg}</div>${knowledgeHTML(st2,q)}</div>
    <div class="row"><button class="btn" id="nextBtn">${advance?(cur+1<qs.length?"下一题":"完成本次挑战"):"继续答题"}</button></div>`;
  document.getElementById("nextBtn").onclick=advance?nextQ:retryQ;
  saveProgress({advance});
}
function paintSingle(q,i,correct){
  const box=document.getElementById("optBox");
  box.querySelectorAll(".opt").forEach((b,j)=>{
    b.disabled=true;
    if(j===i)b.classList.add(correct?"correct":"wrong");
    else if(q.opts[j]===q.answer)b.classList.add("correct");
    else b.classList.add("dim");
  });
}
function confirmMulti(q,sel){
  if(locked)return;locked=true;
  const correctSet=new Set();q.opts.forEach((o,i)=>{if(q.correct.includes(o.c))correctSet.add(i);});
  const user=[...sel];
  const isPerfect=user.length===correctSet.size&&user.every(i=>correctSet.has(i));
  const base=baseOf(q);let advance=false;
  if(isPerfect){
    qStreak[cur]=(qStreak[cur]||0)+1;
    addPts(base*curMult);state.totalCorrect++;state.totalAnswered++;
    if(qStreak[cur]>=(qWrong[cur]?2:1))advance=true;
  }else{
    qWrong[cur]=true;qStreak[cur]=0;roundWrong++;
    addPts(-base*curMult);state.totalAnswered++;
  }
  const box=document.getElementById("optBox");
  box.querySelectorAll(".opt").forEach((b,j)=>{
    b.disabled=true;
    if(correctSet.has(j))b.classList.add("correct");
    else if(sel.has(j))b.classList.add("wrong");
    else b.classList.add("dim");
  });
  const delta=base*curMult;
  const icon=isPerfect?okIcon():noIcon();
  const correctNames=q.opts.filter(o=>q.correct.includes(o.c)).map(o=>o.n+(q.kind==="board"?"":("（"+o.c+"）"))).join("、");
  const fb=document.getElementById("fbBox");
  let msg;
  if(isPerfect&&advance)msg=`全部选对 <span class="ptsdelta up">+${delta}</span>`;
  else if(isPerfect&&!advance)msg=`全部选对 <span class="ptsdelta up">+${delta}</span> · 再巩固一次（选项已重排）`;
  else msg=`选错/漏选 <span class="ptsdelta down">−${delta}</span> · 重新作答`;
  fb.innerHTML=`<div class="feedback"><div class="fb-h">${icon}${msg}</div>
    <div class="kv"><span class="lab">正确答案</span><span class="val">${correctNames}</span></div>
    <div class="kv"><span class="lab">提示</span><span class="val" style="color:var(--ink2)">${q.kind==="ind"?("这几家都属于「"+q.label+"」行业"):(q.kind==="board"?("这几家都是「"+q.label+"」股票"):("这几只都属于「"+q.label+"」概念"))}</span></div></div>
    <div class="row"><button class="btn" id="nextBtn">${advance?(cur+1<qs.length?"下一题":"完成本次挑战"):"继续答题"}</button></div>`;
  document.getElementById("nextBtn").onclick=advance?nextQ:retryQ;
  saveProgress({advance});
}
function knowledgeHTML(st,q){
  const ansLabel=q.t==="code"?"正确答案（代码）":"正确答案（主营业务）";
  const fm=st.f&&st.f.length?`<div class="kv"><span class="lab">曾用名</span><span class="val">${st.f.join("、")}</span></div>`:"";
  return `<div class="kv"><span class="lab">${ansLabel}</span><span class="val">${q.answer}</span></div>
    <div class="kv"><span class="lab">代码</span><span class="val">${st.c}</span></div>
    <div class="kv"><span class="lab">主营业务</span><span class="val">${st.b}</span></div>
    <div class="kv"><span class="lab">板块</span><span class="val">${st.bd}</span></div>
    <div class="kv"><span class="lab">最新市值</span><span class="val" style="color:var(--ok)">${fmtM(st.m)} <small>(${tier(st.m)})</small></span></div>
    ${fm}`;
}
function okIcon(){return '<svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>';}
function noIcon(){return '<svg viewBox="0 0 24 24" fill="none" stroke="#e5484d" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>';}

function retryQ(){
  qs[cur].opts=shuffle(qs[cur].opts.slice(),()=>Math.random());
  locked=false;saveProgress();renderQ();
}
function nextQ(){
  if(cur+1<qs.length){cur++;locked=false;saveProgress();renderQ();}
  else finishRound();
}
function addWrong(st,q,selIdx){
  const key=st.c+"|"+q.t;
  if(!state.wrong.find(w=>w.key===key))
    state.wrong.unshift({key,name:st.n,code:st.c,business:st.b,m:st.m,f:st.f||[],bd:st.bd,type:q.t,userAnswer:q.opts[selIdx],answer:q.answer});
}
function finishRound(){
  let bonus=0;
  if(roundWrong===0){bonus=BONUS;addPts(bonus);}
  // 连续打卡（当天第一次完成时结算）
  if(state.todayRounds===0){
    if(state.lastDone){
      const y=new Date(state.lastDone);y.setDate(y.getDate()+1);
      if(yStr(y)===todayStr())state.streak+=1;else state.streak=1;
    }else state.streak=1;
    state.lastDone=todayStr();
  }
  state.todayRounds++;
  if(!state.ach.includes("first"))state.ach.push("first");
  if(roundWrong===0&&!state.ach.includes("perfect"))state.ach.push("perfect");
  if(state.streak>=10&&!state.ach.includes("streak10"))state.ach.push("streak10");
  if(state.totalCorrect>=100&&!state.ach.includes("hundred"))state.ach.push("hundred");
  saveState();ls("daily",null);
  renderHead();renderToday();renderPoints();
  const body=$("#challengeBody");
  body.innerHTML=`<div class="empty" style="padding:24px 10px">
    第 ${currentRound} 次挑战完成！<br><br>
    本次 ${roundWrong===0?"<b>零失误</b>":"<b>"+roundWrong+" 处失误"}</b>${bonus?"（零失误奖励 +"+bonus+")":""}<br>
    今日净得 <b>${signed(state.todayPts)}</b> 积分 · 当前段位 <b>${rankOf(state.points).name}</b><br>
    剩余挑战 <b>${MAX_ROUNDS-state.todayRounds}</b> 次
  </div>
  <div class="row"><button class="btn ghost" id="againBtn">${state.todayRounds<MAX_ROUNDS?"再来一次挑战":"查看段位"}</button></div>`;
  document.getElementById("againBtn").onclick=()=>{if(state.todayRounds<MAX_ROUNDS){renderChallenge();}else switchView("points");};
  toast(roundWrong===0?"零失误！奖励 +"+bonus:"第 "+currentRound+" 次挑战完成");
}

/* ---------- 复习 / 错题 ---------- */
function renderWrong(){
  const wl=$("#wrongList"),cnt=state.wrong.length;
  $("#wrongCount").textContent=cnt?`共 ${cnt} 道错题，建议定期重做：`:"还没有错题，继续保持！";
  const btn=$("#btnDrill");
  if(cnt){btn.style.display="";$("#drillN").textContent=cnt;}else btn.style.display="none";
  wl.innerHTML="";
  state.wrong.slice(0,30).forEach(w=>{
    const d=document.createElement("div");d.className="scard";d.style.marginBottom="10px";
    const fm=w.f&&w.f.length?`<div class="sf">曾用名：${w.f.join("、")}</div>`:"";
    d.innerHTML=`<div class="sn">${w.name} <span class="sc">${w.code}</span><span class="sboard ${boardCls(w.bd||"主板")}">${w.bd||"主板"}</span></div>
      <div class="sb">主营业务：${w.business}</div>
      <div class="sm">${fmtM(w.m)} <small>(${tier(w.m)})</small></div>${fm}`;
    wl.appendChild(d);
  });
}
let drilling=false;
function startDrill(){
  if(!state.wrong.length)return;
  drilling=true;const items=state.wrong.slice();let di=0;const body=$("#challengeBody");
  function show(){
    if(di>=items.length){drilling=false;renderChallenge();renderWrong();toast("错题重做完成");return;}
    const w=items[di];
    const r=mulberry32(hashStr("drill"+w.key+di));
    const isCode=w.type==="code";
    let opts,answer;
    if(isCode){opts=[w.code];answer=w.code;while(opts.length<4){const d=STOCKS[Math.floor(r()*STOCKS.length)].c;if(!opts.includes(d))opts.push(d);}}
    else{opts=[w.business];answer=w.business;while(opts.length<4){const d=STOCKS[Math.floor(r()*STOCKS.length)].b;if(!opts.includes(d))opts.push(d);}}
    shuffle(opts,r);
    const ask=isCode?`「${w.name}」的股票代码是？`:`「${w.name}」的主营业务是？`;
    body.innerHTML=`<div class="qmeta"><span class="qprog">重做错题 ${di+1}/${items.length}</span><span class="qtype single">错题重做</span></div>
      <div class="qbar"><i style="width:${Math.round(di/items.length*100)}%"></i></div>
      <div class="qname">${w.name}</div><div class="qask">${ask}</div><div id="optBox"></div><div id="fbBox"></div>`;
    const ob=document.getElementById("optBox");
    opts.forEach((o,i)=>{const b=document.createElement("button");b.className="opt";b.innerHTML=`<span class="k">${"ABCD"[i]}</span>${o}`;b.onclick=()=>{
      const ok=o===answer;
      ob.querySelectorAll(".opt").forEach((x,j)=>{x.disabled=true;if(j===i)x.classList.add(ok?"correct":"wrong");else if(opts[j]===answer)x.classList.add("correct");else x.classList.add("dim");});
      if(ok)state.wrong=state.wrong.filter(x=>x.key!==w.key);
      if(ok&&!state.ach.includes("killer"))state.ach.push("killer");
      saveState();renderPoints();
      const fb=document.getElementById("fbBox");
      fb.innerHTML=`<div class="feedback"><div class="fb-h">${ok?'<svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>答对了，已移出错题本':'<svg viewBox="0 0 24 24" fill="none" stroke="#e5484d" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>再记一次'}</div>
        <div class="kv"><span class="lab">代码</span><span class="val">${w.code}</span></div>
        <div class="kv"><span class="lab">主营业务</span><span class="val">${w.business}</span></div>
        <div class="kv"><span class="lab">最新市值</span><span class="val" style="color:var(--ok)">${fmtM(w.m)} <small>(${tier(w.m)})</small></span></div></div>
        <div class="row"><button class="btn" id="dn">下一题</button></div>`;
      document.getElementById("dn").onclick=()=>{di++;show();};
    };ob.appendChild(b);});
  }
  show();
}

/* ---------- 知识库浏览 ---------- */
let libBoard="全部",libKw="";
function renderLib(){
  const chips=$("#libChips");const boards=["全部","主板","创业板","科创板","北交所"];chips.innerHTML="";
  boards.forEach(b=>{const el=document.createElement("button");el.className="chip"+(libBoard===b?" on":"");el.textContent=b;el.onclick=()=>{libBoard=b;renderLib();};chips.appendChild(el);});
  const grid=$("#libGrid");const kw=libKw.trim().toLowerCase();
  const list=STOCKS.filter(s=>(libBoard==="全部"||s.bd===libBoard)&&(!kw||s.n.toLowerCase().includes(kw)||s.c.includes(kw)||s.b.toLowerCase().includes(kw)));
  if(!list.length){grid.innerHTML=`<div class="empty">没有匹配的股票</div>`;return;}
  grid.innerHTML="";
  list.forEach(s=>{
    const d=document.createElement("div");d.className="scard";
    const fm=s.f&&s.f.length?`<div class="sf">曾用名：${s.f.join("、")}</div>`:"";
    d.innerHTML=`<div class="sn">${s.n} <span class="sc">${s.c}</span><span class="sboard ${boardCls(s.bd)}">${s.bd}</span></div>
      <div class="sb">${s.b} <span class="stag">${s.s}</span></div>
      <div class="sm">${fmtM(s.m)} <small>(${tier(s.m)})</small></div>${fm}`;
    grid.appendChild(d);
  });
}

function renderConcepts(){
  const grid=$("#conceptGrid");if(!grid)return;
  grid.innerHTML="";
  CONCEPTS.forEach((C,ci)=>{
    const top=concTop(ci);
    const sample=(top.length?top:C.c).slice(0,3).map(c=>`${CONCEPT_NAME[c]||c} ${c}`).join(" · ");
    const d=document.createElement("div");d.className="scard";
    d.innerHTML=`<div class="sn">${C.n} <span class="sboard kc">${C.g>=0?"+":""}${C.g}%</span></div>
      <div class="sb">${sample}</div>
      <div class="sm" style="color:var(--ink2)">成分 ${C.c.length} 只</div>`;
    grid.appendChild(d);
  });
}

/* ---------- 视图切换 ---------- */
function switchView(v){
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
  $("#view-"+v).classList.add("active");
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===v));
  if(v==="challenge")renderChallenge();
  if(v==="points")renderPoints();
  if(v==="review"){renderWrong();renderLib();renderConcepts();}
  ls("lastView",v);
}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>switchView(t.dataset.view));

/* ---------- 备份 ---------- */
$("#btnExport").onclick=()=>{
  const data={app:"stockq",v:4,exported:todayStr(),state};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download="股票启蒙进度_"+todayStr()+".json";a.click();toast("已导出备份");
};
$("#btnImport").onclick=()=>$("#fileInput").click();
$("#fileInput").onchange=e=>{
  const f=e.target.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{try{const d=JSON.parse(rd.result);if(d.app!=="stockq"||!d.state)throw 0;
    state=Object.assign(state,d.state);saveState();renderHead();renderToday();renderPoints();renderWrong();toast("已恢复进度");}
    catch(err){toast("文件格式不正确");}};
  rd.readAsText(f);e.target.value="";
};
$("#btnReset").onclick=()=>$("#resetModal").classList.add("show");
$("#resetCancel").onclick=()=>$("#resetModal").classList.remove("show");
$("#resetOk").onclick=()=>{
  ls("state",null);ls("daily",null);
  state={points:0,streak:0,lastDone:null,todayRounds:0,todayPts:0,todayDate:null,totalCorrect:0,totalAnswered:0,ach:[],wrong:[]};
  saveState();
  $("#resetModal").classList.remove("show");renderHead();renderToday();renderPoints();renderWrong();toast("已重置");
};
$("#btnDrill").onclick=startDrill;
$("#libSearch").oninput=e=>{libKw=e.target.value;renderLib();};

/* ---------- 版本迁移 ---------- */
function migrate(){
  if(ls("ver")!=="4"){
    ls("daily",null);
    const st=ls("state");
    if(st){st.todayRounds=0;st.todayPts=st.todayPts||0;st.todayDate=null;if(!Array.isArray(st.wrong))st.wrong=[];}
    ls("state",st);ls("ver","4");
  }
}
migrate();

/* ---------- 初始化 ---------- */
renderHead();renderToday();renderPoints();
switchView(ls("lastView")||"challenge");

}
