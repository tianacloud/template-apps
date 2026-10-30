/* ============================================================
   摸鱼盒子 · 华容道
   4 列 × 5 行，曹操（2×2）滑到底部中间即过关。
   拖动方块或点选后按方向键；Z 撤销，R 重来。
   六关的最少步数均由 BFS 求解器逐关验证（5/10/15/23/27/53）。
   ============================================================ */
(function () {
  'use strict';

  var COLS = 4, ROWS = 5;
  var GOAL_X = 1, GOAL_Y = ROWS - 2;

  /* ref = BFS 验证出的最少步数 */
  var LEVELS = [
    {
      name: '初探门径', ref: 5,
      rows: ['CC..', 'CC..', '.G..', '....', '....']
    },
    {
      name: '引兵让路', ref: 10,
      rows: ['ACC.', 'ACC.', 'DEE.', 'DG..', '....']
    },
    {
      name: '横木塞道', ref: 15,
      rows: ['ACCB', 'ACCB', 'D..F', 'DEEF', '....']
    },
    {
      name: '双卒拦门', ref: 23,
      rows: ['ACCB', 'ACCB', 'DEEF', 'D..F', 'I..J']
    },
    {
      name: '四将围曹', ref: 27,
      rows: ['ACCB', 'ACCB', 'DEEF', 'DGHF', '....']
    },
    {
      name: '深宫脱困', ref: 53,
      rows: ['ACCB', 'ACCB', 'DEEF', 'DG.F', 'I..J']
    }
  ];

  var V_NAMES = ['张', '赵', '马', '黄'];

  var boardEl = document.getElementById('board');
  var levelsEl = document.getElementById('levels');
  var movesEl = document.getElementById('moves');
  var refEl = document.getElementById('ref');
  var lvNoEl = document.getElementById('lvNo');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');
  var ovNext = document.getElementById('ovNext');

  var blocks = [];
  var caoIdx = 0;
  var sel = 0;
  var level = 0;
  var moves = 0;
  var history = [];
  var won = false;
  var paused = false;
  var drag = null;

  var doneLv = FB.Store.get('klotski.done', []) || [];
  var bestRec = FB.Store.get('klotski.best', {}) || {};
  if (!Array.isArray(doneLv)) doneLv = [];

  function parse(rows) {
    var cells = {}, order = [];
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        var ch = rows[y].charAt(x);
        if (ch === '.' || ch === ' ') continue;
        if (!cells[ch]) { cells[ch] = []; order.push(ch); }
        cells[ch].push([x, y]);
      }
    }
    return order.map(function (ch) {
      var pts = cells[ch];
      var xs = pts.map(function (p) { return p[0]; });
      var ys = pts.map(function (p) { return p[1]; });
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
      var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      return { ch: ch, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    });
  }

  function build() {
    var cfg = LEVELS[level];
    blocks = parse(cfg.rows);

    var iv = 0;
    blocks.forEach(function (b, i) {
      if (b.w === 2 && b.h === 2) { b.label = '曹操'; b.kind = 'cao'; caoIdx = i; }
      else if (b.w === 2 && b.h === 1) { b.label = '关羽'; b.kind = 'wide'; }
      else if (b.w === 1 && b.h === 2) { b.label = V_NAMES[iv++] || ''; b.kind = 'tall'; }
      else { b.label = '卒'; b.kind = 'mini'; }
    });

    Array.prototype.slice.call(boardEl.querySelectorAll('.kl-piece')).forEach(function (el) {
      el.parentNode.removeChild(el);
    });

    blocks.forEach(function (b, i) {
      var el = document.createElement('div');
      el.className = 'kl-piece' + (b.kind === 'cao' ? ' cao' : (b.kind === 'mini' ? ' mini' : ''));
      el.setAttribute('data-i', i);
      el.innerHTML = '<div class="kl-inner">' + (b.label || '') + '</div>';
      boardEl.appendChild(el);
      b.el = el;
      place(i);
    });
  }

  function place(i) {
    var b = blocks[i];
    b.el.style.left = (b.x / COLS * 100) + '%';
    b.el.style.top = (b.y / ROWS * 100) + '%';
    b.el.style.width = (b.w / COLS * 100) + '%';
    b.el.style.height = (b.h / ROWS * 100) + '%';
  }

  function canMove(i, dx, dy) {
    var b = blocks[i];
    var nx = b.x + dx, ny = b.y + dy;
    if (nx < 0 || ny < 0 || nx + b.w > COLS || ny + b.h > ROWS) return false;
    for (var j = 0; j < blocks.length; j++) {
      if (j === i) continue;
      var o = blocks[j];
      if (nx < o.x + o.w && nx + b.w > o.x && ny < o.y + o.h && ny + b.h > o.y) return false;
    }
    return true;
  }

  function nudge(i) {
    var el = blocks[i].el;
    el.classList.remove('nudge');
    void el.offsetWidth;
    el.classList.add('nudge');
    setTimeout(function () { el.classList.remove('nudge'); }, 240);
  }

  function move(i, dx, dy) {
    if (won || paused) return false;
    if (!canMove(i, dx, dy)) { nudge(i); return false; }
    history.push({ i: i, dx: dx, dy: dy });
    blocks[i].x += dx;
    blocks[i].y += dy;
    place(i);
    moves++;
    movesEl.textContent = moves;
    FB.Sound.play('pop');
    checkWin();
    return true;
  }

  function select(i) {
    blocks.forEach(function (b) { b.el.classList.remove('sel'); });
    sel = i;
    if (blocks[i]) blocks[i].el.classList.add('sel');
  }

  function checkWin() {
    var c = blocks[caoIdx];
    if (c.x !== GOAL_X || c.y !== GOAL_Y) return;
    won = true;

    var cfg = LEVELS[level];
    var isNew = !bestRec[level] || moves < bestRec[level];
    if (isNew) {
      bestRec[level] = moves;
      FB.Store.set('klotski.best', bestRec);
    }
    if (doneLv.indexOf(level) < 0) {
      doneLv.push(level);
      FB.Store.set('klotski.done', doneLv);
    }
    renderLevels();
    select(caoIdx);

    var last = level >= LEVELS.length - 1;
    ovTitle.textContent = last ? '全部通关' : '过关';
    ovScore.textContent = moves + ' 步';
    ovSub.textContent = '参考 ' + cfg.ref + ' 步 · ' +
      (isNew ? '刷新了本关纪录' : '本关最好 ' + bestRec[level] + ' 步');
    ovNext.textContent = last ? '回到第一关' : '下一关';
    setTimeout(function () { overlay.classList.add('on'); }, 320);
    FB.Sound.play('win');
  }

  function undo() {
    if (won || !history.length) return;
    var m = history.pop();
    blocks[m.i].x -= m.dx;
    blocks[m.i].y -= m.dy;
    place(m.i);
    moves = Math.max(0, moves - 1);
    movesEl.textContent = moves;
    select(m.i);
    FB.Sound.play('click');
  }

  function renderLevels() {
    levelsEl.innerHTML = LEVELS.map(function (cfg, i) {
      var cls = 'kl-lv' + (i === level ? ' on' : '') + (doneLv.indexOf(i) > -1 ? ' done' : '');
      return '<button class="' + cls + '" data-lv="' + i + '" title="' + cfg.name + ' · 参考 ' +
        cfg.ref + ' 步">' + (i + 1) + '</button>';
    }).join('');
  }

  function setup(idx) {
    level = Math.max(0, Math.min(LEVELS.length - 1, idx));
    moves = 0;
    history = [];
    won = false;
    drag = null;
    overlay.classList.remove('on');
    build();
    sel = caoIdx;
    movesEl.textContent = '0';
    refEl.textContent = LEVELS[level].ref;
    lvNoEl.textContent = (level + 1) + '/' + LEVELS.length;
    renderLevels();
    select(caoIdx);
  }

  function restart() {
    FB.Sound.play('click');
    setup(level);
  }

  /* ----------------------- 事件 ----------------------- */

  levelsEl.addEventListener('click', function (e) {
    var el = e.target.closest('.kl-lv');
    if (!el) return;
    FB.Sound.play('click');
    setup(parseInt(el.getAttribute('data-lv'), 10));
  });

  boardEl.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.kl-piece');
    if (!el) return;
    var i = parseInt(el.getAttribute('data-i'), 10);
    select(i);
    drag = { i: i, x: e.clientX, y: e.clientY };
    el.classList.add('grab');
    e.preventDefault();
  });

  document.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var cw = boardEl.clientWidth / COLS;
    var chh = boardEl.clientHeight / ROWS;
    var tx = cw * 0.42, ty = chh * 0.42;
    var dx = e.clientX - drag.x;
    var dy = e.clientY - drag.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) < tx) return;
      drag.x = e.clientX;
      drag.y = e.clientY;
      move(drag.i, dx > 0 ? 1 : -1, 0);
    } else {
      if (Math.abs(dy) < ty) return;
      drag.x = e.clientX;
      drag.y = e.clientY;
      move(drag.i, 0, dy > 0 ? 1 : -1);
    }
  });

  function endDrag() {
    if (!drag) return;
    if (blocks[drag.i] && blocks[drag.i].el) blocks[drag.i].el.classList.remove('grab');
    drag = null;
  }
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);

  var KEYMAP = {
    arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1],
    a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1]
  };

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if (KEYMAP[k]) {
      e.preventDefault();
      var d = KEYMAP[k];
      move(sel, d[0], d[1]);
      return;
    }
    if (k === 'z') { e.preventDefault(); undo(); }
    else if (k === 'r') { e.preventDefault(); restart(); }
  });

  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('resetBtn').addEventListener('click', restart);
  document.getElementById('nextBtn').addEventListener('click', function () {
    FB.Sound.play('click');
    setup(level >= LEVELS.length - 1 ? 0 : level + 1);
  });
  document.getElementById('ovAgain').addEventListener('click', restart);
  ovNext.addEventListener('click', function () {
    FB.Sound.play('click');
    setup(level >= LEVELS.length - 1 ? 0 : level + 1);
  });

  FB.Boss.onToggle = function (on) {
    paused = on;
    if (on) endDrag();
  };

  /* 开局跳到第一个没通关的关卡 */
  var firstOpen = 0;
  for (var q = 0; q < LEVELS.length; q++) {
    if (doneLv.indexOf(q) < 0) { firstOpen = q; break; }
  }
  setup(firstOpen);
})();
