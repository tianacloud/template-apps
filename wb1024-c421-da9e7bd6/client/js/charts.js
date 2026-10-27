/* 手写 SVG / CSS 图表，不依赖任何第三方库（对应 Android 版自有 Canvas 绘制） */
(function (global) {
  'use strict';
  var QH = (global.QH = global.QH || {});
  var charts = (QH.charts = QH.charts || {});

  function fmt(cents) { return QH.store.money(cents); }

  /* 环形图：segments = [{label,value,color}] */
  charts.donut = function (segments, opts) {
    var options = opts || {};
    var size = 178, stroke = 20;
    var r = (size - stroke) / 2 - 4;
    var c = size / 2;
    var circumference = 2 * Math.PI * r;
    var total = segments.reduce(function (s, x) { return s + x.value; }, 0);

    var svg = '<svg class="donut" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="分类占比">';
    svg += '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + QH.ui.cssVar('--paper-2') +
      '" stroke-width="' + stroke + '"/>';

    if (total > 0) {
      var offset = 0;
      segments.forEach(function (seg) {
        var len = seg.value / total * circumference;
        var visible = Math.max(len - 2.4, 0.8);
        svg += '<circle class="seg" cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + seg.color +
          '" stroke-width="' + stroke + '" stroke-linecap="round"' +
          ' stroke-dasharray="' + visible.toFixed(2) + ' ' + (circumference - visible).toFixed(2) + '"' +
          ' stroke-dashoffset="' + (-offset).toFixed(2) + '"' +
          ' transform="rotate(-90 ' + c + ' ' + c + ')">' +
          '<title>' + QH.ui.esc(seg.label) + ' ' + fmt(seg.value) + '</title></circle>';
        offset += len;
      });
    }

    var big = options.centerValue != null ? options.centerValue : fmt(total);
    var small = options.centerLabel || '合计支出';
    var bigSize = big.length > 13 ? 11.5 : big.length > 10 ? 13 : 15;
    svg += '<text x="' + c + '" y="' + (c - 2) + '" text-anchor="middle" class="donut-big" style="font-size:' +
      bigSize + 'px">' + QH.ui.esc(big) + '</text>';
    svg += '<text x="' + c + '" y="' + (c + 20) + '" text-anchor="middle" class="donut-small">' + QH.ui.esc(small) + '</text>';
    svg += '</svg>';
    return svg;
  };

  function percentile(values, p) {
    var s = values.slice().sort(function (a, b) { return a - b; });
    if (!s.length) return 0;
    var idx = (s.length - 1) * p;
    var lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return s[lo];
    return s[lo] + (s[hi] - s[lo]) * (idx - lo);
  }

  /* 每日柱状图：days = [{time, income, expense}]，field 决定单系列或双系列
     纵轴以 90 分位封顶：房租这类单日大额会撑爆刻度，让其余日子变成 1px 细线 */
  charts.dailyBars = function (days, field) {
    if (!days.length) return '';
    var mode = field || 'both';
    var values = days.map(function (d) {
      if (mode === 'income') return d.income;
      if (mode === 'expense') return d.expense;
      return Math.max(d.income, d.expense);
    });
    var positive = values.filter(function (v) { return v > 0; });
    var peak = positive.length ? Math.max.apply(null, positive) : 0;
    var cap = percentile(positive, 0.9);
    if (!(cap > 0)) cap = peak || 1;
    /* 极端情况兜底：分位值太小时抬到峰值的 30%，避免只剩一根柱子 */
    cap = Math.max(cap, peak * 0.3, 1);
    var clipped = false;

    var green = QH.ui.cssVar('--green');
    var coral = QH.ui.cssVar('--coral');
    var out = '<div class="daychart">';
    days.forEach(function (d) {
      var dt = new Date(d.time);
      var showLabel = days.length <= 10 || dt.getDate() % 5 === 1 || dt.getDate() === 1;

      function barClass(v, color, cls) {
        if (!v) return '';
        var ratio = v / cap;
        var isClipped = ratio > 1;
        if (isClipped) clipped = true;
        var h = Math.min(100, Math.max(3, ratio * 100));
        return '<i class="' + cls + (isClipped ? ' clipped' : '') + '" style="height:' + h + '%;background:' + color + '"></i>';
      }

      var bars = '';
      if (mode === 'both' || mode === 'income') bars += barClass(d.income, green, 'bar-in');
      if (mode === 'both' || mode === 'expense') bars += barClass(d.expense, coral, 'bar-out');

      out += '<div class="daycol' + (mode !== 'both' ? ' single' : '') + '" title="' +
        QH.ui.esc(QH.store.isoDate(d.time)) +
        '｜收入 ' + fmt(d.income) + '｜支出 ' + fmt(d.expense) + '">' +
        (bars.indexOf('clipped') >= 0 ? '<span class="clip-flag" aria-hidden="true">▲</span>' : '') +
        '<div class="daybars' + (mode !== 'both' ? ' single' : '') + '">' + bars + '</div>' +
        '<span class="daycol-label">' + (showLabel ? dt.getDate() : '') + '</span>' +
        '</div>';
    });
    out += '</div><div class="chart-legend">';
    if (mode === 'both' || mode === 'income') {
      out += '<span><i class="dot" style="background:' + green + '"></i>收入</span>';
    }
    if (mode === 'both' || mode === 'expense') {
      out += '<span><i class="dot" style="background:' + coral + '"></i>支出</span>';
    }
    out += '</div>';
    if (clipped) {
      out += '<p class="chart-note">柱高以 90 分位为上限，▲ 表示该日金额超出刻度</p>';
    }
    return out;
  };

  /* 近 6 个月趋势：points = [{label, income, expense}] */
  charts.trend = function (points) {
    if (!points.length) return '';
    var w = 340, h = 96, pad = 8;
    var max = 1;
    points.forEach(function (p) { max = Math.max(max, p.income, p.expense); });
    var stepX = (w - pad * 2) / Math.max(points.length - 1, 1);

    function line(key, color) {
      var pts = points.map(function (p, i) {
        var x = pad + i * stepX;
        var y = h - pad - (p[key] / max) * (h - pad * 2);
        return { x: x, y: y };
      });
      var d = pts.map(function (pt, i) { return (i ? 'L' : 'M') + pt.x.toFixed(1) + ',' + pt.y.toFixed(1); }).join(' ');
      var area = d + ' L' + pts[pts.length - 1].x.toFixed(1) + ',' + (h - pad) +
        ' L' + pts[0].x.toFixed(1) + ',' + (h - pad) + ' Z';
      var out = '<path d="' + area + '" fill="' + color + '" opacity=".08"/>';
      out += '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
      pts.forEach(function (pt) {
        out += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="2.6" fill="' + color + '"/>';
      });
      return out;
    }

    var svg = '<svg class="trend" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img" aria-label="收支趋势">';
    for (var g = 1; g <= 2; g++) {
      var gy = pad + (h - pad * 2) * g / 3;
      svg += '<line x1="' + pad + '" y1="' + gy.toFixed(1) + '" x2="' + (w - pad) + '" y2="' + gy.toFixed(1) +
        '" stroke="' + QH.ui.cssVar('--line') + '" stroke-width="1" stroke-dasharray="3 5"/>';
    }
    svg += line('income', QH.ui.cssVar('--green'));
    svg += line('expense', QH.ui.cssVar('--coral'));
    svg += '</svg>';

    var labels = '<div class="trend-labels">' + points.map(function (p) {
      return '<span>' + QH.ui.esc(p.label) + '</span>';
    }).join('') + '</div>';

    return svg + labels +
      '<div class="chart-legend"><span><i class="dot" style="background:' + QH.ui.cssVar('--green') + '"></i>收入</span>' +
      '<span><i class="dot" style="background:' + QH.ui.cssVar('--coral') + '"></i>支出</span></div>';
  };
})(typeof window !== 'undefined' ? window : globalThis);
