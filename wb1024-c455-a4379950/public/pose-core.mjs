/* ============================================================
 * pose-core.mjs —— 坐姿特征提取与评分（纯逻辑，无 DOM / 无网络）
 *
 * 设计原则（可验证性优先）：
 *  1. 只用「角度」与「比值」特征，绝不用绝对坐标
 *     → 换人 / 换拍摄距离 / 换设备都通用，无需重调阈值
 *  2. 两点间相对量（|A-B| / 基准）不依赖坐标原点
 *     → 桌面近距取景时髋部出画也不会崩
 *  3. 分母若为投影长度（肩宽），用 cos(yaw) 显式补偿噪声放大
 *  4. 全部函数为纯函数，可在 Node 中直接单元测试
 * ==========================================================*/

export const IDX = { NOSE:0, LEYE:2, REYE:5, LEAR:7, REAR:8, LSH:11, RSH:12, LHIP:23, RHIP:24 };

// 上半身骨架连线（各元素配色互不重叠，便于像素级验证）
export const BONES = [
  {a:IDX.LEAR,b:IDX.REAR,c:"#ef9f27"}, {a:IDX.LEAR,b:IDX.NOSE,c:"#ef9f27"}, {a:IDX.REAR,b:IDX.NOSE,c:"#ef9f27"},
  {a:IDX.LEYE,b:IDX.REYE,c:"#ef9f27"},
  {a:IDX.LSH,b:IDX.RSH,c:"#1d9e75"}, {a:IDX.LSH,b:IDX.LHIP,c:"#1d9e75"},
  {a:IDX.RSH,b:IDX.RHIP,c:"#1d9e75"}, {a:IDX.LHIP,b:IDX.RHIP,c:"#1d9e75"},
  {a:IDX.LSH,b:13,c:"#e24b4a"}, {a:13,b:15,c:"#e24b4a"},
  {a:IDX.RSH,b:14,c:"#378add"}, {a:14,b:16,c:"#378add"},
];
export const JOINTS = [IDX.LSH,IDX.RSH,IDX.LEAR,IDX.REAR,IDX.NOSE,IDX.LHIP,IDX.RHIP,13,14,15,16];

// 指标定义：mode=rel 相对基线偏差 / abs 有符号绝对量；kind 控制惩罚方向
//   lower = 只惩罚低于基线   upper = 只惩罚高于基线   both = 双向惩罚
//   b0 = 未校准时的中性默认值（用于以物理量为定义的 abs 指标）
export const METRICS = [
  { k:"neckH",  n:"头颈支撑", mode:"rel", kind:"lower", w:0.18, tol:0.08, scale:0.28, need:"ear",
    hint:()=>`头部下垂了，<b>微收下巴</b>，想象头顶被轻轻向上提起` },
  { k:"noseSh", n:"低头程度", mode:"rel", kind:"both", w:0.14, tol:0.06, scale:0.28, need:"nose",
    hint:d=>d>0?`头<b>后仰</b>了，视线应平视屏幕上沿，把下巴微微收回`
               :`低头太多了，<b>抬高视线</b>或把屏幕垫高到平视高度` },
  { k:"shRound",n:"肩背展开", mode:"rel", kind:"lower", w:0.18, tol:0.05, scale:0.14, need:"ear",
    hint:()=>`含胸塌肩了，<b>双肩向后向下打开</b>，轻轻挺胸` },
  { k:"torsoH", n:"躯干挺直", mode:"rel", kind:"lower", w:0.14, tol:0.06, scale:0.18, need:"hip",
    hint:()=>`躯干塌了，<b>坐直并把臀部坐满椅面</b>，别滑向椅背` },
  { k:"sizeR",  n:"屏幕距离", mode:"rel", kind:"upper", w:0.12, tol:0.07, scale:0.25, need:"none",
    hint:()=>`离屏幕太近了，<b>往后靠一点</b>，保持约一臂距离` },
  { k:"headFwd",n:"头前伸",   mode:"abs", kind:"upper", w:0.10, tol:0.035, scale:0.07, need:"wl", b0:0.095,
    hint:()=>`头部前伸了，<b>轻轻收下巴</b>，把头拉回肩膀正上方` },
  { k:"leanDeg",n:"左右平衡", mode:"abs", kind:"both",  w:0.20, tol:3.5, scale:8,   need:"none",
    hint:d=>`身体向${d>0?"右":"左"}歪了，<b>坐正</b>，双脚平放、重心居中` },
  { k:"headOff",n:"头部居中", mode:"abs", kind:"both",  w:0.12, tol:0.06, scale:0.18, need:"ear",
    hint:d=>`头部偏向${d>0?"右":"左"}了，回到<b>双肩正上方</b>` },
  { k:"headTilt",n:"头部摆正", mode:"abs", kind:"both", w:0.14, tol:4,   scale:8,   need:"ear",
    hint:d=>`头歪向${d>0?"右":"左"}了，把头<b>摆正</b>` },
  { k:"headYawM",n:"视线朝向", mode:"abs", kind:"both", w:0.12, tol:0.32, scale:0.55, need:"ear",
    hint:d=>`头转向${d>0?"右":"左"}了，<b>把视线转回屏幕</b>` },
  { k:"twistDeg",n:"躯干扭转", mode:"abs", kind:"both", w:0.14, tol:5,   scale:11,  need:"wl",
    hint:d=>`上半身向${d>0?"右":"左"}拧转了，<b>肩膀转回正对屏幕</b>，别拧着坐` },
  { k:"pelvicTiltDeg",n:"骨盆摆正", mode:"abs", kind:"both", w:0.12, tol:2.5, scale:6, need:"hip",
    hint:d=>`骨盆向${d>0?"右":"左"}歪了——多半在<b>跷二郎腿或单侧承重</b>，放下腿、两边臀部坐均匀`,
  },
];

export const LEVELS=[
  {min:85,n:"优秀",hex:"#2ee6a8"},
  {min:70,n:"良好",hex:"#9be15d"},
  {min:50,n:"需调整",hex:"#ffb340"},
  {min:-1,n:"较差",hex:"#ff5c72"},
];

const clamp=(v,a,b)=>v<a?a:(v>b?b:v);

/* ------------------------------------------------------------
 * looksHuman(lm, ar) —— 人体几何合理性校验（防「幽灵跟踪」第一道防线）
 * MediaPipe 在人离开画面后常把椅子靠背/衣架/杂物跟踪成人体，且可见度
 * 可能高于阈值。真实坐姿人体满足以下几何约束，幽灵常常崩坏：
 *   1. 肩宽在画面中占比合理（0.015 ~ 0.95）
 *   2. 躯干长/肩宽 ∈ [0.4, 4.5]（可见时）
 *   3. 头参考点（耳/眼）不会远低于肩中点（> 0.65 肩宽 → 椅背顶/杂物）
 * 返回 false 的帧不视为「在位」。
 * ----------------------------------------------------------*/
export function looksHuman(lm, ar){
  const v = i => lm[i] ? (lm[i].visibility==null?1:lm[i].visibility) : 0;
  if (v(IDX.LSH)<0.5 || v(IDX.RSH)<0.5) return false;
  const shY=(lm[IDX.LSH].y+lm[IDX.RSH].y)/2;
  const sw = Math.hypot((lm[IDX.LSH].x-lm[IDX.RSH].x)*ar, lm[IDX.LSH].y-lm[IDX.RSH].y);
  if (!(sw>0.015 && sw<0.95)) return false;
  if (v(IDX.LHIP)>0.5 && v(IDX.RHIP)>0.5){
    const dx=((lm[IDX.LSH].x+lm[IDX.RSH].x)/2-(lm[IDX.LHIP].x+lm[IDX.RHIP].x)/2)*ar;
    const dy= shY-(lm[IDX.LHIP].y+lm[IDX.RHIP].y)/2;
    const torso=Math.hypot(dx,dy);
    if (torso/sw<0.4 || torso/sw>4.5) return false;
  }
  let headY=null;
  if (v(IDX.LEAR)>0.4 && v(IDX.REAR)>0.4) headY=(lm[IDX.LEAR].y+lm[IDX.REAR].y)/2;
  else if (v(IDX.LEYE)>0.4 && v(IDX.REYE)>0.4) headY=(lm[IDX.LEYE].y+lm[IDX.REYE].y)/2;
  if (headY!=null && headY-shY > 0.65*sw) return false;
  return true;
}

/* ------------------------------------------------------------
 * trackSpread(hist, winMs) —— 幽灵冻结检测（最强防线）
 * 真实摄像头的画面永远带传感器噪声，真人哪怕刻意静坐，呼吸起伏也会让
 * 关键点在滑动窗口内持续微动；而幽灵跟踪的输出经 MediaPipe 内部平滑后
 * 近乎恒定。窗口内关键点位置极差过小 → 跟踪已冻结，骨架不可信。
 *   hist  : [{t:毫秒, xs:[肩中x,肩中y,鼻x,鼻y]}]（时间升序）
 *   winMs : 滑动窗口宽度（毫秒）
 * 返回窗口内四个量的最大极差；样本不足（<8）返回 Infinity（不判定）。
 * ----------------------------------------------------------*/
export function trackSpread(hist, winMs){
  if (!hist || hist.length<8) return Infinity;
  const t1 = hist[hist.length-1].t;
  const dim = hist[hist.length-1].xs.length;
  const mn = new Array(dim).fill(Infinity), mx = new Array(dim).fill(-Infinity);
  let n=0;
  for (let i=hist.length-1; i>=0; i--){
    if (t1-hist[i].t > winMs) break;
    for (let j=0;j<dim;j++){
      const val=hist[i].xs[j];
      if (val<mn[j]) mn[j]=val;
      if (val>mx[j]) mx[j]=val;
    }
    n++;
  }
  if (n<8) return Infinity;
  let spread=0;
  for (let j=0;j<dim;j++) spread=Math.max(spread, mx[j]-mn[j]);
  return spread;
}

/* ------------------------------------------------------------
 * computeFeatures(lm, wl, ar, mirror)
 *   lm      : MediaPipe 33 个归一化 landmark（x,y ∈ [0,1]，含 visibility）
 *   wl      : worldLandmarks[0]（米，髋中点为原点），可为 null
 *   ar      : 画面宽高比 width/height，用于把 x 换算成等距坐标
 *
 * ★ 左右方向约定（必须固定，勿与「是否镜像显示」耦合）：
 *   用户面对镜头时，原始画面 +x 方向 = 用户的【左侧】——这与镜像显示无关
 *   （镜像只改变屏幕上怎么画，不改变画面与身体的对应关系）。
 *   因此下方所有有符号量统一约定：**正值 = 偏向用户自身右侧**。
 * ----------------------------------------------------------*/
export function computeFeatures(lm, wl, ar){
  const vis = i => lm[i] ? (lm[i].visibility==null?1:lm[i].visibility) : 0;
  const pt  = i => ({x:lm[i].x*ar, y:lm[i].y});
  const d2  = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const mid = (a,b)=>({x:(a.x+b.x)/2, y:(a.y+b.y)/2});

  if (vis(IDX.LSH)<0.35 || vis(IDX.RSH)<0.35) return {ok:false, reason:"肩部不可见"};
  const LSH=pt(IDX.LSH), RSH=pt(IDX.RSH);
  const sw = d2(LSH,RSH);
  if (!(sw>1e-4)) return {ok:false, reason:"特征退化"};
  const shMid = mid(LSH,RSH);

  // 朝向角：用 world landmarks 的肩轴角度（尺度无关，折叠到 [0,90]）
  let yawDeg = 0;
  if (wl && wl[IDX.LSH] && wl[IDX.RSH]){
    const dx = wl[IDX.RSH].x - wl[IDX.LSH].x, dz = wl[IDX.RSH].z - wl[IDX.LSH].z;
    if (Math.hypot(dx,dz) > 1e-6){
      let raw = Math.abs(Math.atan2(dz,dx)*180/Math.PI);
      yawDeg = raw>90 ? 180-raw : raw;
    }
  }
  const cosY = Math.max(0.35, Math.cos(yawDeg*Math.PI/180));

  const hasEar = vis(IDX.LEAR)>0.3 && vis(IDX.REAR)>0.3;
  const hasNose= vis(IDX.NOSE)>0.3;
  const hasHip = vis(IDX.LHIP)>0.45 && vis(IDX.RHIP)>0.45;

  const f = { ok:true, sw, yawDeg, hasEar, hasNose, hasHip, shMidY:shMid.y };

  // usgn：原始画面 +x（= 用户左侧）→ 用户右侧 的符号系数，恒为 -1
  const usgn = -1;

  // 头部参考点：耳朵优先；耳朵不可见时用眼睛兜底（眼距≈耳距/2.4，眼位比耳位低约
  // 0.025m，下面做对应尺度还原，保证耳/眼切换时基线连续）
  const visEar = vis(IDX.LEAR)>0.3 && vis(IDX.REAR)>0.3;
  const visEye = vis(IDX.LEYE)>0.3 && vis(IDX.REYE)>0.3;
  const hasHeadRef = visEar || visEye;

  if (hasHeadRef){
    const LE = visEar ? pt(IDX.LEAR) : pt(IDX.LEYE);
    const RE = visEar ? pt(IDX.REAR) : pt(IDX.REYE);
    const headMid = mid(LE,RE);
    const headW = d2(LE,RE);
    if (headW>1e-4){
      // 视线水平角（有符号，正 = 转向用户右侧）：鼻尖前伸在转头时的横向偏移。
      // 数值 ≈ 0.61·tan(头世界系转角)；耳/眼参考尺度不同，眼版本 ×0.41 还原
      if (hasNose){
        f.headYawM = usgn*(pt(IDX.NOSE).x - headMid.x)/headW * (visEar?1:0.41);
        f.headYaw = Math.abs(f.headYawM);
      }
      // 门控：大角度转头时头参考点几何失真，依赖「正脸」的指标关闭
      const gate = (f.headYaw||0) < (visEar ? 0.5 : 0.22);
      if (gate && visEar) f.shRound = sw/headW;   // 肩宽/耳距：仅耳版本有意义
      if (hasNose) f.noseSh = (shMid.y - pt(IDX.NOSE).y)/sw * cosY;
      f.neckH  = (shMid.y - headMid.y)/sw * cosY * (visEar?1:1.083);
      if (gate) f.headOff = usgn * (headMid.x - shMid.x)/sw;   // 正 = 偏向用户右侧
      // 歪头角：水平分量除以 cosY，还原被朝向压缩的投影 → 倾角与偏转角无关
      const eL = LE.x<=RE.x ? LE : RE, eR = LE.x<=RE.x ? RE : LE;
      f.headTilt = usgn * Math.atan2(eR.y-eL.y, (eR.x-eL.x)/cosY)*180/Math.PI;
    }
  }
  // 侧倾角（有符号，正 = 用户右侧肩部下沉）；水平分量同样做 cosY 还原
  const sL = LSH.x<=RSH.x ? LSH : RSH, sR = LSH.x<=RSH.x ? RSH : LSH;
  const shAng = Math.atan2(sR.y-sL.y, (sR.x-sL.x)/cosY)*180/Math.PI;
  f.leanDeg = usgn * shAng;

  if (hasHip){
    const LH=pt(IDX.LHIP), RH=pt(IDX.RHIP), hipMid=mid(LH,RH);
    if (hipMid.y > shMid.y){
      f.torsoH = (hipMid.y - shMid.y)/sw * cosY;
      const hL = LH.x<=RH.x ? LH : RH, hR = LH.x<=RH.x ? RH : LH;
      const hipAng = Math.atan2(hR.y-hL.y, (hR.x-hL.x)/cosY)*180/Math.PI;
      // 画面内肩/髋线夹角只反映额状面拧转（世界系扭转由 twistDeg 用 wl 计算）
      f.twistImgDeg = usgn*(shAng - hipAng);
      // 骨盆独立侧倾 = 髋线角 − 肩线角：整体刚性歪身时两者同步（差≈0，由 leanDeg 管），
      // 跷二郎腿/单侧承重时骨盆歪而肩被代偿回正（差显著非零）→ 与 leanDeg 互补
      f.pelvicTiltDeg = usgn*(hipAng - shAng);
    }
  }
  // 躯干扭转（真实轴向扭转）：worldLandmarks 里肩轴与髋轴在水平面内的夹角
  if (wl && wl[IDX.LSH] && wl[IDX.RSH] && wl[IDX.LHIP] && wl[IDX.RHIP]){
    const shAx = Math.atan2(wl[IDX.RSH].z-wl[IDX.LSH].z, wl[IDX.RSH].x-wl[IDX.LSH].x);
    const hipAx= Math.atan2(wl[IDX.RHIP].z-wl[IDX.LHIP].z, wl[IDX.RHIP].x-wl[IDX.LHIP].x);
    let tw = (shAx-hipAx)*180/Math.PI;
    tw = ((tw%360)+540)%360 - 180;            // 折到 [-180,180]
    if (tw>90) tw-=180; else if (tw<-90) tw+=180;  // 折到 [-90,90]（轴无方向性）
    f.twistDeg = usgn * tw;                   // 正 = 上半身向用户右侧拧
  }
  // 头前伸（米）：肩中点与鼻尖在 worldLandmarks 里的前后距离，正 = 头在肩前方
  if (wl && wl[IDX.LSH] && wl[IDX.RSH] && wl[IDX.NOSE]){
    f.headFwd = (wl[IDX.LSH].z + wl[IDX.RSH].z)/2 - wl[IDX.NOSE].z;
  }
  f.sizeR = sw;   // 屏幕距离代理（只有相对基线才有意义）
  return f;
}

/* ------------------------------------------------------------
 * scoreFeatures(f, base, sens)
 *   f    : computeFeatures 输出（通常已经 EMA 平滑）
 *   base : 校准基线（各指标的「标准值」），可为 null
 *   sens : 灵敏度系数（<1 更敏感，>1 更宽松），作用于 tol 与 scale
 * 返回 { score, level, issues, wsum }
 *   issues 按「权重 × 越界程度」降序，可直接取第一条作为给用户的建议
 * ----------------------------------------------------------*/
export function scoreFeatures(f, base, sens){
  const issues=[]; let wpen=0, wsum=0, mx=0;
  for (const m of METRICS){
    const v = f[m.k], b = base ? base[m.k] : undefined;
    const have = (typeof v === "number") && isFinite(v);
    // abs 指标（角度/偏移）无需基线即可用；rel 指标必须已校准
    const usable = have && (m.mode==="abs" ? true : (base ? typeof b==="number" : false));
    if (!usable) continue;
    wsum += m.w;
    let x=0, dir=0;
    if (m.mode==="abs"){
      // 有校准基线用基线；否则用指标的中性默认值（如头前伸的自然前凸 ~9.5cm）
      const bb = (typeof b==="number") ? b : (m.b0||0);
      const d = v - bb; dir = d>=0?1:-1;
      x = clamp((Math.abs(d)-m.tol*sens)/(m.scale*sens), 0, 1);
    } else {
      const d = (v-b)/Math.max(Math.abs(b),1e-6);
      if (m.kind==="lower" && d<0){ x = clamp((-d-m.tol*sens)/(m.scale*sens),0,1); dir=-1; }
      else if (m.kind==="upper" && d>0){ x = clamp((d-m.tol*sens)/(m.scale*sens),0,1); dir=1; }
      else if (m.kind==="both"){ x = clamp((Math.abs(d)-m.tol*sens)/(m.scale*sens),0,1); dir=d>=0?1:-1; }
    }
    if (x>0.02) issues.push({k:m.k, n:m.n, x, dir, w:m.w, v});
    wpen += m.w * x;
    if (x>mx) mx=x;
  }
  // 混合惩罚：0.65×加权平均（整体偏差）+ 0.35×最差单项（防止单点严重问题被平均稀释）
  const avg = wsum>0 ? wpen/wsum : 0;
  const pen = clamp(0.65*avg + 0.35*mx, 0, 1);
  const score = Math.round(100*(1-pen));
  issues.sort((a,b)=> (b.w*b.x)-(a.w*a.x));
  const lv = LEVELS.find(l=>score>=l.min);
  return { score, level:lv, issues, wsum };
}
