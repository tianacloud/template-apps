/* ============================================================
   摸鱼盒子 · 五子棋
   15×15，玩家执黑先手，AI 执白。AI 用「点位形态评分 + 一层前瞻」决策，
   不追求棋力，追求落子即时、看不出明显蠢棋。
   Z 悔棋（撤自己与 AI 各一手），R 重开。
   ============================================================ */
(function () {
  'use strict';

  var N = 15;
  var EMPTY = 0, BLACK = 1, WHITE = 2;
  var DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];
  var WIN_SCORE = 100000;      /* 成五 */
  var LIVE_FOUR = 12000;       /* 活四 */
  var FOUR = 1500;             /* 冲四 / 眠四 */
  var LIVE_THREE = 1200;       /* 活三 */

  var cv = document.getElementById('board');
  var ctx = cv.getContext('2d');
  var movesEl = document.getElementById('moves');
  var timeEl = document.getElementById('time');
  var recEl = document.getElementById('rec');
  var turnDot = document.getElementById('turnDot');
  var turnTxt = document.getElementById('turnTxt');
  var diffEl = document.getElementById('diff');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');

  var grid = [];
  var history = [];
  var turn = BLACK;
  var over = false, paused = false, thinking = false;
  var lastMove = null, winCells = null, hover = null;
  var sec = 0, tickId = null;
  var diff = 'normal';
  var rec = loadRec();

  /* 画布几何（CSS 像素） */
  var size = 0, cell = 0, pad = 0;

  /* ----------------------- 存档 ----------------------- */

  function loadRec() {
    var r = FB.Store.get('gomoku.rec', null);
    if (!r || typeof r.w !== 'number') r = { w: 0, l: 0 };
    return r;
  }

  function saveRec() { FB.Store.set('gomoku.rec', rec); }

  /* ----------------------- 棋盘 ----------------------- */

  function inside(x, y) { return x >= 0 && y >= 0 && x < N && y < N; }
  function get(x, y) { return inside(x, y) ? grid[y * N + x] : -1; }
  function put(x, y, v) { grid[y * N + x] = v; }

  function reset() {
    grid = new Array(N * N);
    for (var i = 0; i < grid.length; i++) grid[i] = EMPTY;
    history = [];
    turn = BLACK;
    over = false;
    thinking = false;
    lastMove = null;
    winCells = null;
    hover = null;
    sec = 0;
    overlay.classList.remove('on');
    clearInterval(tickId);
    tickId = setInterval(tick, 1000);
    paintHud();
  }

  function tick() {
    if (over || paused) return;
    if (!history.length) return;          /* 第一手落下才开始计时 */
    sec++;
    paintHud();
  }

  function paintHud() {
    movesEl.textContent = history.length;
    timeEl.textContent = FB.fmtTime(sec);
    recEl.textContent = rec.w + ':' + rec.l;
    var myTurn = !over && turn === BLACK;
    turnDot.className = 'gm-dot' + (myTurn ? '' : ' white');
    if (over) turnTxt.textContent = winCells && winCells.who === BLACK ? '你赢了' : 'AI 赢了';
    else if (thinking) turnTxt.textContent = 'AI 思考中…';
    else turnTxt.textContent = myTurn ? '轮到你落子' : 'AI 回合';
  }

  /* ----------------------- 落子 / 胜负 ----------------------- */

  function place(x, y, who) {
    put(x, y, who);
    var m = { x: x, y: y, who: who };
    history.push(m);
    lastMove = m;
    return m;
  }

  /* 返回连成 ≥5 的棋子数组，否则 null */
  function findWin(x, y, who) {
    for (var d = 0; d < 4; d++) {
      var dx = DIRS[d][0], dy = DIRS[d][1];
      var cells = [{ x: x, y: y }];
      for (var s = 1; s <= 4; s++) {
        if (get(x + dx * s, y + dy * s) !== who) break;
        cells.push({ x: x + dx * s, y: y + dy * s });
      }
      for (var s2 = 1; s2 <= 4; s2++) {
        if (get(x - dx * s2, y - dy * s2) !== who) break;
        cells.unshift({ x: x - dx * s2, y: y - dy * s2 });
      }
      if (cells.length >= 5) return cells;
    }
    return null;
  }

  function finish(who, cells) {
    over = true;
    thinking = false;
    winCells = { who: who, cells: cells };
    if (who === BLACK) rec.w++; else rec.l++;
    saveRec();
    paintHud();
    draw();

    ovTitle.textContent = who === BLACK ? '你赢了' : 'AI 赢了';
    ovScore.textContent = history.length + ' 手';
    ovSub.textContent = '用时 ' + FB.fmtTime(sec) + ' · 战绩 胜 ' + rec.w + ' 负 ' + rec.l;
    setTimeout(function () { overlay.classList.add('on'); }, 320);
    FB.Sound.play(who === BLACK ? 'win' : 'lose');
  }

  function drawGame() {
    /* 棋盘下满仍未分胜负 */
    over = true;
    paintHud();
    ovTitle.textContent = '和棋';
    ovScore.textContent = history.length + ' 手';
    ovSub.textContent = '棋盘满了，谁也没连成五子';
    overlay.classList.add('on');
    FB.Sound.play('pop');
  }

  /* ----------------------- 评估函数 ----------------------- */

  /* 连子形态打分：c 连子数，o1/o2 两端是否为空 */
  function shapeScore(c, o1, o2) {
    if (c >= 5) return WIN_SCORE;
    if (c === 4) return (o1 && o2) ? LIVE_FOUR : ((o1 || o2) ? FOUR : 0);
    if (c === 3) return (o1 && o2) ? LIVE_THREE : ((o1 || o2) ? 160 : 0);
    if (c === 2) return (o1 && o2) ? 120 : ((o1 || o2) ? 18 : 0);
    if (c === 1) return (o1 && o2) ? 14 : ((o1 || o2) ? 4 : 0);
    return 0;
  }

  /* 假设 who 落在 (x,y)，该点能形成的价值总和 */
  function evalPoint(x, y, who) {
    var total = 0;
    for (var d = 0; d < 4; d++) {
      var dx = DIRS[d][0], dy = DIRS[d][1];
      var c = 1, o1 = 0, o2 = 0;
      for (var s = 1; s <= 4; s++) {
        var nx = x + dx * s, ny = y + dy * s;
        if (!inside(nx, ny)) break;
        var v = get(nx, ny);
        if (v === who) { c++; continue; }
        if (v === EMPTY) o1 = 1;
        break;
      }
      for (var t = 1; t <= 4; t++) {
        var mx = x - dx * t, my = y - dy * t;
        if (!inside(mx, my)) break;
        var v2 = get(mx, my);
        if (v2 === who) { c++; continue; }
        if (v2 === EMPTY) o2 = 1;
        break;
      }
      total += shapeScore(c, o1, o2);
    }
    return total;
  }

  /* 候选点：已有棋子周围 2 格内的空位 */
  function candidates() {
    var out = [];
    var has = false;
    for (var i = 0; i < grid.length; i++) if (grid[i] !== EMPTY) { has = true; break; }
    if (!has) return [{ x: 7, y: 7 }];

    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        if (get(x, y) !== EMPTY) continue;
        var near = false;
        for (var dy = -2; dy <= 2 && !near; dy++) {
          for (var dx = -2; dx <= 2; dx++) {
            if (get(x + dx, y + dy) > 0) { near = true; break; }
          }
        }
        if (near) out.push({ x: x, y: y });
      }
    }
    return out;
  }

  /* 一层前瞻：AI 落 c 后，玩家最好的回应能形成多大威胁 */
  function lookaheadPenalty(c) {
    put(c.x, c.y, WHITE);
    var list = candidates();
    var bestOp = 0;
    for (var i = 0; i < list.length; i++) {
      var v = evalPoint(list[i].x, list[i].y, BLACK);
      if (v > bestOp) bestOp = v;
    }
    put(c.x, c.y, EMPTY);
    if (bestOp >= WIN_SCORE) return 600000;
    if (bestOp >= LIVE_FOUR) return 9000;
    if (bestOp >= FOUR) return 900;
    if (bestOp >= LIVE_THREE) return 300;
    return 0;
  }

  function pickRand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function aiPick() {
    var list = candidates();
    if (!list.length) return null;
    var i;

    /* 简单难度：小概率随手乱下 */
    if (diff === 'easy' && Math.random() < 0.34) return pickRand(list);

    var opW = diff === 'easy' ? 0.45 : (diff === 'hard' ? 1.05 : 0.9);
    var myScore = [], opScore = [];
    for (i = 0; i < list.length; i++) {
      myScore.push(evalPoint(list[i].x, list[i].y, WHITE));
      opScore.push(evalPoint(list[i].x, list[i].y, BLACK));
    }

    /* 1) 自己这一手能成五 → 直接赢 */
    for (i = 0; i < list.length; i++) if (myScore[i] >= WIN_SCORE) return list[i];
    /* 2) 对手这一手能成五 → 必须堵 */
    var blocks = [];
    for (i = 0; i < list.length; i++) if (opScore[i] >= WIN_SCORE) blocks.push(list[i]);
    if (blocks.length) return pickRand(blocks);

    if (diff !== 'easy') {
      /* 3) 自己一手能做出活四 → 先手进攻 */
      var myFour = [];
      for (i = 0; i < list.length; i++) if (myScore[i] >= LIVE_FOUR) myFour.push(list[i]);
      if (myFour.length) return pickRand(myFour);
      /* 4) 对手一手能做出四（活四或冲四）→ 必须封堵 */
      var opFour = [];
      for (i = 0; i < list.length; i++) if (opScore[i] >= FOUR) opFour.push(list[i]);
      if (opFour.length) return pickRand(opFour);
    }

    /* 5) 综合评分 */
    var scored = [];
    for (i = 0; i < list.length; i++) {
      scored.push({ c: list[i], v: myScore[i] + opScore[i] * opW });
    }
    scored.sort(function (a, b) { return b.v - a.v; });

    if (diff === 'hard') {
      /* 只在前 8 个候选里做前瞻，避免拖慢手感 */
      var top = scored.slice(0, 8);
      var bestV = -Infinity, pickHard = top[0];
      for (i = 0; i < top.length; i++) {
        var v2 = top[i].v - lookaheadPenalty(top[i].c);
        if (v2 > bestV) { bestV = v2; pickHard = top[i]; }
      }
      return pickHard.c;
    }

    /* 简单 / 普通：在最高分附近随机，避免每次都下同一个点 */
    var ties = [];
    var best = scored[0].v;
    var spread = diff === 'easy' ? best * 0.55 : best * 0.12;
    for (i = 0; i < scored.length; i++) if (scored[i].v >= best - spread) ties.push(scored[i].c);
    return pickRand(ties);
  }

  function aiTurn() {
    if (over || paused) return;
    thinking = true;
    paintHud();
    /* 让出一帧，让「AI 思考中」有机会渲染出来 */
    setTimeout(function () {
      if (over || paused) { thinking = false; paintHud(); return; }
      var p = aiPick();
      thinking = false;
      if (!p) { drawGame(); return; }
      place(p.x, p.y, WHITE);
      turn = BLACK;
      var w = findWin(p.x, p.y, WHITE);
      FB.Sound.play('move');
      paintHud();
      draw();
      if (w) finish(WHITE, w);
    }, diff === 'hard' ? 30 : 10);
  }

  /* ----------------------- 玩家落子 ----------------------- */

  function playerAt(x, y) {
    if (over || paused || thinking || turn !== BLACK) return;
    if (!inside(x, y) || get(x, y) !== EMPTY) return;
    place(x, y, BLACK);
    turn = WHITE;
    hover = null;
    var w = findWin(x, y, BLACK);
    FB.Sound.play('pop');
    paintHud();
    draw();
    if (w) { finish(BLACK, w); return; }
    if (history.length >= N * N) { drawGame(); return; }
    aiTurn();
  }

  function undo() {
    if (over || paused || thinking || !history.length) return;
    /* 撤一整轮：AI 的一手 + 自己的一手 */
    var removed = 0;
    while (history.length && removed < 2) {
      var m = history.pop();
      put(m.x, m.y, EMPTY);
      removed++;
    }
    turn = BLACK;
    lastMove = history.length ? history[history.length - 1] : null;
    winCells = null;
    FB.Sound.play('click');
    paintHud();
    draw();
  }

  /* ----------------------- 绘制 ----------------------- */

  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  function layout() {
    var maxW = Math.min(window.innerWidth * 0.93, 460);
    var wrap = cv.parentNode.clientWidth || maxW;
    var w = Math.max(240, Math.min(maxW, wrap > 0 ? wrap : maxW));
    size = Math.round(w);
    cell = size / N;
    pad = cell / 2;

    var dpr = window.devicePixelRatio || 1;
    cv.style.width = size + 'px';
    cv.style.height = size + 'px';
    cv.width = Math.round(size * dpr);
    cv.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function px(i) { return pad + i * cell; }

  function draw() {
    var dark = isDark();
    var bg = dark ? '#343b50' : '#f4e9d6';
    var line = dark ? '#5a6482' : '#cbb28d';
    var star = dark ? '#7c88a8' : '#a98f68';

    ctx.clearRect(0, 0, size, size);

    /* 底 */
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    /* 网格 */
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < N; i++) {
      var p = Math.round(px(i)) + 0.5;
      ctx.moveTo(px(0), p); ctx.lineTo(px(N - 1), p);
      ctx.moveTo(p, px(0)); ctx.lineTo(p, px(N - 1));
    }
    ctx.stroke();

    /* 星位 */
    ctx.fillStyle = star;
    [[3, 3], [11, 3], [3, 11], [11, 11], [7, 7]].forEach(function (s) {
      ctx.beginPath();
      ctx.arc(px(s[0]), px(s[1]), Math.max(2, cell * 0.09), 0, Math.PI * 2);
      ctx.fill();
    });

    /* 悬停预览 */
    if (hover && !over && !paused && turn === BLACK && get(hover.x, hover.y) === EMPTY) {
      ctx.globalAlpha = 0.28;
      stone(hover.x, hover.y, BLACK);
      ctx.globalAlpha = 1;
    }

    /* 棋子 */
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        var v = get(x, y);
        if (v !== EMPTY) stone(x, y, v);
      }
    }

    /* 最后一手标记 */
    if (lastMove) {
      ctx.beginPath();
      ctx.arc(px(lastMove.x), px(lastMove.y), Math.max(2, cell * 0.1), 0, Math.PI * 2);
      ctx.fillStyle = '#e8564f';
      ctx.fill();
    }

    /* 连五高亮 */
    if (winCells) {
      var a = winCells.cells[0], b = winCells.cells[winCells.cells.length - 1];
      ctx.save();
      ctx.strokeStyle = 'rgba(232, 86, 79, .85)';
      ctx.lineWidth = Math.max(2.5, cell * 0.14);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px(a.x), px(a.y));
      ctx.lineTo(px(b.x), px(b.y));
      ctx.stroke();
      ctx.restore();
    }
  }

  function stone(x, y, who) {
    var cx = px(x), cy = px(y), r = cell * 0.43;
    var g = ctx.createRadialGradient(cx - r * 0.34, cy - r * 0.38, r * 0.12, cx, cy, r);
    if (who === BLACK) {
      g.addColorStop(0, '#5b6479');
      g.addColorStop(1, '#20263a');
    } else {
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, '#dfe6f2');
    }
    ctx.save();
    ctx.shadowColor = 'rgba(16, 22, 38, .28)';
    ctx.shadowBlur = Math.max(2, cell * 0.16);
    ctx.shadowOffsetY = Math.max(1, cell * 0.05);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();

    if (who === WHITE) {
      ctx.beginPath();
      ctx.arc(cx, cy, r - 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(52, 66, 92, .28)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      /* 黑子在暗色主题下与棋盘底太接近，补一圈浅色描边保证可辨识 */
      ctx.beginPath();
      ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = isDark() ? 'rgba(255, 255, 255, .26)' : 'rgba(255, 255, 255, .16)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /* ----------------------- 事件 ----------------------- */

  function hit(e) {
    var r = cv.getBoundingClientRect();
    var mx = (e.clientX !== undefined ? e.clientX : 0) - r.left;
    var my = (e.clientY !== undefined ? e.clientY : 0) - r.top;
    var x = Math.round((mx - pad) / cell);
    var y = Math.round((my - pad) / cell);
    if (!inside(x, y)) return null;
    /* 点太靠格线外沿也要能定位到最近的交叉点，这里用半格容差 */
    return { x: x, y: y };
  }

  cv.addEventListener('click', function (e) {
    var p = hit(e);
    if (p) playerAt(p.x, p.y);
  });

  cv.addEventListener('mousemove', function (e) {
    var p = hit(e);
    if (!p) { if (hover) { hover = null; draw(); } return; }
    if (hover && hover.x === p.x && hover.y === p.y) return;
    if (get(p.x, p.y) !== EMPTY) { if (hover) { hover = null; draw(); } return; }
    hover = p;
    draw();
  });

  cv.addEventListener('mouseleave', function () {
    if (hover) { hover = null; draw(); }
  });

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'z' || k === 'Z') undo();
    else if (k === 'r' || k === 'R') { FB.Sound.play('click'); reset(); draw(); }
  });

  diffEl.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-d]');
    if (!b) return;
    diff = b.dataset.d;
    [].forEach.call(diffEl.querySelectorAll('button'), function (el) {
      el.classList.toggle('on', el === b);
    });
    FB.Sound.play('click');
    FB.toast('难度：' + b.textContent);
  });

  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('newBtn').addEventListener('click', function () {
    FB.Sound.play('click');
    reset();
    draw();
  });
  document.getElementById('ovNew').addEventListener('click', function () {
    FB.Sound.play('click');
    overlay.classList.remove('on');
    reset();
    draw();
  });
  document.getElementById('ovLook').addEventListener('click', function () {
    FB.Sound.play('click');
    overlay.classList.remove('on');
  });

  /* 主题切换后棋盘需要按新配色重画 */
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (muts[i].attributeName === 'data-theme') { draw(); return; }
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  var rzT = null;
  window.addEventListener('resize', function () {
    clearTimeout(rzT);
    rzT = setTimeout(layout, 120);
  });

  FB.Boss.onToggle = function (on) { paused = on; };

  reset();
  layout();
})();
