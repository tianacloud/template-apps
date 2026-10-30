import {createStore} from './cloud.js';
import './style.css';
import './load-style.js';
document.getElementById('app').className='wrap';
document.body.insertAdjacentHTML('beforeend','<div class="toast" id="toast"></div>');
for (const type of ['click','input','change','keydown']) document.addEventListener(type, function(event){
 const el=event.target.closest('[data-'+type+']'); if(!el)return;
 const action=el.getAttribute('data-'+type);
 if(type==='keydown'){if(event.key==='Enter')el.blur();return;}
 const match=/^([A-Za-z]+)\((.*)\)$/.exec(action);if(!match)return;
 const allowed=['calPreview','calCommit','calClear','recDateChange','submitEntry','cancelEdit','editEntry','delEntry','toggleHigh','setNum','slide','wipe','shiftYm','setTab'];
 if(!allowed.includes(match[1])||typeof window[match[1]]!=='function')return;
 const args=match[2] ? match[2].split(',').map(v=>{v=v.trim();if(v==='this.id')return el.id;if(v==='this.value')return el.value;if(v==='true')return true;if(v==='false')return false;if(/^[-0-9]+$/.test(v))return Number(v);if(/^'[^']*'$/.test(v))return v.slice(1,-1);return undefined;}) : [];
 window[match[1]](...args);
});

(function(){
'use strict';

/* ============ 工具 ============ */
var $ = function(id){ return document.getElementById(id); };
var pad = function(n){ return (n < 10 ? '0' : '') + n; };
function todayStr(){
  var n = new Date();
  return n.getFullYear() + '-' + pad(n.getMonth() + 1) + '-' + pad(n.getDate());
}
function ymNow(){ return todayStr().slice(0, 7); }
var OP_FROM = '0000-01';
function fmt(n){
  var v = Math.round(n * 100) / 100;
  return (v < 0 ? '-¥' : '¥') + Math.abs(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmt1(n){
  var v = Math.round(n * 100) / 100;
  return (v < 0 ? '-¥' : '¥') + Math.abs(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function daysInMonth(ym){
  var y = +ym.slice(0, 4), m = +ym.slice(5, 7);
  return new Date(y, m, 0).getDate();
}
function dateOf(ym, d){ return new Date(+ym.slice(0,4), +ym.slice(5,7) - 1, d); }
function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}

/* ============ 存储 ============ */
var defaults = {
  settings: {
    income: 8000, rent: 3400, utility: 250,
    insYear: 2000, maintYear: 1000,
    pd: 40, pt: 10, ps: 50,
    nHigh: 9, offsetPct: 10, cap: 2.0,
    bufferPct: 5, savePct: 30
  },
  months: {}
};
var S = JSON.parse(JSON.stringify(defaults));
function save(){
  store.save();
}
function defaultHigh(ym){
  var arr = [], n = daysInMonth(ym), st = S ? S.settings : defaults.settings;
  for(var i = 1; i <= n; i++){
    var wd = dateOf(ym, i).getDay();
    if(wd === 5 || wd === 6 || wd === 0) arr.push(i);
  }
  if(st.nHigh && arr.length === 0) return [];
  return arr;
}
function ensureMonth(ym){
  if(!S.months[ym]){
    S.months[ym] = {
      income: S.settings.income,
      highDays: defaultHigh(ym),
      days: {},
      repayments: []
    };
  }
  if(!S.months[ym].hasOwnProperty('income')) S.months[ym].income = S.settings.income;
  if(!S.months[ym].hasOwnProperty('repayments')) S.months[ym].repayments = [];
  return S.months[ym];
}

/* ============ 引擎（纯函数式全量重算） ============ */
function engine(ym, asOfD){
  var m = ensureMonth(ym);
  var st = S.settings;
  var dim = daysInMonth(ym);
  var C = (st.insYear + st.maintYear) / 12;
  var A = m.income - st.rent - st.utility - C;
  var daily = A * st.pd / 100;
  var travel = A * st.pt / 100;
  var savePlan = A * st.ps / 100;

  var highSet = {};
  (m.highDays || []).forEach(function(d){ highSet[d] = true; });
  var nH = (m.highDays || []).length;
  var nL = dim - nH;
  var p = st.offsetPct / 100;
  /* 超支池独立分账。 */
  var opEnabled = ym >= OP_FROM;
  var opPool = opEnabled ? daily * st.bufferPct / 100 : 0;
  var alloc = daily - opPool;   /* 参与每日额度分配的部分 */
  var F = nH + nL * (1 - p) / (1 + p);
  if(F <= 0) F = 1;
  var cH = alloc / F;
  var cL = cH * (1 - p) / (1 + p);

  /* —— 日常池校准：从校准日起，剩余天数按实际余额重新归一 ——
     实际余额天然包含昨日结余（钱没花就还在）：归一只摊「扣除昨日滚入」的部分，
     昨日结余照常滚入今天（封顶照旧），避免结余被摊薄、也避免双重计算 */
  var calib = null, seg2 = null;
  if(m.calib && m.calib.amount != null && isFinite(+m.calib.amount) && m.calib.d >= 1 && m.calib.d <= dim){
    calib = { d: Math.round(+m.calib.d), amount: Math.max(0, +m.calib.amount) };
    /* 校准锚定：amount 是用户「校准那一刻」的实际余额；若校准前当天已有记账，
       那些花费已体现在 amount 里，须加回 daySpent（校准时当日已花的快照）还原成
       「当日零点」口径，否则同一天的账会被扣两次（校准吞今日已花） */
    var daySpent0 = (m.calib.daySpent != null && isFinite(+m.calib.daySpent))
                  ? Math.max(0, +m.calib.daySpent) : 0;
    var amt0 = calib.amount + daySpent0;   /* 校准日零点口径的日常池锚 */
    /* 预跑校准日前半段：截至前夜的结转 vPre + 前期「已结算转存净额」+ 超支池已动用。
       有日终快照读快照（既成事实、与 rIn 严格一致）；没有才用月初计划模拟。
       校准填的是实际账户余额：其中属于存款池（前期转存净额）和超支池的钱必须从
       日常池基数里扣除，否则同一笔钱在两个池里各算一次，月池余额虚高。 */
    var vPre = 0, sAcc = 0, suAcc = 0, preOp = 0;
    for(var q0 = 1; q0 < calib.d; q0++){
      var k0 = ym + '-' + pad(q0);
      var rec0 = m.days[k0];
      if(rec0 && rec0.settled){
        vPre = rec0.settled.toNext || 0;   /* 最后一天快照的滚入 = 校准日 rIn，与基数扣减口径一致 */
        sAcc += rec0.settled.u || 0;
        suAcc += rec0.settled.useSaved || 0;
        preOp += rec0.settled.useOp || 0;
      } else {
        var b0 = highSet[q0] ? cH : cL;
        var r0 = Math.min(vPre, (st.cap - 1) * b0);
        var clip0 = vPre - r0;   /* 封顶截流（日初进存款，与主循环同口径） */
        var sp0 = (rec0 && rec0.spent) || 0;
        var rem0 = b0 + r0 - sp0;
        if(rem0 >= 0){
          vPre = rem0 * (1 - st.savePct / 100);
          sAcc += clip0 + rem0 * st.savePct / 100;
        } else {
          /* 与主循环同顺序：补救只能动「之前日子」的转存，当日截流补救完才入账 */
          var ov0 = -rem0, us0 = Math.min(ov0, sAcc - suAcc);
          suAcc += us0;
          var gap0 = ov0 - us0;
          if(gap0 > 0.005 && opEnabled && gap0 <= (opPool - preOp) + 1e-9){ preOp += gap0; }
          sAcc += clip0;
          vPre = 0;
        }
      }
    }
    var preSaved = Math.max(0, sAcc - suAcc);                 /* 前期转存净额（在实余额里，属存款池） */
    var opRem0 = opEnabled ? Math.max(0, opPool - preOp) : 0; /* 校准时超支池剩余（属超支池信封） */
    var availAmt = Math.max(0, amt0 - preSaved - opRem0);     /* 真正属于日常池的钱（零点口径） */
    var netAmt = Math.max(0, availAmt - vPre);   /* 摊到剩余天的部分（昨日滚入经 rIn 回来，不重复摊） */
    if(netAmt === 0 && availAmt > 0) netAmt = availAmt;  /* 极端边界：日常池的钱比昨日滚入还少 → 全额归一，避免基准归零 */
    var nH2 = 0;
    for(var q = calib.d; q <= dim; q++){ if(highSet[q]) nH2++; }
    var tot2 = dim - calib.d + 1, nL2 = tot2 - nH2;
    var F2 = nH2 + nL2 * (1 - p) / (1 + p);
    if(F2 <= 0) F2 = 1;
    var cH2 = netAmt / F2;
    seg2 = { cH: cH2, cL: cH2 * (1 - p) / (1 + p), nH: nH2, nL: nL2, days: tot2, carry: vPre,
             preSaved: preSaved, opRem: opRem0, amt0: amt0, daySpent: daySpent0 };
  }

  var YN = ymNow();
  var todayD = (ym === YN) ? (asOfD != null ? asOfD : +todayStr().slice(8, 10)) : (ym < YN ? dim : 0);
  var isPastMonth = ym < YN;
  var isCurMonth = ym === YN;

  /* —— 日循环（可重跑：第一遍跑全月取「今天零点」快照，第二遍用动态段重算今天起） —— */
  function runDays(init, dynSeg){
    var days = init.days || {};
    var v = init.v, poolSpent = init.poolSpent, savedSum = init.savedSum, savedUsed = init.savedUsed;
    var overSum = init.overSum, opLeft = init.opLeft, opUsed = init.opUsed;
    var savedAvail = init.savedAvail, snap = null;
    for(var i = init.from; i <= dim; i++){
      if(init.snapAt === i){
        snap = { v: v, poolSpent: poolSpent, savedSum: savedSum, savedUsed: savedUsed,
                 overSum: overSum, opLeft: opLeft, opUsed: opUsed, savedAvail: savedAvail };
      }
      var key = ym + '-' + pad(i);
      var isHigh = !!highSet[i];

      /* —— 已定格的历史日：直接读快照，永不重算 —— */
      var dayRec = m.days[key];
      var isDoneDay = isPastMonth || (isCurMonth && i < todayD);
      if(isDoneDay && dayRec && dayRec.settled
         && Math.abs((dayRec.spent || 0) - (dayRec.settled.spent || 0)) < 0.005){
        var st2 = dayRec.settled;
        var recS = dayRec.spent || 0;
        days[key] = { d: i, isHigh: isHigh, inCalib: false, inDyn: false,
                      isCalibDay: false,
                      base: st2.base, rIn: st2.rIn, L: st2.L, spent: recS,
                      remain: st2.L - recS, u: st2.u, toNext: st2.toNext, over: st2.over,
                      useSaved: st2.useSaved || 0, useOp: st2.useOp || 0, gap: st2.gap || 0,
                      isPast: true, isDone: true };
        v = st2.toNext;
        poolSpent += recS;
        overSum += st2.over;
        savedSum += st2.u;
        savedAvail += st2.u;
        savedUsed += (st2.useSaved || 0);
        savedAvail -= (st2.useSaved || 0);
        opLeft -= (st2.useOp || 0);
        opUsed += (st2.useOp || 0);
        continue;
      }

      var base = isHigh ? cH : cL;
      var inCalib = false, inDyn = false;
      if(dynSeg && i >= dynSeg.d){ base = highSet[i] ? dynSeg.cH : dynSeg.cL; inDyn = true; }
      else if(seg2 && i >= calib.d){ base = highSet[i] ? seg2.cH : seg2.cL; inCalib = true; }
      var rIn = Math.min(v, (st.cap - 1) * base);
      /* 封顶截下的结转不消失：并入当日转存（进存款池，账目守恒） */
      var capEx = v - rIn;
      /* 动态段首日：这笔结转已在段总额里扣除，照单全收不再封顶（否则会漏钱） */
      if(dynSeg && i === dynSeg.d){ rIn = v; capEx = 0; }
      var L = base + rIn;
      var rec = (m.days[key] && m.days[key].spent) || 0;
      var remain = L - rec;
      var u = 0, toNext = 0, over = 0;
      if(remain >= 0){ u = remain * st.savePct / 100; toNext = remain - u; }
      else { over = -remain; }
      u += capEx;   /* 封顶截流 = 当日转存的一部分 */
      var useSaved = 0, useOp = 0, gap = 0;
      days[key] = { d: i, isHigh: isHigh, inCalib: inCalib || inDyn, inDyn: inDyn,
                    isCalibDay: !!(seg2 && i === calib.d),
                    base: base, rIn: rIn, L: L, spent: rec, capEx: capEx,
                    remain: remain, u: u, toNext: toNext, over: over,
                    useSaved: 0, useOp: 0, gap: 0,
                    isPast: isPastMonth || (isCurMonth && i <= todayD),
                    isDone: isPastMonth || (isCurMonth && i < todayD) };
      v = toNext;
      if(days[key].isPast){
        poolSpent += rec;
        overSum += over;
        /* —— 超支补救两级：先动本月已转存的钱，不够再用超支池 —— */
        gap = over;
        /* 第一级：本月已结算转存（自己这个月攒下的，有多少抵多少） */
        if(gap > 0.005 && savedAvail > 0.005){
          useSaved = Math.min(gap, savedAvail);
          savedAvail -= useSaved;
          savedUsed += useSaved;
          gap -= useSaved;
        }
        /* 第二级：超支池（全或无：剩余缺口 ≤ 池剩余 → 全扣；> 剩余 → 分文不动，直接收紧日均） */
        if(gap > 0.005 && opEnabled && gap <= opLeft + 1e-9){
          useOp = gap;
          opLeft -= useOp;
          opUsed += useOp;
          gap = 0;
        }
        days[key].useSaved = useSaved;
        days[key].useOp = useOp;
        days[key].gap = gap;
      }
      /* 转存只结算「已结束」的日子；今天的结余是预估，不提前入账。
         封顶截流例外：它发生在日初（结转进入时），今天的也立即入账，否则信封对不上 */
      if(days[key].isDone){ savedSum += u; savedAvail += u; }
      else if(capEx > 0 && days[key].isPast){ savedSum += capEx; savedAvail += capEx; }
    }
    return { days: days, v: v, poolSpent: poolSpent, savedSum: savedSum, savedUsed: savedUsed,
             overSum: overSum, opLeft: opLeft, opUsed: opUsed, savedAvail: savedAvail, snap: snap };
  }

  /* 第一遍：按月初计划（含手动校准段）跑全月，同时取「今天零点」的历史快照 */
  var p1 = runDays({ from: 1, v: 0, poolSpent: 0, savedSum: 0, savedUsed: 0,
                     overSum: 0, opLeft: opPool, opUsed: 0, savedAvail: 0, days: {},
                     snapAt: todayD }, null);

  /* —— 动态收紧段 ——
     让「今天起到月底」的额度之和 = 实际剩下来的钱，否则计划额度加起来会超过月池余额（对不上账）。
     段总额刻意不含今日已花：否则会「花超 → 收紧 → 判定更超 → 再收紧」自我发散；
     只有历史的花费 / 转存 / 补救才影响未来基准。昨夜结转照常留给今天，不摊薄。 */
  var dyn = null;
  if(isCurMonth && todayD >= 1 && p1.snap){
    var sn = p1.snap, remainStart;
    var todayCapEx = (p1.days[ym + '-' + pad(todayD)] && p1.days[ym + '-' + pad(todayD)].capEx) || 0;
    if(seg2 && calib.d <= todayD){
      /* 手动校准过：以用户填的实际余额为基数，扣掉校准日到昨天之间已花 / 已转存的部分
         （前期转存净额与超支池余额同基数口径，已在 seg2 里扣除，这里不重复扣） */
      var sp0 = 0, sv0 = 0, su0 = 0, ou0 = 0;
      for(var qd = calib.d; qd < todayD; qd++){
        var kd = ym + '-' + pad(qd);
        sp0 += p1.days[kd].spent;
        sv0 += p1.days[kd].u;
        su0 += p1.days[kd].useSaved || 0;
        ou0 += p1.days[kd].useOp || 0;
      }
      remainStart = (seg2.amt0 != null ? seg2.amt0 : calib.amount)
                  - (seg2.preSaved || 0) - (seg2.opRem || 0) - sp0 - sv0 + su0 + ou0 - todayCapEx;
    } else {
      remainStart = alloc - sn.poolSpent - (sn.savedSum - sn.savedUsed) + sn.opUsed - todayCapEx;
    }
    var carry = p1.days[ym + '-' + pad(todayD)].rIn;   /* 昨夜滚入（已封顶），留给今天 */
    var netDyn = Math.max(0, remainStart - carry);
    var nH3 = 0;
    for(var q3 = todayD; q3 <= dim; q3++){ if(highSet[q3]) nH3++; }
    var tot3 = dim - todayD + 1, nL3 = tot3 - nH3;
    var F3 = nH3 + nL3 * (1 - p) / (1 + p);
    if(F3 <= 0) F3 = 1;
    var cH3 = netDyn / F3;
    dyn = { d: todayD, cH: cH3, cL: cH3 * (1 - p) / (1 + p), nH: nH3, nL: nL3,
            days: tot3, carry: carry, remainStart: remainStart };
  }

  /* 第二遍：从今天起用动态段重算。1..todayD-1 保留第一遍结果（既成事实，不追溯改写）。
     今日「封顶截流」已在日初真实发生（第一遍算出），段内不再截流，须把它计入转存总额并
     补回今日条目，否则存款池与信封各少一块 */
  var todayCapEx0 = (dyn && p1.days[ym + '-' + pad(todayD)]) ? (p1.days[ym + '-' + pad(todayD)].capEx || 0) : 0;
  var R = dyn ? runDays({ from: todayD, days: p1.days, v: dyn.carry,
                          poolSpent: p1.snap.poolSpent, savedSum: p1.snap.savedSum + todayCapEx0,
                          savedUsed: p1.snap.savedUsed, overSum: p1.snap.overSum,
                          opLeft: p1.snap.opLeft, opUsed: p1.snap.opUsed,
                          savedAvail: p1.snap.savedAvail + todayCapEx0 }, dyn) : p1;
  if(dyn && todayCapEx0 > 0){
    var tk0 = ym + '-' + pad(todayD);
    R.days[tk0].capEx = todayCapEx0;
    R.days[tk0].u += todayCapEx0;   /* u = 今日进存款池的全部（截流已发生 + 预估结余），快照须自洽 */
  }
  var days = R.days;
  var poolSpent = R.poolSpent, savedSum = R.savedSum, savedUsed = R.savedUsed;
  var overSum = R.overSum, opLeft = R.opLeft, opUsed = R.opUsed, savedAvail = R.savedAvail;

  var spentInCalib = 0, savedInCalib = 0, savedUsedInCalib = 0, opUsedInCalib = 0;
  if(seg2){
    for(var q2 = calib.d; q2 <= todayD && q2 <= dim; q2++){
      spentInCalib += days[ym + '-' + pad(q2)].spent;
      savedUsedInCalib += days[ym + '-' + pad(q2)].useSaved || 0;
      opUsedInCalib += days[ym + '-' + pad(q2)].useOp || 0;
    }
    /* 校准日起「已结束」日子的转存：钱已进存款池，不能再算作日常池可花。
       今天的转存是预估不扣，但今天的「封顶截流」日初已入存款池，必须扣除（否则双重计数） */
    for(var q3 = calib.d; q3 <= todayD && q3 <= dim; q3++){
      var dk = days[ym + '-' + pad(q3)];
      savedInCalib += dk.isDone ? dk.u : (dk.capEx || 0);
    }
  }
  /* —— 月池余额口径 ——
     已结算的转存已离开日常池（进了存款），必须从余额里扣掉，否则会「同一笔钱既算存款又算能花」；
     今日预估转存还没发生（今天没结束，继续花它就会变小），仍留在池内，
     只在算「未来日均」时剔除——因为未来日均对应的是明天起的日子。 */
  var todayU = (isCurMonth && days[todayStr()]) ? days[todayStr()].u - (days[todayStr()].capEx || 0) : 0;
  /* 超支若被「已转存」或「超支池」抵补，等于那笔钱从存款/信封拿回来花掉：
     转存回退（+savedUsed）、信封回流（+opUsed），与多花掉的钱正好抵消 → 月池余额不受影响。
     两者都必须加回，否则同一笔钱在日常池和信封里各扣一次（月底会算出负数）。 */
  var savedNet = savedSum - savedUsed;
  var bookRemain = alloc - poolSpent - savedNet + opUsed;
  /* 校准口径：实余额里扣除前期转存净额与超支池余额后，才是日常池的钱；
     超支若被「已转存」「超支池」抵补，那部分花销不算日常池出的，加回来 → 月池余额不受影响 */
  var calBase = seg2 ? (seg2.amt0 != null ? seg2.amt0 : calib.amount) : 0;  /* 零点口径锚：含校准当日已花 */
  /* 不截断：透支时如实显示负数（与未校准口径一致），否则信封总账会凭空多出钱 */
  var poolRemain = seg2 ? calBase - (seg2.preSaved || 0) - (seg2.opRem || 0)
                        - spentInCalib - savedInCalib + savedUsedInCalib + opUsedInCalib : bookRemain;
  var daysLeft = isCurMonth ? (dim - todayD) : (isPastMonth ? 0 : dim);
  var futureDaily = daysLeft > 0 ? (poolRemain - todayU) / daysLeft : 0;
  if(futureDaily < 0) futureDaily = 0;

  // 今日 / 明日
  var todayKey = todayStr(), td = null, tmr = null;
  if(isCurMonth && todayD >= 1 && todayD <= dim){
    td = days[todayKey];
    var ni = todayD + 1;
    if(ni <= dim){
      tmr = days[ym + '-' + pad(ni)];
    }
  }

  // 校准漂移：实际剩余 − 账面剩余（负 = 有未记录的花销）；与月池余额同口径
  var drift = seg2 ? (calBase - (seg2.preSaved || 0) - (seg2.opRem || 0)
              - spentInCalib - savedInCalib + savedUsedInCalib + opUsedInCalib) - bookRemain : null;

  return {
    ym: ym, dim: dim, C: C, A: A, daily: daily, travel: travel, savePlan: savePlan,
    cH: cH, cL: cL, nH: nH, alloc: alloc,
    days: days, poolSpent: poolSpent, savedSum: savedSum, overSum: overSum,
    savedUsed: savedUsed, savedNet: savedNet, savedAvail: savedAvail,
    poolRemain: poolRemain, daysLeft: daysLeft, futureDaily: futureDaily,
    todayU: todayU, savedInCalib: savedInCalib, savedUsedInCalib: savedUsedInCalib,
    opUsedInCalib: opUsedInCalib,
    opEnabled: opEnabled, opPool: opPool, opUsed: opUsed, opLeft: opLeft,
    today: td, tomorrow: tmr, isCurMonth: isCurMonth, isPastMonth: isPastMonth,
    monthIncome: m.income,
    calib: calib, seg2: seg2, spentInCalib: spentInCalib, bookRemain: bookRemain, drift: drift,
    dyn: dyn
  };
}

/* —— 日终快照：跨天时把昨天的账定格，以后永不重算 —— */
function settleDays(ym){
  var m = ensureMonth(ym);
  var YN = ymNow();
  if(ym > YN) return;
  var dim = daysInMonth(ym);
  var todayD = (ym === YN) ? +todayStr().slice(8, 10) : dim;
  var lastSettle = (ym === YN) ? todayD - 1 : dim;
  for(var d = 1; d <= lastSettle; d++){
    var key = ym + '-' + pad(d);
    var rec = m.days[key];
    if(!rec) rec = m.days[key] = { spent: 0, entries: [] };  /* 无记录的日子也要定格 */
    /* 已定格且 spent 未变 → 跳过 */
    if(rec.settled && Math.abs((rec.spent || 0) - (rec.settled.spent || 0)) < 0.005) continue;
    delete rec.settled;  /* spent 不匹配 → 旧快照作废 */
    /* 用「那天作为今天」的视角跑引擎，取那天的结果定格 */
    var e = engine(ym, d);
    var dd = e.days[key];
    if(!dd) continue;
    rec.settled = {
      base: dd.base, rIn: dd.rIn, L: dd.L, spent: dd.spent,
      u: dd.u, toNext: dd.toNext, over: dd.over,
      useSaved: dd.useSaved || 0, useOp: dd.useOp || 0, gap: dd.gap || 0
    };
  }
}

/* 改历史支出/校准/高低日标记时，清除该日及之后的所有快照（连锁失效） */
function clearSettledFrom(ym, fromD){
  var m = ensureMonth(ym);
  var dim = daysInMonth(ym);
  for(var d = fromD; d <= dim; d++){
    var key = ym + '-' + pad(d);
    if(m.days[key] && m.days[key].settled) delete m.days[key].settled;
  }
}

var CLOUD={user:null,get dirty(){return store.dirty;},lastSyncTxt:''};
function setSync(st){var d=$('sync-dot'),t=$('sync-txt');if(d)d.className='sync'+(st?' '+st:'');if(t)t.textContent=st==='saving'?'同步中':st==='err'?'未同步，请刷新核对':'已同步';if(st==='err')toast('保存未确认或发生并发冲突，请刷新核对');}
var store=createStore(function(data){S=data;if(!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))render();},setSync);
async function boot(){try{S=await store.start(defaults,()=>S);ensureMonth(ymNow());render();}catch(e){$('app').innerHTML='<div class="login-stage"><div class="login-card"><div class="login-brand">日 用</div><div class="login-sub">账本暂不可用，请刷新重试</div></div></div>';}}
/* ============ UI 状态 ============ */
var UI = { tab: 'today', ym: ymNow() };

var TABS = [
  ['today', '今日'], ['cal', '月历'], ['ledger', '存款'], ['repay', '还款'], ['set', '设置']
];

function toast(msg){
  var t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._h);
  toast._h = setTimeout(function(){ t.classList.remove('show'); }, 1800);
}

/* ============ 视图：今日 ============ */
function viewToday(e){
  var h = '';
  var isCur = UI.ym === ymNow();
  var canRecord = isCur;

  h += '<div class="hero">';
  if(e.today){
    var r = e.today.remain;
    h += '<div class="hl">今天还能花</div>';
    h += '<div class="big' + (r < 0 ? ' over' : '') + '">'
       + (r < 0 ? fmt(Math.abs(r)) : fmt1(r)) + (r < 0 ? '<small>已超支</small>' : '<small>/ 剩余</small>') + '</div>';
    h += '<div class="hsub">'
       + (e.calib ? '<b>已校准</b> · ' : '')
       + (e.today.isHigh ? '<b>高消费日</b>' : '低消费日')
       + ' · 基准 ' + fmt1(e.today.base) + (e.dyn ? '<span class="tag tag-dyn">动态</span>' : '')
       + (e.today.rIn > 0.01 ? ' + 昨日滚入 ' + fmt1(e.today.rIn) : '')
       + (r >= 0 ? ' · 若今天到此为止：预估转存 ' + fmt1(e.today.u) + '，明天额度多 ' + fmt1(e.today.toNext) : '')
       + '</div>';
  } else {
    h += '<div class="hl">' + e.ym.slice(0,4) + ' 年 ' + (+e.ym.slice(5,7)) + ' 月 · 计划视图</div>';
    h += '<div class="big">' + fmt1(e.alloc / e.dim) + '<small>/ 日均</small></div>';
    h += '<div class="hsub">月度日常池 ' + fmt(e.daily) + (e.opEnabled ? '（其中超支池 ' + fmt(e.opPool) + ' 单独分账）' : '（本月超支池停用）')
       + ' · ' + (e.isPastMonth ? '本月已结束' : '未来月份，展示计划额度') + '</div>';
  }
  h += '</div>';

  // 三个约束
  h += '<div class="grid3">';
  h += '<div class="mini"><div class="n">今日额度 <span class="tag tag-soft">软</span></div>'
     + '<div class="v">' + (e.today ? fmt1(e.today.L) : '—') + '</div>'
     + '<div class="d">' + (e.today
         ? (e.today.isHigh ? '高消费日基准' : '低消费日基准')
           + (e.dyn ? ' · 按实际剩余重算（月初 ' + fmt1((e.seg2 || e)[e.today.isHigh ? 'cH' : 'cL']) + '）' : '')
         : '') + '</div></div>';
  // 月池余额（校准后口径不同，说明文字要变）
  h += '<div class="mini"><div class="n">月池余额 <span class="tag tag-hard">硬</span></div>'
     + '<div class="v">' + fmt(e.poolRemain) + '</div>'
     + '<div class="d">' + (e.calib
        ? '校准 ' + fmt(e.calib.amount)
          + ((e.seg2 && e.seg2.daySpent > 0.01) ? ' + 当日已花 ' + fmt1(e.seg2.daySpent) : '')
          + ((e.seg2 && e.seg2.preSaved > 0.01) ? ' − 前期转存 ' + fmt1(e.seg2.preSaved) : '')
           + ((e.seg2 && e.seg2.opRem > 0.01) ? ' − 超支池 ' + fmt1(e.seg2.opRem) : '')
           + ' − 校准后已花 ' + fmt(e.spentInCalib)
           + (e.savedInCalib > 0.01 ? ' − 已转存 ' + fmt1(e.savedInCalib) : '')
           + (e.savedUsedInCalib > 0.01 ? ' + 转存回退 ' + fmt1(e.savedUsedInCalib) : '')
           + (e.opUsedInCalib > 0.01 ? ' + 超支池补 ' + fmt1(e.opUsedInCalib) : '')
         : '分配额 ' + fmt(e.alloc) + ' − 已花 ' + fmt(e.poolSpent)
           + (e.savedNet > 0.01 ? ' − 净转存 ' + fmt1(e.savedNet) : '')
           + (e.opUsed > 0.01 ? ' + 超支池补 ' + fmt1(e.opUsed) : '')
           + (e.opEnabled ? '（另存超支池 ' + fmt(e.opPool) + '）' : '')) + '</div></div>';
  h += '<div class="mini"><div class="n">剩余天数日均</div>'
     + '<div class="v">' + (e.daysLeft > 0 ? fmt1(e.futureDaily) : '—') + '</div>'
     + '<div class="d">' + (e.daysLeft > 0 ? '还剩 ' + e.daysLeft + ' 天 · 两个数打架时听它' : '本月已走完') + '</div></div>';
  h += '</div>';

  // 日常池校准（仅当月显示）
  if(isCur){
    h += '<div class="card"><h3>日常池校准 <span style="font-weight:400;letter-spacing:0;color:var(--ink-3);font-size:12px">（账面对不上时，以实际为准）</span></h3>';
    h += '<div class="addrow">';
    h += '<div class="fld" style="width:220px"><label>到月底实际还能花（含今天）</label>'
       + '<input type="number" id="cal-amt" min="0" step="0.01" placeholder="账面 ' + fmt(e.bookRemain) + '"'
       + (e.calib && e.calib.d === +todayStr().slice(8, 10) ? ' value="' + e.calib.amount + '"' : '')
       + ' data-input="calPreview()" data-change="calCommit()" data-keydown="if(event.key===\'Enter\')this.blur()"></div>';
    h += '<button class="btn btn-main" data-click="calCommit()">校 准</button>';
    if(e.calib) h += '<button class="btn btn-ghost" data-click="calClear()">清除校准</button>';
    h += '</div>';
    h += '<div id="cal-preview" style="margin-top:8px;font-size:12.5px;color:var(--ink-2);line-height:1.7"></div>';
    if(e.calib){
      var dCl = e.drift;
      var effH = e.dyn ? e.dyn.cH : e.seg2.cH, effL = e.dyn ? e.dyn.cL : e.seg2.cL;
      if(dCl < -0.5){
        h += '<div class="notice warn"><b>实际比账面少 ' + fmt1(-dCl) + '。</b>'
           + '这部分是没记下来的花销或超支 —— 不用回头补账，从 '
           + e.calib.d + ' 日起剩余 ' + e.seg2.days + ' 天（' + e.seg2.nH + ' 高 + ' + e.seg2.nL + ' 低）'
           + '已按 <b>' + fmt(e.calib.amount) + '</b> 重新分配：高日 ' + fmt1(effH) + ' / 低日 ' + fmt1(effL) + '。'
           + '结转与封顶规则照常。</div>';
      } else if(dCl > 0.5){
        h += '<div class="notice info"><b>实际比账面多 ' + fmt1(dCl) + '。</b>'
           + '之前记账偏保守（或有结余没入账）—— 多出的钱已进入后续分配：'
           + '从 ' + e.calib.d + ' 日起 ' + e.seg2.days + ' 天，高日 ' + fmt1(effH) + ' / 低日 ' + fmt1(effL) + '。</div>';
      } else {
        h += '<div class="notice ok"><b>账实相符。</b>校准段从 ' + e.calib.d + ' 日起：高日 '
           + fmt1(effH) + ' / 低日 ' + fmt1(effL) + '。</div>';
      }
      h += '<div style="margin-top:2px;font-size:11.5px;color:var(--ink-3)">'
         + '之后每天记的每一笔都会从校准余额里扣，额度随实际动态更新；再次对不上时，重新填一次即可（会覆盖）。</div>';
    } else {
      h += '<div class="notice info">收入和计划不用改 —— 改的是<b>余额</b>。数一下这个月日常开销的钱实际还剩多少（含今天能花的），'
         + '填进去：从今天到月底的所有额度按这个真实数字重新分配，之前没记上的账不用回头补。'
         + '填的数和账面（' + fmt(e.bookRemain) + '）的差额就是本月的「漂移」。</div>';
    }
    /* 动态收紧常驻说明：让「今日起各天额度之和」= 月池余额，账目自洽 */
    if(e.dyn){
      var planH = e.seg2 ? e.seg2.cH : e.cH, planL = e.seg2 ? e.seg2.cL : e.cL;
      var dH = e.dyn.cH - planH;
      var tagTxt = dH < -0.5 ? '已因超支收紧' : (dH > 0.5 ? '因结余放宽' : '与计划一致');
      h += '<div class="notice info" style="margin-top:10px"><b>今日起额度按实际剩余动态重算。</b>'
         + '高日 <b>' + fmt1(e.dyn.cH) + '</b> / 低日 <b>' + fmt1(e.dyn.cL) + '</b>'
         + '（月初计划 ' + fmt1(planH) + ' / ' + fmt1(planL) + ' · ' + tagTxt + '）。'
         + '<br>今日起各天额度之和 + 昨日滚入 ' + fmt1(e.dyn.carry) + ' = 实际剩余 '
         + fmt(e.dyn.remainStart) + '，<b>账目严格对得上</b>。今天的花销不会改变今天的基准，只在明天生效。</div>';
    }
    h += '</div>';
  }

  // 超支 / 提醒（补救顺序：本月已转存 → 超支池 → 都不够则收紧日均）
  if(e.today && e.today.over > 0.01){
    var ov = e.today.over, us = e.today.useSaved || 0, uo = e.today.useOp || 0, gp = e.today.gap || 0;
    if(gp <= 0.005){
      var src = [];
      if(us > 0.005) src.push('本月已转存抵 ' + fmt1(us));
      if(uo > 0.005) src.push('超支池抵 ' + fmt1(uo));
      h += '<div class="notice ok"><b>今日超支 ' + fmt1(ov) + '，已全额自动补救。</b>'
         + '来源：' + src.join(' ＋ ')
         + (us > 0.005 ? '（本月存款相应减少 ' + fmt1(us) + '）' : '')
         + ' —— <b>明天计划一字不改</b>，日常池不受影响。</div>';
    } else {
      h += '<div class="notice warn"><b>今日超支 ' + fmt1(ov) + '，已转存（余 '
         + fmt1(e.savedAvail) + '）与超支池（余 ' + fmt1(e.opLeft) + '）加起来仍差 '
         + fmt1(gp) + '。</b>'
         + '按约定杯水车薪就不动这两笔钱，缺口通过月池余额收紧：剩余 ' + e.daysLeft + ' 天，未来日均已降至 '
         + fmt1(e.futureDaily) + '。无需手动补救。</div>';
    }
  } else if(e.today && e.daysLeft > 0 && e.futureDaily > 0 && e.today.base - e.futureDaily > 1){
    h += '<div class="notice info">今日额度 ' + fmt1(e.today.L) + ' 高于剩余日均 '
       + fmt1(e.futureDaily) + ' —— 前几日的结转让你今天偏快了，<b>今天实际按 ' + fmt1(Math.min(e.today.L, e.futureDaily)) + ' 走更稳</b>。</div>';
  }

  // 今日结算 + 明日 + 超支池
  if(e.today){
    h += '<div class="grid3">';
    h += '<div class="mini"><div class="n">今日预估转存 <span class="tag tag-save">估</span></div>'
       + '<div class="v" style="color:var(--save)">' + fmt1(e.today.u) + '</div>'
       + '<div class="d">结余的 ' + S.settings.savePct + '% · 今天结束时才结算，今天再花会变</div></div>';
    h += '<div class="mini"><div class="n">明天额度预测</div>'
       + '<div class="v">' + (e.tomorrow ? fmt1(e.tomorrow.base + e.today.toNext) : '—') + '</div>'
       + '<div class="d">'
       + (e.tomorrow
           ? (e.tomorrow.isHigh ? '高消费日基准' : '低消费日基准') + ' ' + fmt1(e.tomorrow.base)
             + (e.today.toNext > 0.01 ? ' + 今日滚入 ' + fmt1(e.today.toNext) : ' + 今日无滚入')
           : '本月最后一天 · 结余将在月底按 50/50 分流')
       + '</div></div>';
    h += '<div class="mini"><div class="n">超支池 <span class="tag tag-hard">兜底</span></div>'
       + (e.opEnabled
           ? '<div class="v">' + fmt1(e.opLeft) + '<small style="font-size:12px;color:var(--ink-3)"> / ' + fmt(e.opPool) + '</small></div>'
             + '<div class="d">' + (e.opUsed > 0.005 ? '本月已扣 ' + fmt1(e.opUsed) + ' · ' : '')
             + '第二道兜底：先动本月已转存（可动用 ' + fmt1(e.savedAvail) + '），再动它</div>'
           : '<div class="v" style="color:var(--ink-3)">停用</div>'
             + '<div class="d">超支池未启用（超支先动本月已转存 ' + fmt1(e.savedAvail) + '）</div>')
       + '</div>';
    h += '</div>';
  }

  // 记一笔 / 补记（可选本月任意已过日期，可改可删）
  if(canRecord){
    var tD = +todayStr().slice(8, 10);
    var recD = (UI.recDate && UI.recDate.indexOf(UI.ym) === 0 && +UI.recDate.slice(8, 10) <= tD)
             ? UI.recDate : todayStr();
    UI.recDate = recD;
    var recDay = +recD.slice(8, 10);
    var editing = UI.editId != null;
    h += '<div class="card"><h3>' + (editing ? '修改一笔' : '记一笔')
       + (recDay !== tD ? '<span style="font-weight:400;font-size:12px;color:var(--ink-3)">（补记 ' + recDay + ' 日）</span>' : '') + '</h3>';
    h += '<div class="addrow">';
    h += '<div class="fld" style="width:150px"><label>日期</label><select id="in-date" data-change="recDateChange()">';
    for(var di = tD; di >= 1; di--){
      h += '<option value="' + UI.ym + '-' + pad(di) + '"' + (di === recDay ? ' selected' : '') + '>'
         + pad(di) + ' 日' + (di === tD ? '（今天）' : '') + '</option>';
    }
    h += '</select></div>';
    h += '<div class="fld f-amt"><label>金额</label><input type="number" id="in-amt" min="0" step="0.01" placeholder="0.00"></div>';
    h += '<div class="fld f-note"><label>备注（可不填）</label><input type="text" id="in-note" maxlength="30" placeholder="午饭 / 打车 / 采购…"></div>';
    if(editing){
      h += '<button class="btn btn-main" data-click="submitEntry(true)">更 新</button>';
      h += '<button class="btn btn-ghost" data-click="cancelEdit()">取 消</button>';
    } else {
      h += '<button class="btn btn-main" data-click="submitEntry(false)">记 入</button>';
    }
    h += '</div>';
    var dl = (S.months[UI.ym] && S.months[UI.ym].days[recD] && S.months[UI.ym].days[recD].entries) || [];
    if(dl.length){
      var dInfo = e.days[recD];
      h += '<div style="margin-top:12px;font-size:12px;color:var(--ink-3)">'
         + recDay + ' 日已花 <b>' + fmt1(dInfo ? dInfo.spent : 0) + '</b>'
         + (dInfo ? ' · 当日额度 ' + fmt1(dInfo.L) + ' · ' + (dInfo.remain >= 0 ? '结余 ' + fmt1(dInfo.remain) : '超支 ' + fmt1(-dInfo.remain)) : '')
         + (recDay !== tD ? ' —— 改完后，之后每天的滚入与额度自动重算' : '') + '</div>';
      h += '<ul class="entries" style="margin-top:6px">';
      dl.forEach(function(it){
        h += '<li><span class="t">' + esc(it.time) + '</span><span class="note">' + (esc(it.note) || '—') + '</span>'
           + '<span class="amt">' + fmt1(it.amount) + '</span>'
           + '<button class="del" title="修改" style="font-size:13px" data-click="editEntry(' + it.id + ')">✎</button>'
           + '<button class="del" title="删除" data-click="delEntry(' + it.id + ')">✕</button></li>';
      });
      h += '</ul>';
    }
    h += '</div>';
  }

  // 本月概览
  h += '<div class="card"><h3>本月概览</h3><div class="statrow">';
  h += '<div class="st"><div class="sn">本月收入</div><div class="sv">' + fmt(e.monthIncome) + '</div></div>';
  h += '<div class="st"><div class="sn">固定成本</div><div class="sv">' + fmt(S.settings.rent + S.settings.utility + e.C) + '</div></div>';
  h += '<div class="st"><div class="sn">日常池</div><div class="sv">' + fmt(e.daily) + '</div></div>';
  h += '<div class="st"><div class="sn">旅游池</div><div class="sv">' + fmt(e.travel) + '</div></div>';
  h += '<div class="st"><div class="sn">计划储蓄</div><div class="sv">' + fmt(e.savePlan) + '</div></div>';
  h += '<div class="st"><div class="sn">已结算转存（不含今日 · 净）</div><div class="sv" style="color:var(--save)">' + fmt1(e.savedNet)
     + (e.savedUsed > 0.005 ? '<span style="font-size:11px;color:var(--ink-3)">（已抵超支 ' + fmt1(e.savedUsed) + '）</span>' : '')
     + '</div></div>';
  h += '<div class="st"><div class="sn">超支池</div><div class="sv">'
     + (e.opEnabled
         ? fmt1(e.opLeft) + ' / ' + fmt(e.opPool) + (e.isPastMonth ? ' · 剩余已并入存款' : ' · 月底剩余并入存款')
         : '<span style="color:var(--ink-3)">本月停用</span>')
     + '</div></div>';
  h += '</div></div>';

  return h;
}

/* ============ 视图：月历 ============ */
function viewCal(e){
  var h = '<div class="card"><h3>' + e.ym.slice(0,4) + ' 年 ' + (+e.ym.slice(5,7)) + ' 月 · 点击日期切换高消费日</h3>';
  h += '<div class="cal">';
  ['一','二','三','四','五','六','日'].forEach(function(w){ h += '<div class="wd">周' + w + '</div>'; });
  var firstWd = (dateOf(e.ym, 1).getDay() + 6) % 7;
  for(var b = 0; b < firstWd; b++) h += '<div class="cell blank"></div>';
  var todayD = e.isCurMonth ? +todayStr().slice(8,10) : -1;
  for(var i = 1; i <= e.dim; i++){
    var day = e.days[e.ym + '-' + pad(i)];
    var cls = 'cell';
    if(i === todayD) cls += ' today';
    else if(i > todayD && e.isCurMonth) cls += ' future';
    if(e.isPastMonth) cls += '';
    h += '<div class="' + cls + '" data-click="toggleHigh(' + i + ')">';
    h += '<div class="dnum"><span>' + i + '</span>' + (day.isHigh ? '<span class="hi-dot" title="高消费日"></span>' : '') + '</div>';
    var bl = (day.inDyn && e.dyn && i === e.dyn.d)
           ? ('动 ' + (day.isHigh ? '高 ' : '低 ') + fmt1(day.base))
           : (day.isCalibDay
               ? ('校 ' + (day.isHigh ? '高 ' : '低 ') + fmt1(day.base))
               : ((day.isHigh ? '高 ' : '低 ') + fmt1(day.base)));
    h += '<div class="base">' + bl + '</div>';
    if(day.spent > 0){
      var sp = day.spent <= day.L ? 'ok' : 'over';
      h += '<div class="sp ' + sp + '">' + fmt1(day.spent) + '</div>';
    } else if(day.isPast){
      h += '<div class="sp none">—</div>';
    } else {
      h += '<div class="sp none"></div>';
    }
    h += '</div>';
  }
  h += '</div>';
  h += '<div style="margin-top:16px;font-size:11.5px;color:var(--ink-3)">'
     + '金色圆点 = 高消费日（点击切换）· 绿色 = 当日在额度内 · 红色 = 超支 · 校 = 校准日<br>'
     + '动 = 动态收紧起点：从这天起到月底，高/低日基准按实际剩余的钱重新算出（债主是月池余额，账目严格对得上）</div>';
  h += '</div>';

  h += '<div class="card"><h3>本月对账</h3><div class="statrow">';
  h += '<div class="st"><div class="sn">日常池（可分配）</div><div class="sv">' + fmt(e.alloc) + '</div></div>';
  h += '<div class="st"><div class="sn">累计已花</div><div class="sv">' + fmt(e.poolSpent) + '</div></div>';
  h += '<div class="st"><div class="sn">池内余额</div><div class="sv">' + fmt(e.poolRemain) + '</div></div>';
  h += '<div class="st"><div class="sn">累计转存（净）</div><div class="sv" style="color:var(--save)">' + fmt1(e.savedNet) + '</div>'
     + '<div class="sd" style="font-size:11px;color:var(--ink-3)">'
     + (e.savedUsed > 0.005 ? '已转存 ' + fmt1(e.savedSum) + ' − 抵超支 ' + fmt1(e.savedUsed) : '本月转存全额入账')
     + '</div></div>';
  h += '<div class="st"><div class="sn">累计超支</div><div class="sv" style="color:' + (e.overSum > 0.01 ? 'var(--over)' : 'var(--ink)') + '">' + fmt1(e.overSum) + '</div></div>';
  h += '<div class="st"><div class="sn">超支池</div><div class="sv">'
     + (e.opEnabled
         ? fmt(e.opPool) + (e.opUsed > 0.005 ? '（余 ' + fmt1(e.opLeft) + '）' : '（未动用）')
         : '本月停用')
     + '</div></div>';
  h += '</div></div>';
  return h;
}

/* ============ 视图：存款 ============ */
function viewLedger(e){
  var total = 0;
  Object.keys(S.months).sort().forEach(function(ym){
    var ee = engine(ym);
    if(ee.savedNet > 0.01) total += ee.savedNet;
    /* 已结束月份的超支池剩余并入存款 */
    if(ee.isPastMonth && ee.opEnabled && ee.opLeft > 0.005) total += ee.opLeft;
  });
  var h = '<div class="card"><h3>存款账本</h3>';
  h += '<div class="grid2" style="margin-top:0">';
  h += '<div class="mini"><div class="n">已结算转存（净）</div><div class="v" style="color:var(--save)">' + fmt1(total) + '</div>'
     + '<div class="d">已结束的日子 − 抵超支 + 历月超支池结转，今天的预估不计入</div></div>';
  h += '<div class="mini"><div class="n">本月计划储蓄</div><div class="v">' + fmt(e.savePlan) + '</div>'
     + '<div class="d">可分配 × ' + S.settings.ps + '%，月初一次性</div></div>';
  h += '</div></div>';

  h += '<div class="card"><h3>转存明细</h3>';
  var any = false;
  Object.keys(S.months).sort().reverse().forEach(function(ym){
    var ee = engine(ym);
    var rows = [];
    for(var i = 1; i <= ee.dim; i++){
      var day = ee.days[ym + '-' + pad(i)];
      if(day.isDone && day.u > 0.01) rows.push({ d: i, u: day.u, remain: day.remain });
    }
    var pending = (ee.isCurMonth && ee.today && ee.today.u > 0.01) ? ee.today.u : 0;
    var opLine = 0, opLineTxt = '';
    if(ee.opEnabled && ee.opLeft > 0.005){
      if(ee.isPastMonth){ opLine = ee.opLeft; opLineTxt = '超支池结转（当月未用完，并入存款）'; }
      else if(ee.isCurMonth){ opLineTxt = '超支池 · 月底剩余并入（当前余 ' + fmt1(ee.opLeft) + '）'; }
    }
    if(rows.length || pending > 0 || opLineTxt){
      any = true;
      h += '<div style="font-size:12px;color:var(--ink-3);letter-spacing:2px;margin:12px 0 4px">'
         + ym.slice(0,4) + ' 年 ' + (+ym.slice(5,7)) + ' 月</div>';
      rows.forEach(function(r){
        h += '<div class="ledger-line"><span class="why">' + pad(r.d) + ' 日 · 结余 ' + fmt1(r.remain) + ' 的 ' + S.settings.savePct + '%</span>'
           + '<span class="val plus">+' + fmt1(r.u) + '</span></div>';
      });
      if(pending > 0){
        h += '<div class="ledger-line"><span class="why" style="color:var(--ink-3)">今日 · 结余预估（今天结束时才结算）</span>'
           + '<span class="val" style="color:var(--ink-3)">+' + fmt1(pending) + '</span></div>';
      }
      if(ee.savedUsed > 0.005){
        h += '<div class="ledger-line"><span class="why" style="color:var(--over)">超支抵用 · 从本月已转存中扣回</span>'
           + '<span class="val" style="color:var(--over)">−' + fmt1(ee.savedUsed) + '</span></div>';
      }
      if(opLineTxt){
        h += '<div class="ledger-line"><span class="why" style="color:var(--ink-3)">' + opLineTxt + '</span>'
           + '<span class="val" style="color:var(--ink-3)">' + (opLine > 0 ? '+' : '') + fmt1(ee.opLeft) + '</span></div>';
      }
    }
  });
  if(!any) h += '<div class="empty">暂无转存记录 —— 每天有结余时，这里会自动累积</div>';
  h += '</div>';
  return h;
}

/* ============ 视图：还款 ============ */
function viewRepay(){
  var h = '<div class="card"><div class="repay-empty">';
  h += '<div class="icon">○</div>';
  h += '<h4>暂无还款安排</h4>';
  h += '<p>这一页为还款预留。数据结构与账目字段均已就位（每月份的 <b>repayments</b> 记录），'
     + '当前版本不支持登记还款；预留字段包括<b>本金、利率、月供、剩余期数</b>，'
     + '可用于后续扩展还款计划。</p>';
  h += '</div></div>';
  h += '<div class="card"><h3>预留的登记格式</h3>';
  h += '<div class="ledger-line"><span class="why">还款对象（花呗 / 信用卡 / 借款）</span><span class="when">文本</span></div>';
  h += '<div class="ledger-line"><span class="why">剩余本金 / 月供 / 年化利率</span><span class="when">金额 × 3</span></div>';
  h += '<div class="ledger-line"><span class="why">剩余期数 / 下次扣款日</span><span class="when">数字 + 日期</span></div>';
  h += '<div style="margin-top:14px;font-size:11.5px;color:var(--ink-3)">'
     + '启用时还款将从「可分配」中先行扣除，走和房租相同的通道 —— 先还债，再谈攒钱。</div>';
  h += '</div>';
  return h;
}

/* ============ 视图：设置 ============ */
function num(id, label, hint, val, step){
  return '<div class="set-fld"><label>' + label + '</label>'
    + '<input type="number" id="' + id + '" value="' + val + '" step="' + (step || 1) + '" data-input="setNum(this.id, this.value)">'
    + (hint ? '<span class="set-hint">' + hint + '</span>' : '') + '</div>';
}
function viewSet(e){
  var st = S.settings;
  var h = '';
  h += '<div class="card"><h3>收入与固定成本</h3><div class="set-grid">';
  h += num('st-income', '本月到手收入（默认）', '在「今日」页可按月单独覆盖', st.income, 100);
  h += num('st-rent', '居住成本', '房租 + 车位', st.rent, 100);
  h += num('st-utility', '水电网气', '近 12 个月滚动均值', st.utility, 10);
  h += num('st-ins', '车险年费', '每年 10 月缴纳', st.insYear, 100);
  h += num('st-maint', '保养年费', '机油机滤等常规项目', st.maintYear, 100);
  h += '<div class="set-fld"><label>用车月注入（自动）</label>'
     + '<input type="text" id="car-m" readonly value="' + ((st.insYear + st.maintYear) / 12).toFixed(1) + '">'
     + '<span class="set-hint">(车险 + 保养) ÷ 12</span></div>';
  h += '</div></div>';

  h += '<div class="card"><h3>分配比例 <span style="font-weight:400;letter-spacing:0;color:var(--ink-3);font-size:12px">（唯一锁定的东西，联动归一）</span></h3>';
  h += '<div class="set-grid">';
  h += '<div class="set-fld" style="grid-column:1/-1">'
     + '<label>日常 <b id="rl-pd">' + st.pd + '%</b> · 旅游 <b id="rl-pt">' + st.pt + '%</b> · 储蓄 <b id="rl-ps">' + st.ps + '%</b></label>'
     + '<div class="sl-wrap"><input type="range" class="sl" id="sl-pd" min="0" max="100" step="1" value="' + st.pd + '" data-input="slide(\'pd\', this.value)"></div>'
     + '<div class="sl-wrap"><input type="range" class="sl gold" id="sl-pt" min="0" max="100" step="1" value="' + st.pt + '" data-input="slide(\'pt\', this.value)"></div>'
     + '<div class="sl-wrap"><input type="range" class="sl save" id="sl-ps" min="0" max="100" step="1" value="' + st.ps + '" data-input="slide(\'ps\', this.value)"></div>'
     + '<span class="set-hint" id="ratio-hint">当前：日常 ' + fmt(e.daily) + ' / 旅游 ' + fmt(e.travel) + ' / 储蓄 ' + fmt(e.savePlan) + '（可分配 ' + fmt(e.A) + '）</span>'
     + '</div>';
  h += '</div></div>';

  h += '<div class="card"><h3>每日算法</h3><div class="set-grid">';
  h += '<div class="set-fld"><label>高消费日天数</label>'
     + '<input type="text" readonly value="' + (S.months[UI.ym] ? S.months[UI.ym].highDays.length : 0) + '">'
     + '<span class="set-hint">本月实际勾选数 · 在「月历」页点击日期切换</span></div>';
  h += num('st-offset', '高低日偏移 %', '高低消费日的差距', st.offsetPct, 1);
  h += num('st-cap', '结转封顶倍数', '今日上限最多是基准的几倍', st.cap, 0.1);
  h += num('st-savepct', '结余转储蓄 %', '每天结余中入账的比例', st.savePct, 1);
  h += '</div></div>';

  h += '<div class="card"><h3>超支池</h3><div class="set-grid">';
  h += num('st-buffer', '超支池比例 %', '从日常池剥离单独分账，月底剩余并入存款', st.bufferPct, 0.5);
  h += '<div class="set-fld"><label>补救顺序</label>'
     + '<input type="text" readonly value="① 本月已转存 → ② 超支池 → ③ 收紧剩余天基准">'
     + '<span class="set-hint">超支先动本月攒下的转存（可动用 ' + fmt1(e.savedAvail)
     + '），不够再动超支池（全或无），都不够则分文不动、直接收紧剩余天数的高/低日基准</span></div>';
  h += '<div class="set-fld"><label>动态收紧</label>'
     + '<input type="text" readonly value="' + (e.dyn ? '生效中 · 今日起 ' + e.dyn.days + ' 天' : '仅未来月/历史月不启用') + '">'
     + '<span class="set-hint">' + (e.dyn
         ? '高日 ' + fmt1(e.dyn.cH) + ' / 低日 ' + fmt1(e.dyn.cL)
           + '（计划 ' + fmt1(e.seg2 ? e.seg2.cH : e.cH) + ' / ' + fmt1(e.seg2 ? e.seg2.cL : e.cL) + '）· '
           + '今日起各天额度之和 + 昨日滚入 = 实际剩余，账目严格自洽'
         : '当月才启用：历史月保持当时的账，未来月按月初计划展示') + '</span></div>';
  h += '<div class="set-fld"><label>本月状态</label>'
     + '<input type="text" readonly value="' + (UI.ym >= OP_FROM ? (UI.ym === ymNow() ? '启用中' : '已启用') : '停用') + '">'
     + '<span class="set-hint">' + (e.overSum < 0.01
         ? '本月零超支，池子满额 ' + fmt1(e.opPool)
         : '累计超支 ' + fmt1(e.overSum) + '：转存抵 ' + fmt1(e.savedUsed) + ' · 池扣 ' + fmt1(e.opUsed) + ' · 池余 ' + fmt1(e.opLeft)) + '</span></div>';
  h += '</div></div>';

  h += '<div class="card"><h3>数据</h3>';
  h += '<div style="font-size:13px;color:var(--ink-2);line-height:1.9">'
     + '数据保存在云端账本中，获授权的成员可共享。<br>'
     + '存储只记事实：收入、高消费日、每笔花费。所有额度与结转均为实时计算，改任何参数全表自动重算，历史不会漂移。</div>';
  h += '<div style="margin-top:14px"><button class="btn btn-ghost" data-click="wipe()">清空全部数据</button></div>';
  h += '</div>';

  h += '<div class="card"><h3>账号与同步</h3><div style="font-size:13px;color:var(--ink-2);line-height:1.9">通过应用分享与获授权的成员共用账本。每 6 秒检查更新；同时修改发生冲突时需刷新核对。</div></div>';
  return h;
}

/* ============ 交互 ============ */
window.recDateChange = function(){
  var v = $('in-date') ? $('in-date').value : '';
  if(v){ UI.recDate = v; UI.editId = null; render(); }
};
window.submitEntry = function(isEdit){
  var amt = parseFloat($('in-amt').value);
  if(isNaN(amt) || amt <= 0){ toast('请输入有效金额'); return; }
  var note = $('in-note').value.trim();
  var m = ensureMonth(UI.ym);
  var DK = UI.recDate || todayStr();
  if(!m.days[DK]) m.days[DK] = { spent: 0, entries: [] };
  if(!m.days[DK].entries) m.days[DK].entries = [];
  if(isEdit && UI.editId != null){
    var hit = null;
    m.days[DK].entries.forEach(function(x){ if(x.id === UI.editId) hit = x; });
    if(!hit){ toast('该笔已被删除'); UI.editId = null; render(); return; }
    hit.amount = amt; hit.note = note;
  } else {
    var t = new Date();
    m.days[DK].entries.push({
      id: Date.now(),
      amount: amt,
      note: note,
      time: pad(t.getHours()) + ':' + pad(t.getMinutes())
    });
  }
  m.days[DK].spent = m.days[DK].entries.reduce(function(s, x){ return s + x.amount; }, 0);
  clearSettledFrom(UI.ym, +DK.slice(8, 10));
  UI.editId = null;
  save();
  render();
  toast(isEdit ? '已更新 ' + fmt1(amt) : '已记入 ' + fmt1(amt));
};
window.cancelEdit = function(){ UI.editId = null; render(); };
window.editEntry = function(id){
  UI.editId = id;
  render();
  var m = S.months[UI.ym]; if(!m) return;
  var DK = UI.recDate || todayStr();
  var day = m.days[DK]; if(!day || !day.entries) return;
  var hit = null;
  day.entries.forEach(function(x){ if(x.id === id) hit = x; });
  if(!hit) return;
  var a = $('in-amt'), n = $('in-note');
  if(a){ a.value = hit.amount; a.focus(); }
  if(n) n.value = hit.note || '';
};
window.delEntry = function(id){
  var m = ensureMonth(UI.ym);
  var DK = UI.recDate || todayStr();
  var day = m.days[DK];
  if(!day || !day.entries) return;
  day.entries = day.entries.filter(function(x){ return x.id !== id; });
  day.spent = day.entries.reduce(function(s, x){ return s + x.amount; }, 0);
  if(UI.editId === id) UI.editId = null;
  clearSettledFrom(UI.ym, +DK.slice(8, 10));
  save();
  render();
};
window.toggleHigh = function(d){
  var m = ensureMonth(UI.ym);
  var i = m.highDays.indexOf(d);
  if(i >= 0) m.highDays.splice(i, 1); else m.highDays.push(d);
  m.highDays.sort(function(a, b){ return a - b; });
  clearSettledFrom(UI.ym, d);
  save();
  render();
};
/* 日常池校准：输入过程只做预览（不落库、不重渲染，防输入被打断），
   失焦 / 回车 / 点「校准」时才真正应用并刷新 */
window.calPreview = function(){
  var box = $('cal-preview'); if(!box) return;
  var raw = ($('cal-amt').value || '').trim();
  if(raw === ''){ box.innerHTML = ''; return; }
  var amt = parseFloat(raw);
  if(isNaN(amt) || amt < 0){ box.innerHTML = '<span style="color:#a45a3c">请输入有效金额</span>'; return; }
  var m = ensureMonth(UI.ym);
  var keep = m.calib ? JSON.parse(JSON.stringify(m.calib)) : null;
  var pvD = +todayStr().slice(8, 10);
  var pvKey = UI.ym + '-' + pad(pvD);
  m.calib = { d: pvD, amount: amt, daySpent: (m.days[pvKey] && m.days[pvKey].spent) || 0 };
  var e = engine(UI.ym);
  if(keep) m.calib = keep; else delete m.calib;   /* 预览用完即还原，不落库 */
  var d = e.drift;
  var tag = d < -0.5 ? ('比账面少 ' + fmt1(-d) + '（漏记/超支）')
          : (d > 0.5 ? ('比账面多 ' + fmt1(d)) : '账实相符');
  box.innerHTML = '预览：今日起 ' + e.seg2.days + ' 天（' + e.seg2.nH + ' 高 + ' + e.seg2.nL + ' 低）'
    + ' 按 <b>' + fmt(amt) + '</b> 分配 → 高日 <b>' + fmt1(e.seg2.cH) + '</b> / 低日 <b>' + fmt1(e.seg2.cL) + '</b> · ' + tag
    + '<span style="color:var(--ink-3)">（回车或点「校准」生效）</span>';
};
window.calCommit = function(){
  var raw = ($('cal-amt').value || '').trim();
  var amt = parseFloat(raw);
  if(raw === '' || isNaN(amt) || amt < 0){ toast('请输入有效金额'); return; }
  var m = ensureMonth(UI.ym);
  var d = +todayStr().slice(8, 10);
  /* 值与已应用的校准一致（如失焦 change 后按钮又点一次）→ 幂等静默 */
  if(m.calib && m.calib.d === d && Math.abs(m.calib.amount - amt) < 0.005){ render(); return; }
  m.calib = { d: d, amount: amt, daySpent: (m.days[UI.ym + '-' + pad(d)] && m.days[UI.ym + '-' + pad(d)].spent) || 0 };
  delete m.adjust;
  clearSettledFrom(UI.ym, d);
  save();
  render();
  toast('已按实际余额重新分配');
};
window.calClear = function(){
  var m = ensureMonth(UI.ym);
  delete m.calib;
  clearSettledFrom(UI.ym, 1);
  save();
  render();
  toast('已恢复账面计算');
};
window.setTab = function(t){ UI.tab = t; render(); };
window.shiftYm = function(dir){
  var y = +UI.ym.slice(0, 4), m = +UI.ym.slice(5, 7) + dir;
  if(m < 1){ m = 12; y--; } if(m > 12){ m = 1; y++; }
  UI.ym = y + '-' + pad(m);
  ensureMonth(UI.ym);
  render();
};
var ratioLock = false;
function refreshRatio(e){
  var el = $('ratio-hint');
  if(el) el.textContent = '当前：日常 ' + fmt(e.daily) + ' / 旅游 ' + fmt(e.travel)
    + ' / 储蓄 ' + fmt(e.savePlan) + '（可分配 ' + fmt(e.A) + '）';
}
window.slide = function(key, val){
  if(ratioLock) return;
  ratioLock = true;
  var R = { pd: S.settings.pd, pt: S.settings.pt, ps: S.settings.ps };
  var v = Math.max(0, Math.min(100, Math.round(+val || 0)));
  var others = key === 'pd' ? ['pt','ps'] : (key === 'pt' ? ['pd','ps'] : ['pd','pt']);
  var rest = 100 - v;
  var oSum = (key === 'pd') ? (R.pt + R.ps) : (key === 'pt') ? (R.pd + R.ps) : (R.pd + R.pt);
  if(oSum <= 0){
    others.forEach(function(k){ R[k] = rest / others.length; });
  } else {
    others.forEach(function(k){ R[k] = R[k] / oSum * rest; });
  }
  R[key] = v;
  R.pd = Math.round(R.pd); R.pt = Math.round(R.pt);
  R.ps = Math.max(0, 100 - R.pd - R.pt);
  S.settings.pd = R.pd; S.settings.pt = R.pt; S.settings.ps = R.ps;
  save();
  $('sl-pd').value = R.pd; $('sl-pt').value = R.pt; $('sl-ps').value = R.ps;
  $('rl-pd').textContent = R.pd + '%';
  $('rl-pt').textContent = R.pt + '%';
  $('rl-ps').textContent = R.ps + '%';
  ratioLock = false;
  refreshRatio(engine(UI.ym));
};
window.setNum = function(id, val){
  var map = {
    'st-income': 'income', 'st-rent': 'rent', 'st-utility': 'utility',
    'st-ins': 'insYear', 'st-maint': 'maintYear',
    'st-offset': 'offsetPct', 'st-cap': 'cap',
    'st-savepct': 'savePct', 'st-buffer': 'bufferPct'
  };
  if(!map[id]) return;
  var v = parseFloat(val);
  if(isNaN(v)) v = 0;
  v = Math.max(0, v);
  S.settings[map[id]] = v;
  if(id === 'st-income') ensureMonth(UI.ym).income = v;
  save();
  $('car-m').value = ((S.settings.insYear + S.settings.maintYear) / 12).toFixed(1);
  refreshRatio(engine(UI.ym));
};
window.wipe = function(){
  if(!confirm('确定清空全部记账数据？此操作不可恢复，且会同步清空云端数据（对方设备也会清空）。')) return;
  S = JSON.parse(JSON.stringify(defaults));
  ensureMonth(ymNow());
  save();
  render();
  toast('已清空');
};

/* ============ 渲染 ============ */
function render(){
  settleDays(UI.ym);
  var e = engine(UI.ym);
  var h = '';
  h += '<div class="topbar"><div class="brand"><h1>日 用</h1><span class="sub">记 账 工 作 台</span></div>'
     + '<span class="sync' + (CLOUD.dirty ? ' saving' : '') + '" id="sync-dot"><span class="dot"></span><span id="sync-txt">'
     + (CLOUD.dirty ? '同步中' : (CLOUD.lastSyncTxt ? '已同步 ' + CLOUD.lastSyncTxt : '已同步')) + '</span></span>'
     + '<div class="ym-nav"><button class="ym-btn" data-click="shiftYm(-1)">‹</button>'
     + '<span class="cur">' + e.ym.slice(0,4) + ' 年 ' + (+e.ym.slice(5,7)) + ' 月</span>'
     + '<button class="ym-btn" data-click="shiftYm(1)">›</button></div></div>';
  h += '<div class="tabs">';
  TABS.forEach(function(t){
    h += '<button class="tab' + (UI.tab === t[0] ? ' on' : '') + '" data-click="setTab(\'' + t[0] + '\')">' + t[1] + '</button>';
  });
  h += '</div>';

  if(UI.tab === 'today') h += viewToday(e);
  else if(UI.tab === 'cal') h += viewCal(e);
  else if(UI.tab === 'ledger') h += viewLedger(e);
  else if(UI.tab === 'repay') h += viewRepay();
  else h += viewSet(e);

  h += '<div class="foot">日用 · 云端版 · 资金规划与日常记账<br>'
     + '数据云端同步 · 个人资金管理辅助工具，不构成投资建议</div>';

  $('app').innerHTML = h;
}

boot();
})();
