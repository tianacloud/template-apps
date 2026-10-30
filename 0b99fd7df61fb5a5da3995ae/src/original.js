
(function(){
  'use strict';

  var DATABASE_ID = 'reports';
  var DB_ID_ATTR = 'reports';

  var CATS = [
    { key:'online',  name:'线上问题', icon:'🚨', color:'#e5484d' },
    { key:'bug',     name:'Bug 修复', icon:'🐞', color:'#f76808' },
    { key:'perf',    name:'性能优化', icon:'⚡', color:'#8b46c6' },
    { key:'feature', name:'功能开发', icon:'✨', color:'#2563eb' },
    { key:'doc',     name:'文档协作', icon:'📝', color:'#0f8a5f' },
    { key:'other',   name:'其他事项', icon:'🔧', color:'#64748b' }
  ];
  var PRIORITY = ['online','bug','perf','feature','doc','other'];
  var CAT_NAME = {};
  var CAT_ICON = {};
  for (var ci = 0; ci < CATS.length; ci++) { CAT_NAME[CATS[ci].key] = CATS[ci].name; CAT_ICON[CATS[ci].key] = CATS[ci].icon; }

  var KEYWORDS = {
    online: ['线上','生产环境','生产','告警','事故','回滚','宕机','雪崩','紧急','hotfix','p0','p1','资损','故障','应急','报警'],
    bug:    ['修复','bug','缺陷','报错','异常','崩溃','闪退','错乱','失效','不生效','空指针','500','404','错位','脏数据','重复提交','卡死','白屏','越界','泄漏'],
    perf:   ['优化','性能','重构','缓存','索引','耗时','慢查询','内存','并发','提速','降低','减少','加速','压缩','qps','响应时间'],
    feature:['新增','实现','开发','支持','增加','接入','完成','上线','feature','搭建','打通','迁移','上线了'],
    doc:    ['文档','注释','readme','评审','review','会议','复盘','梳理','同步','沟通','培训','方案','规范','清单','对齐'],
    other:  []
  };

  var STYLE_NAME = { weekly:'周会口播版', group:'群消息版', perf:'绩效自评版' };
  var STYLE_FILE = { weekly:'周报-口播版', group:'周报-群消息版', perf:'周报-自评版' };

  var state = {
    items: [],
    style: 'weekly',
    period: '',
    currentText: '',
    recordCount: 0
  };

  var SDK = null;
  if (typeof window.__SMART_PAGE__ !== 'undefined' && window.__SMART_PAGE__) { SDK = window.__SMART_PAGE__; }
  var db = (SDK && SDK.database) ? SDK.database : null;
  var SCHEMA_OPTIONS = {};

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function mk(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (typeof text === 'string') { n.textContent = text; }
    return n;
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    if (!t) { return; }
    t.textContent = msg;
    t.className = 'toast on';
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function(){ t.className = 'toast'; }, 2200);
  }

  /* ---------------- 草稿缓存 ---------------- */

  var draftTimer = null, draftRevision = 0, draftQueue = Promise.resolve();
  function queueDraft(value) {
    draftQueue = draftQueue.catch(function(){}).then(function(){ return db.saveDraft(value); }).catch(function(err){ console.error('草稿保存失败', err); toast('草稿保存失败，请检查连接'); });
  }
  function writeDraft() {
    if (!db) { return; }
    queueDraft({raw_input: $('#rawInput').value, report_period: $('#periodInput').value});
  }
  function clearDraft() {
    ++draftRevision;
    if (draftTimer) { clearTimeout(draftTimer); draftTimer = null; }
    if (db) { queueDraft(null); }
  }
  function scheduleDraft() {
    ++draftRevision;
    if (draftTimer) { clearTimeout(draftTimer); }
    draftTimer = setTimeout(writeDraft, 300);
  }

  function updateLineCount() {
    var v = $('#rawInput').value;
    var n = 0;
    var lines = v.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].replace(/\s/g, '')) { n += 1; }
    }
    $('#lineCount').textContent = n + ' 条原料';
  }

  /* ---------------- 日期 ---------------- */

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }

  function mondayOf(base) {
    var d = new Date(base.getTime());
    var day = d.getDay();
    var diff = (day === 0) ? -6 : (1 - day);
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function periodFor(which) {
    var mon = mondayOf(new Date());
    if (which === 'last') { mon.setDate(mon.getDate() - 7); }
    var sun = new Date(mon.getTime());
    sun.setDate(sun.getDate() + 6);
    return ymd(mon) + ' ~ ' + ymd(sun);
  }
  function periodShort(p) {
    var m = p.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s*[~至\-–]+\s*(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) { return m[2] + '.' + m[3] + ' - ' + m[5] + '.' + m[6]; }
    return p;
  }
  function dateShort(iso) {
    if (!iso) { return ''; }
    var s = String(iso);
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) { return m[1] + '.' + m[2] + '.' + m[3]; }
    return s;
  }

  /* ---------------- 解析 ---------------- */

  function stripMarkers(s) {
    var t = s;
    t = t.replace(/^\s*[-*•·—]+\s*/, '');
    t = t.replace(/^\s*\d+\s*[.、)）]\s*/, '');
    t = t.replace(/^\s*\[\s?[xX]?\s?\]\s*/, '');
    t = t.replace(/^\s*(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[/.]\d{1,2})\s+/, '');
    return t;
  }

  function extractModule(text) {
    var m = text.match(/^\s*[\[【（(]\s*([^\]】）)]{1,12})\s*[\]】）)]\s*/);
    if (m) { return { module: m[1], rest: text.slice(m[0].length) }; }
    return { module: '', rest: text };
  }

  function classify(text) {
    var low = text.toLowerCase();
    var best = 'other';
    var bestScore = 0;
    for (var i = 0; i < PRIORITY.length; i++) {
      var key = PRIORITY[i];
      var words = KEYWORDS[key] || [];
      var score = 0;
      for (var j = 0; j < words.length; j++) {
        if (words[j] && low.indexOf(words[j]) !== -1) { score += 1; }
      }
      if (key === 'online' && score > 0) { score += 2; }
      if (score > bestScore) { bestScore = score; best = key; }
    }
    return best;
  }

  function normalize(text) {
    var t = text.replace(/\s+/g, ' ').trim();
    t = t.replace(/[。；;]+$/, '');
    return t;
  }

  function parseRaw(raw) {
    var lines = String(raw || '').split(/\r?\n/);
    var items = [];
    var seen = {};
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (!line || !line.replace(/\s/g, '')) { continue; }
      var t = stripMarkers(line);
      if (!t || !t.replace(/\s/g, '')) { continue; }
      var em = extractModule(t);
      var module = em.module;
      var body = normalize(em.rest);
      if (!body) { body = normalize(t); }
      var key = body.toLowerCase();
      if (seen[key]) { continue; }
      seen[key] = true;
      items.push({ text: body, module: module, cat: classify(body + ' ' + module) });
    }
    return items;
  }

  function groupItems() {
    var g = {};
    for (var i = 0; i < CATS.length; i++) { g[CATS[i].key] = []; }
    for (var k = 0; k < state.items.length; k++) {
      var it = state.items[k];
      if (!g[it.cat]) { g[it.cat] = []; }
      g[it.cat].push(it);
    }
    return g;
  }

  function countOf(items, cat) {
    var n = 0;
    for (var i = 0; i < items.length; i++) { if (items[i].cat === cat) { n += 1; } }
    return n;
  }

  function topModules(n) {
    return modulesOf(state.items, n);
  }

  function modulesOf(list, n) {
    var map = {};
    var order = [];
    for (var i = 0; i < list.length; i++) {
      var m = list[i].module;
      if (!m) { continue; }
      if (!map[m]) { map[m] = 0; order.push(m); }
      map[m] = map[m] + 1;
    }
    order.sort(function(a, b){ return map[b] - map[a]; });
    var out = [];
    for (var j = 0; j < order.length && out.length < n; j++) { out.push(order[j]); }
    return out;
  }

  function modulePhraseOf(list, n) {
    var mods = modulesOf(list, n);
    if (!mods.length) { return ''; }
    return '主要集中在' + mods.join('、') + '这几个模块';
  }

  function joinTop(list, n) {
    var out = [];
    for (var i = 0; i < list.length && out.length < n; i++) { out.push(list[i].text); }
    var s = out.join('；');
    if (list.length > n) { s += '等'; }
    return s;
  }

  /* ---------------- 三种口吻 ---------------- */

  function genWeekly() {
    var g = groupItems();
    var total = state.items.length;
    var lines = [];
    var period = periodShort(state.period);
    lines.push('本周（' + period + '）一共推进了 ' + total + ' 项工作。');

    if (g.online.length) {
      lines.push('线上稳定性方面，处理了 ' + g.online.length + ' 起线上问题：' + joinTop(g.online, 2) + '。');
    }
    if (g.feature.length) {
      lines.push('功能开发方面，完成了 ' + g.feature.length + ' 项：' + joinTop(g.feature, 2) + '。');
    }
    if (g.bug.length) {
      var mp = modulePhraseOf(g.bug, 2);
      lines.push('质量方面，修复了 ' + g.bug.length + ' 个缺陷' + (mp ? '，' + mp : '') + '：' + joinTop(g.bug, 2) + '。');
    }
    if (g.perf.length) {
      lines.push('性能与结构方面，做了 ' + g.perf.length + ' 项优化：' + joinTop(g.perf, 2) + '。');
    }
    if (g.doc.length) {
      lines.push('协作方面，参与了 ' + g.doc.length + ' 项文档、评审与沟通类工作。');
    }
    if (g.other.length) {
      lines.push('另外还处理了 ' + g.other.length + ' 项杂项事务：' + joinTop(g.other, 2) + '。');
    }
    var mods = topModules(2);
    lines.push('下周计划：继续推进' + (mods.length ? mods[0] : '当前主线') + '的后续打磨，并盯一下线上巡检。');
    lines.push('需要支持：（有就补一句，没有删掉这行即可）');
    return lines.join('\n\n');
  }

  function genGroup() {
    var g = groupItems();
    var period = periodShort(state.period);
    var lines = [];
    lines.push('📅 周报 | ' + period);
    lines.push('');

    var total = state.items.length;
    for (var i = 0; i < CATS.length; i++) {
      var cat = CATS[i];
      var list = g[cat.key] || [];
      if (!list.length) { continue; }
      lines.push(cat.icon + ' ' + cat.name + ' · ' + list.length);
      for (var j = 0; j < list.length; j++) {
        var it = list[j];
        var text = it.module ? '[' + it.module + '] ' + it.text : it.text;
        lines.push('· ' + text);
      }
      lines.push('');
    }

    var parts = [];
    parts.push('合计 ' + total + ' 项');
    if (g.feature.length) { parts.push('新增 ' + g.feature.length); }
    if (g.bug.length) { parts.push('修复 ' + g.bug.length); }
    if (g.perf.length) { parts.push('优化 ' + g.perf.length); }
    if (g.online.length) { parts.push('线上 ' + g.online.length); }
    lines.push('📊 ' + parts.join(' · '));

    var mods = topModules(2);
    if (mods.length) { lines.push('🎯 下周：' + mods.join(' / ') + ' 继续推进'); }
    return lines.join('\n').replace(/\n+$/, '');
  }

  function genPerf() {
    var g = groupItems();
    var period = periodShort(state.period);
    var lines = [];
    lines.push('本周工作小结（' + period + '）');
    lines.push('');
    lines.push('一、交付成果');

    if (g.feature.length) {
      lines.push('· 完成 ' + g.feature.length + ' 项功能开发：' + joinTop(g.feature, 3) + '。');
    }
    if (g.bug.length) {
      var mp = modulePhraseOf(g.bug, 3);
      lines.push('· 修复 ' + g.bug.length + ' 个缺陷' + (mp ? '，' + mp : '') + '：' + joinTop(g.bug, 3) + '。');
    }
    if (g.perf.length) {
      lines.push('· 完成 ' + g.perf.length + ' 项性能与结构优化：' + joinTop(g.perf, 3) + '。');
    }
    if (g.online.length) {
      lines.push('· 响应并闭环 ' + g.online.length + ' 起线上问题：' + joinTop(g.online, 2) + '。');
    }
    if (g.doc.length) {
      lines.push('· 参与 ' + g.doc.length + ' 项文档、评审与协作工作。');
    }
    if (g.other.length) {
      lines.push('· 其他事项 ' + g.other.length + ' 项：' + joinTop(g.other, 2) + '。');
    }

    lines.push('');
    lines.push('二、覆盖范围');
    var mods = topModules(5);
    lines.push('本周工作覆盖 ' + mods.length + ' 个模块（' + (mods.length ? mods.join('、') : '主线业务') + '），共 ' + state.items.length + ' 项产出。');
    lines.push('');
    lines.push('三、可补充的量化指标');
    lines.push('- 缺陷修复后的回归情况、线上问题的响应与恢复时长');
    lines.push('- 接口耗时、慢查询数量等优化前后的对比数据');
    lines.push('- 需求交付的准时率与返工情况');
    return lines.join('\n');
  }

  function currentReport() {
    if (!state.items.length) { return ''; }
    if (state.style === 'group') { return genGroup(); }
    if (state.style === 'perf') { return genPerf(); }
    return genWeekly();
  }

  /* ---------------- 渲染 ---------------- */

  function renderStats() {
    var items = state.items;
    $('#kTotal').textContent = String(items.length);
    $('#kBug').textContent = String(countOf(items, 'bug'));
    $('#kFeature').textContent = String(countOf(items, 'feature'));
    $('#kPerf').textContent = String(countOf(items, 'perf'));

    var bar = $('#catbar');
    bar.textContent = '';
    if (!items.length) { return; }
    for (var i = 0; i < CATS.length; i++) {
      var cat = CATS[i];
      var n = countOf(items, cat.key);
      if (!n) { continue; }
      var chip = mk('span', 'cat-chip');
      var icon = mk('span', '', cat.icon);
      var label = mk('span', '', cat.name);
      var num = mk('em', '', ' ' + n);
      chip.appendChild(icon);
      chip.appendChild(label);
      chip.appendChild(num);
      bar.appendChild(chip);
    }
  }

  function renderOutput() {
    var out = $('#output');
    if (!state.items.length) {
      out.textContent = '炉子还是空的。点左上角「倒一份示例原料」，先看它怎么炼。';
      state.currentText = '';
      return;
    }
    var text = currentReport();
    state.currentText = text;
    out.textContent = text;
  }

  function renderAll() {
    renderStats();
    renderOutput();
  }

  /* ---------------- 提炼动作 ---------------- */

  function cook() {
    var raw = $('#rawInput').value;
    state.period = ($('#periodInput').value || '').trim() || periodFor('this');
    $('#periodInput').value = state.period;
    state.items = parseRaw(raw);
    renderAll();
    if (!state.items.length) {
      toast('还没识别到内容，一行写一条试试');
    } else {
      toast('炼好了：' + state.items.length + ' 项');
    }
  }

  var SAMPLE = [
    '- [订单] 修复下单超时后订单状态卡在待支付的问题',
    '- [支付] 新增微信支付回调幂等校验，避免重复入账',
    '- [网关] 线上 502 告警突增，排查为连接池耗尽，已扩容并补了监控',
    '- 优化订单列表查询，去掉 N+1 查询，响应时间从 1.2s 降到 240ms',
    '- 修复导出 Excel 超过 5 万行时内存溢出的缺陷',
    '- [用户] 实现手机号重复注册的拦截逻辑',
    '- 参加订单中心重构方案评审，输出 3 条改进意见',
    '- 补充爬虫调度模块 README 与部署说明',
    '- [报表] 修复按周统计少算一天的问题',
    '- 重构金额计算工具类，统一使用 BigDecimal',
    '- [风控] 新增黑名单校验，支持批量导入',
    '- 修复分页参数越界导致 500 的问题'
  ].join('\n');

  /* ---------------- 复制 / 下载 ---------------- */

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'readonly');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    var ok = false;
    try {
      ta.select();
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    toast(ok ? '已复制，去群里粘贴吧' : '复制失败，请手动选中复制');
  }

  function copyText(text) {
    if (!text) { toast('还没炼出东西来'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){
        toast('已复制，去群里粘贴吧');
      }).catch(function(){
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function downloadText(text, name) {
    try {
      var blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name + '.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1200);
      toast('已下载 ' + name + '.md');
    } catch (e) {
      toast('下载失败，可以先用「复制」');
    }
  }

  /* ---------------- 存档 ---------------- */

  function setHidden(name, value) {
    var el = document.querySelector('[name="' + name + '"]');
    if (el) { el.value = value; }
  }

  function optionIdByText(field, text) {
    var opts = SCHEMA_OPTIONS[field] || [];
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].text === text) { return opts[i].id; }
    }
    return '';
  }

  function optionTextById(field, id) {
    var opts = SCHEMA_OPTIONS[field] || [];
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].id === id) { return opts[i].text; }
    }
    return id;
  }

  function renderStyleOptions() {
    var sel = document.querySelector('[name="report_style"]');
    if (!sel) { return; }
    sel.textContent = '';
    var opts = SCHEMA_OPTIONS['输出风格'] || [];
    var ph = document.createElement('option');
    ph.value = '';
    ph.textContent = '请选择';
    sel.appendChild(ph);
    for (var i = 0; i < opts.length; i++) {
      var o = document.createElement('option');
      o.value = opts[i].id;
      o.textContent = opts[i].text;
      sel.appendChild(o);
    }
  }

  function archiveTitle() {
    var s = periodShort(state.period || periodFor('this'));
    return '周报 · ' + s;
  }

  function saveReport() {
    var btn = $('#btnSave');
    if (!state.items.length || !state.currentText) { toast('先点「开炉提炼」，有内容才能存档'); return; }
    if (!db) { toast('当前环境没连上资料库，存档暂不可用'); return; }

    var styleText = STYLE_NAME[state.style];
    var styleId = optionIdByText('输出风格', styleText);
    if (!styleId) { toast('输出风格的选项还没加载好，刷新一下再试'); return; }

    var title = archiveTitle();
    var raw = $('#rawInput').value;
    setHidden('report_title', title);
    setHidden('item_count', String(state.items.length));
    setHidden('report_style', styleId);
    setHidden('report_body', state.currentText);
    setHidden('created_at', ymd(new Date()));

    var properties = {};
    properties['周报标题'] = { text: title };
    properties['条目数'] = { number: state.items.length };
    properties['输出风格'] = { select: styleId };
    properties['周期'] = { text: state.period };
    properties['正文'] = { text: state.currentText };
    properties['原始记录'] = { text: raw };
    properties['创建时间'] = { date: new Date().toISOString() };

    var savedDraftRevision = draftRevision;
    btn.disabled = true;
    btn.textContent = '存档中…';
    db.addRecord({ databaseId: DATABASE_ID, properties: properties }).then(function(){
      toast('已存进资料库');
      btn.disabled = false;
      btn.textContent = '存档到资料库';
      if (draftRevision === savedDraftRevision) { clearDraft(); }
      loadArchive();
    }, function(err){
      console.error('[database] 存档失败:', err);
      toast('存档失败，稍后再试一次');
      btn.disabled = false;
      btn.textContent = '存档到资料库';
    });
  }

  function setArcState(msg) {
    var s = $('#arcState');
    if (!s) { return; }
    s.textContent = msg || '';
    s.style.display = msg ? 'block' : 'none';
  }

  function formatCount(n) {
    var v = (typeof n === 'number') ? n : parseInt(n, 10);
    if (isNaN(v)) { return ''; }
    return String(v);
  }

  function bindable(node, field) {
    if (field) { node.setAttribute('data-field', field); }
    node.setAttribute('data-sp-bindable', 'database');
    node.setAttribute('data-sp-database-id', DB_ID_ATTR);
    return node;
  }

  function renderArchive(rows) {
    var list = $('#arcList');
    list.textContent = '';
    $('#arcCount').textContent = String(rows.length);
    state.recordCount = rows.length;

    if (!rows.length) {
      setArcState('还没有存档。炼好一份，点「存档到资料库」，这里就会长出来。');
      return;
    }
    setArcState('');

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var card = mk('div', 'arc');

      var hd = mk('div', 'arc-hd');
      var title = bindable(mk('span', 'arc-title', String(row['周报标题'] || '未命名周报')), 'report_title');
      var styleRaw = row['输出风格'] || '';
      var styleLabel = optionTextById('输出风格', styleRaw);
      var styleEl = bindable(mk('span', 'arc-style', styleLabel || '周报'), 'report_style');
      hd.appendChild(title);
      hd.appendChild(styleEl);
      card.appendChild(hd);

      var meta = mk('div', 'arc-meta');
      meta.appendChild(bindable(mk('span', '', String(row['周期'] || '')), 'report_period'));
      meta.appendChild(mk('span', '', ' · '));
      meta.appendChild(bindable(mk('span', '', formatCount(row['条目数']) + ' 条'), 'item_count'));
      meta.appendChild(mk('span', '', ' · '));
      meta.appendChild(bindable(mk('span', '', dateShort(row['创建时间'])), 'created_at'));
      card.appendChild(meta);

      var det = document.createElement('details');
      det.appendChild(mk('summary', '', '展开正文'));
      var pre = bindable(mk('pre', '', String(row['正文'] || '')), 'report_body');
      det.appendChild(pre);
      card.appendChild(det);

      var acts = mk('div', 'arc-acts');
      var copyBtn = mk('button', 'mini', '复制');
      copyBtn.type = 'button';
      copyBtn.setAttribute('data-act', 'copy');
      var delBtn = mk('button', 'mini danger', '删除');
      delBtn.type = 'button';
      delBtn.setAttribute('data-act', 'del');
      acts.appendChild(copyBtn);
      acts.appendChild(delBtn);
      card.appendChild(acts);

      card.setAttribute('data-record-id', row.record_id || '');
      list.appendChild(card);
    }
  }

  function loadArchive() {
    if (!db) {
      setArcState('当前环境没有连上资料库，存档区暂不可用；周报生成功能仍可正常使用。');
      $('#arcCount').textContent = '0';
      return;
    }
    setArcState('正在读取存档…');
    var acc = [];
    var guard = 0;

    function fetchPage(cursor) {
      db.query({
        databaseId: DATABASE_ID,
        sorts: [{ property: '创建时间', direction: 'descending' }],
        pageSize: 200,
        startCursor: cursor
      }).then(function(res){
        var page = (res && res.results) ? res.results : [];
        acc = acc.concat(page);
        var next = res ? res.nextCursor : '';
        if (res && res.hasMore && next && next !== cursor && page.length && guard < 50) {
          guard = guard + 1;
          fetchPage(next);
        } else {
          renderArchive(acc);
        }
      }).catch(function(err){
        console.error('[database] 读取存档失败:', err);
        setArcState('存档读取失败，点右上角「刷新」再试一次。');
      });
    }
    fetchPage(undefined);
  }

  function deleteRecord(rid, node) {
    if (!db || !rid) { toast('这条记录缺少 ID，删不掉'); return; }
    db.deleteRecord({ databaseId: DATABASE_ID, recordId: rid }).then(function(){
      toast('已删除');
      if (node && node.parentNode) { node.parentNode.removeChild(node); }
      loadArchive();
    }, function(err){
      console.error('[database] 删除失败:', err);
      toast('删除失败，稍后再试');
    });
  }

  /* ---------------- 事件 ---------------- */

  function wire() {
    $('#rawInput').addEventListener('input', function(){
      updateLineCount();
      scheduleDraft();
    });

    $('#periodInput').addEventListener('input', function(){
      state.period = this.value;
      scheduleDraft();
    });
    $('#periodInput').addEventListener('change', function(){
      state.period = this.value;
      scheduleDraft();
    });

    $('#btnClear').addEventListener('click', function(){
      $('#rawInput').value = '';
      $('#lineCount').textContent = '0 条原料';
      state.items = [];
      state.currentText = '';
      clearDraft();
      renderAll();
      $('#output').textContent = '炉子还是空的。点左上角「倒一份示例原料」，先看它怎么炼。';
    });

    $('#btnSample').addEventListener('click', function(){
      $('#rawInput').value = SAMPLE;
      $('#lineCount').textContent = '12 条原料';
      setPeriod('this');
      cook();
      scheduleDraft();
      var target = $('#step-output');
      if (target && target.scrollIntoView) { target.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });

    $('#btnJump').addEventListener('click', function(){
      var input = $('#rawInput');
      if (input && input.focus) { input.focus(); }
      var target = $('#step-input');
      if (target && target.scrollIntoView) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });

    $('#btnCook').addEventListener('click', cook);

    var segs = $$('.seg');
    for (var i = 0; i < segs.length; i++) {
      segs[i].addEventListener('click', function(){
        setPeriod(this.getAttribute('data-period'));
        scheduleDraft();
        if (state.items.length) { cook(); }
      });
    }

    var tabs = $$('.tab');
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].addEventListener('click', function(){
        for (var k = 0; k < tabs.length; k++) {
          tabs[k].className = 'tab';
          tabs[k].setAttribute('aria-selected', 'false');
        }
        this.className = 'tab on';
        this.setAttribute('aria-selected', 'true');
        state.style = this.getAttribute('data-style');
        renderOutput();
      });
    }

    $('#btnCopy').addEventListener('click', function(){ copyText(state.currentText); });
    $('#btnDownload').addEventListener('click', function(){
      if (!state.currentText) { toast('还没炼出东西来'); return; }
      downloadText(state.currentText, STYLE_FILE[state.style] + '-' + (state.period || ymd(new Date())));
    });
    $('#btnSave').addEventListener('click', saveReport);
    $('#btnRefresh').addEventListener('click', loadArchive);

    $('#arcList').addEventListener('click', function(e){
      var btn = e.target;
      if (!btn || !btn.getAttribute) { return; }
      var act = btn.getAttribute('data-act');
      if (!act) { return; }
      var card = btn;
      while (card && card.getAttribute && !card.getAttribute('data-record-id')) { card = card.parentNode; }
      if (!card || !card.getAttribute) { return; }
      var rid = card.getAttribute('data-record-id');
      if (act === 'copy') {
        var pre = card.querySelector('[data-field="report_body"]');
        copyText(pre ? pre.textContent : '');
      } else if (act === 'del') {
        if (window.confirm('删除这份存档？删除后无法恢复。')) { deleteRecord(rid, card); }
      }
    });
  }

  function setPeriod(which) {
    var p = periodFor(which);
    $('#periodInput').value = p;
    state.period = p;
    var segs = $$('.seg');
    for (var i = 0; i < segs.length; i++) {
      segs[i].className = (segs[i].getAttribute('data-period') === which) ? 'seg on' : 'seg';
    }
  }

  /* ---------------- 初始化 ---------------- */

  function init() {
    wire();
    setPeriod('this');
    renderStyleOptions();
    renderStats();
    loadArchive();

    var initialRevision = draftRevision;
    if (db) { db.readDraft().then(function(draft){
      if (!draft || draftRevision !== initialRevision) { return; }
      if (draft.raw_input) { $('#rawInput').value = draft.raw_input; }
      if (draft.report_period) { $('#periodInput').value = draft.report_period; state.period = draft.report_period; }
      updateLineCount();
      if (draft.raw_input) { cook(); }
    }).catch(function(err){ console.error('草稿读取失败', err); toast('草稿读取失败，请检查连接'); }); }

    if (!db) { return; }
    db.getSchema({ databaseId: DATABASE_ID }).then(function(schema){
      var props = (schema && schema.properties) ? schema.properties : [];
      for (var i = 0; i < props.length; i++) {
        var f = props[i];
        if ((f.type === 'select' || f.type === 'multi_select') && f.config && f.config.options) {
          SCHEMA_OPTIONS[f.name] = f.config.options;
        }
      }
      renderStyleOptions();
      loadArchive();
    }).catch(function(err){
      console.error('[database] 读取表结构失败:', err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
