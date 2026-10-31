"use strict";
/* ══════════ 状态与核心逻辑 ══════════ */
const G={
  day:1, time:DAY_TIME, maxTime:DAY_TIME,
  gold:5000, rep:20, pts:40,
  phase:"shop",
  tray:[], bag:[], jewels:[], worn:[], gifts:[], skills:{}, treasure:[],
  stonesToday:0,                   // 今日已开石数量（一天两块料）
  sel:null, event:null,
  lamp:Math.PI*0.5, spin:0,
  tool:"chisel", cutKey:"split",
  gear:{chisel:1,saw:1,sonic:1,lab:1},
  peelLeft:0, peelMax:1,
  peelPos:0.5, peelDir:1, peelIdeal:0.5, peelZone:0.18,
  cutAngle:0, cutTarget:0, cutDone:0, cutNeed:3, cutSwing:0,
  polishDone:0, polishNeed:0, polishQ:0, polishPos:0.5, polishDir:1, polishIdeal:0.5, polishZone:0.11,
  earn:0, lost:0, spend:0, best:null, bestVal:0, bestValK:"", bestValKind:"", log:[],
  drag:null, lastX:0, lastY:0,
  dayOver:false, settling:false, dead:false,
  luck:LUCK_START,                         // 今日运气 · 鉴定成色的额度
  socialBonus:0, hasCharge:false,          // 成功率加成
  /* 赌坊：门票按当日累计计价（次日回到初始 10 声望）、分期存金不可取回；
     产物计入藏珍主柜（src:"gamble"），不单设赌藏柜 */
  gamble:{ tickets:0, ticketsDay:0, fund:0, owned:false, vault:[],
           stats:{ open:0, byS:{tai:0,lan:0,mo:0,yao:0},
                   spent:0, got:0, wuzhan:0, jade:0, byProd:{} } },
  _dayEnd:null,                            // 最近一次打烊摘要（供打烊后面板重开）
  _flushing:false                          // 测试环境用：true 时所有 setTimeout 立即执行
};
window.G = G;
let UID=1;
/* 测试快进：_flushing=true 时立即调用回调，避免 setTimeout 延迟导致状态机卡死 */
function flushNext(fn, _ms){ if(G._flushing) fn(); else setTimeout(fn, _ms||0); }

/* ══════════ 运气 ══════════
   鉴定成色的额度。见底就看不出成色了。 */
/* 每日运势：7 档加权随机（大凶0 / 凶2 / 小凶4 / 平5 / 小吉6 / 吉8 / 大吉10） */
const LUCK_TIERS=[
  {n:"大凶", v:0,  w:5},
  {n:"凶",   v:2,  w:15},
  {n:"小凶", v:4,  w:20},
  {n:"平",   v:5,  w:25},
  {n:"小吉", v:6,  w:20},
  {n:"吉",   v:8,  w:12},
  {n:"大吉", v:10, w:3}
];
function rollLuck(){
  let r=RND()*100;
  for(const t of LUCK_TIERS){ if(r<t.w) return t; r-=t.w; }
  return LUCK_TIERS[LUCK_TIERS.length-1];
}
function luckOf(){ return (G.luck===undefined||G.luck===null)?LUCK_START:G.luck; }
/* 上限：镇定技艺可多要 10 点 */
function luckCap(){ return LUCK_MAX; }
/* 扣运气：不够就直接拒绝，按钮也应是灰的 */
function spendLuck(n){
  if(G.luck<n) return false;
  G.luck-=n;
  return true;
}
function luckTag(){ return G.luckTag || "平"; }

/* ══════════ 成色鉴定 ══════════
   成色挂靠档位：下等档→下等 / 中等档→中等 / 上等档→上等；天品档现形即为龙石。 */
function gazeInfoOf(s){
  const g=GEMS[s.gtype];
  let idx;
  if(s.exclusive){
    // 专属石（异石/龙石）：参照四档；天品档（rare）即龙石现形
    if(s.mat===GRADE_WASTE) idx=0;          // 下等
    else if(s.mat===GRADE_FLOWER) idx=1;    // 中等
    else idx = (s.rare) ? 3 : 2;            // 上等 / 天品
  }else{
    // 普通石：档位映射；天品档已切换为龙石（专属），此处最高上等
    idx = s.mat===GRADE_WASTE ? 0 : s.mat===GRADE_FLOWER ? 1 : 2;
  }
  const gz=GAZE_GRADES[idx];
  // 「线路故障」当日看不透绝料
  const shown=(ev("black") && idx===3)?GAZE_GRADES[2]:gz;
  return { gk:shown.k, gazeName:shown.n, gazeDs:shown.ds, grade:gradeOf(s), hard:s.hard, gi:idx };
}
/* 执行鉴定：扣运气 → 写入石头 → 侧栏与台面同步显示 */
function gazeStone(){
  const st=cur(); if(!st) return;
  if(st.s.gazed) return;
  // 镇定技能：每日首次鉴定免费（固定花费 1，与异象无关；无异象也扣是机制设定）
  const free=(hasSkill("mind") && !G.mindFreeUsed);
  if(free) G.mindFreeUsed=true;
  else if(!spendLuck(LUCK_COST_GAZE)){ say("运气不足，鉴定不成",true); return; }
  st.s.gazed=true;
  // 绝料现形：异石开出绝料 → gtype 切换为龙石（立绘、名称随之替换）
  if(st.s.rare && st.s.gtype==="obsidian") st.s.gtype="dragon";
  st.s.gaze=gazeInfoOf(st.s);
  const gz=st.s.gaze;
  AudioSys?.SFX?.gaze();
  say("鉴定成色 · "+gz.gazeName+" · "+GEMS[st.s.gtype].n+"（品质 "+gz.grade+"）", false, gz.gk==="rare"?"good":"");
  G.log.unshift("鉴定 · "+GEMS[st.s.gtype].n+"成色"+gz.gazeName);
  render();
}

/* 这块料实际花了多少（盲盒实付）；没有实付记录时退回旧口径 */
function spentOf(s){ return (s.spent===undefined||s.spent===null) ? s.cost : s.spent; }
/* 粉化返还比例：料废了但矿商按残料折价收走，不至于血本无归 */
const SHAT_BACK=0.55;
/* 生成一块原石。传 o 时按盲盒三选一的结果锁定石种与关键属性 */
function mkStone(tier, allowEx, o){
  let gk;
  if(o && o.forceGem) gk=o.forceGem;
  else gk=pk(GK.filter(k=>!GEMS[k].exclusive || allowEx===true));
  // 绝料现形：异石（obsidian）开出绝料 → 石种切换为龙石
  if(gk==="obsidian" && o && o.rare) gk="dragon";
  const g=GEMS[gk];
  const hard = (o && o.hard!==undefined) ? cl(o.hard,3,10) : cl(g.hd+rr(-.9,.9),3,10);
  const s={
    id:UID++, gtype:gk,
    hard,
    size: (o && o.size!==undefined) ? o.size : rr(.40,.60),
    off:  rr(.06,.26), offA: rr(0,TAU),
    clv:  rr(0,Math.PI), clvW: rr(.55,1.15),
    stress: rr(.15,1), haze: rr(0,.85), purity: rr(.55,1),
    anom: (o && o.anom!==undefined) ? o.anom
          : (!g.exclusive && RND() < (ANOM_BASE+tier*ANOM_TIER)*((G.event&&G.event.k==="radio")?2:1)),
    shell: (o && o.shell!==undefined) ? o.shell : ri(0,SHELLS.length-1),
    win: (o && o.win!==undefined) ? o.win
         : (!g.exclusive && WINDOWS[gk] && RND()<WINDOW_RATE),
    tier, seed: rr(0,100),
    mat: (o && o.mat!==undefined) ? o.mat : pickGrade(),   // 档位（天品/上等/中等/下等），开料即定
    rare: (o && o.rare!==undefined) ? o.rare : false,      // 天品档：现形龙石
    brick: (o && o.brick!==undefined) ? o.brick : false,   // 下等档内砖头料：直接认定失败
    cost: 0
  };
  s.cost = Math.round((32+tier*20)*rr(.7,1.5)*(g.mul*.6+.5)*(s.win?WINDOW_MUL:1));
  return s;
}
/* 毛料估值：满贯切完能卖多少。抬高基准并压缩低倍率宝石的劣势，
   保证最低档箱（杂矿袋）开出的水晶也能回本 —— 否则新手第一天必亏。 */
function gemVal(s){
  const g=GEMS[s.gtype];
  const mul=0.75+g.mul*0.55;                 // 水晶 0.55 → ×1.05；祖母绿 1.55 → ×1.60
  return Math.round(430*mul*(s.tier*.42+.85)*(.50+.72*s.purity)*(.55+.5*s.size)*(.6+.5*(1-s.haze)));
}
function dmgMultOf(dg){
  let m=1; for(const d of dg) m*=DMG[d].p;
  return m;
}
/* 天赐加成：陈列后全店售价提升（集齐 4 件不再产出） */
function giftBonus(){
  let b=1; for(const r of G.gifts) b+=r.bonus/100;
  /* 赌藏加成独立叠加（在 giftBonus 之后由 gamblePriceMul 挂上，见 itemBase）*/
  return b;
}
/* 技艺激活：考取或在身佩戴首饰均生效 */
function hasSkill(k){
  if(G.skills[k]) return true;
  for(const j of G.worn) if(j.kind==="jewel" && JEWELS[j.jk].buff.k===k) return true;
  return false;
}
/* 抛光品质 → 售价倍率（镜面抛光可达 ×1.25） */
function polishMul(j){
  const q = (j.pq===undefined || j.pq===null) ? 0.5 : j.pq;
  return 0.75 + 0.5*cl(q,0,1);
}
function polishTag(j){
  const q=(j.pq===undefined||j.pq===null)?0.5:j.pq;
  return q>=0.88?"镜面":q>=0.68?"光亮":q>=0.45?"平整":q>=0.25?"粗糙":"磨砂";
}
/* 今日异象事件 */
function ev(k){ return G.event && G.event.k===k; }
/* ══════════ 首饰工价 ══════════
   镶得好是溢价，镶瘸了是倒贴 —— 同一颗石头，工价能差出十几倍。
   工价 = 抛光系数 × 损伤系数 × 瘸工罚金
     · 抛光系数 0.45(磨砂) ~ 1.40(镜面)：抛光是首饰的命门
     · 损伤系数：每处损伤按 DMG.p 连乘（破损 ×0.35、崩边 ×0.65）
     · 瘸工罚金：带伤的首饰是残次品，镶口和工钱都白费，每处损伤再打七五折
   镜面+完好 → ×1.40；磨砂+破损崩边 → ×0.07。
   再乘类型基数（戒指1.40 / 项链1.58 / 耳环1.80），
   最瘆的活计算下来比裸石还低 —— 首饰从来不是稳赚的买卖。 */
function workMul(j){
  const q=cl((j.pq===undefined||j.pq===null)?0.5:j.pq,0,1);
  const polishK=0.45+0.95*q;
  let dmgK=1; for(const d of (j.dg||[])) dmgK*=DMG[d].p;
  const botch=Math.pow(0.75, (j.dg||[]).length);
  return polishK*dmgK*botch;
}
/* 待拍藏品底价 */
function itemBase(j){
  /* 切法系统已移除：不再有琢型倍率。 */
  let v = gemVal(j.s);
  if(j.kind==="jewel"){
    // 首饰：类型基数 × 工价（工价已含抛光与损伤），不再另享裸石的抛光/损伤系数
    v *= JEWELS[j.jk].mul * workMul(j);
  }else{
    v *= dmgMultOf(j.dg) * polishMul(j);
  }
  // 材质系数：废料打折，高档料溢价
  if(typeof j.grade !== 'undefined') v *= GRADE_PRICE_K[j.grade] || 1;
  // 天赐加成 × 赌藏加成（赌藏独立柜，上限 +40%）
  const gm = (typeof gamblePriceMul==="function") ? gamblePriceMul() : 1;
  return Math.max(1, Math.round(v*giftBonus()*gm));
}
function cur(){ return G.bag.find(x=>x.s.id===G.sel) || null; }

/* 痕迹机制已并入「成色鉴定」，此处只保留品质评级 */
function gradeOf(s){ return GRADE[cl(Math.round(s.purity*3.6)-1,0,3)]; }

/* 工艺等级：只看工序完成度与失误，与料子本身无关
   全程无失误（无损伤）→ 甲等；一处失误 → 乙等；多处失误 → 丙等；
   半途收刀、工序未全部完成 → 丁等。 */
function craftGradeOf(j){
  if(!j) return "丙等";
  const stopped = !!j.stopped || j.stage==="stopped";
  if(stopped) return "丁等";
  const n=(j.dg&&j.dg.length)||0;
  if(n<=0) return "甲等";
  if(n===1) return "乙等";
  return "丙等";
}

/* ══════════ 声誉：换技艺，也卖价钱 ══════════ */
/* 声誉给成交价的加成（用于拍卖结算，不改底价，避免面板数字失真） */
function repAuctionK(){ return Math.round(Math.min(120, G.rep*REP_AUCTION_K*100)); }
/* 卖出好石头涨声誉；卖劣质宝石倒扣 */
function repOnSale(gtype, amount){
  if(WEAK_GEMS.indexOf(gtype)>=0){
    G.rep=cl(G.rep-REP_LOSS,0,REP_MAX);
    G.log.unshift("声誉 · 卖出劣质"+GEMS[gtype].n+"，声誉 −"+REP_LOSS);
    return -REP_LOSS;
  }
  let gain=0;
  for(let i=0;i<REP_STEP.length;i++) if(amount>=REP_STEP[i]) gain=Math.max(gain, 3+i);
  if(gain>0) G.rep=cl(G.rep+gain,0,REP_MAX);
  return gain;
}

/* ---- 日程 ---- */
function newDay(){
  resetRnd(20261011 + G.day*7919);
  G.event = G.day>=2 ? pk(EVENTS) : null;
  // 今日运气：鉴定成色的额度（7 档加权随机：大凶0/凶2/小凶4/平5/小吉6/吉8/大吉10）
  const _lt=rollLuck();
  G.luck = _lt.v + (G.event&&G.event.lc?G.event.lc:0);
  G.luck = cl(G.luck, 1, LUCK_MAX);
  G.luckTag = _lt.n;
  // 盲盒机制：矿石商不再白送原石，货摊开局是空的 —— 要开箱才有料
  G.tray=[];
  // 跨天清空开箱记忆：石市每天重新随机三选一，不沿用前一天的箱位选项（修复「保留前一天结果」）
  for(const _k in BOX_MEMO) delete BOX_MEMO[_k];
  BOX=null;
  G.stonesToday=0;                     // 今日开石额度：一天两块料
  G._pendingClose=false;               // 清除待打烊标记
  gmFix();
  G.gamble.ticketsDay=0;               // 赌坊票价当日递增，次日回到初始 10 声望
  const n=0;
  G.phase="shop"; G.sel=null; G.time=G.maxTime; G.dayOver=false;
  G.earn=0; G.lost=0; G.spend=0;      // spend：当日铺面总支出（进货/修复/学费/料件/租金）
  G.polishDone=0; G.polishNeed=0; G.polishQ=0; G.peelIdeal=0.5;
  G.log.unshift("第 "+G.day+" 日 · 矿石商之摊肆开市 —— 自己开箱择石");
  G.log.unshift("运气 · 今日"+luckTag()+"（"+luckOf()+" / "+luckCap()+"）");
  if(G.event) G.log.unshift("异象 · "+G.event.n+"："+G.event.tip);
  if(G.log.length>40) G.log.length=40;
  say("第 "+G.day+" 日开张 · 运气"+luckTag()+"（"+luckOf()+"）· 去石市开箱");
  render();
  if(G.event) showEvent(G.event);
}
function tickTime(n){
  G.time=Math.max(0,G.time-n);
  if(G.time<=0 && !G.dayOver) closeDay(true);   // 时辰耗尽 = 自动收市，成品留存
}

/* ---- 采购 ---- */
function closeShop(){
  if(G.dayOver || G.dead) return;
  say("收起幌子 · 今日收工", false, "good");
  closeDay(false);   // 玩家主动收工：手上的成品按六折让渡
}
/* ---- 阶段切换：鉴石已在开箱弹窗里做完，取料后直接上剥台 ---- */

/* ── 加工成功率 ──
   基础值由「工具/硬度/技能/社交加成/今日运势/异象」决定；
   再乘以「已落手数」的衰减乘数：同一道工序里每落一手，成功率都往下掉一档。
   因此玩家永远面对一条下滑的曲线，必须决定「再赌一手」还是「见好就收」。 */
function decayOf(phase){
  const done = phase==="peel" ? (G.peelMax-G.peelLeft)
            : phase==="cut"  ? G.cutDone
            : G.polishDone;
  return Math.pow(DECAY[phase]||0.9, done);
}
/* 当前阶段的成功率（每次操作后重新计算，界面显示的就是下一手的概率） */
function opRate(phase,st){
  if(!st || !st.s) return RATE_FLOOR;
  const s=st.s, t=TOOLS[G.tool];
  const cut=curCut();
  const soc=(G.socialBonus || 0) + luckRateBonus();     // 平台互动 + 运气微调
  let r=0.55;
  if(phase==="peel"){
    r = 0.68 + t.eff*0.06 - s.hard*RISK_SOFT*0.020 - s.stress*RISK_SOFT*0.09;
    if(ev("quake")) r-=0.10;
  }else if(phase==="cut"){
    r = 0.70 + cut.add;                  // 线割 +5% / 震解 +8%
    if(ev("night")) r-=0.10;
  }else{
    r = 0.66 + (hasSkill("art")?0.10:0) - s.hard*RISK_SOFT*0.014 - s.haze*RISK_SOFT*0.08;
    if(ev("fog")) r-=0.10;
  }
  r += soc;
  // 开窗明料在剥离阶段更容易（看得见内部）
  if(phase==="peel" && s.win) r+=0.04;
  // 已鉴定过成色的料：心里有数，稳手（裂隙看得明白）
  if(s.gazed) r+=0.03;
  r *= decayOf(phase);                       // ← 核心：越落越低
  return cl(r,RATE_FLOOR,RATE_CAP);
}
/* 运气直接挂钩工艺成功率：运气满（10）明显加成，运气见底（1）明显减成，
   所以「运气越好、工艺越稳」—— 鉴定/开石消耗运气后，后续切磨会变险。 */
function luckRateBonus(){ return (luckOf()-luckCap()/2)*0.020; }
/* 工具解锁说明：空串=已可用；否则返回还差什么（UI 直接显示这句话） */
function toolLockReason(k){
  const t=TOOLS[k];
  const sk=TOOL_SKILL[k];
  if(sk && !hasSkill(sk)){
    return "技艺「"+(SKILLS.find(x=>x.k===sk)||{n:sk}).n+"」考取后解锁";
  }
  if(k==="sonic" && G.rep<SONIC_REP) return "声誉 "+SONIC_REP+" 后解锁";
  if(G.rep<t.req) return "声誉 "+t.req+" 后解锁";
  return "";
}
/* 「再落一手之后」的成功率预览：当前概率再乘一道衰减 */
function opRateNext(phase,st){
  return cl(opRate(phase,st)*(DECAY[phase]||0.9), RATE_FLOOR, RATE_CAP);
}
/* 收刀折价系数：按实际推进到的工序算，永远低于满贯 100% */
function stopRatio(){
  const ph=G.phase;
  // 起手门槛：一手都没落，料还是原封不动，收不了刀
  if(ph==="peel" && (G.peelMax-G.peelLeft)<STOP_MIN_HIT) return 0;
  if(ph==="cut"  && G.cutDone<STOP_MIN_HIT) return 0;
  if(ph==="polish"&& G.polishDone<STOP_MIN_HIT) return 0;
  if(ph==="polish"){
    // 抛光进度越高折价越接近上限，但永远到不了满贯 100%
    const part=cl(G.polishDone/Math.max(1,G.polishNeed),0,1);
    return Math.min(STOP_CAP, STOP_RATIO.cut + (STOP_RATIO.polish-STOP_RATIO.cut)*part);
  }
  if(ph==="cut"){
    const part=cl(G.cutDone/Math.max(1,G.cutNeed),0,1);
    return Math.min(STOP_CAP, STOP_RATIO.peel + (STOP_RATIO.cut-STOP_RATIO.peel)*part);
  }
  if(ph==="peel"){
    const part=cl((G.peelMax-G.peelLeft)/Math.max(1,G.peelMax),0,1);
    return Math.min(STOP_CAP, STOP_RATIO.peel*part);
  }
  return STOP_RATIO.rough;
}

function toPeel(){
  const st=cur(); if(!st) return;
  const need=toolLockReason(G.tool);
  if(need){ say(need+"，先用尖凿",true); G.tool="chisel"; }
  G.peelMax = 2 + Math.max(0, Math.round(st.s.size*3));
  G.peelLeft = G.peelMax;
  G.phase="peel";
  say("剥离废石 · "+G.peelMax+" 击");
  render();
}

/* ── 剥离一击 ── */
function peelHit(){
  const st=cur(); if(!st||G.phase!=="peel") return;
  if(G.peelLeft<=0){ toCut(); return; }
  const s=st.s, t=TOOLS[G.tool];
  const rate=opRate("peel",st);
  const r=RND();
  if(r<rate){
    AudioSys?.SFX?.chip_ok();
    say("錾剥干净 · 废石剥落一块",false,"good");
    if(rollDiff(st)) addDmg(st,"crack");
  }else{
    const miss=(r-rate)/(1-rate); // 0..1
    if(miss>=0.82){ AudioSys?.SFX?.chip_bad(); const rn=st.dg.includes("broken"); addDmg(st,"shat"); say(rn?"錾子吃进了宝石 · 石体崩解":"錾子吃进了宝石 · 石头破损",true); }
    else if(miss>=0.58){ AudioSys?.SFX?.chip_bad(); addDmg(st,"haze"); say("錾震裂了晶格 · 宝石起雾",true); }
    else if(miss>=0.30){ AudioSys?.SFX?.chip_bad(); addDmg(st,pk(["chip","lost"])); say("錾剥偏了 · 宝石受损",true); }
    else { AudioSys?.SFX?.chip_bad(); addDmg(st,"crack"); say("錾子带出道细裂",true); }
  }
  G.peelLeft--;
  if(st.dg.includes("shat")){ finishStone(st,true); tickTime(1); return; }
  tickTime(1);
  if(G.dayOver) return;
  // 同步跳转：不再依赖 setTimeout
  if(G.peelLeft<=0 && G.phase==="peel") toCut();
  render();
}

/* ── 下一道工序：跳过本工序剩余，直接进阶 ── */
function nextStep(){
  const st=cur(); if(!st) return;
  if(G.settling||G.dayOver) return;
  if(G.phase==="peel"){
    const done=G.peelMax-G.peelLeft;
    if(done<STOP_MIN_HIT){ say("还没动錾，先落一手",true); return; }
    G.peelLeft=0;
    AudioSys?.SFX?.next();
    say("跳过余料 · 直接上锯");
    toCut();
  }else if(G.phase==="cut"){
    if(G.cutDone<STOP_MIN_HIT){ say("还没开料，先开一刀",true); return; }
    // 跳过后按已完成比例给一份「粗坯级」抛光起点
    st.pq=0.35;
    say("跳过余刀 · 直接上磨");
    toPolish();
  }else{
    say("已是最后一道工序，没有下一道了",true);
  }
}

/* 开料方式：按已学技艺自动选最高级（震解 > 线割 > 普通开料）。
   玩家不再手动选择，故序��即强度序。 */
function bestCut(){
  if(hasSkill("hand"))  return CUTWAYS.sonic.k;
  if(hasSkill("blade")) return CUTWAYS.wire.k;
  return CUTWAYS.plain.k;
}
function curCut(){ return CUTWAYS[G.cutKey] || CUTWAYS.plain; }

/* ══════════ 暗道：连点「声音」按钮 15 次，得 1000 万金 ══════════
   防误触：两次点击间隔超过 1.2 秒即清零；达到 8 次后给出进度提示，
   让有意者知道自己在做什么，但又不会太早暴露。 */
const SECRET_TAPS=15;
const SECRET_WINDOW=1200;      // ms，两次点击间隔上限
const SECRET_GOLD=10000000;
let _tapN=0, _tapT=0;
function secretTap(){
  const now=Date.now();
  if(now-_tapT > SECRET_WINDOW) _tapN=0;      // 超时清零
  _tapT=now;
  _tapN++;
  if(_tapN>=8 && _tapN<SECRET_TAPS) say("……", false);
  if(_tapN>=SECRET_TAPS){
    _tapN=0; _tapT=0;
    G.gold += SECRET_GOLD;
    G.log.unshift("暗道 · 柜底翻出 "+SECRET_GOLD.toLocaleString()+" 金");
    say("柜底是空的 —— 却摸到一叠旧票子，共 "+SECRET_GOLD.toLocaleString()+" 金", false, "good");
    // 暗道解锁全部互动奖励（三连/关注/充电）
    if(typeof TOY_API==="object"&&TOY_API){
      TOY_API.actions.liked=true;
      TOY_API.actions.coinCount=Math.max(1,TOY_API.actions.coinCount||0);
      TOY_API.actions.favorited=true;
      TOY_API.relation.isFollowing=true;
      TOY_API.relation.hasFanMedal=true;
      TOY_API.relation.isCharging=true;
      G.socialBonus=(typeof socialRateBonus==="function")?socialRateBonus():0;
      G.hasCharge=true;
      render();
    }
    AudioSys?.SFX?.rare();
    if(typeof submitScoreBoard==="function") submitScoreBoard(G.gold).catch(()=>{});
    syncTop();
    render();
    saveCloudSoon();
  }
}

/* ── 单件最高成交价榜：宝石 / 首饰入柜时刷新（只升不降，跨天延续）── */
function recordBestVal(v, gtype, kind){
  if(v>G.bestVal){
    G.bestVal=v; G.bestValK=gtype; G.bestValKind=kind||"gem";
    if(typeof submitScoreBoard==="function") submitScoreBoard(v, LB_BOARD_VAL).catch(()=>{});
  }
}

function toCut(){
  const st=cur(); if(!st) return;
  if(G.dayOver) return;
  G.cutKey=bestCut();
  const cut=curCut();
  // 石头越大要落的刀越多
  G.cutNeed = 2 + (st.s.size>0.55?1:0);
  G.cutDone=0;
  G.phase="cut";
  say(cut.n+" · "+G.cutNeed+" 刀");
  render();
}

/* ── 切割一击 ── */
function cutHit(){
  const st=cur(); if(!st) return;
  if(G.settling) return;
  if(G.phase!=="cut") return;
  const rate=opRate("cut",st);
  const r=RND();
  if(r<rate){
    AudioSys?.SFX?.cut_ok();
    say("第 "+(G.cutDone+1)+" 刀 · 刻面精准",false,"good");
    if(rollDiff(st)) addDmg(st,"crack");
  }else{
    const miss=(r-rate)/(1-rate);
    if(miss>=0.80){ AudioSys?.SFX?.cut_bad(); const rn=st.dg.includes("broken"); addDmg(st,"shat"); say(rn?"刀口崩飞 · 石体崩解":"刀口崩飞 · 石头破损",true); }
    else if(miss>=0.55){ AudioSys?.SFX?.cut_bad(); addDmg(st,st.s.hard>7.8?"chip":"lost"); say("切偏了一块",true); }
    else if(miss>=0.28){ AudioSys?.SFX?.cut_bad(); addDmg(st,st.s.purity>0.8?"crack":"chip"); say("刻面受损",true); }
    else { AudioSys?.SFX?.cut_bad(); addDmg(st,"crack"); say("切面有道细裂",true); }
  }
  G.cutDone++;
  if(st.dg.includes("shat")){
    if(G.settling) return;
    G.settling=true;
    tickTime(1);
    flushNext(()=>{ G.settling=false; finishStone(st, true); },280);
    return;
  }
  if(G.cutDone>=G.cutNeed){
    if(G.settling) return;
    G.settling=true;
    tickTime(1);
    flushNext(()=>{ G.settling=false; toPolish(); },280);
    return;
  }
  tickTime(1);
  if(G.dayOver) return;
  render();
}

function toPolish(){
  const st=cur(); if(!st) return;
  if(G.dayOver||G.dead) return;
  G.polishNeed = POLISH_BASE;
  G.polishDone = 0;
  // 若是「下一道工序」跳过来的，保留已给的粗坯起点
  if(G.polishQ===undefined||G.polishQ===null) G.polishQ=0;
  G.phase="polish"; G.settling=false;
  say("刻面已成 · 上磨轮", false, "good");
  render();
}

/* ── 抛光一击 ── */
function polishHit(){
  const st=cur(); if(!st) return;
  if(G.phase!=="polish") return;
  if(G.settling) return;
  const rate=opRate("polish",st);
  const r=RND();
  let q;
  if(r<rate){
    AudioSys?.SFX?.polish_ok();
    q=1; say("第 "+(G.polishDone+1)+" 道 · 恰到好处",false,"good");
    if(rollDiff(st)) addDmg(st,"crack");
  }else{
    const miss=(r-rate)/(1-rate);
    if(miss>=0.75){ AudioSys?.SFX?.polish_bad(); q=0.10; addDmg(st,"lost"); say("压得太狠，磨掉一圈料",true); }
    else if(miss>=0.45){ AudioSys?.SFX?.polish_bad(); q=0.35; say("力道偏了，表面发毛",true); }
    else{ AudioSys?.SFX?.polish_bad(); q=0.55; say("差一点镜面",true); }
  }
  G.polishQ=(G.polishQ*G.polishDone + q)/(G.polishDone+1);
  G.polishDone++;
  tickTime(1);
  if(G.dayOver) return;
  if(G.polishDone>=G.polishNeed || st.dg.includes("shat")){
    if(G.settling) return;
    G.settling=true;
    st.pq=G.polishQ;
    flushNext(()=>{ G.settling=false; finishStone(st, st.dg.includes("shat")); },280);
    return;
  }
  render();
}

/* ── 加工损伤 ── */
/* ── 分化（裂纹）：独立随机事件 ──
   原先只在「失误」分支里附带产生，导致要么不出现、要么一次性冒出来。
   现改为：每道工序的第一次操作必定不出现，之后每次操作 30% 概率触发。 */
const DIFF_P=0.30;
function rollDiff(st){
  if(!st) return false;
  /* 本工序已落过手：第一次不算 */
  const done = G.phase==="peel" ? (G.peelMax - G.peelLeft)
             : G.phase==="cut"  ? G.cutDone
             : G.phase==="polish" ? G.polishDone : 0;
  if(done<=0) return false;
  /* 已有裂纹则不再叠加 */
  if(st.dg.includes("crack")) return false;
  return RND() < DIFF_P;
}

function addDmg(st,d){
  if(st.dg.includes(d)) return;
  // 致命级失误（shat / haze 级）：第一次记「破损」（价值大降），第二次才真正粉碎
  if(d==="shat"||DLV[d]>=4){
    if(st.dg.includes("broken")){ st.dg=["shat"]; return; }
    st.dg.push("broken"); return;
  }
  st.dg.push(d);
}

/* ── 收刀（提前收手）：按当前工序折价结算，不给满分 ── */
function stopStone(){
  const st=cur(); if(!st||G.dayOver||G.dead) return;
  if(st.stage==="cut"||st.stage==="shat") return;
  const ratio=stopRatio();
  if(ratio<=0){ say("还没动錾，收不了刀",true); return; }
  G.settling=true;
  // 材质分级取料时已定（第一道工序就见分晓）；老存档没有该字段时才兜底补判
  let grade=st.grade;
  if(!grade){
    grade=pickGrade();
    st.grade=grade;
  }
  if(grade===GRADE_WASTE && st.s.brick){ wasteOut(st); return; }
  const j={kind:"gem", s:st.s, dg:st.dg.slice(), cuts:st.cuts,
           pq:(st.pq===undefined?0.5:st.pq), id:UID++, grade:grade, tool:G.tool};
  // 半成品：按收刀系数折价，并锁进 j.stopped，界面与拍卖都能看出是未完工
  const v=Math.max(1, Math.round(itemBase(j)*ratio));
  j.stopped=true; j.ratio=ratio;
  G.finaleSt={st, j, v, stopped:true};
  showFinale(j,v,true);
  say("收刀 · 按"+Math.round(ratio*100)+"% 折价作价");
}

/* ---- 完成：成品入柜，异象出天赐 ── */
function finishStone(st,shat){
  if(!st) return;
  if(st.stage==="cut"||st.stage==="shat"||st.stage==="stopped") return;
  if(G.settling) return;
  if(shat){
    st.stage="shat";
    G.bag=G.bag.filter(x=>x.s.id!==st.s.id);
    G.sel=null; G.phase="shop"; G.settling=false;
    const v=Math.round(spentOf(st.s)*SHAT_BACK);
    G.gold+=v; G.lost += spentOf(st.s) - v;
    AudioSys?.SFX?.shat();
    say("粉化，返还 "+v+" 金",false,"bad");
    G.log.unshift("加工 · 料毁于"+GEMS[st.s.gtype].n+"原石，返还 "+v+" 金");
    render();
    maybeForceClose(); return;
  }
  // 材质分级：取料时已定（第一道工序就见分晓），此处只兜底补判
  let grade=st.grade;
  if(!grade){
    grade=pickGrade();
    st.grade=grade;
  }
  if(grade === GRADE_WASTE && st.s.brick){ wasteOut(st); return; }
  G.settling=true;
  // 先展示成品立绘，玩家点"入柜"后再结算天赐与入柜
  const j={kind:"gem", s:st.s, dg:st.dg.slice(), cuts:st.cuts,
           pq:(st.pq===undefined?0.5:st.pq), id:UID++, grade:grade, tool:G.tool};
  const v=itemBase(j);
  G.finaleSt={st, j, v, stopped:false};
  showFinale(j,v,false);
}

/* 玩家确认入柜后：入藏珍、计分、入柜（可重复点击，内部幂等 + 按钮禁用） */
function keepFinale(){
  const F=G.finaleSt;
  if(!F||F.busy){ AudioSys?.SFX?.click(); hideModal(); render(); return; }   // 重复点击直接收窗，不重复结算
  F.busy=true;
  const {st,j,v}=F;
  G.finaleSt=null;
  hideModal();                       // ← 一次点击立刻收窗（幂等，后续 render 不再重开）
  st.stage = F.stopped ? "stopped" : "cut";
  j.grade = st.grade; // 传递材质信息
  G.bag=G.bag.filter(x=>x.s.id!==st.s.id);
  G.sel=null; G.phase="shop"; G.settling=false;
  if(st.grade === GRADE_WASTE && st.s.brick){
    G.log.unshift("成品 · 砖头料 · 底价约 "+v+" 金");
    say("砖头料 · 底价约 "+v+" 金", false, "bad");
    hideModal();
    render();
    maybeForceClose(); return;
  }
  // 异像石里间或剥离出非此世之物 —— 天赐入手，全店售价加成（藏珍好石头之外，另记天赐）
  if(!F.stopped && st.s.anom && RND()<0.34){
    const gl=GIFTS.filter(r=>!G.gifts.some(x=>x.k===r.k));
    if(gl.length){
      const gt=pk(gl);
      G.gifts.push(gt);
      G.jewels.push(j);
      // 好石头入藏珍留档
      const gz=treasureGradeName(st);
      addTreasure(st.s.gtype, gz, v, !!st.s.exclusive, j);
      if(!G.best || v>G.best.v) G.best={n:GEMS[st.s.gtype].n+"（"+polishTag(j)+"）", v:v, cut:st.cuts, day:G.day};
      recordBestVal(v, st.s.gtype, "jewel");
      AudioSys?.SFX?.rare();
      say("天赐 · "+gt.n+" 入手 · 全店售价 +"+gt.bonus+"%",false,"good");
      G.log.unshift("天赐 · "+gt.n+"（全店售价 +"+gt.bonus+"%）");
      addPts(v);
      if(typeof submitScoreBoard==="function") submitScoreBoard(G.gold+v).catch(()=>{});
      render();
      showGift(gt);            // 天赐弹窗放在结算之后，避免叠加弹窗互相顶死
      G._pendingClose=true;    // 关掉天赐弹窗后若已开满两块，立即打烊入夜
      return;
    }
  }
  G.jewels.push(j);
  // 满贯成品才入藏珍：半成品与低档石头不占藏珍的位置
  if(!F.stopped) addTreasure(st.s.gtype, treasureGradeName(st), v, !!st.s.exclusive, j);
  saveCloudSoon();          // 藏珍变了就写档
  if(!G.best || v>G.best.v) G.best={n:GEMS[st.s.gtype].n+"（"+polishTag(j)+"）", v:v, cut:st.cuts, day:G.day};
  if(F.stopped){
    say("半成品 "+GEMS[st.s.gtype].n+" 入柜 · 完工折 "+Math.round((j.ratio||0)*100)+"% · 底价约 "+v+" 金",false,"good");
    G.log.unshift("完工 · "+GEMS[st.s.gtype].n+" 半成品 "+v+" 金（折 "+Math.round((j.ratio||0)*100)+"%）");
    addPts(v,0.5);
  }else{
    say("成品 "+GEMS[st.s.gtype].n+" 已入柜 · "+polishTag(j)+" · 底价约 "+v+" 金",false,"good");
    G.log.unshift("加工 · "+GEMS[st.s.gtype].n+" 成品 "+v+" 金（"+polishTag(j)+"）");
    addPts(v);
    recordBestVal(v, st.s.gtype, "gem");   // 普通成品入柜也要记最高价榜（此前只有天赐分支有）
    if(typeof submitScoreBoard==="function") submitScoreBoard(G.gold+v).catch(()=>{});
  }
  hideModal();
  render();
  maybeForceClose();
}

/* 石筹：成品入柜与拍卖成交都能攒 */
function addPts(amount, mul){
  const n=Math.max(0, Math.round(amount*(PTS_FROM_KEEP*(mul===undefined?1:mul))));
  if(n>0) G.pts+=n;
  return n;
}

/* ── 藏珍：把开出来的好石头记进图鉴（带成色与价钱，同石种只留最好的一档） ──
   记录字段：g 石种 / gn 成色名 / top 是否顶级 / v 底价 / day 天数 / ex 是否专属 */
/* 藏珍只收：天品（龙石）与上等且工艺好（抛光光亮以上、无损伤）的石头。
   中等、下等不入册；工艺差的顶级料也不占位置 —— 柜子里只放拿得出手的东西。 */
/* 取用于藏珍判定的档位名：优先用鉴定出的成色，未鉴定则回退到材质分级。
   两个 bug 都在这里：
     ① 原代码传「未鉴」，被 isTopStone 的档位门槛直接挡掉 → 上等料做得好也进不了藏珍
     ② 修好后又把映射写反了：high 是【上等】应对应 GAZE[2]，rare 是【天品】应对应 GAZE[3]；
        之前写成 high→天品、flower→上等，导致中等料被当成上等放行、天品反而被挡。
   现按 GRADE_* 常量语义正确映射。 */
function treasureGradeName(st){
  if(st.s && st.s.gazed && st.s.gaze && st.s.gaze.gazeName) return st.s.gaze.gazeName;
  switch(st.grade){
    case GRADE_RARE:   return GAZE_GRADES[3].n;   // 天品（龙石）
    case GRADE_HIGH:   return GAZE_GRADES[2].n;   // 上等
    case GRADE_FLOWER: return GAZE_GRADES[1].n;   // 中等
    case GRADE_WASTE:  return GAZE_GRADES[0].n;   // 下等
  }
  return "未鉴";
}

function addTreasure(gtype, gname, v, ex, j){
  if(!isTopStone(gtype, gname, j)) return;      // 成色不足或工艺差则不记录
  const hit=G.treasure.find(t=>t.g===gtype && !!t.ex===!!ex);
  if(hit){
    // 已有记录：只在更值钱时覆盖，避免藏珍被同款刷屏
    if(v<=hit.v) return;
    hit.v=v; hit.gn=gname; hit.day=G.day;
    return;
  }
  G.treasure.unshift({g:gtype, gn:gname, top:true, v:v, day:G.day, ex:!!ex});
  if(G.treasure.length>KEEPCAP) G.treasure.length=KEEPCAP;
}
/* 顶级判定：藏珍只收「天品 / 上等」两类，成色够就入柜。
   工艺门槛（pq≥0.60 且至多 1 处伤）已于 2026-10-16 取消：
   用户原话「我用异石开出祖母绿是上等的，他还是没有自动计入藏珍」——
   「上等自动收录」是明确要求，成色够就入，不再拿抛光好坏和损伤卡它。
   pq 是逐次加权平均，一次失误（0.35/0.55）就大幅拉低，拿它当门槛等于
   「开出了上等也白开」；损伤同理，分化每步 30% 随机出现，零损伤本是奢望。
   仍保留的两条边界：
     · 中等、下等不入册（柜子里只放拿得出手的成色）
     · 半成品（收刀未完工）不入册，见 keepFinale 的 F.stopped 分支 */
function isTopStone(gtype, gname, j){
  const g=GEMS[gtype];
  if(!g) return false;
  return gname===GAZE_GRADES[3].n   // 天品（龙石）
      || gname===GAZE_GRADES[2].n;  // 上等
}

/* ---- 拍卖会：系统定价、轮流出价、三次定格，玩家可反复加价、落槌定夺 ---- */
let AUC=null;
function openAuction(jid){
  const j=G.jewels.find(x=>x.id===jid); if(!j) return;
  const v0=itemBase(j);
  const nudge = (hasSkill("tongue")?(1+TONGUE_AUC_K):1) * (ev("guest")?1.20:1);
  const picks=[];
  const pool=CUSTOMERS.slice();
  for(let i=0;i<3 && pool.length;i++){
    const c=pool.splice(Math.floor(RND()*pool.length),1)[0];
    const like = c.like===j.s.gtype;
    const jew = j.kind==="jewel"?1.15:1;
    picks.push({c, budget:Math.round(v0*rr(0.92,1.18)*c.k*(like?1.22:1)*jew*nudge), alive:true, bid:0, like});
  }
  AUC={j, v0, cur:Math.round(v0*0.80), top:null, round:0, maxRound:3,
       done:false, frozen:false, bidders:picks, bidlog:[]};
  showAuction();
  auctionTick();
}
/* 一次叫价：活着的客人里预算最小者先出手（保守者先叫），每次 +8% */
function auctionStep(){
  if(!AUC||AUC.done) return false;
  const able=AUC.bidders.filter(b=>b.alive&&b.budget>AUC.cur).sort((a,b)=>a.budget-b.budget);
  if(!able.length){ AUC.frozen=true; return false; }
  const w=able[0];
  const step=Math.max(8,Math.round(AUC.cur*0.12));
  w.bid=AUC.cur+Math.min(step, w.budget-AUC.cur);
  AUC.cur=w.bid; AUC.top=w; AUC.round++;
  AUC.bidlog.unshift({n:w.c.n, v:AUC.cur});
  for(const b of AUC.bidders){
    if(b===w) continue;
    if(b.alive && b.budget<=AUC.cur) b.alive=false;          // 出不起，退场
    else if(b.alive && RND()<0.15) b.alive=false;            // 超出预期，观望退场
  }
  return true;
}
/* 系统自动叫价：拍满三次定格 */
function auctionTick(){
  if(!AUC||AUC.done||AUC.frozen) return;
  const more=auctionStep();
  showAuction();
  if(!more){ say("无人再加价 · 落槌或不卖",true); return; }
  if(AUC.round>=AUC.maxRound){
    AUC.frozen=true;
    say("三次叫价已定 · "+AUC.cur+" 金，可继续加价或落槌", false, "good");
    return;
  }
  setTimeout(auctionTick, 900);
}
/* 玩家主动鼓动加价：三拍定后仍可一路往上催，直到没人跟得起。
   鼓动固定花 10 声望，且只有五成把握喊动人 —— 嗓门越大越掉价，
   声望同时决定成交加成，是真实的取舍。 */
const AUC_NUDGE_REP=10;
const AUC_NUDGE_CHANCE=0.5;
function auctionRaise(){
  if(!AUC||AUC.done) return;
  if(G.rep<AUC_NUDGE_REP){ say("声望见底，喊不动了（鼓动加价需 "+AUC_NUDGE_REP+" 声望）",true); return; }
  G.rep-=AUC_NUDGE_REP;
  if(RND()>=AUC_NUDGE_CHANCE){
    // 五成概率失灵：嗓门没人信，价钱摁在原地，声望照扣
    showAuction();
    say("鼓动加价 · −"+AUC_NUDGE_REP+" 声望 · 喊破了嗓子，没人跟价",true);
    G.log.unshift("拍卖 · 鼓动加价 −"+AUC_NUDGE_REP+" 声望 → 无人响应");
    return;
  }
  const more=auctionStep();
  showAuction();
  if(!more){ say("没人再跟得起了 —— 落槌或不卖",true); return; }
  const left=AUC.bidders.filter(b=>b.alive&&b.budget>AUC.cur).length;
  say("鼓动加价 · −"+AUC_NUDGE_REP+" 声望 · "+(AUC.top?AUC.top.c.n:"有人")+" 跟到 "+AUC.cur+" 金"
      +(left?"":" · 无人再跟了"), false, "good");
  G.log.unshift("拍卖 · 鼓动加价 −"+AUC_NUDGE_REP+" 声望 → "+AUC.cur+" 金");
}
function auctionHammer(){
  if(!AUC||AUC.done) return;
  auctionEnd(true);
}
function auctionCancel(){
  if(!AUC) { hideModal(); return; }
  AUC.done=true; AUC=null;
  hideModal();
  say("撤拍 · 藏品留在柜里，改日再拍");
  render();
}
/* 通用关窗：工坊／技艺／藏珍／天赐／异象 共用 */
function closeModal(){
  hideModal();
  /* 打烊后的安全网：任何关窗路径都不能把玩家留在「今日已收工」却进不了第二天的死角。
     典型复现：打烊面板开着时点顶栏「石市」→ 石市面板顶掉打烊面板 → 点「收摊」只关窗 →
     再点任何开箱入口都是「今日已收工，明天再来」，而进第二天的按钮已经不见了。 */
  if(G.dayOver && !G.dead && !G.settling && !G.finaleSt){
    if(typeof resumeDayEnd==="function"){ resumeDayEnd(); return; }
  }
  render();
}
function auctionEnd(hammer){
  if(!AUC||AUC.done) return;
  AUC.done=true;
  const t=aucTopBidder();
  let gained=0, msg="", kind="good", name="";
  if(AUC.j.kind==="jewel") name=JEWELS[AUC.j.jk].n; else name=GEMS[AUC.j.s.gtype].n;
  if(t && AUC.cur>=AUC.v0 && (hammer || !AUC.bidders.some(b=>b.alive&&b.budget>AUC.cur))){
    // 声誉抬价：成交额按声誉加成放大，妙语技艺再乘一层
    const k=1 + repAuctionK()/100 + (hasSkill("tongue")?TONGUE_AUC_K:0);
    gained=Math.round(AUC.cur*k);
    msg="落槌！"+t.c.n+" 以 "+gained+" 金 竞得"+name;
    AudioSys?.SFX?.success();
    G.log.unshift("拍卖 · "+name+" 成交 "+gained+" 金（声誉 +"+repAuctionK()+"%）");
  }else{
    gained=Math.round(AUC.v0*0.55);
    kind="bad";
    AudioSys?.SFX?.fail();
    msg=(t?"出价未到底价，无人加价":"无人应价，流拍")+" —— "+name+" 按 "+gained+" 金 让渡给旧货商";
    G.log.unshift("拍卖 · "+name+" 流拍 "+gained+" 金");
    G.lost+=AUC.v0-gained;
  }
  G.gold+=gained;
  // 声誉随成交价涨跌：卖好石头涨，卖劣质宝石跌
  const dr=repOnSale(AUC.j.s.gtype, gained);
  if(dr>0) msg+=" · 声誉 +"+dr;
  else if(dr<0) msg+=" · 声誉 "+dr;
  addPts(gained, PTS_FROM_SALE/PTS_FROM_KEEP);   // 拍卖成交同样攒石筹
  G.earn+=gained;
  /* 送拍是「真正卖出去」的唯一出口 —— 裸石/修复过的石头/首饰一律在此记榜。
     修复只改底价不改品相，所以成交额就是这条链路的成绩单；
     recordBestVal 只升不降，因此修复后翻新高价也能自然上榜。 */
  recordBestVal(gained, AUC.j.s.gtype, AUC.j.kind==="jewel"?"jewel":"gem");
  if(typeof submitScoreBoard==="function") submitScoreBoard(G.gold).catch(()=>{});
  G.jewels=G.jewels.filter(x=>x.id!==AUC.j.id);
  hideModal(); AUC=null;
  say(msg, kind==="bad", kind);
  render();
}

/* ---- 首饰工坊 ---- */
let WS={jid:null, jk:"ring"};
function openWorkshop(jid){
  WS={jid, jk:"ring"};
  showWorkshop();
}
/* 工具条「制作首饰」：直接打开当前可镶嵌的裸石成品工坊（带伤裸石不进门，须先修复） */
function openWsFromBar(){
  if(G.dayOver){ say("今日已收工，明天再来",true); return; }
  if(G.jewels.some(x=>x.kind==="gem"&&x.dg.length)){
    say("带伤不镶 —— 柜里有带损伤的裸石，先上修复台修好再制首饰",true);
    if(showCabinet) { showCabinet(); }
    return;
  }
  const j=G.jewels.find(x=>x.kind==="gem");
  if(!j){ say("柜里没有可镶嵌的裸石成品 —— 先加工石头入柜",true); return; }
  openWorkshop(j.id);
}
function workshopCraft(){
  const j=G.jewels.find(x=>x.id===WS.jid); if(!j) return;
  /* 带伤不镶兜底：入口绕过时也拦下，带伤裸石一律不得镶首饰 */
  if(j.kind==="gem" && j.dg.length){ say("带伤不镶 —— 先上修复台修好损伤再开工",true); hideModal(); showCabinet(); return; }
  const jk=JEWELS[WS.jk];
  const mc=METALS[jk.metal].cost;
  if(G.gold<mc){ say("金属件不够，先攒 "+mc+" 金",true); return; }
  if(G.time<jk.t){ say("时辰不够，明天再开工",true); return; }

  /* 先掷结果、再扣时辰。
     旧顺序是「先 tickTime 再掷」，而 tickTime 里时辰耗尽会调 closeDay(true) 打开烊页，
     紧接着的 if(G.dayOver) return 就把镶嵌结果整个丢弃 —— 玩家看到「已收摊」却
     既没拿到首饰、也点不动歇业，界面就此卡死。 */
  const rate=0.50+(hasSkill("art")?0.10:0);
  const ok=RND()<rate;
  G.gold-=mc; G.spend+=mc;         // 金属件料钱计入铺面开销

  if(ok){
    // 镶嵌即成品：grade 必须在此刻就位（弹窗取图在入柜结算之前）
    const st=G.bag.find(x=>x.s.id===j.s.id);
    if(st && st.grade) j.grade=st.grade;
    else if(!j.grade) j.grade=GRADE_FLOWER;   // 兜底必须是材质等级键
    // 把石头的损伤状态同步到首饰（否则破损石头镶出来会显示正常价）
    if(st && st.dg && st.dg.length) j.dg=[...st.dg];
    j.kind="jewel"; j.jk=WS.jk;
    // 首饰入柜：单件最高成交价榜记首饰底价，累计收益榜同步当前金币（首饰此前完全不上榜）
    recordBestVal(itemBase(j), j.s.gtype, "jewel");
    if(typeof submitScoreBoard==="function") submitScoreBoard(G.gold).catch(()=>{});
    G.log.unshift("工坊 · "+GEMS[j.s.gtype].n+" 制成"+jk.n);
    AudioSys?.SFX?.rare?.();
    hideModal();
    tickTime(jk.t);                    // 可能触发收市
    render();
    if(G.dayOver){
      /* 已收市：首饰已入G.jewels，留存到次日。打烊页已经打开，不再抢弹窗 */
      say(jk.n+" 镶嵌完成 · 收市入库，明日可送拍",false,"good");
      return;
    }
    say(jk.n+" 镶嵌完成 · 入柜待拍",false,"good");
    showJewelFinale(j, itemBase(j));  // 完成即回执立绘
    return;
  }

  if(!j.dg.includes("chip")) j.dg.push("chip");
  G.log.unshift("工坊 · "+GEMS[j.s.gtype].n+" 镶嵌失手，添了崩边");
  say("手一抖，镶口崩了 —— 宝石添了道崩边",true);
  hideModal();
  tickTime(jk.t);
  render();
  showJewelFail(j);
}

/* ---- 修复台 ---- */
function repairable(j){
  let best=null;
  for(const d of j.dg) if(REPAIR[d] && (!best||DLV[d]>DLV[best])) best=d;
  return best;
}
function repairDmg(arg){
  if(!arg) return;
  const p=String(arg).split(":");
  const j=G.jewels.find(x=>x.id===+p[0]);
  if(!j) return;
  const d=p[1];
  const cfg=REPAIR[d];
  const idx=j.dg.indexOf(d);
  if(!cfg||idx<0){ say("这处损伤修不了",true); return; }
  if(G.gold<cfg.cost){ say("修复要 "+cfg.cost+" 金，钱不够",true); return; }
  G.gold-=cfg.cost; G.spend+=cfg.cost;   // 修复计入铺面开销
  j.dg.splice(idx,1);
  const after=itemBase(j);
  say("修复 "+DMG[d].n+" · −"+cfg.cost+" 金，底价回到 "+after+" 金", false, "good");
  G.log.unshift("修复 · "+GEMS[j.s.gtype].n+" 修好"+DMG[d].n+" −"+cfg.cost+" 金");
  render();
}

/* ---- 佩戴首饰：戴在身上即激活对应技艺 ---- */
function toggleWear(jid){
  const wi=G.worn.findIndex(x=>x.id===jid);
  if(wi>=0){
    const j=G.worn.splice(wi,1)[0];
    G.jewels.push(j);
    say("取下 "+JEWELS[j.jk].n+" · 技艺加成失效");
    render(); return;
  }
  const j=G.jewels.find(x=>x.id===jid);
  if(!j) return;
  if(j.kind!=="jewel"){ say("裸石戴不住 —— 先送工坊镶嵌",true); return; }
  if(G.worn.length>=WEAR_MAX){
    const old=G.worn.shift();
    G.jewels.push(old);
    say("换下 "+JEWELS[old.jk].n);
  }
  G.jewels=G.jewels.filter(x=>x.id!==jid);
  G.worn.push(j);
  const bf=JEWELS[j.jk].buff;
  say("戴上 "+JEWELS[j.jk].n+" · "+bf.n+"："+bf.ds, false, "good");
  G.log.unshift("佩戴 · "+JEWELS[j.jk].n+"（"+bf.n+"）");
  render();
}

/* ---- 技艺 ---- */
function buySkill(k){
  const sk=SKILLS.find(x=>x.k===k);
  if(hasSkill(k)||!sk) return;
  if(G.rep<sk.req){ say("声誉不足 "+sk.req,true); return; }
  if(G.gold<sk.cost){ say("金币不足 "+sk.cost,true); return; }
  G.gold-=sk.cost; G.spend+=sk.cost;   // 学费计入铺面开销
  G.rep=cl(G.rep-sk.req,0,REP_MAX);    // 考取技艺耗费声望（原为只设门槛不扣）
  G.skills[k]=true;
  saveCloudSoon();
  say("技艺考取 · "+sk.n+" · 学费 "+sk.cost+" 金 · 耗声望 "+sk.req,false,"good");
  G.log.unshift("技艺 · 考取"+sk.n+"（-"+sk.cost+" 金 · -"+sk.req+" 声望）");
  showSkills();
  render();
}

/* 开满两块料即强制打烊：结算完成后无弹窗占用时直接进入第二天 */
function maybeForceClose(){
  if(G.dead||G.dayOver||G.settling||G.finaleSt) return;
  if(G.stonesToday>=2 && !G.bag.length){
    G._pendingClose=false;
    closeDay(true);   // 开满两块料的强制收市：成品留存次日
  }
}

/* ---- 打烊 ---- */
/* forced=true：时辰耗尽或开满两块料的「自动收市」—— 玩家没机会处理手上的成品，
   此时成品一律留存到次日，绝不强制六折让渡（否则辛苦开出的成品会凭空消失）。
   forced=false：玩家主动点「直接卖出」收工，按原设计六折让渡清空。
   默认值取 true（自动收市）：漏传参数时落在「留存成品」这一侧，
   宁可让玩家多留一天，也不要把他的资产按六折扫走。 */
function closeDay(forced = true){
  if(G.dayOver || G.dead) return;
  G.dayOver=true;
  let back=0, bn=0, sold=0, sn=0, kept=0;
  if(forced){
    kept=G.jewels.length;
    if(kept) G.log.unshift("打烊 · "+kept+" 件成品留存柜台，明日可继续送拍或制首饰");
  }else{
    for(const j of G.jewels){
      const v=Math.round(itemBase(j)*0.6);
      G.gold+=v; sold+=v; sn++; G.earn+=v;   // 让渡也是进项，照常计声誉
    }
    if(sn) G.log.unshift("打烊清算 · "+sn+" 件藏品按六折让渡 +"+sold+" 金");
    G.jewels=[];
  }
  /* 未完工的原石：全额退还进价，不做三折折价。
     原设定「没来得及开完的料按三折收走」已取消。 */
  for(const st of G.bag){
    if(st.stage!=="cut"&&st.stage!=="shat"&&st.stage!=="stopped"&&st.stage!=="waste"){
      back+=spentOf(st.s); bn++;
    }
  }
  if(bn){
    G.gold+=back;
    G.log.unshift("打烊清算 · "+bn+" 块未完工原石全额退还 +"+back+" 金");
  }
  G.bag=[]; G.sel=null;
  const net=rentOf(G.day);
  // 每5天提示收租
  if(G.day % RENT_INTERVAL === 0){
    G.log.unshift("⚠️ 第"+G.day+"日收租 · "+net+" 金");
  }
  if(G.gold<net){
    G.dead=true;
    showBankrupt(net);
    return;
  }
  G.gold-=net; G.spend+=net;      // 租金计入铺面开销
  const profit=G.earn-G.lost;
  let gained=0;
  if(profit>0) gained=Math.max(1,Math.round(profit/60));
  G.rep=cl(G.rep+gained,0,REP_MAX);
  G.luck=0; G.mindFreeUsed=false;   // 今日运气耗尽，睡一觉明日重掷
  AudioSys?.SFX?.day_end();
  syncTop();
  saveCloudSoon();          // 打烊即写档
  // 留一份打烊摘要：玩家在打烊后点开别的面板又关掉时，能把「歇业进入次日」面板还给他，
  // 否则会卡在「今日已收工，明天再来」却又找不到进第二天的入口（石市收摊按钮只关窗）
  G._dayEnd={gained:gained, net:net, liq:{back:back,bn:bn,sold:sold,sn:sn,kept:kept}};
  showDayEnd(gained, net, {back:back,bn:bn,sold:sold,sn:sn,kept:kept});
}
function showBankrupt(net){
  const h2=G.earn-G.lost;
  const short=net-G.gold;
  let h=`<h2>铺子被收走了</h2><div class="sb">第 ${G.day} 天 · 玉石馆熄灯</div>`;
  h+=`<div class="ln"><span class="k">今日净损益</span><span class="v ${h2>=0?"ps":"ng"}">${h2>=0?"+"+h2:"−"+Math.abs(h2)} 金</span></div>`;
  h+=`<div class="ln"><span class="k">账面结余</span><span class="v">${G.gold} 金</span></div>`;
  h+=`<div class="ln"><span class="k">本期房租</span><span class="v ng">${net} 金</span></div>`;
  h+=`<div class="ln tot"><span class="k">尚缺口</span><span class="v ng">${short} 金</span></div>`;
  h+=`<p class="ds">账上的钱不够交这一季的房租，还差 ${short} 金。玉石馆的灯灭了 —— 姐姐留下的招牌，被人从门上摘了下来。</p>`;
  if(G.best) h+=`<p class="ds">你做成过最好的一件：${G.best.n}，${G.best.v} 金。</p>`;
  h+=`<p class="ds">赌石这行，一刀穷一刀富。下一回，看准了再下刀。</p>`;
  h+=`<div class="ac"><button class="pri" data-act="restart">重开一局</button></div>`;
  showModal(h);
}
function nextDay(){
  G.day++;
  hideModal(); newDay(); saveCloudSoon();
}
function restart(){
  G.day=1; G.gold=5000; G.rep=20; G.luck=LUCK_START; G.pts=40; G.mindFreeUsed=false;
  G.earn=0; G.lost=0; G.best=null; G.bestVal=0; G.bestValK=""; G.bestValKind=""; G.log=[]; G.bag=[]; G.sel=null;
  G.jewels=[]; G.worn=[]; G.gifts=[]; G.skills={}; G.treasure=[]; G.event=null;
  G.gear={chisel:1,saw:1,sonic:1,lab:1};
  G.phase="shop"; G.polishDone=0; G.polishNeed=0; G.polishQ=0;
  G.dead=false; G.settling=false; G.dayOver=false; G._pendingClose=false;
  G.finaleSt=null; BOX=null; G._dayEnd=null;
  gmFix(); G.gamble.ticketsDay=0;
  hideModal(); newDay(); saveCloudSoon();
}

/* ══════════ 输入 ══════════ */
/* ── 盲盒：只卖档位，不卖指定石头。开箱弹窗里三选一 ── */
let BOX=null;
/* 每个箱位各自记住已开出的选项与已鉴定的成色：
   返回菜单再点进来时按箱位恢复，鉴定花的运气不白花 */
const BOX_MEMO={};
function openBox(k,mode){
  const b=BOXES.find(x=>x.k===k); if(!b) return;
  if(G.dead) return;
  if(G.dayOver){ say("今日已收工，明天再来",true); return; }
  if(G.bag.length){ say("案上这块还没开完 —— 先做完，或弃石",true); return; }
  if(G.stonesToday>=2){ say("今日已开过两块石 · 收工等明天",true); return; }
  /* 异石箱：充电专属，未充电时连箱都开不了（入口在石市已灰显，这里兜底） */
  if(b.ex && !(typeof hasCharge==="function"?hasCharge():true)){
    say("「异石」乃专属石暂不可购买",true); return;
  }
  /* 支付方式：必须由玩家显式指定（金币 / 石筹） */
  const mode2 = (mode==="pts") ? "pts" : "gold";
  const canGold=G.gold>=b.gold, canPts=G.pts>=b.pts;
  if(mode2==="gold" && !canGold){ say("金币不够开这个箱",true); return; }
  if(mode2==="pts"  && !canPts){ say("石筹不够开这个箱",true); return; }
  if(!canGold && !canPts){ say("金币与石筹都不够开这个箱",true); return; }
  const boxPayMode = (mode2==="pts") ? "石筹" : "金币";
  // 箱位须先考取对应技艺：晶簇箱=察矿，明料匣=寻玉（杂矿袋是起始箱，不看技艺）
  const needSk=BOX_SKILL[b.k];
  if(needSk && !hasSkill(needSk)){
    const sk=SKILLS.find(x=>x.k===needSk);
    say("尚未习得「"+(sk?sk.n:needSk)+"」—— 开不了"+b.n,true); return;
  }
  // 返回菜单再点进来：沿用该箱位上次已开的三个选项与已鉴定的成色，不重新抽
  if(BOX_MEMO[k] && !BOX_MEMO[k].opened){ BOX=BOX_MEMO[k]; showBox(k); return; }
  // 构造三个候选：先抽档位（天0.5/上4/中25/下70.5），再在档位石种池里随机；粗坯固有属性开箱瞬间锁定
  const GRADE_POOL={
    high  :["emerald","ruby","sapphire","amethyst"],
    flower:["nuibing","nuozhong","ziluolan","piaohua","furong"],
    waste :["douzhong","ganqing","topaz","garnet","peridot","quartz"]
  };
  const mkOpt=(g,mat)=>{
    const gm=GEMS[g];
    const rar=RARITY.findIndex(r=>gm.mul<=r.max);
    // 下等档内：砖头料直接认定失败（返还石筹）；其余为可加工的下等杂石。
    // 异石箱与普通箱同规则（差异只在龙石与概率），不再对异石箱废料额外加罚
    const brick=(mat===GRADE_WASTE) && (RND()<0.25);
    const rare=(mat===GRADE_RARE);
    const lock={
      hard:cl((typeof gm.hd==="number"?gm.hd:7)+rr(-0.8,1.0),3,10),
      purity:rr(.55,1),
      anom:RND()<ANOM_BASE*0.8,
      size:rr(.40,.60),
      shell:ri(0,SHELLS.length-1),
      win:RND()<WINDOW_RATE*0.5,
      tier:b.tier,
      mat, rare, brick
    };
    return { g, rar:rar<0?RARITY.length-1:rar, lock, ex:!!gm.exclusive,
             hard:lock.hard, anom:lock.anom, shell:lock.shell, win:lock.win,
             gazed:false, gk:0 };
  };
  // 三选一候选：普通箱按全局概率抽档位→档位池随机石种；异石箱固定 obsidian（天品档现形龙石）
  const n=Math.min(3,3);
  const opts=[];
  let tries=0;
  while(opts.length<n && tries++<30){
    // 异石箱与普通箱共用同一套石种池，只是概率不同（异石偏上等，且独有机会现形龙石）
    const mat=pickGrade(b.ex?GRADE_WEIGHT_EX:GRADE_WEIGHT_NORMAL);
    // 天品档只在异石箱出现、现形为龙石；其余一律按档位从石种池抽具体石种
    // —— 异石箱开出的也是水晶/干青/祖母绿等实名石种，不再叫「异石」
    const g=(mat===GRADE_RARE)?"dragon":pk(GRADE_POOL[mat]);
    const o=mkOpt(g,mat);
    if(opts.some(x=>x.g===o.g && x.lock.mat===o.lock.mat)) continue;   // 去重：避免三块同石同档
    opts.push(o);
  }
  BOX={b, opts, opened:false, payMode:mode2};
  BOX_MEMO[k]=BOX;               // 入档：之后返回菜单再点进来仍沿用这一批选项
  showBox(k);
}
/* 支付方式：金币或石筹二选一。
   石筹只能靠「成品入柜/拍卖成交」攒，属于把利润换成了更强的开箱权，
   不参与粉化/弃石/打烊的退款计算，避免出现「花石筹开箱、失败退金币」的套利。 */
/* 支付方式由玩家在界面上明确选择（boxPayGold / boxPayPts 两个入口）。
   原实现是自动选（金币不够才用石筹），玩家没有选择权。 */
function boxPayGold(b){
  G.gold-=b.gold; G.spend+=b.gold;   // 进货计入铺面开销
  AudioSys?.SFX?.sell(); return "金币";
}
function boxPayPts(b){
  G.pts-=b.pts; AudioSys?.SFX?.sell(); return "石筹";
}
function openBoxPick(i){
  if(!BOX || BOX.opened) return;
  const o=BOX.opts[i]; if(!o) return;
  const b=BOX.b; BOX.opened=true;
  const pay=(BOX.payMode==="pts") ? boxPayPts(b) : boxPayGold(b);
  // 记录开箱实付：粉化 / 弃石 / 打烊折价都按它退，保证「开箱花多少、赔多少」守恒
  const spentGold = (pay==="金币") ? b.gold : 0;
  // 由选项生成真实原石：石种与粗坯固有属性都已锁定
  const s=mkStone(b.tier,false,Object.assign({forceGem:o.g}, o.lock));
  // 石种名一律取实名（水晶/干青/祖母绿/龙石…），异石箱仅保留「专属渠道出品」的来源标记
  s.boxKey=b.k; s.exclusive=!!(b.ex || (GEMS[o.g]&&GEMS[o.g].exclusive)); s.spent=spentGold; s.gazed=false;
  // 选石前已鉴定的，把结论带上台（省一次运气，也省一次跳转）
  if(o.gazed){ s.gazed=true; s.gaze=o.gaze; }
  G.tray.push(s);
  AudioSys?.SFX?.box_open();
  G.log.unshift("开箱 · "+b.n+"开出"+GEMS[s.gtype].n+"，付 "+pay);
  delete BOX_MEMO[b.k];          // 这一箱已用掉，选项与鉴定结果一并作废
  BOX=null;
  hideModal();
  // 石市购买后自动上桌：直接取料上台，进入剥离工序
  pickStone(s.id);
}
/* ── 石市选石阶段鉴定：三选一当场花运气看个明白，不必先搬上台 ── */
function boxGaze(i){
  if(!BOX || BOX.opened) return;
  const o=BOX.opts[i]; if(!o) return;
  if(o.gazed) return;
  // 镇定技能：每日首次鉴定免费
  const free=(hasSkill("mind") && !G.mindFreeUsed);
  if(free) G.mindFreeUsed=true;
  else if(!spendLuck(LUCK_COST_GAZE)){ say("运气不足，鉴定不成",true); return; }
  // 用选项锁定的属性合成一颗"临时石"喂给 gazeInfoOf（不开箱也能看）
  // 绝料现形：异石选项开出绝料 → 展示名切换为龙石
  const fakeGk=(o.g==="obsidian" && o.lock.rare)?"dragon":o.g;
  const fake={ gtype:fakeGk, purity:o.lock.purity, anom:o.lock.anom,
               hard:o.lock.hard, size:o.lock.size, tier:o.lock.tier,
               mat:o.lock.mat, rare:o.lock.rare, exclusive:!!o.ex };
  o.gaze=gazeInfoOf(fake);
  o.gk=o.gaze.gi;            // 同步档位索引，弹窗才能正确显示已鉴定成色
  o.gazed=true;
  AudioSys?.SFX?.gaze();
  say("选石鉴定 · "+GEMS[fakeGk].n+" 成色"+o.gaze.gazeName+"（品质 "+o.gaze.grade+"）",
      false, o.gaze.gk==="rare"?"good":"");
  G.log.unshift("选石鉴定 · "+GEMS[fakeGk].n+"成色"+o.gaze.gazeName);
  showBox(BOX.b.k);
}
/* ── 充电专属石：改为「三选一」盲盒（与普石同规则：四类档位，天品档现形龙石） ── */
function buyExStone(mode){
  openBox("exbox", (mode==="pts")?"pts":"gold");
}
/* 专属石入手后的立绘回执（已并入盲盒流程，保留以便将来复用） */
function showExFound(s){
  const g=GEMS[s.gtype];
  let h=`<div class="finale">`;
  h+=`<h2>${g.n}</h2><div class="sb">专属石 · ${s.gaze.gazeName} · ${gradeOf(s)} · 硬度 ${s.hard.toFixed(1)}</div>`;
  h+=`<p class="ds">${EX_STONE.ds}</p>`;
  h+=`<div class="fin-frame">`;
  h+=`<canvas id="exCanvas" width="260" height="260" style="width:260px;height:260px"></canvas>`;
  h+=`<div class="fin-glow" style="background:${g.c}"></div>`;
  h+=`</div>`;
  h+=`<div class="fin-info">`;
  h+=`<div class="ln"><span class="k">品级</span><span class="v">绝品</span></div>`;
  h+=`<div class="ln"><span class="k">成色</span><span class="v">${s.gaze.gazeName}</span></div>`;
  h+=`<div class="ln"><span class="k">品质</span><span class="v">${gradeOf(s)}</span></div>`;
  h+=`<div class="ln tot"><span class="k">已付</span><span class="v ps">${EX_STONE.gold} 金 / ${EX_STONE.pts} 石筹</span></div>`;
  h+=`</div>`;
  h+=`<div class="ac"><button class="pri" data-act="closeModal">收下</button></div>`;
  h+=`</div>`;
  showModal(h);
  const cv=document.getElementById("exCanvas");
  if(cv){
    const x=cv.getContext("2d");
    const im=imgOf(EX_STONE.img);
    if(im){
      x.fillStyle="#000"; x.fillRect(0,0,260,260);
      x.globalCompositeOperation="lighter";
      x.drawImage(im,10,10,240,240);
      x.globalCompositeOperation="source-over";
    }
  }
}
function boxClose(){
  // 存下这一箱的选项与已鉴定成色，返回菜单后再点进来接着看
  if(BOX) BOX_MEMO[BOX.b.k]=BOX;
  BOX=null; hideModal(); render();
}
/* 盲盒流程下不直接买石头；这里只负责把已开出的原石搬上台面 */
function pickStone(id){
  const s=G.tray.find(x=>x.id===id);
  if(!s||s.bought) return;
  if(G.dead) return;
  if(G.dayOver){ say("今日已收工，明天再来",true); return; }
  if(G.bag.length){ say("案上这块还没开完 —— 先做完，或弃石",true); return; }
  if(BOX){ BOX=null; hideModal(); }  // 关掉可能残留的盲盒弹窗
  s.bought=true;
  const st={s, stage:"rough", dg:[], cuts:0, cutKey:"split", polish:0, polishNeed:0};
  G.bag.push(st);
  G.sel=s.id;
  G.tray=G.tray.filter(x=>x.id!==id);
  G.stonesToday++;                    // 今日开石额度 +1
  say("取料 · "+SHELLS[s.shell].n+"原石（开箱 "+s.cost+" 金的货）");
  G.log.unshift("取料 · "+SHELLS[s.shell].n+"原石（粗坯，内里未现）");
  // 档位：开料瞬间已定（第一道工序就见分晓）—— 砖头料（下等档废料）当场现形，不必等切完全程
  const grade = (s.mat!==undefined && s.mat!==null) ? s.mat : pickGrade();
  st.grade=grade;
  if(grade===GRADE_WASTE && st.s.brick){ wasteOut(st); return; }
  toPeel();
}
/* 砖头料现形：第一道工序就判死刑，立绘与损失一次交代清楚 */
function wasteOut(st){
  st.stage="waste";
  G.bag=G.bag.filter(x=>x.s.id!==st.s.id);
  G.sel=null; G.phase="shop"; G.settling=false;
  const sp=spentOf(st.s);
  G.lost+=sp;
  // 砖头料残料回收：按开箱实付的两成折成石筹退回（与弃石粉碎同口径，文字明确返还多少）
  const refund=Math.max(1, Math.round(sp*0.2));
  G.pts+=refund;
  AudioSys?.SFX?.fail();
  G.log.unshift("加工 · 砖头料 · 损失 "+sp+" 金 · 返还 "+refund+" 石筹");
  st._stonesToday=G.stonesToday;                  // 传额度给弹窗显示
  st._refund=refund;
  render();
  showWaste(st, sp, refund);
  if(G.stonesToday>=2) G._pendingClose=true;      // 开满两块：关掉砖头弹窗后立即打烊
}
function dropStone(){
  const st=cur(); if(!st) return;
  const c=st.s.cost, sp=spentOf(st.s);
  G.bag=G.bag.filter(x=>x.s.id!==G.sel);
  G.sel=null; G.phase="shop";
  G.lost+=sp;
  // 粉碎产物：进货价 100 金币的石头 → 20 石筹（20%）
  const gain=Math.max(1,Math.round(sp*0.2));
  G.pts+=gain;
  G.log.unshift("粉碎 · "+sp+" 金的石头换得 "+gain+" 石筹");
  AudioSys?.SFX?.fail();
  say("粉碎 —— 换得 "+gain+" 石筹","","bad");
  render();
  maybeForceClose();
}

function bindInput(){
  const pt=(e)=>{
    const r=cv.getBoundingClientRect();
    const t=e.touches?e.touches[0]:e;
    return {x:t.clientX-r.left, y:t.clientY-r.top};
  };
  function d2(p,c){ return (p.x-c.x)*(p.x-c.x)+(p.y-c.y)*(p.y-c.y); }
  let mode=null, ox=0, oy=0, baseSpin=0;

  cv.addEventListener("pointerdown",e=>{
    try{ cv.setPointerCapture(e.pointerId); }catch(_){}
    const p=pt(e); const c=center();
    const st=cur();
    // 加工阶段：点击画面即执行当前一刀（判定条/转盘已自动在走）
    if(st && (G.phase==="peel"||G.phase==="cut"||G.phase==="polish")){
      mode="tap"; cv.className="gr"; return;
    }
    if(st && d2(p,c)>Math.pow(Math.min(CW,CH)*0.36,2) && d2(p,c)<Math.pow(Math.min(CW,CH)*0.60,2)){
      mode="lamp"; G.lamp=Math.atan2(p.y-c.y,p.x-c.x)+Math.PI/2;
      cv.className="gr"; draw(); return;
    }
    if(st){ mode="spin"; ox=p.x; baseSpin=G.spin; cv.className="gr"; }
  });

  cv.addEventListener("pointermove",e=>{
    if(!mode) return;
    const p=pt(e); const c=center();
    if(mode==="lamp"){
      G.lamp=Math.atan2(p.y-c.y,p.x-c.x)+Math.PI/2;
      draw();
    }else if(mode==="spin"){
      G.spin=baseSpin+(p.x-ox)/130;
      draw();
    }
  });

  cv.addEventListener("pointerup",e=>{
    cv.className="";
    if(mode==="tap"){
      if(BOX || G.finaleSt) return;          // 盲盒/成品弹窗期间忽略台面点按
      if(G.phase==="peel") peelHit();
      else if(G.phase==="cut") cutHit();
      else if(G.phase==="polish") polishHit();
    }
    mode=null;
  });
  cv.addEventListener("pointercancel",()=>{ mode=null; cv.className=""; });

  document.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b) return;
    if(b.dataset.auc!==undefined && b.dataset.auc!==""){ openAuction(+b.dataset.auc); return; }
    if(b.dataset.ws!==undefined && b.dataset.ws!==""){ openWorkshop(+b.dataset.ws); return; }
    if(b.dataset.sk){ buySkill(b.dataset.sk); return; }
    if(b.dataset.wear){ toggleWear(+b.dataset.wear); return; }
    const a=b.dataset.act;
    if(a==="openWs") openWsFromBar();
    else if(a==="toPeel") toPeel();
    else if(a==="peel") peelHit();
    else if(a==="cut") cutHit();
    else if(a==="drop") dropStone();
    else if(a==="closeShop") closeShop();
    else if(a==="start"){ hideModal(); render(); }
    else if(a==="next"){ nextDay(); }
    else if(a==="restart"){ restart(); }
    else if(a==="closeModal"){ closeModal(); }
    else if(a==="openMarket") showMarket();
    else if(a==="openRite") showRite();
    else if(a==="openRank") showRank();
    else if(a==="recheckRite"){ TOY_API.checked=false; checkToySocial().then(()=>{ showRite(); render(); }); }
    else if(a==="openSkills") showSkills();
    else if(a==="openCabinet") showCabinet();
    else if(a==="gaze") gazeStone();
    else if(a==="nextStep") nextStep();
    else if(a==="buyEx") buyExStone(b.dataset.pay);
    else if(a==="toggleSide") toggleSide();
    else if(a==="closeSide") closeSide();
    else if(a==="openBag") openBag();
    else if(a==="sideView"){
      G.sideView=b.dataset.v||"bench";
      render();
    }
    else if(a==="aucRaise") auctionRaise();
    else if(a==="aucHammer") auctionHammer();
    else if(a==="aucCancel") auctionCancel();
    else if(a==="toggleMute"){
      const m=(window.AudioSys&&AudioSys.toggleMute)?AudioSys.toggleMute():false;
      const mb=document.getElementById("muteBtn"); if(mb) mb.textContent=m?"静音":"声音";
      secretTap();
    }
    
    
    else if(a==="setNick"){
      const inp=document.getElementById("lbNick");
      if(inp && typeof webSetNick==="function" && webSetNick(inp.value)){
        say("榜上署名已改为「"+inp.value.trim().slice(0,10)+"」",false,"good");
      }
      showRank();
    }
    else if(a==="wsCraft") workshopCraft();
    else if(a==="wsSel"){ WS.jk=b.dataset.wsel; showWorkshop(); }
    else if(a==="polish") polishHit();
    else if(a==="stop") stopStone();
    else if(a==="repair") repairDmg(b.dataset.rp);
    else if(a==="keepFinale") keepFinale();
    else if(a==="boxOpen") openBox(b.dataset.bx, b.dataset.pay==="pts"?"pts":"gold");
    else if(a==="boxGaze") boxGaze(+b.dataset.bi);
    else if(a==="boxPick") openBoxPick(+b.dataset.bi);
    else if(a==="boxInspect") boxInspect(+b.dataset.bi);
    else if(a==="boxClose") boxClose();
    else if(a==="openGamble") showGambleAsk();
    else if(a==="gmTicketGo"){ if(gmBuyTicket()) showGamble(); }
    else if(a==="gmTicket"){ if(gmBuyTicket()) showGamble(); }
    else if(a==="gmBuy"){
      const r=gmOpenPu(b.dataset.pu, b.dataset.pay==="pts"?"pts":"gold");
      if(r) showPuResult(r);
    }
    else if(a==="gmRecycle"){ gmRecycle(G._gmCur); showGamble(); }
    else if(a==="gmVault"){ gmVault(G._gmCur); showGamble(); }
    else if(a==="gmFund"){ gmFund(+b.dataset.amt); showGamble(); }
    else if(a==="gmCloseEnd"){ hideModal(); render(); }
  });

  document.addEventListener("click",e=>{
    const sl=e.target.closest(".sl[data-pick]");
    if(sl && sl.dataset.pick) pickStone(+sl.dataset.pick);
  });
}


/* ══════════════════════════════════════════════════════════════
   赌 坊 · 逻辑层
   ────────────────────────────────────────────────────────────
   规则要点（按定稿）：
   · 门票扣声望，票价 = min(10+3×(累计票数−1), 40)，只升不降、不限次
   · 石璞每方 200,000 金，一档不分高低，四璞无倾向差异
   · 不鉴定、不瞻礼、不能反悔：买定离手，当场开刀
   · 产物当场定生死：回收拿钱 / 计入赌藏换全局加成（二选一）
   · 砖头料回收 0，认赔，不入藏
   · 赎铺 1,000 万，分期存入不可取回，赎身后永久免租
   ══════════════════════════════════════════════════════════════ */

/* 赌坊状态自愈：旧档/ 部分初始化时补齐字段 */
function gmFix(){
  const g=G.gamble;
  if(!g || typeof g!=="object"){ G.gamble={tickets:0,ticketsDay:0,fund:0,owned:false,vault:[],stats:{open:0,byS:{tai:0,lan:0,mo:0,yao:0},spent:0,got:0,wuzhan:0,jade:0,byProd:{}}}; return; }
  if(typeof g.tickets!=="number") g.tickets=0;
  // 当日票数：票价按「当日累计」递增，第二天归零重来（初始价回到 10 声望）
  if(typeof g.ticketsDay!=="number") g.ticketsDay=0;
  if(typeof g.fund!=="number") g.fund=0;
  g.owned=!!g.owned;
  if(!Array.isArray(g.vault)) g.vault=[];
  /* 旧档迁移：赌藏不再单设柜子，历史 vault 记录并回藏珍主柜 */
  if(g.vault.length){
    if(!Array.isArray(G.treasure)) G.treasure=[];
    for(const v of g.vault){
      if(!G.treasure.some(t=>t.src==="gamble" && t.g===v.k)) addGambleTreasure(v.k, v.n, v.d, v.from, v.bo);
    }
    g.vault=[];
  }
  if(!g.stats || typeof g.stats!=="object")
    g.stats={open:0,byS:{tai:0,lan:0,mo:0,yao:0},spent:0,got:0,wuzhan:0,jade:0,byProd:{}};
  const t=g.stats;
  if(typeof t.open!=="number") t.open=0;
  if(typeof t.spent!=="number") t.spent=0;
  if(typeof t.got!=="number") t.got=0;
  if(typeof t.wuzhan!=="number") t.wuzhan=0;
  if(typeof t.jade!=="number") t.jade=0;
  t.byS=Object.assign({tai:0,lan:0,mo:0,yao:0}, t.byS||{});
  t.byProd=Object.assign({}, t.byProd||{});
}

/* ── 门票：票价按【当日】累计购票数递增，次日归零重来，封顶 40（方案 v3 §六）── */
function gmTicketPrice(){ gmFix(); return ticketPrice((G.gamble.ticketsDay||0)+1); }
function gmCanPayTicket(){ return G.rep >= gmTicketPrice(); }
/* 购票：扣声望，当日票数 +1（总票数另计，仅作统计展示） */
function gmBuyTicket(){
  gmFix();
  const p=gmTicketPrice();
  if(G.rep < p){ say("声望不够，门票要 "+p+" 声望", true); return false; }
  G.rep -= p;
  G.gamble.tickets++;
  G.gamble.ticketsDay=(G.gamble.ticketsDay||0)+1;
  G.log.unshift("赌坊 · 第 "+G.gamble.ticketsDay+" 张门票（今日第 "+G.gamble.ticketsDay+" 张 · −"+p+" 声望）");
  say("门票到手 · 今日第 "+G.gamble.ticketsDay+" 张 · 票价 "+p+" 声望", false, "good");
  AudioSys?.SFX?.day_end();
  syncTop();
  saveCloudSoon();
  return true;
}

/* ── 赌坊产物入藏珍：与佳石同柜陈列，不单设「赌藏」柜 ──
   记录字段与佳石共用 G.treasure，用 src:"gamble" 区分来源：
     g 产物键 / gn 产物名 / bo 售价加成 / day 天数 / from 出自哪块石璞 */
function addGambleTreasure(k,n,d,from,bo){
  if(!Array.isArray(G.treasure)) G.treasure=[];
  const hit=G.treasure.find(t=>t.src==="gamble" && t.g===k);
  if(hit){ hit.day=d; hit.bo=bo; hit.from=from; return; }   // 同款只留一条，刷新天数
  G.treasure.unshift({g:k, gn:n, src:"gamble", top:false, bo:bo, v:0, day:d, from:from});
  if(G.treasure.length>KEEPCAP) G.treasure.length=KEEPCAP;
}

/* ── 赌坊加成：从藏珍里的赌坊产物折算（独立于天赐加成）── */
function gmVaultBonus(){
  gmFix();
  let b=0;
  for(const t of G.treasure){
    if(t.src!=="gamble") continue;
    b += (PU_PROD.find(x=>x.k===t.g)||{bo:0}).bo;
  }
  return Math.min(VAULT_CAP, b);
}
/* 赌坊加成叠加到全局定价倍率（与天赐相加，上限各自独立） */
function gamblePriceMul(){ return 1 + gmVaultBonus()/100; }

/* ── 开璞：抽产物 ── */
function gmRollProd(){
  gmFix();
  let r=RND(), acc=0;
  for(const x of PU_PROD){ acc+=x.p; if(r<acc) return x; }
  return PU_PROD[0];
}
/* 买石 + 开石一体化（买定离手，无二次确认）*/
function gmOpenPu(puK,mode){
  gmFix();
  const pu=PU.find(x=>x.k===puK); if(!pu) return null;
  /* 支付方式：金币或石筹，由玩家在石架上选择 */
  const usePts = (mode==="pts");
  if(usePts){
    if(G.pts < PU_PRICE_PTS){ say("石筹不够，一方石璞要 "+PU_PRICE_PTS+" 石筹", true); return null; }
    G.pts -= PU_PRICE_PTS;
  }else{
    if(G.gold < PU_PRICE){ say("金币不够，一方石璞要 "+PU_PRICE.toLocaleString()+" 金", true); return null; }
    G.gold -= PU_PRICE;
  }
  const t=G.gamble.stats;
  /* 投入按金币口径折算，统计口径保持一致 */
  t.spent += usePts ? Math.round(PU_PRICE_PTS*PTS_GOLD_RATIO) : PU_PRICE;
  t.open++;
  t.byS[pu.k]=(t.byS[pu.k]|0)+1;
  const prod=gmRollProd();
  t.byProd[prod.k]=(t.byProd[prod.k]|0)+1;
  if(prod.k==="wuzhan") t.wuzhan++;
  else t.jade++;
  const res={ pu, prod, from:pu.k, day:G.day, gold:G.gold, vaulted:false };
  G._gmLast=res; G._gmCur=res;
  G.log.unshift("赌坊 · "+pu.n+" → "+prod.n+(prod.rec>0?"（回收 "+prod.rec+"）":"（血本无归）"));
  AudioSys?.SFX?.day_end();
  syncTop();
  return res;
}
/* 选择一：回收变现 */
function gmRecycle(res){
  if(!res) return 0;
  const v=res.prod.rec|0;
  G.gold += v;
  G.gamble.stats.got += v;
  say(v>0 ? ("回收 "+res.prod.n+" · +"+v.toLocaleString()+" 金") : "血本无归 · 一包灰渣", v<=0);
  saveCloudSoon();
  return v;
}
/* 选择二：计入藏珍（砖头料不可入藏）*/
function gmVault(res){
  if(!res) return false;
  const x=res.prod;
  if(x.bo<=0){ say("此物不堪入藏", true); return false; }
  gmFix();
  const before=gmVaultBonus();
  addGambleTreasure(x.k, x.n, G.day, res.from, x.bo);
  res.vaulted=true;
  const after=gmVaultBonus();
  syncTop();
  saveCloudSoon();
  say("计入藏珍 · "+x.n+"（赌坊加成 +"+after.toFixed(1)+"%）", false, "good");
  return true;
}

/* ── 终极目标：买下玉石铺 ── */
function gmFunded(){ gmFix(); return G.gamble.fund; }
function gmShopPct(){ gmFix(); return Math.min(100, G.gamble.fund/SHOP_GOAL*100); }
function gmShopOwned(){ gmFix(); return !!G.gamble.owned; }
/* 分期存入：不可取回 */
function gmFund(amount){
  gmFix();
  const amt=Math.max(0, Math.round(amount||0));
  if(amt<=0) return false;
  if(G.gold < amt){ say("账上不够 "+amt.toLocaleString()+" 金", true); return false; }
  if(G.gamble.fund + amt > SHOP_GOAL){ say("存满即可成交，余款不必再存", true); return false; }
  G.gold -= amt;
  G.spend += amt;             // 分期购铺计入铺面开销
  G.gamble.fund += amt;
  say("存入 "+amt.toLocaleString()+" 金 · 已存 "+(G.gamble.fund/SHOP_GOAL*100).toFixed(1)+"%", false, "good");
  AudioSys?.SFX?.day_end();
  syncTop();
  if(G.gamble.fund >= SHOP_GOAL) gmClaimShop();
  else saveCloudSoon();
  return true;
}
/* 契价凑满：落定，永久免租 */
function gmClaimShop(){
  gmFix();
  if(G.gamble.owned) return;
  G.gamble.owned=true;
  G.log.unshift("玉契落定 · "+SHOP_NAME+"归你执掌，此后不再缴租");
  saveCloudSoon();
  showShopFinale();
}
/* 已赎身后房租归零 */
function gmRentExempt(){ gmFix(); return !!G.gamble.owned; }

/* ══════════ 启动 ══════════ */
/* 侧栏收起/展开：按钮固定显示「台 面」，与石市按钮区分 */
function syncSideBtn(){
  const b=document.getElementById("sideBtn");
  if(b) b.textContent = "台 面";
}
function toggleSide(){
  const closed=document.body.classList.contains("noside");
  if(closed){
    G.sideView="bench";              // 打开：回台面视图
  }else if((G.sideView||"bench")!=="bench"){
    G.sideView="bench";              // 已开且在背包：切回台面
    render(); return;
  }
  document.body.classList.toggle("noside");
  syncSideBtn();
  fit();                 // 画布容器宽度变了，必须重算，否则会拉伸变形
  render();
}
/* 收起侧栏：台面「收起」/ 背包「关包」共用（参照石市「收摊」） */
function closeSide(){
  document.body.classList.add("noside");
  syncSideBtn(); fit(); render();
}
/* 背包：顶栏独立入口，打开侧栏并切到背包视图 */
function openBag(){
  G.sideView="bag";
  document.body.classList.remove("noside");
  syncSideBtn();
  fit();
  render();
}
function boot(){
  // 音频初始化：首次用户交互时自动启动（点击 / 触摸 / 按下任一即可）
  const audioInit = () => {
    AudioSys?.init();
    AudioSys?.startBGM();
  };
  document.addEventListener("click", audioInit, { once: true });
  document.addEventListener("touchstart", audioInit, { once: true });
  document.addEventListener("pointerdown", audioInit, { once: true });

  if(window.matchMedia && window.matchMedia("(max-width:760px)").matches){
    document.body.classList.add("noside");   // 窄屏默认收起侧栏
  }
  syncSideBtn();
  fit();
  bindInput();

  // 先取云存档（有则续上），再检测三连/关注/充电
  const ready=Promise.resolve()
    .then(()=> (typeof loadCloudSave==="function") ? loadCloudSave() : null)
    .catch(()=>{});
  ready.then(()=>{
    if(typeof checkToySocial==="function"){
      return checkToySocial().then(()=>{
        G.socialBonus = (typeof socialRateBonus==="function")?socialRateBonus():0;
        G.hasCharge = (typeof hasCharge==="function")?hasCharge():false;
        render();
      });
    }
  }).catch(()=>{});

  ready.then(()=>{ newDay(); showIntro(); });
  (function loop(){
    draw();
    requestAnimationFrame(loop);
  })();
}
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",()=>loadAssets(boot));
}else{
  loadAssets(boot);
}

/* ── 测试探针暴露 ── */
window.G=G;window.UID=UID;
window.finishStone=finishStone;window.keepFinale=keepFinale;
window.treasureGradeName=treasureGradeName;window.isTopStone=isTopStone;
window.addTreasure=addTreasure;window.addGambleTreasure=addGambleTreasure;
window.gmVault=gmVault;window.gmRecycle=gmRecycle;
window.gmTicketPrice=gmTicketPrice;window.gmBuyTicket=gmBuyTicket;
window.gmVaultBonus=gmVaultBonus;window.gmOpenPu=gmOpenPu;
window.newDay=newDay;window.nextDay=nextDay;window.closeModal=closeModal;
