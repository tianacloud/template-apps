/* ==========================================================================
 * 资产管理系统 · 交互逻辑
 * 纯原生 JS，无构建、无外部依赖 —— 提供设备管理交互
 * 支持多类型数据表（设备资产 / 硬件更换 / 自定义）兼容展示
 * 数据通过 Store(API) 加载，用于页面渲染。
 * ========================================================================== */
(function () {
  'use strict';
  var Store = window.Store;
  var API = window.API;
  var S = Store.S;

  /* ------------------------------- 工具 ------------------------------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function clone(o) { var c = {}; for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) { c[k] = (o[k] && typeof o[k] === 'object' && o[k].slice) ? o[k].slice() : o[k]; } } return c; }
  function icon(name) {
    var P = {
      search: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>',
      plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
      upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
      download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
      setting: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
      refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
      trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
      edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
      eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
      eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>',
      copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
      folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
      file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
      layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
      box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/>',
      db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
      monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
      activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
      grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
      swap: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
      x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      arrowUp: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
      arrowDown: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
      empty: '<rect x="3" y="3" width="18" height="18" rx="2" fill="none"/><path d="M3 9h18M9 21V9"/>',
      filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'
    };
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (P[name] || '') + '</svg>';
  }
  function fmtSize(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; }
  function nowStr() { var d = new Date(), p = function (n) { return n < 10 ? '0' + n : '' + n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
  function copyText(t) { var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('已复制到剪贴板', 'success'); } catch (e) { toast('复制失败，请手动选择', 'error'); } document.body.removeChild(ta); }

  /* ------------------------------- Toast ------------------------------- */
  var toastBox = null;
  function toast(msg, type) {
    if (!toastBox) { toastBox = document.createElement('div'); toastBox.className = 'toast-box'; document.body.appendChild(toastBox); }
    var t = document.createElement('div'); t.className = 'toast ' + (type || '');
    t.innerHTML = '<span>' + (type === 'error' ? '⚠ ' : type === 'success' ? '✓ ' : '') + '</span><span>' + esc(msg) + '</span>';
    toastBox.appendChild(t);
    setTimeout(function () { t.style.transition = '.2s'; t.style.opacity = '0'; t.style.transform = 'translateX(16px)'; setTimeout(function () { t.parentNode && t.parentNode.removeChild(t); }, 220); }, 2400);
  }

  /* ------------------------------- 覆盖层（弹窗/抽屉） ------------------------------- */
  var overlays = [];
  function mount(node) { document.body.appendChild(node); overlays.push(node); return node; }
  function unmount(node) { var i = overlays.indexOf(node); if (i > -1) overlays.splice(i, 1); node.parentNode && node.parentNode.removeChild(node); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlays.length) overlays[overlays.length - 1]._close(); });

  function openModal(opt) {
    var mask = document.createElement('div'); mask.className = 'mask';
    mask.innerHTML = '<div class="modal ' + (opt.width || '') + '">' +
      '<div class="modal-head"><div class="mh-ico">' + icon(opt.icon || 'box') + '</div><div><h3>' + esc(opt.title) + '</h3>' +
      (opt.sub ? '<div class="sub">' + esc(opt.sub) + '</div>' : '') + '</div>' +
      '<button class="icon-btn x" data-close>' + icon('x') + '</button></div>' +
      '<div class="modal-body">' + (opt.body || '') + '</div>' +
      (opt.foot === null ? '' : '<div class="modal-foot">' + (opt.foot || '') + '</div>') + '</div>';
    mask._close = function () { unmount(mask); };
    mask.addEventListener('click', function (e) { if (e.target === mask) mask._close(); });
    $$('[data-close]', mask).forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); mask._close(); });
    });
    if (opt.top) mask.style.zIndex = '320';
    mount(mask); if (opt.onMount) opt.onMount(mask); return mask;
  }
  function openDrawer(opt) {
    var dm = document.createElement('div'); dm.className = 'drawer-mask';
    var dr = document.createElement('div'); dr.className = 'drawer ' + (opt.wide ? 'wide' : '');
    dr.innerHTML = '<div class="drawer-head"><div class="mh-ico" style="background:' + (opt.color || '#eef2ff') + ';color:' + (opt.iconColor || '#4f46e5') + '">' + icon(opt.icon || 'box') + '</div>' +
      '<div><h3>' + esc(opt.title) + '</h3>' + (opt.sub ? '<div class="sub">' + esc(opt.sub) + '</div>' : '') + '</div>' +
      '<button class="icon-btn x" data-close>' + icon('x') + '</button></div>' +
      '<div class="drawer-body">' + (opt.body || '') + '</div>' +
      (opt.foot === null ? '' : '<div class="drawer-foot">' + (opt.foot || '') + '</div>');
    function cls() { unmount(dm); unmount(dr); }
    dm._close = cls; dr._close = cls;
    dm.addEventListener('click', cls);
    // 抽屉正文会被多次重建，因此关闭按钮用事件委托（否则 X / 「关闭」点了没反应）
    dr.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-close]') : null;
      if (t) { e.preventDefault(); e.stopPropagation(); cls(); }
    });
    mount(dm); mount(dr);
    if (opt.onMount) opt.onMount(dr);
    return dr;
  }
  function confirmBox(title, msg, onOk, okText) {
    openModal({
      title: title, icon: 'shield', width: 'narrow', top: true,
      body: '<div style="display:flex;gap:12px;align-items:flex-start;padding:4px 2px"><div style="width:36px;height:36px;border-radius:50%;background:#fef2f2;color:#ef4444;display:grid;place-items:center;flex:none">!</div><div style="font-size:13.5px;line-height:1.7;color:#5b6577">' + msg + '</div></div>',
      foot: '<button class="btn" data-close>取消</button><button class="btn danger" data-ok>' + esc(okText || '确定删除') + '</button>',
      onMount: function (m) { $('[data-ok]', m).addEventListener('click', function () { m._close(); onOk && onOk(); }); $('[data-ok]', m).focus(); }
    });
  }

  /* ------------------------------- 状态 / 字段 ------------------------------- */
  function curTable() { return Store.curTable(); }
  function curFields() { return Store.curFields(); }
  function curAssets() { return Store.curAssets(); }
  function statusField() { var f = curFields().filter(function (x) { return x.key === 'status'; })[0]; return f; }
  function categoryField() { var f = curFields().filter(function (x) { return x.key === 'category'; })[0]; return f; }
  function primaryKey() {
    var fs = curFields();
    var vis = fs.filter(function (f) { return f.visible; });
    // 优先在「可见字段」里找主标识，避免隐藏主键后详情入口消失
    var names = ['name', 'assetName', 'changeNo'];
    var p = vis.filter(function (f) { return names.indexOf(f.key) >= 0; })[0]
         || fs.filter(function (f) { return names.indexOf(f.key) >= 0; })[0];
    if (p) return p.key;
    var r = vis.filter(function (f) { return f.required && (f.type === 'text' || f.type === 'number'); })[0]
         || vis.filter(function (f) { return f.type === 'text' || f.type === 'number'; })[0]
         || fs.filter(function (f) { return f.required && (f.type === 'text' || f.type === 'number'); })[0];
    return r ? r.key : null;
  }
  function statusColor(v) {
    if (/在线|完成/.test(v)) return 'green';
    if (/维修|处理|中/.test(v)) return curType() === 'change' ? 'sky' : 'amber';
    if (/报废|取消|故障|删除/.test(v)) return 'red';
    return 'gray';
  }
  function catIcon(c) { var m = { '服务器': 'cpu', '网络设备': 'layers', '安全设备': 'shield', '存储设备': 'db', '终端设备': 'monitor' }; return icon(m[c] || 'box'); }
  function curType() { return Store.curType(); }

  /* ---------------- 到期 / 维保预警（Snipe-IT、GLPI 类系统的高频功能） ----------------
     自动识别"到期类日期列"：字段类型为 date，且 键名/标题 含 到期/维保/保修/有效期 等字样。
     无需改表结构，也不影响原有数据。 */
  var EXP_RE = /(到期|维保|保修|有效期|过期|报废期|expire|expiry|warranty|maintenance)/i;
  function expiryField() {
    var fs = curFields();
    for (var i = 0; i < fs.length; i++) {
      if (fs[i].type !== 'date') continue;
      if (EXP_RE.test(fs[i].key) || EXP_RE.test(fs[i].title)) return fs[i];
    }
    return null;
  }
  function dayDiff(dateStr) {
    if (dateStr === undefined || dateStr === null || dateStr === '') return null;
    var s = String(dateStr).trim().slice(0, 10).replace(/\//g, '-');
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (isNaN(d.getTime())) return null;
    var t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - t.getTime()) / 86400000);
  }
  /** '' | 'soon'(30天内) | 'expired'(已过期) */
  function expiryStateOf(a) {
    var f = expiryField();
    if (!f || !a) return '';
    var n = dayDiff(a[f.key]);
    if (n === null) return '';
    if (n < 0) return 'expired';
    if (n <= 30) return 'soon';
    return '';
  }
  function expiryStats() {
    var soon = 0, exp = 0;
    if (expiryField()) {
      curAssets().forEach(function (a) {
        var s = expiryStateOf(a);
        if (s === 'soon') soon++;
        else if (s === 'expired') exp++;
      });
    }
    return { soon: soon, exp: exp };
  }

  function filtered() {
    var kw = S.keyword.trim().toLowerCase();
    var fkeys = Object.keys(S.filters);
    var list = curAssets().filter(function (a) {
      if (S.section !== 'all' && a.category !== S.section) return false;
      if (S.expiry && expiryStateOf(a) !== S.expiry) return false;
      var sf = statusField();
      if (S.status && sf && a[sf.key] !== S.status) return false;
      for (var i = 0; i < fkeys.length; i++) {
        var fk = fkeys[i], fv = S.filters[fk]; if (!fv) continue;
        var fdef = curFields().filter(function (x) { return x.key === fk; })[0];
        if (!fdef) continue;
        var v = a[fk];
        if (fdef.type === 'select') { if (String(v) !== fv) return false; }
        else { if (String(v == null ? '' : v).toLowerCase().indexOf(fv.toLowerCase()) === -1) return false; }
      }
      if (kw) {
        var hay = curFields().map(function (f) { return a[f.key]; }).join(' ').toLowerCase();
        if (hay.indexOf(kw) === -1) return false;
      }
      return true;
    });
    if (S.sortKey) list.sort(function (x, y) {
      var a = (x[S.sortKey] || ''), b = (y[S.sortKey] || '');
      return a > b ? S.sortDir : a < b ? -S.sortDir : 0;
    });
    return list;
  }

  /* ------------------------------- 渲染：表切换 / 侧栏 ------------------------------- */
  function renderTableSwitch() {
    var t = curTable();
    $('#tsName').textContent = t ? t.name : '';
    $('#tsDot').style.background = t ? t.color : '#4f46e5';
    var html = Store.getTables().map(function (s) {
      var n = (typeof s.count === 'number') ? s.count : 0;
      return '<div class="dd-item ' + (s.id === S.tableId ? 'active' : '') + '" data-tbl="' + s.id + '">' +
        '<span class="tdot" style="background:' + s.color + '"></span><span>' + esc(s.name) + '</span>' +
        '<span class="tag">' + Store.TYPE_LABELS[s.type] + ' · ' + n + '</span></div>';
    }).join('');
    $('#tsMenu').innerHTML = html + '<div class="dd-sep"></div><div class="dd-item" data-manage>' + icon('setting') + '<span>新建 / 管理数据表</span></div>';
  }

  function renderSidebar() {
    $('#tableNav').innerHTML = Store.getTables().map(function (s) {
      return '<div class="nav-item ' + (s.id === S.tableId ? 'active' : '') + '" data-tbl="' + s.id + '">' +
        '<span class="tdot" style="background:' + s.color + '"></span>' +
        '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(s.name) + '</span>' +
        '<span class="tag-type">' + Store.TYPE_LABELS[s.type] + '</span></div>';
    }).join('');

    var nav = '<div class="nav-item ' + (S.section === 'all' && !S.status ? 'active' : '') + '" data-cat="all">' + icon('layers') + '<span>全部记录</span><span class="bm">' + curAssets().length + '</span></div>';
    var cf = categoryField();
    if (cf) {
      nav += '<div class="side-title" style="padding-top:10px">按设备类型</div>';
      (cf.options || []).forEach(function (o) {
        var n = curAssets().filter(function (a) { return a.category === o; }).length;
        nav += '<div class="nav-item ' + (S.section === o ? 'active' : '') + '" data-cat="' + esc(o) + '">' + catIcon(o) + '<span>' + esc(o) + '</span><span class="bm">' + n + '</span></div>';
      });
    }
    // 说明：按现场要求，界面左侧不再提供「按状态」分组；状态筛选改用顶部工具栏的下拉框。
    var ef = expiryField();
    if (ef) {
      var st = expiryStats();
      if (st.exp || st.soon) {
        nav += '<div class="side-title" style="padding-top:10px">到期提醒 · ' + esc(ef.title) + '</div>';
        if (st.exp) nav += '<div class="nav-item ' + (S.expiry === 'expired' ? 'active' : '') + '" data-expiry="expired">' + icon('activity') + '<span>已过期</span><span class="bm danger">' + st.exp + '</span></div>';
        if (st.soon) nav += '<div class="nav-item ' + (S.expiry === 'soon' ? 'active' : '') + '" data-expiry="soon">' + icon('activity') + '<span>30 天内到期</span><span class="bm warn">' + st.soon + '</span></div>';
      }
    }
    $('#navList').innerHTML = nav;
  }

  /* ------------------------------- 渲染：表格 ------------------------------- */
  function renderTable() {
    var fields = curFields().filter(function (f) { return f.visible; });
    var list = filtered();
    // 先修正越界页码，再切片：否则删完末页会显示"空表 + 页码已变"
    var pages = Math.max(1, Math.ceil(list.length / S.pageSize));
    if (S.page > pages) S.page = pages;
    if (S.page < 1) S.page = 1;
    var start = (S.page - 1) * S.pageSize;
    var rows = list.slice(start, start + S.pageSize);
    var pkKey = primaryKey();
    var expKey = expiryField() ? expiryField().key : '';
    var allChecked = rows.length > 0 && rows.every(function (a) { return S.selected[a.id]; });

    var head = '<th class="col-check"><input type="checkbox" id="chkAll"' + (allChecked ? ' checked' : '') + '></th>';
    head += fields.map(function (f) {
      var on = S.sortKey === f.key;
      return '<th class="sortable' + (on ? ' sorted' : '') + (S.filters[f.key] ? ' filtered' : '') + '" data-sort="' + esc(f.key) + '" style="min-width:' + (f.width || 120) + 'px">' +
        '<span class="th-title">' + esc(f.title) + (on ? ' <span class="sort-arr">' + (S.sortDir > 0 ? '↑' : '↓') + '</span>' : '') + '</span>' +
        '<button class="th-filter" data-colfilter="' + esc(f.key) + '" title="筛选 / 排序此列">' + icon('filter') + '</button></th>';
    }).join('');
    head += '<th style="min-width:120px">配置文件</th><th class="col-op">操作</th>';

    var body;
    if (!rows.length) {
      body = '<tr><td colspan="' + (fields.length + 3) + '"><div class="empty"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd2e0" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg><div style="margin-top:10px;font-size:14px">没有匹配的记录</div><div style="font-size:12.5px;margin-top:4px">可清空筛选，或点击右上角「新增记录」</div></div></td></tr>';
    } else {
      body = rows.map(function (a) {
        var tds = '<td class="col-check"><input type="checkbox" class="chk-row" data-id="' + esc(a.id) + '"' + (S.selected[a.id] ? ' checked' : '') + '></td>';
        tds += fields.map(function (f) {
          var v = a[f.key], cell;
          if (f.key === pkKey) cell = '<div class="cell-name"><span class="ico-box">' + catIcon(a.category) + '</span><span class="link" data-detail="' + esc(a.id) + '">' + esc(v || '-') + '</span></div>';
          else if (f.key === 'status') cell = '<span class="badge ' + statusColor(v) + '">' + esc(v || '-') + '</span>';
          else if (f.key === expKey) {
            var es = expiryStateOf(a);
            cell = '<span class="cell-exp' + (es ? ' ' + es : '') + '">' + esc(v || '-') + '</span>' +
              (es ? ' <span class="badge ' + (es === 'expired' ? 'red' : 'amber') + '">' + (es === 'expired' ? '已过期' : '即将到期') + '</span>' : '');
          }
          else if (f.type === 'password') {
            var show = S.showPwd[a.id];
            cell = '<div class="pwd-wrap"><span class="pwd-text">' + (show ? esc(v || '') : '••••••••') + '</span>' +
              '<button class="icon-link" data-pwd="' + esc(a.id) + '" title="显示/隐藏">' + icon(show ? 'eyeOff' : 'eye') + '</button>' +
              '<button class="icon-link" data-copy="' + esc(v || '') + '" title="复制">' + icon('copy') + '</button></div>';
          } else if (f.key === 'ip' || f.key === 'mgmtIp' || f.key === 'sn') cell = '<span class="mono">' + esc(v || '-') + '</span>';
          else if (f.type === 'select') cell = v ? '<span class="badge blue">' + esc(v) + '</span>' : '-';
          else cell = esc(v || '-');
          return '<td>' + cell + '</td>';
        }).join('');
        var files = (a.fileCount || 0);
        tds += '<td>' + (files ? '<span class="file-chip" data-files="' + esc(a.id) + '">' + icon('folder') + ' ' + files + ' 个</span>' : '<span class="file-chip none">— 未上传</span>') + '</td>';
        tds += '<td class="col-op"><div class="op-btns"><button class="btn sm" data-edit="' + esc(a.id) + '">' + icon('edit') + '编辑</button>' +
          '<button class="btn sm" data-files="' + esc(a.id) + '">' + icon('file') + '附件</button>' +
          '<button class="btn sm danger" data-del="' + esc(a.id) + '">' + icon('trash') + '</button></div></td>';
        var rowCls = [(S.selected[a.id] ? 'selected' : ''), (expiryStateOf(a) === 'expired' ? 'row-expired' : '')].join(' ').trim();
        return '<tr class="' + rowCls + '" data-id="' + esc(a.id) + '">' + tds + '</tr>';
      }).join('');
    }
    $('#assetTable').innerHTML = '<thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody>';

    var pb = '', add = function (p, txt, dis, act) { pb += '<button class="page-btn ' + (act ? 'active' : '') + '" data-page="' + p + '"' + (dis ? ' disabled' : '') + '>' + txt + '</button>'; };
    add(S.page - 1, '‹', S.page <= 1, false);
    var from = Math.max(1, Math.min(S.page - 2, pages - 4));
    for (var p = from; p < from + 5 && p <= pages; p++) add(p, p, false, p === S.page);
    add(S.page + 1, '›', S.page >= pages, false);
    $('#pager').innerHTML = '<div class="total">共 <b>' + list.length + '</b> 条 · 第 ' + S.page + '/' + pages + ' 页</div><div class="pages">' + pb + '</div>';

    var sel = Object.keys(S.selected).length;
    $('#bulkBar').className = 'bulk-bar' + (sel ? '' : ' hidden');
    if (sel) $('#bulkCount').textContent = sel;
    renderFilterChips();
  }

  function renderFilterChips() {
    var box = $('#filterChips'); if (!box) return;
    var keys = Object.keys(S.filters).filter(function (k) { return S.filters[k]; });
    if (!keys.length) { box.innerHTML = ''; box.classList.add('hidden'); return; }
    var fmap = {}; curFields().forEach(function (f) { fmap[f.key] = f.title; });
    box.innerHTML = keys.map(function (k) {
      return '<span class="chip">' + esc(fmap[k] || k) + '：' + esc(S.filters[k]) + '<button data-clearfilter="' + esc(k) + '" title="清除">×</button></span>';
    }).join('') + '<button class="chip-clear" id="clearAllFilters">清除全部筛选</button>';
    box.classList.remove('hidden');
  }

  function renderHead() {
    var t = curTable();
    $('#crumb').textContent = (t ? t.name : '') + ' · ' + (S.section !== 'all' ? S.section : '全部记录') + (S.status ? ' · ' + S.status : '');
    var sf = statusField();
    if (sf) { $('#filterStatus').innerHTML = '<option value="">全部状态</option>' + (sf.options || []).map(function (o) { return '<option' + (S.status === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join(''); $('#filterStatus').style.display = ''; }
    else $('#filterStatus').style.display = 'none';
    var cf = categoryField();
    if (cf) { $('#filterCat').innerHTML = '<option value="">全部类型</option>' + (cf.options || []).map(function (o) { return '<option' + (S.section === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join(''); $('#filterCat').style.display = ''; }
    else $('#filterCat').style.display = 'none';
  }

  /* ------------------------------- 列筛选菜单 ------------------------------- */
  function closeColMenu() { var m = document.getElementById('colMenu'); if (m && m.parentNode) m.parentNode.removeChild(m); }
  function openColMenu(th, key) {
    closeColMenu();
    var f = curFields().filter(function (x) { return x.key === key; })[0]; if (!f) return;
    var isSel = f.type === 'select';
    var menu = document.createElement('div'); menu.id = 'colMenu'; menu.className = 'col-menu';
    var sortAsc = '<div class="cm-item" data-sortdir="1">' + icon('arrowUp') + ' 升序排序</div>';
    var sortDesc = '<div class="cm-item" data-sortdir="-1">' + icon('arrowDown') + ' 降序排序</div>';
    var filterSec;
    if (isSel) {
      filterSec = '<div class="cm-sep"></div><div class="cm-title">按值筛选</div>' +
        (f.options || []).map(function (o) { return '<div class="cm-item' + (S.filters[key] === o ? ' on' : '') + '" data-fval="' + esc(o) + '">' + esc(o) + '</div>'; }).join('');
    } else {
      filterSec = '<div class="cm-sep"></div><div class="cm-title">按文字筛选（包含）</div>' +
        '<div class="cm-input"><input id="cmInput" type="' + (f.type === 'date' ? 'date' : 'text') + '" placeholder="输入关键字…" value="' + esc(S.filters[key] || '') + '"><button id="cmApply">应用</button></div>';
    }
    var clear = S.filters[key] ? '<div class="cm-sep"></div><div class="cm-item danger" data-fclear="1">清除该列筛选</div>' : '';
    menu.innerHTML = '<div class="cm-title">排序</div>' + sortAsc + sortDesc + filterSec + clear;
    document.body.appendChild(menu);
    var r = th.getBoundingClientRect(), mw = 210;
    menu.style.position = 'fixed';
    menu.style.top = (r.bottom + 6) + 'px';
    var left = r.left; if (left + mw > window.innerWidth - 10) left = window.innerWidth - 10 - mw; if (left < 10) left = 10;
    menu.style.left = left + 'px'; menu.style.width = mw + 'px';
    menu.addEventListener('click', function (e) {
      var it = e.target.closest('[data-sortdir]');
      if (it) { S.sortKey = key; S.sortDir = +it.getAttribute('data-sortdir'); closeColMenu(); renderTable(); return; }
      var fv = e.target.closest('[data-fval]');
      if (fv) { S.filters[key] = fv.getAttribute('data-fval'); S.page = 1; closeColMenu(); renderTable(); return; }
      if (e.target.closest('[data-fclear]')) { delete S.filters[key]; S.page = 1; closeColMenu(); renderTable(); return; }
      if (e.target.closest('#cmApply')) { var v = $('#cmInput', menu).value.trim(); if (v) { S.filters[key] = v; S.page = 1; } closeColMenu(); renderTable(); return; }
    });
  }

  /* 顶部到期提醒：仅在确有到期/临期记录时出现，点击即筛选 */
  function renderExpPill() {
    var el = $('#expPill'); if (!el) return;
    var ef = expiryField();
    if (!ef) { el.className = 'exp-pill hidden'; S.expiry = ''; return; }
    var st = expiryStats();
    if (!st.exp && !st.soon) { el.className = 'exp-pill hidden'; S.expiry = ''; return; }
    var parts = [];
    if (st.exp) parts.push(st.exp + ' 项已过期');
    if (st.soon) parts.push(st.soon + ' 项 30 天内到期');
    el.textContent = '⚠ ' + parts.join(' · ') + (S.expiry ? '（已筛选，点击取消）' : '（点击筛选）');
    el.className = 'exp-pill ' + (st.exp ? 'danger' : 'warn') + (S.expiry ? ' on' : '');
    el.onclick = (function (e, s) {
      return function () {
        S.expiry = S.expiry ? '' : (s.exp ? 'expired' : 'soon');
        S.page = 1; renderSidebar(); renderTable(); renderExpPill();
      };
    })(el, st);
  }

  function renderAll() {
    renderTableSwitch(); renderSidebar(); renderHead(); renderExpPill();
    if (curType() === 'rack') {
      /* 机房（机柜图表）表：主区切换为机柜图表视图，隐藏普通表格 */
      var panel = $('.panel'), rv = $('#rackView');
      if (panel) panel.classList.add('hidden');
      if (rv) { rv.classList.remove('hidden'); window.RackView.render(S.tableId); }
      return;
    }
    var rv2 = $('#rackView');
    if (rv2) rv2.classList.add('hidden');
    var panel2 = $('.panel');
    if (panel2) panel2.classList.remove('hidden');
    renderTable();
  }

  /* ------------------------------- 新增 / 编辑 ------------------------------- */
  function fieldControl(f, value) {
    var v = value == null ? '' : value, id = 'fld_' + f.key;
    if (f.type === 'select') return '<select id="' + id + '"><option value="">— 请选择 —</option>' + (f.options || []).map(function (o) { return '<option value="' + esc(o) + '"' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
    if (f.type === 'textarea') return '<textarea id="' + id + '" placeholder="请输入' + esc(f.title) + '">' + esc(v) + '</textarea>';
    if (f.type === 'password') return '<input type="text" id="' + id + '" value="' + esc(v) + '" placeholder="请输入' + esc(f.title) + '"><div class="hint">列表默认掩码显示，可点击眼睛图标查看</div>';
    return '<input type="' + (f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text') + '" id="' + id + '" value="' + esc(v) + '" placeholder="请输入' + esc(f.title) + '">';
  }

  /* ---------- 硬件更换单：IP → 关联设备自动回填 ----------
     填写/修改 IP 后失焦，跨所有「设备资产」类型的数据表查找该 IP，
     命中则自动回填 关联设备 / 资产编码 / 原硬件型号 等字段。 */
  function bindIpRelate(m, fields, asset, isNew) {
    var ipInput = $('#fld_ip', m);
    if (!ipInput) return;                 // 该表没有 IP 字段（如自定义表）
    var tip = $('#relTip', m);
    var busy = false;

    function titleOf(key) {
      for (var i = 0; i < fields.length; i++) if (fields[i].key === key) return fields[i].title;
      return key;
    }
    function setTip(text, kind) {
      if (!tip) return;
      if (!text) { tip.className = 'rel-tip hidden'; tip.innerHTML = ''; return; }
      tip.className = 'rel-tip ' + (kind || '');
      tip.innerHTML = text;
    }
    function fill(key, val, filled, skipped) {
      var el = $('#fld_' + key, m);
      if (!el) return;
      var v = (val == null ? '' : String(val)).trim();
      if (!v) return;
      var cur = (el.value || '').trim();
      if (cur && cur !== v) { skipped.push(titleOf(key)); return; }
      el.value = v;
      filled.push(titleOf(key));
    }
    function relate() {
      var ip = (ipInput.value || '').trim();
      if (!ip) { setTip('', ''); return; }
      if (busy) return;
      busy = true;
      setTip('正在查找 IP <b>' + esc(ip) + '</b> 对应的设备…', 'loading');
      API.lookupByIp(ip).then(function (r) {
        busy = false;
        if (r && r.found && r.asset) {
          var a = r.asset, filled = [], skipped = [];
          fill('assetName', a.name, filled, skipped);
          fill('assetCode', a.assetCode, filled, skipped);
          fill('oldPart', a.model, filled, skipped);
          setTip('已关联到 <b>' + esc(a.name || a.assetCode || ip) + '</b>'
            + (r.tableName ? '（' + esc(r.tableName) + (r.matchOn === 'mgmtIp' ? ' · 按管理IP匹配' : '') + '）' : ''), 'ok');
          if (filled.length) toast('已自动填充：' + filled.join('、'), 'success');
          if (skipped.length) toast('以下字段已有值，未自动覆盖：' + skipped.join('、'), 'warn');
        } else {
          setTip('未在任何设备资产表中找到 IP <b>' + esc(ip) + '</b>，请手动填写关联信息', 'miss');
          toast('未找到 IP ' + ip + ' 对应的设备', 'warn');
        }
      }).catch(function (e) {
        busy = false;
        setTip('', '');
        toast(e.message || '关联查询失败', 'error');
      });
    }

    ipInput.addEventListener('blur', relate);
    ipInput.addEventListener('change', relate);
    // 编辑已有更换单时，若已有 IP，进入即自动关联一次，便于核对 / 补齐
    if (!isNew && asset && asset.ip) setTimeout(relate, 350);
  }

  /* ------------------------- 位置识别（由「存放位置」文本驱动） ------------------------- */
  function rackRooms() {
    return Store.getTables().filter(function (t) { return t.type === 'rack'; });
  }

  function uRangeText(u, size) {
    return size > 1 ? ('U' + u + '-' + (u + size - 1)) : ('U' + u);
  }

  /* 位置识别：只读提示。机房 / 机柜 / U 位全部由「存放位置」文本推导，
     表单里不再出现第二套可编辑的位置输入，避免两处冲突。 */
  function rackPickerHtml(fields) {
    var hasLoc = fields.some(function (f) { return f.key === 'location'; });
    if (!hasLoc) return '';
    if (!rackRooms().length) {
      return '<div class="section-card"><div class="section-title">位置识别</div>' +
        '<div class="hint">还没有机房表。先在「新建 / 管理数据表」里建一张「机房图表」类型的表，之后填设备位置就能自动上架。</div></div>';
    }
    return '<div class="section-card"><div class="section-title">位置识别（自动 · 无需重复填写）</div>' +
      '<div class="loc-hint" id="locHint">填写上方「存放位置」后自动识别机房 / 机柜 / U 位。</div>' +
      '<div class="hint">格式示例：A机房 S柜 U3-5　·　字母大小写不限，保存时柜号统一转为大写</div></div>';
  }

  function bindRackPicker(m, asset) {
    var locInp = $('#fld_location', m), hint = $('#locHint', m);
    if (!locInp || !hint) return;
    var timer = null, seq = 0;
    var TIP = '填写上方「存放位置」后自动识别机房 / 机柜 / U 位。';

    function paint(txt) {
      if (!txt) { hint.className = 'loc-hint'; hint.innerHTML = TIP; return; }
      var my = ++seq;
      API.req('GET', '/tables/' + S.tableId + '/resolve-location?text=' + encodeURIComponent(txt))
        .then(function (r) {
          if (my !== seq || !r) return;
          if (r.status === 'ok') {
            hint.className = 'loc-hint ok';
            hint.innerHTML = '已识别：<b>' + esc(r.room) + ' · ' + esc(r.code) + ' · ' +
              uRangeText(r.uStart, r.uSize) + '</b>' +
              '<span class="sub">机柜共 ' + r.uTotal + 'U · 保存后自动关联</span>';
          } else if (r.status === 'out_of_range') {
            hint.className = 'loc-hint err';
            hint.innerHTML = 'U 位超出机柜范围：<b>' + esc(r.code) + '</b> 共 ' + r.uTotal + 'U';
          } else if (r.status === 'rack_missing') {
            hint.className = 'loc-hint warn';
            hint.innerHTML = '机柜「<b>' + esc(r.code) + '</b>」在' +
              (r.room ? '「' + esc(r.room) + '」' : '当前机房') +
              '不存在<span class="sub">保存时会询问是否新建</span>';
          } else if (r.status === 'room_has_no_rack') {
            hint.className = 'loc-hint warn';
            hint.innerHTML = '机房「' + esc(r.room) + '」里没有机柜「<b>' + esc(r.code) + '</b>」' +
              '<span class="sub">保存时会询问是否新建</span>';
          } else if (r.status === 'no_rack') {
            hint.className = 'loc-hint warn';
            hint.innerHTML = '没有写机柜号，只记录位置文本，不关联机柜';
          } else {
            hint.className = 'loc-hint warn';
            hint.innerHTML = '未能识别，请检查格式（示例：A机房 S柜 U3-5）';
          }
        })
        .catch(function () { /* 解析失败静默，不打断填写 */ });
    }

    locInp.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { paint((locInp.value || '').trim()); }, 320);
    });
    if ((locInp.value || '').trim()) paint(locInp.value.trim());
  }

  function readRackPicker() {
    // 位置已完全交由「存放位置」文本驱动，不再提交独立的柜位参数
    return null;
  }

  /* 保存后的联动反馈：已关联 / 机柜不存在（引导新建） */
  function handleRackSaveResult(info, done) {
    if (!info || info.status === 'no_location' || info.status === 'cleared' || info.status === 'none') {
      if (info && info.status === 'cleared') toast('已解除机柜关联', 'warn');
      done();
      return;
    }
    if (info.status === 'linked') {
      toast('已关联至 ' + info.room + ' ' + info.code + ' ' + uRangeText(info.uStart, info.uSize || 1), 'success');
      done();
      return;
    }
    if (info.status === 'rack_missing') {
      var roomTxt = info.room || '';
      confirmBox('机柜不存在',
        '位置中提到的机柜「<b>' + esc(info.code) + '</b>」在' + (roomTxt ? '「<b>' + esc(roomTxt) + '</b>」' : '当前机房') +
        '中不存在。<br>是否现在新建这个机柜？<br><span style="color:#94a3b8;font-size:12.5px">新建后，系统会自动把位置指向它的设备挂上去。</span>',
        function () { createMissingRack(info); }, '新建机柜');
      done();
      return;
    }
    if (info.status === 'unparsed') {
      toast('位置文本未识别出机柜，未关联（格式示例：A机房 K1柜 15-16u）', 'warn');
    }
    done();
  }

  function createMissingRack(info) {
    var rooms = rackRooms();
    var target = null;
    if (info.room) {
      target = rooms.filter(function (t) { return t.name === info.room; })[0]
            || rooms.filter(function (t) { return t.name.indexOf(info.room) >= 0 || info.room.indexOf(t.name) >= 0; })[0];
    }
    if (!target && rooms.length === 1) target = rooms[0];
    if (!target) {
      toast('请先到「机房图表」数据表中新建机柜：' + info.code, 'warn');
      return;
    }
    switchTable(target.id);
    if (window.RackView && RackView.openAddRack) {
      RackView.openAddRack({ code: (info.suggest || info.code || '').toUpperCase(), name: info.code || '' });
    }
  }

  function openAssetModal(id) {
    var fields = curFields(), t = curTable();
    var asset = null, l = curAssets();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) asset = l[i];
    var isNew = !asset; asset = asset || { id: '', status: (statusField() ? statusField().options[0] : '') };

    function bindAssetFiles(mm, assetId) {
      var input = document.createElement('input'); input.type = 'file'; input.multiple = true; input.style.display = 'none'; mm.appendChild(input);
      function filesHtml() {
        var files = Store.filesOf(S.tableId, assetId);
        if (!files.length) return '<div class="empty" style="padding:24px">暂无配置文件，点击下方区域上传</div>';
        return files.map(function (f) {
          var thumb = f.type === 'image' ? '<img src="' + API.filePreviewUrl(S.tableId, assetId, f.id) + '">' : '<span>' + (f.type === 'text' ? 'TXT' : 'FILE') + '</span>';
          return '<div class="file-card" data-view="' + esc(f.id) + '" title="点击查看内容"><div class="file-thumb">' + thumb + '</div><div class="file-meta"><div class="nm">' + esc(f.name) + '</div><div class="sz">' + fmtSize(f.size) + ' · ' + esc(f.time) + '</div><div class="file-ops"><button class="btn sm ghost" data-dl="' + esc(f.id) + '">' + icon('download') + '下载</button><button class="btn sm ghost" data-rm="' + esc(f.id) + '" style="color:#ef4444">' + icon('trash') + '删除</button></div></div></div>';
        }).join('');
      }
      function refresh() {
        return Store.loadFiles(S.tableId, assetId).then(function () {
          var box = $('#fileList2', mm); if (box) { box.innerHTML = filesHtml(); bindActions(); }
          return Store.reloadAssets(S.tableId);
        }).then(function () { Store.bumpCount(S.tableId); renderTable(); });
      }
      function bindActions() {
        $$('[data-view]', mm).forEach(function (el) { el.addEventListener('click', function (e) { if (e.target.closest('.file-ops')) return; previewFile(assetId, el.getAttribute('data-view'), refresh); }); });
        $$('[data-dl]', mm).forEach(function (el) { el.addEventListener('click', function () { downloadFile(assetId, el.getAttribute('data-dl')); }); });
        $$('[data-rm]', mm).forEach(function (el) { el.addEventListener('click', function () { var fid = el.getAttribute('data-rm'); confirmBox('删除配置文件', '确定删除该配置文件吗？', function () { API.deleteFile(S.tableId, assetId, fid).then(function () { toast('已删除', 'success'); return refresh(); }).catch(function (e) { toast(e.message || '删除失败', 'error'); }); }, '删除文件'); }); });
      }
      function handleFiles(fl) {
        var arr = Array.prototype.slice.call(fl);
        if (!arr.length) return;
        var over = arr.filter(function (file) { return file.size > 20 * 1048576; });
        if (over.length) toast('以下文件超过 20MB 已跳过：' + over.map(function (x) { return x.name; }).join('、'), 'warn');
        var ok = arr.filter(function (file) { return file.size <= 20 * 1048576; });
        if (!ok.length) return;
        API.uploadFiles(S.tableId, assetId, ok).then(function (r) {
          var saved = (r && r.saved) || [];
          var okN = saved.filter(function (x) { return !x.error; }).length;
          var errs = saved.filter(function (x) { return x.error; });
          if (okN) toast('已上传 ' + okN + ' 个文件', 'success');
          if (errs.length) toast(errs.map(function (x) { return x.name + '：' + x.error; }).join('；'), 'error');
          return refresh();
        }).catch(function (e) { toast(e.message || '上传失败', 'error'); });
      }
      var dz = $('#dropZone2', mm);
      if (dz) {
        dz.addEventListener('click', function () { input.click(); });
        dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('over'); });
        dz.addEventListener('dragleave', function () { dz.classList.remove('over'); });
        dz.addEventListener('drop', function (e) { e.preventDefault(); dz.classList.remove('over'); handleFiles(e.dataTransfer.files); });
      }
      input.onchange = function () { handleFiles(input.files); input.value = ''; };
      refresh();
    }

    var body = '<div class="section-card"><div class="section-title">表单字段</div><div class="form-grid">' +
      fields.map(function (f) {
        return '<div class="form-item' + (f.type === 'textarea' ? ' full' : '') + '"><label>' + esc(f.title) + (f.required ? '<span class="req">*</span>' : '') + '</label>' + fieldControl(f, asset[f.key]) + '</div>';
      }).join('') + '</div>' +
      /* 硬件更换单：填写 IP 后自动跨所有设备资产表关联回填 */
      (curType() === 'change' ? '<div class="rel-tip hidden" id="relTip"></div>' : '') +
      '</div>' + rackPickerHtml(fields) +
      (isNew ? '' : '<div class="section-card" id="assetFilesCard"><div class="section-title">配置文件（图片 / TXT / CFG 等 · 点击文件可查看内容）</div>' +
        '<div class="drop-zone" id="dropZone2">' + icon('upload') + '<div style="margin-top:6px">点击选择文件，或拖拽至此（图片 / txt / cfg / conf / log，单文件 ≤ 20MB）</div></div>' +
        '<div class="file-list" id="fileList2"></div></div>');

    openModal({
      title: isNew ? '新增记录' : '编辑记录', icon: t.type === 'change' ? 'swap' : 'box',
      sub: t ? t.name : '', width: 'wide', body: body,
      foot: '<button class="btn" data-close>取消</button><button class="btn primary" data-save>保存</button>',
      onMount: function (m) {
        if (!isNew) bindAssetFiles(m, id);
        if (Store.curType() === 'change') bindIpRelate(m, fields, asset, isNew);
        bindRackPicker(m, isNew ? null : asset);
        $('[data-save]', m).addEventListener('click', function () {
          var data = {}, ok = true;
          fields.forEach(function (f) {
            var inp = $('#fld_' + f.key, m); if (!inp) return;
            data[f.key] = inp.value.trim ? inp.value.trim() : inp.value;
            if (f.required && !data[f.key]) { ok = false; inp.style.borderColor = '#ef4444'; } else inp.style.borderColor = '';
          });
          if (!ok) {
            var miss = fields.filter(function (f) { return f.required && !data[f.key]; })
              .map(function (f) { return f.title; });
            toast('请填写必填项：' + miss.join('、'), 'error');
            return;
          }
          var pick = readRackPicker(m);
          if (pick) {
            data.rackId = pick.rackId; data.uStart = pick.uStart; data.uSize = pick.uSize;
          }
          var saveId = isNew ? '' : id;
          API.saveAsset(S.tableId, saveId, data).then(function (r) {
            m._close();
            Store.reloadAssets(S.tableId).then(function () { Store.bumpCount(S.tableId); renderAll(); });
            var info = r && r.rack;
            if (!info || info.status === 'no_location' || info.status === 'none') {
              toast(isNew ? '记录已新增' : '记录已保存', 'success');
            }
            handleRackSaveResult(info, function () {});
          }).catch(function (e) { toast(e.message || '保存失败', 'error'); });
        });
      }
    });
  }

  function openDetail(id) {
    var a = null, l = curAssets(); for (var i = 0; i < l.length; i++) if (l[i].id === id) a = l[i];
    if (!a) return;
    var t = curTable(), fields = curFields();
    var kv = fields.map(function (f) {
      var v = f.type === 'password' ? '••••••••' : (a[f.key] || '-');
      return '<div class="kv"><div class="k">' + esc(f.title) + '</div><div class="v">' + esc(v) + '</div></div>';
    }).join('');
    Store.loadFiles(S.tableId, id).then(function (files) {
      var fsec = files.length ? '<div style="margin-top:14px;font-size:13px;font-weight:700;color:#1e2430">配置文件（' + files.length + '）</div>' +
        '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px">' + files.map(function (f) {
          return '<span class="file-chip" data-files2="' + esc(id) + '">' + icon('folder') + ' ' + esc(f.name) + '</span>';
        }).join('') + '</div>' : '';
      openDrawer({
        title: a[primaryKey()] || '详情', icon: t.type === 'change' ? 'swap' : 'box', sub: t ? t.name : '',
        color: '#eef2ff', iconColor: t ? t.color : '#4f46e5',
        body: '<div class="section-card" style="margin-bottom:0"><div class="section-title">字段明细</div>' + kv + '</div>' + fsec,
        foot: '<button class="btn" data-close>关闭</button><button class="btn" data-print>打印标签</button><button class="btn primary" data-goedit>编辑 / 管理附件</button>',
        onMount: function (d) {
          $('[data-goedit]', d).addEventListener('click', function () { d._close(); openAssetModal(id); });
          var pb = $('[data-print]', d);
          if (pb) pb.addEventListener('click', function () {
            if (!window.Print) { toast('标签打印模块未加载', 'error'); return; }
            window.Print.openLabelPrint([a]);
          });
          $$('[data-files2]', d).forEach(function (el) { el.addEventListener('click', function () { d._close(); openFiles(id); }); });
        }
      });
    });
  }

  /* ------------------------------- 附件管理 ------------------------------- */
  function openFiles(assetId) {
    var a = null, l = curAssets(); for (var i = 0; i < l.length; i++) if (l[i].id === assetId) a = l[i];
    if (!a) return;
    var t = curTable();

    function bodyHtml() {
      var files = Store.filesOf(S.tableId, assetId);
      var cards = files.length ? files.map(function (f) {
        var thumb = f.type === 'image' ? '<img src="' + API.filePreviewUrl(S.tableId, assetId, f.id) + '">' : '<span>' + (f.type === 'text' ? 'TXT' : 'FILE') + '</span>';
        return '<div class="file-card" data-view="' + esc(f.id) + '" title="点击查看内容"><div class="file-thumb">' + thumb + '</div><div class="file-meta">' +
          '<div class="nm">' + esc(f.name) + '</div>' +
          '<div class="sz">' + fmtSize(f.size) + ' · ' + esc(f.time) + '</div>' +
          '<div class="file-ops"><button class="btn sm ghost" data-dl="' + esc(f.id) + '">' + icon('download') + '下载</button>' +
          '<button class="btn sm ghost" data-rm="' + esc(f.id) + '" style="color:#ef4444">' + icon('trash') + '删除</button></div></div></div>';
      }).join('') : '<div class="empty" style="padding:30px"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd2e0" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><div style="margin-top:8px">暂无配置文件，点击下方区域上传</div></div>';
      return '<div class="files-head"><div><b>' + esc(a[primaryKey()] || assetId) + '</b><div style="font-size:12px;color:#94a0b3;margin-top:3px">' + files.length + ' 个配置文件</div></div></div>' +
        '<div class="drop-zone" id="dropZone">' + icon('upload') + '<div style="margin-top:6px">点击选择文件，或拖拽至此（图片 / txt / cfg / conf / log，单文件 ≤ 20MB）</div></div>' +
        '<div class="file-list">' + cards + '</div>';
    }

    Store.loadFiles(S.tableId, assetId).then(function () {
      openDrawer({
        title: '配置文件管理', icon: 'folder', sub: t ? t.name : '', color: '#f1ecff', iconColor: '#8b5cf6', wide: true,
        body: bodyHtml(), foot: '<button class="btn" data-close>关闭</button>',
        onMount: function (dr) {
          var input = document.createElement('input');
          input.type = 'file'; input.multiple = true; input.style.display = 'none'; dr.appendChild(input);

          function handleFiles(fl) {
            var arr = Array.prototype.slice.call(fl);
            var over = arr.filter(function (file) { return file.size > 20 * 1048576; });
            if (over.length) toast('以下文件超过 20MB 已跳过：' + over.map(function (x) { return x.name; }).join('、'), 'warn');
            var ok = arr.filter(function (file) { return file.size <= 20 * 1048576; });
            if (!ok.length) return;
            API.uploadFiles(S.tableId, assetId, ok).then(function (r) {
              var saved = (r && r.saved) || [];
              var okN = saved.filter(function (x) { return !x.error; }).length;
              var errs = saved.filter(function (x) { return x.error; });
              if (okN) toast('已上传 ' + okN + ' 个文件', 'success');
              if (errs.length) toast(errs.map(function (x) { return x.name + '：' + x.error; }).join('；'), 'error');
              return refresh();
            }).catch(function (e) { toast(e.message || '上传失败', 'error'); });
          }
          function refresh() { return Store.loadFiles(S.tableId, assetId).then(function () { $('.drawer-body', dr).innerHTML = bodyHtml(); bind(); return Store.reloadAssets(S.tableId); }).then(function () { Store.bumpCount(S.tableId); renderTable(); }); }
          function bind() {
            var dz = $('#dropZone', dr);
            dz.addEventListener('click', function () { input.click(); });
            dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('over'); });
            dz.addEventListener('dragleave', function () { dz.classList.remove('over'); });
            dz.addEventListener('drop', function (e) { e.preventDefault(); dz.classList.remove('over'); handleFiles(e.dataTransfer.files); });
            input.onchange = function () { handleFiles(input.files); input.value = ''; };
            $$('[data-view]', dr).forEach(function (el) { el.addEventListener('click', function (e) { if (e.target.closest('.file-ops')) return; previewFile(assetId, el.getAttribute('data-view'), refresh); }); });
            $$('[data-dl]', dr).forEach(function (el) { el.addEventListener('click', function () { downloadFile(assetId, el.getAttribute('data-dl')); }); });
            $$('[data-rm]', dr).forEach(function (el) { el.addEventListener('click', function () { var fid = el.getAttribute('data-rm'); confirmBox('删除配置文件', '确定删除该配置文件吗？', function () { API.deleteFile(S.tableId, assetId, fid).then(function () { toast('已删除', 'success'); return refresh(); }).catch(function (e) { toast(e.message || '删除失败', 'error'); }); }, '删除文件'); }); });
          }
          bind();
        }
      });
    });
  }

  function findFile(assetId, fileId) { return Store.findFile(S.tableId, assetId, fileId); }
  // 附件预览：支持直接编辑(文本)、复制、重命名、删除
  function previewFile(assetId, fileId, onChange) {
    var f = findFile(assetId, fileId); if (!f) return;
    var isText = f.type === 'text';
    var p = isText ? API.fetchText(API.filePreviewUrl(S.tableId, assetId, fileId)) : Promise.resolve('');
    p.then(function (content) {
      var editing = false;
      var inner = f.type === 'image' ? '<img class="preview-img" src="' + API.filePreviewUrl(S.tableId, assetId, fileId) + '">' :
        f.type === 'text' ? '<pre class="preview-txt" id="pvText">' + esc(content) + '</pre>' +
          '<textarea class="preview-edit" id="pvEdit" style="display:none">' + esc(content) + '</textarea>' :
        '<div class="empty">该文件类型暂不支持在线预览，请下载后查看</div>';
      var foot = '';
      if (f.type === 'text') {
        foot += '<button class="btn" data-pvedit>' + icon('edit') + '编辑</button>';
        foot += '<button class="btn" data-pvcopy>复制内容</button>';
      }
      foot += '<button class="btn" data-pvrename>重命名</button>';
      foot += '<button class="btn" data-pvdel style="color:#ef4444">删除</button>';
      foot += '<button class="btn" data-close>关闭</button><button class="btn primary" data-dlp>' + icon('download') + '下载</button>';
      openModal({
        title: f.name, icon: 'file',
        sub: fmtSize(f.size) + ' · ' + f.time, width: 'wide', top: true,
        body: '<div class="preview-body">' + inner + '</div>', foot: foot,
        onMount: function (m) {
          var titleEl = m.querySelector('.modal-head h3');
          $('[data-dlp]', m).addEventListener('click', function () { downloadFile(assetId, fileId); });
          var copyBtn = $('[data-pvcopy]', m), editBtn = $('[data-pvedit]', m), renameBtn = $('[data-pvrename]', m), delBtn = $('[data-pvdel]', m);
          if (copyBtn) copyBtn.addEventListener('click', function () { copyText(content); });
          if (editBtn) editBtn.addEventListener('click', function () {
            var pre = $('#pvText', m), ta = $('#pvEdit', m);
            if (!editing) {
              pre.style.display = 'none'; ta.style.display = ''; ta.focus();
              editBtn.innerHTML = icon('upload') + '保存修改';
            } else {
              var v = ta.value;
              API.updateFileContent(S.tableId, assetId, fileId, v).then(function () {
                content = v; pre.textContent = v; ta.style.display = 'none'; pre.style.display = '';
                editing = false; editBtn.innerHTML = icon('edit') + '编辑';
                toast('内容已保存', 'success'); if (onChange) onChange();
              }).catch(function (e) { toast(e.message || '保存失败', 'error'); });
            }
          });
          if (renameBtn) renameBtn.addEventListener('click', function () {
            var nn = window.prompt('请输入新的文件名（含扩展名）：', f.name);
            if (nn && nn.trim() && nn.trim() !== f.name) {
              API.renameFile(S.tableId, assetId, fileId, nn.trim()).then(function () {
                f.name = nn.trim(); if (titleEl) titleEl.textContent = f.name;
                toast('已重命名为：' + f.name, 'success'); if (onChange) onChange();
              }).catch(function (e) { toast(e.message || '重命名失败', 'error'); });
            }
          });
          if (delBtn) delBtn.addEventListener('click', function () {
            confirmBox('删除配置文件', '确定删除该配置文件「' + esc(f.name) + '」吗？此操作不可恢复。', function () {
              API.deleteFile(S.tableId, assetId, fileId).then(function () {
                m._close(); toast('已删除：' + f.name, 'success'); if (onChange) onChange();
              }).catch(function (e) { toast(e.message || '删除失败', 'error'); });
            }, '删除文件');
          });
        }
      });
    }).catch(function (e) { toast(e.message || '预览失败', 'error'); });
  }
  function downloadFile(assetId, fileId) {
    var f = findFile(assetId, fileId); if (!f) return;
    API.fileDownloadUrl(S.tableId, assetId, fileId).then(function(url) { var a = document.createElement('a'); a.href=url; a.download=f.name; document.body.appendChild(a); a.click(); document.body.removeChild(a); toast('已下载：' + f.name, 'success'); }).catch(function(e) { toast(e.message || '下载失败', 'error'); });
  }

  /* ------------------------------- 导入 / 导出 ------------------------------- */
  function doExport(ids) {
    if (ids && ids.length === 0) { toast('当前筛选结果为空，没有可导出的记录', 'warn'); return; }
    var url = API.exportUrl(S.tableId, ids && ids.length ? ids : null);
    var a = document.createElement('a'); a.href = url; a.download = (curTable().name || '资产记录') + '.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast('已导出' + (ids && ids.length ? ' ' + ids.length + ' 条' : '全部') + '记录', 'success');
  }
  function importCSV() {
    var input = document.createElement('input'); input.type = 'file'; input.accept = '.csv,.txt';
    input.onchange = function () {
      var file = input.files[0]; if (!file) return;
      API.importCsv(S.tableId, file).then(function (r) {
        var n = (r && r.imported) || 0;
        var linked = (r && r.linked) || 0;
        var miss = (r && r.missing) || [];
        var msg = '导入成功，新增 ' + n + ' 条记录';
        if (linked) msg += '（' + linked + ' 条已自动上架）';
        if (miss.length) msg += '；' + miss.length + ' 条未找到对应机柜，请在机房表新增后重新保存';
        toast(msg, miss.length ? 'warn' : 'success');
        S.page = 1;
        Store.reloadAssets(S.tableId).then(function () { Store.bumpCount(S.tableId); renderAll(); });
      }).catch(function (e) { toast(e.message || '导入失败', 'error'); });
    };
    input.click();
  }

  /* ------------------------------- 字段（列）管理 ------------------------------- */
  /* 机柜联动必需字段：不可删除（后端同样会拒绝） */
  var LOCKED_FIELD_KEYS = ['ip', 'location'];

  function openFieldModal() {
    var fs = curFields().map(function (f) { return clone(f); });
    function bodyHtml() {
      var rows = fs.map(function (f, i) {
        var ty = { text: '文本', number: '数字', select: '下拉', date: '日期', password: '密码', textarea: '多行' }[f.type] || f.type;
        var locked = LOCKED_FIELD_KEYS.indexOf(f.key) >= 0;
        return '<div class="field-row"><input type="checkbox" data-vis="' + i + '"' + (f.visible ? ' checked' : '') + ' title="列表显示">' +
          '<input type="checkbox" data-req="' + i + '"' + (f.required ? ' checked' : '') + ' title="保存时必填"' + (locked ? ' disabled' : '') + '>' +
          '<span class="nm">' + esc(f.title) + '</span><span class="ty">' + ty + '</span>' +
          (locked ? '<span class="lock">必需</span>' : (f.fixed ? '<span class="lock">内置</span>' : '<span class="lock custom">自定义</span>')) +
          '<span class="sp"><button class="icon-link" data-up="' + i + '" title="上移">' + icon('arrowUp') + '</button>' +
          '<button class="icon-link" data-down="' + i + '" title="下移">' + icon('arrowDown') + '</button>' +
          (locked ? '<button class="icon-link" disabled style="opacity:.3" title="机柜联动必需字段，不能删除">' + icon('trash') + '</button>'
                  : '<button class="icon-link" data-del-f="' + i + '">' + icon('trash') + '</button>') + '</span></div>';
      }).join('');
      return '<div class="section-title">列表字段（勾选显示 / 箭头调顺序）</div>' +
        '<div class="hint" style="margin:-4px 0 10px">第二个复选框 = <b>保存时必填</b>。除「业务IP」「存放位置」外，其余字段都可以删除（删除后该列历史数据会一并清理）。</div>' + rows +
        '<div class="nav-sep"></div><div class="section-title">新增自定义列（列名可增长）</div>' +
        '<div class="form-grid"><div class="form-item"><label>列名称</label><input id="nfTitle" placeholder="如：维保到期、所属业务"></div>' +
        '<div class="form-item"><label>字段类型</label><select id="nfType"><option value="text">文本</option><option value="number">数字</option><option value="select">下拉选择</option><option value="date">日期</option><option value="password">密码</option><option value="textarea">多行文本</option></select></div>' +
        '<div class="form-item"><label style="font-weight:500">必填</label><label style="font-weight:400"><input type="checkbox" id="nfReq"> 保存时校验非空</label></div>' +
        '<div class="form-item full"><label>下拉选项（类型为「下拉选择」时填写，逗号分隔）</label><input id="nfOpts" placeholder="如：一级,二级,三级"></div></div>';
    }
    openModal({
      title: '字段与列设置', icon: 'grid', sub: '当前数据表：' + (curTable() ? curTable().name : ''), width: 'wide',
      body: bodyHtml(),
      foot: '<button class="btn" data-close>取消</button><button class="btn primary" data-fsave>保存并应用</button>',
      onMount: function (m) {
        function refresh() { $('.modal-body', m).innerHTML = bodyHtml(); bind(); }
        function bind() {
          $$('[data-up]', m).forEach(function (el) { el.addEventListener('click', function () { var i = +el.getAttribute('data-up'); if (i > 0) { fs.splice(i - 1, 0, fs.splice(i, 1)[0]); refresh(); } }); });
          $$('[data-down]', m).forEach(function (el) { el.addEventListener('click', function () { var i = +el.getAttribute('data-down'); if (i < fs.length - 1) { fs.splice(i + 1, 0, fs.splice(i, 1)[0]); refresh(); } }); });
          $$('[data-del-f]', m).forEach(function (el) { el.addEventListener('click', function () { var i = +el.getAttribute('data-del-f'); confirmBox('删除列', '确定删除列「' + esc(fs[i].title) + '」吗？<br>点「保存并应用」后，该列及所有记录中的这一项数据会一并移除。', function () { fs.splice(i, 1); toast('已标记删除，点「保存并应用」生效', 'success'); refresh(); }, '删除列'); }); });
          $('[data-fsave]', m).addEventListener('click', function () {
            $$('[data-vis]', m).forEach(function (el) { fs[+el.getAttribute('data-vis')].visible = el.checked; });
            $$('[data-req]', m).forEach(function (el) { fs[+el.getAttribute('data-req')].required = el.checked; });
            var t = $('#nfTitle', m).value.trim();
            if (t) {
              var ty = $('#nfType', m).value;
              var opts = $('#nfOpts', m).value.split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
              fs.push({
                key: 'c_' + Date.now(), title: t, type: ty,
                options: opts.length ? opts : undefined, width: 130, visible: true,
                required: !!($('#nfReq', m) && $('#nfReq', m).checked), fixed: false
              });
              toast('已新增列：' + t, 'success');
            }
            API.saveFields(S.tableId, fs).then(function () {
              return Store.loadTable(S.tableId);
            }).then(function () {
              m._close(); renderAll();
              toast('字段设置已保存', 'success');
            }).catch(function (e) { toast(e.message || '保存失败', 'error'); });
          });
        }
        bind();
      }
    });
  }

  /* ------------------------------- 数据表管理 ------------------------------- */
  function openSysModal() {
    function bodyHtml() {
      return Store.getTables().map(function (s, i) {
        var n = (typeof s.count === 'number') ? s.count : 0;
        return '<div class="sys-card" style="display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:12px;padding:13px 15px;margin-bottom:10px"><div class="tdot" style="width:14px;height:14px;border-radius:4px;background:' + s.color + '"></div>' +
          '<div style="flex:1"><div style="font-weight:600">' + esc(s.name) + ' <span style="font-size:11px;color:#94a0b3;background:#f1f2f8;padding:1px 7px;border-radius:6px">' + Store.TYPE_LABELS[s.type] + '</span></div><div style="font-size:12px;color:#94a0b3;margin-top:3px">' + esc(s.description || '') + ' · ' + n + ' 条</div></div>' +
          '<button class="btn sm" data-ren="' + s.id + '">重命名</button><button class="btn sm danger" data-rms="' + s.id + '"' + (Store.getTables().length <= 1 ? ' disabled' : '') + '>删除</button></div>';
      }).join('') +
        '<div class="nav-sep"></div><div class="section-title">新增数据表</div>' +
        '<div class="form-grid"><div class="form-item"><label>表名称</label><input id="nsName" placeholder="如：系统4 · 测试网"></div>' +
        '<div class="form-item"><label>表类型（决定字段模板）</label><select id="nsType"><option value="asset">设备资产表</option><option value="change">硬件更换表</option><option value="custom">空白自定义表</option><option value="rack">机房（机柜图表）</option></select></div>' +
        '<div class="form-item full"><label>说明</label><input id="nsDesc" placeholder="选填"></div></div>';
    }
    function sync(m) {
      return Store.reloadTables().then(function () {
        $('.modal-body', m).innerHTML = bodyHtml(); bind(m);
        renderTableSwitch(); renderSidebar();
      });
    }
    function bind(m) {
      $$('[data-ren]', m).forEach(function (el) { el.addEventListener('click', function () { var s = Store.tableOf(el.getAttribute('data-ren')); var v = prompt('请输入新的表名称', s.name); if (v && v.trim()) { API.renameTable(s.id, v.trim()).then(function () { toast('已重命名', 'success'); return sync(m); }).catch(function (e) { toast(e.message || '重命名失败', 'error'); }); } }); });
      $$('[data-rms]', m).forEach(function (el) { el.addEventListener('click', function () { var sid = el.getAttribute('data-rms'); var s = Store.tableOf(sid); confirmBox('删除数据表', '确定删除「' + esc(s.name) + '」吗？其下 <b>' + ((typeof s.count === 'number') ? s.count : 0) + '</b> 条记录与配置文件将一并删除。', function () {
        API.deleteTable(sid).then(function () {
          Store.clearTableCache(sid);
          toast('数据表已删除', 'success');
          return Store.reloadTables();
        }).then(function () {
          if (S.tableId === sid) {
            var first = Store.getTables()[0];
            S.tableId = first ? first.id : null; S.page = 1; S.selected = {}; S.section = 'all'; S.status = ''; S.expiry = '';
            if (S.tableId) return Store.loadTable(S.tableId);
          }
        }).then(function () {
          $('.modal-body', m).innerHTML = bodyHtml(); bind(m);
          renderTableSwitch(); renderSidebar();
          if (S.tableId) renderAll(); else renderTable();
        }).catch(function (e) { toast(e.message || '删除失败', 'error'); });
      }, '删除数据表'); }); });
      $('[data-sadd]', m).addEventListener('click', function () {
        var name = $('#nsName', m).value.trim(); if (!name) { toast('请填写表名称', 'error'); return; }
        var type = $('#nsType', m).value;
        var nt = null;   // 必须在闭包外层持有：.then 链后续回调还要用它
        API.createTable(name, type, $('#nsDesc', m).value.trim() || '新数据表', ['#4f46e5', '#0ea5e9', '#f59e0b', '#10b981'][Store.getTables().length % 4]).then(function (r) {
          nt = r || {};
          toast('已新增数据表：' + name, 'success');
          return Store.reloadTables();
        }).then(function () {
          return Store.loadTable(nt.id);
        }).then(function () {
          if (!nt.id) { toast('新增失败：服务端未返回新表 ID', 'error'); return; }
          S.tableId = nt.id; S.page = 1; S.selected = {}; S.section = 'all'; S.status = '';
          m._close(); renderAll();
          toast('已切换到新表：' + name, 'success');
        }).catch(function (e) { toast(e.message || '新增失败', 'error'); });
      });
    }
    openModal({
      title: '新建 / 管理数据表', icon: 'layers', sub: '各表数据完全隔离，互不混放', width: 'wide',
      body: bodyHtml(), foot: '<button class="btn" data-close>关闭</button><button class="btn primary" data-sadd>新增数据表</button>',
      onMount: function (m) { bind(m); }
    });
  }

  /* ------------------------------- 数据备份 / 恢复 ------------------------------- */
  function openBackupModal() {
    openModal({
      title: '数据备份 / 恢复', icon: 'db', width: 'wide',
      sub: '备份包含全部数据表、记录与附件，请妥善保管备份文件',
      body:
        '<div class="section-card"><div class="section-title">① 下载备份（建议定期执行）</div>' +
        '<div class="hint">导出一个 zip 包，内含 data.json（全部数据）与 uploads/（全部附件）。可用于换机迁移、定期归档。</div>' +
        '<div style="margin-top:12px"><button class="btn primary" data-bkdown>' + icon('download') + '下载备份文件</button></div></div>' +
        '<div class="section-card"><div class="section-title">② 从备份恢复</div>' +
        '<div class="hint" style="color:#b91c1c">⚠ 恢复会<b>清空并覆盖</b>当前全部数据。为防误操作，系统会在恢复前自动把当前数据另存到 backups/ 目录。</div>' +
        '<div class="form-item full" style="margin-top:10px"><label>选择备份文件（.zip）</label><input type="file" id="bkFile" accept=".zip"></div>' +
        '<div style="margin-top:10px"><button class="btn danger" data-bkrestore>' + icon('upload') + '开始恢复</button></div></div>',
      foot: '<button class="btn" data-close>关闭</button>',
      onMount: function (m) {
        var down = $('[data-bkdown]', m);
        if (down) down.addEventListener('click', function () {
          API.backupUrl().then(function(url) { var a=document.createElement('a'); a.href=url; a.download='资产备份.zip'; document.body.appendChild(a); a.click(); document.body.removeChild(a); toast('备份已开始下载', 'success'); }).catch(function(e) { toast(e.message || '备份失败', 'error'); });
        });
        var up = $('[data-bkrestore]', m);
        if (up) up.addEventListener('click', function () {
          var f = $('#bkFile', m);
          if (!f || !f.files || !f.files[0]) { toast('请先选择备份文件', 'error'); return; }
          var file = f.files[0];
          confirmBox('从备份恢复', '将用「' + esc(file.name) + '」<b>覆盖</b>当前全部数据，且不可撤销（系统会自动留存一份当前数据）。确认继续？', function () {
            toast('正在恢复，请稍候…', 'warn');
            API.restore(file).then(function (r) {
              var n = (r && r.restored) || {};
              toast('恢复完成：' + (n.assets || 0) + ' 条记录 / ' + (n.files || 0) + ' 个附件，页面即将刷新', 'success');
              // 恢复后缓存与表 id 全部失效，直接刷新页面最可靠
              setTimeout(function () { location.reload(); }, 1200);
            }).catch(function (e) { toast(e.message || '恢复失败', 'error'); });
          }, '确认恢复');
        });
      }
    });
  }

  /* ------------------------------- 批量修改 ------------------------------- */
  function openBulkModal() {
    var ids = Object.keys(S.selected); if (!ids.length) { toast('请先勾选要修改的记录', 'warn'); return; }
    var fields = curFields().filter(function (f) { return f.key !== 'id'; });
    if (!fields.length) { toast('当前数据表还没有任何字段，请先在「字段设置」中添加', 'warn'); return; }
    function valControl(f) {
      if (f.type === 'select') return '<select id="bkVal"><option value="">— 清空该字段 —</option>' + (f.options || []).map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('') + '</select>';
      if (f.type === 'textarea') return '<textarea id="bkVal" placeholder="输入新值（留空则清空）"></textarea>';
      var ty = f.type === 'date' ? 'date' : (f.type === 'number' ? 'number' : 'text');
      return '<input type="' + ty + '" id="bkVal" placeholder="输入新值（留空则清空）">';
    }
    var body = '<div class="form-item full"><label>要修改的字段</label><select id="bkField">' + fields.map(function (f) { return '<option value="' + esc(f.key) + '">' + esc(f.title) + '</option>'; }).join('') + '</select></div>' +
      '<div class="form-item full"><label>新值</label><div id="bkValWrap">' + valControl(fields[0]) + '</div></div>' +
      '<div class="hint">将统一应用到选中的 <b>' + ids.length + '</b> 条记录（留空表示清空该字段）</div>';
    openModal({
      title: '批量修改', icon: 'edit', sub: '共 ' + ids.length + ' 条', width: 'narrow',
      body: body,
      foot: '<button class="btn" data-close>取消</button><button class="btn primary" data-bksave>应用修改</button>',
      onMount: function (m) {
        $('#bkField', m).addEventListener('change', function () {
          var sel = this, f = fields.filter(function (x) { return x.key === sel.value; })[0];
          if (!f) return;
          $('#bkValWrap', m).innerHTML = valControl(f);
        });
        $('[data-bksave]', m).addEventListener('click', function () {
          var k = $('#bkField', m).value, f = fields.filter(function (x) { return x.key === k; })[0], v = $('#bkVal', m).value;
          if (f && f.type !== 'select' && f.required && v.trim() === '') { toast('必填字段不能清空', 'error'); return; }
          API.bulkUpdate(S.tableId, ids, k, v).then(function () {
            toast('已更新 ' + ids.length + ' 条记录的「' + (f ? f.title : k) + '」', 'success'); m._close();
            Store.reloadAssets(S.tableId).then(function () { renderTable(); });
          }).catch(function (e) { toast(e.message || '更新失败', 'error'); });
        });
      }
    });
  }

  /* ------------------------------- 切换数据表 ------------------------------- */
  function switchTable(tid) {
    if (tid === S.tableId) { $('#tsMenu').classList.add('hidden'); return; }
    var prev = S.tableId;
    S.tableId = tid; S.page = 1; S.selected = {}; S.section = 'all'; S.status = ''; S.expiry = '';
    // 列筛选 / 排序 / 关键字属于上一张表的上下文，必须清掉，否则会静默作用到新表
    S.filters = {}; S.sortKey = ''; S.sortDir = 1; S.keyword = '';
    var gs = $('#globalSearch'); if (gs) gs.value = '';
    Store.loadTable(tid).then(function () { renderAll(); $('#tsMenu').classList.add('hidden'); })
      .catch(function (e) {
        S.tableId = prev;   // 加载失败回退，避免后续操作打到错误的表
        toast(e.message || '加载失败', 'error');
      });
  }

  /* ------------------------------- 事件绑定 ------------------------------- */
  function init() {
    $('#sidebarToggle').addEventListener('click', function () { document.body.classList.toggle('sidebar-collapsed'); });
    $('#tsBtn').addEventListener('click', function (e) { e.stopPropagation(); $('#tsMenu').classList.toggle('hidden'); });
    document.addEventListener('click', function () { $('#tsMenu').classList.add('hidden'); });
    $('#tsMenu').addEventListener('click', function (e) {
      var it = e.target.closest('[data-tbl]');
      if (it) { switchTable(it.getAttribute('data-tbl')); return; }
      if (e.target.closest('[data-manage]')) openSysModal();
    });

    var timer = null;
    $('#globalSearch').addEventListener('input', function () { clearTimeout(timer); var v = this.value; timer = setTimeout(function () { S.keyword = v; S.page = 1; renderTable(); }, 160); });

    $('#tableNav').addEventListener('click', function (e) { var it = e.target.closest('[data-tbl]'); if (it) switchTable(it.getAttribute('data-tbl')); });
    $('#navList').addEventListener('click', function (e) {
      var c = e.target.closest('[data-cat]'), s = e.target.closest('[data-status]'), x = e.target.closest('[data-expiry]');
      if (c) { S.section = c.getAttribute('data-cat'); S.status = ''; S.expiry = ''; }
      else if (s) { S.status = s.getAttribute('data-status'); S.section = 'all'; S.expiry = ''; }
      else if (x) { var ev = x.getAttribute('data-expiry'); S.expiry = (S.expiry === ev) ? '' : ev; }
      else return;
      S.page = 1; renderSidebar(); renderHead(); renderTable(); renderExpPill();
    });

    $('#btnAdd').addEventListener('click', function () { openAssetModal(null); });
    $('#btnImport').addEventListener('click', importCSV);
    $('#btnExport').addEventListener('click', function () { doExport(filtered().map(function (a) { return a.id; })); });
    $('#btnFields').addEventListener('click', openFieldModal);
    $('#btnRefresh').addEventListener('click', function () {
      Store.reloadTables().then(function () { return Store.reloadAssets(S.tableId); }).then(function () { Store.bumpCount(S.tableId); renderAll(); toast('已刷新', 'success'); }).catch(function (e) { toast(e.message || '刷新失败', 'error'); });
    });
    $('#filterStatus').addEventListener('change', function () { S.status = this.value; S.page = 1; renderTable(); });
    $('#filterCat').addEventListener('change', function () { S.section = this.value; S.page = 1; renderTable(); });
    $('#pageSizeSel').addEventListener('change', function () { S.pageSize = +this.value; S.page = 1; renderTable(); });
    $('#btnReset').addEventListener('click', function () { S.keyword = ''; S.status = ''; S.section = 'all'; S.page = 1; S.expiry = ''; S.filters = {}; $('#globalSearch').value = ''; renderSidebar(); renderHead(); renderTable(); renderExpPill(); });
    $('#btnSysManage').addEventListener('click', openSysModal);
    $('#btnBackup').addEventListener('click', openBackupModal);

    var table = $('#assetTable');
    table.addEventListener('click', function (e) {
      var t = e.target, el;
      if ((el = t.closest('#chkAll'))) { filtered().slice((S.page - 1) * S.pageSize, S.page * S.pageSize).forEach(function (a) { if (el.checked) S.selected[a.id] = true; else delete S.selected[a.id]; }); renderTable(); return; }
      if ((el = t.closest('.chk-row'))) { var id = el.getAttribute('data-id'); if (el.checked) S.selected[id] = true; else delete S.selected[id]; renderTable(); return; }
      if ((el = t.closest('[data-colfilter]'))) { e.stopPropagation(); openColMenu(el.closest('th') || el, el.getAttribute('data-colfilter')); return; }
      if ((el = t.closest('[data-sort]'))) { var k = el.getAttribute('data-sort'); if (curFields().filter(function (f) { return f.key === k; })[0].type === 'password') { toast('密码列不支持排序', 'warn'); return; } if (S.sortKey === k) S.sortDir = -S.sortDir; else { S.sortKey = k; S.sortDir = 1; } renderTable(); return; }
      if ((el = t.closest('[data-edit]'))) { openAssetModal(el.getAttribute('data-edit')); return; }
      if ((el = t.closest('[data-detail]'))) { openDetail(el.getAttribute('data-detail')); return; }
      if ((el = t.closest('[data-files]'))) { openFiles(el.getAttribute('data-files')); return; }
      if ((el = t.closest('[data-del]'))) {
        var did = el.getAttribute('data-del'), target = null, ll = curAssets(); for (var i = 0; i < ll.length; i++) if (ll[i].id === did) target = ll[i];
        confirmBox('删除记录', '确定删除记录「' + esc(target ? (target[primaryKey()] || did) : did) + '」吗？其配置文件将一并删除。', function () {
          API.deleteAsset(S.tableId, did).then(function () { delete S.selected[did]; toast('记录已删除', 'success'); Store.reloadAssets(S.tableId).then(function () { Store.bumpCount(S.tableId); renderAll(); }); }).catch(function (e) { toast(e.message || '删除失败', 'error'); });
        }, '删除记录'); return;
      }
      if ((el = t.closest('[data-pwd]'))) { var pid = el.getAttribute('data-pwd'); S.showPwd[pid] = !S.showPwd[pid]; renderTable(); return; }
      if ((el = t.closest('[data-copy]'))) { copyText(el.getAttribute('data-copy')); return; }
      var rowEl = t.closest('tr[data-id]'); if (rowEl) { openAssetModal(rowEl.getAttribute('data-id')); return; }
    });

    $('#pager').addEventListener('click', function (e) { var b = e.target.closest('[data-page]'); if (b && !b.disabled) { S.page = +b.getAttribute('data-page'); renderTable(); } });

    $('#bulkDelete').addEventListener('click', function () { var ids = Object.keys(S.selected); if (!ids.length) return; confirmBox('批量删除', '确定删除选中的 <b>' + ids.length + '</b> 条记录吗？此操作不可恢复。', function () { API.bulkDelete(S.tableId, ids).then(function () { S.selected = {}; toast('已删除 ' + ids.length + ' 条', 'success'); Store.reloadAssets(S.tableId).then(function () { Store.bumpCount(S.tableId); renderAll(); }); }).catch(function (e) { toast(e.message || '删除失败', 'error'); }); }, '批量删除'); });
    $('#bulkExport').addEventListener('click', function () { var ids = Object.keys(S.selected); if (!ids.length) { toast('请先选择记录', 'warn'); return; } doExport(ids); });
    $('#bulkModify').addEventListener('click', openBulkModal);
    $('#bulkPrint').addEventListener('click', function () {
      var list = curAssets().filter(function (a) { return S.selected[a.id]; });
      if (!list.length) { toast('请先勾选要打印的记录', 'warn'); return; }
      if (!window.Print) { toast('标签打印模块未加载', 'error'); return; }
      window.Print.openLabelPrint(list);
    });
    $('#bulkCancel').addEventListener('click', function () { S.selected = {}; renderTable(); });

    $('#filterChips').addEventListener('click', function (e) {
      var c = e.target.closest('[data-clearfilter]');
      if (c) { delete S.filters[c.getAttribute('data-clearfilter')]; S.page = 1; renderTable(); return; }
      if (e.target.closest('#clearAllFilters')) { S.filters = {}; S.section = 'all'; S.status = ''; S.expiry = ''; S.page = 1; $('#filterStatus').value = ''; $('#filterCat').value = ''; renderSidebar(); renderTable(); renderExpPill(); }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('#colMenu') && !e.target.closest('[data-colfilter]')) closeColMenu(); });

    /* 启动：加载数据表与默认表数据 */
    $('#tsMenu').classList.add('hidden');
    Store.loadTables().then(function () {
      return Store.ensureTableLoaded(S.tableId);
    }).then(function () {
      renderAll();
      toast('系统已加载 · 顶部可切换「数据表」，点击记录任意位置即可编辑', 'success');
    }).catch(function (e) {
      toast('初始化失败：' + (e.message || e), 'error');
    });
  }

  /* 暴露给 print.js 等扩展模块复用（保持单一实现，避免重复造轮子） */
  window.UX = {
    $: $, $$: $$, esc: esc, icon: icon, toast: toast,
    openModal: openModal, openDrawer: openDrawer, confirmBox: confirmBox,
    fmtSize: fmtSize, API: API, Store: Store, S: S
  };

  window.startAssetUI = init;
})();
