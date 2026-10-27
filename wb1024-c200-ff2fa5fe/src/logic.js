
'use strict';
/* ================= 计算内核（移植自 itswe.com calc-core.js） ================= */
var COPPER_TABLE = {
  'CTMH-120': { unitWeight: 1076, r20: 0.2211, alpha: 0.0027, ampacityIn: 442, ampacityOut: 560, ampacityIn2017: 430, section: 120 },
  'CTMH-150': { unitWeight: 1342, r20: 0.1769, alpha: 0.0027, ampacityIn: 524, ampacityOut: 650, ampacityIn2017: 500, section: 150 },
  'CTAH-120': { unitWeight: 1076, r20: 0.1481, alpha: 0.0038, ampacityIn: 509, ampacityOut: 680, ampacityIn2017: 515, section: 120 },
  'CTAH-150': { unitWeight: 1342, r20: 0.1185, alpha: 0.0038, ampacityIn: 593, ampacityOut: 785, ampacityIn2017: 620, section: 150 },
  'CTS-120':  { unitWeight: 1079, r20: 0.1545, alpha: 0.0032, ampacityIn: 511, ampacityOut: 680, ampacityIn2017: 515, section: 120 },
  'CTS-150':  { unitWeight: 1347, r20: 0.1236, alpha: 0.0032, ampacityIn: 590, ampacityOut: 790, ampacityIn2017: 620, section: 150 }
};
/* 型号 → 张力模块线材参数（E/d 仅 CTMH-120/150、CTAH-120 来自原预设表，其余为按截面推定缺省，可改） */
var TENSION_PRESET = {
  'CTMH-120': { E: 120, d: 13.4 }, 'CTMH-150': { E: 120, d: 14.0 }, 'CTAH-120': { E: 117, d: 13.2 },
  'CTAH-150': { E: 117, d: 14.0 }, 'CTS-120': { E: 120, d: 13.2 }, 'CTS-150': { E: 120, d: 14.0 }
};
function assertNum(v){ if (typeof v !== 'number' || !Number.isFinite(v)) throw new TypeError('参数必须是有限数字'); return v; }
function assertPos(n,v){ assertNum(v); if (v <= 0) throw new RangeError(n + ' 必须大于 0'); return v; }
function assertNonNeg(n,v){ assertNum(v); if (v < 0) throw new RangeError(n + ' 不得为负'); return v; }
function sagAt(x,L,q,T){ return (q*x*(L-x))/(2*T); }
function stations(L,d){
  assertPos('跨距',L); assertPos('吊弦间距',d);
  var n = L/d, r = Math.round(n);
  if (Math.abs(n-r) > 1e-9 || r < 1) throw new RangeError('跨距 L(' + L + ') 必须能被吊弦间距 d(' + d + ') 整除且不少于 1 个间隔');
  var xs = [], i;
  for (i = 0; i <= r; i++) xs.push(i*d);
  return xs;
}
function messengerSagAt(x,L,fmMax){ return (4*fmMax*x*(L-x))/(L*L); }
function dropperSimple(p){
  assertPos('承力索张力',p.Tm); assertPos('结构高度',p.H); assertPos('接触线荷载',p.qc); assertPos('承力索荷载',p.qm);
  var xs = stations(p.L,p.d), fmMax = ((p.qc+p.qm)*p.L*p.L)/(8*p.Tm);
  var ys = xs.map(function(x){ return messengerSagAt(x,p.L,fmMax); });
  return { lengths: ys.map(function(f){ return p.H - f; }), curve: { x: xs, y: ys } };
}
function dropperElastic(p){
  assertPos('接触线张力',p.Tc); assertPos('承力索张力',p.Tm); assertPos('结构高度',p.H); assertPos('接触线荷载',p.qc); assertPos('承力索荷载',p.qm);
  var xs = stations(p.L,p.d), fmMax = ((p.qc+p.qm)*p.L*p.L)/(8*p.Tm), fcMax = (p.qc*p.L*p.L)/(8*p.Tc);
  var ys = xs.map(function(x){ return messengerSagAt(x,p.L,fmMax) - sagAt(x,p.L,p.qc,p.Tc); });
  return { lengths: ys.map(function(f){ return p.H - f; }), curve: { x: xs, y: ys } };
}
function wearRate(A0,A){
  assertPos('原截面积',A0); assertNonNeg('残截面积',A);
  if (A > A0) throw new RangeError('残截面积 A(' + A + ') 不得大于原截面积 A0(' + A0 + ')');
  var eta = ((A0-A)/A0)*100;
  return { eta: eta, replace: eta > 20 };
}
function copperLookup(model,lengthKm,tempC){
  var row = COPPER_TABLE[model];
  if (!row) throw new RangeError('未知型号 ' + model);
  assertPos('长度',lengthKm); assertNum(tempC);
  var alpha = row.alpha;
  return {
    unitWeight: row.unitWeight, totalWeight: row.unitWeight*lengthKm,
    r20: row.r20, rT: row.r20*(1+alpha*(tempC-20)),
    ampacityIn: row.ampacityIn, ampacityIn2017: row.ampacityIn2017, ampacityOut: row.ampacityOut
  };
}
function equivalentSpan(spans){
  if (!spans || !spans.length) throw new TypeError('跨距序列不能为空');
  var s3 = 0, s1 = 0;
  spans.forEach(function(s,i){ assertPos('spans['+i+']',s); s3 += s*s*s; s1 += s; });
  return Math.sqrt(s3/s1);
}
function iceLoad(d,b,rhoIce){
  assertPos('线径',d); assertNonNeg('覆冰厚度',b);
  rhoIce = rhoIce || 900;
  if (b === 0) return 0;
  return rhoIce*9.81*Math.PI*b*(d+b);
}
function tensionState(o){
  assertPos('弹性模量',o.E); assertPos('截面积',o.A); assertPos('线膨胀系数',o.alpha);
  assertPos('工况1荷载',o.g1); assertPos('已知张力',o.T1); assertNum(o.t1);
  assertPos('工况2荷载',o.g2); assertNum(o.t2); assertPos('跨距',o.l);
  var EN = o.E*1e3, AN = o.A, T1N = o.T1*1e3;
  var C = (T1N - (o.g1*o.g1*o.l*o.l*EN*AN)/(24*T1N*T1N)) - o.alpha*1e-5*EN*AN*(o.t2-o.t1);
  var K2 = (o.g2*o.g2*o.l*o.l*EN*AN)/24;
  var T = T1N, i, F, dF, dT;
  for (i = 0; i < 100; i++) {
    F = T - K2/(T*T) - C; dF = 1 + (2*K2)/(T*T*T); dT = F/dF; T -= dT;
    if (T <= 0) throw new RangeError('状态方程无正实数解（参数组合非法）');
    if (Math.abs(dT) < 1e-6) break;
  }
  if (Math.abs(T - K2/(T*T) - C) > 1e-3) throw new RangeError('状态方程牛顿迭代未收敛');
  return { T2: T/1e3, f2: (o.g2*o.l*o.l)/(8*T) };
}
function installCurve(o){
  if (!o.temps || !o.temps.length) throw new TypeError('温度档不能为空');
  return { points: o.temps.map(function(t){
    var r = tensionState({ E:o.E, A:o.A, alpha:o.alpha, g1:o.g, T1:o.T1, t1:o.t1, g2:o.g, t2:t, l:o.l });
    return { t: t, T: r.T2, f: r.f2 };
  }) };
}

/* ================= 工具 ================= */
function $(id){ return document.getElementById(id); }
function setWarn(el, lines){
  el.textContent = '';
  lines.forEach(function(t, idx){
    if (idx) el.appendChild(document.createElement('br'));
    el.appendChild(document.createTextNode(String(t)));
  });
}
function fillTable(container, headers, rows){
  container.textContent = '';
  var table = document.createElement('table');
  table.className = 'mini';
  var thead = document.createElement('thead'), trh = document.createElement('tr');
  headers.forEach(function(h){ var th = document.createElement('th'); th.textContent = h; trh.appendChild(th); });
  thead.appendChild(trh); table.appendChild(thead);
  var tbody = document.createElement('tbody');
  rows.forEach(function(r){
    var tr = document.createElement('tr');
    r.forEach(function(cell){ var td = document.createElement('td'); td.textContent = cell; tr.appendChild(td); });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}
function fmt(v,d){
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  d = (d === undefined) ? 3 : d;
  var s = Number(v).toFixed(d);
  if (d === 0) return s;
  return s.replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'');
}
function setErr(el,msg){
  var wrap = el.closest('.field');
  if (!wrap) return;
  wrap.classList.toggle('err',!!msg);
  var e = wrap.querySelector('.f-err');
  if (e) e.textContent = msg || '';
}
function readNum(el,allowEmpty){
  var raw = el.value.trim();
  if (raw === '') {
    if (allowEmpty) return { ok:true, v:undefined };
    setErr(el,'请输入数字'); return { ok:false, v:NaN };
  }
  var v = Number(raw);
  if (Number.isNaN(v)) { setErr(el,'请输入数字'); return { ok:false, v:NaN }; }
  if (el.dataset.min !== undefined && v < +el.dataset.min || el.dataset.max !== undefined && v > +el.dataset.max) {
    setErr(el,'超出范围 ' + el.dataset.min + ' ~ ' + el.dataset.max); return { ok:false, v:v };
  }
  setErr(el,''); return { ok:true, v:v };
}
function readPattern(el){
  var raw = el.value.trim();
  if (el.dataset.pattern && !new RegExp(el.dataset.pattern).test(raw)) { setErr(el,'格式不正确'); return { ok:false }; }
  setErr(el,''); return { ok:true };
}
function readNumList(el){
  var raw = el.value.trim();
  var vals = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
  var msg = '';
  if (!vals.length || vals.some(function(n){ return !Number.isFinite(n) || n <= 0; })) msg = '须为正数，逗号分隔';
  setErr(el,msg);
  return { ok: !msg, vals: vals };
}
/* 简易 SVG 折线图（双序列，各自归一化），DOM 方式构建 */
var SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs){
  var e = document.createElementNS(SVGNS, tag), k;
  for (k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function svgText(x, y, s, size, color, anchor){
  var t = svgEl('text', { x: x, y: y, 'font-size': size, fill: color, 'text-anchor': anchor });
  t.textContent = s;
  return t;
}
function lineChart(box, labels, series){
  var W = 640, H = 240, padL = 46, padR = 46, padT = 18, padB = 30;
  var iw = W-padL-padR, ih = H-padT-padB, i, s, j;
  var svg = svgEl('svg', { viewBox: '0 0 '+W+' '+H, role: 'img' });
  svg.appendChild(svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: '#ffffff' }));
  for (i = 0; i <= 4; i++) {
    var gy = padT + ih*i/4;
    svg.appendChild(svgEl('line', { x1: padL, y1: gy, x2: W-padR, y2: gy, stroke: '#eef1f5', 'stroke-width': 1 }));
  }
  if (labels.length > 0) {
    svg.appendChild(svgEl('line', { x1: padL, y1: padT+ih, x2: W-padR, y2: padT+ih, stroke: '#c9d1dc', 'stroke-width': 1 }));
    var step = Math.max(1, Math.ceil(labels.length/8));
    for (j = 0; j < labels.length; j += step) {
      var gx = padL + iw*(labels.length === 1 ? 0.5 : j/(labels.length-1));
      svg.appendChild(svgText(gx, H-8, labels[j], 10, '#5b6472', 'middle'));
    }
  }
  var colors = ['#e85d04','#115e67'];
  for (s = 0; s < series.length; s++) {
    var arr = series[s].y, mn = Math.min.apply(null,arr), mx = Math.max.apply(null,arr), rg = (mx-mn) || 1;
    var pts = [];
    for (j = 0; j < arr.length; j++) {
      var px = padL + iw*(arr.length === 1 ? 0.5 : j/(arr.length-1));
      var py = padT + ih*(1-(arr[j]-mn)/rg);
      pts.push(px.toFixed(1)+','+py.toFixed(1));
    }
    svg.appendChild(svgEl('polyline', { points: pts.join(' '), fill: 'none', stroke: colors[s%2], 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    svg.appendChild(svgText(s===0?padL-4:W-padR+4, padT+8, series[s].name, 10, colors[s%2], s===0?'end':'start'));
    svg.appendChild(svgText(s===0?padL-4:W-padR+4, padT+22, fmt(mn,2)+'~'+fmt(mx,2), 9, colors[s%2], s===0?'end':'start'));
  }
  box.textContent = '';
  box.appendChild(svg);
}

/* ================= 型号联动 ================= */
function applyModel(){
  var model = $('g-model').value;
  var row = COPPER_TABLE[model], tp = TENSION_PRESET[model];
  $('t-E').value = tp.E; $('t-A').value = row.section; $('t-d').value = tp.d;
  $('t-g').value = +(row.unitWeight*9.81/1000).toFixed(2);
  $('d-qc').value = +(row.unitWeight*9.81/1e6).toFixed(4);
  $('w-A0').value = row.section;
}

/* ================= ① 张力 ================= */
function calcTension(){
  var mode = $('t-mode').value, spanmode = $('t-spanmode').value;
  $('w-t-temps').hidden = mode !== 'curve'; $('w-t-curveh').hidden = mode !== 'curve';
  $('w-t-ice').hidden = mode !== 'ice'; $('w-t-iceh').hidden = mode !== 'ice';
  $('t-out-curve').hidden = mode !== 'curve'; $('t-out-ice').hidden = mode !== 'ice';
  $('w-t-L').hidden = spanmode !== 'single'; $('w-t-spans').hidden = spanmode !== 'equiv';
  $('w-t-d').hidden = mode !== 'ice';
  var els = [$('t-E'),$('t-A'),$('t-alpha'),$('t-g'),$('t-T1'),$('t-t1')];
  if (spanmode === 'single') els.push($('t-L')); else els.push($('t-spans'));
  if (mode === 'curve') els.push($('t-temps')); else els.push($('t-t2'),$('t-b'),$('t-d'));
  var firstBad = null, vals = {}, r, i, el;
  for (i = 0; i < els.length; i++) {
    el = els[i];
    if (el === $('t-spans')) r = readNumList(el);
    else if (el === $('t-temps')) { var rp = readPattern(el); r = { ok: rp.ok, vals: el.value.trim().split(/[,，\s]+/).filter(Boolean).map(Number) }; }
    else r = readNum(el);
    if (!r.ok && !firstBad) firstBad = el;
    vals[el.id] = r;
  }
  if (firstBad) { setWarn($('t-warn'), ['有未通过校验的输入项，请修正后重算。']); return; }
  var warn = [];
  try {
    var l = spanmode === 'single' ? vals['t-L'].v : equivalentSpan(vals['t-spans'].vals);
    var base = { E: vals['t-E'].v, A: vals['t-A'].v, alpha: vals['t-alpha'].v, T1: vals['t-T1'].v, t1: vals['t-t1'].v };
    if (mode === 'curve') {
      var res = installCurve({ E:base.E, A:base.A, alpha:base.alpha, g: vals['t-g'].v, T1: base.T1, t1: base.t1, l: l, temps: vals['t-temps'].vals });
      $('t-r-lD').textContent = fmt(l,1);
      var Ts = res.points.map(function(p){ return p.T; });
      $('t-r-Trange').textContent = fmt(Math.min.apply(null,Ts),2) + ' ~ ' + fmt(Math.max.apply(null,Ts),2);
      fillTable($('t-table'), ['温度 t (℃)','张力 T (kN)','弛度 f (m)'],
        res.points.map(function(p){ return [fmt(p.t,0), fmt(p.T,2), fmt(p.f,3)]; }));
      lineChart($('t-chart'), res.points.map(function(p){ return fmt(p.t,0)+'℃'; }),
        [{ name:'T (kN)', y: res.points.map(function(p){ return p.T; }) },
         { name:'f (m)', y: res.points.map(function(p){ return p.f; }) }]);
      var fOverL = Math.max.apply(null,res.points.map(function(p){ return p.f; }))/l;
      if (fOverL > 0.05) warn.push('最大弛度/跨距 = '+(fOverL*100).toFixed(1)+'%，超过 5%，抛物线近似误差增大，请复核。');
      var minT = Math.min.apply(null,Ts);
      if (minT < 0.5*base.T1) warn.push('高温档张力 '+fmt(minT,2)+' kN 不足基准的 50%，补偿能力或张力档设置需复核。');
    } else {
      var dM = vals['t-d'].v/1000, bM = vals['t-b'].v/1000;
      var gIce = iceLoad(dM,bM), g2 = vals['t-g'].v + gIce;
      var ice = tensionState({ E:base.E, A:base.A, alpha:base.alpha, g1: vals['t-g'].v, g2: g2, T1: base.T1, t1: base.t1, t2: vals['t-t2'].v, l: l });
      var dry = tensionState({ E:base.E, A:base.A, alpha:base.alpha, g1: vals['t-g'].v, g2: vals['t-g'].v, T1: base.T1, t1: base.t1, t2: vals['t-t2'].v, l: l });
      $('t-r-gice').textContent = fmt(gIce,2); $('t-r-g2').textContent = fmt(g2,2);
      $('t-r-T2ice').textContent = fmt(ice.T2,2); $('t-r-f2ice').textContent = fmt(ice.f2,3);
      $('t-r-T2dry').textContent = fmt(dry.T2,2);
      if (ice.T2 > 1.3*base.T1) warn.push('覆冰张力 '+fmt(ice.T2,2)+' kN 超基准 30%，强度裕度需按线材拉断力复核。');
      if (ice.f2/l > 0.1) warn.push('覆冰弛度超过跨距 10%，断线风险工况，须按设计规程专项校核。');
    }
  } catch (e) { warn.push('计算失败：' + e.message); }
  warn.push('状态方程系数形式与温度档以设计文件及接触网设计教材/手册为准，本工具结果仅供参考。');
  setWarn($('t-warn'), warn);
}

/* ================= ② 吊弦 ================= */
function calcDropper(){
  var els = [$('d-L'),$('d-dw'),$('d-H'),$('d-Tc'),$('d-Tm'),$('d-qc'),$('d-qm')];
  var firstBad = null, vals = {}, i, r;
  for (i = 0; i < els.length; i++) { r = readNum(els[i]); vals[els[i].id] = r.v; if (!r.ok && !firstBad) firstBad = els[i]; }
  if (firstBad) { setWarn($('d-warn'), ['有未通过校验的输入项，请修正后重算。']); return; }
  var warn = [];
  try {
    var elastic = $('d-type').value === 'elastic';
    var p = { L: vals['d-L'], d: vals['d-dw'], H: vals['d-H'], qc: vals['d-qc'], qm: vals['d-qm'], Tm: vals['d-Tm'], Tc: vals['d-Tc'] };
    var res = elastic ? dropperElastic(p) : dropperSimple(p);
    var n = res.lengths.length, fmax = Math.max.apply(null,res.curve.y), lmin = Math.min.apply(null,res.lengths);
    $('d-r-count').textContent = n; $('d-r-fmax').textContent = fmt(fmax,4); $('d-r-lmin').textContent = fmt(lmin,4);
    if (lmin <= 0) warn.push('最短吊弦长度为 '+fmt(lmin)+' m ≤ 0，结构高度不足或弛度过大，请复核输入参数。');
    else if (lmin < 0.3) warn.push('最短吊弦长度 '+fmt(lmin)+' m 小于 0.3 m，过短吊弦易产生硬点，建议复核。');
    var L = res.curve.x[n-1];
    if (fmax > 0.01*L) warn.push('最大弛度 '+fmt(fmax)+' m 超过跨距的 1%，弛度偏大，请复核张力与荷载取值。');
    fillTable($('d-table'), ['#','x (m)','弛度 (m)','吊弦长度 (m)'],
      res.curve.x.map(function(x,idx){ return [idx, fmt(x,2), fmt(res.curve.y[idx],4), fmt(res.lengths[idx],4)]; }));
    lineChart($('d-chart'), res.curve.x.map(function(x){ return fmt(x,1)+'m'; }),
      [{ name:'有效弛度 (m)', y: res.curve.y }]);
  } catch (e) { warn.push(e.message); setErr($('d-dw'),e.message); }
  setWarn($('d-warn'), warn);
}

/* ================= ③ 线材参数 ================= */
function calcCopper(){
  var rl = readNum($('c-len')), rt = readNum($('c-temp'));
  if (!rl.ok || !rt.ok) { $('c-warn').textContent = '有未通过校验的输入项，请修正后重算。'; return; }
  var warn = [];
  try {
    var r = copperLookup($('g-model').value, rl.v, rt.v);
    $('c-r-uw').textContent = fmt(r.unitWeight,1); $('c-r-tw').textContent = fmt(r.totalWeight,1);
    $('c-r-r20').textContent = fmt(r.r20,4); $('c-r-rT').textContent = fmt(r.rT,4);
    $('c-r-amp').textContent = fmt(r.ampacityIn,0) + ' / ' + fmt(r.ampacityOut,0);
    $('c-r-amp17').textContent = fmt(r.ampacityIn2017,0);
    if (rt.v < -20 || rt.v > 60) warn.push('环境温度 '+rt.v+' ℃ 超出常见运行区间（-20 ~ 60 ℃），线性温度修正误差可能增大。');
  } catch (e) { warn.push(e.message); }
  setWarn($('c-warn'), warn);
}
(function(){
  var tb = document.querySelector('#c-spec tbody');
  Object.keys(COPPER_TABLE).forEach(function(m){
    var r = COPPER_TABLE[m];
    var tr = document.createElement('tr');
    [m, r.unitWeight, r.r20, r.alpha.toFixed(5), r.ampacityIn, r.ampacityIn2017, r.ampacityOut].forEach(function(cell){
      var td = document.createElement('td'); td.textContent = cell; tr.appendChild(td);
    });
    tb.appendChild(tr);
  });
})();

/* ================= ④ 磨耗率 ================= */
function calcWear(){
  var mode = $('w-mode').value;
  $('w-w-A').hidden = mode !== 'area'; $('w-w-dia').hidden = mode !== 'diameter';
  var r0 = readNum($('w-A0')), r1 = mode === 'area' ? readNum($('w-A')) : readNum($('w-dia'));
  if (!r0.ok || !r1.ok) { setWarn($('w-warn'), ['有未通过校验的输入项，请修正后重算。']); return; }
  var warn = [];
  try {
    var A = mode === 'area' ? r1.v : (Math.PI*r1.v*r1.v)/4;
    var res = wearRate(r0.v, A);
    $('w-r-A').textContent = fmt(A,3); $('w-r-eta').textContent = fmt(res.eta,2);
    var b = $('w-r-badge');
    b.textContent = res.replace ? '建议更换' : '可继续使用';
    b.className = 'badge ' + (res.replace ? 'ng' : 'ok');
    if (res.eta > 30) warn.push('磨耗率 '+fmt(res.eta,2)+'% 已超过 30%，磨损严重，请尽快安排更换并复核该区段弓网匹配状态。');
    else if (res.replace) warn.push('磨耗率 '+fmt(res.eta,2)+'% 超过 20% 阈值，建议纳入更换计划。');
    if (mode === 'diameter') warn.push('残径按圆截面近似换算残截面积，非圆截面（沟槽接触线）建议直接测量残截面积。');
  } catch (e) { warn.push(e.message); }
  setWarn($('w-warn'), warn);
}

/* ================= ⑤ 爬电 ================= */
var ECD = { normal: [24,33], abnormal: [36,40], harsh: [48,null] };
function calcCreepage(){
  var req = Number($('k-scene').value), cond = $('k-cond').value, level = $('k-level').value;
  var rL = readNum($('k-Lcr'),true);
  var U = 29, lo = ECD[cond][0], hi = ECD[cond][1];
  var ecdLo = Math.round(lo*U), ecdHi = hi === null ? null : Math.round(hi*U);
  $('k-r-req').textContent = fmt(req,0);
  $('k-r-ecd').textContent = ecdLo + ' ~ ' + (ecdHi === null ? '＞' + fmt(48*U,0) : ecdHi);
  $('k-r-level').textContent = level === 'none' ? '—' : level;
  var b = $('k-r-badge'), warn = [];
  if (rL.v === undefined) {
    b.textContent = '未判定（未填爬电距离）'; b.className = 'badge na';
  } else if (rL.v >= req) {
    b.textContent = '合格（满足底线 ' + fmt(req,0) + ' mm）'; b.className = 'badge ok';
  } else {
    b.textContent = '不合格：低于底线 ' + fmt(req,0) + ' mm'; b.className = 'badge ng';
    warn.push('重污秽/沿海区段宜在底线基础上加大爬距，统一爬电比距按 GB/T 26218.1—2010 污秽等级体系选取。');
  }
  warn.push('比距对照值远低于规范绝对底线（如正常档 24 mm/kV × 29 kV ≈ 696 mm < 1 400 mm）——铁路设计以绝对值门槛判定，比距法仅作对照展示。');
  if (req === 1600) warn.push('1 600 mm 系「可增大为」的加强口径（TB 10009-2016 5.3.2），适用于 V 形天窗区段上、下行正线间分段绝缘子串。');
  if (level === '1200') warn.push('c 级对应 1 200 mm 低于 TB 10009-2016 第 5.3.2 条 1 400 mm 底线——两标准口径并存，新建/改建正线按底线 1 400 mm 执行，最终以设计文件协调为准。');
  if (req === 1600 && level !== 'none' && Number(level) < 1600) warn.push('V 形天窗分段串按 1 600 mm 加强口径执行，所选污秽等级对应爬距低于该值时以设计文件为准。');
  warn.push('高海拔（>1 000 m）或环境温度高于 40 ℃ 时，外绝缘特性应按 GB/T 311.1 修正（本页未计入）。');
  setWarn($('k-warn'), warn);
}

/* ================= ⑥ 腕臂 ================= */
var V2_SYM = { 'v2-cx':'Cx','v2-hs':'Hs','v2-hx':'Hx','v2-delta':'δ','v2-h':'h','v2-gk':'Gk','v2-gc':'Gc','v2-a':'a','v2-qz':'Qz','v2-qzv':'Q′Z','v2-qsv':'Q′S','v2-ltc':'LTC','v2-jp':'Jp','v2-jx':'Jx','v2-yp':'Yp','v2-ls':'Ls','v2-lx':'Lx','v2-hd':'HD','v2-hpv':'H′','v2-tg':'TG','v2-kd':'KD' };
var V2_REQ_P = ['v2-cx','v2-hs','v2-delta','v2-h','v2-gk','v2-gc','v2-a','v2-qz','v2-jp','v2-ls','v2-yp'];
var V2_REQ_X = ['v2-cx','v2-hx','v2-delta','v2-h','v2-gk','v2-gc','v2-a','v2-qz','v2-ltc','v2-lx','v2-hd','v2-hpv','v2-qzv','v2-qsv','v2-jx'];
var V2_ALL = Array.from(new Set(V2_REQ_P.concat(V2_REQ_X,['v2-tg','v2-kd'])));
function v2read(el){
  var raw = el.value.trim(), v = raw === '' ? null : Number(raw), msg = '';
  if (raw !== '') {
    if (Number.isNaN(v)) msg = '请输入数字';
    else if (v < 0) msg = '不允许负值';
    else if (el.id === 'v2-gk' && v === 0) msg = '轨距必须大于 0';
  }
  setErr(el,msg);
  return { bad: !!msg, empty: raw === '', v: v };
}
function calcCantilever(){
  var st = {}, i;
  for (i = 0; i < V2_ALL.length; i++) st[V2_ALL[i]] = v2read($(V2_ALL[i]));
  var badIds = V2_ALL.filter(function(id){ return st[id].bad; });
  var num = function(id){ return st[id].v; };
  var missP = V2_REQ_P.filter(function(id){ return st[id].empty; });
  var missX = V2_REQ_X.filter(function(id){ return st[id].empty; });
  var hasTG = !st['v2-tg'].empty && !st['v2-tg'].bad;
  var hasKD = !st['v2-kd'].empty && !st['v2-kd'].bad;
  var globBad = badIds.length > 0;
  var syms = function(ids){ return ids.map(function(id){ return V2_SYM[id]; }).join('、'); };
  var notes = [];
  if (globBad) notes.push('已拦截非法输入：' + syms(badIds) + '（负值/非数字/零轨距）');
  if (!hasTG) notes.push('TG 未填：PT（公式2）、XT（公式4）不计算');
  if (!hasKD) notes.push('KD 未填：WD（公式5）不计算');
  var P = null, PT = null, X = null, XT = null, WD = null, sinA = null;
  if (!globBad && missP.length === 0) {
    var br = num('v2-delta')*num('v2-hs')/1000 + num('v2-cx') - num('v2-h')*num('v2-gc')/num('v2-gk') - num('v2-a') + num('v2-qz');
    P = br - num('v2-jp') - num('v2-ls') + num('v2-yp');
    if (P < 0) { notes.push('P 为负值，物理非法，已拦截'); P = null; }
    if (hasTG && P !== null) {
      var t = num('v2-tg');
      PT = Math.sqrt(t*t + br*br) - num('v2-ls') - num('v2-jp') + num('v2-yp');
      if (PT < 0) { notes.push('PT 为负值，物理非法，已拦截'); PT = null; }
    }
  } else if (missP.length > 0) notes.push('公式1/2 缺：' + syms(missP));
  if (!globBad && missX.length === 0) {
    var La = num('v2-delta')*num('v2-hx')/1000 + num('v2-cx') - num('v2-h')*num('v2-gc')/num('v2-gk') - num('v2-a') - num('v2-ltc') + num('v2-qz') - num('v2-lx');
    var Lb = num('v2-hd') + num('v2-hpv') - num('v2-hx') - num('v2-qzv') - num('v2-qsv');
    if (La <= 0 || Lb <= 0) {
      notes.push('La=' + fmt(La,1) + '、Lb=' + fmt(Lb,1) + '，存在非正投影量，公式3/4/5 几何不成立，已拦截');
    } else {
      var hyp = Math.sqrt(La*La + Lb*Lb);
      X = hyp - num('v2-jx'); sinA = La/hyp;
      if (X < 0) { notes.push('X 为负值，物理非法，已拦截'); X = null; }
      if (hasTG && X !== null) {
        var t2v = num('v2-tg');
        XT = Math.sqrt(La*La + (Lb+t2v)*(Lb+t2v)) - num('v2-jx');
        if (XT < 0) { notes.push('XT 为负值，物理非法，已拦截'); XT = null; }
      }
      if (hasKD && X !== null) {
        WD = (num('v2-hd') + num('v2-kd') - num('v2-hx'))/sinA - num('v2-jx');
        if (WD < 0) { notes.push('WD 为负值，物理非法，已拦截'); WD = null; }
      }
    }
  } else if (missX.length > 0) notes.push('公式3/4/5 缺：' + syms(missX));
  $('v2-r-p').textContent = P !== null ? fmt(P,2) + ' mm' : '—';
  $('v2-r-pt').textContent = PT !== null ? fmt(PT,2) + ' mm' : '—';
  $('v2-r-x').textContent = X !== null ? fmt(X,2) + ' mm' : '—';
  $('v2-r-xt').textContent = XT !== null ? fmt(XT,2) + ' mm' : '—';
  $('v2-r-wd').textContent = WD !== null ? fmt(WD,2) + ' mm（sin α = ' + fmt(sinA,4) + '）' : '—';
  $('v2-msg').textContent = notes.length > 0 ? notes.join('；') + '。' : 'P/PT/X/XT/WD 五项输出齐备。';
}

/* ================= ⑦ 锚段张力差 ================= */
function calcAnchor(){
  var sec = $('a-sec').value, isCurve = sec === 'curve';
  $('a-curve').hidden = !isCurve; $('a-line').hidden = isCurve; $('a-lineh').hidden = isCurve;
  $('a-w-one').hidden = !isCurve;
  $('a-k-tot').textContent = isCurve ? '区段累计张力增量 (N)' : '吊弦项张力增量·中心锚结处 (N)';
  var rT = readNum($('a-T'));
  var ids = isCurve ? ['a-R','a-d','a-n'] : ['a-L','a-l','a-c','a-gj','a-alpha','a-dt'];
  var vals = {}, firstBad = rT.ok ? null : $('a-T'), i, r;
  for (i = 0; i < ids.length; i++) { r = readNum($(ids[i])); vals[ids[i]] = r.v; if (!r.ok && !firstBad) firstBad = $(ids[i]); }
  if (firstBad) { setWarn($('a-warn'), ['有未通过校验的输入项，请修正后重算。']); return; }
  var T = rT.v, lim = 0.10 * T * 1000, warn = [];
  $('a-r-lim').textContent = fmt(lim, 0);
  try {
    var one = null, tot = null;
    if (isCurve) {
      one = (vals['a-d'] * T * 1000) / vals['a-R'];
      tot = one * vals['a-n'];
      $('a-r-one').textContent = fmt(one, 1);
    } else {
      var tjd = (vals['a-L'] * (vals['a-L'] - vals['a-l']) * vals['a-gj'] * vals['a-alpha'] * vals['a-dt']) / (2 * vals['a-c']);
      tot = tjd * 1000;
    }
    $('a-r-tot').textContent = fmt(tot, 1);
    var b = $('a-r-badge');
    if (tot > lim) { b.textContent = '超限：' + fmt(tot,0) + ' N > ' + fmt(lim,0) + ' N'; b.className = 'badge ng'; }
    else { b.textContent = '合格（≤ ' + fmt(lim,0) + ' N）'; b.className = 'badge ok'; }
    if (isCurve && tot <= lim) warn.push('累计张力差占额定张力 ' + fmt(tot/(T*10),1) + '%。单定位器增量按 T=d·T/R 计算，区段累计按定位器数量线性求和（教材口径简化算法）。');
    if (!isCurve) warn.push('张力差占额定张力 ' + fmt(tot/(T*10),1) + '%；对照 15% 教材/历史口径限值 ' + fmt(T*0.15*1000,0) + ' N。');
  } catch (e) { warn.push(e.message); }
  warn.push('判据按现行规范统一 10%（TB 10009-2016 第 5.4.7 条）；半补偿 15% 系教材/历史口径仅作对照。');
  warn.push('锚段长度经验值：正线双边补偿不超过 2×800 m（困难条件 2×900 m）；附加导线锚段不宜大于 2 000 m（第 5.6.3 条）。');
  warn.push('中心锚结位置：全直线或同一半径曲线设于锚段中间；直线与曲线并存偏向曲线多、半径小的一侧；锚段较短（约 800 m 以下）可不设中心锚结。');
  setWarn($('a-warn'), warn);
}

/* ================= 示例数据 ================= */
var EXAMPLES = {
  tension: function(){
    $('t-mode').value = 'curve'; $('t-spanmode').value = 'equiv';
    $('t-T1').value = '20'; $('t-t1').value = '-20'; $('t-spans').value = '50,55,55,60';
    $('t-temps').value = '-20,-10,0,10,20,30,40';
  },
  dropper: function(){
    $('d-type').value = 'elastic'; $('d-L').value = '60'; $('d-dw').value = '6';
    $('d-H').value = '1.4'; $('d-Tc').value = '13'; $('d-Tm').value = '15';
    $('d-qc').value = '0.0106'; $('d-qm').value = '0.0105';
  },
  copper: function(){ $('c-len').value = '1.2'; $('c-temp').value = '40'; },
  wear: function(){ $('w-mode').value = 'diameter'; $('w-dia').value = '11.7'; },
  creepage: function(){ $('k-scene').value = '1400'; $('k-cond').value = 'harsh'; $('k-level').value = '1600'; $('k-Lcr').value = '1450'; },
  cantilever: function(){
    var ex = { 'v2-cx':'3000','v2-hs':'8600','v2-hx':'2500','v2-delta':'20','v2-h':'650','v2-gk':'1435','v2-gc':'600','v2-a':'300','v2-qz':'0','v2-jp':'50','v2-ls':'100','v2-yp':'0','v2-tg':'60','v2-ltc':'120','v2-lx':'80','v2-hd':'1400','v2-hpv':'1600','v2-qzv':'0','v2-qsv':'0','v2-jx':'60','v2-kd':'1300' };
    Object.keys(ex).forEach(function(id){ $(id).value = ex[id]; });
  },
  anchor: function(){
    $('a-sec').value = 'curve'; $('a-R').value = '600'; $('a-d').value = '1.0'; $('a-n').value = '10'; $('a-T').value = '20';
  }
};

/* ================= 事件绑定 ================= */
var HANDLERS = { tension: calcTension, dropper: calcDropper, copper: calcCopper, wear: calcWear, creepage: calcCreepage, cantilever: calcCantilever, anchor: calcAnchor };
function calcAll(){
  Object.keys(HANDLERS).forEach(function(k){
    try { HANDLERS[k](); } catch (e) { /* 单模块异常不影响其他模块 */ }
  });
}
(function bind(){
  var tabIds = Object.keys(HANDLERS), mi;
  tabIds.forEach(function(mid){
    var sec = $('m-' + mid);
    sec.addEventListener('input', HANDLERS[mid]);
    sec.addEventListener('change', HANDLERS[mid]);
  });
  $('g-model').addEventListener('change', function(){ applyModel(); calcAll(); });
  var tabs = document.querySelectorAll('#tabs button');
  tabs.forEach(function(btn){
    btn.addEventListener('click', function(){
      tabs.forEach(function(b){ b.classList.remove('on'); });
      btn.classList.add('on');
      document.querySelectorAll('.module').forEach(function(m){ m.classList.remove('on'); });
      $('m-' + btn.dataset.m).classList.add('on');
      window.scrollTo({ top: 0 });
    });
  });
  document.querySelectorAll('.exbtn').forEach(function(btn){
    btn.addEventListener('click', function(){
      EXAMPLES[btn.dataset.ex]();
      HANDLERS[btn.dataset.ex]();
    });
  });
  applyModel();
  calcAll();
})();
