/* ===== 宝贝升级乐园 · 核心 app.js =====
   负责：状态存储 / 星星系统 / 语音 / 路由 / 导航 / 徽章 / 导入导出 / 首页与设置页
*/
(function () {
  'use strict';

  var NS = 'bls_v1';
  var TODAY = function () { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };

  /* ---------- 默认状态 ---------- */
  function defaultState() {
    return {
      version: 1,
      stars: 0,
      createdAt: Date.now(),
      lastLogin: '',
      loginDays: 0,
      settings: { speech: true, rate: 0.9, nick: '小勇士' },
      progress: {
        letters: { mastered: [], best: 0, correct: 0, total: 0 },
        reading: { read: [], correct: 0, total: 0 },
        poems: { read: [], recited: [] },
        cn: { correct: 0, total: 0, kp: {}, wrong: [], fixed: 0 },
        math: { practiced: [], correct: 0, total: 0, kp: {}, wrong: [] },
        english: { units: [], correct: 0, total: 0, cats: {}, wrong: [], fixed: 0 },
        logic: { solved: [], streakBest: 0, correct: 0, total: 0 },
        adventure: { level: 1, cleared: [], best: 0 },
        pet: { visits: 0, cured: 0, tricksLearned: 0, healedTotal: 0 }
      },
      badges: [],
      pets: [],
      activePet: 0,
      custom: { reading: {}, poems: {}, english: {}, math: {} }
    };
  }

  /* ---------- 徽章 ---------- */
  var BADGES = [
    { id: 'first_star', ico: '✨', name: '初次闪耀', desc: '获得第一颗星星', test: function (s) { return s.stars > 0; } },
    { id: 'letters_all', ico: '🔤', name: '字母大师', desc: '掌握全部 26 个字母', test: function (s) { return s.progress.letters.mastered.length >= 26; } },
    { id: 'poem_5', ico: '🎋', name: '小诗仙', desc: '读过 5 首古诗', test: function (s) { return s.progress.poems.read.length >= 5; } },
    { id: 'poem_recite_10', ico: '📜', name: '背诗小达人', desc: '标记会背 10 篇古诗文', test: function (s) { return s.progress.poems.recited.length >= 10; } },
    { id: 'cn_100', ico: '✍️', name: '语文小才子', desc: '语文累计答对 100 题', test: function (s) { return (s.progress.cn && s.progress.cn.correct || 0) >= 100; } },
    { id: 'cn_kp_10', ico: '🎋', name: '古文猎人', desc: '掌握 10 个语文知识点', test: function (s) { var k = (s.progress.cn && s.progress.cn.kp) || {}, n = 0; for (var i in k) { if (k[i].t >= 8 && k[i].c / k[i].t >= 0.8) n++; } return n >= 10; } },
    { id: 'read_5', ico: '📖', name: '爱读书', desc: '读过 5 篇课文', test: function (s) { return s.progress.reading.read.length >= 5; } },
    { id: 'math_20', ico: '🧮', name: '计算小能手', desc: '数学答对 20 题', test: function (s) { return s.progress.math.correct >= 20; } },
    { id: 'math_200', ico: '🧠', name: '数学题霸', desc: '数学累计答对 200 题', test: function (s) { return s.progress.math.correct >= 200; } },
    { id: 'kp_10', ico: '📗', name: '知识点猎人', desc: '掌握 10 个数学知识点', test: function (s) { var k = s.progress.math.kp || {}, n = 0; for (var i in k) { if (k[i].t >= 8 && k[i].c / k[i].t >= 0.8) n++; } return n >= 10; } },
    { id: 'wrong_clear', ico: '🧹', name: '错题清道夫', desc: '把错题本里的题订正掉 20 道', test: function (s) { return (s.progress.math.fixed || 0) >= 20; } },
    { id: 'en_20', ico: '🗽', name: '英语小达人', desc: '英语答对 20 题', test: function (s) { return s.progress.english.correct >= 20; } },
    { id: 'en_100', ico: '🎓', name: '英语题霸', desc: '英语累计答对 100 题', test: function (s) { return s.progress.english.correct >= 100; } },
    { id: 'streak_10', ico: '🔥', name: '连对十题', desc: '逻辑挑战连续答对 10 题', test: function (s) { return s.progress.logic.streakBest >= 10; } },
    { id: 'adv_1', ico: '🏁', name: '首次通关', desc: '闯关冒险通过第 1 关', test: function (s) { return s.progress.adventure.cleared.length >= 1; } },
    { id: 'adv_5', ico: '🏆', name: '五关达人', desc: '闯关冒险通过 5 关', test: function (s) { return s.progress.adventure.cleared.length >= 5; } },
    { id: 'pet_adopt', ico: '🐶', name: '铲屎官上任', desc: '领养一只小宠物', test: function (s) { return (s.pets && s.pets.length > 0); } },
    { id: 'pet_lv5', ico: '🎖️', name: '宠物明星', desc: '任意宠物等级达到 5 级', test: function (s) { return (s.pets || []).some(function (p) { return p.level >= 5; }); } },
    { id: 'pet_skill', ico: '🎓', name: '才艺达人', desc: '宠物学会 3 个把戏', test: function (s) { return (s.pets || []).some(function (p) { return (p.tricks || []).length >= 3; }); } },
    { id: 'pet_travel', ico: '🏖️', name: '旅行家', desc: '带宠物去海边度假', test: function (s) { return (s.pets || []).some(function (p) { return p.beachUntil || (p.album || []).indexOf('海边旅行 🏖️') >= 0; }); } },
    { id: 'pet_cured', ico: '🏥', name: '贴心家长', desc: '带宠物治好 5 次伤病', test: function (s) { return (s.progress.pet.cured || 0) >= 5; } },
    { id: 'pet_multi', ico: '🐾', name: '宠物乐园', desc: '同时养了 2 只宠物', test: function (s) { return (s.pets || []).length >= 2; } },
    { id: 'star_100', ico: '💰', name: '百星富翁', desc: '累计获得 100 颗星星', test: function (s) { return (s.totalEarned || 0) >= 100; } }
  ];

  /* ---------- 状态读写 ---------- */
  var state = defaultState();

  async function load() {
    var raw = await window.progressStore.load();
    if (raw) state = merge(defaultState(), JSON.parse(raw));
    normalizePet();
  }
  function merge(base, obj) {
    if (!obj || typeof obj !== 'object') return base;
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        base[k] = merge(base[k], v);
      } else if (v !== undefined && v !== null) { base[k] = v; }
    });
    return base;
  }
  /* 多宠物迁移：旧存档的 state.pet 并入 state.pets，并补全各字段 */
  function normalizePet() {
    if (!state.pets || !Array.isArray(state.pets)) state.pets = [];
    if (state.pet && state.pets.length === 0) state.pets.push(state.pet);
    delete state.pet;
    if (typeof state.activePet !== 'number') state.activePet = 0;
    if (state.activePet >= state.pets.length) state.activePet = 0;
    state.pets.forEach(function (p) {
      p.items = p.items || []; p.decor = p.decor || []; p.tricks = p.tricks || [];
      p.album = p.album || [];
      if (typeof p.hunger !== 'number') p.hunger = 70;
      if (typeof p.clean !== 'number') p.clean = 70;
      if (typeof p.mood !== 'number') p.mood = 80;
      if (typeof p.health !== 'number') p.health = 100;
      p.injury = p.injury || null; p.sick = !!p.sick; p.cured = p.cured || 0;
      p.lastTick = p.lastTick || Date.now(); p.lastEvent = p.lastEvent || 0;
      p.lastTreasure = p.lastTreasure || 0; p.beachUntil = p.beachUntil || 0;
      p.schoolProgress = p.schoolProgress || 0; p.exp = p.exp || 0; p.level = p.level || 1;
    });
  }
  function activePet() {
    if (!state.pets || !state.pets.length) return null;
    return state.pets[state.activePet] || state.pets[0];
  }
  var saveTimer = null;
  function save(now) {
    clearTimeout(saveTimer);
    if (now) window.progressStore.save(JSON.stringify(state));
    else saveTimer = setTimeout(function () { window.progressStore.save(JSON.stringify(state)); }, 120);
  }

  /* ---------- 小工具 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function uniqPush(arr, v) { if (arr.indexOf(v) < 0) { arr.push(v); return true; } return false; }

  /* ---------- 语音 ---------- */
  var voices = [];
  function loadVoices() { try { voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : []; } catch (e) { voices = []; } }
  if (window.speechSynthesis) {
    loadVoices();
    if (typeof speechSynthesis.onvoiceschanged !== 'undefined') { speechSynthesis.onvoiceschanged = loadVoices; }
  }
  function pickVoice(lang) {
    if (!voices.length) loadVoices();
    var pre = lang.toLowerCase().slice(0, 2);
    var exact = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase(); });
    if (exact.length) return exact[0];
    var near = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(pre) === 0; });
    return near.length ? near[0] : null;
  }
  function speak(text, lang) {
    if (!state.settings.speech) return;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { toast('这台设备暂不支持朗读哦', 'warn'); return; }
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.lang = lang || 'zh-CN';
      u.rate = lang && lang.indexOf('en') === 0 ? 0.85 : (state.settings.rate || 0.9);
      u.pitch = 1.1;
      var v = pickVoice(u.lang);
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { console.warn('朗读失败', e); }
  }

  /* ---------- 提示 / 弹窗 / 特效 ---------- */
  function toast(msg, type) {
    var layer = $('#toast');
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    layer.appendChild(el);
    setTimeout(function () { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 320); }, 1800);
  }
  function confetti(n) {
    var fx = $('#fx'); var colors = ['#FF9EC4', '#7EC8FF', '#FFE066', '#8BE0B0', '#B79CFF', '#FFB27A'];
    n = n || 26;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var d = document.createElement('div');
        d.className = 'confetti';
        d.style.left = Math.random() * 100 + 'vw';
        d.style.top = '-20px';
        d.style.background = colors[i % colors.length];
        d.style.animationDuration = (1.1 + Math.random() * 1.1) + 's';
        d.style.animationDelay = (Math.random() * .35) + 's';
        fx.appendChild(d);
        setTimeout(function () { d.remove(); }, 2800);
      })(i);
    }
  }
  function flyStar(n, fromEl) {
    var box = $('#starBox'); if (!box) return;
    var to = box.getBoundingClientRect();
    var r = fromEl && fromEl.getBoundingClientRect ? fromEl.getBoundingClientRect() : { left: window.innerWidth / 2 - 20, top: window.innerHeight / 2, width: 40, height: 40 };
    var el = document.createElement('div');
    el.className = 'fly-star';
    el.textContent = '+' + n + '⭐';
    el.style.left = (r.left + r.width / 2 - 24) + 'px';
    el.style.top = (r.top + r.height / 2 - 14) + 'px';
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.style.transform = 'translate(' + (to.left + 20 - (r.left + r.width / 2 - 24)) + 'px,' + (to.top + 10 - (r.top + r.height / 2 - 14)) + 'px) scale(.6)';
      el.style.opacity = '0';
    });
    setTimeout(function () { el.remove(); }, 1050);
  }
  function modal(opts) {
    var mask = document.createElement('div');
    mask.className = 'modal-mask';
    var m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = '<h3>' + esc(opts.title || '') + '</h3><div class="m-body"></div><div class="m-actions"></div>';
    var body = $('.m-body', m);
    if (typeof opts.body === 'string') body.innerHTML = opts.body; else if (opts.body) body.appendChild(opts.body);
    var acts = $('.m-actions', m);
    (opts.actions || [{ label: '知道啦', cls: 'primary' }]).forEach(function (a) {
      var b = document.createElement('button');
      b.className = 'btn ' + (a.cls || 'ghost');
      b.textContent = a.label;
      b.onclick = function () { var keep = a.onClick && a.onClick(m); if (!keep) close(); };
      acts.appendChild(b);
    });
    function close() { mask.remove(); }
    mask.appendChild(m);
    mask.addEventListener('click', function (e) { if (e.target === mask && opts.dismissible !== false) close(); });
    $('#modalRoot').appendChild(mask);
    return { el: m, close: close };
  }
  function confirmBox(title, msg, onYes, yesLabel) {
    modal({
      title: title, body: '<p>' + esc(msg) + '</p>',
      actions: [
        { label: '取消', cls: 'ghost' },
        { label: yesLabel || '确定', cls: 'primary', onClick: function () { onYes && onYes(); } }
      ]
    });
  }

  /* ---------- 星星系统 ---------- */
  function awardStars(n, reason, fromEl) {
    if (!n) return;
    state.stars += n;
    state.totalEarned = (state.totalEarned || 0) + n;
    save();
    renderStars(true);
    flyStar(n, fromEl);
    if (reason) toast('+' + n + ' ⭐ ' + reason, 'good');
    checkBadges();
  }
  function spendStars(n, reason) {
    if (state.stars < n) { toast('星星不够啦，去学习赚星星吧！', 'warn'); return false; }
    state.stars -= n; save(); renderStars(true);
    if (reason) toast('花掉 ' + n + ' ⭐ ' + reason);
    return true;
  }
  function renderStars(bump) {
    var c = $('#starCount'); if (!c) return;
    c.textContent = state.stars;
    if (bump) { var b = $('#starBox'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  }
  function checkBadges() {
    var got = [];
    BADGES.forEach(function (b) {
      if (state.badges.indexOf(b.id) < 0 && b.test(state)) { state.badges.push(b.id); got.push(b); }
    });
    if (got.length) {
      save(true); confetti(40);
      modal({
        title: '🎉 解锁新徽章！',
        body: got.map(function (b) { return '<div style="text-align:center;padding:8px"><div style="font-size:52px">' + b.ico + '</div><div style="font-weight:900;font-size:20px">' + esc(b.name) + '</div><div style="color:#6B6486">' + esc(b.desc) + '</div></div>'; }).join(''),
        actions: [{ label: '太棒啦！', cls: 'primary' }]
      });
      speak('恭喜你，解锁新徽章', 'zh-CN');
    }
  }

  /* ---------- 模块注册与路由 ---------- */
  var MODULES = [];
  function registerModule(m) { MODULES.push(m); MODULES.sort(function (a, b) { return (a.order || 50) - (b.order || 50); }); }
  function modByHash(h) {
    for (var i = 0; i < MODULES.length; i++) { if (MODULES[i].hash === h) return MODULES[i]; }
    return null;
  }
  function currentHash() {
    var h = decodeURIComponent(location.hash || '').replace(/^#/, '');
    return h || '/首页';
  }
  function go(hash) { location.hash = '#' + hash; }

  function renderNav() {
    var side = $('#sidebar'), tab = $('#tabbar');
    side.innerHTML = ''; tab.innerHTML = '';
    MODULES.forEach(function (m, i) {
      var a = document.createElement('a');
      a.className = 'nav-item'; a.href = '#' + m.hash; a.dataset.hash = m.hash;
      a.innerHTML = '<span class="nv-ico">' + m.icon + '</span><span>' + esc(m.name) + '</span>';
      side.appendChild(a);
      if (m.id === 'home' || i === MODULES.length - 2) { var s = document.createElement('div'); s.className = 'nav-sep'; side.appendChild(s); }

      var t = document.createElement('a');
      t.className = 'tab-item'; t.href = '#' + m.hash; t.dataset.hash = m.hash;
      t.innerHTML = '<span class="tb-ico">' + m.icon + '</span><span>' + esc(m.short || m.name) + '</span>';
      tab.appendChild(t);
    });
  }
  function markNav(hash) {
    $$('#sidebar .nav-item,#tabbar .tab-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.hash === hash);
    });
    var act = $('#tabbar .tab-item.active');
    if (act && act.scrollIntoView) { try { act.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); } catch (e) { } }
  }

  function route() {
    var h = currentHash();
    var parts = h.split('/').filter(Boolean);      // ['大文豪','3']
    var base = '/' + (parts[0] || '首页');
    var m = modByHash(base) || modByHash('/首页');
    document.body.classList.remove('drawer');
    if (window.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) { } }
    var view = $('#view');
    view.innerHTML = '';
    try {
      m.render(view, parts.slice(1));
    } catch (e) {
      console.error(e);
      view.innerHTML = '<div class="card"><h2>哎呀，这个页面出了点小问题</h2><p style="color:#6B6486">' + esc(e.message) + '</p></div>';
    }
    markNav(m.hash);
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }

  /* ---------- 导入 / 导出 ---------- */
  function exportJSON() {
    var data = JSON.stringify(state, null, 2);
    var blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'baobei-shengji-leyuan-进度.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
    toast('已导出进度备份 📦', 'good');
  }
  function validState(o) {
    return o && typeof o === 'object' && typeof o.stars === 'number' && o.progress && typeof o.progress === 'object' && o.settings && typeof o.settings === 'object';
  }
  function importJSON(file) {
    var fr = new FileReader();
    fr.onload = function () {
      var obj;
      try { obj = JSON.parse(fr.result); } catch (e) { modal({ title: '导入失败', body: '<p>这不是一个有效的 JSON 文件。</p>' }); return; }
      if (!validState(obj)) { modal({ title: '导入失败', body: '<p>文件结构不符合「宝贝升级乐园」的存档格式，已取消导入，原有进度未受影响。</p>' }); return; }
      confirmBox('确认导入？', '导入后当前进度（星星 ' + state.stars + '、宠物、徽章等）将被备份文件覆盖，且无法撤销。确定继续吗？', function () {
        state = merge(defaultState(), obj); normalizePet(); DATA.clearCache();
        save(true); renderStars(true); route();
        toast('进度已恢复 🎉', 'good'); confetti(36);
      }, '覆盖导入');
    };
    fr.readAsText(file, 'utf-8');
  }

  /* ---------- 首页 ---------- */
  function learnModules() { return MODULES.filter(function (m) { return m.id !== 'home' && m.id !== 'settings'; }); }
  function moduleProgressText(m) {
    var p = state.progress;
    switch (m.id) {
      case 'letters': return { txt: '已掌握 ' + p.letters.mastered.length + '/26', pct: p.letters.mastered.length / 26 };
      case 'reading': return { txt: '已读 ' + p.reading.read.length + ' 篇', pct: Math.min(1, p.reading.read.length / 12) };
      case 'poems': {
        var totalPoem = (window.CN_BANK_CATALOG && window.CN_BANK_CATALOG.meta.poemCount) || 109;
        return { txt: '会背 ' + p.poems.recited.length + '/' + totalPoem + ' 篇 · 答对 ' + ((p.cn && p.cn.correct) || 0) + ' 题', pct: Math.min(1, p.poems.recited.length / totalPoem) };
      }
      case 'math': {
        var kp = p.math.kp || {}, n = 0, all = 0;
        for (var i in kp) { all++; if (kp[i].t >= 8 && kp[i].c / kp[i].t >= 0.8) n++; }
        var totalKP = (window.MATH_BANK_CATALOG && window.MATH_BANK_CATALOG.meta.knowledgePoints) || 95;
        return { txt: '答对 ' + p.math.correct + ' 题 · 掌握 ' + n + '/' + totalKP + ' 知识点', pct: Math.min(1, n / totalKP) };
      }
      case 'english': return { txt: '答对 ' + p.english.correct + ' 题', pct: Math.min(1, p.english.correct / 50) };
      case 'logic': return { txt: '最高连对 ' + p.logic.streakBest, pct: Math.min(1, p.logic.streakBest / 10) };
      case 'adventure': return { txt: '已通 ' + p.adventure.cleared.length + ' 关', pct: Math.min(1, p.adventure.cleared.length / 8) };
      case 'pet': {
        var ap = activePet();
        return { txt: ap ? (ap.name + ' Lv.' + ap.level + (state.pets.length > 1 ? '（' + state.pets.length + '只）' : '')) : '还没有小宠物', pct: ap ? Math.min(1, ap.level / 10) : 0 };
      }
      default: return { txt: '', pct: 0 };
    }
  }
  function renderHome(view) {
    var nick = esc(state.settings.nick || '小勇士');
    var html = '';
    html += '<div class="home-hero">' +
      '<div><h1>你好，' + nick + '！👋</h1><p>今天也要开开心心学习，赚满星星喂小狗狗～</p></div>' +
      '<div class="hero-stat">' +
      '<div><b>' + state.stars + '</b><span>⭐ 星星</span></div>' +
      '<div><b>' + state.badges.length + '</b><span>🏅 徽章</span></div>' +
      '<div><b>' + (state.loginDays || 1) + '</b><span>📅 学习天数</span></div>' +
      '</div></div>';

    // 今天要处理：错题订正提醒（有错题才显示）
    var wrongM = (state.progress.math.wrong || []).length;
    var wrongC = ((state.progress.cn && state.progress.cn.wrong) || []).length;
    var wrongE = ((state.progress.english && state.progress.english.wrong) || []).length;
    if (wrongM + wrongC + wrongE > 0) {
      var parts = [];
      if (wrongM) parts.push('数学 ' + wrongM + ' 道');
      if (wrongC) parts.push('语文 ' + wrongC + ' 道');
      if (wrongE) parts.push('英语 ' + wrongE + ' 道');
      html += '<div class="card todo-card" style="margin-top:14px;background:#FFE6F0;border:2px solid #FF9EC4">' +
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
        '<span style="font-size:34px">📕</span>' +
        '<div style="flex:1;min-width:150px"><div style="font-weight:900;font-size:18px">今天要订正：' + parts.join(' · ') + '</div>' +
        '<div class="page-sub">做错的题都在错题本里，订正答对一道 +2⭐</div></div>' +
        (wrongM ? '<a class="btn primary" href="#/数字小分队/wrong">数学错题 →</a>' : '') +
        (wrongC ? '<a class="btn yellow" href="#/诗仙花园/wrong">语文错题 →</a>' : '') +
        (wrongE ? '<a class="btn" style="background:#E4F3FF" href="#/小小外交官/wrong">英语错题 →</a>' : '') +
        '</div></div>';
    }

    // 今天要照顾：宠物状态提醒（有病/伤/饿/脏/不开心才显示）
    var ap = activePet();
    if (ap) {
      var needs = [];
      if (ap.sick) needs.push('生病了，要去宠物医院 🏥');
      if (ap.injury) needs.push('受伤了（' + (ap.injury === 'leg' ? '腿' : ap.injury === 'paw' ? '爪子' : '头') + '），需要处理 🩹');
      if (!ap.sick && !ap.injury && ap.hunger < 30) needs.push('肚子饿了，喂点东西 🥣');
      if (!ap.sick && !ap.injury && ap.clean < 30) needs.push('身上脏了，该洗澡 🛁');
      if (!ap.sick && !ap.injury && ap.mood < 30) needs.push('有点无聊，陪它玩会儿 🎾');
      if (needs.length) {
        html += '<div class="card todo-card" style="margin-top:14px;background:#E6F7FF;border:2px solid #8FD3FF">' +
          '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
          '<span style="font-size:34px">🐶</span>' +
          '<div style="flex:1;min-width:150px"><div style="font-weight:900;font-size:18px">今天要照顾：' + esc(ap.name) + ' · ' + needs.join(' · ') + '</div>' +
          '<div class="page-sub">好好照顾它，它会陪你一起长大～</div></div>' +
          '<a class="btn primary" href="#/宠物养成">去照顾 →</a>' +
          '</div></div>';
      }
    }

    html += '<div class="grid g3" id="homeGrid">';
    var colors = ['#FFE6F0', '#E4F3FF', '#FFF6D9', '#E6FBF0', '#F1EAFF', '#FFEFE2', '#E9F7FF', '#FFECF5'];
    learnModules().forEach(function (m, i) {
      var pr = moduleProgressText(m);
      html += '<div class="mod-card" data-hash="' + m.hash + '" style="background:' + colors[i % colors.length] + '">' +
        '<div><div class="m-ico">' + m.icon + '</div><div class="m-name">' + esc(m.name) + '</div><div class="m-desc">' + esc(m.desc || '') + '</div></div>' +
        '<div><div class="m-desc" style="margin-top:6px">' + esc(pr.txt) + '</div><div class="m-bar"><i style="width:' + Math.round(pr.pct * 100) + '%"></i></div></div>' +
        '</div>';
    });
    html += '</div>';

    html += '<div class="card" style="margin-top:16px">' +
      '<h3>💾 进度备份</h3>' +
      '<p class="page-sub">学习进度保存在云端，可导出备份。</p>' +
      '<div class="btn-row" style="margin-top:10px">' +
      '<button class="btn yellow" id="btnExport">📤 导出 JSON 备份</button>' +
      '<button class="btn ghost" id="btnImport">📥 导入恢复</button>' +
      '<a class="btn ghost" href="#/设置">⚙️ 更多设置</a>' +
      '<input type="file" id="fileImport" accept="application/json,.json" hidden>' +
      '</div></div>';

    html += '<div class="note" style="margin-top:14px">📌 应用内课文 / 题目为<b>示例内容</b>，用于功能演示；正式学习请以学校发放的正版教材为准。家长可在「设置 → 内容管理」里添加自己的内容。</div>';

    view.innerHTML = html;
    $$('#homeGrid .mod-card').forEach(function (c) { c.onclick = function () { go(c.dataset.hash); }; });
    bindBackup(view);
  }
  function bindBackup(root) {
    var be = $('#btnExport', root), bi = $('#btnImport', root), fi = $('#fileImport', root);
    if (be) be.onclick = exportJSON;
    if (bi) bi.onclick = function () { fi.click(); };
    if (fi) fi.onchange = function () { if (fi.files && fi.files[0]) importJSON(fi.files[0]); fi.value = ''; };
  }

  /* ---------- 设置页 ---------- */
  function renderSettings(view) {
    var s = state.settings;
    var html = '<div class="page-head"><h1>⚙️ 设置</h1><span class="page-sub">备份、朗读、内容管理</span></div>';

    html += '<div class="card"><h3>👦 小主人</h3>' +
      '<label class="fl">昵称</label><input type="text" id="inpNick" value="' + esc(s.nick || '') + '" maxlength="10">' +
      '<label class="fl">朗读语速：<span id="rateVal">' + (s.rate || 0.9) + '</span></label>' +
      '<input type="range" id="inpRate" min="0.6" max="1.2" step="0.1" value="' + (s.rate || 0.9) + '" style="width:100%;min-height:44px">' +
      '<div class="btn-row" style="margin-top:10px">' +
      '<button class="btn ' + (s.speech ? 'green' : 'ghost') + '" id="btnSpk">' + (s.speech ? '🔊 朗读已开启' : '🔇 朗读已关闭') + '</button>' +
      '<button class="btn ghost" id="btnTestSpk">试听一下</button>' +
      '<button class="btn primary" id="btnSaveSet">保存</button>' +
      '</div></div>';

    html += '<div class="card" style="margin-top:14px"><h3>💾 备份与恢复</h3>' +
      '<p class="page-sub">导出后可在别的设备导入，星星 / 宠物 / 进度全部带走。</p>' +
      '<div class="btn-row" style="margin-top:10px">' +
      '<button class="btn yellow" id="btnExport">📤 导出 JSON 备份</button>' +
      '<button class="btn ghost" id="btnImport">📥 导入恢复</button>' +
      '<input type="file" id="fileImport" accept="application/json,.json" hidden>' +
      '</div>' +
      '<div class="btn-row" style="margin-top:10px">' +
      '<button class="btn ghost" id="btnReset" style="color:#C0392B">🗑️ 清空全部数据</button>' +
      '</div></div>';

    html += '<div class="card" style="margin-top:14px"><h3>📚 内容管理（家长 / 老师）</h3>' +
      '<div class="note">内置内容为<b>示例</b>。你可以在这里粘贴自定义 JSON，扩充课文、古诗、英语单元、数学题。自定义内容会追加显示在对应年级里。</div>' +
      '<div class="btn-row"><button class="btn ghost sm" id="btnTpl">查看格式模板</button><button class="btn ghost sm" id="btnLoadCur">载入当前自定义内容</button></div>' +
      '<label class="fl">自定义内容 JSON</label>' +
      '<textarea id="taCustom" placeholder=\'{"reading":{"1":[...]},"poems":{"2":[...]},"english":{"3":[...]},"math":{"4":[...]}}\'></textarea>' +
      '<div class="btn-row" style="margin-top:10px"><button class="btn primary" id="btnSaveCustom">保存自定义内容</button>' +
      '<button class="btn ghost" id="btnClearCustom">清空自定义内容</button></div></div>';

    html += '<div class="card" style="margin-top:14px"><h3>ℹ️ 关于</h3>' +
      '<p class="page-sub">宝贝升级乐园 v1.0 · 学习进度保存在云端。<br>示例内容用于功能演示，正式学习请以学校正版教材为准。</p>' +
      '<p class="page-sub">📱 在 iPad / 手机 Safari 里点「分享 → 添加到主屏幕」，就能像 App 一样打开啦。</p></div>';

    view.innerHTML = html;
    bindBackup(view);

    $('#inpRate', view).oninput = function () { $('#rateVal', view).textContent = this.value; };
    $('#btnSpk', view).onclick = function () {
      state.settings.speech = !state.settings.speech; save(true);
      document.body.classList.toggle('mute', !state.settings.speech);
      route();
    };
    $('#btnTestSpk', view).onclick = function () { speak('你好呀，我是宝贝升级乐园', 'zh-CN'); };
    $('#btnSaveSet', view).onclick = function () {
      state.settings.nick = ($('#inpNick', view).value || '小勇士').trim();
      state.settings.rate = parseFloat($('#inpRate', view).value) || 0.9;
      save(true); toast('已保存 ✅', 'good');
    };
    $('#btnReset', view).onclick = function () {
      confirmBox('⚠️ 确认清空？', '将删除星星、宠物、所有学习进度和自定义内容，且无法恢复！建议先导出备份。', function () {
        confirmBox('真的要清空吗？', '这是最后一次确认，点「确定清空」后数据立即删除。', function () {
          state = defaultState(); DATA.clearCache(); dailyLogin(); save(true); renderStars(true); route(); toast('已清空，重新开始啦');
        }, '确定清空');
      }, '我要清空');
    };
    $('#btnTpl', view).onclick = function () {
      modal({
        title: '自定义内容格式模板', body: '<textarea readonly style="min-height:260px">' + esc(DATA.templateJSON()) + '</textarea>' +
          '<p class="page-sub">复制上面的模板，改成自己的内容后粘贴到输入框保存即可。年级用 "1"~"6"。</p>'
      });
    };
    $('#btnLoadCur', view).onclick = function () { $('#taCustom', view).value = JSON.stringify(state.custom, null, 2); };
    $('#btnSaveCustom', view).onclick = function () {
      var t = $('#taCustom', view).value.trim();
      if (!t) { toast('请先粘贴 JSON 内容', 'warn'); return; }
      var o; try { o = JSON.parse(t); } catch (e) { modal({ title: '保存失败', body: '<p>JSON 格式有误：' + esc(e.message) + '</p>' }); return; }
      if (typeof o !== 'object' || Array.isArray(o)) { modal({ title: '保存失败', body: '<p>顶层必须是对象，包含 reading / poems / english / math 等字段。</p>' }); return; }
      ['reading', 'poems', 'english', 'math'].forEach(function (k) { if (o[k] && typeof o[k] === 'object') state.custom[k] = o[k]; });
      save(true); DATA.clearCache(); toast('自定义内容已保存 ✅', 'good');
    };
    $('#btnClearCustom', view).onclick = function () {
      confirmBox('清空自定义内容？', '内置示例内容不受影响。', function () {
        state.custom = { reading: {}, poems: {}, english: {}, math: {} }; save(true); DATA.clearCache(); $('#taCustom', view).value = ''; toast('已清空自定义内容');
      });
    };
  }

  /* ---------- 每日登录 ---------- */
  function dailyLogin() {
    var t = TODAY();
    if (state.lastLogin !== t) {
      state.lastLogin = t;
      state.loginDays = (state.loginDays || 0) + 1;
      save(true);
      setTimeout(function () { awardStars(3, '每日登录奖励'); }, 700);
    }
  }

  /* ---------- 初始化 ---------- */
  async function init() {
    await load();
    document.body.classList.toggle('mute', !state.settings.speech);

    registerModule({ id: 'home', hash: '/首页', name: '首页', short: '首页', icon: '🏠', order: 0, render: renderHome });
    registerModule({ id: 'settings', hash: '/设置', name: '设置', short: '设置', icon: '⚙️', order: 99, render: renderSettings });

    renderNav();
    renderStars(false);

    $('#btnMenu').onclick = function () { document.body.classList.toggle('drawer'); };
    $('#scrim').onclick = function () { document.body.classList.remove('drawer'); };
    $('#btnSpeech').onclick = function () {
      state.settings.speech = !state.settings.speech; save(true);
      document.body.classList.toggle('mute', !state.settings.speech);
      toast(state.settings.speech ? '朗读已开启 🔊' : '朗读已关闭 🔇');
      if (state.settings.speech) speak('朗读打开啦', 'zh-CN'); else if (window.speechSynthesis) speechSynthesis.cancel();
    };
    window.addEventListener('hashchange', route);


    if (!location.hash) location.hash = '#/首页';
    route();
    dailyLogin();
  }

  /* ---------- 对外接口 ---------- */
  window.APP = {
    init: init, go: go, route: route,
    get state() { return state; },
    save: save, speak: speak, toast: toast, modal: modal, confirm: confirmBox, confetti: confetti,
    activePet: activePet, normalizePet: normalizePet,
    awardStars: awardStars, spendStars: spendStars, checkBadges: checkBadges, renderStars: renderStars,
    registerModule: registerModule, badges: BADGES, modules: function () { return MODULES; },
    $: $, $$: $$, esc: esc, shuffle: shuffle, pick: pick, rnd: rnd, uniqPush: uniqPush,
    exportJSON: exportJSON, bindBackup: bindBackup
  };
})();
