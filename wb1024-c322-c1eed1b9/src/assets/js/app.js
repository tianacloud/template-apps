/* 季节食用指南 — 应用逻辑 */
(function () {
  var CATS = [
    { k: 'veg',   name: '应季蔬菜',   icon: '🥬' },
    { k: 'fruit', name: '应季水果',   icon: '🍎' },
    { k: 'meat',  name: '肉禽蛋奶',   icon: '🍖' },
    { k: 'shell', name: '虾蟹贝类',   icon: '🦀' },
    { k: 'fish',  name: '鱼鲜海味',   icon: '🐟' },
    { k: 'snack', name: '小吃·时令限定', icon: '🥣' },
    { k: 'wild',  name: '山珍野味',   icon: '🍄' }
  ];
  var REGIONS = ['全国', '华北', '东北', '华东', '华中', '华南', '西南', '西北'];
  var ALL_REGIONS = ['华北', '东北', '华东', '华中', '华南', '西南', '西北'];
  var MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  var SEASON_OF = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
  var SEASON_CN = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
  var SOLAR = [
    '小寒大寒 · 一年最冷，宜温补藏精，腊味、冬笋、根茎菜当家',
    '立春雨水 · 春意萌动，咬春尝鲜，头刀韭与荠菜初上',
    '惊蛰春分 · 草木萌发，春菜最嫩，香椿春笋正当季',
    '清明谷雨 · 雨前香椿嫩如丝，清明螺赛过鹅',
    '立夏小满 · 尝三新（樱桃青梅麦子），槐花杨梅陆续登场',
    '芒种夏至 · 梅雨连绵，粽香与杨梅齐来，新麦上场',
    '小暑大暑 · 入伏吃面，莲子荷叶解暑，三伏羊汤进补',
    '立秋处暑 · 贴秋膘，莲藕菱角鸡头米初上，西瓜渐退',
    '白露秋分 · 9 月开海，蟹肥菊黄，菌菇与秋果最盛',
    '寒露霜降 · 秋收冬藏，板栗红薯柿子飘香，蟹正肥',
    '立冬小雪 · 进补开胃，白菜萝卜登场，腊味开始晾晒',
    '大雪冬至 · 数九寒天，冬捕、腊味、汤圆饺子暖身'
  ];
  var TIP_ICON = { spring: '🌱', summer: '🌊', autumn: '🍂', winter: '❄️' };

  // ---------- 数据装配 ----------
  var RAW = [].concat(
    window.DATA_VEG || [], window.DATA_FRUIT || [], window.DATA_MEAT || [],
    window.DATA_SHELL || [], window.DATA_FISH || [], window.DATA_SNACK || [], window.DATA_WILD || []
  );
  var ITEMS = RAW.map(function (x, i) {
    var r = x.r;
    if (!Array.isArray(r)) r = (r === '全国') ? ALL_REGIONS.slice() : [r];
    if (r.indexOf('全国') >= 0) r = ALL_REGIONS.slice();
    return {
      id: 'f' + i, n: x.n, c: x.c, m: x.m, r: r, d: x.d, p: x.p,
      e: (Array.isArray(x.e) ? x.e : [x.e]).filter(Boolean), w: x.w
    };
  });

  // ---------- 状态 ----------
  var now = new Date().getMonth(); // 0-11
  var S = { month: now, region: '全国', cat: 'all', q: '', favOnly: false };
  var FAV = {};
  try { FAV = JSON.parse(localStorage.getItem('sfg_fav') || '{}'); } catch (e) { FAV = {}; }

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ---------- 顶部控件 ----------
  function buildMonthBar() {
    var h = '';
    for (var i = 0; i < 12; i++) {
      h += '<button class="month-btn' + (i === S.month ? ' active' : '') + '" data-m="' + i + '">' +
        '<span class="mn">' + (i + 1) + '月</span><span class="ms">' + SEASON_CN[SEASON_OF[i]] + '</span></button>';
    }
    $('monthBar').innerHTML = h;
    $('monthBar').querySelectorAll('.month-btn').forEach(function (b) {
      b.onclick = function () { S.month = +b.dataset.m; syncSeason(); buildMonthBar(); render(); };
    });
  }
  function buildRegionBar() {
    var h = '';
    REGIONS.forEach(function (r) {
      var c = window.regionColor(r);
      h += '<button class="chip' + (r === S.region ? ' active' : '') + '" data-r="' + r + '">' +
        '<span class="dot" style="background:' + c + '"></span>' + r + '</button>';
    });
    $('regionBar').innerHTML = h;
    $('regionBar').querySelectorAll('.chip').forEach(function (b) {
      b.onclick = function () { S.region = b.dataset.r; buildRegionBar(); render(); };
    });
  }
  function buildCatBar() {
    var h = '<button class="chip' + (S.cat === 'all' ? ' active' : '') + '" data-c="all">🍽 全部类别</button>';
    CATS.forEach(function (c) {
      h += '<button class="chip' + (S.cat === c.k ? ' active' : '') + '" data-c="' + c.k + '">' + c.icon + ' ' + c.name + '</button>';
    });
    $('catBar').innerHTML = h;
    $('catBar').querySelectorAll('.chip').forEach(function (b) {
      b.onclick = function () { S.cat = b.dataset.c; buildCatBar(); render(); };
    });
  }
  function syncSeason() {
    var s = SEASON_OF[S.month];
    document.documentElement.setAttribute('data-season', s);
    $('tipIcon').textContent = TIP_ICON[s];
    $('tipText').textContent = SOLAR[S.month];
  }

  // ---------- 筛选 ----------
  function matchRegion(it) {
    if (S.region === '全国') return true;
    return it.r.indexOf(S.region) >= 0;
  }
  function filtered() {
    var q = S.q.trim().toLowerCase();
    return ITEMS.filter(function (it) {
      if (S.favOnly && !FAV[it.n]) return false;
      if (S.cat !== 'all' && it.c !== S.cat) return false;
      var inMonth = (S.favOnly || S.cat !== 'all' || q) ? true : true;
      if (it.m.indexOf(S.month + 1) < 0) return false;
      if (!matchRegion(it)) return false;
      if (q) {
        var hay = (it.n + it.d + it.p + it.w + it.e.join('')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  // ---------- 渲染 ----------
  function cardHTML(it) {
    var isWarn = /禁食|有毒|剧毒|禁捕|保护动物|绝对|⚠/.test(it.w);
    var regions = (it.r.length >= 7) ? ['全国'] : it.r;
    var badges = it.m.slice(0, 4).map(function (mm) { return '<span class="badge">' + mm + '月</span>'; }).join('');
    var rb = regions.slice(0, 2).map(function (r) {
      return '<span class="badge region"><i style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + window.regionColor(r) + ';margin-right:4px"></i>' + r + '</span>';
    }).join('') + (regions.length > 2 ? '<span class="badge region">+' + (regions.length - 2) + '</span>' : '');
    return '<article class="card" data-id="' + it.id + '">' +
      '<div class="fav' + (FAV[it.n] ? ' on' : '') + '" data-fav="' + it.n + '">★</div>' +
      '<div class="card-top"><div class="pic">' + window.foodIcon(it.n, it.c, 66) + '</div>' +
      '<div class="meta"><h3>' + esc(it.n) + '</h3><div class="badges">' + badges + rb + '</div></div></div>' +
      '<p class="card-desc">' + esc(it.d) + (isWarn ? ' <span class="warn-flag">⚠ 有重要提示</span>' : '') + '</p>' +
      '<div class="card-eats">' + it.e.slice(0, 3).map(function (x) { return '<span class="eat">' + esc(x) + '</span>'; }).join('') + '</div>' +
      '<div class="card-foot"><span>点击查看挑选 · 吃法 · 注意</span><span>' + (isWarn ? '⚠' : '›') + '</span></div>' +
      '</article>';
  }

  function render() {
    var list = filtered();
    var monthCount = ITEMS.filter(function (it) { return it.m.indexOf(S.month + 1) >= 0 && matchRegion(it); }).length;
    $('statTotal').textContent = ITEMS.length;
    $('statMonth').textContent = monthCount;
    $('seasonBar').innerHTML = '<span style="font-size:22px">' + TIP_ICON[SEASON_OF[S.month]] + '</span>' +
      '<div><b>' + MONTHS[S.month] + ' · ' + SEASON_CN[SEASON_OF[S.month]] + '季</b> ｜ ' + S.region +
      ' ｜ 共 <b>' + list.length + '</b> 项' + (S.favOnly ? '（收藏夹）' : '') + '<br>' + SOLAR[S.month] + '</div>';

    if (!list.length) {
      $('content').innerHTML = '<div class="empty"><span class="em">🍽</span>没有找到匹配的食材<br>试试切换月份、地区，或清空搜索关键词</div>';
      bindCards(); return;
    }
    var h = '';
    CATS.forEach(function (c) {
      var sub = list.filter(function (it) { return it.c === c.k; });
      if (!sub.length) return;
      h += '<section class="cat-section"><div class="cat-head"><span class="ci">' + c.icon + '</span>' +
        '<h2>' + c.name + '</h2><span class="cnt">' + sub.length + ' 种</span></div>' +
        '<div class="grid">' + sub.map(cardHTML).join('') + '</div></section>';
    });
    $('content').innerHTML = h;
    bindCards();
  }

  function bindCards() {
    document.querySelectorAll('.card').forEach(function (el) {
      el.onclick = function (e) {
        if (e.target.classList.contains('fav')) return;
        openModal(el.dataset.id);
      };
    });
    document.querySelectorAll('.fav').forEach(function (el) {
      el.onclick = function (e) {
        e.stopPropagation();
        var n = el.dataset.fav;
        if (FAV[n]) { delete FAV[n]; } else { FAV[n] = 1; }
        try { localStorage.setItem('sfg_fav', JSON.stringify(FAV)); } catch (err) { }
        el.classList.toggle('on', !!FAV[n]);
        if (S.favOnly) render();
      };
    });
  }

  // ---------- 详情弹窗 ----------
  function openModal(id) {
    var it = ITEMS.filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    var cat = CATS.filter(function (c) { return c.k === it.c; })[0] || { name: '' };
    var isWarn = /禁食|有毒|剧毒|禁捕|保护动物|绝对|⚠/.test(it.w);
    var isTip = /务必|必须|建议|不宜|慎食|少食|忌/.test(it.w) && !isWarn;
    var strip = '';
    for (var i = 1; i <= 12; i++) strip += '<i class="' + (it.m.indexOf(i) >= 0 ? 'on' : '') + '">' + i + '</i>';
    var regions = (it.r.length >= 7) ? ['全国'] : it.r;
    var h = '<button class="modal-close" id="mclose">×</button>' +
      '<div class="modal-hero">' + window.foodIcon(it.n, it.c, 104) +
      '<div><h3>' + esc(it.n) + '</h3><div class="mbadges">' +
      '<span class="badge">' + cat.icon + ' ' + cat.name + '</span>' +
      regions.map(function (r) { return '<span class="badge region">' + r + '</span>'; }).join('') +
      '</div><div style="margin-top:10px;font-size:12px;color:var(--ink-3)">应季月份</div>' +
      '<div class="month-strip">' + strip + '</div></div></div>' +
      '<div class="modal-body">' +
      '<div class="block"><div class="bt">📖 时令简介</div><p>' + esc(it.d) + '</p></div>' +
      '<div class="block tipbox"><div class="bt" style="color:#5b8def">🛒 挑选技巧</div><p>' + esc(it.p) + '</p></div>' +
      '<div class="block"><div class="bt">🍳 推荐吃法</div><ul>' + it.e.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="block ' + (isWarn ? 'warnbox' : (isTip ? 'tipbox' : '')) + '"><div class="bt" style="color:' + (isWarn ? '#e05252' : 'var(--accent)') + '">' +
      (isWarn ? '⚠️ 安全警示' : '📌 食用注意') + '</div><p>' + esc(it.w) + '</p></div>' +
      '</div>';
    $('modal').innerHTML = h;
    $('mask').classList.add('show');
    $('mclose').onclick = closeModal;
    var fb = FAV[it.n] ? '★ 已收藏' : '☆ 收藏';
    var btn = document.createElement('div');
    btn.style.cssText = 'padding:0 24px 22px';
    btn.innerHTML = '<button class="btn" id="mfav" style="width:100%">' + fb + '</button>';
    $('modal').appendChild(btn);
    $('mfav').onclick = function () {
      if (FAV[it.n]) delete FAV[it.n]; else FAV[it.n] = 1;
      try { localStorage.setItem('sfg_fav', JSON.stringify(FAV)); } catch (err) { }
      $('mfav').textContent = FAV[it.n] ? '★ 已收藏' : '☆ 收藏';
      bindCards();
      document.querySelectorAll('.fav').forEach(function (el) { el.classList.toggle('on', !!FAV[el.dataset.fav]); });
    };
  }
  function closeModal() { $('mask').classList.remove('show'); }

  // ---------- 事件 ----------
  $('mask').onclick = function (e) { if (e.target === $('mask')) closeModal(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  var timer;
  $('q').oninput = function () { clearTimeout(timer); timer = setTimeout(function () { S.q = $('q').value; render(); }, 160); };
  $('btnRandom').onclick = function () {
    var pool = ITEMS.filter(function (it) { return it.m.indexOf(S.month + 1) >= 0 && matchRegion(it); });
    if (!pool.length) return;
    openModal(pool[Math.floor(Math.random() * pool.length)].id);
  };
  $('btnFav').onclick = function () {
    S.favOnly = !S.favOnly;
    $('btnFav').textContent = S.favOnly ? '⭐ 收藏中' : '⭐ 我的收藏';
    $('btnFav').classList.toggle('primary', S.favOnly);
    render();
  };
  $('btnPrint').onclick = function () { window.print(); };

  // ---------- 启动 ----------
  (function readURL() {
    var qs = new URLSearchParams(location.search);
    var m = parseInt(qs.get('m'), 10);
    if (m >= 1 && m <= 12) S.month = m - 1;
    var r = qs.get('r');
    if (r && REGIONS.indexOf(r) >= 0) S.region = r;
    var c = qs.get('c');
    if (c && CATS.some(function (x) { return x.k === c; })) S.cat = c;
    var q = qs.get('q');
    if (q) { S.q = q; $('q').value = q; }
    window.__openName = qs.get('open') || '';
  })();
  syncSeason();
  buildMonthBar(); buildRegionBar(); buildCatBar();
  render();
  if (window.__openName) {
    var key = window.__openName;
    var hit = ITEMS.filter(function (it) { return it.n === key || it.n.indexOf(key) >= 0 || key.indexOf(it.n) >= 0; })[0];
    if (hit) openModal(hit.id);
  }
})();
