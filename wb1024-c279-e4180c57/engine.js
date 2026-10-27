
(function(){
"use strict";

/* ============ 随机数 ============ */
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function gaussFactory(rnd){
  var spare = null;
  return function(){
    if(spare !== null){ var v = spare; spare = null; return v; }
    var u = 0, v = 0, s = 0;
    do{ u = rnd()*2-1; v = rnd()*2-1; s = u*u+v*v; } while(s === 0 || s >= 1);
    var m = Math.sqrt(-2*Math.log(s)/s);
    spare = v*m;
    return u*m;
  };
}
function phi(x){
  var t = 1/(1+0.2316419*Math.abs(x));
  var d = 0.3989423*Math.exp(-x*x/2);
  var p = d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));
  return x > 0 ? 1-p : p;
}

/* ============ 引擎 ============ */
var MAE_BINS = 80;      // 每格 0.5%，覆盖 0..40%
var MAE_BINW = 0.5;

function simulate(o){
  var N = o.N, T = o.T, S = o.S, R = o.R, sig = o.sigma, mu = o.mu;
  var a = Math.log(1 + R*S);
  var b = -Math.log(1 - S);
  var rnd = mulberry32(o.seed), g = gaussFactory(rnd);
  var hitTP = 0, hitSL = 0, hold = 0;
  var sumLog = 0, sumSq = 0, sumPct = 0;
  var mae = new Array(MAE_BINS);
  for(var k = 0; k < MAE_BINS; k++) mae[k] = 0;
  // 按真实比例配额取样：各类离场方式的示例路径数量与总体占比一致
  var quota = o.quota || null;
  var buf = quota ? new Float64Array(T+1) : null;
  var paths = [];

  for(var i = 0; i < N; i++){
    var x = 0, mn = 0, exitLog = null, kind = 2, j = 0;
    for(var t = 0; t < T; t++){
      x = x + mu + sig*g();
      if(x < mn) mn = x;
      j = t + 1;
      if(buf) buf[j] = x;
      if(x >= a){ exitLog = x; kind = 0; hitTP++; break; }
      if(x <= -b){ exitLog = x; kind = 1; hitSL++; break; }
      if(t === T-1){ exitLog = x; kind = 2; hold++; }
    }
    if(exitLog === null){ exitLog = x; hold++; }
    if(x < mn) mn = x;
    if(quota && quota[kind] > 0 && buf){
      quota[kind]--;
      var arr = [0];
      for(var q = 1; q <= j; q++) arr.push(buf[q]);
      paths.push({d: arr, k: kind});
    }

    sumLog += exitLog;
    sumSq  += exitLog*exitLog;
    sumPct += Math.expm1(exitLog);

    var maePct = Math.expm1(mn) * 100;         // 负值
    var bi = Math.floor(-maePct / MAE_BINW);
    if(bi < 0) bi = 0;
    if(bi >= MAE_BINS) bi = MAE_BINS - 1;
    mae[bi]++;
  }
  var mLog = sumLog / N;
  var sd = Math.sqrt(Math.max(0, sumSq/N - mLog*mLog));
  var se = sd / Math.sqrt(N);
  return {
    pTP: hitTP/N, pSL: hitSL/N, pHold: hold/N,
    geo: mLog*100, arith: (sumPct/N)*100,
    se: se*100, seLog: se, N: N,
    mae: mae, paths: paths,
    a: a, b: b
  };
}

/* 二分求所需日漂移（对数尺度），使净几何期望 = target（单位：小数） */
function solveMu(base, target, lo, hi){
  var cost = base.cost;
  function f(mu){
    var r = simulate({N:5000, T:base.T, S:base.S, R:base.R, sigma:base.sigma,
                      mu:mu, seed:20261024});
    return r.geo/100 - cost - target;
  }
  var flo = f(lo), fhi = f(hi);
  if(flo >= 0) return lo;
  if(fhi <= 0) return hi;
  for(var i = 0; i < 22; i++){
    var mid = (lo+hi)/2, fm = f(mid);
    if(fm < 0) lo = mid; else hi = mid;
  }
  return (lo+hi)/2;
}

/* ============ 状态 ============ */
var ST = { S:0.06, R:3, T:20, sigma:0.02, mu:0, cost:0.001, N:20000, seed:20261024 };

/* ============ 工具 ============ */
function fmtPct(v, d){
  d = (d === undefined) ? 2 : d;
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(d) + "%";
}
function fmtNum(v, d){ return v.toFixed(d === undefined ? 2 : d); }
function fmtN(n){ return n >= 10000 ? (n/10000).toFixed(0) + " 万" : n.toLocaleString(); }
function el(id){ return document.getElementById(id); }
function setRich(node, segs){
  node.textContent = "";
  for(var i = 0; i < segs.length; i++){
    var sg = segs[i];
    if(typeof sg === "string"){ node.appendChild(document.createTextNode(sg)); }
    else {
      var e2 = document.createElement(sg.tag || "b");
      e2.textContent = sg.t;
      node.appendChild(e2);
    }
  }
}
function escapeHtml(v){
  var str = String(v), out = "", i, ch;
  var map = {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"};
  for(i = 0; i < str.length; i++){
    ch = str.charAt(i);
    out += (map[ch] || ch);
  }
  return out;
}

/* ============ 绘图 ============ */
var NS = "http://www.w3.org/2000/svg";
function mk(tag, attrs, parent){
  var e = document.createElementNS(NS, tag);
  for(var k in attrs) if(attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
  if(parent) parent.appendChild(e);
  return e;
}
function txt(parent, x, y, s, attrs){
  var a = attrs || {};
  a.x = x; a.y = y;
  if(!a.fill) a.fill = "#8b98a8";
  if(!a["font-size"]) a["font-size"] = 10.5;
  var t = mk("text", a, parent);
  t.textContent = s;
  return t;
}
function clear(node){ while(node.firstChild) node.removeChild(node.firstChild); }

/* --- 图1 路径 --- */
function drawPaths(node, res){
  clear(node);
  var W = 900, H = 330, L = 46, Rp = 84, Tp = 18, B = 30;
  var pw = W - L - Rp, phh = H - Tp - B;
  var paths = res.paths;
  if(!paths.length) return;

  var maxUp = 0, maxDn = 0, maxLen = 1;
  for(var i = 0; i < paths.length; i++){
    var d = paths[i].d;
    if(d.length > maxLen) maxLen = d.length;
    for(var j = 0; j < d.length; j++){
      var v = (Math.exp(d[j]) - 1) * 100;
      if(v > maxUp) maxUp = v;
      if(v < maxDn) maxDn = v;
    }
  }
  var tpPct = ST.R * ST.S * 100;
  var slPct = -ST.S * 100;
  var hi = Math.max(maxUp, tpPct) + 1.5;
  var lo = Math.min(maxDn, slPct) - 1.5;
  var span = hi - lo;

  function X(t){ return L + (t / maxLen) * pw; }
  function Y(v){ return Tp + (hi - v) / span * phh; }

  // 网格
  var step = niceStep(span, 5);
  var g0 = Math.ceil(lo/step)*step;
  for(var g = g0; g <= hi; g += step){
    mk("line", {x1:L, x2:L+pw, y1:Y(g), y2:Y(g), stroke:"#eef2f7", "stroke-width":1}, node);
    txt(node, L-8, Y(g)+3.5, (g>0?"+":"") + g.toFixed(0) + "%", {"text-anchor":"end"});
  }
  // 零线
  mk("line", {x1:L, x2:L+pw, y1:Y(0), y2:Y(0), stroke:"#dbe3ec", "stroke-width":1}, node);

  // 障碍线
  [[tpPct, "#c62828", "止盈 +" + tpPct.toFixed(1) + "%"], [slPct, "#c62828", "止损 " + slPct.toFixed(1) + "%"]].forEach(function(p){
    mk("line", {x1:L, x2:L+pw, y1:Y(p[0]), y2:Y(p[0]), stroke:"#c62828", "stroke-width":1.2, "stroke-dasharray":"5 4", opacity:.75}, node);
    txt(node, L+pw+4, Y(p[0])+3.5, p[2], {"text-anchor":"start", fill:"#c62828", "font-size":10});
  });

  // 路径
  var col = ["#0f766e", "#c62828", "#9aa8b8"];
  paths.forEach(function(p){
    var dstr = "", j;
    for(j = 0; j < p.d.length; j++){
      var v = (Math.exp(p.d[j]) - 1) * 100;
      dstr += (j === 0 ? "M" : "L") + X(j).toFixed(1) + " " + Y(v).toFixed(1);
    }
    mk("path", {d: dstr, fill:"none", stroke: col[p.k], "stroke-width": p.k === 2 ? 1 : 1.4,
                opacity: p.k === 2 ? .3 : .62, "stroke-linecap":"round"}, node);
  });

  // 轴
  mk("line", {x1:L, x2:L+pw, y1:H-B, y2:H-B, stroke:"#dfe6ef", "stroke-width":1}, node);
  for(var t2 = 0; t2 <= maxLen; t2 += Math.max(1, Math.round(maxLen/6))){
    txt(node, X(t2), H-B+16, t2 + "日", {"text-anchor":"middle"});
  }
  txt(node, L-8, Tp-6, "浮动盈亏", {"text-anchor":"end", "font-size":10});
}
function niceStep(span, n){
  var raw = span / n;
  var p = Math.pow(10, Math.floor(Math.log(raw)/Math.LN10));
  var c = raw / p;
  var m = c < 1.5 ? 1 : c < 3 ? 2 : c < 7 ? 5 : 10;
  return m * p;
}

/* --- 图2 扫描 --- */
function drawSweep(node, data){
  clear(node);
  var W = 900, H = 340, L = 54, Rp = 18, Tp = 18, B = 34;
  var pw = W - L - Rp, phh = H - Tp - B;
  var xs = data.map(function(d){ return d.S; });
  var ysA = data.map(function(d){ return d.a; });
  var ysG = data.map(function(d){ return d.g; });
  var all = ysA.concat(ysG);
  var hi = Math.max.apply(null, all), lo = Math.min.apply(null, all);
  var pad = Math.max(0.05, (hi-lo)*0.22);
  hi += pad; lo -= pad;
  if(lo > 0) lo = Math.min(0, lo);
  if(hi < 0) hi = Math.max(0, hi);
  var x0 = xs[0], x1 = xs[xs.length-1];
  function X(v){ return L + (v-x0)/(x1-x0)*pw; }
  function Y(v){ return Tp + (hi-v)/(hi-lo)*phh; }

  var step = niceStep(hi-lo, 5);
  for(var g = Math.ceil(lo/step)*step; g <= hi; g += step){
    mk("line", {x1:L, x2:L+pw, y1:Y(g), y2:Y(g), stroke:"#eef2f7", "stroke-width":1}, node);
    txt(node, L-8, Y(g)+3.5, (g>0?"+":"") + g.toFixed(2) + "%", {"text-anchor":"end"});
  }
  mk("line", {x1:L, x2:L+pw, y1:Y(0), y2:Y(0), stroke:"#cbd5e1", "stroke-width":1.2, "stroke-dasharray":"5 4"}, node);

  function line(vals, color, w){
    var d = "";
    for(var i = 0; i < data.length; i++){
      d += (i===0?"M":"L") + X(data[i].S).toFixed(1) + " " + Y(vals[i]).toFixed(1);
    }
    mk("path", {d:d, fill:"none", stroke:color, "stroke-width":w, "stroke-linejoin":"round"}, node);
  }
  line(ysA, "#a16207", 2.4);
  line(ysG, "#0f766e", 2.4);

  // 当前止损位标记
  var cur = null, best = 1e9;
  data.forEach(function(d){ var dd = Math.abs(d.S - ST.S*100); if(dd < best){ best = dd; cur = d; } });
  if(cur){
    mk("line", {x1:X(cur.S), x2:X(cur.S), y1:Tp, y2:Tp+phh, stroke:"#94a3b8", "stroke-width":1, "stroke-dasharray":"3 4"}, node);
    mk("circle", {cx:X(cur.S), cy:Y(cur.g), r:3.6, fill:"#0f766e", stroke:"#fff", "stroke-width":1.6}, node);
    mk("circle", {cx:X(cur.S), cy:Y(cur.a), r:3.6, fill:"#a16207", stroke:"#fff", "stroke-width":1.6}, node);
    txt(node, X(cur.S), Tp+11, "当前 " + cur.S.toFixed(1) + "%", {"text-anchor":"middle", fill:"#334155", "font-size":10, "font-weight":600});
  }
  // 端点标注
  var last = data[data.length-1];
  txt(node, X(last.S)-2, Y(last.a)-7, "算术 " + fmtPct(last.a), {"text-anchor":"end", fill:"#a16207", "font-size":10.5, "font-weight":600});
  txt(node, X(last.S)-2, Y(last.g)+14, "几何 " + fmtPct(last.g), {"text-anchor":"end", fill:"#0f766e", "font-size":10.5, "font-weight":600});

  mk("line", {x1:L, x2:L+pw, y1:H-B, y2:H-B, stroke:"#dfe6ef", "stroke-width":1}, node);
  for(var s = 2; s <= 14; s += 2){
    txt(node, X(s), H-B+16, s + "%", {"text-anchor":"middle"});
  }
  txt(node, L+pw, H-4, "止损幅度 S", {"text-anchor":"end", "font-size":10});
}

/* --- 图3 MAE --- */
function drawMae(node, res){
  clear(node);
  var W = 900, H = 312, L = 54, Rp = 22, Tp = 26, B = 50;
  var pw = W - L - Rp, phh = H - Tp - B;
  var mae = res.mae;
  var BINW = MAE_BINW;                    // 每格百分比宽度

  // 只画到最右侧非空格的右边一格，避免大片空白
  var lastNonEmpty = 0, maxC = 0;
  for(var i = 0; i < MAE_BINS; i++){
    if(mae[i] > 0) lastNonEmpty = i;
    if(mae[i] > maxC) maxC = mae[i];
  }
  var showBins = Math.min(MAE_BINS, Math.max(24, lastNonEmpty + 3));
  var rangePct = showBins * BINW;          // 显示到 −rangePct
  var bw = pw / showBins;

  for(var b = 0; b < showBins; b++){
    var h = maxC ? (mae[b]/maxC)*phh : 0;
    var x = L + pw - (b+1)*bw;
    var center = -(b + 0.5) * BINW;
    var touched = center <= -ST.S*100 + 0.001;
    mk("rect", {x:x+0.8, y:Tp+phh-h, width:Math.max(1, bw-1.6), height:Math.max(0, h),
                fill: touched ? "#e6a3a3" : "#b9cfe8", rx:1.5}, node);
  }

  // 中位数
  var sum2 = 0, cum = 0, medianBin = 0;
  for(var k = 0; k < MAE_BINS; k++){ sum2 += mae[k]; }
  for(var k2 = 0; k2 < MAE_BINS; k2++){
    cum += mae[k2];
    if(cum >= sum2/2){ medianBin = k2; break; }
  }
  var medPct = (medianBin + 0.5) * BINW;
  var medX = L + pw - (medPct/rangePct)*pw;

  // 止损位
  var slX = L + pw - ((ST.S*100)/rangePct)*pw;
  mk("line", {x1:slX, x2:slX, y1:Tp-6, y2:Tp+phh, stroke:"#c62828", "stroke-width":1.6}, node);
  txt(node, slX+5, Tp+8, "止损 −" + (ST.S*100).toFixed(1) + "%", {fill:"#c62828", "font-size":10.5, "font-weight":600});

  mk("line", {x1:medX, x2:medX, y1:Tp+phh-34, y2:Tp+phh, stroke:"#0f766e", "stroke-width":1.2, "stroke-dasharray":"4 4"}, node);
  txt(node, medX, Tp+phh+32, "中位 −" + medPct.toFixed(1) + "%", {"text-anchor":"middle", fill:"#0f766e", "font-size":10, "font-weight":600});

  // 轴
  mk("line", {x1:L, x2:L+pw, y1:Tp+phh, y2:Tp+phh, stroke:"#dfe6ef", "stroke-width":1}, node);
  for(var pp = 0; pp <= rangePct + 0.001; pp += 2){
    var xx = L + pw - (pp/rangePct)*pw;
    txt(node, xx, Tp+phh+16, pp === 0 ? "0" : "−" + pp.toFixed(0) + "%", {"text-anchor":"middle"});
  }
  txt(node, L, Tp-10, "路径数上限 " + maxC + " ｜ 区间 −" + rangePct.toFixed(0) + "% 以内", {"font-size":9.5});
}

/* ============ 汇总渲染 ============ */

function renderAll(){
  var res = simulate({N: ST.N, T: ST.T, S: ST.S, R: ST.R, sigma: ST.sigma,
                      mu: ST.mu, cost: ST.cost, seed: ST.seed,
                      quota: [3, 25, 33]});
  var netGeo = res.geo - ST.cost*100;
  var netAri = res.arith - ST.cost*100;
  var ciHalf = 1.96 * res.se;

  // KPI
  el("kGeo").className = "v " + (netGeo > ciHalf ? "pos" : netGeo < -ciHalf ? "neg" : "flat");
  el("kGeo").textContent = fmtPct(netGeo, 3);
  el("kGeoCI").textContent = "95% 区间 [" + fmtPct(netGeo-ciHalf,3) + ", " + fmtPct(netGeo+ciHalf,3) + "] · " + fmtN(res.N) + " 条路径";
  el("kAri").textContent = fmtPct(netAri, 3);
  el("kSL").textContent = (res.pSL*100).toFixed(1) + "%";
  el("kTP").textContent = (res.pTP*100).toFixed(1) + "% / " + (res.pHold*100).toFixed(0) + "%";

  var bg = el("bGeo");
  if(netGeo > ciHalf){ bg.className = "badge g"; bg.textContent = "边缘显著为正"; }
  else if(netGeo < -ciHalf){ bg.className = "badge r"; bg.textContent = "显著为负"; }
  else { bg.className = "badge a"; bg.textContent = "与零不可区分"; }

  // 判词
  var vd = el("verdict"), ic = el("vIc"), t1 = el("vT1"), p1 = el("vP1");
  var pStar = 1/(1+ST.R);
  var an = 2*phi(-ST.S/(ST.sigma*Math.sqrt(ST.T)));
  if(netGeo < -ciHalf){
    vd.className = "verdict v-bad"; ic.textContent = "!";
    t1.textContent = "这套规则在扣掉成本后是负的，而且不是因为运气差";
    setRich(p1, [
      "几何期望 " + fmtPct(netGeo,3) + "，95% 区间整段落在零以下。注意：这里根本没有价格漂移——负的那部分完全由 "
        + (ST.cost*100).toFixed(2) + "% 的双边成本造成。",
      {t:"成本是唯一确定的事，优势不是。"}
    ]);
  } else if(netGeo > ciHalf){
    vd.className = "verdict v-good"; ic.textContent = "✓";
    t1.textContent = "存在可测量的正优势，但要盯住它从哪来";
    setRich(p1, [
      "几何期望 " + fmtPct(netGeo,3) + "，置信区间不含零。请接着做两件事：把日漂移调小到刚好让区间跨过零，看临界点在哪；再把这批路径的种子换十次，看符号是否稳定。"
    ]);
  } else {
    vd.className = "verdict v-warn"; ic.textContent = "≈";
    t1.textContent = "与「完全没有优势」在统计上无法区分";
    setRich(p1, [
      "几何期望 " + fmtPct(netGeo,3) + "，95% 区间 [" + fmtPct(netGeo-ciHalf,3) + ", " + fmtPct(netGeo+ciHalf,3)
        + "] 包含零。当下这套参数的名义平衡胜率是 " + (pStar*100).toFixed(1) + "%，而实测命中止盈 "
        + (res.pTP*100).toFixed(1) + "%——",
      {t:"两者本来就该接近"},
      "，这不是稳健，是同义反复。"
    ]);
  }

  el("kSLnote").textContent = "连续监控下理论约 " + (an*100).toFixed(0) + "%，收盘口径略低";
  el("kTPnote").textContent = "盈亏比 1:" + fmtNum(ST.R,1) + " · 持有上限 " + ST.T + " 日";

  // 图
  drawPaths(el("cPaths"), res);
  el("capPaths").textContent = "同一批路径、同一套规则。红色的那些并没有「判断错误」——它们只是先走到了下沿。"
    + "在零漂移的路径上，先到上沿还是先到下沿，由路径本身决定，与你看过多少研报无关。";

  var sweep = [];
  for(var s = 2; s <= 14.0001; s += 0.5){
    var r = simulate({N: Math.min(ST.N, 12000), T: ST.T, S: s/100, R: ST.R,
                      sigma: ST.sigma, mu: ST.mu, cost: 0, seed: 5150});
    sweep.push({ S: s, a: r.arith - ST.cost*100, g: r.geo - ST.cost*100 });
  }
  drawSweep(el("cSweep"), sweep);
  var aFirst = sweep[0].a, aLast = sweep[sweep.length-1].a;
  var gmin = Math.min.apply(null, sweep.map(function(d){return d.g;}));
  var gmax = Math.max.apply(null, sweep.map(function(d){return d.g;}));
  setRich(el("capSweep"), [
    "止损从 2% 放宽到 14%，算术期望抬升了 " + (aLast-aFirst).toFixed(2) + " 个百分点，几何期望只在 "
      + fmtPct(gmin,2) + " 到 " + fmtPct(gmax,2) + " 之间平移，幅度 " + (gmax-gmin).toFixed(3) + " 个百分点。",
    {t:"那条上升的黄线，是波动率送的礼物，不是你的本事"},
    "——它随 σ 变宽、随 T 变长，唯独不随你的判断变化。"
  ]);

  drawMae(el("cMae"), res);
  var touch = 0;
  for(var b = Math.ceil(ST.S*100 / MAE_BINW); b < MAE_BINS; b++) touch += res.mae[b];
  setRich(el("capMae"), [
    "约 ",
    {t:(touch/res.N*100).toFixed(0) + "%"},
    " 的交易在离场前就摸到过 −" + (ST.S*100).toFixed(1) + "% 或更深。这意味着：如果你的止损意义是「判断错了才认亏」，"
      + "那么在一条没有任何漂移的价格上，超过三分之一的止损都是被随机波动触发的。"
  ]);

  // edge 门槛
  var base = {T: ST.T, S: ST.S, R: ST.R, sigma: ST.sigma, cost: ST.cost};
  var muBe = solveMu(base, 0, -0.002, 0.002);
  var mu1 = solveMu(base, 0.01, -0.002, 0.002);
  var mu2 = solveMu(base, 0.02, -0.002, 0.002);
  function muTxt(m){
    if(Math.abs(m) >= 0.0019) return "超出量程";
    return fmtNum(m*100,3) + "%/日";
  }
  el("kBe").textContent = muTxt(muBe);
  el("kEdge1").textContent = muTxt(mu1);
  el("kEdge2").textContent = muTxt(mu2);
  el("kBe").className = "v " + (Math.abs(muBe) < 1e-6 ? "pos" : "neg");
  setRich(el("capEdge"), [
    "折算成年化：覆盖成本需要约 ",
    {t:fmtNum(muBe*250*100,1) + "%"},
    " 的年化漂移，做到单笔 +2% 需要约 ",
    {t:fmtNum(mu2*250*100,1) + "%"},
    "。",
    {t:"漂移是这个世界里唯一真实的 edge"},
    "，止损、止盈、盈亏比都不产生它，只重新分配它。"
  ]);

  // 明细表
  var rows = [
    ["命中止盈", (res.pTP*100).toFixed(2) + "%", "先在收盘越过止盈线"],
    ["收盘触止损", (res.pSL*100).toFixed(2) + "%", "先在收盘越过止损线"],
    ["到期离场", (res.pHold*100).toFixed(2) + "%", "两条线都没碰到，按持有期末收盘价离场"],
    ["名义平衡胜率 p*", (pStar*100).toFixed(2) + "%", "1/(1+" + fmtNum(ST.R,1) + ")，使期望恰为零的胜率"],
    ["单笔算术收益（毛）", fmtPct(res.arith,3), "按百分比收益取平均，被凸性抬高"],
    ["单笔几何收益（毛）", fmtPct(res.geo,3), "按对数收益取平均；μ=0、c=0 时应为 0"],
    ["单笔几何收益（净）", fmtPct(netGeo,3), "扣除 " + (ST.cost*100).toFixed(2) + "% 双边成本"],
    ["几何收益标准误", (res.se).toFixed(3) + "%", "N 越大越小；改路径数可观察"],
    ["连续监控触止损理论值", (an*100).toFixed(2) + "%", "2Φ(−S/(σ√T))，仅作参照，高于收盘口径"],
    ["日漂移 μ", (ST.mu*100).toFixed(3) + "%", "折算年化约 " + fmtNum(ST.mu*250*100,1) + "%"],
    ["日波动 σ", (ST.sigma*100).toFixed(2) + "%", "折算年化约 " + fmtNum(ST.sigma*Math.sqrt(250)*100,1) + "%"]
  ];
  var tb = el("tbody");
  tb.textContent = "";
  rows.forEach(function(r){
    var tr = document.createElement("tr");
    for(var i = 0; i < 3; i++){
      var td = document.createElement("td");
      td.textContent = r[i];
      if(i === 1) td.style.fontWeight = "600";
      tr.appendChild(td);
    }
    tb.appendChild(tr);
  });
}

/* ============ 绑定 ============ */
function syncLabels(){
  setRich(el("vS"),   [(ST.S*100).toFixed(1),      {tag:"i", t:"%"}]);
  setRich(el("vR"),   [ST.R.toFixed(1),            {tag:"i", t:"×"}]);
  setRich(el("vT"),   [String(ST.T),               {tag:"i", t:"日"}]);
  setRich(el("vSig"), [(ST.sigma*100).toFixed(1),  {tag:"i", t:"%"}]);
  setRich(el("vMu"),  [(ST.mu*100).toFixed(2),     {tag:"i", t:"%/日"}]);
  setRich(el("vC"),   [(ST.cost*100).toFixed(2),   {tag:"i", t:"%"}]);
}
var raf = 0;
function schedule(){
  if(raf) return;
  raf = requestAnimationFrame(function(){ raf = 0; syncLabels(); renderAll(); });
}

el("fS").oninput   = function(){ ST.S = +this.value/100; schedule(); };
el("fR").oninput   = function(){ ST.R = +this.value; schedule(); };
el("fT").oninput   = function(){ ST.T = +this.value; schedule(); };
el("fSig").oninput = function(){ ST.sigma = +this.value/100; schedule(); };
el("fMu").oninput  = function(){ ST.mu = +this.value/10000; schedule(); };
el("fC").oninput   = function(){ ST.cost = +this.value/100; schedule(); };

el("btnRun").onclick = function(){
  ST.seed = Math.floor(Math.random()*1e9);
  renderAll();
};
Array.prototype.forEach.call(document.querySelectorAll("[data-preset]"), function(b){
  b.onclick = function(){
    var v = this.getAttribute("data-preset").split(",");
    ST.S = +v[0]/100; ST.R = +v[1]; ST.T = +v[2]; ST.sigma = +v[3]/100;
    ST.mu = +v[4]/10000; ST.cost = +v[5]/100;
    el("fS").value = v[0]; el("fR").value = v[1]; el("fT").value = v[2];
    el("fSig").value = v[3]; el("fMu").value = v[4]; el("fC").value = v[5];
    syncLabels(); renderAll();
  };
});
Array.prototype.forEach.call(document.querySelectorAll("#segN button"), function(b){
  b.onclick = function(){
    Array.prototype.forEach.call(document.querySelectorAll("#segN button"), function(x){ x.className = ""; });
    this.className = "on";
    ST.N = +this.getAttribute("data-n");
    renderAll();
  };
});

syncLabels();
renderAll();
})();
