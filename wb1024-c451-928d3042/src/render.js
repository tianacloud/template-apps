"use strict";
/* ══════════ 渲染层（AI 实拍素材合成版） ══════════
   所有素材为纯黑背景生成图，游戏内以 lighter（加法）混合叠加，
   黑色加零、无痕融进场景 —— 免抠图、边缘自然。
*/
const cv=document.getElementById("cv");
const cx=cv.getContext("2d");
let CW=0, CH=0, DPR=1;

const P={
  ink:"#d8c48f", tx:"#bfb49a", dim:"#7d7460", faint:"#4a453c",
  gold:"#c9ae6e", bad:"#b87a6e", good:"#8fbf9f"
};

/* ── 素材预加载（带进度上报，驱动加载遮罩） ── */
const IMG={map:{}, left:0, total:0, loaded:0, ready:false};
/* ── 素材级曝光修正（2026-10-14 已废） ──
   旧代码在此对 4 张过曝白底图做乘法压光。根因是那批「材质分级」立绘
   （cluster_/cut_ 的 _high/_flower/_waste）本是白底产品图，与 lighter
   加法混合不兼容，叠上台面就是一团白光/大白方块。现已全部用 agent
   生图模型重生为纯黑底（key 走 Agnes，未消耗内置积分），EXPOSURE_FIX
   乘法压光会把这些黑底图压得过暗，故整体移除；载入时不再做任何压光。 */
function _ldTick(){
  IMG.loaded++;
  const pct=IMG.total?Math.min(100,Math.round(IMG.loaded/IMG.total*100)):100;
  const f=document.getElementById("ldF"), p=document.getElementById("ldP");
  if(f) f.style.width=pct+"%";
  if(p) p.textContent=pct+"%";
  if(IMG.loaded>=IMG.total){
    IMG.ready=true;
    const ld=document.getElementById("ld");
    if(ld){ ld.classList.add("off"); setTimeout(()=>{ if(ld.parentNode) ld.parentNode.removeChild(ld); },600); }
  }
}
function loadAssets(done){
  const list=[IMG_TABLE, IMG_TABLE_WORK, IMG_ANOMALY, IMG_WASTE];
  for(const sh of SHELLS) list.push(sh.img);
  for(const k of GK){
    list.push(GEMS[k].img); list.push(GEMS[k].cutimg);
    if(WINDOWS[k]) list.push(WINDOWS[k]);
  }
  for(const k of GK) if(ROUGH[k]) list.push(ROUGH[k]);   // 粗坯立绘（开箱弹窗用）
  for(const k in DMGIMG) for(const d in DMGIMG[k]) list.push(DMGIMG[k][d]);
  for(const k in CUTDMG) for(const d in CUTDMG[k]) list.push(CUTDMG[k][d]);
  // 工序状态立绘（剥落/切割/打磨 × 全石种）
  for(const k in WORK_ASSETS) for(const ph in WORK_ASSETS[k]) list.push(WORK_ASSETS[k][ph]);
  // 材质分级立绘（按石种×等级）
  for(const gk of GK){
    if(gk==="obsidian") continue;
    const ga=GRADE_ASSETS[gk];
    if(!ga) continue;
    for(const gk2 of [GRADE_WASTE, GRADE_FLOWER, GRADE_HIGH]){
      const a=ga[gk2];
      if(a.img) list.push(a.img);
      if(a.cutimg) list.push(a.cutimg);
      if(a.ring) list.push(a.ring);
      if(a.pendant) list.push(a.pendant);
      if(a.earring) list.push(a.earring);
    }
  }
  /* 天赐立绘：4 张。原先漏加载，导致 showGift / 藏珍面板只画出纯黑方块 */
  for(const g of GIFTS) list.push(g.img);
  /* 赌坊立绘：4 张石璞 + 10 档产物（砖头料已在 IMG_WASTE 里）*/
  for(const p of PU) list.push(p.img);
  for(const x of PU_PROD) if(x.k!=="wuzhan") list.push(x.img);
  IMG.total=list.length; IMG.loaded=0; IMG.left=list.length;
  if(!IMG.total){ _ldTick(); done(); return; }
  for(const src of list){
    const im=new Image();
    im.onload=()=>{ IMG.map[src]=im; if(--IMG.left>=0) _ldTick(); if(IMG.loaded>=IMG.total) done(); };
    im.onerror=()=>{ console.warn("asset fail",src); if(--IMG.left>=0) _ldTick(); if(IMG.loaded>=IMG.total) done(); };
    im.src=src;
  }
}
function imgOf(src){ return IMG.map[src]; }

/* ══════════ 程序化首饰立绘：金属戒托/吊链/耳钩 + 中央宝石 ══════════
   资料库72张首饰图均为裸石无金属托，需在此处程序化合成 */
const JEWEL_CACHE={};
function genJewelImg(gk,jk,grade,seed){
  const key=gk+"_"+jk+"_"+grade+"_"+seed;
  if(JEWEL_CACHE[key]) return JEWEL_CACHE[key];
  const S=260;
  const oc=document.createElement("canvas"); oc.width=S; oc.height=S;
  const x=oc.getContext("2d");
  const gem=GEMS[gk];
  const gc=gem.c, gc2=gem.c2, ch=gem.ch;   // ch 漏定义过：宝石高光色，缺了会在素材未加载时抛 ReferenceError
  // 金属色调按首饰类型区分：银托偏冷白，金托偏暖黄
  const isGold=(jk==="earring"); // earring=鎏金，其余银
  const mg=isGold?"#d4a84b":"#c0c4ca";
  const md=isGold?"#8a6920":"#7a7e84";
  const mh=isGold?"#f5e6b8":"#e8ecf0";
  // 背景：纯黑
  x.fillStyle="#000"; x.fillRect(0,0,S,S);
  const cx=S/2, cy=jk==="pendant"?S*0.48:S*0.58;
  const bw=S*0.38; // 宝石宽度
  // ── 绘制金属托 ──
  x.save();
  if(jk==="ring"){
    // 戒指：C形戒圈 + 顶部镶口
    const ringY=cy+bw*0.35;
    x.strokeStyle=md; x.lineWidth=bw*0.18; x.lineCap="round";
    x.beginPath(); x.arc(cx,ringY,bw*0.48,Math.PI*1.15,Math.PI*1.85); x.stroke();
    x.strokeStyle=mg; x.lineWidth=bw*0.16;
    x.beginPath(); x.arc(cx,ringY,bw*0.48,Math.PI*1.15,Math.PI*1.85); x.stroke();
    // 镶口底座
    x.fillStyle=mg;
    x.beginPath(); x.ellipse(cx,cy+bw*0.12,bw*0.22,bw*0.08,0,0,TAU); x.fill();
    x.strokeStyle=md; x.lineWidth=1.2; x.stroke();
    // 镶口四爪
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+0.2;
      x.fillStyle=mg;
      x.beginPath();
      x.ellipse(cx+Math.cos(a)*bw*0.12,cy-bw*0.05+Math.sin(a)*bw*0.06,3,5,a,0,TAU);
      x.fill();
    }
  }else if(jk==="pendant"){
    // 吊坠：细链 + 圆形挂环 + 吊坠托
    x.strokeStyle=mg; x.lineWidth=2.5;
    x.beginPath(); x.arc(cx,S*0.08,12,0,Math.PI); x.stroke();
    x.strokeStyle=md; x.lineWidth=1.5;
    x.beginPath(); x.arc(cx,S*0.08,12,0,Math.PI); x.stroke();
    // 挂环
    x.fillStyle=mg;
    x.beginPath(); x.arc(cx,cy-bw*0.38,6,0,TAU); x.fill();
    x.strokeStyle=md; x.lineWidth=1; x.stroke();
    // 吊坠托（椭圆形包边）
    x.fillStyle=mg;
    x.beginPath(); x.ellipse(cx,cy+bw*0.15,bw*0.24,bw*0.10,0,0,TAU); x.fill();
    x.strokeStyle=md; x.lineWidth=1.5; x.stroke();
  }else if(jk==="earring"){
    // 耳环：耳针 + 下垂链 + 双宝石（左右各一，这里画一个主图）
    x.strokeStyle=mg; x.lineWidth=2;
    x.beginPath(); x.moveTo(cx-S*0.15,S*0.06); x.lineTo(cx+S*0.15,S*0.06); x.stroke();
    x.strokeStyle=md; x.lineWidth=1;
    x.beginPath(); x.moveTo(cx-S*0.15,S*0.06); x.lineTo(cx+S*0.15,S*0.06); x.stroke();
    // 左链
    x.strokeStyle=mg; x.lineWidth=2;
    x.beginPath(); x.moveTo(cx-bw*0.25,cy-bw*0.35); x.quadraticCurveTo(cx-bw*0.35,cy-bw*0.1,cx-bw*0.2,cy); x.stroke();
    // 右链
    x.beginPath(); x.moveTo(cx+bw*0.25,cy-bw*0.35); x.quadraticCurveTo(cx+bw*0.35,cy-bw*0.1,cx+bw*0.2,cy); x.stroke();
    // 主宝石托
    x.fillStyle=mg;
    x.beginPath(); x.ellipse(cx,cy+bw*0.12,bw*0.22,bw*0.08,0,0,TAU); x.fill();
    x.strokeStyle=md; x.lineWidth=1.2; x.stroke();
  }
  x.restore();
  // ── 绘制宝石（渐变填充 + 高光）──
  x.save();
  if(jk==="ring"){
    // 蛋面/枕形宝石
    const gy=cy-bw*0.02;
    const grad=x.createRadialGradient(cx-bw*0.15,gy-bw*0.15,bw*0.02,cx,gy,bw*0.42);
    grad.addColorStop(0,gc2); grad.addColorStop(0.5,gc); grad.addColorStop(1,md);
    x.fillStyle=grad;
    x.beginPath();
    x.ellipse(cx,gy,bw*0.38,bw*0.28,0,0,TAU);
    x.fill();
    // 高光
    x.globalAlpha=0.45;
    x.fillStyle=ch;
    x.beginPath(); x.ellipse(cx-bw*0.12,gy-bw*0.1,bw*0.08,bw*0.05,-0.3,0,TAU); x.fill();
  }else if(jk==="pendant"){
    // 圆形蛋面
    const gy=cy+bw*0.05;
    const grad=x.createRadialGradient(cx-bw*0.12,gy-bw*0.12,bw*0.02,cx,gy,bw*0.32);
    grad.addColorStop(0,gc2); grad.addColorStop(0.5,gc); grad.addColorStop(1,md);
    x.fillStyle=grad;
    x.beginPath(); x.arc(cx,gy,bw*0.30,0,TAU); x.fill();
    x.globalAlpha=0.45;
    x.fillStyle=ch;
    x.beginPath(); x.arc(cx-bw*0.09,gy-bw*0.09,bw*0.06,0,TAU); x.fill();
  }else if(jk==="earring"){
    // 蛋面（对称双宝石中的一颗作为代表）
    const gy=cy+bw*0.05;
    const grad=x.createRadialGradient(cx-bw*0.12,gy-bw*0.12,bw*0.02,cx,gy,bw*0.32);
    grad.addColorStop(0,gc2); grad.addColorStop(0.5,gc); grad.addColorStop(1,md);
    x.fillStyle=grad;
    x.beginPath(); x.ellipse(cx,gy,bw*0.28,bw*0.34,0,0,TAU); x.fill();
    x.globalAlpha=0.45;
    x.fillStyle=ch;
    x.beginPath(); x.ellipse(cx-bw*0.08,gy-bw*0.1,bw*0.06,bw*0.04,-0.3,0,TAU); x.fill();
  }
  x.restore();
  JEWEL_CACHE[key]=oc;
  return oc;
}

function fit(){
  const r=cv.parentElement.getBoundingClientRect();
  DPR=Math.min(2, window.devicePixelRatio||1);
  CW=Math.max(220,r.width); CH=Math.max(200,r.height);
  cv.width=Math.round(CW*DPR); cv.height=Math.round(CH*DPR);
  cv.style.width=CW+"px"; cv.style.height=CH+"px";
  cx.setTransform(DPR,0,0,DPR,0,0);
  draw();
}
/* 尺寸变化：跨过窄屏阈值时自动收起侧栏（防止浮层重新盖住台面） */
let _wasNarrow=false;
window.addEventListener("resize",()=>{
  const narrow=!!(window.matchMedia && window.matchMedia("(max-width:760px)").matches);
  if(narrow && !_wasNarrow) document.body.classList.add("noside");
  _wasNarrow=narrow;
  if(typeof syncSideBtn==="function") syncSideBtn();
  fit();
});

function render(){
  /* ── 打烊卡死安全网（2026-10-16 修） ──
     症状：玩家按石市，得到一句「今日已收工，明天再来」，但收摊按钮只关窗、
     进第二天的入口已经不在，于是彻底卡死。
     成因：G.dayOver 只在 closeDay() 里置位，而打烊面板可能被后续弹窗顶掉、
     或 showDayEnd 抛异常、或玩家在打烊后点开别的面板再关掉 —— 每一种都会
     留下「已打烊 + 遮罩不在 + 没有进入次日的按钮」这个死角。
     这里做无条件兜底：只要处于「已打烊、没破产、没有待结算弹窗」而遮罩又不在，
     就把打烊面板还给你。render() 到处都会被调用，所以这条网能盖住所有路径。 */
  if(typeof G!=="undefined" && G.dayOver && !G.dead && !G.settling && !G.finaleSt){
    const vl=document.getElementById("vl");
    if(vl && vl.className!=="on" && typeof resumeDayEnd==="function") resumeDayEnd();
  }
  // 先更新 DOM（侧栏/工具栏），再量 #tl 实际高度画画布 —— 保证让位准确
  if(typeof drawSide==="function") drawSide();
  if(typeof drawTools==="function") drawTools();
  draw();
  if(typeof syncTop==="function") syncTop();
}

/* ══════════ 场景：作坊实拍背景 + 聚光 + 暗角 ══════════
   闲置态用带油灯景（bg_idle），工序态换无灯暗景（bg_work）——
   工序时切台面，暖光会与石料立绘叠在一处显得脏，故换冷暗无灯背景。
   两图生成时已强制「画面正中央留空」，此处再叠一层中心暗角，
   把中央区域压暗兜底，保证任何情况下立绘都不会被背景干扰。 */
function drawStage(work){
  const t=imgOf(work?IMG_TABLE_WORK:IMG_TABLE);
  if(t){
    const sc=Math.max(CW/t.width, CH/t.height);
    const w=t.width*sc, h=t.height*sc;
    cx.drawImage(t,(CW-w)/2,(CH-h)/2,w,h);
  }else{
    cx.fillStyle="#171008"; cx.fillRect(0,0,CW,CH);
  }
  const c=center();
  /* 暖色聚光灯只在闲置（鉴石）态画；工序时立绘在 workCenter，聚光灯会偏到
     立绘左下角出一团可疑的亮斑，工序中不画 */
  if(!work){
    const sp=cx.createRadialGradient(c.x,c.y,10,c.x,c.y,Math.max(CW,CH)*0.5);
    sp.addColorStop(0,"rgba(255,214,150,.10)");
    sp.addColorStop(1,"rgba(0,0,0,0)");
    cx.fillStyle=sp; cx.fillRect(0,0,CW,CH);
  }
  /* 中心留影：横向带状压暗（椭圆/径向渐变会在立绘外圈留下一道明显的
     圆形暗边，看起来像「黑饼」）。改用横向线性渐变 + 纵向遮罩，
     中央形成一条柔和的横向暗带，边界不可见，自然让出立绘区域。 */
  const bw=Math.min(CW,CH)*0.62;
  const lg=cx.createLinearGradient(c.x-bw,0,c.x+bw,0);
  lg.addColorStop(0,"rgba(6,4,3,0)");
  lg.addColorStop(.5,"rgba(6,4,3,.34)");
  lg.addColorStop(1,"rgba(6,4,3,0)");
  cx.fillStyle=lg; cx.fillRect(0,0,CW,CH);
  /* 纵向只压画面中段（台面以上），台面与顶部墙面保持原亮度 */
  const th=CH*0.30;
  const vg2=cx.createLinearGradient(0,c.y-th,0,c.y+th);
  vg2.addColorStop(0,"rgba(0,0,0,0)");
  vg2.addColorStop(.5,"rgba(0,0,0,1)");
  vg2.addColorStop(1,"rgba(0,0,0,0)");
  cx.save();
  cx.globalCompositeOperation="destination-out";
  cx.fillStyle=vg2; cx.fillRect(0,0,CW,CH);
  cx.restore();
  const vg=cx.createRadialGradient(c.x,c.y,Math.min(CW,CH)*0.28,c.x,c.y,Math.max(CW,CH)*0.72);
  vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,.66)");
  cx.fillStyle=vg; cx.fillRect(0,0,CW,CH);
}

function center(){ return {x:CW/2, y:CH*0.47}; }
/* DOM 工具栏(#tl)实际占高：画布底部面板锚点必须动态让位，
   否则窄屏下工具条换行变高，画布文字/进度条会叠压到按钮上 */
function tlPad(){
  const tl=document.getElementById("tl");
  const h=(tl&&tl.offsetHeight)||0;
  return h+12;
}
function R(){ return Math.min(CW,CH)*0.30; }
function lampXY(c){
  const a=(Number.isFinite(G.lamp)?G.lamp:Math.PI/2)-Math.PI/2;
  const d=Math.min(CW,CH)*0.40;
  return {x:c.x+Math.sin(a)*d, y:c.y-Math.cos(a)*d};
}
/* 台面投影：径向渐变的软影 —— 旧版是实心矢量椭圆，边缘一圈硬边
   （黑底素材上尤其明显，像压了一块黑饼），改成中心浓、边缘散开的椭圆软影 */
function drawShadow(c,rx,ry){
  const y=c.y+ry*1.15;
  cx.save();
  const g=cx.createRadialGradient(0,0,0,0,0,rx);
  g.addColorStop(0,"rgba(0,0,0,.20)");  // 降低阴影强度
  g.addColorStop(.55,"rgba(0,0,0,.08)");
  g.addColorStop(1,"rgba(0,0,0,0)");
  cx.translate(c.x,y); cx.scale(1, Math.max(0.05, ry/rx));
  cx.fillStyle=g;
  cx.beginPath(); cx.arc(0,0,rx,0,TAU); cx.fill();
  cx.restore();
}

/* ══════════ 原石外壳：离屏合成（剥离挖洞） ══════════ */
const shellCache={};
function shellCanvas(s,prog){
  const key=s.id+"_"+Math.round(prog*20);
  if(shellCache[key]) return shellCache[key];
  const S=512;
  const oc=document.createElement("canvas"); oc.width=S; oc.height=S;
  const o=oc.getContext("2d");
  // 未剥离的开窗明料：直接展示磨开的窗口与内部宝石
  const useWin = (prog<0.01 && s.win && WINDOWS[s.gtype]);
  const img=imgOf(useWin ? WINDOWS[s.gtype] : SHELLS[s.shell].img);
  if(img){
    const sc=Math.max(S/img.width,S/img.height);
    o.drawImage(img,(S-img.width*sc)/2,(S-img.height*sc)/2,img.width*sc,img.height*sc);
  }
  if(prog>0.01){
    o.globalCompositeOperation="destination-out";
    const holeR=S*(0.16+prog*0.34);
    const g=o.createRadialGradient(S/2,S/2,holeR*0.5,S/2,S/2,holeR);
    g.addColorStop(0,"rgba(0,0,0,1)");
    g.addColorStop(.72,"rgba(0,0,0,.92)");
    g.addColorStop(1,"rgba(0,0,0,0)");
    o.fillStyle=g;
    o.beginPath(); o.arc(S/2,S/2,holeR,0,TAU); o.fill();
    // 楔形碎裂：边缘不规则的崩落
    const seed=m32(Math.floor(s.seed*50)+9);
    const nW=2+Math.floor(prog*9);
    for(let i=0;i<nW;i++){
      const a=seed()*TAU, len=holeR*(0.85+seed()*0.75), wA=0.10+seed()*0.24;
      o.fillStyle="rgba(0,0,0,"+(0.55+seed()*0.4).toFixed(2)+")";
      o.beginPath(); o.moveTo(S/2,S/2);
      o.arc(S/2,S/2,len,a-wA/2,a+wA/2);
      o.closePath(); o.fill();
    }
    o.globalCompositeOperation="source-over";
  }
  // 边缘径向渐隐：消除方形贴图边界
  o.globalCompositeOperation="destination-in";
  const fade=o.createRadialGradient(S/2,S/2,S*0.30,S/2,S/2,S*0.50);
  fade.addColorStop(0,"rgba(0,0,0,1)");
  fade.addColorStop(.82,"rgba(0,0,0,1)");
  fade.addColorStop(1,"rgba(0,0,0,0)");
  o.fillStyle=fade;
  o.fillRect(0,0,S,S);
  o.globalCompositeOperation="source-over";
  if(Object.keys(shellCache).length>90) for(const k in shellCache) delete shellCache[k];
  shellCache[key]=oc;
  return oc;
}

function drawShell(s,prog,c,rad,rot){
  const oc=shellCanvas(s,prog);
  const sz=rad*2.55;
  cx.save();
  cx.translate(c.x,c.y);
  cx.rotate(rot||0);
  cx.globalCompositeOperation="lighter";
  cx.drawImage(oc,-sz/2,-sz/2,sz,sz);
  cx.globalCompositeOperation="source-over";
  cx.restore();
}

/* ══════════ 晶体簇（内核） ══════════ */
/* 受损时优先换用真实裂痕贴图，没有贴图的宝石才退回程序绘制 */
function clusterImgOf(s,stage){
  // 损伤贴图优先（破碎/崩边先于异象光效，否则破碎龙石永远显示异象原图）
  const st=stage||{};
  const gk=s.gtype;
  const d=DMGIMG[gk];
  if(stage && d){
    if(stage.dg.includes("crack") && d.crack) return d.crack;
    if(stage.dg.includes("chip")  && d.chip)  return d.chip;
  }
  if(s.anom) return IMG_ANOMALY;
  // 按石种+材质等级选择素材
  const grade=st.grade||null;
  if(grade && GRADE_ASSETS[gk] && GRADE_ASSETS[gk][grade] && GRADE_ASSETS[gk][grade].img){
    return GRADE_ASSETS[gk][grade].img;
  }
  // 降级：使用通用素材
  return GEMS[gk].img;
}
function drawCluster(s,stage,c,rad,rot){
  const g=GEMS[s.gtype];
  const anom=s.anom;
  const img=imgOf(clusterImgOf(s,stage));
  const pulse = anom ? 0.82+0.18*Math.sin(performance.now()/620) : 1;
  const shrink = (stage&&stage.dg&&stage.dg.includes("lost")) ? 0.82 : 1;   // 失重：料被磨薄
  const sz=rad*2.35*(0.8+0.4*cl(s.size,0,1))*shrink;
  cx.save();
  if(anom){
    cx.globalAlpha=.14*pulse;
    cx.fillStyle="#7a2a26";
    cx.beginPath(); cx.arc(c.x,c.y,sz*0.62,0,TAU); cx.fill();
    cx.globalAlpha=1;
  }
  cx.translate(c.x,c.y);
  cx.rotate(rot||0);
  cx.globalAlpha=pulse;
  /* 同样按亮度抠掉素材黑底：cluster 系列也是方图，
     直接 lighter 会把近黑底加到背景上，亮出矩形边界。 */
  if(img){
    const src=clusterImgOf(s,stage);
    cx.drawImage(img,-sz/2,-sz/2,sz,sz);
    cx.globalCompositeOperation="destination-in";
    cx.drawImage(alphaMaskOf(src,img),-sz/2,-sz/2,sz,sz);
  }
  cx.globalCompositeOperation="source-over";
  cx.globalAlpha=1;
  cx.restore();
  // 损伤纹：按类型分别呈现（裂纹分叉 / 崩边缺口 / 失重缩小 / 雾化蒙层）
  if(stage) drawDamage(cx,stage,s,c,rad,sz,"raw",clusterImgOf(s,stage));
}

/* ── 损伤可视化 ──
   旧实现的毛病（弹窗里那团「曝光」的白就是它）：
   把整幅受损刻面贴图用 lighter（加法）按 .95 / .9 叠在成品图上。底图与受损图
   是同一颗石头的两张实拍照，同一位置相加必然溢出 —— 实测糯冰底图均亮 117，
   叠上裂纹+崩边后升到 205，近白像素 52%，整颗炸成一团白。
   改法：受损贴图不再整幅加法叠加，而是裁剪进宝石所在的圆形区域做「替换」
   （等于给宝石换上受损版的样子）。金属托、戒圈在圆外不受影响，亮度也不再相加。
   雾化、缺料同理：不再糊实心的矢量白圆 / 黑圆，改为渐变柔化。
   mode: "raw" = 晶簇阶段（用 DMGIMG 原石裂痕），"cut" = 刻面/首饰（用 CUTDMG）
   baseSrc: 当前底图，若底图已经是这张受损图则不重复绘制 */
function drawDamage(g,st,s,c,rad,sz,mode,baseSrc){
  const dg=st.dg||[];
  if(!dg.length) return;
  const tbl = (mode==="raw") ? DMGIMG[s.gtype] : CUTDMG[s.gtype];
  /* 替换半径按主体形态给：
     晶簇/刻面裸石 —— 石头占满画面，半径给足；
     首饰 —— 只换戒面/坠面那一小块（约画面 15%），金属托、戒圈完整留在圈外，
             否则整枚戒指会被受损裸石照盖掉，看着就只剩一颗石头。 */
  let r, gy, clipFn;
  if(mode==="raw"){            r=sz*0.44; gy=c.y-sz*0.02; clipFn=()=>{ g.beginPath(); g.arc(c.x,gy,r,0,TAU); g.clip(); }; }
  else if(st.kind==="jewel"){
    r=sz*0.24; gy=c.y-sz*0.10;
    // 首饰用椭圆形裁切，避免圆形 clip 溢出盖住链条/戒圈
    clipFn=()=>{ g.beginPath(); g.ellipse(c.x,gy,r*1.15,r*r/sz*1.4,0,0,TAU); g.clip(); };
  }
  else {                       r=sz*0.42; gy=c.y-sz*0.02; clipFn=()=>{ g.beginPath(); g.arc(c.x,gy,r,0,TAU); g.clip(); }; }
  // ① 裂纹 / 破损 / 崩边：只呈现最重的一处，圆内替换，绝不叠两层
  let tex=null;
  if(tbl){
    if((dg.includes("crack")||dg.includes("broken")) && tbl.crack) tex=tbl.crack;
    else if(dg.includes("chip") && tbl.chip) tex=tbl.chip;
  }
  if(tex && tex!==baseSrc && imgOf(tex)){
    g.save(); clipFn();
    g.globalAlpha=.90;
    g.drawImage(imgOf(tex), c.x-sz/2, gy-sz/2, sz, sz);
    g.restore();
  }
  // ② 雾化：中心浓、向边缘散开的灰白蒙层（柔化，不再是实心矢量圆盘）
  if(dg.includes("haze")){
    g.save(); clipFn();
    const hg=g.createRadialGradient(c.x,gy,r*0.14,c.x,gy,r);
    hg.addColorStop(0,"rgba(206,211,216,.44)");
    hg.addColorStop(.60,"rgba(206,211,216,.24)");
    hg.addColorStop(1,"rgba(206,211,216,0)");
    g.fillStyle=hg; g.fillRect(c.x-r,gy-r,r*2,r*2);
    g.restore();
  }
  // ③ 缺料：只在边缘压暗成暗角，中心保持通透（不再糊一个黑圆）
  if(dg.includes("lost")){
    g.save(); clipFn();
    const lg=g.createRadialGradient(c.x,gy,r*0.55,c.x,gy,r);
    lg.addColorStop(0,"rgba(0,0,0,0)");
    lg.addColorStop(1,"rgba(0,0,0,.40)");
    g.fillStyle=lg; g.fillRect(c.x-r,gy-r,r*2,r*2);
    g.restore();
  }
}
/* 失重缩放系数：立绘绘制时按损伤缩一圈，表现料被磨薄 */
function lostScale(st){ return (st&&st.dg&&st.dg.includes("lost"))?0.86:1; }

/* 成品图：按石种+材质等级+首饰类型选择素材，有受损刻面贴图就用贴图，否则用完好刻面 */
/* 材质等级键白名单：GRADE_ASSETS 只认 waste/flower/high。
   历史上收刀路径漏赋 grade，工坊兜底又误填 gradeOf() 的「丙等」等切割成色，
   导致键不匹配后一路 fallthrough 到 GEMS[gk].cutimg（裸石）。此处统一归一化兜底。 */
const GRADE_KEYS=[GRADE_WASTE,GRADE_FLOWER,GRADE_HIGH];
function gradeKeyOf(g){ return GRADE_KEYS.indexOf(g)>=0 ? g : GRADE_FLOWER; }
function cutImgOf(st){
  const gk=st.s.gtype;
  const grade=gradeKeyOf(st.grade);
  // 已镶嵌成首饰：优先使用首饰贴图（裂纹/崩边由 drawDamage 叠加，不再整图替换）
  if(st.kind==="jewel" && st.jk && GRADE_ASSETS[gk] && GRADE_ASSETS[gk][grade] && GRADE_ASSETS[gk][grade][st.jk]){
    const src=GRADE_ASSETS[gk][grade][st.jk];
    if(imgOf(src)) return src;
    // 素材未加载，降级到程序化生成
    const oc=genJewelImg(gk,st.jk,grade,st.s.seed);
    return oc;
  }
  // 损伤优先：有裂纹/崩边就换受损刻面贴图（否则有 grade 的成品永远显示完好图，各状态复用同一张）
  const d=CUTDMG[gk];
  if(d && st.dg){
    if(st.dg.includes("crack") && d.crack) return d.crack;
    if(st.dg.includes("broken") && d.crack) return d.crack;
    if(st.dg.includes("chip")  && d.chip)  return d.chip;
  }
  if(grade && GRADE_ASSETS[gk] && GRADE_ASSETS[gk][grade] && GRADE_ASSETS[gk][grade].cutimg){
    return GRADE_ASSETS[gk][grade].cutimg;
  }
  // 降级：使用通用素材或DMG贴图
  if(d && st.dg){
    if(st.dg.includes("crack") && d.crack) return d.crack;
    if(st.dg.includes("chip")  && d.chip)  return d.chip;
  }
  return GEMS[gk].cutimg;
}
/* ══════════ 刻面成品 ══════════ */
function drawCut(st,c,rad){
  const src=cutImgOf(st);
  const img=imgOf(src);
  /* 接触影：贴宝石底部一圈软影。旧值 rx=rad*0.85 偏小，宝石像悬在台面上方；
     台面灯斑已由 draw() 的石料位暗底统一压暗，这里只补接触影。 */
  drawShadow(c,rad*1.02,rad*0.26);
  const shrink=(st.dg&&st.dg.includes("lost"))?0.85:1;
  const sz=rad*2.2*shrink;
  cx.save();
  cx.translate(c.x,c.y);
  cx.rotate(G.spin*0.5+st.s.offA);
  if(img){
    cx.drawImage(img,-sz/2,-sz/2,sz,sz);
    cx.globalCompositeOperation="destination-in";
    cx.drawImage(alphaMaskOf(src,img),-sz/2,-sz/2,sz,sz);
    cx.globalCompositeOperation="source-over";
  }
  cx.restore();
  // 成品上的损伤：裂纹 / 崩边 / 雾化 / 磨薄（全为贴图，无白线）
  drawDamage(cx,st,st.s,c,rad,sz,"cut",cutImgOf(st));
}


/* ══════════ 鉴定灯 ══════════ */
/* 鉴定灯：压一档亮度 —— 旧版中心 .85 的暖白斑叠在立绘上会压出一块死亮光 */
function drawLamp(c){
  const lp=lampXY(c);
  if(!Number.isFinite(lp.x)||!Number.isFinite(lp.y)) return;
  cx.save();
  const g=cx.createRadialGradient(lp.x,lp.y,0,lp.x,lp.y,52);
  g.addColorStop(0,"rgba(255,238,200,.52)");
  g.addColorStop(.28,"rgba(255,220,160,.16)");
  g.addColorStop(1,"rgba(255,210,140,0)");
  cx.fillStyle=g;
  cx.beginPath(); cx.arc(lp.x,lp.y,52,0,TAU); cx.fill();
  cx.restore();
}

/* ══════════ 加工操作面板：只留进度条，文字全部去除（不挡立绘）══════════ */
function opLabel(){ return G.phase==="peel"?"錾剥":G.phase==="cut"?"开料":"修磨"; }
function drawOpPanel(c){
  const phase=G.phase;
  const st=cur(); if(!st) return;
  let prog=0, need=1, done=0;
  if(phase==="peel"){ need=G.peelMax; done=G.peelMax-G.peelLeft; }
  else if(phase==="cut"){ need=G.cutNeed; done=G.cutDone; }
  else if(phase==="polish"){ need=G.polishNeed; done=G.polishDone; }
  prog=cl(done/need,0,1);

  /* 进度条贴着工具栏放（原 -72 会压到立绘下沿），宽度收窄让出石头 */
  const bw=Math.min(CW*0.56,340), bh=26;
  const BOT=tlPad();
  const bx=c.x-bw/2, by=CH-BOT-42;
  cx.save();
  cx.fillStyle="rgba(8,6,4,.92)";
  cx.fillRect(bx,by,bw,bh);
  cx.fillStyle=prog>=1?"rgba(143,191,159,.85)":"rgba(201,174,110,.65)";
  cx.fillRect(bx+1,by+1,(bw-2)*prog,bh-2);
  cx.strokeStyle="rgba(107,90,53,.9)"; cx.lineWidth=1;
  cx.strokeRect(bx,by,bw,bh);
  cx.font='13px "Songti SC","SimSun",serif'; cx.fillStyle=P.tx; cx.textAlign="center";
  cx.fillText(`${done} / ${need}`, c.x, by+bh-9);
  cx.restore();
}

/* ══════════ 提示条 ══════════ */
function arcGeo(c){
  const bottomPad=tlPad()+54;
  const y=CH-bottomPad-24;
  const room=y-(c.y+R()*0.55);
  const r=cl(Math.min(CW*0.34,room),70,200);
  return {x:c.x,y,r,a0:Math.PI*1.12,a1:Math.PI*1.88};
}
function drawGaugeBase(x,y,r,a0,a1){
  cx.strokeStyle="#3a3020"; cx.lineWidth=1.4;
  cx.beginPath(); cx.arc(x,y,r,a0,a1); cx.stroke();
  for(let i=0;i<=10;i++){
    const a=a0+(a1-a0)*(i/10);
    const r0=r-6, r1=r-(i%5===0?12:9);
    cx.strokeStyle=i%5===0?"#6b5a35":"#31291a"; cx.lineWidth=1;
    cx.beginPath();
    cx.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0);
    cx.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);
    cx.stroke();
  }
}
function drawBar(c,pos,ideal,zone,label,tip,accent){
  /* 与加工进度条同一条底线：贴工具栏放，不压立绘 */
  const bw=Math.min(CW*0.52,320), bh=26;
  const BOT=tlPad();
  const bx=c.x-bw/2, by=CH-BOT-40;
  const z=cl(zone,0.05,0.4), id=cl(ideal,0.05,0.95);
  cx.save();
  // 底槽
  cx.fillStyle="rgba(8,6,4,.92)";
  cx.fillRect(bx,by,bw,bh);
  // 三段：致命(暗红) / 危险(橙) / 安全(绿)
  const seg=(a,b,col)=>{
    cx.fillStyle=col;
    cx.fillRect(bx+bw*cl(a,0,1), by+1, bw*cl(b-a,0,1), bh-2);
  };
  seg(0, id-z*1.6, "rgba(120,40,34,.55)");
  seg(id-z*1.6, id-z*0.5, "rgba(160,96,52,.55)");
  seg(id-z*0.5, id+z*0.5, "rgba(78,132,96,.75)");
  seg(id+z*0.5, id+z*1.6, "rgba(160,96,52,.55)");
  seg(id+z*1.6, 1, "rgba(120,40,34,.55)");
  // 正中完美线
  cx.fillStyle="rgba(232,213,163,.85)";
  cx.fillRect(bx+bw*id-1, by-3, 2, bh+6);
  // 边框
  cx.strokeStyle="rgba(107,90,53,.9)"; cx.lineWidth=1;
  cx.strokeRect(bx,by,bw,bh);
  // 游走指针（菱形錾头）
  const px=bx+bw*cl(pos,0,1);
  cx.fillStyle=accent;
  cx.beginPath();
  cx.moveTo(px, by-9); cx.lineTo(px+6, by+bh/2); cx.lineTo(px, by+bh+9); cx.lineTo(px-6, by+bh/2);
  cx.closePath(); cx.fill();
  cx.strokeStyle="rgba(255,240,200,.9)"; cx.lineWidth=1.2; cx.stroke();
  // 标签
  cx.font='12px "Songti SC","SimSun",serif'; cx.fillStyle=P.dim; cx.textAlign="center";
  cx.fillText(label, c.x, by-16);
  cx.restore();
}

/* ── 开料转盘：以解理面为中心左右自动摆动，摆到正中下刀 ── */
function drawCutDial(c){
  const {x,y,r,a0,a1}=arcGeo(c);
  const tgt=G.cutTarget, cur=G.cutAngle;
  const err=angD(cur,tgt);
  cx.save();
  drawGaugeBase(x,y,r,a0,a1);
  // 解理面目标区（随已刻面数变宽）
  let tol=0.16+G.cutDone*0.05+(G.gear.lab||1)*0.04;
  if(hasSkill("blade")) tol*=1.35;
  if(ev("night")) tol*=0.85;
  const span=a1-a0;
  cx.strokeStyle="rgba(143,191,159,.80)"; cx.lineWidth=9;
  cx.beginPath(); cx.arc(x,y,r-3, tgt-tol, tgt+tol); cx.stroke();
  cx.strokeStyle="rgba(184,122,110,.42)"; cx.lineWidth=3;
  cx.beginPath(); cx.arc(x,y,r-3, tgt-tol*2.2, tgt-tol); cx.stroke();
  cx.beginPath(); cx.arc(x,y,r-3, tgt+tol, tgt+tol*2.2); cx.stroke();
  // 当前刀口指针
  const a=cur;
  cx.strokeStyle=err>0.5?P.bad:P.gold; cx.lineWidth=2.6;
  cx.beginPath(); cx.arc(x,y,r-11,a-.035,a+.035); cx.stroke();
  cx.fillStyle=err>0.5?P.bad:P.gold;
  cx.beginPath(); cx.arc(x,y,3.4,0,TAU); cx.fill();
  // 解理面标记线
  cx.strokeStyle="rgba(232,213,163,.5)"; cx.lineWidth=1.2; cx.setLineDash([3,3]);
  cx.beginPath(); cx.moveTo(x+Math.cos(tgt)*(r-24), y+Math.sin(tgt)*(r-24));
  cx.lineTo(x+Math.cos(tgt)*(r+8), y+Math.sin(tgt)*(r+8)); cx.stroke();
  cx.setLineDash([]);
  cx.font='12px "Songti SC","SimSun",serif'; cx.fillStyle=P.dim; cx.textAlign="center";
  cx.fillText("切面角",x,y+18);
  cx.restore();
}

/* ── 剥离进度条 ── */
function drawPower(c){
  drawBar(c, G.peelPos, G.peelIdeal, G.peelZone, "卸 力",
    "◀ 指针游走 · 压中绿带正中錾剥 ▶", "#e8d5a3");
}

/* ── 修磨进度条：安全区更窄 ── */
function drawPolish(c){
  drawBar(c, G.polishPos, G.polishIdeal, G.polishZone, "抛 光",
    "◀ 指针更快 · 压中绿带正中修磨 ▶", "#c9e0cf");
  // 品质条
  const q=cl(G.polishQ||0,0,1);
  const bw=Math.min(150,CW*0.34), bx=c.x-bw/2, by=CH-tlPad()-98;
  cx.save();
  cx.strokeStyle="rgba(107,90,53,.6)"; cx.lineWidth=1;
  cx.strokeRect(bx,by,bw,7);
  cx.fillStyle=q>=0.88?"#c9ae6e":q>=0.6?"#8fbf9f":"#7d7460";
  cx.fillRect(bx+1,by+1,(bw-2)*q,5);
  cx.font='11px "Songti SC","SimSun",serif'; cx.fillStyle=P.dim; cx.textAlign="center";
  cx.fillText("表面品质 "+Math.round(q*100)+"% · "+(q>=0.88?"镜面":q>=0.68?"光亮":q>=0.45?"平整":q>=0.25?"粗糙":"磨砂"), c.x, by+20);
  cx.restore();
}

/* ══════════ 提示条：顶栏提示文字已全部移除（应用户要求去杂）══════════ */
function drawHint(){
  const el=document.getElementById("hn");
  el.innerHTML="";
}

/* ══════════ 主绘制 ══════════ */
/* 工序中立绘整体上移：底部要给进度条让位，立绘居中偏下会被进度条压住 */
function workCenter(){ return {x:CW/2, y:CH*0.38}; }
/* 工序状态立绘 —— 按亮度抠掉素材黑底。
   方框/黑边的根因：素材是方图，主体（石头）之外是**纯黑或近黑**的底，
   但并非100% 纯黑（lum 约 10~50），所以——
     · source-over：整块方图盖住背景 → 黑方块
     · lighter（加法）：那圈近黑底被「加」到背景上 → 亮出**矩形**边界
     · destination-out 擦圆外：擦除起点难定，容易啃掉石头
   采用按亮度抠 alpha：黑底 → 全透明，主体 → 不透明，阈值间平滑过渡。
   天然没有矩形边界，也不会误伤石头（石头本身明亮）。
   遮罩按素材缓存，每张只算一次。 */
const _maskCache={};
function alphaMaskOf(src,im){
  if(_maskCache[src]) return _maskCache[src];
  const W=im.width,H=im.height;
  /* 离屏取像素（不动原Image，避免污染 IMG 缓存） */
  const tmp=document.createElement("canvas"); tmp.width=W; tmp.height=H;
  const tx=tmp.getContext("2d");
  tx.drawImage(im,0,0);
  let id;
  try{ id=tx.getImageData(0,0,W,H); }
  catch(e){ _maskCache[src]=im; return im; }   /* 跨域等异常时退化为不抠图 */
  const d=id.data;
  const FLOOR=30, SOFT=18;   /* ≤30 全透明，≥48 全不透明 */
  for(let i=0;i<d.length;i+=4){
    const l=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
    let a;
    if(l<=FLOOR) a=0;
    else if(l>=FLOOR+SOFT) a=255;
    else a=Math.round((l-FLOOR)/SOFT*255);
    d[i+3]=a;
  }
  tx.putImageData(id,0,0);
  _maskCache[src]=tmp;
  return tmp;
}
function drawWorkImg(src,c,rad,rot,st){
  const im=imgOf(src);
  if(!im) return;
  const sz=rad*3.0;
  const m=alphaMaskOf(src,im);
  cx.save();
  cx.translate(c.x,c.y);
  cx.drawImage(im,-sz/2,-sz/2,sz,sz);
  cx.globalCompositeOperation="destination-in";
  cx.drawImage(m,-sz/2,-sz/2,sz,sz);
  cx.globalCompositeOperation="source-over";
  cx.restore();
}
function draw(){
  const working=(G.phase==="peel"||G.phase==="cut"||G.phase==="polish");
  /* 工序时换无灯桌图：原桌图油灯在台面中心（石料位），灯柱会从立绘后面
     穿出来挡住立绘；店铺待工态才用带灯桌图+鉴定灯。 */
  drawStage(working);
  drawHint();
  const c=working?workCenter():center();
  const st=cur();

  if(!st){
    /* 台面空置：旧版画虚线圈 + 「玉石馆的台面，空着」文字，
       在暖调新背景上既突兀又抢戏。已整块移除，只留干净的空台。 */
    return;
  }
  const s=st.s;
  const rad=R()*0.52;
  const rot=s.offA*0.15+G.spin*0.5;

  if(G.phase==="peel"){
    /* 落錾 = 剥落石皮状态立绘（壳被剥开一角、露出内部晶体） */
    drawShadow(c,rad*1.05,rad*0.28);
    drawWorkImg(workImgOf(s.gtype,"peel"),c,rad,null,st);
    drawOpPanel(c);
  }else if(G.phase==="cut"){
    /* 落刀 = 原石被切开的状态立绘 */
    drawShadow(c,rad*0.98,rad*0.26);
    drawWorkImg(workImgOf(s.gtype,"cut"),c,rad,null,st);
    drawOpPanel(c);
  }else if(G.phase==="polish"){
    /* 落磨 = 原石被打磨的状态立绘 */
    drawShadow(c,rad*0.98,rad*0.26);
    drawWorkImg(workImgOf(s.gtype,"polish"),c,rad,null,st);
    drawOpPanel(c);
  }else{
    /* 店铺待工态：剥落石皮立绘 + 鉴定灯（带灯桌图的氛围保留在这里） */
    drawLamp(c);
    drawShadow(c,rad*0.9,rad*0.26);
    drawWorkImg(workImgOf(s.gtype,"peel"),c,rad*0.92,rot,st);
  }
  drawWarp();
}

/* 运气见底：台面褪色发冷，提醒今日到此为止 */
/* 运气见底：台面静态褪色发冷，提醒今日到此为止
   （旧版有一团随正弦曲线飘动的暗色椭圆，像暗影缓缓飘过，已移除） */
function drawWarp(){
  const lk=(typeof luckOf==="function")?luckOf():22;
  if(lk>0) return;
  cx.save();
  cx.globalAlpha=.16;
  cx.fillStyle="#0a1420";
  cx.fillRect(0,0,CW,CH);
  cx.restore();
}
