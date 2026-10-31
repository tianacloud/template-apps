/*!
 * Decline Doctor · charts.js
 * 手写 SVG 图表，零依赖。三个图：
 *   - declineChart : 递减曲线（总产量 / 老井 / Arps 拟合 / 预测 / 事件标注）
 *   - waterfall    : 因素分解瀑布图
 *   - miniTrend    : 含水率、时率等单指标迷你趋势线
 */
(function (root) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  // SVG presentation attribute 不解析 CSS 变量，这里必须写死字体栈
  var FONT_MONO = "'SF Mono', 'JetBrains Mono', Consolas, 'Courier New', monospace";
  var FONT_SANS = "-apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";

  /* ------------------------------ 基础工具 ------------------------------ */

  function svgEl(tag, attrs, kids) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      n.setAttribute(k, attrs[k]);
    }
    if (kids) for (var i = 0; i < kids.length; i++) n.appendChild(kids[i]);
    return n;
  }

  function text(str, attrs) {
    var t = svgEl('text', attrs);
    t.textContent = str;
    return t;
  }

  function fmt(v, d) {
    if (!isFinite(v)) return '—';
    return v.toFixed(d === undefined ? 1 : d);
  }

  function signed(v, d) {
    var s = fmt(Math.abs(v), d === undefined ? 2 : d);
    return (v > 0 ? '+' : v < 0 ? '−' : '') + s;
  }

  // 平滑折线 -> 三次贝塞尔（Catmull-Rom 近似），避免生硬的折角
  function smoothPath(pts, tension) {
    if (pts.length < 2) return '';
    tension = tension === undefined ? 0.32 : tension;
    var d = 'M' + pts[0][0].toFixed(2) + ',' + pts[0][1].toFixed(2);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) * tension / 3;
      var c1y = p1[1] + (p2[1] - p0[1]) * tension / 3;
      var c2x = p2[0] - (p3[0] - p1[0]) * tension / 3;
      var c2y = p2[1] - (p3[1] - p1[1]) * tension / 3;
      d += ' C' + c1x.toFixed(2) + ',' + c1y.toFixed(2) +
           ' ' + c2x.toFixed(2) + ',' + c2y.toFixed(2) +
           ' ' + p2[0].toFixed(2) + ',' + p2[1].toFixed(2);
    }
    return d;
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    var exp = Math.floor(Math.log10(v));
    var base = Math.pow(10, exp);
    var f = v / base;
    var step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return step * base;
  }

  /**
   * 把 [minV, maxV] 扩到「刻度好看」的区间。
   * 递减曲线的变化幅度通常只占绝对值的两三成，从 0 起画会把趋势压平，
   * 所以这里用动态量程，刻度仍落在整齐的步长上。
   */
  function niceScale(minV, maxV, ticks) {
    ticks = ticks || 4;
    if (!isFinite(minV) || !isFinite(maxV)) return { lo: 0, hi: 1, step: 0.25 };
    if (maxV - minV < 1e-9) { maxV = minV + Math.abs(minV || 1) * 0.1; }
    var rawStep = (maxV - minV) / ticks;
    var mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    var norm = rawStep / mag;
    var step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
    return {
      lo: Math.floor(minV / step) * step,
      hi: Math.ceil(maxV / step) * step,
      step: step
    };
  }

  function ymAdd(ym, n) {
    var y = Math.floor(ym / 100), m = ym % 100;
    var seq = (m - 1) + n;
    return (y + Math.floor(seq / 12)) * 100 + (seq % 12) + 1;
  }

  function ymLabelShort(ym) {
    if (!ym) return '';
    var y = Math.floor(ym / 100), m = ym % 100;
    return "'" + String(y).slice(2) + '-' + (m < 10 ? '0' + m : m);
  }

  /* --------------------------- 递减曲线主图 --------------------------- */

  /**
   * @param {HTMLElement} host
   * @param {Object} o
   *   series    [{label, oil, old}]  全时段逐月数据
   *   window    {start, end}         分析窗口的索引区间
   *   fit       Arps 拟合对象（可为 null）
   *   forecast  预测月数
   *   events    [{index, label, kind}]
   *   qLimit    经济极限
   */
  function declineChart(host, o) {
    host.innerHTML = '';
    var data = o.series || [];
    if (data.length < 2) {
      host.innerHTML = '<div class="empty">数据点不足，无法绘图</div>';
      return;
    }

    var W = 860, H = 340;
    var P = { l: 56, r: 28, t: 30, b: 44 };
    var iw = W - P.l - P.r, ih = H - P.t - P.b;

    var fcast = o.forecast || 0;
    var n = data.length;
    var totalIdx = n - 1 + fcast;

    // ---- 值域 ----
    var allVals = [];
    data.forEach(function (d) {
      if (isFinite(d.oil)) allVals.push(d.oil);
      if (isFinite(d.old)) allVals.push(d.old);
    });
    var forecastPts = [];
    if (o.fit && fcast > 0) {
      for (var fi = 1; fi <= fcast; fi++) {
        var q = o.fit.predict(n - 1 + fi);
        forecastPts.push({ i: n - 1 + fi, q: q });
        allVals.push(q);
      }
    }
    var hostW0 = host.clientWidth || 860;
    var scale = niceScale(Math.min.apply(null, allVals), Math.max.apply(null, allVals), hostW0 < 520 ? 3 : 4);

    function X(i) { return P.l + (i / Math.max(1, totalIdx)) * iw; }
    function Y(v) { return P.t + ih - ((Math.max(scale.lo, Math.min(scale.hi, v)) - scale.lo) / (scale.hi - scale.lo)) * ih; }

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img',
      'aria-label': '递减曲线'
    });

    /* ---- defs ---- */
    var defs = svgEl('defs');
    defs.appendChild(svgEl('linearGradient', { id: 'gOil', x1: '0', y1: '0', x2: '0', y2: '1' }, [
      svgEl('stop', { offset: '0%', 'stop-color': '#5AA9FF', 'stop-opacity': '.20' }),
      svgEl('stop', { offset: '100%', 'stop-color': '#5AA9FF', 'stop-opacity': '0' })
    ]));
    defs.appendChild(svgEl('linearGradient', { id: 'gOld', x1: '0', y1: '0', x2: '0', y2: '1' }, [
      svgEl('stop', { offset: '0%', 'stop-color': '#2DD4BF', 'stop-opacity': '.16' }),
      svgEl('stop', { offset: '100%', 'stop-color': '#2DD4BF', 'stop-opacity': '0' })
    ]));
    // 预测区斜纹
    var pat = svgEl('pattern', { id: 'hatch', width: '8', height: '8', patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
    pat.appendChild(svgEl('line', { x1: '0', y1: '0', x2: '0', y2: '8', stroke: '#2DD4BF', 'stroke-width': '1', 'stroke-opacity': '.10' }));
    defs.appendChild(pat);
    svg.appendChild(defs);

    /* ---- 分析窗口背景 ---- */
    if (o.window && o.window.start !== undefined) {
      var wx1 = X(o.window.start), wx2 = X(o.window.end);
      svg.appendChild(svgEl('rect', {
        x: wx1, y: P.t, width: Math.max(2, wx2 - wx1), height: ih,
        fill: 'rgba(45,212,191,.045)'
      }));
      svg.appendChild(svgEl('line', { x1: wx1, y1: P.t, x2: wx1, y2: P.t + ih, stroke: 'rgba(45,212,191,.28)', 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
      svg.appendChild(svgEl('line', { x1: wx2, y1: P.t, x2: wx2, y2: P.t + ih, stroke: 'rgba(45,212,191,.28)', 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
      svg.appendChild(text('分析窗口', {
        x: (wx1 + wx2) / 2, y: P.t - 9, 'text-anchor': 'middle',
        fill: '#2DD4BF', 'font-size': '10', 'font-family': FONT_MONO,
        'letter-spacing': '1.2', opacity: '.75'
      }));
    }

    /* ---- 预测区 ---- */
    if (fcast > 0) {
      var fx = X(n - 1);
      svg.appendChild(svgEl('rect', { x: fx, y: P.t, width: X(totalIdx) - fx, height: ih, fill: 'url(#hatch)', opacity: .7 }));
      svg.appendChild(svgEl('line', { x1: fx, y1: P.t, x2: fx, y2: P.t + ih, stroke: '#2A3B4F', 'stroke-width': 1 }));
      svg.appendChild(text('预测 ' + fcast + ' 个月', {
        x: fx + 8, y: P.t + 13, fill: '#6B7F97', 'font-size': '10', 'font-family': FONT_MONO
      }));
    }

    /* ---- 网格与 Y 轴 ---- */
    for (var gv = scale.lo; gv <= scale.hi + 1e-9; gv += scale.step) {
      var yy = Y(gv);
      var isBase = Math.abs(gv - scale.lo) < 1e-9;
      svg.appendChild(svgEl('line', {
        x1: P.l, y1: yy, x2: P.l + iw, y2: yy,
        stroke: isBase ? '#2A3B4F' : '#1E2B3B', 'stroke-width': 1
      }));
      svg.appendChild(text(fmt(gv, scale.step < 1 ? 1 : 0), {
        x: P.l - 9, y: yy + 3.5, 'text-anchor': 'end',
        fill: '#46586D', 'font-size': '10.5', 'font-family': FONT_MONO
      }));
    }
    svg.appendChild(text('t/d', {
      x: 10, y: P.t - 12, 'text-anchor': 'start',
      fill: '#6B7F97', 'font-size': '10', 'font-family': FONT_MONO
    }));

    /* ---- X 轴刻度 ---- */
    var lastYm = data[n - 1].ym;
    // 窄屏时减少横轴标签数量，避免年月文字互相压叠
    var hostW = host.clientWidth || 860;
    var wantLabels = hostW < 520 ? 4 : hostW < 760 ? 6 : 9;
    var stepX = Math.max(1, Math.ceil(totalIdx / wantLabels));
    for (var xi = 0; xi <= totalIdx; xi += stepX) {
      var lab;
      if (xi <= n - 1) {
        lab = data[xi].label;
      } else if (lastYm) {
        var fy = ymAdd(lastYm, xi - (n - 1));
        lab = Math.floor(fy / 100) + '-' + String(fy % 100).padStart(2, '0');
      } else {
        lab = '+' + (xi - (n - 1)) + '月';
      }
      svg.appendChild(text(lab, {
        x: X(xi), y: P.t + ih + 18, 'text-anchor': 'middle',
        fill: '#46586D', 'font-size': '10', 'font-family': FONT_MONO
      }));
    }

    /* ---- 曲线（不用面积填充：动态量程下面积会误导绝对量级） ---- */
    var oilPts = data.map(function (d, i) { return [X(i), Y(d.oil)]; });
    var oldPts = data.map(function (d, i) { return [X(i), Y(d.old || 0)]; });

    /* ---- Arps 拟合曲线（历史段） ---- */
    if (o.fit) {
      var fitPts = [];
      for (var i2 = 0; i2 < n; i2++) fitPts.push([X(i2), Y(o.fit.predict(i2))]);
      svg.appendChild(svgEl('path', {
        d: smoothPath(fitPts), fill: 'none', stroke: '#F5A524',
        'stroke-width': 1.8, 'stroke-dasharray': '6 4', opacity: .9
      }));

      // 预测段
      if (forecastPts.length) {
        var fp = [[X(n - 1), Y(o.fit.predict(n - 1))]];
        forecastPts.forEach(function (p) { fp.push([X(p.i), Y(p.q)]); });
        svg.appendChild(svgEl('path', {
          d: smoothPath(fp), fill: 'none', stroke: '#F5A524',
          'stroke-width': 1.8, 'stroke-dasharray': '3 5', opacity: .62
        }));
        // 终点标注
        var lastP = fp[fp.length - 1];
        svg.appendChild(svgEl('circle', { cx: lastP[0], cy: lastP[1], r: 3, fill: '#F5A524', opacity: .8 }));
      }
    }

    /* ---- 实际数据线 ---- */
    // 总产量是「表面现象」，老井才是「地层实质」：前者弱化，后者加重
    svg.appendChild(svgEl('path', {
      d: smoothPath(oilPts), fill: 'none', stroke: '#5AA9FF',
      'stroke-width': 1.5, opacity: .55, 'stroke-linecap': 'round'
    }));
    svg.appendChild(svgEl('path', {
      d: smoothPath(oldPts), fill: 'none', stroke: '#2DD4BF',
      'stroke-width': 2.6, 'stroke-linecap': 'round'
    }));

    // 数据点（只在事件点与末点画，避免过密）
    data.forEach(function (d, i) {
      if (i % Math.max(1, Math.round(n / 14)) !== 0 && i !== n - 1) return;
      svg.appendChild(svgEl('circle', { cx: X(i), cy: Y(d.old || 0), r: 2.4, fill: '#0A0E14', stroke: '#2DD4BF', 'stroke-width': 1.5 }));
    });

    /* ---- 事件标注 ---- */
    (o.events || []).forEach(function (ev) {
      if (ev.index < 0 || ev.index >= n) return;
      var ex = X(ev.index);
      var yTop = P.t + 8;
      svg.appendChild(svgEl('line', {
        x1: ex, y1: yTop + 4, x2: ex, y2: P.t + ih,
        stroke: ev.kind === 'new' ? 'rgba(90,169,255,.4)' : 'rgba(245,165,36,.4)',
        'stroke-width': 1, 'stroke-dasharray': '2 4'
      }));
      svg.appendChild(svgEl('circle', {
        cx: ex, cy: yTop, r: 3,
        fill: ev.kind === 'new' ? '#5AA9FF' : '#F5A524'
      }));
      svg.appendChild(text(ev.label, {
        x: ex + (ev.index > n * 0.72 ? -6 : 6), y: yTop + 3.5,
        'text-anchor': ev.index > n * 0.72 ? 'end' : 'start',
        fill: ev.kind === 'new' ? '#5AA9FF' : '#F5A524',
        'font-size': '10', 'font-weight': '500'
      }));
    });

    /* ---- 悬浮交互 ---- */
    var focusLine = svgEl('line', {
      x1: 0, y1: P.t, x2: 0, y2: P.t + ih,
      stroke: 'rgba(228,236,245,.35)', 'stroke-width': 1, 'stroke-dasharray': '3 3',
      opacity: 0
    });
    svg.appendChild(focusLine);

    var hoverDot = svgEl('circle', { r: 4, fill: '#2DD4BF', stroke: '#0A0E14', 'stroke-width': 2, opacity: 0 });
    svg.appendChild(hoverDot);

    var hit = svgEl('rect', {
      x: P.l, y: P.t, width: iw, height: ih,
      fill: 'transparent', style: 'cursor:crosshair'
    });
    svg.appendChild(hit);

    var tip = document.createElement('div');
    tip.className = 'tooltip';
    host.appendChild(tip);

    function move(evt) {
      var r = svg.getBoundingClientRect();
      var scale = W / r.width;
      var mx = (evt.clientX - r.left) * scale;
      var idx = Math.round(((mx - P.l) / iw) * totalIdx);
      idx = Math.max(0, Math.min(n - 1, idx));
      var d = data[idx];
      var px = X(idx);

      focusLine.setAttribute('x1', px);
      focusLine.setAttribute('x2', px);
      focusLine.setAttribute('opacity', 1);
      hoverDot.setAttribute('cx', px);
      hoverDot.setAttribute('cy', Y(d.old || 0));
      hoverDot.setAttribute('opacity', 1);

      var fitQ = o.fit ? o.fit.predict(idx) : null;
      var rows = '' +
        '<div class="tt-row"><span><i class="tt-dot" style="background:#5AA9FF"></i>总产量</span><b>' + fmt(d.oil, 2) + '</b></div>' +
        '<div class="tt-row"><span><i class="tt-dot" style="background:#2DD4BF"></i>老井产量</span><b>' + fmt(d.old, 2) + '</b></div>' +
        (fitQ !== null ? '<div class="tt-row"><span><i class="tt-dot" style="background:#F5A524"></i>趋势拟合</span><b>' + fmt(fitQ, 2) + '</b></div>' : '');
      tip.innerHTML = '<div class="tt-title"><span>' + d.label + '</span><span style="color:var(--faint);font-weight:400">t/d</span></div>' + rows;
      tip.classList.add('show');

      var hostRect = host.getBoundingClientRect();
      var left = (px / W) * hostRect.width + 14;
      if (left + tip.offsetWidth > hostRect.width) left = (px / W) * hostRect.width - tip.offsetWidth - 14;
      var top = Math.max(4, Math.min(hostRect.height - tip.offsetHeight - 4, ((event.clientY || 0) - hostRect.top) - 30));
      tip.style.left = Math.max(0, left) + 'px';
      tip.style.top = top + 'px';
    }

    function leave() {
      focusLine.setAttribute('opacity', 0);
      hoverDot.setAttribute('opacity', 0);
      tip.classList.remove('show');
    }

    hit.addEventListener('mousemove', move);
    hit.addEventListener('mouseleave', leave);

    host.appendChild(svg);
  }

  /* ----------------------------- 瀑布图 ----------------------------- */

  /**
   * @param {HTMLElement} host
   * @param {Array} items  [{label, value}]
   * @param {Object} o     {q1, q2, delta}
   */
  function waterfall(host, items, o) {
    host.innerHTML = '';
    var W = 820, H = 300;
    var P = { l: 52, r: 20, t: 26, b: 52 };
    var iw = W - P.l - P.r, ih = H - P.t - P.b;

    var SHORT = { new: '新井', measure: '措施', liquid: '液量', time: '时率', water: '含水', other: '其他' };

    var bars = [];
    var cum = o.q1;
    bars.push({ label: '期初', type: 'total', from: 0, to: o.q1, value: o.q1 });
    items.forEach(function (it) {
      var from = cum;
      var to = cum + it.value;
      bars.push({
        label: SHORT[it.key] || it.label,
        key: it.key,
        type: it.value >= 0 ? 'pos' : 'neg',
        from: from, to: to, value: it.value, share: it.share
      });
      cum = to;
    });
    bars.push({ label: '期末', type: 'total', from: 0, to: o.q2, value: o.q2 });

    var allV = bars.map(function (b) { return Math.max(b.from, b.to); });
    var sc = niceScale(0, Math.max.apply(null, allV) * 1.02, 4);
    var maxV = sc.hi, minV = 0, stepV = sc.step;

    var slot = iw / bars.length;
    var bw = Math.min(52, slot * 0.56);

    function Y(v) { return P.t + ih - ((v - minV) / (maxV - minV)) * ih; }
    function Xc(i) { return P.l + slot * i + slot / 2; }

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img', 'aria-label': '因素分解瀑布图'
    });

    // 网格
    for (var gv = 0; gv <= maxV + 1e-9; gv += stepV) {
      svg.appendChild(svgEl('line', { x1: P.l, y1: Y(gv), x2: P.l + iw, y2: Y(gv), stroke: gv < 1e-9 ? '#2A3B4F' : '#1E2B3B' }));
      svg.appendChild(text(fmt(gv, stepV < 1 ? 1 : 0), {
        x: P.l - 9, y: Y(gv) + 3.5, 'text-anchor': 'end',
        fill: '#46586D', 'font-size': '10.5', 'font-family': FONT_MONO
      }));
    }

    // 连接线
    for (var i = 1; i < bars.length; i++) {
      var prev = bars[i - 1];
      var yLink = Y(prev.to);
      svg.appendChild(svgEl('line', {
        x1: Xc(i - 1) + bw / 2, y1: yLink,
        x2: Xc(i) - bw / 2, y2: yLink,
        stroke: '#2A3B4F', 'stroke-width': 1, 'stroke-dasharray': '2 3'
      }));
    }

    // 柱
    bars.forEach(function (b, idx) {
      var top = Math.min(b.from, b.to);
      var h = Math.max(2, Math.abs(Y(b.from) - Y(b.to)));
      var yTop = Y(Math.max(b.from, b.to));
      var color, op;
      if (b.type === 'total') { color = '#8798AD'; op = .55; }
      else if (b.type === 'pos') { color = '#3DD68C'; op = .85; }
      else { color = '#FF6B6B'; op = .85; }

      var rect = svgEl('rect', {
        x: Xc(idx) - bw / 2, y: yTop, width: bw, height: h,
        fill: color, opacity: op, rx: 2
      });
      svg.appendChild(rect);

      // 数值
      var labelY = yTop - 7;
      var anchor = 'middle';
      if (labelY < P.t + 10) labelY = yTop + h + 15;
      var vTxt = b.type === 'total' ? fmt(b.value, 2) : signed(b.value, 2);
      svg.appendChild(text(vTxt, {
        x: Xc(idx), y: labelY, 'text-anchor': anchor,
        fill: b.type === 'total' ? '#A7B7C9' : (b.type === 'pos' ? '#3DD68C' : '#FF6B6B'),
        'font-size': '11', 'font-family': FONT_MONO, 'font-weight': '500'
      }));

      // X 轴标签
      svg.appendChild(text(b.label, {
        x: Xc(idx), y: P.t + ih + 18, 'text-anchor': 'middle',
        fill: b.type === 'total' ? '#A7B7C9' : '#6B7F97',
        'font-size': '11', 'font-family': FONT_SANS
      }));
    });

    // 单位
    svg.appendChild(text('t/d', {
      x: 8, y: P.t - 8, 'text-anchor': 'start',
      fill: '#6B7F97', 'font-size': '10', 'font-family': FONT_MONO
    }));

    host.appendChild(svg);
  }

  /* --------------------------- 迷你趋势线 --------------------------- */

  /**
   * @param {HTMLElement} host
   * @param {Array} series [{label, value}]
   * @param {Object} o {color, unit, invert, fmtDigits}
   */
  function miniTrend(host, series, o) {
    host.innerHTML = '';
    if (!series || series.length < 2) return;

    var W = 400, H = 92;
    var P = { l: 6, r: 6, t: 12, b: 16 };
    var iw = W - P.l - P.r, ih = H - P.t - P.b;

    var vals = series.map(function (s) { return s.value; });
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    var pad = (mx - mn) * 0.22 || 1;
    var lo = mn - pad, hi = mx + pad;

    function X(i) { return P.l + (i / (series.length - 1)) * iw; }
    function Y(v) { return P.t + ih - ((v - lo) / (hi - lo)) * ih; }

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'none',
      role: 'img', 'aria-label': o.label || '趋势'
    });

    var pts = series.map(function (s, i) { return [X(i), Y(s.value)]; });
    var dLine = smoothPath(pts);

    var gid = 'mg' + Math.random().toString(36).slice(2, 7);
    var defs = svgEl('defs');
    defs.appendChild(svgEl('linearGradient', { id: gid, x1: '0', y1: '0', x2: '0', y2: '1' }, [
      svgEl('stop', { offset: '0%', 'stop-color': o.color, 'stop-opacity': '.22' }),
      svgEl('stop', { offset: '100%', 'stop-color': o.color, 'stop-opacity': '0' })
    ]));
    svg.appendChild(defs);

    svg.appendChild(svgEl('path', {
      d: dLine + ' L' + X(series.length - 1) + ',' + (P.t + ih) + ' L' + X(0) + ',' + (P.t + ih) + ' Z',
      fill: 'url(#' + gid + ')'
    }));
    svg.appendChild(svgEl('path', {
      d: dLine, fill: 'none', stroke: o.color, 'stroke-width': 1.8,
      'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke'
    }));

    // 首尾点
    svg.appendChild(svgEl('circle', { cx: X(0), cy: Y(series[0].value), r: 2.6, fill: o.color, opacity: .55 }));
    svg.appendChild(svgEl('circle', { cx: X(series.length - 1), cy: Y(series[series.length - 1].value), r: 3.2, fill: o.color }));

    host.appendChild(svg);
  }

  root.DDCharts = {
    declineChart: declineChart,
    waterfall: waterfall,
    miniTrend: miniTrend,
    utils: { fmt: fmt, signed: signed, niceMax: niceMax }
  };
})(window);
