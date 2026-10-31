/**
 * 被动收入小账本 · 页面模板
 * 纯函数：接收视图模型，返回 HTML 字符串。不含任何状态与副作用。
 */
(function (global) {
  'use strict';

  var ICON = {
    home: '<path d="M3 10.2 12 3.4l9 6.8V20a1 1 0 0 1-1 1h-5.2v-6.2H9.2V21H4a1 1 0 0 1-1-1z"/>',
    wallet: '<rect x="3" y="6.5" width="18" height="14" rx="3.2"/><path d="M3 11h18"/><circle cx="16.6" cy="16" r="1.25" fill="currentColor" stroke="none"/>',
    chart: '<path d="M4 4.5V19a1 1 0 0 0 1 1h15"/><path d="M7.6 15.2l3.6-4.2 3.1 2.7 4.3-6.1"/>',
    bell: '<path d="M18.2 9.2a6.2 6.2 0 1 0-12.4 0c0 5-2.1 6.3-2.1 6.3h16.6s-2.1-1.3-2.1-6.3"/><path d="M10.3 19.4a1.9 1.9 0 0 0 3.4 0"/>',
    settings: '<path d="M4 7.2h8.4"/><path d="M17.4 7.2H20"/><circle cx="15" cy="7.2" r="2.4"/><path d="M4 16.8h3.4"/><path d="M12.4 16.8H20"/><circle cx="9.1" cy="16.8" r="2.4"/>',
    plus: '<path d="M12 5.2v13.6"/><path d="M5.2 12h13.6"/>',
    trash: '<path d="M4 7h16"/><path d="M9.5 7V4.8h5V7"/><path d="M6.2 7l.9 12.4a1.4 1.4 0 0 0 1.4 1.3h7a1.4 1.4 0 0 0 1.4-1.3L17.8 7"/><path d="M10.3 11v5.6M13.7 11v5.6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M16.4 16.4 21 21"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2v5.1l3.3 2"/>',
    back: '<path d="M15 4.8 7.6 12 15 19.2"/>',
    right: '<path d="M9 4.8 16.4 12 9 19.2"/>',
    moon: '<path d="M20.4 14.6A8.6 8.6 0 1 1 9.4 3.6a6.9 6.9 0 0 0 11 11z"/>',
    sun: '<circle cx="12" cy="12" r="4.3"/><path d="M12 2.4v2.3M12 19.3v2.3M2.4 12h2.3M19.3 12h2.3M5.1 5.1l1.7 1.7M17.2 17.2l1.7 1.7M18.9 5.1l-1.7 1.7M6.8 17.2l-1.7 1.7"/>',
    download: '<path d="M12 3.4v11.4"/><path d="M7.4 10.4 12 15l4.6-4.6"/><path d="M4 20.2h16"/>',
    upload: '<path d="M12 16.6V4.2"/><path d="M7.4 8.8 12 4.2l4.6 4.6"/><path d="M4 20.2h16"/>',
    sprout: '<path d="M12 21v-7.4"/><path d="M12 13.6c0-4.2 3.2-6.9 8.4-6.9 0 4.2-3.7 6.9-8.4 6.9z"/><path d="M12 15.9c0-3.2-2.8-5.3-6.9-5.3 0 3.2 3 5.3 6.9 5.3z"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    shield: '<path d="M12 3.2 19.4 6v6c0 4.6-3.1 7.6-7.4 8.9C7.7 19.6 4.6 16.6 4.6 12V6z"/><path d="M9 12.1l2.1 2.1 4-4"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11.2v5.3"/><circle cx="12" cy="8" r="1.05" fill="currentColor" stroke="none"/>',
    calendar: '<rect x="3.4" y="5.2" width="17.2" height="15.4" rx="2.8"/><path d="M8 3.2v4M16 3.2v4M3.4 10.2h17.2"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
    coins: '<ellipse cx="9" cy="7" rx="5.4" ry="2.8"/><path d="M3.6 7v4.2c0 1.5 2.4 2.8 5.4 2.8s5.4-1.3 5.4-2.8V7"/><path d="M9 14v3.2"/><ellipse cx="15.6" cy="16.4" rx="4" ry="2.1"/><path d="M19.6 16.4v3.1"/>',
    spark: '<path d="M12 3v4.2M12 16.8V21M4.6 12h3.2M16.2 12h3.2"/><path d="M7.1 7.1l2.2 2.2M14.7 14.7l2.2 2.2M16.9 7.1l-2.2 2.2M9.3 14.7l-2.2 2.2"/>'
  };

  function icon(name, size) {
    var p = ICON[name] || '';
    var s = size || 20;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" '
      + 'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function attrs(map) {
    var out = '';
    for (var k in map) {
      if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
      if (map[k] === null || map[k] === undefined || map[k] === false) continue;
      out += ' ' + k + '="' + esc(map[k]) + '"';
    }
    return out;
  }

  /* ---------------- 首页 ---------------- */

  function home(m) {
    var d = m.dash;
    var h = [];

    if (m.storageError) {
      h.push('<div class="banner">数据保存不可用，请重新打开应用并核对。</div>');
    }

    h.push('<section class="hero">');
    h.push('<div class="hero-top"><span>' + esc(d.dateText) + ' ' + esc(d.weekText) + '</span>'
      + '<span class="hero-pill">今日被动收入</span></div>');
    h.push('<div class="hero-label">今天躺赚</div>');
    h.push('<div class="hero-amount"><span class="cur">¥</span>' + esc(d.todayText) + '</div>');
    h.push('<div class="hero-meta"><span>≈ 每月 <b>¥' + esc(d.monthForecastText) + '</b></span>'
      + '<span>每年 <b>¥' + esc(d.yearForecastText) + '</b></span></div>');

    h.push('<div class="hero-foot">');
    h.push('<div><b class="num">' + esc(d.principalText) + '</b><i>总资产本金</i></div>');
    h.push('<div><b class="num">' + esc(d.allText) + '</b><i>累计总收益</i></div>');
    h.push('<div><b class="num">' + d.activeCount + '/' + d.count + '</b><i>计息中 / 全部</i></div>');
    h.push('</div>');

    if (d.goal) {
      h.push('<div class="goal-wrap"><div class="goal-line"><span>每日收益目标 ¥'
        + esc(d.goal.goalText) + '</span><span>' + d.goal.pct + '%</span></div>'
        + '<div class="goal-bar"><span style="width:' + d.goal.pct + '%"></span></div>'
        + '<div class="goal-line" style="margin-top:6px;margin-bottom:0"><span>'
        + esc(d.goal.gapText) + '</span></div></div>');
    }
    h.push('</section>');

    if (d.soonText) {
      h.push('<button class="alert" data-action="go" data-page="reminders">'
        + '<span class="ic">' + icon('clock', 17) + '</span>'
        + '<span><b>有资产即将到期</b><p>' + esc(d.soonText) + '</p></span></button>');
    }

    h.push('<div class="stat-grid">');
    h.push('<div class="stat"><div class="k">本月累计</div><div class="v gain">' + esc(d.monthText) + '</div></div>');
    h.push('<div class="stat"><div class="k">本年累计</div><div class="v gain">' + esc(d.yearText) + '</div></div>');
    h.push('<div class="stat"><div class="k">累计总收益</div><div class="v gain">' + esc(d.allText) + '</div></div>');
    h.push('</div>');

    h.push('<div class="sec"><h2>每笔资产今日收益</h2>'
      + (d.count ? '<span class="hint">由高到低</span>' : '') + '</div>');

    if (!d.count) {
      h.push('<div class="empty"><div class="art">' + icon('sprout', 34) + '</div>'
        + '<h3>还没有录入资产</h3>'
        + '<p>把银行定期、余额宝、公积金加进来<br/>就能看到每天躺赚多少钱</p>'
        + '<div class="btn-row"><button class="btn btn-primary" data-action="go" data-page="new">'
        + icon('plus', 18) + '新增资产</button></div>'
        + '<div style="margin-top:10px"><button class="btn btn-ghost btn-sm" data-action="demo">'
        + '填入 3 笔示例数据</button></div></div>');
    } else {
      h.push(assetList(d.rows, false));
    }

    h.push('<div class="disc">收益为估算值，仅供参考，以机构实际计息为准。</div>');
    return h.join('');
  }

  /* ---------------- 资产列表 ---------------- */

  function assetList(rows, showDelete) {
    var h = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      h.push('<div class="asset' + (r.active ? '' : ' off') + '" data-action="edit" data-id="' + esc(r.id) + '" role="button" tabindex="0">');
      h.push('<i class="bar"></i>');
      h.push('<div class="mid">');
      h.push('<div class="name"><span class="t">' + esc(r.typeText) + '</span><em>' + esc(r.name) + '</em></div>');
      h.push('<div class="sub"><span class="num">本金 ' + esc(r.principalText) + '</span>'
        + '<span class="sep">·</span><span>年化 ' + esc(r.rateText) + '%</span>'
        + (r.leftText && r.active ? '<span class="sep">·</span><span>' + esc(r.leftText) + '</span>' : '')
        + (!r.active && r.hasEnd ? '<span class="sep">·</span><span>' + esc(r.leftText) + '</span>' : '')
        + '</div>');
      if (r.pendingText) h.push('<div class="pending-tip">' + esc(r.pendingText) + '</div>');
      h.push('</div>');
      h.push('<div class="right"><div class="d num">+' + esc(r.todayText) + '</div>'
        + '<div class="u">累计 ' + esc(r.accruedText) + '</div></div>');
      if (showDelete) {
        h.push('<button class="del" data-action="del" data-id="' + esc(r.id) + '" aria-label="删除">'
          + icon('trash', 17) + '</button>');
      }
      h.push('</div>');
    }
    return h.join('');
  }

  function assets(m) {
    var h = [];
    h.push('<div class="search" id="search-box">' + icon('search', 16)
      + '<input id="kw" type="search" placeholder="搜索资产名称或备注" value="' + esc(m.kw) + '" autocomplete="off" />'
      + '<button class="clr" data-action="clear-kw" aria-label="清空" style="'
      + (m.kw ? '' : 'display:none') + '">' + icon('close', 15) + '</button>'
      + '</div>');
    h.push('<div id="list-zone">' + zone(m) + '</div>');
    return h.join('');
  }

  /** 列表区（搜索时只重绘这一块，避免输入框失焦） */
  function zone(m) {
    var h = [];
    var rows = m.rows;
    h.push('<div class="sec"><h2>' + (m.kw ? '搜索结果' : '全部资产') + '</h2>'
      + '<span class="hint">' + rows.length + ' 笔 · 今日合计 ¥' + esc(m.todaySumText) + '</span></div>');

    if (!rows.length) {
      h.push('<div class="empty"><div class="art">' + icon(m.kw ? 'search' : 'wallet', 34) + '</div>'
        + '<h3>' + (m.kw ? '没有匹配的资产' : '还没有资产') + '</h3>'
        + '<p>' + (m.kw ? '换个关键词试试' : '点击右上角 + 新增第一笔被动收入资产') + '</p></div>');
    } else {
      h.push(assetList(rows, true));
      h.push('<div style="text-align:center;padding:10px 0 0"><span class="hint" style="font-size:11.5px;color:var(--faint)">点卡片编辑，右侧垃圾桶删除</span></div>');
    }
    return h.join('');
  }

  /* ---------------- 编辑 / 新增 ---------------- */

  function field(name, label, value, opt) {
    var o = opt || {};
    return '<div class="field' + (o.error ? ' bad' : '') + '" data-field="' + name + '">'
      + '<label for="f-' + name + '">' + esc(label)
      + (o.optional ? '<span class="opt">选填</span>' : '') + '</label>'
      + '<input id="f-' + name + '" name="' + name + '"' + attrs({
        type: o.type || 'text',
        value: value,
        placeholder: o.placeholder || '',
        inputmode: o.inputmode || null,
        autocomplete: 'off',
        maxlength: o.maxlength || null
      }) + ' />'
      + (o.error ? '<div class="err">' + icon('info', 12) + esc(o.error) + '</div>' : '')
      + '</div>';
  }

  function edit(m) {
    var h = [];
    var e = m.errors || {};

    h.push('<div class="preview" id="pv">' + previewBlock(m) + '</div>');

    h.push('<div class="form-card">');
    h.push('<div class="type-grid">');
    for (var i = 0; i < m.types.length; i++) {
      var t = m.types[i];
      h.push('<button type="button" class="type-opt' + (m.form.type === t.key ? ' on' : '')
        + '" data-action="pick-type" data-type="' + t.key + '"><b>' + esc(t.text) + '</b>'
        + '<i>' + esc(t.hint) + '</i></button>');
    }
    h.push('</div>');

    h.push(field('name', '资产名称', m.form.name, {
      placeholder: '例：工行 3 年期定期', error: e.name, maxlength: 30
    }));
    h.push(field('principal', '本金金额（元）', m.form.principal, {
      placeholder: '0.00', inputmode: 'decimal', error: e.principal
    }));

    h.push('<div class="field-row">');
    h.push(field('rate', '年利率（%）', m.form.rate, {
      placeholder: '例：3.5', inputmode: 'decimal', error: e.rate
    }));
    h.push('</div>');

    h.push('<div class="field-row">');
    h.push(field('startDate', m.needEnd ? '起息日期' : '起息日期', m.form.startDate, {
      type: 'date', error: e.startDate
    }));
    if (m.needEnd) {
      h.push(field('endDate', '到期日期', m.form.endDate, { type: 'date', error: e.endDate }));
    }
    h.push('</div>');

    if (m.form.type === 'custom') {
      h.push('<button type="button" class="sw-row" data-action="toggle-hasend">'
        + '<span class="txt"><b>有到期日</b><i>大额存单、国债这类到期后停止计息的资产</i></span>'
        + '<span class="switch' + (m.form.hasEndDate ? ' on' : '') + '"></span></button>');
    }

    if (m.needEnd) {
      h.push('<button type="button" class="sw-row" data-action="toggle-remind">'
        + '<span class="txt"><b>到期提醒</b><i>到期前 7 天与到期当天提醒</i></span>'
        + '<span class="switch' + (m.form.remind ? ' on' : '') + '"></span></button>');
    }

    h.push(field('note', '备注', m.form.note, {
      placeholder: '银行卡号、支行等（选填）', optional: true, maxlength: 60
    }));
    h.push('</div>');

    h.push('<div class="btn-row" style="margin-top:4px">');
    h.push('<button class="btn btn-primary" data-action="save">' + (m.mode === 'edit' ? '保存修改' : '创建资产') + '</button>');
    h.push('</div>');

    if (m.mode === 'edit') {
      h.push('<div style="margin-top:9px"><button class="btn btn-danger" data-action="del" data-id="'
        + esc(m.form.id) + '">' + icon('trash', 17) + '删除这笔资产</button></div>');
      h.push('<div class="disc">修改本金或利率将于<b>明日起</b>按新参数计息，历史收益不会被改写。</div>');
    } else {
      h.push('<div class="disc">按单利计算：每日收益 = 本金 × 年利率 ÷ 365</div>');
    }
    return h.join('');
  }

  function previewBlock(m) {
    var p = m.pv;
    if (!p) return '';
    var h = ['<div class="l">预计每日收益</div>'];
    h.push('<div class="n">¥<span id="pv-daily">' + esc(p.dailyText) + '</span>'
      + '<small> / 天</small></div>');
    h.push('<div class="m" id="pv-meta">每月约 ¥' + esc(p.monthText) + ' · 每年约 ¥' + esc(p.yearText));
    if (p.days) h.push(' · 存 ' + p.days + ' 天到期，累计约 ¥' + esc(p.totalText));
    h.push('</div>');
    return h.join('');
  }

  /* ---------------- 历史 ---------------- */

  function chart(points, settings) {
    if (!points.length) return '';
    // viewBox 宽度贴近实际渲染宽度，保证坐标文字不会被等比缩小
    var W = 420, H = 200;
    var padL = 42, padR = 12, padT = 14, padB = 26;
    var iw = W - padL - padR;
    var ih = H - padT - padB;
    var max = 0;
    for (var i = 0; i < points.length; i++) if (points[i].total > max) max = points[i].total;
    if (max <= 0) max = 1;
    // 顶部留 20% 余量，避免折线贴着上边缘
    var top = max * 1.2;
    var n = points.length;
    var stepX = n > 1 ? iw / (n - 1) : iw;

    function X(idx) { return padL + (n > 1 ? idx * stepX : iw / 2); }
    function Y(v) { return padT + ih - (v / top) * ih; }

    var h = ['<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="每日收益趋势">'];
    h.push('<defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="var(--brand)" stop-opacity=".26"/>'
      + '<stop offset="100%" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs>');

    // 网格 + Y 轴刻度
    for (var g = 0; g <= 2; g++) {
      var v = top * (g / 2);
      var y = Y(v);
      h.push('<line class="gl" x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(1) + '"' + (g === 0 ? '' : ' stroke-dasharray="3 4"') + '/>');
      h.push('<text class="lab" x="' + (padL - 8) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end">'
        + esc(shortMoney(v)) + '</text>');
    }

    // 折线 + 面积
    var line = '';
    var area = '';
    var baseline = (padT + ih).toFixed(1);
    for (var j = 0; j < n; j++) {
      var px = X(j).toFixed(1);
      var py = Y(points[j].total).toFixed(1);
      line += (j === 0 ? 'M' : 'L') + px + ' ' + py;
      if (j === 0) area += 'M' + px + ' ' + baseline + 'L' + px + ' ' + py;
      else area += 'L' + px + ' ' + py;
    }
    area += 'L' + X(n - 1).toFixed(1) + ' ' + baseline + 'Z';
    h.push('<path class="area" d="' + area + '"/>');
    h.push('<path class="line" d="' + line + '"/>');

    // 今天的高亮点
    var lastIdx = n - 1;
    h.push('<circle class="pt" cx="' + X(lastIdx).toFixed(1) + '" cy="' + Y(points[lastIdx].total).toFixed(1) + '" r="3.2"/>');

    // X 轴标签（最多 5 个）
    var tickCount = Math.min(5, n);
    var used = {};
    for (var t = 0; t < tickCount; t++) {
      var idx = Math.round((n - 1) * (t / Math.max(1, tickCount - 1)));
      if (used[idx]) continue;
      used[idx] = 1;
      var anchor = idx === 0 ? 'start' : (idx === n - 1 ? 'end' : 'middle');
      h.push('<text class="lab" x="' + X(idx).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + anchor + '">'
        + esc(points[idx].label) + '</text>');
    }

    // 点击热区
    for (var k = 0; k < n; k++) {
      var w = n > 1 ? stepX : iw;
      h.push('<rect x="' + (X(k) - w / 2).toFixed(1) + '" y="' + padT + '" width="' + w.toFixed(1) + '" height="' + ih
        + '" fill="transparent" data-action="day" data-date="' + esc(points[k].date) + '" style="cursor:pointer"/>');
    }

    h.push('</svg>');
    return h.join('');
  }

  function shortMoney(v) {
    if (v >= 10000) return (v / 10000).toFixed(v >= 100000 ? 0 : 1) + '万';
    if (v >= 100) return String(Math.round(v));
    if (v >= 1) return v.toFixed(1);
    return v.toFixed(2);
  }

  function history(m) {
    var h = [];
    h.push('<div class="seg">');
    var ranges = [{ d: 7, t: '近 7 天' }, { d: 30, t: '近 30 天' }, { d: 90, t: '近 90 天' }];
    for (var i = 0; i < ranges.length; i++) {
      h.push('<button data-action="range" data-days="' + ranges[i].d + '" class="'
        + (m.days === ranges[i].d ? 'on' : '') + '">' + ranges[i].t + '</button>');
    }
    h.push('</div>');

    h.push('<div class="card chart-card">');
    h.push('<div class="chart-head"><b>每日被动收入趋势</b><span>' + esc(m.rangeText) + '</span></div>');
    h.push(chart(m.points, m.settings));
    h.push('<div style="display:flex;padding:8px 4px 6px;border-top:1px solid var(--line-2);margin-top:6px">'
      + '<div style="flex:1"><div class="k" style="font-size:10.5px;color:var(--muted)">区间合计</div>'
      + '<div class="v num" style="font-size:15px;font-weight:700;color:var(--gain)">¥' + esc(m.sumText) + '</div></div>'
      + '<div style="flex:1"><div class="k" style="font-size:10.5px;color:var(--muted)">日均</div>'
      + '<div class="v num" style="font-size:15px;font-weight:700">¥' + esc(m.avgText) + '</div></div>'
      + '<div style="flex:1"><div class="k" style="font-size:10.5px;color:var(--muted)">最高一天</div>'
      + '<div class="v num" style="font-size:15px;font-weight:700">¥' + esc(m.maxText) + '</div></div>'
      + '</div>');
    h.push('</div>');

    h.push('<div class="sec"><h2>每日明细</h2><span class="hint">点任意一天看明细</span></div>');
    h.push('<div class="card" style="padding:2px 14px">');
    for (var j = m.points.length - 1; j >= 0; j--) {
      var p = m.points[j];
      h.push('<button class="hist-row" data-action="day" data-date="' + esc(p.date) + '">'
        + '<span class="day"><b>' + esc(p.label) + '</b><i>' + esc(p.weekText) + (p.isToday ? ' · 今天' : '') + '</i></span>'
        + '<span class="bar-w"><span style="width:' + Math.max(2, Math.round(p.pctOfMax * 100)) + '%"></span></span>'
        + '<span class="val">' + esc(m.money(p.total)) + '</span></button>');
    }
    h.push('</div>');
    h.push('<div class="disc">历史收益按当前资产参数逐日推算，修改本金或利率只影响之后的日子。</div>');
    return h.join('');
  }

  /* ---------------- 提醒 ---------------- */

  function remRow(r) {
    var cls = 'rem';
    if (r.daysLeft < 0) cls += ' dead';
    else if (r.daysLeft <= 3) cls += ' urgent';
    var daysText = r.daysLeft < 0 ? '已到期' : (r.daysLeft === 0 ? '今天' : r.daysLeft + ' 天');
    return '<div class="' + cls + '" data-action="edit" data-id="' + esc(r.id) + '" role="button" tabindex="0">'
      + '<span class="left"><b>' + esc(r.name) + '</b>'
      + '<i>' + esc(r.typeText) + ' · 本金 ' + esc(r.principalText) + ' · ' + esc(r.endText) + '</i></span>'
      + '<span class="days"><b>' + esc(daysText) + '</b><i>' + (r.daysLeft < 0 ? '' : '后到期') + '</i></span>'
      + '<button class="switch' + (r.remind ? ' on' : '') + '" data-action="toggle-remind" data-id="' + esc(r.id)
      + '" role="switch" aria-checked="' + (r.remind ? 'true' : 'false') + '" aria-label="到期提醒"></button>'
      + '</div>';
  }

  function reminders(m) {
    var h = [];
    var r = m.rem;
    if (!r.notifyOn) {
      h.push('<div class="banner">' + icon('bell', 14) + '<span>到期提醒总开关已关闭，这里仍会列出到期情况。可在设置中重新开启。</span></div>');
    }
    var total = r.soon.length + r.later.length + r.expired.length;
    if (!total) {
      h.push('<div class="empty"><div class="art">' + icon('bell', 34) + '</div>'
        + '<h3>暂无到期提醒</h3>'
        + '<p>只有带到期日的资产（定期存款、大额存单、国债）才会出现在这里</p>'
        + '<div class="btn-row"><button class="btn btn-ghost" data-action="go" data-page="assets">去看全部资产</button></div></div>');
      return h.join('');
    }

    function group(title, items, note) {
      if (!items.length) return '';
      var s = ['<div class="group-t">' + esc(title) + '<span class="n">' + items.length + '</span>'
        + (note ? '<span style="font-weight:500;color:var(--faint);font-size:10.5px">' + esc(note) + '</span>' : '')
        + '</div>'];
      for (var i = 0; i < items.length; i++) s.push(remRow(items[i]));
      return s.join('');
    }

    h.push(group('7 天内到期', r.soon, '该安排资金了'));
    h.push(group('8 – 30 天到期', r.later, ''));
    h.push(group('已到期', r.expired, '近 90 天'));
    h.push('<div class="disc">提醒在打开应用时检查；开启浏览器通知后，当天到期与 7 天内到期的资产会推送一次系统通知。</div>');
    return h.join('');
  }

  /* ---------------- 设置 ---------------- */

  function settings(m) {
    var s = m.settings;
    var h = [];
    h.push('<div class="sec"><h2>显示</h2></div>');
    h.push('<div class="form-card" style="padding:0 16px">');
    h.push('<div class="set-item"><span class="txt"><b>收益小数位数</b><i>影响首页与列表的金额展示</i></span>'
      + '<span class="dec-opts">');
    for (var i = 0; i <= 3; i++) {
      h.push('<button data-action="set-dec" data-v="' + i + '" class="' + (m.decimals === i ? 'on' : '') + '">' + i + '</button>');
    }
    h.push('</span></div>');
    h.push('<div class="set-item"><span class="txt"><b>外观</b><i>深色更适合晚上算账</i></span>'
      + '<span class="dec-opts" style="gap:4px">'
      + '<button data-action="set-theme" data-v="light" style="width:auto;padding:0 10px" class="' + (m.theme === 'light' ? 'on' : '') + '">浅色</button>'
      + '<button data-action="set-theme" data-v="dark" style="width:auto;padding:0 10px" class="' + (m.theme === 'dark' ? 'on' : '') + '">深色</button>'
      + '<button data-action="set-theme" data-v="auto" style="width:auto;padding:0 10px" class="' + (m.theme === 'auto' ? 'on' : '') + '">自动</button>'
      + '</span></div>');
    h.push('</div>');

    h.push('<div class="sec"><h2>目标</h2></div>');
    h.push('<div class="form-card" style="padding:0 16px">');
    h.push('<div class="set-item"><span class="txt"><b>每日被动收入目标</b><i>填 0 表示不设目标</i></span></div>');
    h.push('<div class="field" style="border-bottom:0"><label for="f-goal">目标金额（元 / 天）</label>'
      + '<div class="rel"><input id="f-goal" name="goalDaily" inputmode="decimal" value="'
      + esc(s.goalDaily ? String(s.goalDaily) : '') + '" placeholder="0" />'
      + '<span class="unit">元 / 天</span></div></div>');
    h.push('<div style="padding:0 0 14px"><button class="btn btn-soft btn-sm" data-action="save-goal" style="width:100%">保存目标</button></div>');
    h.push('</div>');

    h.push('<div class="sec"><h2>提醒</h2></div>');
    h.push('<div class="form-card" style="padding:0 16px">');
    h.push('<button class="sw-row" data-action="toggle-notify">'
      + '<span class="txt"><b>到期提醒总开关</b><i>关闭后首页不再提示，也不推送通知</i></span>'
      + '<span class="switch' + (s.notify ? ' on' : '') + '"></span></button>');
    h.push('<button class="sw-row" data-action="toggle-browser-notify">'
      + '<span class="txt"><b>浏览器通知</b><i>'
      + esc(m.notifyHint) + '</i></span>'
      + '<span class="switch' + (m.browserNotify ? ' on' : '') + '"></span></button>');
    h.push('</div>');

    h.push('<div class="sec"><h2>数据</h2></div>');
    h.push('<div class="form-card" style="padding:0 16px">');
    h.push('<button class="set-item" data-action="export">'
      + '<span class="txt"><b>导出备份</b><i>下载 JSON 文件，共 ' + m.count + ' 笔资产</i></span>'
      + '<span class="chev">' + icon('download', 16) + '</span></button>');
    h.push('<button class="set-item" data-action="import">'
      + '<span class="txt"><b>从备份恢复</b><i>选择之前导出的 JSON 文件，覆盖当前数据</i></span>'
      + '<span class="chev">' + icon('upload', 16) + '</span></button>');
    h.push('<button class="set-item" data-action="clear-all">'
      + '<span class="txt"><b style="color:var(--gain)">清空全部数据</b><i>删除所有资产与设置，不可撤销</i></span>'
      + '<span class="chev">' + icon('trash', 16) + '</span></button>');
    h.push('</div>');

    h.push('<div class="about">');
    h.push('<div class="logo">' + icon('sprout', 28) + '</div>');
    h.push('<div class="vn">被动收入小账本 v2.0</div>');
    h.push('<div>数据保存在应用数据库<br/>打开应用时检查到期提醒</div>');
    h.push('</div>');

    h.push('<div class="disc" style="padding-top:14px">全部按单利估算：每日收益 = 本金 × 年利率 ÷ 365。<br/>'
      + '银行可能按 360 天计息或另有结息规则，结果会有微小差异，仅供参考。<br/>'
      + '让我们等待退休的一天。</div>');
    return h.join('');
  }

  global.PILViews = {
    icon: icon,
    esc: esc,
    home: home,
    assets: assets,
    zone: zone,
    edit: edit,
    previewBlock: previewBlock,
    history: history,
    chart: chart,
    reminders: reminders,
    settings: settings
  };
})(window);
