"use strict";
/* ══════════ 界面层（黑金维多利亚） ══════════ */
function syncTop(){
  document.getElementById("gold").textContent=G.gold;
  const p=document.getElementById("pts");
  if(p) p.textContent=G.pts;
  // 显示天数而非时辰
  document.getElementById("clk").textContent="第"+G.day+"日";
  document.getElementById("clk").className="nv mn";
  document.getElementById("rV").textContent=G.rep;
  document.getElementById("rF").style.width=cl(G.rep/REP_MAX*100,0,100)+"%";
  // 运气：按上限百分比显示，低于一次鉴定开销时提示见底
  document.getElementById("sV").textContent=G.luck;
  const cap=luckCap();
  document.getElementById("sF").style.width=cl(G.luck/Math.max(1,cap)*100,0,100)+"%";
  document.getElementById("sB").className="bar sn"+(G.luck<LUCK_COST_GAZE?" low":"");
  // 常驻状态条：今日运气 + 今日异象（任何屏幕宽度都可见）
  const stt=document.getElementById("stt");
  if(stt){
    let s="今日运气 <b>"+luckTag()+" "+G.luck+" / "+cap+"</b>";
    if(G.event) s+=' · <span class="ev">今日异象 · '+G.event.n+"（"+G.event.tip+"）</span>";
    else s+=" · 今日无异象";
    stt.innerHTML=s;
  }
}

/* ── 缩略图：货摊原石只画外壳（不剧透宝石），藏品画成品 ── */
function thumb(cv2, src){
  const x=cv2.getContext("2d");
  const D=Math.min(2,window.devicePixelRatio||1);
  cv2.width=38*D; cv2.height=38*D;
  x.setTransform(D,0,0,D,0,0);
  x.fillStyle="#000"; x.fillRect(0,0,38,38);
  const im=imgOf(src);
  if(im){
    const sc=Math.max(38/im.width,38/im.height);
    x.globalCompositeOperation="lighter";
    x.drawImage(im,(38-im.width*sc)/2,(38-im.height*sc)/2,im.width*sc,im.height*sc);
    x.globalCompositeOperation="source-over";
  }
}

/* ── 完工按钮：实时算出「现在完工能拿多少」，价格随进度变化 ── */
function stopBtnHTML(){
  const st=cur(); if(!st||!st.s) return "";
  const ratio=(typeof stopRatio==="function")?stopRatio():0;
  if(ratio<=0) return "";
  const est=Math.max(1,Math.round(itemBase({kind:"gem",s:st.s,dg:st.dg,cuts:st.cuts,pq:st.pq===undefined?0.5:st.pq})*ratio));
  return `<button class="opt3" data-act="stop" title="完工出售，按当前完成度折价">完 工<small>${est} 金</small></button>`;
}

/* ── 下一道工序按钮：跃进到下一阶段，省掉「必须落完当前工序」的硬约束 ── */
const PHASE_NEXT={
  peel  :{to:"cut",   label:"下一道工序", sub:"直接上锯"},
  cut   :{to:"polish",label:"下一道工序", sub:"直接上磨"},
  polish:null
};
function nextStepHTML(){
  const nx=PHASE_NEXT[G.phase];
  if(!nx) return "";
  const st=cur(); if(!st) return "";
  // 至少完成一刀才能进阶，否则与「直接卖掉原石」无区别
  const done = G.phase==="peel" ? (G.peelMax-G.peelLeft) : G.cutDone;
  if(done<STOP_MIN_HIT) return `<button class="opt3 locked" disabled title="先落至少${STOP_MIN_HIT}手再进阶">下一道工序<small>需先落 ${STOP_MIN_HIT} 手</small></button>`;
  return `<button class="opt3 next" data-act="nextStep" title="跳过本工序剩余，直接进入下一道">${nx.label}<small>${nx.sub}</small></button>`;
}

/* ── 工具栏 ── */
/* 工具按钮已移除：工序由「落錾 / 落刀 / 落磨」单一主操作推进，
   当前生效工具仍由 bestTool() 自动选取最高级已解锁手艺，不再在界面上展示。 */
function bestTool(){
  let k="chisel";
  for(const t of TKS){ if(!toolLockReason(t)) k=t; }
  return k;
}
function drawTools(){
  const el=document.getElementById("tl");
  const st=cur();
  let h="";
  // 工具已隐去，但仍需按已解锁的最高级手艺自动生效
  const tk=bestTool();
  if(G.tool!==tk) G.tool=tk;
  // 主操作与「卖掉 / 下一道工序」并列一行：落錾 / 落刀 / 落磨
  // 完工按钮仅在最后一道工序（polish）时显示
  if(G.phase==="peel"||G.phase==="cut"){
    const act=G.phase;
    /* 工序名：錾剥 / 开料（学艺后显示线割·震解） / 修磨 */
    const name = G.phase==="peel" ? "錾 剥" : (typeof curCut==="function" ? curCut().n : "开 料");
    const rate=Math.round(opRate(G.phase,st)*100);
    h+=`<div class="tri">`;
    h+=`<button class="opt3 on" data-act="${act}">${name}<small>成功率 ${rate}%</small></button>`;
    h+=nextStepHTML();
    h+=`</div>`;
  }else if(G.phase==="polish"){
    // 最后一道工序：可完工、可继续修磨
    h+=`<div class="tri">`;
    h+=`<button class="opt3 on" data-act="polish">修 磨<small>成功率 ${Math.round(opRate("polish",st)*100)}%</small></button>`;
    h+=stopBtnHTML();
    h+=`</div>`;
  }
  /* 切法选择按钮已整体移除：开料方式由已学技艺自动决定（震解 > 线割 > 普通开料），
     玩家不再手动选琢型。 */
  if(!G.dayOver){
    const warn=G.jewels.length?`（${G.jewels.length} 件将按六折让渡）`:"";
    h+=`<div class="acts-row">`;
    h+=`<button class="gh${G.jewels.some(x=>x.kind==="gem"&&x.dg.length)?" warn":""}" data-act="openWs">${G.jewels.some(x=>x.kind==="gem"&&x.dg.length)?"制作首饰·先修伤":"制作首饰"}</button>`;
    h+=`<button class="gh${G.jewels.length?" warn":""}" data-act="closeShop">直接卖出${warn}</button>`;
    if(st) h+=`<button class="gh" data-act="drop">弃石</button>`;
    h+=`</div>`;
  }else if(st){
    h+=`<button class="gh" data-act="drop">弃石</button>`;
  }
  el.innerHTML=h;
  // 工具栏重建后高度会变：同步刷新 toast 锚点，避免提示条压住按钮
  const ts=document.getElementById("ts");
  if(ts) ts.style.bottom=(el.offsetHeight+4)+"px";
}

/* ── 侧栏（顶栏「台面」按钮已删，仅由「背包」按钮打开 → 背包视图）── */
function drawSide(){
  const el=document.getElementById("sd");
  const st=cur();
  const view=G.sideView||"bench";
  let h="";

  if(view==="bench"){

  // 今日运气：只用于鉴定成色
  const cap=luckCap(), lk=luckOf();
  h+=`<div class="sec"><h3>今日运气 · ${luckTag()}</h3>`;
  h+=`<div class="rw"><span class="k">余量</span><span class="v">${lk} / ${cap}</span></div>`;
  h+=`<p class="ds" style="margin-top:6px;font-size:11px">运气见底时，今天就看不出成色了。</p>`;
  h+=`</div>`;

  // 成色鉴定：花费运气才看得见
  if(st){
    h+=`<div class="sec"><h3>初始成色</h3>`;
    const can=lk>=LUCK_COST_GAZE;
    h+=`<button class="${can?"pri":"gh"}" style="width:100%" data-act="gaze" ${can?"":"disabled"}>${can?`鉴定成色`:`运气不足（余 ${lk}）`}</button>`;
    if(st.s.gazed){
      const gz=gazeInfoOf(st.s);
      h+=`<div class="gaze-bar${gz.gk==="rare"?" rare":""}">`;
      h+=`<div class="gz-n">${gz.gazeName}</div>`;
      h+=`<div class="gz-d">${gz.gazeDs}</div>`;
      h+=`<div class="gz-m">品质 ${gz.grade} · 硬度 ${gz.hard.toFixed(1)}</div>`;
      h+=`</div>`;
    }else{
      h+=`<p class="ds" style="margin-top:6px;font-size:11px">尚未鉴定 —— 成色、品质、硬度都还锁在壳里。</p>`;
    }
    h+=`</div>`;
  }

  // 今日异象
  if(G.event){
    h+=`<div class="sec"><h3>今日异象 · ${G.event.n}</h3>
      <div class="rw"><span class="k" style="white-space:normal;line-height:1.5">${G.event.ds}</span></div>
      <div class="rw"><span class="k">影响</span><span class="v">${G.event.tip}</span></div></div>`;
  }

  // 匠人日志
  h+=`<div class="sec"><h3>匠人日志</h3>`;
  const logs=G.log.slice(0,6);
  if(!logs.length) h+=`<div class="rw"><span class="k">尚无记录</span><span class="v">—</span></div>`;
  for(const l of logs) h+=`<div class="rw"><span class="k" style="white-space:normal;line-height:1.5">${l}</span></div>`;
  h+=`</div>`;

  // 收起（参照石市「收摊」：关掉台面面板）
  h+=`<button class="gh" style="width:100%;margin-top:8px" data-act="closeSide">收 起</button>`;

  }else{

  // 案上原石（背包）
  h+=`<div class="sec"><h3>案上原石</h3>`;
  if(!st){ h+=`<div class="rw"><span class="k">状态</span><span class="v">台面空置</span></div>`; }
  else{
    const s=st.s;
    if(s.gazed){
      h+=`<div class="rw"><span class="k">石种</span><span class="v">${GEMS[s.gtype].n}</span></div>`;
      h+=`<div class="rw"><span class="k">工艺</span><span class="v">${craftGradeOf(st)}</span></div>`;
      h+=`<div class="rw"><span class="k">莫氏硬度</span><span class="v">${s.hard.toFixed(1)}</span></div>`;
    }else{
      h+=`<div class="rw"><span class="k">围岩</span><span class="v">${SHELLS[s.shell].n}</span></div>`;
      h+=`<div class="rw"><span class="k">石名</span><span class="v">未鉴定</span></div>`;
      h+=`<div class="rw"><span class="k">莫氏硬度</span><span class="v">需鉴定</span></div>`;
    }
    h+=`<div class="rw"><span class="k">进货价</span><span class="v">${spentOf(s)} 金</span></div>`;
    if(st.dg.length){
      h+=`<div style="margin-top:6px">`;
      for(const d of st.dg) h+=`<div class="dg"><span class="t">${DMG[d].n}</span>${DMG[d].ds}</div>`;
      h+=`</div>`;
    }
    if(G.phase==="peel") h+=`<div class="rw" style="margin-top:6px"><span class="k">剩余废石</span><span class="v">${G.peelLeft} 击</span></div>`;
    if(G.phase==="cut") h+=`<div class="rw" style="margin-top:6px"><span class="k">刻面</span><span class="v">${G.cutDone} / ${G.cutNeed}</span></div>`;
    if(G.phase==="polish") h+=`<div class="rw" style="margin-top:6px"><span class="k">修磨</span><span class="v">${G.polishDone} / ${G.polishNeed} · 当前 ${polishTag({pq:G.polishQ})}</span></div>`;
  }
  h+=`</div>`;

  // 待拍藏品
  h+=`<div class="sec"><h3>待拍藏品</h3>`;
  if(!G.jewels.length) h+=`<div class="rw"><span class="k">尚无成品</span><span class="v">—</span></div>`;
  for(const j of G.jewels){
    const v=itemBase(j);
    const nm = j.kind==="jewel" ? JEWELS[j.jk].n : GEMS[j.s.gtype].n;
    const rp = repairable(j);
    h+=`<div class="sl"><canvas data-th="${j.kind==="jewel"?"j":"g"}${j.id}"></canvas>
      <span class="if"><span class="n">${nm} · ${polishTag(j)}${j.dg.length?" · "+j.dg.map(d=>DMG[d].n).join("／"):""}</span>
      <span class="d">底价 ${v} 金 · 声誉 +${repAuctionK()}% · 天赐加成 ×${giftBonus().toFixed(2)}</span></span>
      <span class="btns">
        <button class="gh" data-auc="${j.id}">送拍</button>
        ${j.kind==="gem"
          ? (j.dg.length
             ? `<button class="gh" disabled title="带伤不镶：先修复损伤才能制首饰">制首饰</button>`
             : `<button class="gh" data-ws="${j.id}">制首饰</button>`)
          : ``}
        ${rp?`<button class="gh" data-act="repair" data-rp="${j.id}:${rp}" ${G.gold<REPAIR[rp].cost?"disabled":""}>修复 ${REPAIR[rp].cost}金</button>`:""}
      </span></div>`;
  }
  h+=`</div>`;

  // 天赐收藏进度（详录在「藏珍」面板）
  h+=`<div class="sec"><h3>天 赐</h3>`;
  h+=`<div class="rw"><span class="k">收藏</span><span class="v">${G.gifts.length} / ${GIFTS.length} 件 · 全店售价 +${Math.round(giftBonus()*100-100)}%</span></div>`;
  if(!G.gifts.length) h+=`<div class="rw"><span class="k">尚无天赐</span><span class="v">异像石中偶有天赐剥离</span></div>`;
  for(const g of G.gifts.slice(0,4)){
    h+=`<div class="sl"><canvas data-gf="${g.k}"></canvas>
      <span class="if"><span class="n">${g.n}</span>
      <span class="d">全店售价 +${g.bonus}%</span></span></div>`;
  }
  h+=`<button class="gh" data-act="openCabinet" style="width:100%;margin-top:6px">翻看天赐</button>`;
  h+=`</div>`;

  // 已入藏珍的佳石计数（详录在「藏珍」面板）
  h+=`<div class="sec"><h3>藏 珍</h3>`;
  const gmN=G.treasure.filter(t=>t.src==="gamble").length;
  if(!G.treasure.length) h+=`<div class="rw"><span class="k">尚无记录</span><span class="v">上等与天品成色，入柜即自动收录</span></div>`;
  else{
    const exN=G.treasure.length-gmN;
    const ts=treasureStats();
    h+=`<div class="rw"><span class="k">收录</span><span class="v">佳石共 ${ts.total} 方 · 上等 ${ts.high} 方 · 天品 ${ts.rare} 方${gmN?` · 赌坊 ${gmN} 方`:""}</span></div>`;
    /* 侧栏只预览前 3 条。赌坊条目的 t.g 是产物键（如 jiangli）而非石种键，
       直接 GEMS[t.g] 会取到 undefined 让整个侧栏崩掉 —— 必须分支渲染。 */
    for(const t of G.treasure.slice(0,3)){
      if(t.src==="gamble"){
        const x=PU_PROD.find(y=>y.k===t.g); if(!x) continue;
        h+=`<div class="sl"><span class="tcmini"><img src="${x.img}" alt="${x.n}"></span>
          <span class="if"><span class="n">${x.n}</span>
          <span class="d">赌坊入藏 · 售价 +${x.bo}% · 第 ${t.day} 天</span></span></div>`;
        continue;
      }
      const g=GEMS[t.g]; if(!g) continue;
      h+=`<div class="sl"><canvas data-tc="${t.g}"></canvas>
        <span class="if"><span class="n">★${g.n}</span>
        <span class="d">${t.gn} · ${t.v} 金 · 第 ${t.day} 天</span></span></div>`;
    }
  }
  h+=`<button class="gh" data-act="openCabinet" style="width:100%;margin-top:6px">翻看藏珍</button>`;
  h+=`</div>`;

  // 关包（参照石市「收摊」：关掉背包面板）
  h+=`<button class="gh" style="width:100%;margin-top:8px" data-act="closeSide">关 包</button>`;

  }

  el.innerHTML=h;
  for(const cv2 of el.querySelectorAll("canvas[data-thumb]")){
    const s=G.tray.find(x=>x.id==cv2.dataset.thumb);
    if(s) thumb(cv2, SHELLS[s.shell].img);
  }
  for(const cv2 of el.querySelectorAll("canvas[data-th]")){
    const key=cv2.dataset.th;
    const jid=+key.slice(1);
    const j=G.jewels.find(x=>x.id===jid);
    if(j) thumb(cv2, (typeof cutImgOf==="function")?cutImgOf(j):GEMS[j.s.gtype].cutimg);
  }
  for(const cv2 of el.querySelectorAll("canvas[data-tc]")){
    const g=GEMS[cv2.dataset.tc];
    if(g) thumb(cv2, g.img);
  }
  for(const cv2 of el.querySelectorAll("canvas[data-gf]")){
    const gt=GIFTS.find(x=>x.k===cv2.dataset.gf);
    if(gt) giftThumb(cv2,gt);
  }
}

/* ── 模态 ── */
function showModal(html){
  document.getElementById("md").innerHTML=html;
  document.getElementById("vl").className="on";
}
function hideModal(){
  document.getElementById("vl").className="";
  // 自愈：任何路径关窗时，若还挂着一件未确认的成品/盲盒，先把游戏状态解锁，
  // 否则 settling 会一直为 true，后续所有加工判定都被挡住 —— 表现为「卡死」。
  if(typeof G!=="undefined"){
    if(G.finaleSt && !G.finaleSt.busy){
      const st=G.finaleSt.st;
      G.finaleSt=null;
      if(st && cur()===st && G.bag.some(x=>x.s.id===st.s.id)){
        G.settling=false;                       // 料还在案上，退回加工态即可继续
        // 成品弹窗被直接关掉（未点入柜）：料还没走完，退回上一道工序等玩家继续
        if(G.phase==="cut"||G.phase==="polish"){
          G.phase="peel";
          G.peelLeft=0;
        }
      }
    }
    if(G.settling && !G.finaleSt) G.settling=false;
  }
  // 开满两块料后，等当前弹窗（砖头料/天赐）关闭即强制打烊入夜
  // forced 必须显式传 true：这是「时辰/额度用尽」的自动收市，成品要留存到次日。
  // 漏传时 forced 为 undefined（falsy），会走「主动收工」分支把柜台成品六折清空 ——
  // 玩家辛苦开出的成品凭空少卖四成，且日志写的是「收市让渡」而不是「留存」。
  if(G._pendingClose && !G.finaleSt && !G.settling){ G._pendingClose=false; closeDay(true); }
}

/* 打烊面板重开：玩家在打烊后点开别的面板又关掉时，把「歇业进入次日」面板还给他。
   没有这一步，玩家会被「今日已收工，明天再来」挡住，却又找不到进第二天的入口。 */
function resumeDayEnd(){
  const d=G._dayEnd||{gained:0,net:rentOf(G.day),liq:{back:0,bn:0,sold:0,sn:0,kept:0}};
  showDayEnd(d.gained, d.net, d.liq);
  render();
}
function showDayEnd(gained, net, liq){
  liq = liq || {back:0,bn:0,sold:0,sn:0,kept:0};
  const rentDue = (G.day % RENT_INTERVAL === 0);
  let h=`<h2>打 烊</h2><div class="sb">第 ${G.day} 日 · 玉石馆</div>`;
  h+=`<div class="ln"><span class="k">今日售出</span><span class="v ${G.earn>0?"ps":"ng"}">${G.earn>0?"+"+G.earn+" 金":"无进项"}</span></div>`;
  h+=`<div class="ln"><span class="k">料损</span><span class="v ${G.lost>0?"ng":"ps"}">${G.lost>0?"−"+G.lost+" 金":"无"}</span></div>`;
  if(liq.sn) h+=`<div class="ln"><span class="k">收市让渡</span><span class="v ps">+${liq.sold} 金 · ${liq.sn} 件</span></div>`;
  if(liq.kept) h+=`<div class="ln"><span class="k">成品留存</span><span class="v ps">${liq.kept} 件 · 明日可送拍／制首饰</span></div>`;
  if(liq.bn) h+=`<div class="ln"><span class="k">未完工退还</span><span class="v">+${liq.back} 金 · ${liq.bn} 块</span></div>`;
  h+=`<div class="ln"><span class="k">铺面开销</span><span class="v ng">−${(G.spend||0)} 金</span></div>`;
  if((G.spend||0)>0 && Math.round((G.spend||0))!==net)
    h+=`<div class="ln" style="opacity:.72"><span class="k">开销构成</span><span class="v">进货 / 修复 / 学费 / 料件 / 租金合计</span></div>`;
  h+=`<div class="ln"><span class="k">声誉</span><span class="v ${gained>0?"ps":""}">${gained>0?"+"+gained:"无长进"}</span></div>`;
  h+=`<div class="ln"><span class="k">结余</span><span class="v ${G.gold>0?"":"ng"}">${G.gold} 金</span></div>`;
  if(G.best) h+=`<div class="ln tot"><span class="k">最佳成品</span><span class="v">${G.best.n} · ${G.best.v} 金</span></div>`;
  if(liq.bn) h+=`<p class="ds">${liq.bn} 块没来得及开完的料，原样退还 —— 料还是你的，什么时候开都行。</p>`;
  // 租金提示：只有第5/10/15…日才收租
  const nextRent=(Math.floor(G.day/RENT_INTERVAL)+1)*RENT_INTERVAL;
  if(gmShopOwned()){
    h+=`<p class="ds" style="color:#8fe0ae">玉契已落定 · ${SHOP_NAME}归你执掌，此后不必再缴租。</p>`;
  }else if(rentDue){
    h+=`<p class="ds" style="color:#b87a6e">本期租金 ${RENT_AMOUNT} 金已随打烊结清 · 下次缴租：第${nextRent}日</p>`;
  }else{
    const daysLeft=nextRent-G.day;
    h+=`<p class="ds">今日不收租 · 下次缴租：第${nextRent}日（还剩 ${daysLeft} 天，届时 ${RENT_AMOUNT} 金）</p>`;
  }
  if(!gmShopOwned() && G.gold<rentOf(G.day+1)) h+=`<p class="ds" style="color:#b87a6e">明日开铺需 ${rentOf(G.day+1)} 金，账上不够了。得挑值钱的石头出手。</p>`;
  const sr=toolLockReason("saw");
  if(sr) h+=`<p class="ds">金刚线锯还差一步：${sr}。硬岩的容错宽得多。</p>`;
  const so=toolLockReason("sonic");
  if(so) h+=`<p class="ds">超声震裂还差一步：${so}。沿解理一击，成或碎。</p>`;
  h+=gmFundHTML();
  h+=`<div class="ac"><button class="pri" data-act="next">歇业，进入第 ${G.day+1} 日</button></div>`;
  showModal(h);
}
function rentOf(d){
  // 买下玉石铺后永久免租
  if(typeof gmRentExempt==="function" && gmRentExempt()) return 0;
  // 每 RENT_INTERVAL 天收一次租金：只有缴租日当天才收，其余日子分文不收
  const day = d || G.day;
  return (day % RENT_INTERVAL === 0) ? RENT_AMOUNT : 0;
}

function showIntro(){
  let h=`<h2>一刀穷，一刀富</h2>`;
  h+=`<p class="ds">石市开箱，三块原石任挑。里头出什么货，一刀切开便知。</p>`;
  h+=`<p class="ds"><b style="color:#e8d5a3">一天两块料</b><br>每天能开两块石，开完即打烊入夜。开箱择一时就能花运气鉴定成色，看准了再拿；取料上台即入工序，做完或收刀即打烊，直接进第二天。</p>`;
  h+=`<p class="ds">一道工序没做完，眼前有三条路：<b>再下一刀</b>接着赌，或<b>就此收手</b>按眼前成色出货，或<b>跳过这道</b>直进下一道。切满全程的料，比半路停手的卖得价高。</p>`;
  h+=`<p class="ds"><b style="color:#e8d5a3">四类鉴定结果</b><br>取料第一道工序就分四档：<b>天品</b> 0.5%（传说中的龙石现形）；<b>上等</b> 4%（红宝石、蓝宝石级色料）；<b>中等</b> 25%（糯冰、糯种、紫罗兰、飘花冰种、芙蓉种等翡翠）；<b>下等</b> 70.5%（豆种、干青等杂石，其中砖头料当场作废，残料折成石筹退回）。</p>`;
  h+=`<p class="ds"><b style="color:#e8d5a3">首饰工价</b><br>镶得好是溢价，镶瘸了是倒贴。修磨镜面、全身完好才溢价；磨得糙、带伤镶嵌，镶出来可能比裸石还便宜 —— 首饰从来不是稳赚的买卖。</p>`;
  h+=`<p class="ds"><b style="color:#e8d5a3">交租</b><br>五天一租，每次五千金。账上凑不齐，铺子便叫东家收走。</p>`;
  h+=`<p class="ds"><b style="color:#e8d5a3">声望</b><br>切出高货售出，声望看涨，往后拍卖有人抬价，也能拿钱换手艺。若拿次货糊弄人，声望便跌。拍卖会上<b>鼓动加价固定花 10 声望，且只有五成把握喊动人</b>，声望同时决定成交加成。开出的石头只要是<b>上等或天品</b>成色，入柜即自动收进「藏珍」（中等、下等与没收刀的半成品不入）。</p>`;
  h+=`<p class="ds"><b style="color:#e8d5a3">天赐</b><br>异像石中偶有非此世之物剥离，入手即<b>永久陈列于藏珍</b>，全店售价每件 +5%。四件天赐各有立绘，集齐后不再产出，共可得上 <b>+20%</b> 全店售价。</p>`;
  h+=`<p class="ds">经营进度和成绩会保存在云端。</p>`;
  h+=`<div class="ac"><button class="pri" data-act="start">开门营业</button></div>`;
  showModal(h);
}

/* ── 盲盒：只卖档位。开箱后三选一；选石阶段就能花运气鉴定成色 ── */
/* 绝料现形：异石选项经鉴定确认为绝料后，名称与粗坯立绘即时切换为龙石 */
function boxOptGk(o){
  return (o.gazed && o.gaze && o.gaze.gk==="rare" && o.g==="obsidian") ? "dragon" : o.g;
}
function boxOptLabel(o){
  const bits=[];
  if(o.gazed){
    // 鉴定后才亮石种（花钱鉴定买的信息，之前不剧透）
    const g=GEMS[boxOptGk(o)];
    bits.push(`<b style="color:${g.c2}">${g.n}</b>`);
    bits.push(o.win?`<span style="color:#8fbf9f">明料</span>`:`<span style="color:#9a917f">${SHELLS[o.shell].n}壳</span>`);
    if(o.ex) bits.push(`<span style="color:#d66b6b">专属石料</span>`);
  }else{
    // 未鉴定只露外壳（石灰岩/砂岩/云母片岩），不露晶体不剧透石种
    bits.push(`<span style="color:#9a917f">${SHELLS[o.shell].n}壳</span>`);
  }
  return bits.join(" · ");
}
function showBox(k){
  const b=BOXES.find(x=>x.k===k);
  if(!b) return;
  const cur=BOX && BOX.b.k===k;
  const opts=(cur?BOX.opts:[]);
  let h=`<div class="box">`;
  h+=`<h2>${b.n}</h2><div class="sb">矿商只卖箱，不卖石头</div>`;
  h+=`<p class="ds">${b.ds}</p>`;
  // 档位概率按该箱位实际权重显示：普通箱不出天品，异石箱偏上等且有龙石
  const bw=b.ex?GRADE_WEIGHT_EX:GRADE_WEIGHT_NORMAL;
  const btot=(bw.rare||0)+bw.waste+bw.flower+bw.high;
  const bpc=v=>Math.round(v/btot*1000)/10;
  h+=`<div class="box-pool">`;
  if(bw.rare>0){
    h+=`<span class="bp" style="border-color:#c9a227"><i style="background:#c9a227"></i>天品<em>龙石 · ${bpc(bw.rare)}%</em></span>`;
  }
  h+=`<span class="bp" style="border-color:#e0868a"><i style="background:#e0868a"></i>上等<em>红蓝宝石 · ${bpc(bw.high)}%</em></span>`;
  h+=`<span class="bp" style="border-color:#9fcfc4"><i style="background:#9fcfc4"></i>中等<em>翡翠系 · ${bpc(bw.flower)}%</em></span>`;
  h+=`<span class="bp" style="border-color:#a9b18b"><i style="background:#a9b18b"></i>下等<em>杂石 · ${bpc(bw.waste)}%</em></span>`;
  h+=`</div>`;
  const canGold=G.gold>=b.gold, canPts=G.pts>=b.pts;
  h+=`<p class="ds" style="text-align:center;margin-top:6px">支付方式由你选：金币从当月流水里出，石筹是成品入柜与成交攒的。</p>`;
  h+=`</div>`;
  if(!cur){
    h+=`<div class="ac">
      <button class="pri" data-act="boxOpen" data-bx="${b.k}" data-pay="gold" ${canGold?"":"disabled"}>用金币开 · ${b.gold.toLocaleString()}</button>
      <button class="gh" data-act="boxOpen" data-bx="${b.k}" data-pay="pts" ${canPts?"":"disabled"}>用石筹开 · ${b.pts}</button>
      <button class="gh" data-act="closeModal">再看看</button></div>`;
    showModal(h);
    return;
  }
  // 已开箱：三选一（粗坯立绘 + 转动看料 + 选石阶段就能鉴定成色）
  h=`<div class="box">`;
  h+=`<h2>${b.n} · 择一</h2><div class="sb">只能拿走一块 · 选好不能反悔</div>`;
  h+=`<p class="ds">${b.ds}</p>`;
  h+=`<p class="ds" style="text-align:center;color:#c9a86e">搬上台面前就能花运气鉴定 —— 看准了再拿</p>`;
  h+=`<div class="box-opts">`;
  opts.forEach((o,i)=>{
    const canGaze=opts[i].gazed;
    const lk=luckOf();
    const free=(hasSkill("mind") && !G.mindFreeUsed);
    h+=`<div class="bo">
      <canvas class="bo-cv" width="150" height="150" data-bo="${boxOptGk(o)}"></canvas>
      <span class="bo-tx">${boxOptLabel(o)}</span>
      ${canGaze
        ? `<span class="bo-ds">${GAZE_GRADES[o.gk].ds}</span>`
        : `<span class="bo-ds">成色未鉴定</span>`}
      <div class="bo-acts">
        ${canGaze
          ? `<span class="bo-ds" style="color:#8fbf9f">已鉴定 · ${GAZE_GRADES[o.gk].n}</span>`
          : `<button class="${(free||lk>=LUCK_COST_GAZE)?"pri":"gh"}" data-act="boxGaze" data-bi="${i}" ${(free||lk>=LUCK_COST_GAZE)?"":"disabled title='运气不足'"}>鉴定成色 · ${free?"免费":"−"+LUCK_COST_GAZE+" 运气"}</button>`}
        <button class="pri" data-act="boxPick" data-bi="${i}">就这块</button>
      </div>
    </div>`;
  });
  h+=`</div>`;
  h+=`<div class="ac"><button class="gh" data-act="boxClose">算了，不开了</button></div>`;
  h+=`</div>`;
  showModal(h);
  startBoxSpin();
}

/* 开箱弹窗里的粗坯缓慢自转，模拟「转动镜头看料」；细看按钮触发运势检定撞迹象 */
let _boxRAF=0;
function startBoxSpin(){
  if(_boxRAF) cancelAnimationFrame(_boxRAF);
  if(!BOX) return;
  const k=BOX.b.k;
  const canvases=[...document.querySelectorAll("canvas[data-bo]")];
  if(!canvases.length) return;
  // 缩略图只显示外壳（石灰岩/砂岩/云母片岩纯壳图），不露内部晶体、不剧透石种
  const imgs=canvases.map((cv,i)=>{
    const o=BOX.opts[i];
    const sh=(o&&typeof o.shell==="number")?SHELLS[o.shell]:null;
    return sh?imgOf(sh.img):null;
  });
  const draw=(cv,im,t,i)=>{
    const x=cv.getContext("2d");
    x.fillStyle="#000"; x.fillRect(0,0,150,150);
    if(im){
      x.save(); x.translate(75,75); x.rotate(t*0.5+i*2.1);
      const sc=Math.max(150/im.width,150/im.height);
      x.globalCompositeOperation="lighter";
      x.drawImage(im,-im.width*sc/2,-im.height*sc/2,im.width*sc,im.height*sc);
      x.globalCompositeOperation="source-over"; x.restore();
    }
    // 描边不做稀有度染色 —— 稀有度要上台鉴定后才可见，描边只做统一的暗金框
    x.strokeStyle="rgba(107,90,53,.9)"; x.lineWidth=1;
    x.strokeRect(.5,.5,149,149);
  };
  const loop=()=>{
    if(!BOX || BOX.b.k!==k){ _boxRAF=0; return; }
    const t=performance.now()/1000;
    canvases.forEach((cv,i)=>draw(cv,imgs[i],t,i));
    _boxRAF=requestAnimationFrame(loop);
  };
  _boxRAF=requestAnimationFrame(loop);
}

/* ── 成品立绘：完成全部加工后的最终反馈 ── */
function showFinale(j,v,stopped){
  const g=GEMS[j.s.gtype];
  const imsrc=(typeof cutImgOf==="function")?cutImgOf(j):g.cutimg;
  const grade=craftGradeOf(j);
  const ptag=polishTag(j);
  const dmg=j.dg.length?j.dg.map(d=>DMG[d].n).join(" / "):"完好";
  const color=g.c||"#c9ae6e";
  const ratio=(j.ratio===undefined||j.ratio===null)?1:j.ratio;
  // 材质等级信息
  const matGrade = j.grade ? GRADE_DESC[j.grade] : null;
  let h=`<div class="finale">`;
  h+=`<h2>${g.n}</h2><div class="sb" style="text-align:center">品级：${matGrade?matGrade.n:"未定"} · 工艺：${grade} · 修磨：${ptag}</div>`;
  if(stopped){
    h+=`<div class="fin-stop">收 刀 · 半成品</div>`;
    h+=`<p class="ds">这一刀停在了半路。料没走完全部工序，<b style="color:#b87a6e">底价按 ${Math.round(ratio*100)}% 折算</b> —— 打磨得越少，越不值钱。</p>`;
  }
  if(matGrade){ h+=`<p class="ds">${matGrade.ds}</p>`; }
  h+=`<div class="fin-frame">`;
  h+=`<canvas id="finCanvas" width="260" height="260" style="width:260px;height:260px"></canvas>`;
  h+=`</div>`;
  h+=`<div class="fin-info">`;
  h+=`<div class="ln"><span class="k">工具</span><span class="v">${(TOOLS[j.tool]||TOOLS.chisel).n}</span></div>`;
  if(stopped) h+=`<div class="ln"><span class="k">完成度</span><span class="v ng">${Math.round(ratio*100)}%</span></div>`;
  h+=`<div class="ln"><span class="k">损伤</span><span class="v ${j.dg.length?'ng':'ps'}">${dmg}</span></div>`;
  h+=`<div class="ln"><span class="k">修磨</span><span class="v">${ptag}</span></div>`;
  h+=`<div class="ln"><span class="k">石种</span><span class="v ps">${g.n}</span></div>`;
  h+=`<div class="ln tot"><span class="k">底价</span><span class="v ps">${v} 金</span></div>`;
  h+=`</div>`;
  // 砖头料（下等废料）在第一道工序即作废，不会走到成品弹窗；其余一律可入柜
  h+=`<div class="ac"><button class="pri" data-act="keepFinale" id="keepBtn">${stopped?"入柜（半成品）":"入柜待拍"}</button></div>`;
  h+=`</div>`;
  showModal(h);
  const cv2=document.getElementById("finCanvas");
  if(cv2){
    const x=cv2.getContext("2d");
    x.fillStyle="#000"; x.fillRect(0,0,260,260);
    // imsrc 可能是图片路径（字符串）或预渲染的 canvas 元素
    let im=null;
    if(typeof imsrc==="string") im=imgOf(imsrc);
    else if(imsrc instanceof HTMLCanvasElement) im=imsrc;
    if(im){
      x.globalCompositeOperation="lighter";
      // 失重：料被磨薄，立绘缩一圈
      const sc=(typeof lostScale==="function")?lostScale(j):1;
      const dsz=240*sc, doff=10+(240-dsz)/2;
      x.drawImage(im,doff,doff,dsz,dsz);
      x.globalCompositeOperation="source-over";
    }else{
      x.fillStyle="#0a0906"; x.fillRect(0,0,260,260);
      x.fillStyle="#c9ae6e"; x.textAlign="center";
      x.font='14px "Songti SC","SimSun",serif';
      x.fillText(g.n,130,130);
    }
    if(typeof drawDamage==="function") drawDamage(x, j, j.s, {x:130,y:130}, 115, 240, "cut", imsrc);
  }
}

/* ── 首饰完成回执：镶嵌结束立即展示成品立绘（按石种×材质×首饰类型取图）── */
function showJewelFinale(j,v){
  const g=GEMS[j.s.gtype];
  const jk=JEWELS[j.jk];
  const imsrc=(typeof cutImgOf==="function")?cutImgOf(j):g.cutimg;
  const grade=craftGradeOf(j);
  const ptag=polishTag(j);
  const dmg=j.dg.length?j.dg.map(d=>DMG[d].n).join(" / "):"完好";
  const color=jk?g.c:"#c9ae6e";
  const matGrade=j.grade?GRADE_DESC[j.grade]:null;
  let h=`<div class="finale">`;
  h+=`<h2>${jk?g.n+" · "+jk.n:"裸石 · "+g.n}</h2><div class="sb" style="text-align:center">品级：${matGrade?matGrade.n:"未定"} · 工艺：${grade} · 修磨：${ptag}</div>`;
  if(matGrade) h+=`<p class="ds">${matGrade.ds}</p>`;
  h+=`<div class="fin-frame">`;
  h+=`<canvas id="finCanvas" width="260" height="260" style="width:260px;height:260px"></canvas>`;
  h+=`</div>`;
  h+=`<div class="fin-info">`;
  h+=`<div class="ln"><span class="k">工具</span><span class="v">${(TOOLS[j.tool]||TOOLS.chisel).n}</span></div>`;
  h+=`<div class="ln"><span class="k">损伤</span><span class="v ${j.dg.length?'ng':'ps'}">${dmg}</span></div>`;
  h+=`<div class="ln"><span class="k">修磨</span><span class="v">${ptag}</span></div>`;
  h+=`<div class="ln"><span class="k">石种</span><span class="v ps">${g.n}</span></div>`;
  h+=`<div class="ln tot"><span class="k">底价</span><span class="v ps">${v} 金</span></div>`;
  h+=`</div>`;
  h+=`<div class="ac"><button class="pri" data-act="closeModal">收下，入柜待拍</button></div>`;
  h+=`</div>`;
  showModal(h);
  const cv2=document.getElementById("finCanvas");
  if(cv2){
    const x=cv2.getContext("2d");
    x.fillStyle="#000"; x.fillRect(0,0,260,260);
    // imsrc 可能是图片路径（字符串）或预渲染的 canvas 元素
    let im=null;
    if(typeof imsrc==="string") im=imgOf(imsrc);
    else if(imsrc instanceof HTMLCanvasElement) im=imsrc;
    if(im){
      x.globalCompositeOperation="lighter";
      // 失重：料被磨薄，立绘缩一圈
      const sc=(typeof lostScale==="function")?lostScale(j):1;
      const dsz=240*sc, doff=10+(240-dsz)/2;
      x.drawImage(im,doff,doff,dsz,dsz);
      x.globalCompositeOperation="source-over";
    }else{
      x.fillStyle="#0a0906"; x.fillRect(0,0,260,260);
      x.fillStyle="#c9ae6e"; x.textAlign="center";
      x.font='14px "Songti SC","SimSun",serif';
      x.fillText(g.n,130,130);
    }
    if(typeof drawDamage==="function") drawDamage(x, j, j.s, {x:130,y:130}, 115, 240, "cut", imsrc);
  }
}

/* ── 镶嵌失手弹窗 ── */
function showJewelFail(j){
  const g=GEMS[j.s.gtype];
  const jk=JEWELS[j.jk];
  let h=`<div class="finale">`;
  h+=`<h2>镶嵌失手</h2><div class="sb">${g.n} · ${jk.n}</div>`;
  h+=`<p class="ds">取玉雕琢，拟成簪珥。分寸失手，玉遂有瑕。纵是良材，不复为饰，只余残璞在案。</p>`;
  h+=`<div class="fin-info">`;
  h+=`<div class="ln"><span class="k">损伤</span><span class="v ng">崩边（chip）</span></div>`;
  h+=`</div>`;
  h+=`<div class="ac"><button class="pri" data-act="closeModal">知道了</button></div>`;
  h+=`</div>`;
  showModal(h);
}

/* ── 拍卖会 ── */
function showAuction(){
  if(!AUC) return;
  const j=AUC.j;
  const nm = j.kind==="jewel"?JEWELS[j.jk].n:GEMS[j.s.gtype].n;
  const imsrc=(typeof cutImgOf==="function")?cutImgOf(j):GEMS[j.s.gtype].cutimg;
  let h=`<h2>拍 卖 会</h2><div class="sb">今晚的压轴藏品 · ${nm}</div>`;
  h+=`<div style="text-align:center;margin:6px 0"><canvas id="aucG" width="150" height="150" style="width:150px;height:150px;border:1px solid var(--line);background:#000"></canvas></div>`;
  h+=`<div class="auc-price"><div class="p">${AUC.cur}</div><div class="l">当前出价 · 底价 ${AUC.v0} 金</div></div>`;
  // 价位提示：离底价多远一眼可见
  const gap=AUC.v0-AUC.cur;
  if(gap>0 && gap>AUC.v0*0.10) h+=`<p class="ds" style="text-align:center;color:#b87a6e">还差 <b>${gap}</b> 金才到底价 —— 现在落槌只能按流拍折价，继续加价</p>`;
  else if(gap>0) h+=`<p class="ds" style="text-align:center;color:#c9a86e">离底价只差 ${gap} 金，再加一手更稳</p>`;
  else h+=`<p class="ds" style="text-align:center;color:#8fbf9f">已过底价 · 随时可以落槌</p>`;
  // 叫价历史
  if(AUC.bidlog.length){
    h+=`<div class="auc-log">`;
    for(const b of AUC.bidlog.slice(0,4)) h+=`<div class="rw"><span class="k">${b.n} 叫到</span><span class="v">${b.v} 金</span></div>`;
    h+=`</div>`;
  }
  const top=aucTopBidder();
  for(const b of AUC.bidders){
    const st = !b.alive ? "已退场" : (top===b?"领先":"跟进中");
    const cls = !b.alive ? "out" : (top===b?"st top":"st in");
    h+=`<div class="auc-cust ${b.alive?"":"out"}">
      <span class="face">${b.c.a}</span>
      <span class="nm">${b.c.n}${b.like?` <span style='color:#8fbf99;font-size:10px'>偏爱${GEMS[b.c.like].n}</span>`:""}</span>
      <span class="st ${top===b&&b.alive?"top":(b.alive?"in":"")}">${st}</span></div>`;
  }
  h+=`<p class="ds" style="text-align:center;opacity:.75">第 ${Math.min(AUC.round+1,AUC.maxRound)} / ${AUC.maxRound} 拍${AUC.frozen?" · 三次叫价已定，还能继续往上加":" · 客人正轮流举牌"}</p>`;
  const canHammer=AUC.cur>=AUC.v0;
  const canNudge=G.rep>=AUC_NUDGE_REP;
  h+=`<div class="ac">
    <button class="gh" data-act="aucRaise" ${canNudge?"title='花 "+AUC_NUDGE_REP+" 声望鼓动客人跟价，五成概率成功加价'":"disabled title='声望不足，鼓动不动了'"}>鼓动加价 · −${AUC_NUDGE_REP} 声望</button>
    <button class="pri" data-act="aucHammer" ${canHammer?"":"disabled title='出价未到底价，落槌也按流拍折价'"}>落 槌</button>
    <button class="gh" data-act="aucCancel">撤 拍</button></div>`;
  showModal(h);
  const g=document.getElementById("aucG");
  if(g){
    const x=g.getContext("2d");
    let im=null;
    if(typeof imsrc==="string") im=imgOf(imsrc);
    else if(imsrc instanceof HTMLCanvasElement) im=imsrc;
    if(im){
      x.fillStyle="#000"; x.fillRect(0,0,150,150);
      x.globalCompositeOperation="lighter";
      x.drawImage(im,7,7,136,136);
      x.globalCompositeOperation="source-over";
    }
    // 损伤照样呈现在拍品图上：裂纹／崩边／磨薄／雾化，客人看得见
    if(typeof drawDamage==="function") drawDamage(x, j, j.s, {x:75,y:75}, 64, 136, "cut", imsrc);
  }
}
function aucTopBidder(){
  let t=null;
  for(const b of AUC.bidders) if(b.bid>0 && (!t||b.bid>t.bid)) t=b;
  return t;
}

/* ── 每日异象 ── */
function showEvent(e){
  let h=`<h2>异 象</h2><div class="sb">第 ${G.day} 天 · ${e.n}</div>`;
  h+=`<p class="ds">${e.ds}</p>`;
  h+=`<div class="ln"><span class="k">今日影响</span><span class="v">${e.tip}</span></div>`;
  if(e.lc) h+=`<div class="ln"><span class="k">运气</span><span class="v ${e.lc>0?"ps":"ng"}">${e.lc>0?"+":"−"}${Math.abs(e.lc)}</span></div>`;
  h+=`<div class="ac"><button class="gh" data-act="closeModal">知道了</button></div>`;
  showModal(h);
}

/* ── 砖头料现形弹窗：第一道工序就见底，立绘、损失与石筹返还一次交代清楚 ── */
function showWaste(st, spent, refund){
  // 砖头料一律用通用碎石立绘（不分石种）；原 per-gem waste 图色相对不上，已弃用
  const imsrc=IMG_WASTE;
  let h=`<div class="finale">`;
  h+=`<h2>砖头料</h2>`;
  h+=`<div class="sb">第一道工序就见底 · 下等 · 认定失败</div>`;
  h+=`<p class="ds">粗豆种，干水少翠，棉裂多，只能当废石。开箱作废，残料回收折成石筹退回。</p>`;
  h+=`<div class="fin-frame"><canvas id="finCanvas" width="260" height="260" style="width:260px;height:260px"></canvas></div>`;
  h+=`<div class="fin-info">`;
  h+=`<div class="ln"><span class="k">开箱实付</span><span class="v ng">${spent} 金</span></div>`;
  h+=`<div class="ln"><span class="k">残料回收</span><span class="v ps">返还 ${refund||0} 石筹</span></div>`;
  h+=`<div class="ln tot"><span class="k">净损失</span><span class="v ng">−${spent} 金 · 得 ${refund||0} 石筹</span></div>`;
  h+=`</div>`;
  const remaining=2-(st._stonesToday||G.stonesToday);
  const quotaMsg=remaining<=0
    ?'今日开石额度已用 · 收工等明天'
    :`今日还能再开 ${remaining} 块`;
  h+=`<p class="ds" style="text-align:center;opacity:.75">${quotaMsg}</p>`;
  h+=`<div class="ac"><button class="pri" data-act="closeModal">知道了</button></div>`;
  h+=`</div>`;
  showModal(h);
  const cv2=document.getElementById("finCanvas");
  if(cv2){
    const x=cv2.getContext("2d");
    x.fillStyle="#000"; x.fillRect(0,0,260,260);
    let im=null;
    if(typeof imsrc==="string") im=imgOf(imsrc);
    else if(imsrc instanceof HTMLCanvasElement) im=imsrc;
    if(im){
      x.globalCompositeOperation="lighter";
      x.drawImage(im,10,10,240,240);
      x.globalCompositeOperation="source-over";
    }else{
      x.fillStyle="#0a0906"; x.fillRect(0,0,260,260);
      x.fillStyle="#c9ae6e"; x.textAlign="center";
      x.font='14px "Songti SC","SimSun",serif';
      x.fillText("砖头料",130,130);
    }
  }
}

/* ── 首饰工坊 ── */
function showWorkshop(){
  const j=G.jewels.find(x=>x.id===WS.jid);
  if(!j) return;
  /* 带伤不镶门禁：裸石带未修复损伤时禁止制首饰，须先上修复台 */
  if(j.dg.length){
    const dm=j.dg.map(d=>DMG[d].n).join("／");
    let h=`<h2>首饰工坊</h2><div class="sb">${GEMS[j.s.gtype].n} · 带伤不镶</div>`;
    h+=`<p class="ds">这方裸石还带着损伤：<b style="color:#b87a6e">${dm}</b>。<br>带伤的石头不配镶金 —— 先去修复台把伤修好，再来开镶。</p>`;
    h+=`<div class="ac"><button class="gh" data-act="closeModal">知道了</button></div>`;
    showModal(h);
    return;
  }
  const gemBase=(typeof itemBase==="function")?itemBase(j):0;
  let h=`<h2>首饰工坊</h2><div class="sb">${GEMS[j.s.gtype].n} · 裸石底价 ${gemBase} 金</div>`;
  h+=`<p class="ds">挑一件金属托，把刻面宝石镶成首饰。<b style="color:#c9ae6e">工价看手艺</b>：修磨镜面、全身完好才溢价；磨得糙、带伤镶嵌，镶出来可能比裸石还便宜。</p>`;
  h+=`<div class="opt">`;
  for(const k of JKS){
    const jk=JEWELS[k];
    const m=METALS[jk.metal];
    // 预估：按当前抛光与损伤算这件镶完值多少
    const sim=Object.assign({}, j, {kind:"jewel", jk:k});
    const est=(typeof itemBase==="function")?itemBase(sim):0;
    const wm=(typeof workMul==="function")?workMul(sim):1;
    const wmTag = wm>=1.15?"溢价":wm>=0.85?"持平":wm>=0.5?"瘆工":"倒贴";
    const wmCls = wm>=1.15?"ps":(wm>=0.85?"":"ng");
    h+=`<button class="${WS.jk===k?"on":""}" data-act="wsSel" data-wsel="${k}">${jk.n}
      <small><i style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${m.g};margin-right:4px"></i>${m.n} ${m.cost} 金 · 工期 ${jk.t} 时辰 · 类型基数 ×${jk.mul}</small>
      <small>工价 ×${wm.toFixed(2)}（<b class="${wmCls}">${wmTag}</b>）→ 预计售价 <b style="color:#c9ae6e">${est} 金</b>${est<gemBase?' <span style="color:#b87a6e">（比裸石还低）</span>':''}</small>
      <small>佩戴：${jk.buff.n} —— ${jk.buff.ds}</small></button>`;
  }
  h+=`</div>`;
  const jk=JEWELS[WS.jk];
  const rate=Math.round((0.50+(hasSkill("art")?0.10:0))*100);
  h+=`<p class="ds">预计成功率 <b style="color:#8fbf9f">${rate}%</b>（巧匠 +10%）· 失手会给宝石添一道崩边，直接压工价 · 成品只能走拍卖会。</p>`;
  h+=`<div class="ac"><button class="pri" data-act="wsCraft">开工镶嵌</button>
    <button class="gh" data-act="closeModal">再想想</button></div>`;
  showModal(h);
}

/* ── 石市（原「账簿」）：只有石头，且带关闭按钮 ── */
function showMarket(){
  gmFix();
  const over=!!G.dayOver;
  let h=`<h2>石 市</h2>`;
  h+=`<div class="sub" style="font-size:11px;color:var(--tx-dim);text-align:center;margin-bottom:8px;letter-spacing:1px">矿石商之摊肆 · 择一原石，依标价付资，便可启今日赌石之市</div>`;
  if(over) h+=`<p class="ds" style="text-align:center;color:#b87a6e">今日已收工，摊子歇了 —— 收摊便进第 ${G.day+1} 日。</p>`;

  // 已开出的原石：搬上台面
  const avail=G.tray.filter(s=>!s.bought);
  if(avail.length){
    for(const s of avail){
      h+=`<div class="sl" data-pick="${s.id}">
        <canvas data-thumb="${s.id}"></canvas>
        <span class="if"><span class="n">${SHELLS[s.shell].n}粗坯${s.exclusive?" · 专属":""}</span>
        <span class="d">${s.gazed?`<b style="color:#8fbf9f">${GEMS[s.gtype].n}</b> · ${s.win?"明料 · ":""}硬度 ${s.hard.toFixed(1)}`:`成色未鉴定 · ${s.win?"已开窗":"未开窗"}`}</span></span>
        <span class="pr">取</span></div>`;
    }
  }

  // 箱位：按档位付款开箱（一天只能开两块料）。异石不在此列 —— 下方专属区单售
  for(const b of BOXES){
    if(b.ex) continue;                       // 专属异石只走下方「专属」按钮
    const canG=G.gold>=b.gold, canP=G.pts>=b.pts;
    const gems="上等 · 中等 · 下等";         // 天品只由异石现形，普箱不宣传天品
    // 打烊后也按「已开石」处理：不让玩家点进去再吃一句「今日已收工」然后找不到出口
    const used=G.stonesToday>=2 || over;
    // 箱位技艺锁：晶簇箱须「察矿」，明料匣须「寻玉」
    const needSk=BOX_SKILL[b.k];
    const skOK=!needSk || hasSkill(needSk);
    const needName=needSk?(SKILLS.find(x=>x.k===needSk)||{n:needSk}).n:"";
    const okG=canG&&!used&&skOK, okP=canP&&!used&&skOK;
    h+=`<div class="bx2">
      <button class="bx" data-act="boxOpen" data-bx="${b.k}" data-pay="gold" ${okG?"":"disabled"}>
        <span class="bx-n" style="border-color:${b.shell}">${b.n}</span>
        <span class="bx-d">${skOK?`可能开出：${gems}`:`须先习得「${needName}」`}</span>
        <span class="bx-p">${used?"今日已开石":`${b.gold.toLocaleString()} 金`}</span>
      </button>
      <button class="bx bx-p2" data-act="boxOpen" data-bx="${b.k}" data-pay="pts" ${okP?"":"disabled"}>
        <span class="bx-n" style="border-color:${b.shell}">${b.n} · 石筹</span>
        <span class="bx-d">${used?"今日已开石":(skOK?"同上，改用石筹付款":`须先习得「${needName}」`)}</span>
        <span class="bx-p">${used?"明天再来":`${b.pts} 石筹`}</span>
      </button>
    </div>`;
  }
  // 专属石：石市常驻展示（充电才能解锁购买）
  h+=`<div class="ln" style="margin-top:12px"><span class="k">专属</span><span class="v">${EX_STONE.n}</span></div>`;
  {
    const canG=G.gold>=EX_STONE.gold, canP=G.pts>=EX_STONE.pts;
    const ch=typeof hasCharge==="function"?hasCharge():true;
    const locked=!ch;
    const owned=G.treasure.filter(t=>t.ex).length;
    h+=`<div class="bx2">
      <button class="bx${locked?" locked":""}" data-act="buyEx" data-pay="gold" ${canG&&!over&&!locked?"":"disabled"} title="${locked?"暂不可购买":"无"}">
        <span class="bx-n" style="border-color:${EX_STONE.shell}">${EX_STONE.n}</span>
        <span class="bx-d">深红近黑，灯下不反光；多为上等，天品现形即为龙石</span>
        <span class="bx-p">${locked?"暂不可购买":over?"今日已收工":EX_STONE.gold.toLocaleString()+" 金 · 已入藏 "+owned+" 方"}</span>
      </button>
      <button class="bx bx-p2${locked?" locked":""}" data-act="buyEx" data-pay="pts" ${canP&&!over&&!locked?"":"disabled"} title="${locked?"暂不可购买":"无"}">
        <span class="bx-n" style="border-color:${EX_STONE.shell}">${EX_STONE.n} · 石筹</span>
        <span class="bx-d">同上，改用石筹付款</span>
        <span class="bx-p">${locked?"暂不可购买":over?"明天再来":EX_STONE.pts+" 石筹"}</span>
      </button>
    </div>`;
    if(locked) h+=`<p class="ds" style="margin-top:6px;font-size:11px;color:#c9ae6e">「异石」乃专属石暂不可购买。</p>`;
    else h+=`<p class="ds" style="margin-top:6px;font-size:11px">${EX_STONE.ds}</p>`;
  }

  /* 收摊：打烊后这个按钮就是「进入第 N 日」的入口。
     旧 bug：打烊后点开石市，这里只有 data-act="closeModal"（只关窗），
     玩家被一句「今日已收工，明天再来」挡在门外，却又找不到进第二天的路。 */
  h+= over
    ? `<div class="ac"><button class="pri" data-act="next">收摊 · 进入第 ${G.day+1} 日</button></div>`
    : `<div class="ac"><button class="gh" data-act="closeModal">收 摊</button></div>`;
  showModal(h);
  // 缩略图补绘
  for(const cv2 of document.querySelectorAll("#md canvas[data-thumb]")){
    const s=G.tray.find(x=>x.id==cv2.dataset.thumb);
    if(s) thumb(cv2, SHELLS[s.shell].img);
  }
  spinExStone();
}
/* 专属石在石市内自转展示 */
let _exRAF=0;
function spinExStone(){
  if(_exRAF) cancelAnimationFrame(_exRAF);
  const cv=document.querySelector("#md canvas[data-ex]");
  if(!cv) return;
  const im=imgOf(EX_STONE.rough||EX_STONE.img);
  const loop=()=>{
    if(!document.body.contains(cv)){ _exRAF=0; return; }
    const x=cv.getContext("2d");
    x.fillStyle="#000"; x.fillRect(0,0,110,110);
    if(im){
      x.save(); x.translate(55,55); x.rotate(performance.now()/2600);
      const sc=Math.max(110/im.width,110/im.height);
      x.globalCompositeOperation="lighter";
      x.drawImage(im,-im.width*sc/2,-im.height*sc/2,im.width*sc,im.height*sc);
      x.globalCompositeOperation="source-over"; x.restore();
    }
    x.strokeStyle="#7a3a3a"; x.lineWidth=2; x.strokeRect(1,1,108,108);
    _exRAF=requestAnimationFrame(loop);
  };
  loop();
}

/* ── 瞻礼：三连 / 关注 / 充电 聚合入口 ── */
function showRite(){ showModal(`<h2>玉石馆</h2><p class="ds">专属石已开放，祝你开出好料。</p><div class="ac"><button class="gh" data-act="closeModal">合 掌</button></div>`); }

/* ── 排行榜：单弹窗 + 两个 tab 小按钮切换（累计收益 / 单件最高成交价）── */
function showRank(){
  let h=`<h2>排行榜</h2>`;
  h+=`<div class="lb-tabs">
        <button class="lb-tab active" data-lbtab="score">累计收益</button>
        <button class="lb-tab" data-lbtab="val">单件最高价</button>
      </div>`;
  if(TOY_API.web){
    h+=`<div class="rw"><span class="k">本榜</span><span class="v">记录游戏成绩</span></div>`;
    h+=`<div class="rw" style="align-items:center"><span class="k">署名</span><span class="v">
        <input id="lbNick" maxlength="10" value="${(typeof webNick==="function"?webNick():"工匠").replace(/"/g,"&quot;")}"
          style="background:#1a1f1a;border:1px solid #3a4238;color:#e8d5a3;border-radius:6px;padding:4px 8px;font:inherit;font-size:13px;width:120px">
        <button class="gh" data-act="setNick" style="margin-left:6px">改名</button></span></div>`;
  }
  h+=`<div id="mdLb" class="lb-pane"><div class="rw" style="display:block;padding:14px 8px;text-align:center;color:var(--tx-dim);font-size:12px">正在取榜…</div></div>`;
  h+=`<div class="ac"><button class="gh" data-act="closeModal">合上榜单</button></div>`;
  showModal(h);
  const tabs=document.querySelectorAll(".lb-tab");
  tabs.forEach(btn=>{
    btn.addEventListener("click",()=>{
      if(btn.classList.contains("active")) return;
      tabs.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      loadRankBoard(btn.getAttribute("data-lbtab"));
    });
  });
  loadRankBoard("score");   // 默认开累计收益榜
}
/* 榜单缓存保鲜窗口：窗口内直接渲染缓存，过期或首次才发 RPC。
   配合 toyapi.js 的后台热拉（启动 + 每次上报后），玩家不打开弹窗也能保持榜单新鲜。*/
const LB_CACHE_TTL=30000;   // 30s
/* tab 切换：缓存新鲜则直接渲染，否则发 RPC 重新拉取——既避免永远停在旧缓存，也避免每次打开都打榜额度 */
function loadRankBoard(which){
  const target=document.getElementById("mdLb");
  if(!target) return;
  const board=(which==="val")?LB_BOARD_VAL:LB_BOARD;
  const titles=(which==="val")?LB_TITLES_VAL:LB_TITLES;
  const age = (TOY_API.lbFetchedAt && TOY_API.lbFetchedAt[board])
            ? (Date.now() - TOY_API.lbFetchedAt[board]) : Infinity;
  if(TOY_API.lbCache && Object.prototype.hasOwnProperty.call(TOY_API.lbCache, board) && age < LB_CACHE_TTL){
    renderLeaderboard(target, board, titles);
  }else{
    loadLeaderboard(target, board, titles);
  }
}

/* 藏珍佳石统计：只统计非赌坊的佳石，按档位中文名归并上等 / 天品 */
function treasureStats(){
  const exT=G.treasure.filter(t=>t.src!=="gamble");
  return {
    total: exT.length,
    high:  exT.filter(t=>t.gn==="上等").length,
    rare:  exT.filter(t=>t.gn==="天品").length
  };
}
/* ── 藏珍：图鉴式记录开过的好石头 + 赌坊产物 + 已得天赐陈列 ──
   2026-10-16 调整：
    ① 未获得的天赐不再以灰色剪影占位，直接不显示
    ② 取消独立的「赌藏」柜 —— 赌坊里选「计入藏珍」的产物并回 G.treasure 主柜，
       带 src:"gamble" 标记，与佳石同网格陈列 */
function showCabinet(){
  let h=`<h2>藏 珍</h2><div class="sb">图鉴 · 记你亲手开出来的好石头</div>`;

  /* ── 天赐陈列区：只列已得（未得不显示） ── */
  const ownedG=GIFTS.filter(g=>G.gifts.some(x=>x.k===g.k));
  if(ownedG.length){
    h+=`<div class="sec"><h3>天 赐</h3>`;
    h+=`<div class="rw"><span class="k">收藏</span><span class="v">${G.gifts.length} / ${GIFTS.length} 件 · 全店售价 +${Math.round(giftBonus()*100-100)}%</span></div>`;
    h+=`<div class="gf-grid">`;
    for(const g of ownedG){
      h+=`<div class="gf-cell got">
        <canvas data-gf2="${g.k}" width="120" height="120"></canvas>
        <div class="gf-n">${g.n}</div>
        <div class="gf-m">全店售价 +${g.bonus}%</div>
        <div class="gf-ds">${g.ds}</div>
      </div>`;
    }
    h+=`</div></div>`;
  }

  /* ── 佳石 + 赌坊产物：同一个柜子 ── */
  const gmT=G.treasure.filter(t=>t.src==="gamble");
  const exT=G.treasure.filter(t=>t.src!=="gamble");
  if(!G.treasure.length){
    h+=`<div class="tc-empty">藏珍之柜空空如也</div>`;
    h+=`<div style="text-align:center"><button class="gh" data-act="closeModal">合上柜门</button></div>`;
    showModal(h);
    drawGiftCells();
    return;
  }
  if(exT.length){
    const ts=treasureStats();
    h+=`<p class="ds" style="text-align:center">佳石共 ${ts.total} 方 · 上等 ${ts.high} 方 · 天品 ${ts.rare} 方</p>`;
  }
  if(gmT.length){
    h+=`<p class="ds" style="text-align:center">赌坊入藏 ${gmT.length} 方 · 全店售价 +${gmVaultBonus().toFixed(1)}%（上限 +${VAULT_CAP}%）</p>`;
  }
  h+=`<div class="tc-grid">`;
  for(const t of G.treasure){
    if(t.src==="gamble"){
      const x=PU_PROD.find(y=>y.k===t.g); if(!x) continue;
      const from=PU.find(p=>p.k===t.from);
      h+=`<div class="tc-cell gm">
        <div class="tc-img"><img src="${x.img}" alt="${x.n}"></div>
        <div class="tc-n">${x.n}</div>
        <div class="tc-m">${x.tier} · 售价 +${x.bo}%<br>第 ${t.day} 天 · ${from?from.n:""}</div>
      </div>`;
      continue;
    }
    const g=GEMS[t.g];
    if(!g) continue;
    h+=`<div class="tc-cell${t.ex?" ex":""}">
      <canvas data-tc2="${t.g}" width="150" height="150"></canvas>
      <div class="tc-n">★${g.n}${t.ex?" · 专属":""}</div>
      <div class="tc-m">${t.gn} · 底价 ${t.v} 金<br>第 ${t.day} 天</div>
    </div>`;
  }
  h+=`</div>`;
  h+=`<div class="ac"><button class="gh" data-act="closeModal">合上柜门</button></div>`;
  showModal(h);
  drawGiftCells();
  // 立绘补绘
  for(const cv2 of document.querySelectorAll("#md canvas[data-tc2]")){
    const g=GEMS[cv2.dataset.tc2];
    if(!g) continue;
    const x=cv2.getContext("2d");
    const im=imgOf(g.img);
    if(im){
      x.fillStyle="#000"; x.fillRect(0,0,150,150);
      x.globalCompositeOperation="lighter";
      const sc=Math.max(150/im.width,150/im.height);
      x.drawImage(im,(150-im.width*sc)/2,(150-im.height*sc)/2,im.width*sc,im.height*sc);
      x.globalCompositeOperation="source-over";
    }
  }
}

/* 天赐立绘：未得画暗色剪影占位，得手后画实图。
   与 showGift 一致用 source-over —— 天赐素材偏暗，lighter 会画成黑块。 */
function giftThumb(cv2,g){
  const x=cv2.getContext("2d");
  const got=G.gifts.some(y=>y.k===g.k);
  const im=imgOf(g.img);
  const sz=cv2.width||48;
  x.globalCompositeOperation="source-over";
  x.clearRect(0,0,sz,sz);
  if(!im) return;
  const sc=Math.max(sz/im.width,sz/im.height);
  if(got){
    x.drawImage(im,(sz-im.width*sc)/2,(sz-im.height*sc)/2,im.width*sc,im.height*sc);
  }else{
    x.globalAlpha=0.22;
    x.drawImage(im,(sz-im.width*sc)/2,(sz-im.height*sc)/2,im.width*sc,im.height*sc);
    x.globalAlpha=1;
  }
}
function drawGiftCells(){
  for(const cv2 of document.querySelectorAll("#md canvas[data-gf2]")){
    const g=GIFTS.find(x=>x.k===cv2.dataset.gf2);
    if(!g) continue;
    const x=cv2.getContext("2d");
    const got=G.gifts.some(y=>y.k===g.k);
    const im=imgOf(g.img);
    x.globalCompositeOperation="source-over";
    x.fillStyle="#14100b"; x.fillRect(0,0,120,120);
    if(!im){
      x.fillStyle="#6b6152"; x.font='12px "Songti SC",serif'; x.textAlign="center";
      x.fillText("？",60,64);
      continue;
    }
    const sc=Math.max(120/im.width,120/im.height);
    if(got){
      x.drawImage(im,(120-im.width*sc)/2,(120-im.height*sc)/2,im.width*sc,im.height*sc);
    }else{
      /* 未得：压暗剪影，轮廓可辨而细节不显 */
      x.globalAlpha=0.22;
      x.drawImage(im,(120-im.width*sc)/2,(120-im.height*sc)/2,im.width*sc,im.height*sc);
      x.globalAlpha=1;
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   赌 坊 · 界面层
   ══════════════════════════════════════════════════════════════ */

/* ── 入场确认：是否花费 10 声望购票入场（票价按当日累计递增，次日回到 10）── */
function showGambleAsk(){
  gmFix();
  const price=gmTicketPrice();
  const afford=G.rep>=price;
  let h=`<h2>赌 坊</h2><div class="sb">一刀下去 · 皮壳裂开 · 不鉴定 · 不反悔</div>`;
  h+=`<div class="gm-ask">
    <div class="gm-ask-p">是否花费 <b>${price}</b> 声望购票入场？</div>
    <div class="gm-ask-s">当前声望 ${G.rep} · 今日已购 ${G.gamble.ticketsDay||0} 张 · 次日票价重置为 ${TICKET_BASE} 声望 · 不限次数</div>
  </div>`;
  h+=`<div class="ac">
    <button class="gh" data-act="closeModal">离 开</button>
    <button class="pri" data-act="gmTicketGo" ${afford?"":"disabled"}>${afford?"入 场":"声望不足"}</button>
  </div>`;
  showModal(h);
}

/* 赎铺进度条：打烊页常驻（赌坊页不再展示） */
function gmFundHTML(){
  if(gmShopOwned()){
    return `<div class="gm-own"><b>玉契 · ${SHOP_NAME}承购</b>
      <div class="gm-own-l">已落定 · 此后不必再缴租</div></div>`;
  }
  const pct=gmShopPct(), f=gmFunded();
  let btns="";
  for(const t of FUND_TIERS){
    btns+=`<button class="gh gm-fund" data-act="gmFund" data-amt="${t}" ${G.gold<t?"disabled":""}>存入 ${t.toLocaleString()} 金</button>`;
  }
  return `<div class="gm-fund">
    <div class="gm-fund-h"><b>玉契 · ${SHOP_NAME}承购</b><span>${Math.floor(pct*10)/10}%</span></div>
    <div class="gm-bar"><i style="width:${pct}%"></i></div>
    <div class="gm-fund-n">已存 ${f.toLocaleString()} / ${SHOP_GOAL.toLocaleString()} 金（存入不可取回）</div>
    <div class="gm-fund-b">${btns}</div>
    <div class="gm-fund-q">「积金置铺，契卷为凭。待款项圆满，铺面归君手。」</div>
  </div>`;
}

/* ── 赌坊主面板 ── */
function showGamble(){
  gmFix();
  const price=gmTicketPrice();
  let h=`<h2>赌坊</h2><div class="sb">一刀下去 · 皮壳裂开 · 不鉴定 · 不反悔</div>`;
  /* 未购当日门票：只给入场门槛提示，不展示货架（门票逻辑已移至「入场确认」弹窗）
     注意用 ticketsDay 而不是 tickets：票价按日重置后，每日都需重新购票入场 */
  if((G.gamble.ticketsDay||0)<=0){
    h+=`<div class="gm-tk">
    <div class="gm-tk-l">
      <div class="gm-tk-p">门票 <b>${price}</b> 声望</div>
      <div class="gm-tk-s">今日未购票 · 次日票价重置为 ${TICKET_BASE} 声望 · 不限次数</div>
    </div>
    <button class="pri gm-tk-b" data-act="gmTicket" ${G.rep<price?"disabled":""}>
      ${G.rep<price?`声望不足（${G.rep}/${price}）`:"购票入场"}
    </button>
  </div>`;
    h+=`<div class="ac"><button class="gh" data-act="closeModal">离开赌坊</button></div>`;
    showModal(h);
    return;
  }
  /* 已持当日票：直接展示石架。
     旧 bug：这里写的是 if(G.rep>=price) —— 买票后声望已扣、且票价按累计票数又涨了，
     于是 rep < 新票价，石架不显示，玩家以为没进去成功，再点一次又买一张票。
     门票已经是「持票即可入场」，不该再用声望二次校验。
     现按「当日票」判定：票价每日重置，所以每天都要重新买票才能进场。 */
  {
    const canG=G.gold>=PU_PRICE, canP=G.pts>=PU_PRICE_PTS;
    h+=`<div class="gm-shelf-h">石 架 <span>一方 ${PU_PRICE.toLocaleString()} 金 或 ${PU_PRICE_PTS} 石筹 · 四璞同价 · 皮壳之下不可窥</span></div>`;
    h+=`<div class="gm-grid">`;
    for(const p of PU){
      h+=`<div class="gm-card" style="--pc:${p.c}">
        <div class="gm-card-img"><img src="${p.img}" alt="${p.n}"></div>
        <div class="gm-card-n">${p.n}</div>
        <div class="gm-card-d">${p.ds}</div>
        <div class="gm-pay">
          <button class="gh gm-card-b" data-act="gmBuy" data-pu="${p.k}" data-pay="gold" ${canG?"":"disabled"}>
            ${canG?`买定离手 · ${PU_PRICE.toLocaleString()} 金`:"金币不足"}
          </button>
          <button class="gh gm-card-b" data-act="gmBuy" data-pu="${p.k}" data-pay="pts" ${canP?"":"disabled"}>
            ${canP?`买定离手 · ${PU_PRICE_PTS} 石筹`:"石筹不足"}
          </button>
        </div>
      </div>`;
    }
    h+=`</div>`;
    h+=`<p class="ds gm-warn">皮壳只作遮掩。买下方不可退，鉴定与瞻礼在此一律失效 —— 里头是什么，全看这一刀。</p>`;
  }
  h+=`<div class="gm-stat">
    <div class="ln"><span class="k">已开璞</span><span class="v">${G.gamble.stats.open} 方</span></div>
    <div class="ln"><span class="k">其中砖头料</span><span class="v ng">${G.gamble.stats.wuzhan} 方</span></div>
    <div class="ln"><span class="k">赌石投入</span><span class="v ng">−${G.gamble.stats.spent.toLocaleString()} 金</span></div>
    <div class="ln"><span class="k">赌石回收</span><span class="v ps">+${G.gamble.stats.got.toLocaleString()} 金</span></div>
    <div class="ln tot"><span class="k">赌坊净损益</span><span class="v ${G.gamble.stats.got-G.gamble.stats.spent>=0?"ps":"ng"}">${G.gamble.stats.got-G.gamble.stats.spent>=0?"+":""}${(G.gamble.stats.got-G.gamble.stats.spent).toLocaleString()} 金</span></div>
  </div>`;
  /* 赌坊产物已并入藏珍主柜，此处只作汇总跳转，不再单设「赌藏」柜 */
  const gmT=G.treasure.filter(t=>t.src==="gamble");
  if(gmT.length){
    h+=`<div class="gm-vault-h">已入藏珍 <span>${gmT.length} 方 · 全店售价 +${gmVaultBonus().toFixed(1)}%（上限 +${VAULT_CAP}%）</span></div>`;
    h+=`<div class="gm-vault">`;
    for(const v of gmT.slice(0,12)){
      const x=PU_PROD.find(y=>y.k===v.g); if(!x) continue;
      const from=PU.find(p=>p.k===v.from);
      h+=`<div class="gm-vcell">
        <img src="${x.img}" alt="${x.n}">
        <div class="gm-vn">${x.n}</div>
        <div class="gm-vm">+${x.bo}% · 第${v.day}天<br>${from?from.n:""}</div>
      </div>`;
    }
    h+=`</div>`;
    if(gmT.length>12) h+=`<p class="ds" style="text-align:center">…… 另有 ${gmT.length-12} 方</p>`;
  }
  h+=`<div class="ac"><button class="gh" data-act="openCabinet">翻看藏珍</button>
    <button class="gh" data-act="closeModal">离开赌坊</button></div>`;
  showModal(h);
}

/* ── 开璞结果：回收 / 计入藏珍二选一 ── */
function showPuResult(res){
  if(!res) { showGamble(); return; }
  G._gmCur=res;                // 当前待结算对象：回收/入藏按钮只认它
  const pu=res.pu, x=res.prod;
  const keepable=x.bo>0;
  const before=gmVaultBonus();
  const after=Math.min(VAULT_CAP, before+x.bo);
  let h=`<h2>${pu.n} · ${pu.ds}</h2><div class="sb">一刀下去，皮壳裂开。</div>`;
  h+=`<div class="gm-res">
    <div class="gm-res-tag gm-res-${x.tier?("t"+encodeURIComponent(x.tier)):"t0"}">${x.tier?x.tier:"血本无归"}</div>
    <img class="gm-res-img" src="${x.img}" alt="${x.n}">
    <div class="gm-res-n">${x.n}</div>
    <div class="gm-res-d">${x.ds}</div>
  </div>`;
  h+=`<div class="gm-res-p">
    <div class="ln"><span class="k">投入</span><span class="v ng">−${PU_PRICE.toLocaleString()} 金</span></div>
    <div class="ln"><span class="k">回收价</span><span class="v ${x.rec>0?"ps":"ng"}">${x.rec>0?x.rec.toLocaleString()+" 金":"0 金"}</span></div>
    <div class="ln tot"><span class="k">本刀损益</span><span class="v ${(x.rec-PU_PRICE)>=0?"ps":"ng"}">${(x.rec-PU_PRICE)>=0?"+":""}${(x.rec-PU_PRICE).toLocaleString()} 金</span></div>
  </div>`;
  if(keepable){
    h+=`<div class="ac">
      <button class="pri" data-act="gmRecycle" data-pu="${res.from}">回收 ${x.rec.toLocaleString()} 金</button>
      <button class="gh" data-act="gmVault" data-pu="${res.from}">计入藏珍 +${x.bo}%</button>
    </div>`;
    h+=`<p class="ds gm-choose">回收落袋为安，或留作藏珍换取全局售价加成（+${x.bo}%，赌坊总加成将至 +${after.toFixed(1)}%）。二者只能择一。</p>`;
  }else{
    h+=`<div class="ac"><button class="pri" data-act="gmRecycle" data-pu="${res.from}">认 赔</button>
      <button class="gh" disabled>此物不堪入藏</button></div>`;
    h+=`<p class="ds" style="text-align:center">二十万金，换一包灰渣。这就是赌坊。</p>`;
  }
  showModal(h);
}

/* ── 结局弹窗：买下玉石铺 ── */
function showShopFinale(){
  gmFix();
  const t=G.gamble.stats;
  const byS=t.byS||{};
  const byP=t.byProd||{};
  const g=k=>(byP[k]|0);
  const jiJade=g("lingjin")+g("yanyu")+g("feiheng");
  const gx=g("jiangli")+g("bixiao")+g("changyao");
  const jue=g("chencai")+g("danyao")+g("yueli");
  let h=`<div class="gm-end">
    <div class="gm-end-t">璞 契 落 定</div>
    <div class="gm-end-d">第<span class="gm-end-n">${G.day}</span> 天</div>
    <div class="gm-end-b">
      <p>账上最后一笔金币押进印契里。</p>
      <p>契卷落案，笔墨封约。</p>
      <p>此间铺舍，自此归你执掌。</p>
      <p>门庭改换，基业新承。</p>
      <p class="gm-end-q">「一刀穷，一刀富。<br>石头定枯荣，君择玉成。」</p>
    </div>
    <div class="gm-end-s">
      <div class="ln"><span class="k">开璞</span><span class="v">${t.open} 方</span></div>
      <div class="ln"><span class="k">墨璞 / 岚璞 / 瑶璞 / 苔璞</span><span class="v">${(byS.mo|0)} / ${(byS.lan|0)} / ${(byS.yao|0)} / ${(byS.tai|0)} 方</span></div>
      <div class="ln"><span class="k">泠瑾 / 烟瑜 / 绯珩</span><span class="v">${g("lingjin")} / ${g("yanyu")} / ${g("feiheng")} 方</span></div>
      <div class="ln"><span class="k">绛璃 / 碧绡 / 菖瑶</span><span class="v">${g("jiangli")} / ${g("bixiao")} / ${g("changyao")} 方</span></div>
      <div class="ln"><span class="k">宸翠 / 丹瑶 / 月璃</span><span class="v ${jue>0?"ps":""}">${g("chencai")} / ${g("danyao")} / ${g("yueli")} 方</span></div>
      <div class="ln"><span class="k">赌藏总加成</span><span class="v">+${gmVaultBonus().toFixed(1)}%</span></div>
      <div class="ln tot"><span class="k">最终身家</span><span class="v">${SHOP_GOAL.toLocaleString()} 金</span></div>
    </div>`;
  /* 数据变体句：按开璞数与绝品数替换 */
  if(t.open<50) h+=`<p class="gm-end-v">你几乎没怎么下刀。这铺子是拿时间换的，不是拿命换的。</p>`;
  else if(jue===0) h+=`<p class="gm-end-v">你没开出过传世绝品。签纸的手一直在抖，你不知道自己在赌什么。</p>`;
  else if(jue>=3) h+=`<p class="gm-end-v">${jue} 方传世绝品。这铺子是你自己赢下来的。</p>`;
  else h+=`<p class="gm-end-v">好货见过，底也押过。这一刀，你没白下。</p>`;
  h+=`<div class="ac"><button class="pri" data-act="gmCloseEnd">继续经营</button></div>
  </div>`;
  showModal(h);
}

/* ── 技艺：每项都写明实际生效的机制 ── */
function showSkills(){
  let h=`<h2>技 艺</h2><div class="sb">考取需耗费声望与学费 · 一次考取终身受用</div>`;
  for(const sk of SKILLS){
    const done=hasSkill(sk.k);
    const lock=G.rep<sk.req;
    h+=`<div class="sk ${done?"done":""}">
      <span class="nm">${sk.n}${sk.unlock?`<em style="color:#c9ae6e;font-style:normal"> · 解锁${sk.unlock}</em>`:""}<small>${sk.ds}</small></span>
      ${done?`<span class="ok">已考取</span>`
        :`<span class="cost">耗声誉 ${sk.req} · 学费 ${sk.cost} 金</span>
          <button class="gh" data-sk="${sk.k}" ${lock?"disabled style='opacity:.4'":""}>考取</button>`}
    </div>`;
  }
  // 开料方式：由已学技艺自动决定
  const cw=(typeof curCut==="function")?curCut():null;
  h+=`<div class="ln" style="margin-top:10px"><span class="k">开料</span><span class="v">${cw?cw.n+"（成功率 +"+Math.round(cw.add*100)+"%）":"—"}</span></div>`;
  h+=`<p class="ds" style="text-align:center;margin-top:6px">「利刃」解锁线割（+5%）·「稳手」解锁震解（+8%）。震解更高级，两样都学会则用震解。</p>`;
  h+=`<div class="ac"><button class="gh" data-act="closeModal">合上册子</button></div>`;
  showModal(h);
}

/* ── 天赐入手提示（立绘 + 名称 + 加成），同时正式存入藏珍 ── */
function showGift(g){
  showModal(`<h2>天 赐</h2><div class="sb">异像石中，间或剥离出非此世之物</div>
  <div class="gf-pop"><canvas data-gfp="${g.k}" width="200" height="200"></canvas>
    <span class="nm">${g.n}</span><small>${g.ds}</small>
    <span class="bn">全店售价 +${g.bonus}%</span></div>
  <p class="ds">你把它收进了藏珍 —— 往后全店的货都跟着涨价。</p>
  <div class="ac"><button class="gh" data-act="closeModal">合上柜门</button></div>`);
  const cv=document.querySelector("#md canvas[data-gfp]");
  if(cv){
    const x=cv.getContext("2d");
    x.fillStyle="#14100b"; x.fillRect(0,0,200,200);
    const im=imgOf(g.img);
    if(im){
      /* 用 source-over 直接贴，不用 lighter。
         天赐素材本身偏暗（实测平均亮度 24~40），lighter 叠在深色弹窗底上
         等于「什么都没加」，画出来就是一块黑 —— 这正是原先看到的黑方块。
         source-over 直接呈现原图，不论明暗都看得见。 */
      x.globalCompositeOperation="source-over";
      const sc=Math.max(200/im.width,200/im.height);
      x.drawImage(im,(200-im.width*sc)/2,(200-im.height*sc)/2,im.width*sc,im.height*sc);
      /* 底部压一层暖色渐变，让立绘与深色弹窗底自然衔接 */
      const gr=x.createLinearGradient(0,140,0,200);
      gr.addColorStop(0,"rgba(11,9,8,0)");
      gr.addColorStop(1,"rgba(11,9,8,.85)");
      x.fillStyle=gr; x.fillRect(0,140,200,60);
    }else{
      /* 素材未就绪：画个占位符而不是纯黑方块 */
      x.globalCompositeOperation="source-over";
      x.fillStyle="#e8d5a3"; x.font='15px "Songti SC",serif'; x.textAlign="center";
      x.fillText(g.n,100,108);
    }
  }
}

/* ── toast ── */
let toastTimer=null;
function say(m,bad,kind){
  const el=document.getElementById("ts");
  // toast 锚点由 drawTools() 在工具栏重建后统一刷新（此处量到的可能是旧高度）
  el.textContent=m;
  el.className="on"+(kind?(" "+kind):(bad?" bad":""));
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{ el.className=""; },2400);
}

/* ── 测试探针暴露 ── */
window.showCabinet=showCabinet;
window.showMarket=showMarket;
window.showGamble=showGamble;
window.showPuResult=showPuResult;
window.showDayEnd=showDayEnd;
window.resumeDayEnd=resumeDayEnd;
