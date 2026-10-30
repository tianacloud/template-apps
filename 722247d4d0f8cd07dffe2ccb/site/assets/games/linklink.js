/* ============================================================
   摸鱼盒子 · 连连看
   10×8 共 40 对。两张同类牌之间若能以「不超过两次拐弯」的空路径相连即可消除。
   路径用 BFS 搜索（带方向与拐弯计数的状态），并支持绕出棋盘外一圈。
   ============================================================ */
(function () {
  'use strict';

  var COLS = 10, ROWS = 8;
  var TYPES = 10;                 /* 10 种图案，每种 8 张 = 4 对 */
  var TOTAL_SEC = 240;
  var HINTS = 3, SHUFFLES = 1;

  /* 图案：沿用统一的手绘 SVG 风格，颜色区分度高 */
  var SHAPES = [
    '<path d="M12 3.2l2.6 5.5 6 .9-4.35 4.2 1.03 5.95L12 16.9l-5.28 2.85 1.03-5.95L3.4 9.6l6-.9z" fill="#f0a04b"/>',
    '<path d="M12 20.3S4.7 15.6 4.7 10.7A4.5 4.5 0 0 1 12 7.2a4.5 4.5 0 0 1 7.3 3.5c0 4.9-7.3 9.6-7.3 9.6z" fill="#f2545b"/>',
    '<path d="M20.2 14.6A8.6 8.6 0 1 1 9.4 3.8a7 7 0 0 0 10.8 10.8z" fill="#5b6ef5"/>',
    '<path d="M7 18.4h10.2a3.6 3.6 0 0 0 .3-7.2A5.1 5.1 0 0 0 7.9 9.6 4.3 4.3 0 0 0 7 18.4z" fill="#22a8cf"/>',
    '<path d="M4.8 19.2C4.8 11 11 4.8 19.2 4.8c0 8.2-6.2 14.4-14.4 14.4z" fill="#2fbf8f"/>',
    '<path d="M12 3.6l8.4 14.8H3.6z" fill="#8b5cf6"/>',
    '<circle cx="12" cy="12" r="3.1" fill="#e2569b"/><circle cx="12" cy="6.2" r="2.7" fill="#e2569b"/><circle cx="17.8" cy="12" r="2.7" fill="#e2569b"/><circle cx="12" cy="17.8" r="2.7" fill="#e2569b"/><circle cx="6.2" cy="12" r="2.7" fill="#e2569b"/>',
    '<path d="M3.6 12C6.7 7.9 10.8 6 14.7 6c2.5 0 4.4 1.1 5.7 2.2L18 12l2.4 3.8c-1.3 1.1-3.2 2.2-5.7 2.2-3.9 0-8-1.9-11.1-6z" fill="#0f9d9d"/>',
    '<circle cx="12" cy="12" r="4.2" fill="#ffb020"/><g stroke="#ffb020" stroke-width="2" stroke-linecap="round"><path d="M12 2.4v2.6M12 19v2.6M2.4 12h2.6M19 12h2.6M5.2 5.2l1.9 1.9M16.9 16.9l1.9 1.9M18.8 5.2l-1.9 1.9M7.1 16.9l-1.9 1.9"/></g>',
    '<path d="M12 3.2c3.4 3.6 6 6.9 6 10.1a6 6 0 0 1-12 0c0-3.2 2.6-6.5 6-10.1z" fill="#3b82f6"/>'
  ];

  var boardEl = document.getElementById('board');
  var fx = document.getElementById('fx');
  var leftEl = document.getElementById('left');
  var pairsEl = document.getElementById('pairs');
  var secEl = document.getElementById('sec');
  var barEl = document.getElementById('timerBar');
  var hintBtn = document.getElementById('hintBtn');
  var shuffleBtn = document.getElementById('shuffleBtn');
  var hintLeftEl = document.getElementById('hintLeft');
  var shuffleLeftEl = document.getElementById('shuffleLeft');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');

  var W = COLS + 2, H = ROWS + 2;      /* 含外圈的寻路网格 */
  var grid = [];
  var nodes = {};                      /* "x,y" → 对应 DOM（用棋盘内坐标 1..COLS） */
  var sel = null;
  var remain = 0;
  var hints = HINTS, shuffles = SHUFFLES;
  var timeLeft = TOTAL_SEC;
  var tickId = null, paused = false, over = false, lock = false;

  /* ----------------------- 工具 ----------------------- */

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function idx(x, y) { return y * W + x; }
  function at(x, y) { return grid[idx(x, y)]; }
  function setAt(x, y, v) { grid[idx(x, y)] = v; }

  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ----------------------- 路径搜索 ----------------------- */
  /* 返回拐弯 ≤2 的折线点（含起终点），找不到返回 null */
  function findPath(a, b) {
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    var start = [];
    for (var d = 0; d < 4; d++) start.push({ x: a.x, y: a.y, dx: dirs[d][0], dy: dirs[d][1], turns: 0, path: [a] });

    var seen = {};
    var queue = start;
    var head = 0;
    while (head < queue.length) {
      var s = queue[head++];
      for (var k = 0; k < 4; k++) {
        var dx = dirs[k][0], dy = dirs[k][1];
        var turns = s.turns + ((dx === s.dx && dy === s.dy) ? 0 : 1);
        if (turns > 2) continue;
        var nx = s.x + dx, ny = s.y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;

        var isTarget = (nx === b.x && ny === b.y);
        if (!isTarget && at(nx, ny) !== 0) continue;

        var path = s.path.concat([{ x: nx, y: ny }]);
        if (isTarget) return squash(path);

        var key = nx + ',' + ny + ',' + dx + ',' + dy;
        if (seen[key] !== undefined && seen[key] <= turns) continue;
        seen[key] = turns;
        queue.push({ x: nx, y: ny, dx: dx, dy: dy, turns: turns, path: path });
      }
    }
    return null;
  }

  /* 去掉同一直线上多余的点，便于画线 */
  function squash(path) {
    if (path.length < 3) return path;
    var out = [path[0]];
    for (var i = 1; i < path.length - 1; i++) {
      var p = path[i - 1], q = path[i], r = path[i + 1];
      var same = (p.x === q.x && q.x === r.x) || (p.y === q.y && q.y === r.y);
      if (!same) out.push(q);
    }
    out.push(path[path.length - 1]);
    return out;
  }

  /* ----------------------- 渲染 ----------------------- */

  function build() {
    /* 平铺 + 洗牌，保证每种图案出现 8 次 */
    var pool = [];
    for (var t = 0; t < TYPES; t++) for (var c = 0; c < 8; c++) pool.push(t + 1);
    shuffle(pool);

    grid = new Array(W * H);
    for (var i = 0; i < grid.length; i++) grid[i] = 0;
    for (var y = 1; y <= ROWS; y++) {
      for (var x = 1; x <= COLS; x++) setAt(x, y, pool[(y - 1) * COLS + (x - 1)]);
    }
    remain = COLS * ROWS / 2;

    boardEl.style.gridTemplateColumns = 'repeat(' + COLS + ', 1fr)';
    /* 保留 canvas，重建棋盘格 */
    var keep = fx;
    boardEl.innerHTML = '';
    boardEl.appendChild(keep);

    nodes = {};
    var html = '';
    for (var yy = 1; yy <= ROWS; yy++) {
      for (var xx = 1; xx <= COLS; xx++) {
        html += '<button class="ll-tile" data-x="' + xx + '" data-y="' + yy + '">' +
          '<svg viewBox="0 0 24 24">' + SHAPES[at(xx, yy) - 1] + '</svg></button>';
      }
    }
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    while (tmp.firstChild) boardEl.appendChild(tmp.firstChild);

    /* 建坐标索引 */
    [].forEach.call(boardEl.querySelectorAll('.ll-tile'), function (el) {
      nodes[el.dataset.x + ',' + el.dataset.y] = el;
    });

    /* 若开局没有可消的对子，重来 */
    var guard = 0;
    while (!anyPair() && guard++ < 20) doShuffle(false);

    paintHud();
  }

  function paintHud() {
    leftEl.textContent = remain + ' 对';
    pairsEl.textContent = over ? '—' : countPairs();
    hintLeftEl.textContent = hints;
    shuffleLeftEl.textContent = shuffles;
    hintBtn.disabled = hints <= 0;
    shuffleBtn.disabled = shuffles <= 0;
  }

  function paintTimer() {
    secEl.textContent = fmtTime(Math.max(0, timeLeft));
    var pct = Math.max(0, timeLeft) / TOTAL_SEC * 100;
    barEl.firstChild.style.width = pct + '%';
    barEl.classList.toggle('low', timeLeft <= 45);
  }

  /* ----------------------- 逻辑 ----------------------- */

  function sameTypeOk(a, b) {
    if (!a || !b) return false;
    if (a.x === b.x && a.y === b.y) return false;
    if (at(a.x, a.y) === 0 || at(a.x, a.y) !== at(b.x, b.y)) return false;
    return true;
  }

  function tryPair(a, b) { return sameTypeOk(a, b) ? findPath(a, b) : null; }

  /* 当前可消的对数 */
  function countPairs() {
    var byType = {};
    for (var y = 1; y <= ROWS; y++) {
      for (var x = 1; x <= COLS; x++) {
        var t = at(x, y);
        if (!t) continue;
        (byType[t] = byType[t] || []).push({ x: x, y: y });
      }
    }
    var n = 0;
    Object.keys(byType).forEach(function (t) {
      var list = byType[t];
      for (var i = 0; i < list.length; i++) {
        for (var j = i + 1; j < list.length; j++) {
          if (findPath(list[i], list[j])) n++;
        }
      }
    });
    return n;
  }

  function anyPair() {
    var byType = {};
    for (var y = 1; y <= ROWS; y++) {
      for (var x = 1; x <= COLS; x++) {
        var t = at(x, y);
        if (!t) continue;
        (byType[t] = byType[t] || []).push({ x: x, y: y });
      }
    }
    var types = Object.keys(byType);
    for (var k = 0; k < types.length; k++) {
      var list = byType[types[k]];
      for (var i = 0; i < list.length; i++) {
        for (var j = i + 1; j < list.length; j++) {
          var p = findPath(list[i], list[j]);
          if (p) return [list[i], list[j], p];
        }
      }
    }
    return null;
  }

  /* 画连线：用 tile 位置换算像素坐标，允许绕到棋盘外 */
  function drawPath(path) {
    var first = nodes['1,1'] || boardEl.querySelector('.ll-tile');
    if (!first) return;
    var br = boardEl.getBoundingClientRect();
    var fr = first.getBoundingClientRect();
    var cell = fr.width, gap = cell * 0.16;

    var dpr = window.devicePixelRatio || 1;
    var cw = fx.clientWidth, ch = fx.clientHeight;
    if (fx.width !== Math.round(cw * dpr) || fx.height !== Math.round(ch * dpr)) {
      fx.width = Math.round(cw * dpr);
      fx.height = Math.round(ch * dpr);
    }
    var ctx = fx.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    /* canvas 左上角相对棋盘左上角偏移 46px（见 CSS inset） */
    var originX = -46, originY = -46;
    var baseX = fr.left - br.left, baseY = fr.top - br.top;

    function pt(p) {
      return {
        x: originX + baseX + (p.x - 1) * (cell + gap) + cell / 2,
        y: originY + baseY + (p.y - 1) * (cell + gap) + cell / 2
      };
    }

    var accent = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#5b6ef5';
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    path.forEach(function (p, i) {
      var q = pt(p);
      if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;

    setTimeout(function () { ctx.clearRect(0, 0, cw, ch); }, 320);
  }

  function removePair(a, b) {
    var elA = nodes[a.x + ',' + a.y], elB = nodes[b.x + ',' + b.y];
    setAt(a.x, a.y, 0);
    setAt(b.x, b.y, 0);
    [elA, elB].forEach(function (el) {
      if (!el) return;
      el.classList.add('gone');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 220);
    });
    remain--;
    sel = null;
    paintHud();
    if (remain <= 0) win();
  }

  function clickTile(x, y) {
    if (over || lock) return;
    var cur = { x: x, y: y };
    var el = nodes[x + ',' + y];
    if (!el) return;

    if (!sel) {
      sel = cur;
      el.classList.add('on');
      FB.Sound.play('click');
      return;
    }
    if (sel.x === x && sel.y === y) {
      el.classList.remove('on');
      sel = null;
      return;
    }

    var path = tryPair(sel, cur);
    if (path) {
      var prev = nodes[sel.x + ',' + sel.y];
      if (prev) prev.classList.remove('on');
      lock = true;
      drawPath(path);
      FB.Sound.play('merge');
      removePair(sel, cur);
      setTimeout(function () { lock = false; }, 200);
    } else {
      var prevEl = nodes[sel.x + ',' + sel.y];
      if (prevEl) prevEl.classList.remove('on');
      if (sameTypeOk(sel, cur)) {
        /* 同类但连不通：抖一下给反馈 */
        el.classList.add('hint');
        setTimeout(function () { el.classList.remove('hint'); }, 700);
        FB.Sound.play('bad');
      } else {
        FB.Sound.play('click');
      }
      sel = cur;
      el.classList.add('on');
    }
  }

  function doShuffle(countIt) {
    var cells = [], types = [];
    for (var y = 1; y <= ROWS; y++) {
      for (var x = 1; x <= COLS; x++) {
        if (at(x, y)) { cells.push({ x: x, y: y }); types.push(at(x, y)); }
      }
    }
    shuffle(types);
    cells.forEach(function (p, i) {
      setAt(p.x, p.y, types[i]);
      var el = nodes[p.x + ',' + p.y];
      if (el) el.querySelector('svg').innerHTML = SHAPES[types[i] - 1];
    });
    if (countIt) {
      shuffles--;
      paintHud();
      FB.Sound.play('pop');
      var guard = 0;
      while (!anyPair() && guard++ < 20) doShuffle(false);
    }
  }

  function win() {
    over = true;
    clearInterval(tickId); tickId = null;
    var used = TOTAL_SEC - timeLeft;
    ovTitle.textContent = '全部消完';
    ovScore.textContent = fmtTime(used);
    ovSub.textContent = '用了 ' + (HINTS - hints) + ' 次提示 · ' + (SHUFFLES - shuffles) + ' 次重排';
    setTimeout(function () { overlay.classList.add('on'); }, 280);
    FB.Sound.play('win');
    paintHud();
  }

  function lose() {
    over = true;
    clearInterval(tickId); tickId = null;
    ovTitle.textContent = '时间到';
    ovScore.textContent = remain + ' 对';
    ovSub.textContent = '还剩 ' + remain + ' 对没消掉，再来一局？';
    overlay.classList.add('on');
    FB.Sound.play('lose');
    paintHud();
  }

  function tick() {
    if (paused || over) return;
    timeLeft--;
    paintTimer();
    if (timeLeft <= 0) lose();
  }

  function newGame() {
    FB.Sound.play('click');
    over = false;
    paused = false;
    lock = false;
    sel = null;
    hints = HINTS;
    shuffles = SHUFFLES;
    timeLeft = TOTAL_SEC;
    overlay.classList.remove('on');
    build();
    paintTimer();
    clearInterval(tickId);
    tickId = setInterval(tick, 1000);
  }

  /* ----------------------- 事件 ----------------------- */

  boardEl.addEventListener('click', function (e) {
    var el = e.target.closest('.ll-tile');
    if (!el) return;
    clickTile(parseInt(el.dataset.x, 10), parseInt(el.dataset.y, 10));
  });

  document.getElementById('hintBtn').addEventListener('click', function () {
    if (over || hints <= 0) return;
    var pair = anyPair();
    if (!pair) {
      FB.toast('当前没有可消的对子，试试重排');
      return;
    }
    hints--;
    paintHud();
    FB.Sound.play('pop');
    [pair[0], pair[1]].forEach(function (p) {
      var el = nodes[p.x + ',' + p.y];
      if (!el) return;
      el.classList.add('hint');
      setTimeout(function () { el.classList.remove('hint'); }, 1600);
    });
  });

  document.getElementById('shuffleBtn').addEventListener('click', function () {
    if (over || shuffles <= 0) return;
    doShuffle(true);
  });

  document.getElementById('newBtn').addEventListener('click', newGame);
  document.getElementById('ovNew').addEventListener('click', newGame);

  FB.Boss.onToggle = function (on) { paused = on; };

  newGame();
})();
