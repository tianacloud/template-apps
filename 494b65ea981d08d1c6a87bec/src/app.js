/**
 * 被动收入小账本 · 应用层
 * 负责：状态、路由（hash）、事件委托、增删改查动作、弹层、通知
 */
(function (global) {
  'use strict';

  var calc = global.PILCalc;
  var Model = global.PILModel;
  var V = global.PILViews;

  var KEY_THEME = 'pil_theme_v1';
  var KEY_NOTICE = 'pil_last_notice_v1';

  /* ---------------- 存储适配 ---------------- */

  var storageBroken = false;

  var storage = global.PILStorage;
  var store = global.PILStore.createStore(storage);

  /* ---------------- 状态 ---------------- */

  var state = {
    route: 'home',
    params: {},
    kw: '',
    histDays: 30,
    mode: 'new',
    form: null,
    errors: {},
    editingId: '',
    theme: 'auto',
    browserNotify: false
  };

  var viewEl = document.getElementById('view');
  var topEl = document.getElementById('topbar');
  var tabEl = document.getElementById('tabbar');
  var modalRoot = document.getElementById('modal-root');
  var toastRoot = document.getElementById('toast-root');

  /* ---------------- 主题 ---------------- */

  var mq = global.matchMedia ? global.matchMedia('(prefers-color-scheme: dark)') : null;

  function loadTheme() {
    try {
      var t = storage.get(KEY_THEME);
      if (t === 'light' || t === 'dark' || t === 'auto') state.theme = t;
    } catch (e) { /* ignore */ }
    try {
      state.browserNotify = storage.get('pil_bn_v1') === '1';
    } catch (e) { /* ignore */ }
  }

  function applyTheme() {
    var t = state.theme;
    if (t === 'auto') t = (mq && mq.matches) ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0d1418' : '#0f766e');
  }

  function setTheme(t) {
    state.theme = t;
    try { storage.set(KEY_THEME, t); } catch (e) { /* ignore */ }
    applyTheme();
    render();
  }

  /* ---------------- 路由 ---------------- */

  var TITLES = {
    home: '被动收入小账本',
    assets: '资产台账',
    history: '收益记录',
    reminders: '到期提醒',
    settings: '设置'
  };

  function parseHash() {
    var raw = String(global.location.hash || '').replace(/^#\/?/, '');
    if (!raw) return { path: 'home', q: {} };
    var qi = raw.indexOf('?');
    var path = qi >= 0 ? raw.slice(0, qi) : raw;
    var q = {};
    if (qi >= 0) {
      var parts = raw.slice(qi + 1).split('&');
      for (var i = 0; i < parts.length; i++) {
        if (!parts[i]) continue;
        var kv = parts[i].split('=');
        q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      }
    }
    return { path: path || 'home', q: q };
  }

  function go(hash, replace) {
    var target = '#/' + hash;
    if (global.location.hash === target) { render(); return; }
    if (replace) {
      // 用 replaceState 替换历史记录，不触发页面跳转
      try {
        global.history.replaceState(null, '', target);
        onRoute();
        return;
      } catch (e) { /* 降级为普通赋值 */ }
    }
    global.location.hash = target;
  }

  function onRoute() {
    var r = parseHash();
    var known = ['home', 'assets', 'history', 'reminders', 'settings', 'new', 'edit'];
    if (known.indexOf(r.path) < 0) r.path = 'home';
    state.route = r.path;
    state.params = r.q;

    if (r.path === 'new') {
      state.mode = 'new';
      state.editingId = '';
      state.errors = {};
      state.form = {
        id: '',
        type: r.q.type && Model.typeOf(r.q.type) ? r.q.type : 'fixed',
        name: '',
        principal: '',
        rate: '',
        startDate: calc.todayKey(),
        endDate: '',
        note: '',
        remind: true,
        hasEndDate: true
      };
      if (state.form.type === 'current' || state.form.type === 'fund') {
        state.form.remind = false;
      }
    } else if (r.path === 'edit') {
      var a = store.getAsset(r.q.id);
      if (!a) {
        toast('这笔资产已经不存在了');
        go('assets', true);
        return;
      }
      state.mode = 'edit';
      state.editingId = a.id;
      state.errors = {};
      state.form = {
        id: a.id,
        type: a.type || 'custom',
        name: a.name || '',
        principal: String(calc.currentPrincipal(a)),
        rate: String(calc.effective(a).rate),
        startDate: String(a.startDate).slice(0, 10),
        endDate: a.endDate ? String(a.endDate).slice(0, 10) : '',
        note: a.note || '',
        remind: a.remind !== false,
        hasEndDate: !!a.endDate
      };
    }
    render();
    if (r.path === 'home' || r.path === 'assets') global.scrollTo(0, 0);
    else global.scrollTo(0, 0);
  }

  /* ---------------- 渲染 ---------------- */

  function needEnd(f) {
    return f.type === 'fixed' || (f.type === 'custom' && f.hasEndDate !== false);
  }

  function renderTopbar() {
    var r = state.route;
    var left = '';
    var title = '';
    var sub = '';
    var right = '';

    if (r === 'new') {
      left = '<button class="icon-btn" data-action="back" aria-label="返回">' + V.icon('back', 19) + '</button>';
      title = '新增资产';
      sub = '按单利自动计算每日收益';
    } else if (r === 'edit') {
      left = '<button class="icon-btn" data-action="back" aria-label="返回">' + V.icon('back', 19) + '</button>';
      title = '编辑资产';
      sub = '改本金或利率从明天起生效';
    } else {
      title = TITLES[r] || '被动收入小账本';
      sub = r === 'home' ? calc.fmtDateCN(calc.todayKey()) + ' ' + Model.weekOf(calc.todayKey()) : '';
      if (r === 'assets') {
        right = '<button class="icon-btn" data-action="go" data-page="new" aria-label="新增资产">' + V.icon('plus', 20) + '</button>';
      }
      if (r === 'home' && store.listAssets().length) {
        right = '<button class="icon-btn" data-action="go" data-page="new" aria-label="新增资产">' + V.icon('plus', 20) + '</button>';
      }
    }

    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var themeBtn = (r === 'settings' || r === 'new' || r === 'edit') ? ''
      : '<button class="icon-btn" data-action="quick-theme" aria-label="切换主题">'
      + V.icon(isDark ? 'sun' : 'moon', 18) + '</button>';

    topEl.innerHTML = left + '<h1>' + V.esc(title)
      + (sub ? '<span class="sub">' + V.esc(sub) + '</span>' : '') + '</h1>'
      + (right || '') + themeBtn;
  }

  function renderTabs() {
    var r = state.route;
    var active = (r === 'new' || r === 'edit') ? 'assets' : r;
    var btns = tabEl.querySelectorAll('button[data-page]');
    var soon = 0;
    if (store.getSettings().notify !== false) {
      var g = calc.reminderGroups(store.listAssets(), calc.todayKey(), { remindOnly: true });
      soon = g.soon.length;
    }
    for (var i = 0; i < btns.length; i++) {
      var page = btns[i].getAttribute('data-page');
      btns[i].className = page === active ? 'on' : '';
      var dot = btns[i].querySelector('.dot');
      if (dot) dot.style.display = (page === 'reminders' && soon > 0) ? 'block' : 'none';
    }
  }

  function render() {
    renderTopbar();
    renderTabs();

    var settings = store.getSettings();
    var assets = store.listAssets();
    var today = calc.todayKey();
    var html = '';

    if (state.route === 'home') {
      html = V.home({
        dash: Model.dashboard(assets, settings, today),
        storageError: storageBroken
      });
    } else if (state.route === 'assets') {
      html = V.assets(zoneModel());
    } else if (state.route === 'history') {
      var pts = Model.series(assets, today, state.histDays);
      var total = 0;
      var max = 0;
      for (var j = 0; j < pts.length; j++) {
        total += pts[j].total;
        if (pts[j].total > max) max = pts[j].total;
      }
      html = V.history({
        days: state.histDays,
        points: pts,
        settings: settings,
        rangeText: '近 ' + state.histDays + ' 天',
        money: function (n) { return Model.money(n, settings); },
        sumText: Model.money(total, settings),
        avgText: Model.money(pts.length ? total / pts.length : 0, settings),
        maxText: Model.money(max, settings)
      });
    } else if (state.route === 'reminders') {
      html = V.reminders({ rem: Model.reminders(assets, settings, today) });
    } else if (state.route === 'settings') {
      html = V.settings({
        settings: settings,
        decimals: Model.dec(settings),
        theme: state.theme,
        browserNotify: state.browserNotify,
        notifyHint: browserNotifyHint(),
        count: assets.length
      });
    } else if (state.route === 'new' || state.route === 'edit') {
      html = V.edit({
        mode: state.mode,
        types: Model.TYPES,
        form: state.form,
        errors: state.errors,
        needEnd: needEnd(state.form),
        pv: Model.preview(state.form, settings, today)
      });
    }

    viewEl.innerHTML = html;
    viewEl.style.animation = 'none';
    void viewEl.offsetWidth;
    viewEl.style.animation = '';
  }

  /** 资产列表区的数据模型（搜索时局部刷新也用这一份） */
  function zoneModel() {
    var settings = store.getSettings();
    var today = calc.todayKey();
    var list = state.kw ? store.searchAssets(state.kw) : store.listAssets();
    var sum = 0;
    for (var i = 0; i < list.length; i++) sum += calc.dailyIncome(list[i], today);
    return {
      kw: state.kw,
      rows: Model.dashboard(list, settings, today).rows,
      todaySumText: Model.money(sum, settings)
    };
  }

  /** 只重绘列表区，保持搜索框焦点与光标位置 */
  function renderListZone() {
    var zone = document.getElementById('list-zone');
    if (!zone) { render(); return; }
    zone.innerHTML = V.zone(zoneModel());
    var clr = document.querySelector('#search-box .clr');
    if (clr) clr.style.display = state.kw ? '' : 'none';
  }

  function browserNotifyHint() {
    if (!global.Notification) return '当前浏览器不支持通知';
    if (global.Notification.permission === 'granted') return '到期时推送系统通知（每天最多一次）';
    if (global.Notification.permission === 'denied') return '已被浏览器禁止，请在地址栏站点设置中允许';
    return '点击开关时浏览器会请求通知权限';
  }

  /* ---------------- 弹层 / 提示 ---------------- */

  function toast(msg) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastRoot.appendChild(el);
    global.setTimeout(function () {
      el.className = 'toast out';
      global.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 220);
    }, 1900);
  }

  var sheetCloser = null;

  function openSheet(html, onMount) {
    closeSheet();
    var mask = document.createElement('div');
    mask.className = 'mask';
    mask.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">'
      + '<div class="sheet-bar"></div>' + html + '</div>';
    modalRoot.appendChild(mask);
    document.body.classList.add('modal-open');

    mask.addEventListener('click', function (e) {
      if (e.target === mask) closeSheet();
    });
    sheetCloser = function () {
      if (mask.parentNode) mask.parentNode.removeChild(mask);
      document.body.classList.remove('modal-open');
      sheetCloser = null;
    };
    if (onMount) onMount(mask);
    var btn = mask.querySelector('[data-role="ok"]');
    if (btn) btn.focus();
    return mask;
  }

  function closeSheet() {
    if (sheetCloser) sheetCloser();
  }

  function confirmSheet(opts) {
    return new Promise(function (resolve) {
      var h = '<h3>' + V.esc(opts.title) + '</h3>'
        + '<p class="desc">' + (opts.html ? opts.html : V.esc(opts.desc || '')) + '</p>'
        + '<div class="acts">'
        + '<button class="btn btn-ghost" data-role="cancel">取消</button>'
        + '<button class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" data-role="ok">'
        + V.esc(opts.okText || '确定') + '</button></div>';
      var mask = openSheet(h);
      mask.querySelector('[data-role="cancel"]').addEventListener('click', function () {
        closeSheet(); resolve(false);
      });
      mask.querySelector('[data-role="ok"]').addEventListener('click', function () {
        closeSheet(); resolve(true);
      });
    });
  }

  /* ---------------- 表单 ---------------- */

  function readForm() {
    var f = state.form;
    if (!f) return f;
    var names = ['name', 'principal', 'rate', 'startDate', 'endDate', 'note'];
    for (var i = 0; i < names.length; i++) {
      var el = document.getElementById('f-' + names[i]);
      if (el) f[names[i]] = el.value;
    }
    return f;
  }

  function updatePreview() {
    var box = document.getElementById('pv');
    if (!box) return;
    var settings = store.getSettings();
    box.innerHTML = V.previewBlock({
      pv: Model.preview(state.form, settings, calc.todayKey())
    });
  }

  function draftOf(f) {
    return {
      type: f.type,
      name: String(f.name || '').trim(),
      principal: String(f.principal || '').replace(/[,\s¥]/g, ''),
      rate: String(f.rate || '').replace(/[%\s]/g, ''),
      startDate: f.startDate,
      endDate: needEnd(f) ? f.endDate : '',
      hasEndDate: f.hasEndDate !== false,
      note: f.note,
      remind: needEnd(f) ? f.remind !== false : false
    };
  }

  function doSave() {
    readForm();
    var f = state.form;
    var draft = draftOf(f);
    var v = calc.validateAsset(draft);
    if (!v.ok) {
      state.errors = v.errors;
      render();
      var first = Object.keys(v.errors)[0];
      var el = document.getElementById('f-' + first);
      if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      toast(v.errors[first]);
      return;
    }
    state.errors = {};

    if (state.mode === 'edit') {
      var updated = store.updateAsset(state.editingId, {
        type: draft.type,
        name: draft.name,
        note: draft.note,
        startDate: draft.startDate,
        endDate: draft.endDate,
        remind: draft.remind,
        principal: Number(draft.principal),
        rate: Number(draft.rate)
      });
      if (!updated) {
        toast('保存失败：这笔资产已不存在');
        go('assets', true);
        return;
      }
      toast('已保存');
      go('assets');
    } else {
      store.addAsset(draft);
      toast('已添加，今天就开始躺赚');
      go('home');
    }
  }

  function doDelete(id) {
    var a = store.getAsset(id);
    if (!a) { toast('这笔资产已经不存在了'); render(); return; }
    confirmSheet({
      title: '删除这笔资产？',
      html: '「' + V.esc(a.name) + '」删除后不可恢复，累计收益记录也会一并移除。',
      okText: '删除',
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      var done = store.removeAsset(id);
      if (!done) { toast('删除失败，请重试'); return; }
      toast('已删除');
      if (state.route === 'edit' && state.editingId === id) {
        state.editingId = '';
        state.form = null;
        go('assets', true);
      } else {
        render();
      }
    });
  }

  /* ---------------- 日期明细 ---------------- */

  function openDay(date) {
    var settings = store.getSettings();
    var assets = store.listAssets();
    var items = calc.breakdown(assets, date);
    var total = 0;
    for (var i = 0; i < items.length; i++) total += items[i].today;

    var h = '<h3>' + V.esc(calc.fmtDateCN(date)) + ' ' + V.esc(Model.weekOf(date)) + '</h3>'
      + '<p class="desc">当天总被动收入 <b style="color:var(--gain);font-size:17px">¥'
      + V.esc(Model.money(total, settings)) + '</b></p>';

    if (!items.length) {
      h += '<div style="padding:18px 0;text-align:center;color:var(--muted);font-size:13px">这一天没有任何资产产生收益</div>';
    } else {
      for (var j = 0; j < items.length; j++) {
        var it = items[j];
        h += '<div class="kv"><span class="k">' + V.esc(it.name)
          + ' <span style="color:var(--faint);font-size:11px">' + V.esc(Model.typeOf(it.asset.type).short) + '</span></span>'
          + '<span class="v gain">' + V.esc(Model.money(it.today, settings)) + '</span></div>';
      }
    }
    h += '<div class="acts"><button class="btn btn-ghost" data-role="close">关闭</button></div>';
    var mask = openSheet(h);
    mask.querySelector('[data-role="close"]').addEventListener('click', closeSheet);
  }

  /* ---------------- 备份 ---------------- */

  function todayStamp() {
    var d = new Date();
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  }

  function doExport() {
    var data = store.exportBackup();
    var text = JSON.stringify(data, null, 2);
    var blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    var name = '被动收入小账本-备份-' + todayStamp() + '.json';
    if (global.navigator && global.navigator.msSaveBlob) {
      global.navigator.msSaveBlob(blob, name);
      toast('已导出备份');
      return;
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    global.setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 400);
    toast('已导出 ' + store.listAssets().length + ' 笔资产');
  }

  function doImport() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json,.json';
    inp.style.display = 'none';
    document.body.appendChild(inp);
    inp.addEventListener('change', function () {
      var file = inp.files && inp.files[0];
      if (!file) { document.body.removeChild(inp); return; }
      var reader = new FileReader();
      reader.onload = function () {
        var text = String(reader.result || '');
        // 只解析不写入：导入前的校验绝不能改动现有数据
        var parsed = null;
        try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
        if (!parsed) { toast('文件不是合法的 JSON'); document.body.removeChild(inp); return; }
        var n = Array.isArray(parsed.assets) ? parsed.assets.length : (Array.isArray(parsed) ? parsed.length : 0);
        confirmSheet({
          title: '用备份覆盖当前数据？',
          html: '备份里有 <b>' + n + '</b> 笔资产，导入后当前数据（' + store.listAssets().length + ' 笔）将被替换。',
          okText: '覆盖导入'
        }).then(function (ok) {
          if (!ok) return;
          var out = store.importBackup(text, 'replace');
          if (!out.ok) { toast(out.error || '导入失败'); return; }
          toast('已恢复 ' + out.total + ' 笔资产');
          go('home', true);
        });
        document.body.removeChild(inp);
      };
      reader.readAsText(file);
    });
    inp.click();
  }

  /* ---------------- 示例数据 ---------------- */

  function addDemo() {
    var t = calc.todayKey();
    var samples = [
      {
        type: 'fixed', name: '工行 3 年期定期', principal: 300000, rate: 2.6,
        startDate: calc.addDays(t, -400), endDate: calc.addDays(t, 695),
        note: '朝阳支行', remind: true
      },
      { type: 'current', name: '余额宝', principal: 50000, rate: 1.62, startDate: calc.addDays(t, -180), note: '随时可取' },
      { type: 'fund', name: '住房公积金', principal: 86000, rate: 1.5, startDate: calc.addDays(t, -900), note: '账户余额' }
    ];
    for (var i = 0; i < samples.length; i++) store.addAsset(samples[i]);
    toast('已填入 3 笔示例资产');
    render();
  }

  /* ---------------- 通知 ---------------- */

  function checkNotify() {
    if (!state.browserNotify) return;
    if (!global.Notification || global.Notification.permission !== 'granted') return;
    var settings = store.getSettings();
    if (settings.notify === false) return;

    var today = calc.todayKey();
    var last = '';
    try { last = storage.get(KEY_NOTICE) || ''; } catch (e) { last = ''; }
    if (last === today) return;

    var g = calc.reminderGroups(store.listAssets(), today, { remindOnly: true });
    var due = g.soon.filter(function (x) { return x.remind; });
    if (!due.length) return;

    var body = due.slice(0, 3).map(function (x) {
      return x.name + (x.daysLeft === 0 ? ' 今天到期' : ' ' + x.daysLeft + ' 天后到期');
    }).join('；') + (due.length > 3 ? ' 等 ' + due.length + ' 笔' : '');
    try {
      new global.Notification('被动收入小账本 · 到期提醒', {
        body: body,
        tag: 'pil-due-' + today,
        icon: 'assets/icon-192.png'
      });
      storage.set(KEY_NOTICE, today);
    } catch (e) { /* 忽略 */ }
  }

  function toggleBrowserNotify() {
    if (!global.Notification) { toast('当前浏览器不支持通知'); return; }
    if (state.browserNotify) {
      state.browserNotify = false;
      try { storage.set('pil_bn_v1', '0'); } catch (e) { /* ignore */ }
      render();
      return;
    }
    if (global.Notification.permission === 'granted') {
      state.browserNotify = true;
      try { storage.set('pil_bn_v1', '1'); } catch (e) { /* ignore */ }
      toast('已开启到期通知');
      render();
      return;
    }
    if (global.Notification.permission === 'denied') {
      toast('浏览器已禁止通知，请在站点设置里允许');
      return;
    }
    global.Notification.requestPermission().then(function (p) {
      if (p === 'granted') {
        state.browserNotify = true;
        try { storage.set('pil_bn_v1', '1'); } catch (e) { /* ignore */ }
        toast('已开启到期通知');
      } else {
        toast('未获得通知权限');
      }
      render();
    });
  }

  /* ---------------- 动作分发 ---------------- */

  function handleAction(action, el, e) {
    var id = el.getAttribute('data-id') || '';
    switch (action) {
      case 'go':
        go(el.getAttribute('data-page'));
        break;

      case 'back':
        if (global.history.length > 1) global.history.back();
        else go('home', true);
        break;

      case 'edit':
        go('edit?id=' + encodeURIComponent(id));
        break;

      case 'del':
        doDelete(id);
        break;

      case 'demo':
        addDemo();
        break;

      case 'clear-kw': {
        state.kw = '';
        var kwEl = document.getElementById('kw');
        if (kwEl) kwEl.value = '';
        renderListZone();
        if (kwEl) kwEl.focus();
        break;
      }

      case 'pick-type':
        readForm();
        state.form.type = el.getAttribute('data-type');
        if (state.form.type === 'current' || state.form.type === 'fund') {
          state.form.endDate = '';
          state.form.remind = false;
        }
        if (state.form.type === 'fixed' && !state.form.endDate) {
          state.form.endDate = calc.addDays(state.form.startDate || calc.todayKey(), 365);
        }
        state.errors = {};
        render();
        break;

      case 'toggle-hasend':
        readForm();
        state.form.hasEndDate = state.form.hasEndDate === false;
        if (!state.form.hasEndDate) { state.form.endDate = ''; state.form.remind = false; }
        render();
        break;

      case 'toggle-remind':
        if (id) {
          var a = store.getAsset(id);
          if (!a) { toast('这笔资产已经不存在了'); render(); return; }
          store.toggleRemind(id, a.remind === false);
          render();
        } else {
          readForm();
          state.form.remind = state.form.remind === false;
          render();
        }
        break;

      case 'save':
        doSave();
        break;

      case 'range':
        state.histDays = Number(el.getAttribute('data-days')) || 30;
        render();
        break;

      case 'day':
        openDay(el.getAttribute('data-date'));
        break;

      case 'set-dec':
        store.saveSettings({ decimals: Number(el.getAttribute('data-v')) });
        render();
        break;

      case 'set-theme':
        setTheme(el.getAttribute('data-v'));
        break;

      case 'quick-theme':
        setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        break;

      case 'save-goal': {
        var gEl = document.getElementById('f-goal');
        var gv = gEl ? String(gEl.value).replace(/[,\s¥]/g, '') : '';
        var num = Number(gv);
        if (gv && (!isFinite(num) || num < 0)) { toast('请填写正确的目标金额'); return; }
        store.saveSettings({ goalDaily: gv ? num : 0 });
        toast(gv ? '目标已保存' : '已取消目标');
        render();
        break;
      }

      case 'toggle-notify':
        store.saveSettings({ notify: store.getSettings().notify === false });
        render();
        break;

      case 'toggle-browser-notify':
        toggleBrowserNotify();
        break;

      case 'export':
        doExport();
        break;

      case 'import':
        doImport();
        break;

      case 'clear-all':
        confirmSheet({
          title: '清空全部数据？',
          desc: '所有资产、累计收益与设置都会被删除，且无法恢复。建议先导出备份。',
          okText: '确认清空',
          danger: true
        }).then(function (ok) {
          if (!ok) return;
          store.removeAllAssets();
          store.saveSettings({ goalDaily: 0 });
          state.kw = '';
          toast('已清空');
          go('home', true);
        });
        break;

      default:
        break;
    }
  }

  /* ---------------- 事件绑定 ---------------- */

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
    if (!el) return;
    // 编辑页 / 资产列表里的空区域点击不要误触发
    if (el.getAttribute('data-action') === 'edit' && e.target.closest('button')) return;
    e.preventDefault();
    handleAction(el.getAttribute('data-action'), el, e);
  });

  // 表单实时预览
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.id) return;
    if (t.id === 'kw') {
      state.kw = t.value;
      renderListZone();
      return;
    }
    if (state.route === 'new' || state.route === 'edit') {
      if (t.name && state.form && Object.prototype.hasOwnProperty.call(state.form, t.name)) {
        state.form[t.name] = t.value;
        updatePreview();
      }
    }
  });

  // 键盘回车保存
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (state.route === 'new' || state.route === 'edit')) {
      var t = e.target;
      if (t && t.tagName === 'INPUT' && t.type !== 'date') {
        e.preventDefault();
        doSave();
      }
    }
    if (e.key === 'Escape') closeSheet();
  });

  global.addEventListener('hashchange', onRoute);

  if (mq) {
    var onChange = function () { if (state.theme === 'auto') applyTheme(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------------- 启动 ---------------- */

  loadTheme();
  applyTheme();
  onRoute();
  global.setTimeout(checkNotify, 900);

  global.PILApp = {
    store: store,
    state: state,
    render: render,
    go: go,
    toast: toast,
    checkNotify: checkNotify,
    addDemo: addDemo,
    setTheme: setTheme
  };
})(window);
