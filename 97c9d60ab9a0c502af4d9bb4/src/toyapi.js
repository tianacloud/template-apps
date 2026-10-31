"use strict";
/* 游戏进度和成绩存储适配层。 */

const WEB_SAVE_KEY="abyss_web_save_v1";
const WEB_LB_KEY="abyss_web_lb_v1";
const WEB_NICK_KEY="abyss_web_nick_v1";

const WEB_API={
  ready:true,
  supported:false,          // 网页版没有 Toy 宿主能力
  relation:{isFollowing:false, hasFanMedal:false, isCharging:false},
  actions:{liked:false, coinCount:0, favorited:false},
  checked:true,
  isOwner:false,
  upMid:null, upUrl:null,
  lbCache:{}, lbMy:{}, lbLoading:{}, lbFetchedAt:{},
  seq:0,
  web:true,
  /* 网页版：充电门槛不适用，专属石直接开放，避免四分之一箱位不可用 */
  webUnlockEx:true
};

/* ── 昵称 ── */
function webNick(){
  try{ const v=jadeStorage.getItem(WEB_NICK_KEY); if(v) return v.slice(0,10); }catch(e){}
  return "工匠";
}
function webSetNick(v){
  v=(v||"").trim().slice(0,10);
  if(!v) return false;
  try{ jadeStorage.setItem(WEB_NICK_KEY,v); }catch(e){ return false; }
  /* 改昵称后同步刷新游戏榜单里的名字 */
  try{
    const lb=JSON.parse(jadeStorage.getItem(WEB_LB_KEY)||"{}");
    for(const b in lb){ (lb[b].rows||[]).forEach(r=>{ if(r.me) r.name=v; }); }
    jadeStorage.setItem(WEB_LB_KEY,JSON.stringify(lb));
  }catch(e){}
  return true;
}

/* ── 本地存储封装（隐私模式/配额满时静默降级为内存） ── */
const _mem={};
function lsGet(k){
  try{ const v=jadeStorage.getItem(k); return v==null?(_mem[k]||null):v; }
  catch(e){ return _mem[k]||null; }
}
function lsSet(k,v){
  _mem[k]=v;
  try{ jadeStorage.setItem(k,v); return true; }catch(e){ return false; }
}

/* ── 存档（沿用 Toy 版 snapshot / applySnapshot 结构，键名换成网页版） ── */
async function loadCloudSave(){
  try{
    const raw=lsGet(WEB_SAVE_KEY);
    if(!raw) return false;
    const o=JSON.parse(raw);
    if(!applySnapshot(o)) return false;
    say("云端存档已续上 · 第 "+G.day+" 天", false, "good");
    G.log.unshift("存档 · 续上第 "+G.day+" 天的账本");
    return true;
  }catch(e){ return false; }
}
let _saveTimer=0;
function saveCloudSoon(){
  clearTimeout(_saveTimer);
  _saveTimer=setTimeout(()=>{ lsSet(WEB_SAVE_KEY, JSON.stringify(snapshot())); }, 800);
}

/* ── 互动检测：网页版无宿主，直接返回（不改任何加成） ── */
async function checkToySocial(){
  WEB_API.checked=true;
  return WEB_API.relation;
}
function socialRateBonus(){ return 0; }
function hasFullSocial(){ return false; }
/* 网页版不设充电门槛：专属石（异石箱）直接可购，避免内容不可达 */
function hasCharge(){ return WEB_API.webUnlockEx; }
function unlockAllForOwner(){ /* 网页版无需解锁 */ }
function ownerParam(){ return false; }
function exParam(){ return false; }

/* ── 游戏排行榜：按 board 分别存前 N 条 ── */
function lbReadAll(){
  try{ return JSON.parse(lsGet(WEB_LB_KEY)||"{}"); }catch(e){ return {}; }
}
function lbWriteAll(o){ lsSet(WEB_LB_KEY, JSON.stringify(o)); }

/* 分数上报：写入游戏榜单并刷新缓存（与 Toy 版同签名） */
function submitScoreBoard(score, board){
  board=board||LB_BOARD;
  score=Math.max(0,Math.round(score||0));
  try{
    const all=lbReadAll();
    const b=all[board]||{rows:[]};
    let me=b.rows.find(r=>r.me);
    if(!me){ me={name:webNick(),score:0,me:true}; b.rows.push(me); }
    if(score>me.score) me.score=score;
    b.rows.sort((x,y)=>y.score-x.score);
    b.rows=b.rows.slice(0,LB_LIMIT);
    all[board]=b;
    lbWriteAll(all);
    WEB_API.lbCache[board]=b.rows.slice();
    WEB_API.lbFetchedAt[board]=Date.now();
    const myIdx=b.rows.findIndex(r=>r.me);
    WEB_API.lbMy[board]=(myIdx>=0)?{rank:myIdx+1,score:b.rows[myIdx].score,nickname:b.rows[myIdx].name,ranked:true}:null;
  }catch(e){}
  return Promise.resolve(true);
}
/* 拉榜：直接读游戏缓存 */
function loadLeaderboard(target, board, titles){
  board=board||LB_BOARD;
  const all=lbReadAll();
  const b=all[board]||{rows:[]};
  WEB_API.lbCache[board]=(b.rows||[]).slice(0,LB_LIMIT);
  WEB_API.lbFetchedAt[board]=Date.now();
  const myIdx=WEB_API.lbCache[board].findIndex(r=>r.me);
  WEB_API.lbMy[board]=(myIdx>=0)
    ? {rank:myIdx+1,score:WEB_API.lbCache[board][myIdx].score,nickname:WEB_API.lbCache[board][myIdx].name,ranked:true}
    : null;
  renderLeaderboard(target, board, titles);
  return Promise.resolve();
}
/* 渲染：结构与 Toy 版一致，字段名改游戏版（score / name） */
function renderLeaderboard(target, board, titles){
  const el=target;
  if(!el) return;
  board=board||LB_BOARD;
  const cache=WEB_API.lbCache[board];
  const me=WEB_API.lbMy[board];
  const isVal=(board===LB_BOARD_VAL);
  const tMap=titles||LB_TITLES;
  let h=`<div class="rw"><span class="k">本榜</span><span class="v">游戏记录 · ${LB_LIMIT} 强 · ${isVal?"按单件最高成交价":"按累计收益"}</span></div>`;
  if(!cache || !cache.length){
    h+=`<div class="rw"><span class="k">暂无</span><span class="v">游戏尚无记录 · 开箱出货后自动上榜</span></div>`;
  }else{
    h+=`<div class="lb-list">`;
    cache.forEach((it,i)=>{
      const rank=i+1;
      const name=(it.name||("工匠"+rank)).toString().slice(0,8);
      const score=Math.round(it.score||0);
      const meRow=!!(me && me.rank===rank);
      const t=tMap[rank];
      const cls=rank<=3?(" top"+rank):"";
      h+=`<div class="lb-row${cls}${meRow?' me':''}">
            <span class="lb-r">${rank}</span>
            <span class="lb-n">${name}${t?`<span class="lb-title">${t}</span>`:""}</span>
            <span class="lb-s">${isVal?("成交 "+score+" 金"):(score+" 金")}</span></div>`;
    });
    h+=`</div>`;
    if(me && me.rank){
      const t=tMap[me.rank];
      h+=`<div class="rw" style="margin-top:6px"><span class="k">我的排名</span>
          <span class="v">第 ${me.rank} 名${t?" · "+t:""} · ${Math.round(me.score||0)} 金</span></div>`;
    }
  }
  el.innerHTML=h;
}
function warmLeaderboards(){
  loadLeaderboard(null, LB_BOARD);
  loadLeaderboard(null, LB_BOARD_VAL);
}
function refreshBoardAfterSubmit(b){ /* 游戏榜即时可读，无需回拉 */ }

/* 存档快照：与 Toy 版同结构，由本文件提供 */
function snapshot(){
  return {
    v:1, day:G.day+(G.dayOver?1:0), gold:G.gold, rep:G.rep, pts:G.pts, spend:G.spend|0,
    jewels:(G.jewels||[]), worn:(G.worn||[]), gear:Object.assign({},G.gear),
    skills:Object.assign({}, G.skills),
    treasure:(G.treasure||[]).slice(0,KEEPCAP),
    gifts:(G.gifts||[]).map(g=>({k:g.k,n:g.n,bonus:g.bonus,ds:g.ds,img:g.img})),
    gamble:(()=>{ const gm=G.gamble; if(!gm) return undefined;
      return { tickets:gm.tickets|0, fund:gm.fund|0, owned:!!gm.owned,
               vault:(gm.vault||[]).slice(0,200),
               stats:{ open:gm.stats.open|0, byS:Object.assign({},gm.stats.byS),
                       spent:gm.stats.spent|0, got:gm.stats.got|0,
                       wuzhan:gm.stats.wuzhan|0, jade:gm.stats.jade|0,
                       byProd:Object.assign({},gm.stats.byProd) } }; })(),
    best:G.best, log:(G.log||[]).slice(0,12),
    bestVal:G.bestVal, bestValK:G.bestValK, bestValKind:G.bestValKind
  };
}
function applySnapshot(o){
  if(!o || typeof o!=="object") return false;
  if(typeof o.day==="number" && o.day>1) G.day=Math.floor(o.day);
  if(typeof o.gold==="number") G.gold=Math.max(0,Math.round(o.gold));
  if(typeof o.rep==="number") G.rep=cl(o.rep,0,REP_MAX);
  if(typeof o.pts==="number") G.pts=Math.max(0,Math.round(o.pts));
  if(typeof o.spend==="number") G.spend=Math.max(0,Math.round(o.spend));
  if(o.skills && typeof o.skills==="object") G.skills=Object.assign({}, o.skills);
  if(Array.isArray(o.jewels)) G.jewels=o.jewels;
  if(Array.isArray(o.worn)) G.worn=o.worn;
  if(o.gear && typeof o.gear==="object") G.gear=Object.assign({}, G.gear, o.gear);
  if(Array.isArray(o.treasure)) G.treasure=o.treasure.filter(t=>t&&GEMS[t.g]).slice(0,KEEPCAP);
  if(Array.isArray(o.gifts))
    G.gifts=o.gifts.filter(g=>g&&GIFTS.some(x=>x.k===g.k)).map(g=>GIFTS.find(x=>x.k===g.k));
  else if(Array.isArray(o.cabinet))
    G.gifts=o.cabinet.filter(r=>r&&r.n).map(r=>GIFTS.find(x=>x.n===r.n)).filter(Boolean);
  if(o.gamble && typeof o.gamble==="object"){
    const s=o.gamble, gm=G.gamble;
    gm.tickets=Math.max(0, Math.floor(Number(s.tickets)||0));
    gm.fund=Math.max(0, Math.round(Number(s.fund)||0));
    gm.owned=!!s.owned;
    if(Array.isArray(s.vault)){
      gm.vault=s.vault.filter(v=>v&&typeof v.k==="string"&&PU_PROD.some(p=>p.k===v.k)).slice(0,200);
    }
    if(s.stats && typeof s.stats==="object"){
      const t=s.stats;
      gm.stats.open=Math.max(0,Math.floor(Number(t.open)||0));
      gm.stats.byS=Math.assign({tai:0,lan:0,mo:0,yao:0}, t.byS||{});
      gm.stats.spent=Math.max(0,Math.round(Number(t.spent)||0));
      gm.stats.got=Math.max(0,Math.round(Number(t.got)||0));
      gm.stats.wuzhan=Math.max(0,Math.floor(Number(t.wuzhan)||0));
      gm.stats.jade=Math.max(0,Math.round(Number(t.jade)||0));
      gm.stats.byProd=Object.assign({}, t.byProd||{});
    }
  }
  if(o.best && typeof o.best==="object") G.best=o.best;
  if(Array.isArray(o.log)) G.log=o.log.slice(0,12);
  if(typeof o.bestVal==="number") G.bestVal=o.bestVal;
  if(typeof o.bestValK==="string") G.bestValK=o.bestValK;
  if(typeof o.bestValKind==="string") G.bestValKind=o.bestValKind;
  return true;
}

/* ── 测试探针暴露 ── */
window.TOY_API=WEB_API;
window.checkToySocial=checkToySocial;
window.hasCharge=hasCharge;
window.socialRateBonus=socialRateBonus;
window.unlockAllForOwner=unlockAllForOwner;
window.webNick=webNick;
window.webSetNick=webSetNick;
window.WEB_API=WEB_API;
