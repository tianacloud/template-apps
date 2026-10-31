/*!
 * Decline Doctor · app.js
 * 界面逻辑：载入数据 -> 计算 -> 渲染 -> 导出
 */
(function () {
  'use strict';

  var E = window.DD;
  var C = window.DDCharts;
  var fmt = C.utils.fmt;
  var signed = C.utils.signed;

  var state = {
    sourceName: '',
    rows: [],
    csv: '',
    window: 12,
    qLimit: 0.5,
    r: null,
    warnings: []
  };

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  /* ====================================================================== *
   * 载入与分析
   * ====================================================================== */

  function loadCsv(csv, name) {
    var parsed = E.parseCSV(csv);
    if (!parsed.rows.length) {
      state.warnings = parsed.warnings.length ? parsed.warnings : ['未能从数据中解析出任何有效行。'];
      state.rows = [];
      state.r = null;
      render();
      return;
    }
    state.csv = csv;
    state.rows = parsed.rows;
    state.sourceName = name || '自定义数据';
    state.warnings = parsed.warnings.slice();
    analyze();
  }

  function analyze() {
    if (!state.rows.length) { state.r = null; render(); return; }

    var monthly = E.aggregateMonthly(state.rows);
    var totals = E.monthlyTotal(monthly);
    var natural = E.naturalSeries(monthly);

    var win = state.window === 0 ? totals.length : state.window;
    var decomp = E.decompose(monthly, win);

    // 递减拟合只用老井序列：总产量含新井与措施跳变，直接拟合会被带偏
    var pts = natural.series.map(function (s, i) { return { t: i, q: s.oil }; });
    var fit = E.fitArps(pts);
    var eur = fit ? E.forecastEur(fit, { qLimit: state.qLimit }) : null;
    var diag = E.diagnose({ fit: fit, decomp: decomp, series: totals, field: state.sourceName });

    state.r = {
      monthly: monthly,
      totals: totals,
      natural: natural,
      decomp: decomp,
      fit: fit,
      eur: eur,
      diag: diag,
      win: win,
      wells: collectWells(decomp)
    };

    render();
  }

  /** 侧栏井分组：老井 / 措施井 / 新井 / 其他 */
  function collectWells(decomp) {
    if (!decomp || !decomp.ok) return [];
    var out = [];
    decomp.wells.oldList.forEach(function (w) { out.push({ well: w, kind: 'old', note: '连续生产' }); });
    decomp.wells.measureList.forEach(function (m) { out.push({ well: m.well, kind: 'measure', note: m.label }); });
    decomp.wells.newList.forEach(function (m) { out.push({ well: m.well, kind: 'new', note: m.ym + ' 投产' }); });
    return out;
  }

  /* ====================================================================== *
   * 渲染
   * ====================================================================== */

  function render() {
    renderMeta();
    renderWellList();
    renderWarnings();
    renderTopbar();

    if (!state.r) {
      $('verdictArea').innerHTML = '<div class="card"><div class="empty"><b>还没有可分析的数据</b>' +
        '点击左侧「载入示范井组」看一个完整示例，或粘贴 / 上传自己的 CSV。</div></div>';
      $('kpiArea').innerHTML = '';
      $('declineChart').innerHTML = '';
      $('waterfallChart').innerHTML = '';
      $('decompTable').innerHTML = '';
      $('findingList').innerHTML = '';
      $('measureCard').style.display = 'none';
      ['fwChart', 'trChart', 'irChart'].forEach(function (id) { $(id).innerHTML = ''; });
      return;
    }

    var r = state.r;
    renderVerdict(r);
    renderKpis(r);
    renderDeclineChart(r);
    renderDecomp(r);
    renderMiniTrends(r);
    renderFindings(r);
    renderMeasure(r);
    renderFoot(r);
  }

  function renderMeta() {
    var r = state.r;
    var rows = state.rows;
    var html = '';
    if (!rows.length) {
      html = '<div class="meta-row"><dt>状态</dt><dd>无数据</dd></div>';
    } else {
      var wells = Array.from(new Set(rows.map(function (x) { return x.well; })));
      var months = Array.from(new Set(rows.map(function (x) { return x.ym; })));
      html = '' +
        '<div class="meta-row"><dt>来源</dt><dd>' + esc(state.sourceName) + '</dd></div>' +
        '<div class="meta-row"><dt>井数</dt><dd>' + wells.length + '</dd></div>' +
        '<div class="meta-row"><dt>月份</dt><dd>' + months.length + '</dd></div>' +
        '<div class="meta-row"><dt>记录</dt><dd>' + rows.length.toLocaleString('en-US') + ' 行</dd></div>' +
        '<div class="meta-row"><dt>区间</dt><dd>' +
          E.ymLabel(Math.min.apply(null, months)) + ' ~ ' + E.ymLabel(Math.max.apply(null, months)) + '</dd></div>';
    }
    $('metaList').innerHTML = html;
  }

  function renderWellList() {
    var r = state.r;
    if (!r || !r.wells.length) {
      $('wellList').innerHTML = '<div style="font-size:11.5px;color:var(--faint);">' +
        (state.rows.length ? '分析窗口内无可用分组' : '载入数据后显示') + '</div>';
      return;
    }
    var map = { old: '老井', measure: '措施井', new: '新井', other: '其他' };
    $('wellList').innerHTML = r.wells.map(function (w) {
      return '<div class="well-item"><span class="wname">' + esc(w.well) + '</span>' +
        '<span class="well-tag ' + w.kind + '">' + map[w.kind] + '</span></div>';
    }).join('');
  }

  function renderWarnings() {
    var out = [];
    state.warnings.forEach(function (w) {
      out.push('<div class="warnbar"><span>·</span><div>' + esc(w) + '</div></div>');
    });
    if (state.r && !state.r.fit) {
      out.push('<div class="warnbar"><span>·</span><div><b>递减拟合未成功。</b>' +
        '老井有效产量点不足 4 个，或产量序列波动过大。下方分因素分解不受影响，但递减率与预测结果为空。</div></div>');
    }
    $('warnArea').innerHTML = out.join('');
  }

  function renderTopbar() {
    var r = state.r;
    $('pageTitle').textContent = r ? '递减诊断 · ' + state.sourceName : '递减诊断';
    var sub = $('pageSub');
    if (r && r.decomp.ok) {
      sub.innerHTML = '<span class="chip">' + esc(r.decomp.startLabel) + ' → ' + esc(r.decomp.endLabel) + '</span>' +
        '<span class="chip">' + r.decomp.wells.total + ' 口井</span>' +
        '<span class="chip">' + r.decomp.months + ' 个月窗口</span>';
    }
    var hw = $('healthWrap');
    if (r && r.diag) {
      var map = { stable: ['ok', '运行平稳'], watch: ['warn', '需要关注'], attention: ['warn', '建议处置'] };
      var m = map[r.diag.health] || map.watch;
      hw.innerHTML = '<span class="chip ' + m[0] + '" style="font-size:12px;padding:5px 11px;">' +
        '健康分 ' + r.diag.score + ' · ' + m[1] + '</span>';
    } else {
      hw.innerHTML = '';
    }
  }

  /* ------------------------------ 核心结论 ------------------------------ */

  function renderVerdict(r) {
    var d = r.decomp;
    var host = $('verdictArea');

    if (!d.ok) {
      host.innerHTML = '<div class="verdict"><div class="verdict-label">无法分解</div><p>' +
        esc(d.reason || '数据不足') + '</p></div>';
      return;
    }

    var get = function (k) {
      var it = d.items.filter(function (x) { return x.key === k; })[0];
      return it ? it.value : 0;
    };
    var vNew = get('new'), vMs = get('measure'), vLiq = get('liquid'), vTr = get('time'), vFw = get('water');
    var vOld = vLiq + vTr + vFw;

    var surface = d.delta >= 0
      ? '<span class="hl-up">增长 ' + fmt(Math.abs(d.deltaPct), 1) + '%</span>'
      : '<span class="hl-down">下降 ' + fmt(Math.abs(d.deltaPct), 1) + '%</span>';

    var oldWord = vOld >= 0 ? '增加' : '减少';
    var oldCls = vOld >= 0 ? 'hl-up' : 'hl-down';
    var oldAbs = fmt(Math.abs(vOld), 1);

    var s1 = '近 ' + d.months + ' 个月，总产量从 <strong>' + fmt(d.q1, 1) + '</strong> 变为 <strong>' +
      fmt(d.q2, 1) + '</strong> t/d，表面' + surface + '；';

    var s2;
    if (vOld < 0 && d.delta > 0) {
      s2 = '但老井同期实际<span class="hl-down">' + oldWord + ' ' + oldAbs + ' t/d</span>。' +
        '这波增长全部由新井（' + signed(vNew, 1) + '）与措施（' + signed(vMs, 1) + '）撑起来，' +
        '<strong>地层本身在退</strong>。';
    } else if (vOld < 0 && d.delta <= 0) {
      s2 = '其中老井自然递减贡献 <span class="hl-down">' + signed(vOld, 1) + ' t/d</span>，' +
        (vNew + vMs > 0
          ? '新井与措施补回 ' + signed(vNew + vMs, 1) + ' t/d，剩下这个缺口是真实的产量损失。'
          : '期内没有新井或措施补充，递减直接落在总产量上。');
    } else {
      s2 = '老井同期' + oldWord + ' <span class="' + oldCls + '">' + oldAbs + ' t/d</span>，' +
        '生产状态在改善，' + (vNew + vMs > 0 ? '叠加新井与措施后总量走高。' : '液量或时率的恢复抵消了含水上升。');
    }

    // 老井损失构成
    var parts = [];
    if (Math.abs(vFw) > 0.01) parts.push('含水上升 ' + signed(vFw, 1));
    if (Math.abs(vTr) > 0.01) parts.push('时率下降 ' + signed(vTr, 1));
    if (Math.abs(vLiq) > 0.01) parts.push('液量变化 ' + signed(vLiq, 1));
    var s3 = parts.length ? '老井这部分变化里，' + parts.join('、') + ' t/d。' : '';

    // 拟合与展望
    var s4 = '';
    if (r.fit) {
      var f = r.fit;
      var cls = f.annualDecline > 25 ? 'hl-down' : f.annualDecline > 15 ? 'hl-down' : 'hl-up';
      s4 = '按 Arps 拟合，老井自然递减率 <span class="' + cls + '">' + fmt(f.annualDecline, 1) + '%/年</span>' +
        '（' + f.type + '，b = ' + fmt(f.b, 2) + '，R² = ' + fmt(f.r2, 3) + '）。';
      if (r.eur && r.eur.months > 0) {
        s4 += '若不再投入新井或措施，现有老井约 ' + fmt(r.eur.years, 1) + ' 年后跌至经济极限，期间可采 ' +
          Math.round(r.eur.eur).toLocaleString('en-US') + ' t。';
      }
    }

    // 行动建议
    var dom = d.dominant;
    var act = '';
    if (dom && dom.value < 0) {
      var adviceMap = {
        water: '先查含水上升方向、评价堵水调剖潜力',
        time: '先恢复停产井与低效井的生产时率，这部分产量最容易拿回来',
        liquid: '评估提液与注水强度是否匹配，避免只提液不补能',
        measure: '复盘措施选井与施工质量，无效井不应重复投入',
        new: '新井投产节奏一旦放缓，产量会立刻回落，需提前安排产能接替'
      };
      act = '建议优先处理 <strong>' + esc(dom.label) + '</strong>：' +
        (adviceMap[dom.key] || '排查该项的直接原因') + '。';
    } else if (vOld < 0 && d.delta > 0) {
      act = '<strong>不要把总量当成安全信号。</strong>新井和措施只能对冲当年，' +
        '产能接替一旦断档，自然递减会在下一年直接暴露。';
    } else if (dom && dom.value > 0) {
      act = '当前主要增量来自 <strong>' + esc(dom.label) + '</strong>，注意核实其可持续性，避免把一次性增产当成趋势。';
    }

    host.innerHTML = '<div class="verdict">' +
      '<div class="verdict-label">核心结论</div>' +
      '<p>' + s1 + s2 + '</p>' +
      (s3 ? '<p style="margin-top:7px;font-size:13.5px;color:var(--text-2);">' + s3 + '</p>' : '') +
      (s4 ? '<p style="margin-top:7px;font-size:13.5px;color:var(--text-2);">' + s4 + '</p>' : '') +
      (act ? '<p style="margin-top:9px;font-size:13.5px;">' + act + '</p>' : '') +
      '</div>';
  }

  /* -------------------------------- KPI -------------------------------- */

  function renderKpis(r) {
    var cards = [];
    var d = r.decomp;

    if (r.fit) {
      var f = r.fit;
      var lvl = f.annualDecline > 25 ? 'bad' : f.annualDecline > 15 ? 'warn' : 'good';
      cards.push({
        cls: lvl,
        label: '自然递减率',
        value: fmt(f.annualDecline, 1) + '<span class="unit">%/年</span>',
        sub: f.type + ' · b=' + fmt(f.b, 2) + ' · R²=' + fmt(f.r2, 3)
      });
    } else {
      cards.push({ cls: 'bad', label: '自然递减率', value: '—', sub: '老井序列无法拟合' });
    }

    if (d.ok) {
      var cls2 = d.delta >= 0 ? 'good' : 'bad';
      cards.push({
        cls: cls2,
        label: '窗口产量变化',
        value: (d.delta >= 0 ? '+' : '') + fmt(d.deltaPct, 1) + '<span class="unit">%</span>',
        sub: fmt(d.q1, 1) + ' → ' + fmt(d.q2, 1) + ' t/d'
      });

      // 与分解口径保持一致：用窗口首末的老井产量，而不是全序列首末
      var ot = d.oldTotal;
      var oldChg = ot.q1 > 0 ? ((ot.q2 - ot.q1) / ot.q1) * 100 : 0;
      cards.push({
        cls: oldChg < 0 ? 'warn' : 'good',
        label: '老井产量（期末）',
        value: fmt(ot.q2, 1) + '<span class="unit">t/d</span>',
        sub: '期内 ' + signed(oldChg, 1) + '% · ' + d.wells.old + ' 口连续井'
      });
    }

    if (r.eur && r.eur.eur > 0) {
      cards.push({
        cls: 'info',
        label: '剩余可采（老井）',
        value: Math.round(r.eur.eur).toLocaleString('en-US') + '<span class="unit">t</span>',
        sub: '至 ' + fmt(r.eur.qLimit, 1) + ' t/d 经济极限 · 约 ' + fmt(r.eur.years, 1) + ' 年'
      });
    }

    $('kpiArea').innerHTML = cards.map(function (c) {
      return '<div class="kpi ' + c.cls + '">' +
        '<div class="kpi-label">' + esc(c.label) + '</div>' +
        '<div class="kpi-value">' + c.value + '</div>' +
        '<div class="kpi-sub">' + esc(c.sub) + '</div></div>';
    }).join('');
  }

  /* ------------------------------ 递减曲线 ------------------------------ */

  function renderDeclineChart(r) {
    var totals = r.totals;
    var nat = r.natural.series;
    var series = totals.map(function (t, i) {
      return { label: t.label, ym: t.ym, oil: t.oil, old: nat[i] ? nat[i].oil : 0 };
    });

    // 事件：新井投产 + 措施
    var ymIdx = {};
    totals.forEach(function (t, i) { ymIdx[t.ym] = i; });
    var events = [];
    if (r.decomp.ok) {
      r.decomp.wells.newList.forEach(function (w) {
        if (ymIdx[w.ym] !== undefined) events.push({ index: ymIdx[w.ym], label: w.well + ' 投产', kind: 'new' });
      });
      r.decomp.wells.measureList.forEach(function (w) {
        if (ymIdx[w.ym] !== undefined) events.push({ index: ymIdx[w.ym], label: w.well + ' ' + w.label, kind: 'measure' });
      });
    }

    var winStart = r.decomp.ok ? ymIdx[r.decomp.startYm] : 0;
    var winEnd = totals.length - 1;

    C.declineChart($('declineChart'), {
      series: series,
      window: { start: winStart, end: winEnd },
      fit: r.fit,
      forecast: r.fit ? 12 : 0,
      events: events
    });

    var note = '';
    if (r.fit) {
      note = '拟合基于 ' + r.fit.points + ' 个老井月度点（连续生产且期内无措施的 ' + r.natural.wells.length +
        ' 口井）。总产量曲线含新井与措施跳变，直接拟合会系统性低估递减率，所以两者分开呈现。' +
        '递减率与预测取决于整段老井序列，不随上方分析窗口切换而改变。';
    } else {
      note = '老井产量点不足或波动过大，未能拟合。可尝试延长分析窗口或检查数据完整性。';
    }
    if (r.natural.excluded.length) {
      note += ' 已从老井序列剔除：' + r.natural.excluded.map(function (e) {
        return e.well + '（' + e.reason + '）';
      }).join('、') + '。';
    }
    $('fitNote').innerHTML = note;
  }

  /* ------------------------------ 因素分解 ------------------------------ */

  function renderDecomp(r) {
    var d = r.decomp;
    if (!d.ok) {
      $('waterfallChart').innerHTML = '<div class="empty">' + esc(d.reason || '') + '</div>';
      $('decompTable').innerHTML = '';
      $('decompRange').textContent = '';
      return;
    }

    $('decompRange').textContent = d.startLabel + ' → ' + d.endLabel + ' · 阶段对比法';

    C.waterfall($('waterfallChart'), d.items, { q1: d.q1, q2: d.q2, delta: d.delta });

    var notes = {
      new: '期内投产 ' + d.wells.new + ' 口',
      measure: d.measureDetails.length
        ? d.measureDetails.map(function (m) { return m.well + ' ' + m.measure; }).join('、')
        : '窗口内无措施',
      liquid: '液量 ' + signed(d.liquid.deltaPct, 1) + '%（提液 / 降液）',
      time: '时率 ' + fmt(d.timeRate.start, 1) + ' → ' + fmt(d.timeRate.end, 1) + '%',
      water: '含水 ' + fmt(d.waterCut.start, 1) + ' → ' + fmt(d.waterCut.end, 1) + '%',
      other: '停产 / 复抽 / 数据不完整'
    };

    var rows = d.items.map(function (it) {
      var cls = it.value > 0 ? 'pos' : it.value < 0 ? 'neg' : 'dim';
      var isSub = it.key === 'liquid' || it.key === 'time' || it.key === 'water';
      return '<tr class="' + (isSub ? 'grp' : '') + '">' +
        '<td>' + esc(it.label) + '</td>' +
        '<td class="' + cls + '">' + signed(it.value, 2) + '</td>' +
        '<td class="' + cls + '">' + (it.share > 0 ? '+' : '') + fmt(it.share, 1) + '%</td>' +
        '<td class="dim hide-sm" style="text-align:left;">' + esc(notes[it.key] || '') + '</td>' +
        '</tr>';
    }).join('');

    rows += '<tr class="total">' +
      '<td>合计</td>' +
      '<td class="' + (d.delta >= 0 ? 'pos' : 'neg') + '">' + signed(d.delta, 2) + '</td>' +
      '<td>100%</td>' +
      '<td class="dim hide-sm" style="text-align:left;">闭合差 ' + fmt(d.closure.gap, 4) + ' t/d</td>' +
      '</tr>';

    $('decompTable').innerHTML =
      '<thead><tr><th>因素</th><th>影响产量 (t/d)</th><th>占总变化</th><th class="hide-sm" style="text-align:left;">依据</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>';
  }

  /* ------------------------------- 迷你趋势 ------------------------------ */

  function renderMiniTrends(r) {
    var totals = r.totals;
    var last = totals[totals.length - 1];

    C.miniTrend($('fwChart'), totals.map(function (t) { return { label: t.label, value: t.waterCut * 100 }; }), {
      color: '#F5A524', label: '含水率'
    });
    $('fwNow').textContent = fmt(last.waterCut * 100, 1) + '%';

    C.miniTrend($('trChart'), totals.map(function (t) { return { label: t.label, value: t.avgTimeRate * 100 }; }), {
      color: '#5AA9FF', label: '生产时率'
    });
    $('trNow').textContent = fmt(last.avgTimeRate * 100, 1) + '%';

    C.miniTrend($('irChart'), totals.map(function (t) { return { label: t.label, value: t.injectionRatio }; }), {
      color: '#2DD4BF', label: '注采比'
    });
    $('irNow').textContent = fmt(last.injectionRatio, 2);
  }

  /* ------------------------------- 诊断清单 ------------------------------ */

  function renderFindings(r) {
    var f = r.diag.findings;
    $('findingCount').textContent = f.length + ' 条 · 按严重程度排序';
    $('findingList').innerHTML = f.map(function (x) {
      return '<div class="finding ' + x.level + '">' +
        '<div class="f-dot"></div>' +
        '<div class="f-body">' +
          '<div class="f-title"><span class="f-tag">' + esc(x.tag) + '</span>' + esc(x.title) + '</div>' +
          '<div class="f-detail">' + esc(x.detail) + '</div>' +
        '</div></div>';
    }).join('');
  }

  /* ------------------------------- 措施复盘 ------------------------------ */

  function renderMeasure(r) {
    var d = r.decomp;
    if (!d.ok || !d.measureDetails.length) {
      $('measureCard').style.display = 'none';
      return;
    }
    $('measureCard').style.display = '';

    var rows = d.measureDetails.map(function (m) {
      var okCls = m.liftVsBaseline > 0 ? 'pos' : 'neg';
      return '<tr>' +
        '<td>' + esc(m.well) + '</td>' +
        '<td class="hide-sm" style="text-align:left;color:var(--text-2);">' + esc(m.measure) + '</td>' +
        '<td>' + fmt(m.baseline, 2) + '</td>' +
        '<td>' + fmt(m.qStart, 2) + '</td>' +
        '<td>' + fmt(m.qEnd, 2) + '</td>' +
        '<td class="' + okCls + '">' + signed(m.liftVsBaseline, 2) + '</td>' +
        '</tr>';
    }).join('');

    $('measureTable').innerHTML =
      '<thead><tr><th>井号</th><th class="hide-sm" style="text-align:left;">措施</th>' +
      '<th>措施前基线</th><th>窗口期初</th><th>窗口期末</th><th>较基线</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>';
  }

  function renderFoot(r) {
    $('footNote').innerHTML = '数据仅在本机浏览器内处理<br>' +
      (window.DEMO_META && state.sourceName === window.DEMO_META.title
        ? '<span style="color:var(--amber)">当前为合成演示数据</span>' : '');
  }

  /* ====================================================================== *
   * 导出
   * ====================================================================== */

  function buildReport() {
    var r = state.r, d = r.decomp;
    var L = [];
    L.push('# 递减诊断报告');
    L.push('');
    L.push('- 数据来源：' + state.sourceName);
    L.push('- 井数：' + new Set(state.rows.map(function (x) { return x.well; })).size);
    L.push('- 生成时间：' + new Date().toLocaleString('zh-CN'));
    L.push('- 工具：递减诊所 Decline Doctor（Arps 递减方程 + LMDI 因素分解）');
    L.push('');
    L.push('## 一、递减规律');
    L.push('');
    if (r.fit) {
      L.push('| 指标 | 数值 |');
      L.push('| --- | --- |');
      L.push('| 递减类型 | ' + r.fit.type + ' |');
      L.push('| b 值 | ' + fmt(r.fit.b, 2) + ' |');
      L.push('| 初始产量 qi | ' + fmt(r.fit.qi, 2) + ' t/d |');
      L.push('| 递减率 Di | ' + fmt(r.fit.Di, 4) + ' /月 |');
      L.push('| 拟合优度 R² | ' + fmt(r.fit.r2, 4) + ' |');
      L.push('| 年递减率 | ' + fmt(r.fit.annualDecline, 1) + '% |');
      if (r.eur) L.push('| 剩余可采（至 ' + fmt(r.eur.qLimit, 1) + ' t/d） | ' + Math.round(r.eur.eur).toLocaleString('en-US') + ' t |');
      L.push('');
      L.push('拟合口径：仅使用老井（连续生产且期内无措施）月度产量序列，共 ' +
        r.natural.wells.length + ' 口井、' + r.fit.points + ' 个点。');
    } else {
      L.push('老井产量序列无法拟合 Arps 曲线（有效点不足或波动过大）。');
    }
    L.push('');
    if (d.ok) {
      L.push('## 二、分因素分解');
      L.push('');
      L.push('窗口：' + d.startLabel + ' ~ ' + d.endLabel + '（' + d.months + ' 个月）  ');
      L.push('产量：' + fmt(d.q1, 2) + ' → ' + fmt(d.q2, 2) + ' t/d，变化 ' + signed(d.delta, 2) + ' t/d（' + signed(d.deltaPct, 1) + '%）');
      L.push('');
      L.push('| 因素 | 影响产量 (t/d) | 占总变化 |');
      L.push('| --- | ---: | ---: |');
      d.items.forEach(function (it) {
        L.push('| ' + it.label + ' | ' + signed(it.value, 3) + ' | ' + (it.share > 0 ? '+' : '') + fmt(it.share, 1) + '% |');
      });
      L.push('| **合计** | **' + signed(d.delta, 3) + '** | 100% |');
      L.push('');
      L.push('闭合差 ' + fmt(d.closure.gap, 4) + ' t/d，LMDI 残差 ' + fmt(d.closure.lmdiResidual, 5) + ' t/d。');
      L.push('');
      L.push('## 三、诊断结论');
      L.push('');
      r.diag.findings.forEach(function (f, i) {
        var tag = f.level === 'bad' ? '严重' : f.level === 'warn' ? '关注' : '正常';
        L.push((i + 1) + '. **[' + tag + '][' + f.tag + '] ' + f.title + '**');
        L.push('   ' + f.detail);
      });
      L.push('');
      L.push('健康分：' + r.diag.score + ' / 100');
      L.push('');
      if (d.measureDetails.length) {
        L.push('## 四、措施复盘');
        L.push('');
        L.push('| 井号 | 措施 | 基线 | 期初 | 期末 | 较基线 |');
        L.push('| --- | --- | ---: | ---: | ---: | ---: |');
        d.measureDetails.forEach(function (m) {
          L.push('| ' + m.well + ' | ' + m.measure + ' | ' + fmt(m.baseline, 2) + ' | ' +
            fmt(m.qStart, 2) + ' | ' + fmt(m.qEnd, 2) + ' | ' + signed(m.liftVsBaseline, 2) + ' |');
        });
        L.push('');
      }
    }
    L.push('## 方法说明');
    L.push('');
    L.push('- **Arps 递减方程**：q = qi·(1+b·Di·t)^(-1/b)。对每个 b 用线性化闭式解求 (qi, Di)，' +
      '再以产量空间残差最小为准做网格寻优与局部精修，b=0 时退化为指数递减。');
    L.push('- **LMDI 因素分解**：基于恒等式 q = A·T·(1-fw)（A 为开井日液量强度，T 为生产时率，fw 为含水率），' +
      '用对数平均迪氏指数法保证各因素贡献之和严格等于老井产量变化量，无交叉项残留。');
    L.push('- **阶段对比法**：以窗口首末两月为对比点，井按「老井 / 新井 / 措施井 / 其他」分类，分类贡献可加。');
    L.push('- **经济极限**：默认 0.5 t/d，可在界面调整。剩余可采由 Arps 解析积分计算。');
    L.push('- 注采比在此按「注水量 / 产液量」计算，未做地下体积系数换算，仅作趋势参考。');
    L.push('');
    return L.join('\n');
  }

  function download(name, content, mime, withBom) {
    var blob = new Blob([withBom ? '\uFEFF' + content : content], { type: mime + ';charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  }

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ====================================================================== *
   * 事件绑定
   * ====================================================================== */

  $('btnDemo').addEventListener('click', function () {
    if (window.DEMO_CSV) loadCsv(window.DEMO_CSV, (window.DEMO_META && window.DEMO_META.title) || '示范井组');
  });

  $('btnPaste').addEventListener('click', function () {
    $('csvInput').value = state.csv || '';
    $('csvModal').classList.add('open');
    setTimeout(function () { $('csvInput').focus(); }, 60);
  });

  $('btnCloseModal').addEventListener('click', closeModal);
  $('btnCancelCsv').addEventListener('click', closeModal);
  $('csvModal').addEventListener('click', function (e) {
    if (e.target === $('csvModal')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() { $('csvModal').classList.remove('open'); }

  $('btnApplyCsv').addEventListener('click', function () {
    var txt = $('csvInput').value.trim();
    if (!txt) return;
    closeModal();
    loadCsv(txt, '粘贴数据');
  });

  $('btnUpload').addEventListener('click', function () { $('fileInput').click(); });

  // Excel 导出的 CSV 在国内常见 GBK 编码，直接按 UTF-8 读会整列乱码。
  // 先严格按 UTF-8 解码，失败再退到 GBK，最后兜底宽松 UTF-8。
  function decodeBuffer(buf) {
    var bytes = new Uint8Array(buf);
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch (e1) {
      try {
        return new TextDecoder('gbk').decode(bytes);
      } catch (e2) {
        return new TextDecoder('utf-8').decode(bytes);
      }
    }
  }

  $('fileInput').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      loadCsv(decodeBuffer(reader.result), f.name.replace(/\.(csv|txt)$/i, ''));
    };
    reader.onerror = function () {
      state.rows = [];
      state.r = null;
      state.warnings = ['文件读取失败，请确认文件未被占用。'];
      render();
    };
    reader.readAsArrayBuffer(f);
    e.target.value = '';
  });

  $('windowSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.classList.remove('active'); });
    b.classList.add('active');
    state.window = parseInt(b.dataset.win, 10);
    if (state.rows.length) analyze();
  });

  $('qLimit').addEventListener('change', function () {
    var v = parseFloat(this.value);
    state.qLimit = isFinite(v) && v > 0 ? v : 0.5;
    if (state.r) analyze();
  });

  $('moreToggle').addEventListener('click', function () {
    var bar = document.querySelector('.sidebar');
    bar.classList.toggle('expanded');
    this.textContent = bar.classList.contains('expanded') ? '收起数据集与导出' : '展开数据集与导出';
  });

  $('btnReport').addEventListener('click', function () {
    if (!state.r) return;
    var name = '递减诊断报告_' + new Date().toISOString().slice(0, 10) + '.md';
    download(name, buildReport(), 'text/markdown', false);
  });

  $('btnCsv').addEventListener('click', function () {
    if (!state.r || !state.r.decomp.ok) return;
    var d = state.r.decomp;
    var lines = ['因素,影响产量(t/d),占总变化(%)'];
    d.items.forEach(function (it) { lines.push(it.label + ',' + it.value.toFixed(4) + ',' + it.share); });
    lines.push('合计,' + d.delta.toFixed(4) + ',100');
    download('因素分解_' + d.startLabel + '_' + d.endLabel + '.csv', lines.join('\n'), 'text/csv', true);
  });

  /* ====================================================================== *
   * 启动
   * ====================================================================== */

  if (window.DEMO_CSV) {
    loadCsv(window.DEMO_CSV, (window.DEMO_META && window.DEMO_META.title) || '示范井组');
  } else {
    render();
  }
})();
