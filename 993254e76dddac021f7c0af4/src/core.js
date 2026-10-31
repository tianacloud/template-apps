/* core.js —— 公共能力：音效、进度、导航、提示、工具函数 */
(function () {
  var MK = (window.MK = window.MK || {});

  /* ---------------- 音效（用浏览器合成音，不需要音频文件） ---------------- */
  var actx = null;
  function ac() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(freq, dur, type, vol, delay) {
    if (!MK.soundOn()) return;
    var c = ac();
    if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol || 0.12, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.1));
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + (dur || 0.1) + 0.03);
  }
  MK.sfx = {
    click: function () { tone(880, 0.07, 'sine', 0.1); },
    pop: function () { tone(1200, 0.06, 'sine', 0.09); tone(700, 0.08, 'sine', 0.06, 0.05); },
    dbl: function () { tone(660, 0.07, 'sine', 0.1); tone(1050, 0.09, 'sine', 0.1, 0.07); },
    right: function () { tone(480, 0.09, 'triangle', 0.09); },
    drop: function () { tone(330, 0.1, 'sine', 0.11); tone(520, 0.12, 'sine', 0.09, 0.07); },
    error: function () { tone(190, 0.16, 'sawtooth', 0.06); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.2, 'sine', 0.11, i * 0.12); }); },
    level: function () { [659, 880].forEach(function (f, i) { tone(f, 0.16, 'square', 0.07, i * 0.1); }); },
    tick: function () { tone(1000, 0.04, 'square', 0.04); }
  };
  var soundOn = true;
  MK.soundOn = function () { return soundOn; };
  MK.setSound = function (on) { soundOn = on; };
  MK.stopAllTimers = function () {
    // 各模块把自己的定时器注册进来，切换页面时统一清理
    (MK._timers || []).forEach(clearInterval);
    (MK._timers || []).forEach(clearTimeout);
    (MK._timeouts || []).forEach(clearTimeout);
    MK._timers = []; MK._timeouts = [];
  };
  MK.addTimer = function (id) { (MK._timers = MK._timers || []).push(id); };
  MK.addTimeout = function (id) { (MK._timeouts = MK._timeouts || []).push(id); };
  MK.later = function (fn, ms) { var id = setTimeout(fn, ms); MK.addTimeout(id); return id; };
  MK.every = function (fn, ms) { var id = setInterval(fn, ms); MK.addTimer(id); return id; };

  /* ---------------- 学习进度（保存在本机浏览器里） ---------------- */
  var data = window.__initialProgress || { learned: false, practice: {}, games: {}, levels: 0, certName: '', stars: 0 };
  function save() {
    window.__saveProgress(JSON.stringify(data));
    renderStars();
    if (MK.renderLevels) MK.renderLevels();
  }
  function renderStars() {
    var el = document.getElementById('starTotal');
    if (el) el.textContent = data.stars;
  }
  MK.progress = {
    get: function () { return data; },
    save: save,
    addStars: function (n) { data.stars += n; save(); },
    /* 一次性奖励：同一个 key 只发一次星 */
    award: function (key, n) {
      if (data.practice[key] || data.games[key]) return false;
      if (n > 0) { data.stars += n; save(); }
      return true;
    },
    markPractice: function (key) { data.practice[key] = true; save(); },
    markGame: function (key, stars) {
      var old = data.games[key] || 0;
      if (stars > old) { data.stars += (stars - old); data.games[key] = stars; save(); }
      else { save(); }
      return old;
    },
    reset: function () {
      data = { learned: false, practice: {}, games: {}, levels: 0, certName: '', stars: 0 };
      save();
    }
  };

  /* ---------------- 工具 ---------------- */
  MK.rand = function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; };
  MK.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  MK.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  MK.el = function (tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  /* 小动画（老浏览器没有 animate 接口时安静降级） */
  MK.anim = function (el, frames, opts) {
    if (!el) return;
    try {
      if (typeof el.animate === 'function') el.animate(frames, opts);
    } catch (e) { /* 忽略 */ }
  };
  MK.cheer = function () {
    return MK.pick(['太棒了！', '真厉害！', '干得漂亮！', '好厉害呀！', '你真棒！', '完美！', '继续加油！']);
  };
  MK.starText = function (n) {
    var s = '';
    for (var i = 0; i < n; i++) s += '⭐';
    for (var j = n; j < 3; j++) s += '☆';
    return s;
  };

  /* ---------------- Toast ---------------- */
  MK.toast = function (msg, kind, ms) {
    var wrap = document.getElementById('toastWrap');
    if (!wrap) return;
    var t = MK.el('div', 'toast ' + (kind || ''), msg);
    wrap.appendChild(t);
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }, ms || 2000);
  };

  /* ---------------- 彩带 ---------------- */
  var COLORS = ['#ff6f9c', '#ffc93c', '#2fd07a', '#2f9bff', '#8a3fd1', '#ff9436'];
  MK.confetti = function (count) {
    var n = count || 60;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var c = MK.el('div', 'confetti');
        c.style.left = Math.random() * 100 + 'vw';
        c.style.top = '-20px';
        c.style.background = COLORS[i % COLORS.length];
        c.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
        c.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(c);
        setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 3600);
      })(i);
    }
  };

  /* ---------------- 右键菜单（练习右击用） ---------------- */
  var menu = null;
  MK.closeMenu = function () {
    if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
    menu = null;
    document.removeEventListener('pointerdown', onDocDown, true);
  };
  function onDocDown(e) {
    if (menu && !menu.contains(e.target)) MK.closeMenu();
  }
  /* items: [{icon,text,act}]  tip: 提示文字 */
  MK.openMenu = function (x, y, items, tip, onPick) {
    MK.closeMenu();
    menu = MK.el('div', 'ctx-menu');
    if (tip) menu.appendChild(MK.el('div', 'menu-tip', tip));
    items.forEach(function (it) {
      var row = MK.el('div', 'ctx-item', '<span>' + it.icon + '</span><span>' + it.text + '</span>');
      row.addEventListener('click', function () {
        MK.closeMenu();
        if (onPick) onPick(it);
      });
      menu.appendChild(row);
    });
    document.body.appendChild(menu);
    // 防止菜单跑出屏幕
    var r = menu.getBoundingClientRect();
    var left = Math.min(x, window.innerWidth - r.width - 8);
    var top = Math.min(y, window.innerHeight - r.height - 8);
    menu.style.left = Math.max(6, left) + 'px';
    menu.style.top = Math.max(6, top) + 'px';
    setTimeout(function () { document.addEventListener('pointerdown', onDocDown, true); }, 0);
    return menu;
  };
  MK.onContext = function (el, handler) {
    el.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      handler(e);
    });
  };

  /* ---------------- 拖拽引擎（鼠标 / 触屏都能用） ---------------- */
  MK.makeDraggable = function (item, opts) {
    opts = opts || {};
    var drag = null;
    item.addEventListener('pointerdown', function (e) {
      if (e.button === 2) return;            // 右键不触发拖拽
      if (item.classList.contains('placed')) return;
      e.preventDefault();
      var r = item.getBoundingClientRect();
      // 留一个占位块，免得其它物品跟着乱跑
      var ph = document.createElement('div');
      ph.className = 'drag-ph';
      ph.style.width = r.width + 'px';
      ph.style.height = r.height + 'px';
      item.parentNode.insertBefore(ph, item);
      drag = { item: item, ox: e.clientX - r.left, oy: e.clientY - r.top, rect: r, home: item.parentNode, ph: ph };
      item.style.width = r.width + 'px';
      item.style.height = r.height + 'px';
      item.classList.add('dragging');
      move(e);
      try { item.setPointerCapture(e.pointerId); } catch (err) {}
      item.addEventListener('pointermove', move);
      item.addEventListener('pointerup', up);
      item.addEventListener('pointercancel', up);
      if (opts.onStart) opts.onStart(item);
    });

    function move(e) {
      if (!drag) return;
      drag.item.style.left = (e.clientX - drag.ox) + 'px';
      drag.item.style.top = (e.clientY - drag.oy) + 'px';
      var zone = zoneAt(e.clientX, e.clientY);
      document.querySelectorAll('.drop-zone.over,.room-bin.over').forEach(function (z) {
        if (z !== zone) z.classList.remove('over');
      });
      if (zone) zone.classList.add('over');
    }

    function up(e) {
      if (!drag) return;
      var item = drag.item, home = drag.home, rect = drag.rect, ph = drag.ph;
      item.removeEventListener('pointermove', move);
      item.removeEventListener('pointerup', up);
      item.removeEventListener('pointercancel', up);
      document.querySelectorAll('.drop-zone.over,.room-bin.over').forEach(function (z) { z.classList.remove('over'); });
      var zone = zoneAt(e.clientX, e.clientY);
      var ok = false;
      if (zone) ok = opts.onDrop ? opts.onDrop(item, zone) : false;
      if (ok) {
        if (ph && ph.parentNode) ph.parentNode.removeChild(ph);
        item.classList.remove('dragging');
        item.style.cssText = '';
        item.classList.add('placed');
        var box = zone.querySelector('.zone-items');
        if (box) box.appendChild(item);
        if (opts.onDone) opts.onDone(item, zone);
      } else {
        // 飞回原位
        item.style.transition = 'left .28s ease, top .28s ease';
        item.style.left = rect.left + 'px';
        item.style.top = rect.top + 'px';
        if (zone && opts.onWrong) opts.onWrong(item, zone);
        setTimeout(function () {
          item.style.transition = '';
          item.classList.remove('dragging');
          item.style.cssText = '';
          if (ph && ph.parentNode) {
            ph.parentNode.insertBefore(item, ph);
            ph.parentNode.removeChild(ph);
          } else if (item.parentNode !== home) {
            home.appendChild(item);
          }
        }, 300);
      }
      drag = null;
    }

    function zoneAt(x, y) {
      var el = document.elementFromPoint(x, y);
      if (!el) return null;
      return el.closest('.drop-zone') || el.closest('.room-bin');
    }
  };

  /* ---------------- 难度（所有游戏三档） ---------------- */
  MK.DIFFS = [
    { key: 'easy',   name: '简单', icon: '🌱', color: '#2fd07a' },
    { key: 'normal', name: '普通', icon: '🌳', color: '#2f9bff' },
    { key: 'hard',   name: '困难', icon: '🔥', color: '#ff6f9c' }
  ];
  MK.diffByKey = function (k) {
    for (var i = 0; i < MK.DIFFS.length; i++) if (MK.DIFFS[i].key === k) return MK.DIFFS[i];
    return MK.DIFFS[1];
  };
  /* 生成难度选择条：onChange(diffKey) */
  MK.diffBar = function (defaultKey, onChange) {
    var bar = MK.el('div', 'diff-bar');
    bar.appendChild(MK.el('span', 'diff-label', '难度'));
    MK.DIFFS.forEach(function (d) {
      var b = MK.el('button', 'diff' + (d.key === defaultKey ? ' active' : ''),
        '<span>' + d.icon + '</span>' + d.name);
      b.setAttribute('data-diff', d.key);
      b.style.setProperty('--dc', d.color);
      b.addEventListener('click', function () {
        bar.querySelectorAll('.diff').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        MK.sfx.click();
        if (onChange) onChange(d.key);
      });
      bar.appendChild(b);
    });
    return bar;
  };

  /* ---------------- 页面导航 ---------------- */
  MK.pages = {};   // 各模块注册进入/离开页面的钩子
  MK.current = 'learn';
  MK.initNav = function () {
    var tabs = document.getElementById('tabs');
    if (!tabs) return;
    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab');
      if (!btn) return;
      MK.go(btn.getAttribute('data-page'));
    });
  };
  MK.go = function (name) {
    if (MK.current && MK.current !== name) {
      var old = MK.pages[MK.current];
      if (old && old.leave) { try { old.leave(); } catch (e) {} }
    }
    MK.stopAllTimers();
    MK.closeMenu();
    MK.current = name;
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-page') === name);
    });
    document.querySelectorAll('.page').forEach(function (p) {
      p.classList.toggle('active', p.id === 'page-' + name);
    });
    var hook = MK.pages[name];
    if (hook && hook.enter) { try { hook.enter(); } catch (e) {} }
    // 页面显示后，容器才有真实宽度，此时重排所有轨道
    if (MK.track && MK.track.refreshAll) {
      MK.track.refreshAll();
      setTimeout(function () { MK.track.refreshAll(); }, 60);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---------------- 顶栏按钮 ---------------- */
  function initTopbar() {
    var sBtn = document.getElementById('soundBtn');
    if (sBtn) sBtn.addEventListener('click', function () {
      MK.setSound(!MK.soundOn());
      sBtn.textContent = MK.soundOn() ? '🔊' : '🔇';
      sBtn.classList.toggle('off', !MK.soundOn());
      if (MK.soundOn()) MK.sfx.click();
    });
    var rBtn = document.getElementById('resetBtn');
    if (rBtn) rBtn.addEventListener('click', function () {
      if (confirm('要清空全部星星和学习记录吗？（会重新开始）')) {
        MK.progress.reset();
        if (MK.resetChallenge) MK.resetChallenge();
        if (MK.resetLearn) MK.resetLearn();
        var certName = document.getElementById('certName');
        if (certName) certName.value = '';
        MK.toast('已清空记录，重新开始吧！', 'warn');
        MK.go('learn');
      }
    });
    // 证书关闭 / 打印
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) {
        var m = document.getElementById('certModal');
        if (m) m.classList.remove('show');
      }
    });
    var pBtn = document.getElementById('printCert');
    if (pBtn) pBtn.addEventListener('click', function () { window.print(); });
    var cName = document.getElementById('certName');
    if (cName) cName.addEventListener('change', function () {
      MK.progress.get().certName = cName.value;
      MK.progress.save();
    });
  }

  MK.showCert = function (stars) {
    var m = document.getElementById('certModal');
    var s = document.getElementById('certStars');
    var d = document.getElementById('certDate');
    var n = document.getElementById('certName');
    var p = MK.progress.get();
    if (s) s.textContent = new Array(stars + 1).join('⭐');
    if (d) d.textContent = '发证日期：' + new Date().toLocaleDateString('zh-CN');
    if (n && p.certName) n.value = p.certName;
    if (m) m.classList.add('show');
    MK.confetti(90);
    MK.sfx.win();
  };

  document.addEventListener('DOMContentLoaded', function () {
    MK.initNav();
    initTopbar();
    renderStars();
  });
})();
