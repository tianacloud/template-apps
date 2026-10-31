/* practice.js —— 五项基本操作练习：移动 / 单击 / 双击 / 右击 / 拖拽
 *
 * 交互：默认只显示入口卡片；点"开始练习"后展开并置顶到第一位，
 * 点其它练习时，上一个自动收起并回到初始状态。
 */
(function () {
  var MK = window.MK;

  /* ---------------- 移动：沿轨道运笔 ---------------- */
  function buildMove(stage, api) {
    var total = 2, done = 0;
    stage.innerHTML = '<div class="track-list"></div>';
    var list = stage.querySelector('.track-list');
    var shapes = [MK.track.SHAPES[1], MK.track.SHAPES[2]];

    shapes.forEach(function (shape, i) {
      var box = MK.el('div', 'track-box',
        '<div class="track-name">' + (i + 1) + '. ' + shape.name + '</div>' +
        '<div class="track-canvas"></div>' +
        '<div class="track-status">把光标（小箭头）移到<b>绿色圆点</b>上，按住左键不放，沿着灰色的路一直走到 🚩</div>');
      list.appendChild(box);
      var canvas = box.querySelector('.track-canvas');
      var status = box.querySelector('.track-status');
      var finished = false;

      MK.track.create(canvas, shape, {
        height: 150,
        lane: 42,
        threshold: 40,
        onStart: function () { status.innerHTML = '很好！<b>按住左键别松开</b>，慢慢沿路走～'; },
        onMiss: function () { status.innerHTML = '先把光标移到<b>绿色圆点</b>上，再按住左键哦。'; MK.sfx.tick(); },
        onFail: function () { status.innerHTML = '哎呀，跑出路面了！回到绿色圆点再来一次～'; MK.sfx.error(); },
        onPause: function () { status.innerHTML = '松手啦，重新按住小圆点继续往前走。'; },
        onDone: function () {
          if (finished) return;
          finished = true;
          status.innerHTML = '✅ 顺利到达终点！' + MK.cheer();
          status.classList.add('ok');
          MK.sfx.win();
          done++;
          api.progress(done, total);
          if (done === total) MK.later(api.finish, 300);
        }
      });
    });
    api.progress(0, total);
  }

  /* ---------------- 单击：戳泡泡 ---------------- */
  function buildClick(stage, api) {
    var total = 12, done = 0;
    var faces = ['🫧', '🎈', '⭐', '🍎', '🐟', '🌸', '☁️', '🍭', '🐣', '🍓'];
    var hues = ['#ff6f9c', '#2f9bff', '#2fd07a', '#ffc93c', '#8a3fd1', '#ff9436'];
    stage.innerHTML = '';
    var wrap = MK.el('div', 'bubble-stage');
    stage.appendChild(wrap);

    MK.shuffle(faces.concat(faces)).slice(0, total).forEach(function (f, i) {
      var c = hues[i % hues.length];
      var b = MK.el('div', 'bubble', f);
      b.style.background = 'radial-gradient(circle at 32% 28%, #ffffff, ' + c + '55 45%, ' + c + '99)';
      b.style.border = '2px solid ' + c;
      b.style.animationDelay = (i * 0.13) + 's';
      var popped = false;
      b.addEventListener('click', function () {
        if (popped) return;
        popped = true;
        MK.sfx.pop();
        b.classList.add('pop');
        done++;
        api.progress(done, total);
        if (done === total) MK.later(api.finish, 320);
      });
      wrap.appendChild(b);
    });
    api.progress(0, total);
  }

  /* ---------------- 双击：开宝箱 ---------------- */
  function bindDouble(el, onDouble, hint) {
    var last = 0, hinted = false;
    el.addEventListener('click', function () {
      var now = Date.now();
      if (now - last < 450) {
        last = 0;
        onDouble();
      } else {
        last = now;
        if (!hinted) { hinted = true; MK.toast(hint || '双击要又快又稳地连点两下！', 'warn'); }
      }
    });
  }

  function buildDbl(stage, api) {
    var total = 6, done = 0;
    var gifts = ['🐰', '🚀', '🍰', '🐳', '🎸', '🌈'];
    stage.innerHTML = '';
    var wrap = MK.el('div', 'chest-stage');
    stage.appendChild(wrap);

    MK.shuffle(gifts).forEach(function (g, i) {
      var c = MK.el('div', 'chest',
        '<span class="gift">' + g + '</span>' +
        '<div class="box">📦</div>' +
        '<div class="hint">双击打开</div>');
      var opened = false;
      bindDouble(c, function () {
        if (opened) return;
        opened = true;
        MK.sfx.dbl();
        c.classList.add('open');
        c.querySelector('.box').textContent = '🎁';
        c.querySelector('.hint').textContent = '打开了！';
        done++;
        api.progress(done, total);
        if (done === total) MK.later(api.finish, 700);
      }, '只点一下不够哦，要<b>快速连点两下</b>左键才是双击！');
      wrap.appendChild(c);
    });
    api.progress(0, total);
  }

  /* ---------------- 右击：快捷菜单 ---------------- */
  function buildRight(stage, api) {
    var total = 4, done = 0;
    var boxes = [
      { icon: '📦', inside: '🐱', name: '小猫' },
      { icon: '🎁', inside: '🐼', name: '熊猫' },
      { icon: '🗃️', inside: '🦊', name: '狐狸' },
      { icon: '🧺', inside: '🐧', name: '企鹅' }
    ];
    stage.innerHTML = '';
    var note = MK.el('p', 'pcard-desc', '对下面的盒子<b>单击鼠标右键</b>（按右边那个键再松开），菜单就出来啦！');
    note.style.marginBottom = '10px';
    stage.appendChild(note);
    var wrap = MK.el('div', 'right-stage');
    stage.appendChild(wrap);

    boxes.forEach(function (b) {
      var box = MK.el('div', 'mbox',
        '<div class="ico">' + b.icon + '</div>' +
        '<div class="lbl">单击右键试试</div>');
      MK.onContext(box, function (e) {
        MK.sfx.right();
        MK.openMenu(e.clientX, e.clientY, [
          { icon: '🔍', text: '打开看看', act: 'open' },
          { icon: '🎵', text: '敲一敲', act: 'knock' },
          { icon: '✏️', text: '改个名字', act: 'rename' }
        ], '你想做什么？', function (it) {
          if (box.classList.contains('done')) return;
          if (it.act === 'open') {
            MK.sfx.drop();
            box.classList.add('done');
            box.querySelector('.ico').textContent = b.inside;
            box.querySelector('.lbl').textContent = '里面是' + b.name + '！';
            done++;
            api.progress(done, total);
            MK.toast('右键菜单用得很熟练！', 'good');
            if (done === total) MK.later(api.finish, 400);
          } else if (it.act === 'knock') {
            MK.sfx.tick();
            MK.anim(box, [{ transform: 'rotate(-8deg)' }, { transform: 'rotate(8deg)' }, { transform: 'none' }], { duration: 300 });
            MK.toast('咚咚咚～试试选"打开看看"。', 'info');
          } else {
            MK.toast('这个按钮先留着以后学，选"打开看看"吧！', 'info');
          }
        });
      });
      wrap.appendChild(box);
    });
    api.progress(0, total);
  }

  /* ---------------- 拖拽：分类收纳 ---------------- */
  function buildDrag(stage, api) {
    var total = 6, done = 0;
    var items = [
      { e: '✏️', n: '铅笔', t: 'stationery' },
      { e: '📏', n: '尺子', t: 'stationery' },
      { e: '📒', n: '本子', t: 'stationery' },
      { e: '🚗', n: '小汽车', t: 'toy' },
      { e: '🧸', n: '小熊', t: 'toy' },
      { e: '⚽', n: '足球', t: 'toy' }
    ];
    stage.innerHTML = '';
    var wrap = MK.el('div', 'drag-wrap',
      '<div class="drag-items"></div>' +
      '<div class="drop-zones">' +
        '<div class="drop-zone" data-accept="stationery"><div class="zone-title">🎒 文具盒</div><div class="zone-items"></div></div>' +
        '<div class="drop-zone" data-accept="toy"><div class="zone-title">🧸 玩具箱</div><div class="zone-items"></div></div>' +
      '</div>');
    stage.appendChild(wrap);
    var pool = wrap.querySelector('.drag-items');

    MK.shuffle(items).forEach(function (it) {
      var el = MK.el('div', 'drag-item', '<div class="di">' + it.e + '</div><div class="dn">' + it.n + '</div>');
      el.setAttribute('data-type', it.t);
      MK.makeDraggable(el, {
        onDrop: function (item, zone) {
          if (zone.getAttribute('data-accept') === item.getAttribute('data-type')) {
            MK.sfx.drop();
            return true;
          }
          MK.sfx.error();
          zone.classList.add('wrong');
          MK.later(function () { zone.classList.remove('wrong'); }, 420);
          MK.toast(item.querySelector('.dn').textContent + '不该放这儿，再看看～', 'warn');
          return false;
        },
        onDone: function () {
          done++;
          api.progress(done, total);
          if (done === total) MK.later(api.finish, 350);
        }
      });
      pool.appendChild(el);
    });
    api.progress(0, total);
  }

  /* ---------------- 练习卡片框架 ---------------- */
  var PRACTICES = [
    {
      key: 'move', badge: '移动', title: '沿轨道运笔', icon: '🛸', bg: '#ede0f5',
      short: '按住左键，沿灰色小路把光标走到红旗，练手眼配合。',
      tip: '<b>移动</b>是鼠标的第一项本领：手贴着桌面慢慢滑动，眼睛盯着屏幕上的小箭头。按住左键沿路走，别跑到路外面去！',
      build: buildMove
    },
    {
      key: 'click', badge: '单击', title: '戳泡泡', icon: '🫧', bg: '#fff0e0',
      short: '单击左键，把 12 个泡泡全部戳破。',
      tip: '把食指放在<b>左键</b>上，按下去马上松开——这就是<b>单击</b>。请把泡泡全部点破！',
      build: buildClick
    },
    {
      key: 'dbl', badge: '双击', title: '开宝箱', icon: '🎁', bg: '#f1ebff',
      short: '快速连点两下左键，打开 6 个宝箱。',
      tip: '<b>双击</b>＝又快又稳地连按两下左键（鼠标不能移动哦）。把 6 个宝箱都打开吧！',
      build: buildDbl
    },
    {
      key: 'right', badge: '右击', title: '快捷菜单', icon: '📋', bg: '#ffeaf1',
      short: '对 4 个盒子单击右键，用快捷菜单打开它们。',
      tip: '按一下<b>右键</b>再松开，会弹出"快捷菜单"。用右键打开 4 个盒子看看里面是什么。',
      build: buildRight
    },
    {
      key: 'drag', badge: '拖拽', title: '分类收纳', icon: '🧺', bg: '#e4fbf0',
      short: '按住左键拖动物品，把文具和玩具送回各自的家。',
      tip: '<b>拖拽</b>＝按住左键不放，移动鼠标，到了目的地再松手。把东西送回各自的家。',
      build: buildDrag
    }
  ];

  var OP_COLOR = { '移动': '#2f9bff', '单击': '#ff9436', '双击': '#8a3fd1', '右击': '#ff6f9c', '拖拽': '#2fd07a' };
  var cards = [];
  var current = null;

  function closeCard(card, silent) {
    if (!card) return;
    card.classList.remove('open', 'done');
    var body = card.querySelector('.pe-body');
    if (body) {
      if (MK.track && MK.track.destroyWithin) MK.track.destroyWithin(body);
      body.innerHTML = '';
    }
    card._built = false;
    card._api = null;
    var btn = card.querySelector('.pe-start');
    if (btn) btn.textContent = '▶ 开始练习';
    if (card === current) current = null;
    renderBadges();
  }

  function closeAll() {
    cards.forEach(function (c) { closeCard(c, true); });
    current = null;
  }

  function renderBadges() {
    var p = MK.progress.get();
    cards.forEach(function (c) {
      var tag = c.querySelector('.pe-badge');
      if (!tag) return;
      var ok = !!p.practice['practice-' + c.getAttribute('data-practice')];
      tag.innerHTML = ok ? '⭐ 已学会' : '未练习';
      tag.classList.toggle('ok', ok);
    });
  }

  function buildBody(card, p) {
    var body = card.querySelector('.pe-body');
    body.innerHTML =
      '<p class="pcard-desc">' + p.tip + '</p>' +
      '<div class="stage"></div>' +
      '<div class="pcard-foot">' +
        '<div class="prog"><div class="prog-bar" style="width:0%"></div><span class="prog-text">0/0</span></div>' +
        '<div class="foot-btns">' +
          '<button class="btn btn-mini btn-again">🔄 再练一次</button>' +
          '<button class="btn btn-ghost btn-back">🔙 收起，选别的</button>' +
        '</div>' +
      '</div>';
    var stage = body.querySelector('.stage');
    var bar = body.querySelector('.prog-bar');
    var txt = body.querySelector('.prog-text');

    var api = {
      progress: function (v, t) {
        bar.style.width = (t ? (v / t * 100) : 0) + '%';
        txt.textContent = v + '/' + t;
      },
      finish: function () {
        card.classList.add('done');
        MK.confetti(40);
        MK.sfx.win();
        if (MK.progress.award('practice-' + p.key, 1)) {
          MK.progress.markPractice('practice-' + p.key);
          MK.toast(p.badge + '练习完成！获得 1 颗星 ⭐ ' + MK.cheer(), 'good', 3200);
        } else {
          MK.toast(p.badge + '又练了一遍，' + MK.cheer(), 'good');
        }
        renderBadges();
        var tip = MK.el('div', 'gresult show', '🎉 全部完成！' + p.badge + '操作你已经学会啦！');
        body.insertBefore(tip, body.querySelector('.pcard-foot'));
        MK.later(function () { if (tip.parentNode) tip.parentNode.removeChild(tip); }, 4000);
      }
    };
    card._api = api;
    card._stage = stage;

    body.querySelector('.btn-again').addEventListener('click', function () {
      card.classList.remove('done');
      var old = body.querySelector('.gresult');
      if (old) old.remove();
      start(card, p);
    });
    body.querySelector('.btn-back').addEventListener('click', function () { closeCard(card); });
    return api;
  }

  function start(card, p) {
    var api = card._api || buildBody(card, p);
    p.build(card._stage, api);
    // 轨道必须有真实宽度才画得准，展开后补一次重排
    if (MK.track && MK.track.refreshAll) setTimeout(MK.track.refreshAll, 30);
  }

  function openCard(card, p) {
    if (current === card) return;
    closeAll();                       // 切换到其它练习时，上一个回到初始状态
    current = card;
    card.classList.add('open');
    var btn = card.querySelector('.pe-start');
    if (btn) btn.textContent = '✔ 正在练习';
    card._built = true;
    buildBody(card, p);
    start(card, p);
    try { card.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }

  function buildCard(p) {
    var color = OP_COLOR[p.badge] || '#ff9436';
    var card = MK.el('div', 'card pcard');
    card.setAttribute('data-practice', p.key);
    card.style.setProperty('--pc', color);
    card.innerHTML =
      '<div class="pe-entry">' +
        '<div class="pe-icon" style="background:' + p.bg + '">' + p.icon + '</div>' +
        '<div class="pe-main">' +
          '<h3>' + p.title + '<span class="op-badge" style="background:' + color + '">' + p.badge + '</span></h3>' +
          '<p>' + p.short + '</p>' +
        '</div>' +
        '<div class="pe-go">' +
          '<span class="pe-badge">未练习</span>' +
          '<button class="btn btn-primary pe-start">▶ 开始练习</button>' +
        '</div>' +
      '</div>' +
      '<div class="pe-body"></div>';

    card.querySelector('.pe-entry').addEventListener('click', function () {
      if (card.classList.contains('open')) return;
      MK.sfx.click();
      openCard(card, p);
    });
    cards.push(card);
    return card;
  }

  function init() {
    var grid = document.getElementById('practiceGrid');
    if (!grid) return;
    cards = [];
    PRACTICES.forEach(function (p) { grid.appendChild(buildCard(p)); });
    renderBadges();

    MK.pages.practice = {
      enter: function () { renderBadges(); },
      leave: function () { closeAll(); }   // 离开本页 → 全部回到初始状态
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
