/* challenge.js —— 综合挑战关：五关混合任务 + 证书 */
(function () {
  var MK = window.MK;
  var cur = 0, currentStop = null;

  /* ---------- 第 1 关：移动 ---------- */
  function lvlMove(stage, api) {
    var total = 2, done = 0;
    stage.innerHTML = '<div class="track-list"></div>';
    var list = stage.querySelector('.track-list');
    [MK.track.SHAPES[1], MK.track.SHAPES[2]].forEach(function (shape, i) {
      var box = MK.el('div', 'track-box',
        '<div class="track-name">' + (i + 1) + '. ' + shape.name + '</div>' +
        '<div class="track-canvas"></div>' +
        '<div class="track-status">把光标移到<b>绿色圆点</b>上，按住左键沿路走到 🚩</div>');
      list.appendChild(box);
      var canvas = box.querySelector('.track-canvas');
      var status = box.querySelector('.track-status');
      var finished = false;
      MK.track.create(canvas, shape, {
        height: 152,
        lane: 42,
        threshold: 40,
        onMiss: function () { status.innerHTML = '把光标移到<b>绿色圆点</b>上，再按住左键哦。'; MK.sfx.tick(); },
        onFail: function () { status.innerHTML = '跑出路面了，回到绿色圆点再来一次～'; MK.sfx.error(); },
        onPause: function () { status.innerHTML = '松手啦，重新按住小圆点继续往前走。'; },
        onDone: function () {
          if (finished) return;
          finished = true;
          status.innerHTML = '✅ 到达终点！' + MK.cheer();
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

  /* ---------- 第 2 关：单击 ---------- */
  function lvl1(stage, api) {
    var total = 10, done = 0;
    stage.innerHTML = '<div class="bubble-stage"></div>';
    var wrap = stage.querySelector('.bubble-stage');
    for (var i = 0; i < total; i++) {
      (function (i) {
        var s = MK.el('div', 'bubble', '⭐');
        s.style.filter = 'grayscale(1)';
        s.style.opacity = '.55';
        s.style.animationDelay = (i * 0.1) + 's';
        var on = false;
        s.addEventListener('click', function () {
          if (on) return;
          on = true;
          s.style.filter = 'none';
          s.style.opacity = '1';
          MK.anim(s, [{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(1)' }], { duration: 320 });
          MK.sfx.click();
          done++;
          api.progress(done, total);
          if (done === total) MK.later(api.finish, 300);
        });
        wrap.appendChild(s);
      })(i);
    }
    api.progress(0, total);
  }

  /* ---------- 第 2 关：双击 ---------- */
  function lvl2(stage, api) {
    var total = 6, done = 0;
    var animals = ['🐶', '🐱', '🐼', '🦊', '🐯', '🐨'];
    stage.innerHTML = '<div class="right-stage"></div>';
    var wrap = stage.querySelector('.right-stage');
    MK.shuffle(animals).forEach(function (a) {
      var box = MK.el('div', 'mbox', '<div class="ico">😴</div><div class="lbl">双击叫醒</div>');
      box.style.cursor = 'pointer';
      var last = 0, hinted = false, awake = false;
      box.addEventListener('click', function () {
        var now = Date.now();
        if (awake) return;
        if (now - last < 450) {
          last = 0; awake = true;
          MK.sfx.dbl();
          box.classList.add('done');
          box.querySelector('.ico').textContent = a;
          box.querySelector('.lbl').textContent = '起床啦！';
          done++;
          api.progress(done, total);
          if (done === total) MK.later(api.finish, 400);
        } else {
          last = now;
          if (!hinted) { hinted = true; MK.toast('双击 = 快速连点两下，别移动鼠标哦！', 'warn'); }
        }
      });
      wrap.appendChild(box);
    });
    api.progress(0, total);
  }

  /* ---------- 第 3 关：右击 ---------- */
  function lvl3(stage, api) {
    var total = 5, done = 0;
    var magic = ['🐰', '🕊️', '🌸', '🎈', '🍭'];
    stage.innerHTML = '<div class="right-stage"></div>';
    var wrap = stage.querySelector('.right-stage');
    MK.shuffle(magic).forEach(function (m) {
      var box = MK.el('div', 'mbox', '<div class="ico">🎩</div><div class="lbl">单击右键</div>');
      MK.onContext(box, function (e) {
        if (box.classList.contains('done')) return;
        MK.sfx.right();
        MK.openMenu(e.clientX, e.clientY, [
          { icon: '✨', text: '施魔法', act: 'magic' },
          { icon: '👀', text: '看看', act: 'look' }
        ], '对这个盒子做什么？', function (it) {
          if (it.act === 'magic') {
            MK.sfx.win();
            box.classList.add('done');
            box.querySelector('.ico').textContent = m;
            box.querySelector('.lbl').textContent = '变出来啦！';
            done++;
            api.progress(done, total);
            if (done === total) MK.later(api.finish, 400);
          } else {
            MK.toast('看不出什么，选"施魔法"试试！', 'info');
          }
        });
      });
      wrap.appendChild(box);
    });
    api.progress(0, total);
  }

  /* ---------- 第 4 关：拖拽 ---------- */
  function lvl4(stage, api) {
    var total = 6, done = 0;
    var items = [
      { e: '🐶', n: '小狗', t: 'dog' }, { e: '🐩', n: '贵宾犬', t: 'dog' },
      { e: '🐱', n: '小猫', t: 'cat' }, { e: '🐯', n: '老虎', t: 'cat' },
      { e: '🐟', n: '小鱼', t: 'fish' }, { e: '🐠', n: '热带鱼', t: 'fish' }
    ];
    stage.innerHTML =
      '<div class="drag-wrap"><div class="drag-items"></div><div class="drop-zones">' +
        '<div class="drop-zone" data-accept="dog"><div class="zone-title">🏠 狗窝</div><div class="zone-items"></div></div>' +
        '<div class="drop-zone" data-accept="cat"><div class="zone-title">🧺 猫窝</div><div class="zone-items"></div></div>' +
        '<div class="drop-zone" data-accept="fish"><div class="zone-title">🫧 鱼缸</div><div class="zone-items"></div></div>' +
      '</div></div>';
    var pool = stage.querySelector('.drag-items');
    MK.shuffle(items).forEach(function (it) {
      var el = MK.el('div', 'drag-item', '<div class="di">' + it.e + '</div><div class="dn">' + it.n + '</div>');
      el.setAttribute('data-type', it.t);
      MK.makeDraggable(el, {
        onDrop: function (item, zone) {
          if (zone.getAttribute('data-accept') === item.getAttribute('data-type')) { MK.sfx.drop(); return true; }
          MK.sfx.error();
          zone.classList.add('wrong');
          MK.later(function () { zone.classList.remove('wrong'); }, 420);
          MK.toast('这不是它的家，再看看～', 'warn');
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

  /* ---------- 第 5 关：四种操作混合 ---------- */
  function lvl5(stage, api) {
    var total = 4, done = 0;
    stage.innerHTML =
      '<div class="mix-wrap">' +
        '<div class="mix-task" data-t="1"><h4>① 单击：点破 3 个气球</h4><div class="mix-body"></div></div>' +
        '<div class="mix-task" data-t="2"><h4>② 双击：打开宝箱</h4><div class="mix-body"></div></div>' +
        '<div class="mix-task" data-t="3"><h4>③ 右击：孵出小鸡蛋</h4><div class="mix-body"></div></div>' +
        '<div class="mix-task" data-t="4"><h4>④ 拖拽：把苹果放进篮子</h4><div class="mix-body"></div></div>' +
      '</div>';

    function one(n) {
      done++;
      var t = stage.querySelector('.mix-task[data-t="' + n + '"]');
      if (t) {
        t.classList.add('ok');
        t.querySelector('h4').textContent = '✅ ' + t.querySelector('h4').textContent.replace(/^[①②③④]\s*/, '');
      }
      api.progress(done, total);
      if (done === total) MK.later(api.finish, 400);
    }

    // ① 单击气球
    var b1 = stage.querySelector('[data-t="1"] .mix-body');
    var popped = 0;
    ['🎈', '🎈', '🎈'].forEach(function (e, i) {
      var b = MK.el('div', 'bubble', e);
      b.style.animationDelay = (i * 0.15) + 's';
      var off = false;
      b.addEventListener('click', function () {
        if (off) return;
        off = true;
        MK.sfx.pop();
        b.classList.add('pop');
        popped++;
        if (popped === 3) one(1);
      });
      b1.appendChild(b);
    });

    // ② 双击宝箱
    var b2 = stage.querySelector('[data-t="2"] .mix-body');
    var chest = MK.el('div', 'chest', '<span class="gift">🏅</span><div class="box">📦</div><div class="hint">双击打开</div>');
    var last = 0, opened = false;
    chest.addEventListener('click', function () {
      var now = Date.now();
      if (opened) return;
      if (now - last < 450) {
        last = 0; opened = true;
        MK.sfx.dbl();
        chest.classList.add('open');
        chest.querySelector('.box').textContent = '🎁';
        one(2);
      } else { last = now; }
    });
    b2.appendChild(chest);

    // ③ 右击孵蛋
    var b3 = stage.querySelector('[data-t="3"] .mix-body');
    var egg = MK.el('div', 'mbox', '<div class="ico">🥚</div><div class="lbl">单击右键</div>');
    MK.onContext(egg, function (e) {
      if (egg.classList.contains('done')) return;
      MK.sfx.right();
      MK.openMenu(e.clientX, e.clientY, [
        { icon: '🔥', text: '孵一孵', act: 'hatch' },
        { icon: '💤', text: '再等等', act: 'wait' }
      ], '想对蛋做什么？', function (it) {
        if (it.act === 'hatch') {
          MK.sfx.win();
          egg.classList.add('done');
          egg.querySelector('.ico').textContent = '🐣';
          egg.querySelector('.lbl').textContent = '孵出来啦！';
          one(3);
        } else MK.toast('蛋都等急了，选"孵一孵"！', 'info');
      });
    });
    b3.appendChild(egg);

    // ④ 拖拽苹果
    var b4 = stage.querySelector('[data-t="4"] .mix-body');
    b4.innerHTML = '<div class="mix-drag"><div class="drag-items"></div>' +
      '<div class="drop-zone" data-accept="apple"><div class="zone-title">🧺 篮子</div><div class="zone-items"></div></div></div>';
    var apple = MK.el('div', 'drag-item', '<div class="di">🍎</div><div class="dn">苹果</div>');
    apple.setAttribute('data-type', 'apple');
    MK.makeDraggable(apple, {
      onDrop: function (item, zone) {
        if (zone.getAttribute('data-accept') === 'apple') { MK.sfx.drop(); return true; }
        MK.sfx.error();
        return false;
      },
      onDone: function () { one(4); }
    });
    b4.querySelector('.drag-items').appendChild(apple);

    api.progress(0, total);
  }

  /* ---------- 关卡表 ---------- */
  var LEVELS = [
    { name: '沿着小路走', op: '移动', desc: '手贴桌面慢慢滑，眼睛盯着小箭头。按住左键沿路走到红旗，别跑到路外面！', build: lvlMove },
    { name: '点亮小星星', op: '单击', desc: '夜晚的天空黑漆漆的，单击 10 颗星星，让它们亮起来。', build: lvl1 },
    { name: '叫醒小动物', op: '双击', desc: '小动物们还在睡觉呢，双击 6 只把他们叫醒。', build: lvl2 },
    { name: '魔法帽子', op: '右击', desc: '对 5 顶魔法帽单击右键，选择"施魔法"，看看能变出什么。', build: lvl3 },
    { name: '送动物回家', op: '拖拽', desc: '小狗、小猫和小鱼找不到家了，用拖拽把他们送回去。', build: lvl4 },
    { name: '综合大挑战', op: '单击+双击+右击+拖拽', desc: '四种本领一起用！完成 4 个小任务就能拿到证书啦。', build: lvl5 }
  ];

  var OP_COLOR = { '移动': '#2f9bff', '单击': '#ff9436', '双击': '#8a3fd1', '右击': '#ff6f9c', '拖拽': '#2fd07a' };

  /* ---------- 渲染关卡轨道 ---------- */
  MK.renderLevels = function () {
    var track = document.getElementById('levelTrack');
    if (!track) return;
    var done = MK.progress.get().levels;
    track.innerHTML = '';
    LEVELS.forEach(function (l, i) {
      var passed = i < done;
      var cls = 'level-node' + (passed ? ' done' : (i === cur ? ' current' : ''));
      var label = (passed ? '✅ ' : (i === cur ? '▶ ' : '🔒 ')) + (i + 1) + '. ' + l.name;
      var n = MK.el('div', cls, label);
      n.addEventListener('click', function () {
        if (i <= done) loadLevel(i);
        else MK.toast('先通过前面的关卡才能解锁哦！', 'warn');
      });
      track.appendChild(n);
    });
  };

  /* ---------- 载入某一关 ---------- */
  function loadLevel(i) {
    cur = i;
    MK.stopAllTimers();
    MK.closeMenu();
    if (currentStop) { try { currentStop(); } catch (e) {} currentStop = null; }

    var l = LEVELS[i];
    var stage = document.getElementById('challengeStage');
    var badge = document.getElementById('levelBadge');
    var title = document.getElementById('levelTitle');
    var desc = document.getElementById('levelDesc');
    var bar = document.getElementById('levelBar');
    var txt = document.getElementById('levelText');
    var next = document.getElementById('levelNext');

    var color = OP_COLOR[l.op.split('+')[0]] || '#2f9bff';
    badge.textContent = '第 ' + (i + 1) + ' 关 · ' + l.op;
    badge.style.background = color;
    title.textContent = l.name;
    desc.textContent = l.desc;
    bar.style.width = '0%';
    txt.textContent = '0/1';
    next.disabled = true;
    next.textContent = i === LEVELS.length - 1 ? '🏆 领取证书' : '下一关 ▶';
    stage.innerHTML = '';

    var finished = false;
    var api = {
      progress: function (v, t) {
        bar.style.width = (t ? v / t * 100 : 0) + '%';
        txt.textContent = v + '/' + t;
      },
      finish: function () {
        if (finished) return;
        finished = true;
        MK.confetti(60);
        MK.sfx.win();
        next.disabled = false;
        var p = MK.progress.get();
        if (i + 1 > p.levels) {
          p.levels = i + 1;
          MK.progress.addStars(i === LEVELS.length - 1 ? 2 : 1);
          MK.toast('第 ' + (i + 1) + ' 关通过！获得 ' + (i === LEVELS.length - 1 ? 2 : 1) + ' 颗星 ⭐', 'good', 3200);
        } else {
          MK.toast('第 ' + (i + 1) + ' 关又通过一次，' + MK.cheer(), 'good');
        }
        MK.progress.save();
        if (i === LEVELS.length - 1) {
          next.classList.add('shine');
        }
      }
    };
    currentStop = l.build(stage, api) || null;
    MK.renderLevels();
    // 关卡刚建好时容器可能还没布局，补一次轨道重排
    if (MK.track && MK.track.refreshAll) setTimeout(MK.track.refreshAll, 30);
  }

  /* ---------- 初始化 ---------- */
  function init() {
    var next = document.getElementById('levelNext');
    var retry = document.getElementById('levelRetry');
    if (!next) return;

    next.addEventListener('click', function () {
      if (cur < LEVELS.length - 1) loadLevel(cur + 1);
      else {
        var total = MK.progress.get().stars;
        MK.showCert(5);
        var d = document.getElementById('certDate');
        if (d) d.textContent += '　（累计获得 ' + total + ' 颗星）';
      }
    });
    if (retry) retry.addEventListener('click', function () { loadLevel(cur); });

    var start = Math.min(MK.progress.get().levels, LEVELS.length - 1);
    loadLevel(start);
    MK.pages.challenge = {
      enter: function () {
        // 进入挑战页时容器已有真实宽度，重排轨道（否则第 1 关点不中起点）
        if (MK.track && MK.track.refreshAll) {
          MK.track.refreshAll();
          setTimeout(MK.track.refreshAll, 60);
        }
      }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
