/* ============================================================
   摸鱼盒子 · 数字推盘
   3×3 / 4×4 / 5×5 三种规格，空格旁的方块可以滑进空格。
   洗牌方式：从解好的状态出发做随机合法移动，因此必然可解
   （不走回头路，避免洗完还跟原来差不多）。
   ============================================================ */
(function () {
  'use strict';

  var DIFFS = [
    { n: 3, label: '3 × 3', steps: 90 },
    { n: 4, label: '4 × 4', steps: 220 },
    { n: 5, label: '5 × 5', steps: 420 }
  ];

  var boardEl = document.getElementById('board');
  var diffsEl = document.getElementById('diffs');
  var movesEl = document.getElementById('moves');
  var timeEl = document.getElementById('time');
  var bestEl = document.getElementById('best');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');
  var ovBigger = document.getElementById('ovBigger');

  var bestStore = FB.Store.get('slide.best', {}) || {};
  if (typeof bestStore !== 'object' || Array.isArray(bestStore)) bestStore = {};

  var N = 4;
  var board = [];
  var blank = 0;
  var tiles = {};
  var moves = 0;
  var history = [];
  var solved = false;
  var paused = false;
  var started = false;
  var startAt = 0;
  var elapsed = 0;
  var tickId = null;

  function neighbors(i, n) {
    var x = i % n, y = (i - x) / n, out = [];
    if (x > 0) out.push(i - 1);
    if (x < n - 1) out.push(i + 1);
    if (y > 0) out.push(i - n);
    if (y < n - 1) out.push(i + n);
    return out;
  }

  function disorder(b, n) {
    var d = 0;
    for (var i = 0; i < b.length; i++) {
      var v = b[i];
      if (!v) continue;
      var t = v - 1;
      d += Math.abs(i % n - t % n) + Math.abs(Math.floor(i / n) - Math.floor(t / n));
    }
    return d;
  }

  /* 从解态随机游走，保证结果一定可解 */
  function makeShuffle(n, times) {
    var total = n * n;
    var b = [];
    for (var v = 1; v < total; v++) b.push(v);
    b.push(0);
    var bl = total - 1;
    var back = -1;

    for (var s = 0; s < times; s++) {
      var nb = neighbors(bl, n);
      var pick = nb.filter(function (x) { return x !== back; });
      if (!pick.length) pick = nb;
      var to = pick[Math.floor(Math.random() * pick.length)];
      b[bl] = b[to];
      b[to] = 0;
      back = bl;
      bl = to;
    }
    return { board: b, blank: bl };
  }

  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function bestOf(n) {
    var r = bestStore[String(n)];
    return (r && r.m) ? r : null;
  }

  function paintBest() {
    var r = bestOf(N);
    bestEl.textContent = r ? r.m + ' 步' : '—';
  }

  function buildTiles() {
    boardEl.innerHTML = '';
    tiles = {};
    var total = N * N;
    for (var v = 1; v < total; v++) {
      var el = document.createElement('div');
      el.className = 'ss-tile';
      el.setAttribute('data-v', v);
      el.innerHTML = '<div class="ss-face">' + v + '</div>';
      el.style.width = (100 / N) + '%';
      el.style.height = (100 / N) + '%';
      boardEl.appendChild(el);
      tiles[v] = el;
    }
  }

  function paint() {
    for (var i = 0; i < board.length; i++) {
      var v = board[i];
      if (!v) continue;
      var el = tiles[v];
      if (!el) continue;
      var x = i % N, y = (i - x) / N;
      el.style.width = (100 / N) + '%';
      el.style.height = (100 / N) + '%';
      el.style.transform = 'translate(' + (x * 100) + '%,' + (y * 100) + '%)';
    }
  }

  function paintCorrect() {
    for (var i = 0; i < board.length; i++) {
      var v = board[i];
      if (!v || !tiles[v]) continue;
      if (v === i + 1) tiles[v].classList.add('ok');
      else tiles[v].classList.remove('ok');
    }
  }

  function isSolved() {
    for (var i = 0; i < N * N - 1; i++) if (board[i] !== i + 1) return false;
    return board[N * N - 1] === 0;
  }

  function begin() {
    if (started) return;
    started = true;
    startAt = Date.now();
    tickId = setInterval(tick, 250);
  }

  function tick() {
    var sec = elapsed + (started && !paused ? Math.floor((Date.now() - startAt) / 1000) : 0);
    timeEl.textContent = fmtTime(sec);
  }

  function usedSeconds() {
    return elapsed + (started && !paused ? Math.floor((Date.now() - startAt) / 1000) : 0);
  }

  function pause() {
    if (!started || paused) return;
    elapsed += Math.floor((Date.now() - startAt) / 1000);
    paused = true;
    tick();
  }

  function resume() {
    if (!started || !paused) return;
    paused = false;
    startAt = Date.now();
  }

  function newGame(n) {
    if (n) {
      for (var i = 0; i < DIFFS.length; i++) if (DIFFS[i].n === n) N = n;
    }
    var cfg = DIFFS.filter(function (d) { return d.n === N; })[0];
    var res, guard = 0;
    do {
      res = makeShuffle(N, cfg.steps);
      guard++;
    } while (disorder(res.board, N) < N * N && guard < 25);

    board = res.board;
    blank = res.blank;
    moves = 0;
    history = [];
    solved = false;
    started = false;
    paused = false;
    elapsed = 0;
    startAt = 0;
    clearInterval(tickId);
    tickId = null;

    overlay.classList.remove('on');
    buildTiles();
    paint();
    paintCorrect();
    movesEl.textContent = '0';
    timeEl.textContent = '0:00';
    paintBest();
    renderDiffs();
  }

  function byCell(i) {
    var x = i % N, y = (i - x) / N;
    return { x: x, y: y };
  }

  function tryMove(i) {
    if (solved || paused) return false;
    if (i === blank || i < 0 || i >= board.length) return false;
    var a = byCell(i), b = byCell(blank);
    if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) !== 1) {
      var el = tiles[board[i]];
      if (el) {
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
        setTimeout(function () { el.classList.remove('pop'); }, 220);
      }
      return false;
    }
    begin();
    history.push({ from: i, to: blank });
    var v = board[i];
    board[blank] = v;
    board[i] = 0;
    blank = i;
    moves++;
    movesEl.textContent = moves;
    paint();
    paintCorrect();
    FB.Sound.play('pop');
    if (isSolved()) win();
    return true;
  }

  function undo() {
    if (solved || !history.length) return;
    var h = history.pop();
    board[h.to] = board[h.from];
    board[h.from] = 0;
    blank = h.from;
    moves = Math.max(0, moves - 1);
    movesEl.textContent = moves;
    paint();
    paintCorrect();
    FB.Sound.play('click');
  }

  function win() {
    solved = true;
    clearInterval(tickId);
    tickId = null;
    var sec = usedSeconds();

    for (var v in tiles) if (tiles[v]) tiles[v].classList.add('ok');

    var key = String(N);
    var prev = bestOf(N);
    var isNew = !prev || moves < prev.m;
    if (isNew) {
      bestStore[key] = { m: moves, t: sec };
      FB.Store.set('slide.best', bestStore);
    }
    paintBest();

    var bigger = DIFFS.filter(function (d) { return d.n > N; })[0];
    ovTitle.textContent = '排好了';
    ovScore.textContent = moves + ' 步';
    ovSub.textContent = '用时 ' + fmtTime(sec) + ' · ' +
      (isNew ? '刷新了 ' + N + '×' + N + ' 的最少步数' : '该规格最少 ' + prev.m + ' 步');
    ovBigger.textContent = bigger ? '试试 ' + bigger.label : '回到 3 × 3';
    setTimeout(function () { overlay.classList.add('on'); }, 340);
    FB.Sound.play('win');
  }

  function renderDiffs() {
    diffsEl.innerHTML = DIFFS.map(function (d) {
      var r = bestOf(d.n);
      return '<button class="ss-diff' + (d.n === N ? ' on' : '') + '" data-n="' + d.n + '"' +
        ' title="' + (r ? '最少 ' + r.m + ' 步' : '还没排好过') + '">' + d.label + '</button>';
    }).join('');
  }

  /* ----------------------- 事件 ----------------------- */

  diffsEl.addEventListener('click', function (e) {
    var el = e.target.closest('.ss-diff');
    if (!el) return;
    FB.Sound.play('click');
    newGame(parseInt(el.getAttribute('data-n'), 10));
  });

  boardEl.addEventListener('click', function (e) {
    var el = e.target.closest('.ss-tile');
    if (!el) return;
    var v = parseInt(el.getAttribute('data-v'), 10);
    var i = board.indexOf(v);
    if (i >= 0) tryMove(i);
  });

  var ARROW = {
    arrowup: 1, arrowdown: 1, arrowleft: 2, arrowright: 2
  };

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if (ARROW[k]) {
      e.preventDefault();
      if (solved || paused) return;
      var x = blank % N, y = (blank - x) / N;
      if (k === 'arrowup' && y > 0) tryMove(blank - N);
      else if (k === 'arrowdown' && y < N - 1) tryMove(blank + N);
      else if (k === 'arrowleft' && x > 0) tryMove(blank - 1);
      else if (k === 'arrowright' && x < N - 1) tryMove(blank + 1);
      return;
    }
    if (k === 'n') { e.preventDefault(); FB.Sound.play('click'); newGame(); }
    else if (k === 'z') { e.preventDefault(); undo(); }
  });

  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('newBtn').addEventListener('click', function () {
    FB.Sound.play('click');
    newGame();
  });
  document.getElementById('ovAgain').addEventListener('click', function () {
    FB.Sound.play('click');
    newGame();
  });
  ovBigger.addEventListener('click', function () {
    FB.Sound.play('click');
    var bigger = DIFFS.filter(function (d) { return d.n > N; })[0];
    newGame(bigger ? bigger.n : 3);
  });

  FB.Boss.onToggle = function (on) {
    if (on) pause(); else resume();
  };

  newGame(4);
})();
