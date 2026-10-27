(function () {
  'use strict';
  var D = window.APP_DATA || {};
  var PAIRS = D.PAIRS || [];
  var SERIES = D.SERIES || [];
  var GROUPS = D.GROUPS || [];
  var WALLPAPERS = D.WALLPAPERS || [];
  var TAGS = D.TAGS || [];
  var FAV_KEY = '__web_favs';

  var state = { group: '', keyword: '' };
  var currentPair = null;

  // ---------- 收藏（localStorage） ----------
  function readFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; }
  }
  function writeFavs(a) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(a)); } catch (e) {}
  }
  function favKey(type, id) { return (type === 'wallpaper' ? 'wallpaper' : 'pair') + ':' + id; }
  function isFav(type, id) { return readFavs().indexOf(favKey(type, id)) >= 0; }
  function toggleFav(type, id) {
    var k = favKey(type, id);
    var a = readFavs();
    var i = a.indexOf(k);
    if (i >= 0) a.splice(i, 1); else a.push(k);
    writeFavs(a);
    return i < 0;
  }

  // ---------- 工具 ----------
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function coverOf(pair) {
    return (pair.members && pair.members[0] && pair.members[0].url) || '';
  }

  // ---------- 顶部 tab ----------
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var v = t.getAttribute('data-view');
      tabs.forEach(function (x) { x.classList.remove('is-active'); });
      t.classList.add('is-active');
      document.querySelectorAll('.view').forEach(function (sec) {
        sec.classList.toggle('is-active', sec.id === v);
      });
      if (v === 'fav') renderFav();
      if (v === 'wallpaper') renderWallpaper();
    });
  });

  // ---------- 分类 chips ----------
  var chipsBox = document.getElementById('groupChips');
  function buildChips() {
    chipsBox.innerHTML = '';
    var all = el('button', 'chip is-active', '全部');
    all.setAttribute('data-g', '');
    chipsBox.appendChild(all);
    GROUPS.forEach(function (g) {
      var c = el('button', 'chip', g.name);
      c.setAttribute('data-g', g.groupKey);
      chipsBox.appendChild(c);
    });
    chipsBox.querySelectorAll('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        chipsBox.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('is-active'); });
        c.classList.add('is-active');
        state.group = c.getAttribute('data-g') || '';
        renderHome();
      });
    });
  }

  // ---------- 标签云 ----------
  var tagBox = document.getElementById('tagCloud');
  function buildTags() {
    tagBox.innerHTML = '';
    var seen = {};
    TAGS.forEach(function (dim) {
      (dim.tags || []).forEach(function (t) {
        if (seen[t.name]) return;
        seen[t.name] = 1;
        var e = el('span', 'tag', t.name);
        e.addEventListener('click', function () {
          document.getElementById('searchInput').value = t.name;
          state.keyword = t.name;
          renderHome();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        tagBox.appendChild(e);
      });
    });
  }

  // ---------- 首页 ----------
  var homeGrid = document.getElementById('homeGrid');
  var homeEmpty = document.getElementById('homeEmpty');
  function matchPair(p) {
    if (state.group && p.group !== state.group) return false;
    var kw = state.keyword.trim().toLowerCase();
    if (kw) {
      var hay = (p.title + ' ' + (p.flatTags || []).join(' ') + ' ' + (p.groupName || '')).toLowerCase();
      if (hay.indexOf(kw) < 0) return false;
    }
    return true;
  }
  function renderHome() {
    var list = PAIRS.filter(matchPair);
    homeGrid.innerHTML = '';
    homeEmpty.hidden = list.length > 0;
    list.forEach(function (p) {
      var card = el('div', 'card');
      var imgBox = el('div', 'card__img');
      var img = el('img');
      img.src = coverOf(p);
      img.alt = p.title;
      img.loading = 'lazy';
      imgBox.appendChild(img);
      var fav = el('button', 'card__fav' + (isFav('pair', p.pairId) ? ' is-on' : ''), '♥');
      fav.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var on = toggleFav('pair', p.pairId);
        fav.classList.toggle('is-on', on);
      });
      imgBox.appendChild(fav);
      card.appendChild(imgBox);
      var body = el('div', 'card__body');
      body.appendChild(el('p', 'card__title', p.title));
      var meta = el('div', 'card__meta');
      meta.appendChild(el('span', 'pill', (p.members || []).length + ' 张'));
      meta.appendChild(el('span', 'pill', p.groupName || ''));
      body.appendChild(meta);
      card.appendChild(body);
      card.addEventListener('click', function () { openDetail(p); });
      homeGrid.appendChild(card);
    });
  }

  // ---------- 壁纸 ----------
  var wpGrid = document.getElementById('wpGrid');
  var wpEmpty = document.getElementById('wpEmpty');
  function renderWallpaper() {
    wpGrid.innerHTML = '';
    wpEmpty.hidden = WALLPAPERS.length > 0;
    WALLPAPERS.forEach(function (w) {
      var card = el('div', 'card');
      var imgBox = el('div', 'card__img wp');
      var img = el('img');
      img.src = w.url; img.alt = w.title; img.loading = 'lazy';
      imgBox.appendChild(img);
      var fav = el('button', 'card__fav' + (isFav('wallpaper', w.wallpaperId) ? ' is-on' : ''), '♥');
      fav.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var on = toggleFav('wallpaper', w.wallpaperId);
        fav.classList.toggle('is-on', on);
      });
      imgBox.appendChild(fav);
      card.appendChild(imgBox);
      var body = el('div', 'card__body');
      body.appendChild(el('p', 'card__title', w.title));
      body.appendChild(el('div', 'card__meta', (w.flatTags || []).slice(0, 3).map(function (t) {
        return '<span class="pill">' + t + '</span>';
      }).join('')));
      card.appendChild(body);
      card.addEventListener('click', function () { openImg(w.url); });
      wpGrid.appendChild(card);
    });
  }

  // ---------- 收藏页 ----------
  var favGrid = document.getElementById('favGrid');
  var favEmpty = document.getElementById('favEmpty');
  function renderFav() {
    favGrid.innerHTML = '';
    var favs = readFavs();
    var pairIds = favs.filter(function (k) { return k.indexOf('pair:') === 0; })
      .map(function (k) { return k.slice(5); });
    var wpIds = favs.filter(function (k) { return k.indexOf('wallpaper:') === 0; })
      .map(function (k) { return k.slice(10); });
    var pairs = PAIRS.filter(function (p) { return pairIds.indexOf(p.pairId) >= 0; });
    var wps = WALLPAPERS.filter(function (w) { return wpIds.indexOf(w.wallpaperId) >= 0; });
    favEmpty.hidden = (pairs.length + wps.length) > 0;

    pairs.forEach(function (p) { favGrid.appendChild(buildPairCard(p)); });
    wps.forEach(function (w) {
      var c = el('div', 'card');
      var box = el('div', 'card__img wp');
      var img = el('img'); img.src = w.url; img.alt = w.title; img.loading = 'lazy';
      box.appendChild(img);
      c.appendChild(box);
      var body = el('div', 'card__body');
      body.appendChild(el('p', 'card__title', w.title));
      c.appendChild(body);
      c.addEventListener('click', function () { openImg(w.url); });
      favGrid.appendChild(c);
    });
  }
  function buildPairCard(p) {
    var card = el('div', 'card');
    var box = el('div', 'card__img');
    var img = el('img'); img.src = coverOf(p); img.alt = p.title; img.loading = 'lazy';
    box.appendChild(img);
    card.appendChild(box);
    var body = el('div', 'card__body');
    body.appendChild(el('p', 'card__title', p.title));
    card.appendChild(body);
    card.addEventListener('click', function () { openDetail(p); });
    return card;
  }

  // ---------- 详情弹层 ----------
  var detailModal = document.getElementById('detailModal');
  var dmTitle = document.getElementById('dmTitle');
  var dmCount = document.getElementById('dmCount');
  var dmTags = document.getElementById('dmTags');
  var dmImgs = document.getElementById('dmImgs');
  var dmFav = document.getElementById('dmFav');
  var dmSave = document.getElementById('dmSave');

  function openDetail(p) {
    currentPair = p;
    dmTitle.textContent = p.title;
    dmCount.textContent = (p.members || []).length + ' 张成套';
    dmTags.innerHTML = '';
    (p.flatTags || []).forEach(function (t) {
      dmTags.appendChild(el('span', 't', t));
    });
    dmImgs.innerHTML = '';
    (p.members || []).forEach(function (m) {
      var img = el('img'); img.src = m.url; img.alt = p.title; img.loading = 'lazy';
      img.addEventListener('click', function () { openImg(m.url); });
      dmImgs.appendChild(img);
    });
    dmFav.classList.toggle('is-on', isFav('pair', p.pairId));
    dmFav.textContent = isFav('pair', p.pairId) ? '♥ 已收藏' : '♥ 收藏';
    detailModal.hidden = false;
  }
  dmFav.addEventListener('click', function () {
    if (!currentPair) return;
    var on = toggleFav('pair', currentPair.pairId);
    dmFav.classList.toggle('is-on', on);
    dmFav.textContent = on ? '♥ 已收藏' : '♥ 收藏';
    renderHome();
  });
  dmSave.addEventListener('click', function () {
    if (!currentPair) return;
    var src = coverOf(currentPair);
    var a = document.createElement('a');
    a.href = src; a.download = currentPair.pairId + '.jpg';
    document.body.appendChild(a); a.click(); a.remove();
  });

  // ---------- 图片放大 ----------
  var imgModal = document.getElementById('imgModal');
  var lightboxImg = document.getElementById('lightboxImg');
  function openImg(src) {
    lightboxImg.src = src;
    imgModal.hidden = false;
  }

  // 关闭弹层
  document.querySelectorAll('[data-close]').forEach(function (e) {
    e.addEventListener('click', function () {
      detailModal.hidden = true;
      imgModal.hidden = true;
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { detailModal.hidden = true; imgModal.hidden = true; }
  });

  // ---------- 搜索 ----------
  var searchInput = document.getElementById('searchInput');
  var t;
  searchInput.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      state.keyword = searchInput.value;
      renderHome();
    }, 200);
  });

  // ---------- 初始化 ----------
  buildChips();
  buildTags();
  renderHome();
})();
