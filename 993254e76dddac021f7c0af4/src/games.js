/* games.js —— 五款巩固小游戏，每款三档难度
 *  星际航道(移动) / 地鼠大作战(单击) / 记忆翻牌(双击) / 小小服务员(右击) / 整理小房间(拖拽)
 *
 * 交互：默认只显示入口卡片；点"开始游戏"后展开并置顶到第一位，
 * 点其它游戏时，上一个自动收起并回到初始状态。
 */
(function () {
  var MK = window.MK;

  function rate(v, s3, s2, s1) { return v >= s3 ? 3 : v >= s2 ? 2 : v >= s1 ? 1 : 0; }
  /* 越小越好（步数 / 用时） */
  function rateLow(v, s3, s2) { return v <= s3 ? 3 : v <= s2 ? 2 : 1; }
  function comment(stars) {
    return ['再来一次，你可以的！', '不错哦，继续加油！', '很厉害啦！', '太棒了，鼠标高手！'][stars];
  }

  /* ================= 游戏 1：地鼠大作战（单击） ================= */
  var MOLE_CFG = {
    easy: { holes: 6, cols: 3, time: 40, life: 1500, spawn: 820, s3: 150, s2: 80, s1: 30 },
    normal: { holes: 9, cols: 3, time: 30, life: 1100, spawn: 700, s3: 180, s2: 100, s1: 40 },
    hard: { holes: 12, cols: 4, time: 25, life: 780, spawn: 470, s3: 220, s2: 130, s1: 60 }
  };
  function playMole(stage, hud, finish, diff) {
    var c = MOLE_CFG[diff] || MOLE_CFG.normal;
    var ended = false, score = 0, combo = 0, hits = 0, left = c.time;
    stage.innerHTML = '<div class="mole-grid"></div>';
    hud.innerHTML = '<span>难度 <b>' + MK.diffByKey(diff).name + '</b></span>' +
      '<span class="score">得分 <b>0</b></span><span class="time">⏰ <b>' + c.time + '</b>s</span><span class="combo">连击 <b>0</b></span>';
    var sEl = hud.querySelector('.score b'), tEl = hud.querySelector('.time b'), cEl = hud.querySelector('.combo b');
    var grid = stage.querySelector('.mole-grid');
    grid.style.gridTemplateColumns = 'repeat(' + c.cols + ',1fr)';
    grid.style.maxWidth = (c.cols * 116) + 'px';
    var holes = [];

    for (var i = 0; i < c.holes; i++) {
      var hole = MK.el('div', 'hole');
      var mole = MK.el('div', 'mole', MK.pick(['🐹', '🐭', '🐰', '🐻']));
      hole.appendChild(mole);
      grid.appendChild(hole);
      holes.push({ hole: hole, mole: mole, up: false, timer: null });
    }

    function down(h, hit) {
      clearTimeout(h.timer);
      h.up = false;
      h.mole.classList.remove('up');
      if (!hit && combo > 0) { combo = 0; cEl.textContent = '0'; }
    }

    function pop() {
      if (ended) return;
      var free = holes.filter(function (h) { return !h.up; });
      if (!free.length) return;
      var h = MK.pick(free);
      h.up = true;
      h.mole.classList.add('up');
      var life = Math.max(420, c.life - score);
      h.timer = setTimeout(function () { if (!ended) down(h, false); }, life);
    }

    holes.forEach(function (h) {
      h.mole.addEventListener('click', function () {
        if (ended || !h.up) return;
        down(h, true);
        hits++;
        combo++;
        var add = 10 + Math.min(combo - 1, 5) * 2;
        score += add;
        sEl.textContent = score;
        cEl.textContent = combo;
        h.mole.classList.add('hit');
        setTimeout(function () { h.mole.classList.remove('hit'); }, 320);
        var fs = MK.el('div', 'float-score', '+' + add);
        h.hole.appendChild(fs);
        setTimeout(function () { if (fs.parentNode) fs.parentNode.removeChild(fs); }, 800);
        MK.sfx.click();
      });
    });

    var spawnId = MK.every(pop, c.spawn);
    var tickId = MK.every(function () {
      left--;
      tEl.textContent = left;
      if (left <= 5 && left > 0) MK.sfx.tick();
      if (left <= 0) stop();
    }, 1000);

    function stop() {
      if (ended) return;
      ended = true;
      clearInterval(spawnId); clearInterval(tickId);
      holes.forEach(function (h) { clearTimeout(h.timer); h.up = false; h.mole.classList.remove('up'); });
      var stars = rate(score, c.s3, c.s2, c.s1);
      finish({ score: score, stars: stars, text: '打中 ' + hits + ' 只地鼠，最高连击 ' + combo + ' 次！' + comment(stars) });
    }
    return stop;
  }

  /* ================= 游戏 2：记忆翻牌（双击） ================= */
  var MEM_CFG = {
    easy: { pairs: 3, cols: 3, back: 1100, s3: 6, s2: 10 },
    normal: { pairs: 6, cols: 4, back: 850, s3: 9, s2: 14 },
    hard: { pairs: 8, cols: 4, back: 600, s3: 12, s2: 18 }
  };
  function playMemory(stage, hud, finish, diff) {
    var c = MEM_CFG[diff] || MEM_CFG.normal;
    var ended = false, steps = 0, matched = 0, flipped = [], lock = false;
    var all = ['🍎', '🍇', '🍓', '🍑', '🍍', '🥝', '🍉', '🍒'];
    var deck = MK.shuffle(all.slice(0, c.pairs).concat(all.slice(0, c.pairs)));
    stage.innerHTML = '<div class="mem-grid"></div>';
    hud.innerHTML = '<span>难度 <b>' + MK.diffByKey(diff).name + '</b></span>' +
      '<span class="steps">翻开 <b>0</b> 次</span><span class="pairs">配对 <b>0</b>/' + c.pairs + '</span>';
    var stEl = hud.querySelector('.steps b'), pEl = hud.querySelector('.pairs b');
    var grid = stage.querySelector('.mem-grid');
    grid.style.gridTemplateColumns = 'repeat(' + c.cols + ',1fr)';
    grid.style.maxWidth = (c.cols * 112) + 'px';
    var timers = [];

    deck.forEach(function (ico) {
      var card = MK.el('div', 'mem-card',
        '<span class="cover">🎴</span><span class="face">' + ico + '</span>');
      card.setAttribute('data-ico', ico);
      bindDbl(card, function () {
        if (ended || lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
        card.classList.add('flipped');
        flipped.push(card);
        MK.sfx.dbl();
        if (flipped.length === 2) {
          steps++;
          stEl.textContent = steps;
          lock = true;
          var a = flipped[0], b = flipped[1];
          if (a.getAttribute('data-ico') === b.getAttribute('data-ico')) {
            MK.sfx.win();
            a.classList.add('matched'); b.classList.add('matched');
            matched++;
            pEl.textContent = matched;
            flipped = [];
            lock = false;
            if (matched === c.pairs) {
              ended = true;
              var stars = rateLow(steps, c.s3, c.s2);
              MK.later(function () {
                finish({ score: steps, stars: stars, text: '用 ' + steps + ' 次双击找齐了 ' + c.pairs + ' 对！' + comment(stars) });
              }, 500);
            }
          } else {
            MK.sfx.error();
            timers.push(setTimeout(function () {
              a.classList.remove('flipped'); b.classList.remove('flipped');
              flipped = []; lock = false;
            }, c.back));
          }
        }
      }, '要<b>双击</b>（快速点两下）才能翻开卡片哦！');
      grid.appendChild(card);
    });

    return function stop() {
      if (ended) return;
      ended = true;
      timers.forEach(clearTimeout);
      finish({ score: steps, stars: 0, text: '本局提前结束，已经配好 ' + matched + ' 对。下次试试全部找齐！' });
    };
  }

  /* 双击识别：间隔 450ms 内的两次点击算双击 */
  function bindDbl(el, onDouble, hint) {
    var last = 0, hinted = false;
    el.addEventListener('click', function () {
      var now = Date.now();
      if (now - last < 450) { last = 0; onDouble(); }
      else {
        last = now;
        if (!hinted) { hinted = true; MK.toast(hint || '要快速连点两下才是双击！', 'warn'); }
      }
    });
  }

  /* ================= 游戏 3：小小服务员（右击） ================= */
  var FOODS = [
    { e: '🍔', n: '汉堡' }, { e: '🍜', n: '面条' }, { e: '🍦', n: '冰淇淋' }, { e: '🍎', n: '苹果' },
    { e: '🍕', n: '披萨' }, { e: '🍣', n: '寿司' }, { e: '🍰', n: '蛋糕' }, { e: '🌮', n: '卷饼' }
  ];
  var FACES = ['👦', '👧', '🧑', '👨', '👩', '🧓', '👶'];
  var RESTO_CFG = {
    easy: { seats: 2, time: 60, opts: 3, patience: 12000, s3: 60, s2: 35, s1: 15 },
    normal: { seats: 3, time: 45, opts: 4, patience: 9000, s3: 80, s2: 50, s1: 20 },
    hard: { seats: 4, time: 40, opts: 5, patience: 7000, s3: 110, s2: 70, s1: 30 }
  };
  function playResto(stage, hud, finish, diff) {
    var c = RESTO_CFG[diff] || RESTO_CFG.normal;
    var ended = false, score = 0, served = 0, left = c.time;
    stage.innerHTML = '<div class="resto-stage"><div class="resto-counter"></div></div>';
    hud.innerHTML = '<span>难度 <b>' + MK.diffByKey(diff).name + '</b></span>' +
      '<span class="score">得分 <b>0</b></span><span class="time">⏰ <b>' + c.time + '</b>s</span><span class="served">服务 <b>0</b> 位</span>';
    var sEl = hud.querySelector('.score b'), tEl = hud.querySelector('.time b'), vEl = hud.querySelector('.served b');
    var counter = stage.querySelector('.resto-counter');
    counter.style.gridTemplateColumns = 'repeat(' + Math.min(c.seats, 4) + ',1fr)';
    var timers = [];

    function newCustomer(slot) {
      if (ended) return;
      var want = MK.pick(FOODS);
      var face = MK.pick(FACES);
      var cu = MK.el('div', 'customer',
        '<div class="want">' + want.e + '</div><div class="face">' + face + '</div>');
      slot.innerHTML = '';
      slot.appendChild(cu);

      var life = setTimeout(function () {
        if (ended || cu.classList.contains('served')) return;
        score = Math.max(0, score - 5);
        sEl.textContent = score;
        MK.toast('客人等不及走啦，下次快点哦！', 'warn');
        MK.sfx.error();
        cu.classList.add('leave');
        timers.push(setTimeout(function () { newCustomer(slot); }, 450));
      }, c.patience);
      timers.push(life);

      MK.onContext(cu, function (e) {
        if (ended) return;
        MK.sfx.right();
        var others = MK.shuffle(FOODS.filter(function (f) { return f.n !== want.n; })).slice(0, c.opts - 1);
        var options = MK.shuffle(others.concat([want]));
        MK.openMenu(e.clientX, e.clientY, options.map(function (f) {
          return { icon: f.e, text: f.n, act: f.n };
        }), '客人想要什么？', function (it) {
          if (it.act === want.n) {
            score += 10; served++;
            sEl.textContent = score; vEl.textContent = served;
            MK.sfx.win();
            cu.classList.add('served');
            cu.querySelector('.face').textContent = '😋';
            MK.toast('上菜正确！ +10 分', 'good');
            clearTimeout(life);
            timers.push(setTimeout(function () {
              cu.classList.add('leave');
              timers.push(setTimeout(function () { newCustomer(slot); }, 450));
            }, 700));
          } else {
            score = Math.max(0, score - 5);
            sEl.textContent = score;
            MK.sfx.error();
            MK.toast('上错菜啦，扣 5 分。再看看客人头顶！', 'warn');
          }
        });
      });
    }

    var slots = [];
    for (var i = 0; i < c.seats; i++) {
      var slot = MK.el('div');
      counter.appendChild(slot);
      slots.push(slot);
      newCustomer(slot);
    }

    var tickId = MK.every(function () {
      left--;
      tEl.textContent = left;
      if (left <= 0) stop();
    }, 1000);

    function stop() {
      if (ended) return;
      ended = true;
      clearInterval(tickId);
      timers.forEach(clearTimeout);
      MK.closeMenu();
      var stars = rate(score, c.s3, c.s2, c.s1);
      finish({ score: score, stars: stars, text: '一共服务了 ' + served + ' 位客人！' + comment(stars) });
    }
    return stop;
  }

  /* ================= 游戏 4：整理小房间（拖拽） ================= */
  var ROOM_ITEMS = {
    book: [{ e: '📚', n: '绘本', t: 'book' }, { e: '📖', n: '故事书', t: 'book' }, { e: '📕', n: '课本', t: 'book' }],
    cloth: [{ e: '👕', n: 'T恤', t: 'cloth' }, { e: '🧦', n: '袜子', t: 'cloth' }, { e: '👖', n: '裤子', t: 'cloth' }],
    toy: [{ e: '🧸', n: '小熊', t: 'toy' }, { e: '🚗', n: '小汽车', t: 'toy' }, { e: '⚽', n: '足球', t: 'toy' }],
    fruit: [{ e: '🍎', n: '苹果', t: 'fruit' }, { e: '🍌', n: '香蕉', t: 'fruit' }, { e: '🍇', n: '葡萄', t: 'fruit' }]
  };
  var ROOM_BINS = [
    { t: 'book', emoji: '📚', name: '书架' },
    { t: 'cloth', emoji: '👕', name: '衣柜' },
    { t: 'toy', emoji: '🧸', name: '玩具箱' },
    { t: 'fruit', emoji: '🍎', name: '果盘' }
  ];
  var ROOM_CFG = {
    easy: { kinds: ['book', 'toy'], per: 3, s3: 18, s2: 30 },
    normal: { kinds: ['book', 'cloth', 'toy'], per: 3, s3: 20, s2: 35 },
    hard: { kinds: ['book', 'cloth', 'toy', 'fruit'], per: 3, s3: 26, s2: 42 }
  };
  function playRoom(stage, hud, finish, diff) {
    var c = ROOM_CFG[diff] || ROOM_CFG.normal;
    var ended = false, sec = 0, done = 0, wrong = 0;
    var items = [];
    c.kinds.forEach(function (k) { items = items.concat(ROOM_ITEMS[k].slice(0, c.per)); });
    var total = items.length;
    var bins = ROOM_BINS.filter(function (b) { return c.kinds.indexOf(b.t) >= 0; });

    var html = '<div class="room-stage">';
    bins.forEach(function (b) {
      html += '<div class="room-bin" data-accept="' + b.t + '"><span class="zone-title">' + b.emoji + ' ' + b.name + '</span>' +
        '<span class="emoji">' + b.emoji + '</span><div class="zone-items"></div></div>';
    });
    html += '<div class="room-floor"></div></div>';
    stage.innerHTML = html;
    stage.querySelector('.room-stage').style.gridTemplateColumns = 'repeat(' + bins.length + ',1fr)';

    hud.innerHTML = '<span>难度 <b>' + MK.diffByKey(diff).name + '</b></span>' +
      '<span class="time">⏱️ <b>0</b>s</span><span class="cnt">归位 <b>0</b>/' + total + '</span><span class="wrong">放错 <b>0</b> 次</span>';
    var tEl = hud.querySelector('.time b'), cEl = hud.querySelector('.cnt b'), wEl = hud.querySelector('.wrong b');
    var floor = stage.querySelector('.room-floor');

    MK.shuffle(items).forEach(function (it) {
      var el = MK.el('div', 'drag-item', '<div class="di">' + it.e + '</div><div class="dn">' + it.n + '</div>');
      el.setAttribute('data-type', it.t);
      MK.makeDraggable(el, {
        onDrop: function (item, zone) {
          if (zone.getAttribute('data-accept') === item.getAttribute('data-type')) { MK.sfx.drop(); return true; }
          wrong++; wEl.textContent = wrong;
          MK.sfx.error();
          zone.classList.add('wrong');
          MK.later(function () { zone.classList.remove('wrong'); }, 420);
          MK.toast(it.n + '不能放这里哦～', 'warn');
          return false;
        },
        onDone: function () {
          done++;
          cEl.textContent = done;
          if (done === total && !ended) {
            ended = true;
            clearInterval(tickId);
            var stars = rateLow(sec, c.s3, c.s2);
            MK.later(function () {
              MK.confetti(50);
              finish({
                score: sec, stars: wrong === 0 && stars < 3 ? stars + 1 : stars,
                text: '用了 ' + sec + ' 秒把房间收拾干净，放错 ' + wrong + ' 次！' + comment(stars)
              });
            }, 400);
          }
        }
      });
      floor.appendChild(el);
    });

    var tickId = MK.every(function () { sec++; tEl.textContent = sec; }, 1000);
    return function stop() {
      if (ended) return;
      ended = true;
      clearInterval(tickId);
      finish({ score: sec, stars: 0, text: '本局提前结束，已经归位 ' + done + '/' + total + ' 件。再来一次吧！' });
    };
  }

  /* ================= 游戏 5：星际航道（移动） ================= */
  var TRACK_CFG = {
    easy: { time: 60, lane: 54, thr: 48, lv: 0, add: 20, sub: 3, h: 210, s3: 60, s2: 40, s1: 20 },
    normal: { time: 45, lane: 36, thr: 33, lv: 1, add: 20, sub: 5, h: 195, s3: 100, s2: 60, s1: 20 },
    hard: { time: 40, lane: 24, thr: 21, lv: 2, add: 30, sub: 8, h: 180, s3: 120, s2: 80, s1: 40 }
  };
  function playTrack(stage, hud, finish, diff) {
    var c = TRACK_CFG[diff] || TRACK_CFG.normal;
    var ended = false, score = 0, cleared = 0, left = c.time;
    stage.innerHTML =
      '<div class="track-box big">' +
        '<div class="track-name">准备起飞…</div>' +
        '<div class="track-canvas"></div>' +
        '<div class="track-status">把飞船放到绿色圆点上，按住左键沿航道飞到 🚩</div>' +
      '</div>';
    hud.innerHTML = '<span>难度 <b>' + MK.diffByKey(diff).name + '</b></span>' +
      '<span class="score">得分 <b>0</b></span><span class="time">⏰ <b>' + c.time + '</b>s</span><span class="cleared">抵达 <b>0</b> 条</span>';
    var sEl = hud.querySelector('.score b'), tEl = hud.querySelector('.time b'), cEl = hud.querySelector('.cleared b');
    var nameEl = stage.querySelector('.track-name');
    var status = stage.querySelector('.track-status');
    var canvas = stage.querySelector('.track-canvas');
    var pool = MK.shuffle(MK.track.byLevel(c.lv));
    var round = 0, inst = null;

    function next() {
      if (ended) return;
      var sh = pool[round % pool.length];
      nameEl.textContent = '第 ' + (round + 1) + ' 条航道：' + sh.name;
      status.innerHTML = '把飞船（光标）停在<b>绿色圆点</b>上，按住左键沿航道飞到 🚩';
      if (inst) inst.destroy();
      inst = MK.track.create(canvas, sh, {
        height: c.h, lane: c.lane, threshold: c.thr, icon: '🚩',
        onMiss: function () { status.innerHTML = '飞船没停在起点上，把光标移到<b>绿色圆点</b>再按住左键。'; MK.sfx.tick(); },
        onFail: function () {
          score = Math.max(0, score - c.sub);
          sEl.textContent = score;
          status.innerHTML = '撞出航道啦！-' + c.sub + ' 分，回到起点重新飞～';
          MK.sfx.error();
        },
        onPause: function () { status.innerHTML = '松手了，重新按住小飞船继续飞。'; },
        onDone: function () {
          cleared++;
          score += c.add;
          sEl.textContent = score;
          cEl.textContent = cleared;
          status.innerHTML = '✅ 成功抵达！+' + c.add + ' 分';
          MK.sfx.win();
          round++;
          MK.later(next, 800);
        }
      });
    }

    next();
    if (MK.track && MK.track.refreshAll) setTimeout(MK.track.refreshAll, 30);
    var tickId = MK.every(function () {
      left--;
      tEl.textContent = left;
      if (left <= 5 && left > 0) MK.sfx.tick();
      if (left <= 0) stop();
    }, 1000);

    function stop() {
      if (ended) return;
      ended = true;
      clearInterval(tickId);
      if (inst) inst.destroy();
      var stars = rate(score, c.s3, c.s2, c.s1);
      finish({ score: score, stars: stars, text: c.time + ' 秒内飞完 ' + cleared + ' 条航道！' + comment(stars) });
    }
    return stop;
  }

  /* ================= 游戏卡片装配 ================= */
  var TAG_COLOR = { '单击': '#ff9436', '双击': '#8a3fd1', '右击': '#ff6f9c', '拖拽': '#2fd07a', '移动': '#2f9bff' };
  var GAMES = [
    {
      key: 'mole', icon: '🔨', name: '地鼠大作战', tag: '单击', bg: '#ede0f5',
      desc: '地鼠从洞里冒出来啦！用<b>单击</b>把它们敲回去，连击越多分越高。难度越高，地鼠越快、洞越多。',
      play: playMole, unit: '分'
    },
    {
      key: 'memory', icon: '🎴', name: '记忆翻牌', tag: '双击', bg: '#f1ebff',
      desc: '卡片下藏着成双的水果。用<b>双击</b>翻开两张，一样的就消掉，看谁用的次数最少！',
      play: playMemory, unit: '次'
    },
    {
      key: 'resto', icon: '🍔', name: '小小服务员', tag: '右击', bg: '#ffeaf1',
      desc: '客人头顶冒出想吃的东西，对客人<b>单击右键</b>打开菜单，选对菜就能得分！',
      play: playResto, unit: '分'
    },
    {
      key: 'room', icon: '🧹', name: '整理小房间', tag: '拖拽', bg: '#e4fbf0',
      desc: '房间乱糟糟的！用<b>拖拽</b>把东西分别送回书架、衣柜和玩具箱，越快越好。',
      play: playRoom, unit: '秒'
    },
    {
      key: 'track', icon: '🛸', name: '星际航道', tag: '移动', bg: '#ede0f5',
      desc: '开着小飞船沿航道飞行！<b>按住左键</b>沿灰色的路走到红旗，飞完的航道越多越好。',
      play: playTrack, unit: '分'
    }
  ];

  var cards = [];
  var current = null;

  function renderBadges() {
    var p = MK.progress.get();
    cards.forEach(function (card) {
      var tag = card.querySelector('.pe-badge');
      if (!tag) return;
      var n = p.games[card.getAttribute('data-game')] || 0;
      tag.innerHTML = n > 0 ? MK.starText(n) : '未挑战';
      tag.classList.toggle('ok', n > 0);
    });
  }

  function closeCard(card) {
    if (!card) return;
    if (card._stop) card._stop();
    card.classList.remove('open');
    var body = card.querySelector('.pe-body');
    if (body) {
      if (MK.track && MK.track.destroyWithin) MK.track.destroyWithin(body);
      body.innerHTML = '';
    }
    card._built = false;
    var btn = card.querySelector('.pe-start');
    if (btn) btn.textContent = '▶ 开始游戏';
    if (card === current) current = null;
    renderBadges();
  }

  function closeAll() {
    cards.forEach(function (c) { closeCard(c); });
    current = null;
  }

  function buildBody(card, g) {
    var body = card.querySelector('.pe-body');
    body.innerHTML =
      '<div class="gbar"></div>' +
      '<div class="hud" style="display:none"></div>' +
      '<div class="gstage"></div>' +
      '<div class="gresult"></div>' +
      '<div class="pcard-foot">' +
        '<button class="btn btn-primary btn-play">▶ 开始游戏</button>' +
        '<button class="btn btn-ghost btn-back">🔙 收起，选别的</button>' +
      '</div>';
    var stage = body.querySelector('.gstage');
    var hud = body.querySelector('.hud');
    var btn = body.querySelector('.btn-play');
    var res = body.querySelector('.gresult');
    var stopFn = null;
    var diff = 'normal';

    // 难度选择条
    var bar = MK.diffBar(diff, function (k) {
      diff = k;
      if (stopFn) { stopFn(); stopFn = null; }
      res.classList.remove('show');
      hud.style.display = 'none';
      btn.textContent = '▶ 开始游戏';
      card.classList.remove('playing');
      if (MK.track && MK.track.destroyWithin) MK.track.destroyWithin(stage);
      stage.innerHTML = '';
      MK.toast('难度已切换到「' + MK.diffByKey(k).name + '」，点开始游戏吧！', 'info');
    });
    body.querySelector('.gbar').appendChild(bar);

    btn.addEventListener('click', function () {
      // 正在游戏中 → 提前交卷，由 finish 收拾现场
      if (stopFn) { stopFn(); stopFn = null; return; }
      card.classList.add('playing');
      card._running = true;
      hud.style.display = 'flex';
      res.classList.remove('show');
      btn.textContent = '⏹ 结束本局';
      stopFn = g.play(stage, hud, function (r) {
        stopFn = null;
        card._running = false;
        btn.textContent = '🔄 再玩一次';
        var old = MK.progress.get().games[g.key] || 0;
        MK.progress.markGame(g.key, r.stars);
        var isNew = r.stars > old;
        res.innerHTML = '🎯 难度：<b>' + MK.diffByKey(diff).name + '</b>　' + r.text +
          '<br>评价：<span class="stars">' + MK.starText(r.stars) + '</span>' +
          (isNew && r.stars > 0 ? ' <b style="color:#e08c00">新纪录！+' + (r.stars - old) + '⭐</b>' : '') +
          '<br><span style="font-size:13px;color:#6b7c8f">本局' + (g.unit === '秒' ? '用时' : '成绩') + '：' + r.score + ' ' + g.unit + '</span>';
        res.classList.add('show');
        if (r.stars >= 2) MK.confetti(50);
        MK.sfx.win();
        renderBadges();
      }, diff);
    });
    body.querySelector('.btn-back').addEventListener('click', function () { closeCard(card); });

    card._stop = function () {
      if (stopFn) { stopFn(); stopFn = null; }
      card._running = false;
      card.classList.remove('playing');
      hud.style.display = 'none';
      btn.textContent = '▶ 开始游戏';
      res.classList.remove('show');
    };
    card._playBtn = btn;
    card._built = true;
  }

  function openCard(card, g) {
    if (current === card) return;
    closeAll();                       // 切换到其它游戏时，上一个回到初始状态
    current = card;
    card.classList.add('open');
    var startBtn = card.querySelector('.pe-start');
    if (startBtn) startBtn.textContent = '✔ 进行中';
    buildBody(card, g);
    card._playBtn.click();            // 展开即开局
    try { card.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }

  function buildCard(g) {
    var card = MK.el('div', 'card gcard');
    card.setAttribute('data-game', g.key);
    card.style.setProperty('--gc', TAG_COLOR[g.tag] || '#2f9bff');
    card.innerHTML =
      '<div class="pe-entry">' +
        '<div class="pe-icon" style="background:' + g.bg + '">' + g.icon + '</div>' +
        '<div class="pe-main">' +
          '<h3>' + g.name + '<span class="gtag" style="background:' + (TAG_COLOR[g.tag] || '#2f9bff') + '">' + g.tag + '</span></h3>' +
          '<p>' + g.desc + '</p>' +
        '</div>' +
        '<div class="pe-go">' +
          '<span class="pe-badge">未挑战</span>' +
          '<button class="btn btn-primary pe-start">▶ 开始游戏</button>' +
        '</div>' +
      '</div>' +
      '<div class="pe-body"></div>';

    card.querySelector('.pe-entry').addEventListener('click', function () {
      if (card.classList.contains('open')) return;
      MK.sfx.click();
      openCard(card, g);
    });
    cards.push(card);
    return card;
  }

  function init() {
    var grid = document.getElementById('gamesGrid');
    if (!grid) return;
    cards = [];
    GAMES.forEach(function (g) { grid.appendChild(buildCard(g)); });
    renderBadges();

    MK.pages.games = {
      enter: function () { renderBadges(); },
      leave: function () { closeAll(); }   // 离开本页 → 全部收起并回到初始状态
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
