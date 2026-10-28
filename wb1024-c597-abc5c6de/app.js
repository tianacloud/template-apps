/* ===========================================================
   到期雷达 — 全部逻辑跑在浏览器本地，无依赖
   =========================================================== */
(function () {
  'use strict';

  var KEY = 'expired-radar.v1';
  var DAY = 86400000;

  var CATS = [
    { id: 'ai',      name: 'AI 工具',  color: '#2CE0A8' },
    { id: 'cloud',   name: '云服务',   color: '#5AA9FF' },
    { id: 'member',  name: '会员订阅', color: '#B58CFF' },
    { id: 'fitness', name: '课程健身', color: '#FFB03A' },
    { id: 'other',   name: '其他',     color: '#8FA3B8' }
  ];

  var CYCLE_NAME = { once: '一次性', monthly: '月付', quarterly: '季付', yearly: '年付' };
  var CYCLE_STEP = { monthly: 1, quarterly: 3, yearly: 12 };

  var BUCKETS = [
    { id: 'expired', name: '已过期', hint: '已经失效，确认还要不要续', tone: 'var(--danger)' },
    { id: 'd3',      name: '3 天内', hint: '马上要扣费或断服', tone: 'var(--hot)' },
    { id: 'week',    name: '本周内', hint: '4–7 天内到期', tone: 'var(--warn)' },
    { id: 'later',   name: '更晚',   hint: '7 天以后，先放着', tone: 'var(--calm)' }
  ];

  /* ---------------- 工具 ---------------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function today0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function parseD(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fmtMD(d) { return pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function addMonths(base, n) {
    if (!n) return new Date(base.getFullYear(), base.getMonth(), base.getDate());
    var y = base.getFullYear(), m = base.getMonth() + n, day = base.getDate();
    var probe = new Date(y, m, 1);
    var last = new Date(probe.getFullYear(), probe.getMonth() + 1, 0).getDate();
    return new Date(probe.getFullYear(), probe.getMonth(), Math.min(day, last));
  }

  var WD = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  function fmtCN(d) { return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 ' + WD[d.getDay()]; }
  function fmtShort(d) { return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'; }

  /* ---------------- 到期推算 ---------------- */

  // 周期类：从锚点日期往后推，直到不早于今天（保持"每月 15 日"这种锚点不漂移）
  function dueInfo(item, today) {
    var base = parseD(item.baseDate);
    var step = CYCLE_STEP[item.cycle];
    if (!step) return { due: base, prev: null, rollovers: 0 };

    var n = 0;
    while (n < 800 && addMonths(base, n * step) < today) n++;
    var due = addMonths(base, n * step);
    var prev = n > 0 ? addMonths(base, (n - 1) * step) : null;
    return { due: due, prev: prev, rollovers: n };
  }

  function bucketOf(item, days) {
    if (days < 0) return 'expired';
    if (days <= 3) return 'd3';
    if (days <= 7) return 'week';
    return 'later';
  }

  function catOf(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i];
    return CATS[CATS.length - 1];
  }

  function yearlyCost(item) {
    var a = Number(item.amount) || 0;
    if (item.cycle === 'monthly') return a * 12;
    if (item.cycle === 'quarterly') return a * 4;
    if (item.cycle === 'yearly') return a;
    return 0;
  }

  /* ---------------- 状态 ---------------- */

  var state = {
    items: [],
    query: '',
    sort: 'due',
    filter: 'all',
    editingId: null,
    remindValue: 7
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.items)) return false;
      state.items = data.items.filter(function (x) { return x && x.name && x.baseDate; });
      return true;
    } catch (e) { return false; }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ v: 1, items: state.items })); }
    catch (e) { toast('保存失败，浏览器存储可能被禁用了'); }
  }

  /* ---------------- 示例数据 ---------------- */

  function demoItems() {
    var t = today0();
    function d(n) { var x = new Date(t); x.setDate(x.getDate() + n); return fmtISO(x); }
    return [
      // 已过期
      { id: uid(), name: 'OpenAI API Token',   category: 'cloud',   baseDate: d(-6),  cycle: 'once',    remindDays: 14, amount: 100,  note: '预充值额度，过期不退钱', demo: true },
      { id: uid(), name: '超级猩猩 10 次卡',    category: 'fitness', baseDate: d(-2),  cycle: 'once',    remindDays: 10, amount: 1200, note: '还剩 4 次没上完', demo: true },
      { id: uid(), name: 'AWS 免费试用',        category: 'cloud',   baseDate: d(-9),  cycle: 'once',    remindDays: 7,  amount: null, note: '到期会自动转成按量计费', demo: true },
      // 3 天内
      { id: uid(), name: 'Qoder Pro',          category: 'ai',      baseDate: d(0),   cycle: 'monthly', remindDays: 7,  amount: 20,   note: '今天自动续费，记得看账单', demo: true },
      { id: uid(), name: 'ChatGPT Plus',       category: 'ai',      baseDate: d(2),   cycle: 'monthly', remindDays: 3,  amount: 140,  note: '和同事拼的车位', demo: true },
      { id: uid(), name: '阿里云 OSS 存储',     category: 'cloud',   baseDate: d(3),   cycle: 'monthly', remindDays: 7,  amount: 9,    note: '', demo: true },
      // 本周内
      { id: uid(), name: '1Password 家庭版',    category: 'member',  baseDate: d(5),   cycle: 'yearly',  remindDays: 7,  amount: 268,  note: '5 个人分摊', demo: true },
      { id: uid(), name: 'B 站大会员',          category: 'member',  baseDate: d(6),   cycle: 'monthly', remindDays: 7,  amount: 15,   note: '', demo: true },
      { id: uid(), name: '腾讯视频 VIP',        category: 'member',  baseDate: d(7),   cycle: 'yearly',  remindDays: 7,  amount: 258,  note: '', demo: true },
      // 更晚
      { id: uid(), name: 'Notion Plus',        category: 'member',  baseDate: d(-12), cycle: 'monthly', remindDays: 7,  amount: 60,   note: '', demo: true },
      { id: uid(), name: 'GitHub Copilot',     category: 'ai',      baseDate: d(28),  cycle: 'yearly',  remindDays: 14, amount: 690,  note: '', demo: true },
      { id: uid(), name: 'iCloud+ 200G',       category: 'cloud',   baseDate: d(45),  cycle: 'monthly', remindDays: 7,  amount: 21,   note: '照片备份，别断', demo: true }
    ];
  }

  /* ---------------- 计算 ---------------- */

  function computeRows() {
    var t = today0();
    return state.items.map(function (it) {
      var info = dueInfo(it, t);
      var days = Math.round((info.due - t) / DAY);
      return {
        it: it,
        due: info.due,
        prev: info.prev,
        days: days,
        bucket: bucketOf(it, days)
      };
    });
  }

  function visibleRows(all) {
    var q = state.query.trim().toLowerCase();
    return all.filter(function (r) {
      if (!q) return true;
      var it = r.it;
      var hay = (it.name + ' ' + (it.note || '') + ' ' + catOf(it.category).name + ' ' + CYCLE_NAME[it.cycle]).toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }

  function sortRows(rows) {
    var s = state.sort;
    rows.sort(function (a, b) {
      if (s === 'name') return String(a.it.name).localeCompare(String(b.it.name), 'zh-Hans-CN');
      if (s === 'amount') return yearlyCost(b.it) - yearlyCost(a.it);
      if (a.days !== b.days) return a.days - b.days;
      return String(a.it.name).localeCompare(String(b.it.name), 'zh-Hans-CN');
    });
    return rows;
  }

  /* ---------------- 渲染：概览 ---------------- */

  function renderOverview(rows) {
    var box = $('#overview');
    var groups = groupBy(rows);
    var html = '';

    BUCKETS.forEach(function (bk) {
      var list = sortRows(groups[bk.id] || []);
      var desc;
      if (!list.length) {
        desc = bk.id === 'expired' ? '没有失效的东西' : '这里空着';
      } else {
        var head = list[0];
        var who = esc(head.it.name);
        desc = who + (head.days === 0 ? ' 今天到期' : head.days > 0 ? ' 还有 ' + head.days + ' 天' : ' 已过期 ' + (-head.days) + ' 天');
        if (list.length > 1) desc += ' 等 ' + list.length + ' 项';
      }
      html += '<button type="button" class="ov' + (list.length ? '' : ' is-zero') +
        (state.filter === bk.id ? ' is-active' : '') +
        '" data-bucket="' + bk.id + '" style="--tone:' + bk.tone + '">' +
        '<span class="ov-top"><span class="ov-name">' + bk.name + '</span><span class="ov-num">' + list.length + '</span></span>' +
        '<span class="ov-desc">' + desc + '</span>' +
        '</button>';
    });

    box.innerHTML = html;
  }

  function groupBy(rows) {
    var g = { expired: [], d3: [], week: [], later: [] };
    rows.forEach(function (r) { (g[r.bucket] || g.later).push(r); });
    return g;
  }

  /* ---------------- 渲染：主体 ---------------- */

  function countdownHTML(r) {
    var tone = '';
    BUCKETS.forEach(function (b) { if (b.id === r.bucket) tone = b.tone; });
    if (r.days < 0) {
      return '<div class="countdown" style="--tone:' + tone + '"><b>' + (-r.days) + '</b><span>天前过期</span></div>';
    }
    if (r.days === 0) {
      return '<div class="countdown is-text" style="--tone:' + tone + '"><b>今天</b><span>到期</span></div>';
    }
    if (r.days === 1) {
      return '<div class="countdown is-text" style="--tone:' + tone + '"><b>明天</b><span>到期</span></div>';
    }
    return '<div class="countdown" style="--tone:' + tone + '"><b>' + r.days + '</b><span>天后到期</span></div>';
  }

  function cardHTML(r) {
    var it = r.it;
    var cat = catOf(it.category);
    var tone = 'var(--calm)';
    BUCKETS.forEach(function (b) { if (b.id === r.bucket) tone = b.tone; });

    var meta = [];
    meta.push('<span class="cat-dot" style="background:' + cat.color + '"></span>' + cat.name);
    if (CYCLE_NAME[it.cycle]) meta.push(CYCLE_NAME[it.cycle]);
    if (Number(it.amount) > 0) meta.push('¥' + Number(it.amount));

    var noteBits = [];
    var inWindow = r.days >= 0 && Number(it.remindDays) > 0 && r.days <= Number(it.remindDays);
    if (it.note) noteBits.push('<span>' + esc(it.note) + '</span>');
    if (r.prev) {
      noteBits.push('<span class="renew">上次 ' + fmtMD(r.prev) + ' 已续费 · 下次 ' + fmtShort(r.due) + '</span>');
    } else if (inWindow) {
      noteBits.push('<span class="bell">' +
        '<svg viewBox="0 0 16 16"><path d="M8 2.3a3.3 3.3 0 0 0-3.3 3.3c0 3-1.2 3.9-1.2 3.9h9s-1.2-.9-1.2-3.9A3.3 3.3 0 0 0 8 2.3z"/><path d="M6.7 11.8a1.5 1.5 0 0 0 2.6 0"/></svg>' +
        '提前 ' + Number(it.remindDays) + ' 天提醒</span>');
    } else if (it.cycle !== 'once') {
      noteBits.push('<span>' + fmtShort(r.due) + ' 到期</span>');
    }

    return '<article class="card' + (r.bucket === 'expired' ? ' is-expired' : '') + '" data-id="' + it.id + '" style="--tone:' + tone + '" role="button" tabindex="0" aria-label="编辑 ' + esc(it.name) + '">' +
      '<div class="card-main">' +
        '<div class="card-name">' + esc(it.name) + '</div>' +
        '<div class="card-meta">' + meta.join('<i class="sep"></i>') + '</div>' +
        (noteBits.length ? '<div class="card-note">' + noteBits.join('<i class="sep"></i>') + '</div>' : '') +
      '</div>' +
      countdownHTML(r) +
      '<button type="button" class="card-del" data-del="' + it.id + '" aria-label="删除 ' + esc(it.name) + '">' +
        '<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>' +
      '</button>' +
      '</article>';
  }

  function renderBoard(rows) {
    var board = $('#board');
    var groups = groupBy(rows);
    var html = '';
    var shownAny = false;

    BUCKETS.forEach(function (bk) {
      if (state.filter !== 'all' && state.filter !== bk.id) return;
      var list = sortRows(groups[bk.id] || []);
      var empty = list.length === 0;
      if (!empty) shownAny = true;

      html += '<section class="group' + (empty ? ' is-empty' : '') + '" style="--tone:' + bk.tone + '">' +
        '<header class="group-head">' +
          '<span class="gdot"></span>' +
          '<h2>' + bk.name + '</h2>' +
          '<span class="gcount">' + list.length + '</span>' +
          '<span class="ghint">' + bk.hint + '</span>' +
        '</header>';

      if (empty) {
        html += '<div class="mini-empty">' +
          (bk.id === 'expired' ? '没有已过期的项目。' :
           bk.id === 'd3' ? '未来 3 天没有要处理的，安心。' :
           bk.id === 'week' ? '本周内没有到期项目。' : '暂时没有更远的项目。') +
          '</div>';
      } else {
        html += '<div class="cards">' + list.map(cardHTML).join('') + '</div>';
      }
      html += '</section>';
    });

    if (!shownAny && state.items.length > 0) {
      html = '<div class="empty-state"><h3>没有匹配的项目</h3>' +
        '<p>换个关键词试试，或者清空搜索框。</p>' +
        '<div class="empty-actions"><button class="btn btn-ghost" id="btnResetFilter" type="button">清空筛选</button></div></div>';
    }

    board.innerHTML = html;
    var reset = $('#btnResetFilter');
    if (reset) reset.addEventListener('click', function () {
      state.query = ''; state.filter = 'all'; $('#search').value = ''; render();
    });
  }

  function renderEmptyApp() {
    $('#board').innerHTML =
      '<div class="empty-state">' +
        '<h3>雷达上还什么都没有</h3>' +
        '<p>把 Qoder、API Token、对象存储、健身课包… 的到期日登记进来。30 秒一条，之后就知道什么时候该续、什么时候该砍。</p>' +
        '<div class="empty-actions">' +
          '<button class="btn btn-primary" id="btnEmptyAdd" type="button">登记第一项</button>' +
          '<button class="btn btn-ghost" id="btnEmptyDemo" type="button">先看看示例</button>' +
        '</div>' +
      '</div>';
    $('#btnEmptyAdd').addEventListener('click', function () { openDrawer(null); });
    $('#btnEmptyDemo').addEventListener('click', function () {
      state.items = demoItems(); save(); render();
    });
  }

  function renderTop(allRows) {
    var t = today0();
    $('#todayLabel').textContent = fmtCN(t);

    var total = state.items.length;
    var monthly = 0;
    state.items.forEach(function (it) { monthly += yearlyCost(it) / 12; });

    var sub = '在盯着 ' + total + ' 个服务';
    if (monthly > 0) sub += ' · 每月约 ¥' + Math.round(monthly).toLocaleString('zh-CN');
    $('#brandSub').textContent = sub;

    var need = 0;
    allRows.forEach(function (r) { if (r.bucket !== 'later') need++; });
    $('#footStat').textContent = total
      ? '共 ' + total + ' 项 · 本周需处理 ' + need + ' 项'
      : '还没有数据';

    var hasDemo = state.items.some(function (x) { return x.demo; });
    $('#demoBanner').hidden = !hasDemo;
  }

  /* ---------------- 主渲染 ---------------- */

  function render() {
    var all = computeRows();
    var rows = visibleRows(all);
    renderTop(all);

    if (!state.items.length) {
      $('#overview').innerHTML = '';
      $('.toolbar').hidden = true;
      renderEmptyApp();
      return;
    }
    $('.toolbar').hidden = false;
    renderOverview(rows);
    renderBoard(rows);
  }

  /* ---------------- 抽屉表单 ---------------- */

  var drawer = $('#drawer');
  var scrim = $('#scrim');

  function openDrawer(item) {
    state.editingId = item ? item.id : null;
    $('#drawerTitle').textContent = item ? '编辑条目' : '登记一项到期';
    $('#btnDelete').hidden = !item;

    $('#fName').value = item ? item.name : '';
    $('#fDate').value = item ? item.baseDate : fmtISO(addDays(today0(), 30));
    $('#fCycle').value = item ? item.cycle : 'once';
    $('#fCat').value = item ? item.category : 'ai';
    $('#fAmount').value = item && item.amount != null ? item.amount : '';
    $('#fNote').value = item ? (item.note || '') : '';
    setRemind(item ? item.remindDays : 7);
    updateCycleHint();
    updatePreview();

    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    scrim.hidden = false;
    document.body.classList.add('no-scroll');
    setTimeout(function () { $('#fName').focus(); }, 240);
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    scrim.hidden = true;
    document.body.classList.remove('no-scroll');
    state.editingId = null;
  }

  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }

  function setRemind(v) {
    state.remindValue = Number(v) || 0;
    $('#fRemindNum').value = state.remindValue;
    var chips = $('#fRemind').querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('on', Number(chips[i].dataset.v) === state.remindValue);
    }
  }

  function updateCycleHint() {
    var c = $('#fCycle').value;
    var hint = $('#cycleHint');
    if (c === 'once') {
      hint.textContent = '一次性：到期日就是最后期限，过了会进「已过期」。适合 Token 额度、课包、体验卡。';
    } else {
      var stepTxt = c === 'monthly' ? '1 个月' : c === 'quarterly' ? '3 个月' : '1 年';
      hint.textContent = '周期类：到期后自动往后推 ' + stepTxt + '，日期锚点保持不变（比如每月 15 日就一直算 15 日），所以永远不会因为忘记录入而漏掉下一期。';
    }
  }

  var BUCKET_TONE = { expired: 'var(--danger)', d3: 'var(--hot)', week: 'var(--warn)', later: 'var(--calm)' };
  var BUCKET_NAME = { expired: '已过期', d3: '3 天内', week: '本周内', later: '更晚' };

  function updatePreview() {
    var el = $('#preview');
    var dateStr = $('#fDate').value;
    if (!dateStr) { el.innerHTML = ''; return; }

    var cycle = $('#fCycle').value;
    var t = today0();
    var info = dueInfo({ baseDate: dateStr, cycle: cycle }, t);
    var days = Math.round((info.due - t) / DAY);
    var bucket = bucketOf({}, days);

    el.style.setProperty('--tone', BUCKET_TONE[bucket]);

    var main, sub;
    if (days < 0) {
      main = '<b>' + (-days) + '</b>天前就过期了';
    } else if (days === 0) {
      main = '<b>今天</b>到期';
    } else {
      main = '<b>' + days + '</b>天后到期';
    }

    if (cycle === 'once') {
      sub = '一次性 · 到期日 ' + fmtISO(info.due);
    } else {
      var unit = cycle === 'monthly' ? '每月' : cycle === 'quarterly' ? '每季' : '每年';
      var dayN = parseD(dateStr).getDate();
      sub = CYCLE_NAME[cycle] + ' · ' + unit + ' ' + dayN + ' 日续费 · 下次 ' + fmtISO(info.due);
      if (info.prev) sub += '（上次 ' + fmtMD(info.prev) + ' 已扣费）';
      if (info.rollovers > 0) sub += '，已自动跳过 ' + info.rollovers + ' 期';
    }

    el.innerHTML = '<div class="pv-label">保存后会这样显示</div>' +
      '<div class="pv-main">' + main + '<span class="pv-tag">' + BUCKET_NAME[bucket] + '</span></div>' +
      '<div class="pv-sub">' + sub + '</div>';
  }

  /* ---------------- 保存 / 删除 ---------------- */

  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#fName').value.trim();
    var date = $('#fDate').value;
    if (!name) { toast('先给它起个名字'); $('#fName').focus(); return; }
    if (!date) { toast('选一个到期日'); $('#fDate').focus(); return; }

    var amountRaw = $('#fAmount').value;
    var payload = {
      name: name,
      baseDate: date,
      cycle: $('#fCycle').value,
      category: $('#fCat').value,
      amount: amountRaw === '' ? null : Math.max(0, Number(amountRaw)),
      remindDays: Number($('#fRemindNum').value) || 0,
      note: $('#fNote').value.trim()
    };

    if (state.editingId) {
      for (var i = 0; i < state.items.length; i++) {
        if (state.items[i].id === state.editingId) {
          var old = state.items[i];
          state.items[i] = Object.assign({}, old, payload);
          if (old.demo) delete state.items[i].demo;
          break;
        }
      }
      toast('已更新「' + name + '」');
    } else {
      payload.id = uid();
      payload.createdAt = Date.now();
      state.items.push(payload);
      toast('已登记「' + name + '」');
    }

    save(); closeDrawer(); render();
  });

  function removeItem(id) {
    var it = state.items.filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    if (!window.confirm('删除「' + it.name + '」？删掉之后就盯不到了。')) return;
    state.items = state.items.filter(function (x) { return x.id !== id; });
    save(); closeDrawer(); render();
    toast('已删除「' + it.name + '」');
  }

  $('#btnDelete').addEventListener('click', function () {
    if (state.editingId) removeItem(state.editingId);
  });

  /* ---------------- 清单 / 导出 ---------------- */

  function buildChecklist() {
    var all = computeRows();
    var rows = all.filter(function (r) { return r.bucket !== 'later'; });
    rows = sortRows(rows);

    var t = today0();
    var counts = { expired: 0, d3: 0, week: 0 };
    rows.forEach(function (r) { counts[r.bucket]++; });

    if (!rows.length) return null;

    var lines = [];
    lines.push('到期雷达 · 本周待处理清单（' + fmtCN(t) + '）');
    lines.push('共 ' + rows.length + ' 项：已过期 ' + counts.expired + ' · 3 天内 ' + counts.d3 + ' · 本周内 ' + counts.week);
    lines.push('');

    var order = ['expired', 'd3', 'week'];
    order.forEach(function (bid) {
      var list = rows.filter(function (r) { return r.bucket === bid; });
      if (!list.length) return;
      var bk = BUCKETS.filter(function (b) { return b.id === bid; })[0];
      lines.push('【' + bk.name + '】');
      list.forEach(function (r) {
        var it = r.it;
        var when;
        if (r.days < 0) when = '已过期 ' + (-r.days) + ' 天';
        else if (r.days === 0) when = '今天到期';
        else if (r.days === 1) when = '明天到期';
        else when = r.days + ' 天后到期';

        var bits = [when];
        if (it.cycle !== 'once') bits.push(CYCLE_NAME[it.cycle]);
        if (Number(it.amount) > 0) bits.push('¥' + Number(it.amount));
        lines.push('· ' + it.name + ' — ' + bits.join(' · ') + (it.note ? '（' + it.note + '）' : ''));
      });
      lines.push('');
    });

    lines.push('— 由「到期雷达」生成');
    return lines.join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  $('#btnCopy').addEventListener('click', function () {
    var text = buildChecklist();
    if (!text) {
      toast('本周没有要处理的事，安心');
      return;
    }
    var n = text.split('\n').filter(function (l) { return l.indexOf('· ') === 0; }).length;
    copyText(text).then(function (ok) {
      toast(ok ? '已复制本周待处理清单（' + n + ' 项）' : '复制失败，请手动选择文本');
    });
  });

  function exportCSV() {
    if (!state.items.length) { toast('还没有可以导出的数据'); return; }
    var t = today0();
    var head = ['名称', '分类', '计费周期', '到期日', '下次到期', '剩余天数', '状态', '金额(元)', '提醒(天)', '备注'];
    var lines = [head.join(',')];

    computeRows().forEach(function (r) {
      var it = r.it;
      var status = r.days < 0 ? '已过期' : r.days === 0 ? '今天到期' : r.days <= 3 ? '3 天内' : r.days <= 7 ? '本周内' : '更晚';
      var cells = [
        it.name, catOf(it.category).name, CYCLE_NAME[it.cycle] || '',
        it.baseDate, fmtISO(r.due), String(r.days), status,
        it.amount == null ? '' : String(it.amount),
        String(it.remindDays == null ? '' : it.remindDays),
        it.note || ''
      ];
      lines.push(cells.map(function (c) {
        var s = String(c);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(','));
    });

    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '到期雷达-' + fmtISO(t) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
    toast('已导出 ' + state.items.length + ' 条到 CSV');
  }

  /* ---------------- toast ---------------- */

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ---------------- 主题 ---------------- */

  var THEME_KEY = 'expired-radar.theme';

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F4F6F8' : '#07090D');
    var btn = $('#btnTheme');
    if (btn) {
      btn.title = theme === 'light' ? '切换到夜间主题' : '切换到白天主题';
      btn.setAttribute('aria-label', btn.title);
    }
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    }
  }

  $('#btnTheme').addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next, true);
  });

  // 没有手动选过主题时，跟随系统设置变化
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var onSchemeChange = function (e) {
      var saved = null;
      try { saved = localStorage.getItem(THEME_KEY); } catch (err) {}
      if (!saved) applyTheme(e.matches ? 'light' : 'dark', false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);
  }

  /* ---------------- 事件绑定 ---------------- */

  // 分类下拉
  $('#fCat').innerHTML = CATS.map(function (c) {
    return '<option value="' + c.id + '">' + c.name + '</option>';
  }).join('');

  $('#btnAdd').addEventListener('click', function () { openDrawer(null); });
  $('#btnClose').addEventListener('click', closeDrawer);
  $('#btnCancel').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    if ((e.key === 'n' || e.key === 'N') && !drawer.classList.contains('open')) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      openDrawer(null);
    }
  });

  $('#overview').addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.ov') : null;
    if (!btn) return;
    var b = btn.dataset.bucket;
    state.filter = (state.filter === b) ? 'all' : b;
    render();
    if (state.filter !== 'all') {
      var first = $('.group');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  $('#board').addEventListener('click', function (e) {
    var del = e.target.closest ? e.target.closest('[data-del]') : null;
    if (del) {
      e.stopPropagation();
      removeItem(del.dataset.del);
      return;
    }
    var card = e.target.closest ? e.target.closest('.card') : null;
    if (!card) return;
    var it = state.items.filter(function (x) { return x.id === card.dataset.id; })[0];
    if (it) openDrawer(it);
  });

  $('#board').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest ? e.target.closest('.card') : null;
    if (!card) return;
    e.preventDefault();
    var it = state.items.filter(function (x) { return x.id === card.dataset.id; })[0];
    if (it) openDrawer(it);
  });

  $('#search').addEventListener('input', function (e) {
    state.query = e.target.value;
    render();
  });

  $('#sort').addEventListener('change', function (e) {
    state.sort = e.target.value;
    render();
  });

  $('#btnExport').addEventListener('click', exportCSV);

  $('#btnWipe').addEventListener('click', function () {
    if (!state.items.length) { toast('本来就是空的'); return; }
    if (!window.confirm('清空全部 ' + state.items.length + ' 条记录？这个操作不能撤销。')) return;
    state.items = [];
    save();
    render();
    toast('已清空');
  });

  $('#btnClearDemo').addEventListener('click', function () {
    var n = state.items.filter(function (x) { return x.demo; }).length;
    state.items = state.items.filter(function (x) { return !x.demo; });
    save(); render();
    toast('已清掉 ' + n + ' 条示例');
  });

  $('#fRemind').addEventListener('click', function (e) {
    var chip = e.target.closest ? e.target.closest('.chip') : null;
    if (!chip) return;
    setRemind(chip.dataset.v);
  });

  $('#fRemindNum').addEventListener('input', function (e) {
    state.remindValue = Number(e.target.value) || 0;
    var chips = $('#fRemind').querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('on', Number(chips[i].dataset.v) === state.remindValue);
    }
  });

  $('#fCycle').addEventListener('change', function () {
    updateCycleHint();
    updatePreview();
  });
  $('#fDate').addEventListener('input', updatePreview);
  $('#fDate').addEventListener('change', updatePreview);

  /* ---------------- 启动 ---------------- */

  (function init() {
    applyTheme(document.documentElement.getAttribute('data-theme') || 'dark', false);
    var had = load();
    if (!had) {
      state.items = demoItems();
      save();
    }
    render();
  })();

})();
