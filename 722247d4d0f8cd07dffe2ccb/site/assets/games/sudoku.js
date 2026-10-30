/* ============================================================
   摸鱼盒子 · 数独
   回溯生成完整解 → 逐格挖空并校验唯一解，保证每道题都能推出来。
   支持鼠标 + 键盘（1-9 / 退格 / 方向键），提示、查错、计时。
   ============================================================ */
(function () {
  'use strict';

  var GIVENS = { easy: 44, medium: 34, hard: 28 };
  var LEVEL_NAME = { easy: '简单', medium: '中等', hard: '困难' };

  var boardEl = document.getElementById('board');
  var padEl = document.getElementById('pad');
  var timeEl = document.getElementById('time');
  var filledEl = document.getElementById('filled');
  var hintsEl = document.getElementById('hints');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');

  var level = 'easy';
  var solution = [], puzzle = [], user = [];
  var sel = -1, hints = 0, done = false;
  var started = false, startAt = 0, elapsed = 0, paused = false, tickId = null;

  /* ----------------------- 生成 ----------------------- */

  function emptyGrid() {
    var g = [];
    for (var i = 0; i < 81; i++) g.push(0);
    return g;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function ok(g, idx, n) {
    var r = (idx / 9) | 0, c = idx % 9;
    var br = r - r % 3, bc = c - c % 3;
    for (var k = 0; k < 9; k++) {
      if (g[r * 9 + k] === n) return false;
      if (g[k * 9 + c] === n) return false;
    }
    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) if (g[(br + y) * 9 + bc + x] === n) return false;
    }
    return true;
  }

  function fill(g) {
    var i = g.indexOf(0);
    if (i < 0) return true;
    var nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (var k = 0; k < 9; k++) {
      if (!ok(g, i, nums[k])) continue;
      g[i] = nums[k];
      if (fill(g)) return true;
      g[i] = 0;
    }
    return false;
  }

  /* 数解的个数（最多数到 cap 个就停），用来保证唯一解 */
  function countSolutions(g, cap) {
    var best = -1, bestC = null;
    for (var i = 0; i < 81; i++) {
      if (g[i]) continue;
      var cs = [];
      for (var n = 1; n <= 9; n++) if (ok(g, i, n)) cs.push(n);
      if (!cs.length) return 0;
      if (!bestC || cs.length < bestC.length) {
        best = i; bestC = cs;
        if (cs.length === 1) break;
      }
    }
    if (best < 0) return 1;
    var total = 0;
    for (var k = 0; k < bestC.length; k++) {
      g[best] = bestC[k];
      total += countSolutions(g, cap - total);
      g[best] = 0;
      if (total >= cap) return cap;
    }
    return total;
  }

  function makePuzzle(givens) {
    var sol = emptyGrid();
    fill(sol);
    var puz = sol.slice();
    var idxs = shuffle(Object.keys(puz).map(Number));
    var target = 81 - givens, removed = 0;
    for (var k = 0; k < idxs.length && removed < target; k++) {
      var i = idxs[k];
      var bak = puz[i];
      puz[i] = 0;
      if (countSolutions(puz.slice(), 2) !== 1) puz[i] = bak;
      else removed++;
    }
    return { sol: sol, puz: puz };
  }

  /* ----------------------- 计时 ----------------------- */

  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function usedSeconds() {
    return elapsed + (started && !paused ? Math.floor((Date.now() - startAt) / 1000) : 0);
  }

  function tick() { timeEl.textContent = fmtTime(usedSeconds()); }

  function begin() {
    if (started || done) return;
    started = true;
    startAt = Date.now();
    tickId = setInterval(tick, 300);
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

  function stopTimer() {
    clearInterval(tickId); tickId = null;
  }

  /* ----------------------- 渲染 ----------------------- */

  function cellEl(i) { return boardEl.querySelector('.sd-cell[data-i="' + i + '"]'); }

  function conflicts() {
    var bad = {};
    var groups = [];
    var r, c, b;
    for (r = 0; r < 9; r++) {
      var row = [], col = [], box = [];
      for (c = 0; c < 9; c++) { row.push(r * 9 + c); col.push(c * 9 + r); }
      groups.push(row); groups.push(col);
    }
    for (b = 0; b < 9; b++) {
      var bb = [], br = ((b / 3) | 0) * 3, bc = (b % 3) * 3;
      for (var y = 0; y < 3; y++) for (var x = 0; x < 3; x++) bb.push((br + y) * 9 + bc + x);
      groups.push(bb);
    }
    groups.forEach(function (g) {
      var seen = {};
      g.forEach(function (i) {
        var v = user[i];
        if (!v) return;
        if (seen[v]) { bad[i] = 1; bad[seen[v]] = 1; }
        else seen[v] = i;
      });
    });
    return bad;
  }

  function render() {
    var bad = conflicts();
    var selVal = sel > -1 ? user[sel] : 0;
    var sr = sel > -1 ? (sel / 9) | 0 : -1;
    var sc = sel > -1 ? sel % 9 : -1;
    var sb = sel > -1 ? (((sel / 9) | 0) / 3 | 0) * 3 + ((sel % 9) / 3 | 0) : -1;

    for (var i = 0; i < 81; i++) {
      var el = cellEl(i);
      if (!el) continue;
      var v = user[i];
      el.textContent = v ? String(v) : '';
      var cls = 'sd-cell r' + ((i / 9) | 0) + ' c' + (i % 9);
      if (puzzle[i]) cls += ' fixed';
      if (bad[i]) cls += ' bad';
      if (sel > -1 && i !== sel) {
        var r = (i / 9) | 0, c = i % 9;
        var b = ((r / 3) | 0) * 3 + ((c / 3) | 0);
        if (r === sr || c === sc || b === sb) cls += ' peer';
        if (selVal && v === selVal) cls += ' same';
      }
      if (i === sel) cls += ' sel';
      el.className = cls;
    }

    var filled = 0;
    for (var k = 0; k < 81; k++) if (user[k]) filled++;
    filledEl.textContent = filled + '/81';

    /* 数字键上标出每个数字还剩几个 */
    var counts = {};
    for (var m = 0; m < 81; m++) if (user[m]) counts[user[m]] = (counts[user[m]] || 0) + 1;
    for (var n = 1; n <= 9; n++) {
      var key = padEl.querySelector('.sd-key[data-n="' + n + '"]');
      if (!key) continue;
      var left = 9 - (counts[n] || 0);
      key.classList.toggle('done', left <= 0);
      var em = key.querySelector('em');
      if (em) em.textContent = left > 0 ? left : '';
    }
  }

  function buildBoard() {
    var html = '';
    for (var i = 0; i < 81; i++) {
      html += '<div class="sd-cell r' + ((i / 9) | 0) + ' c' + (i % 9) + '" data-i="' + i + '"></div>';
    }
    boardEl.innerHTML = html;
  }

  function buildPad() {
    var html = '';
    for (var n = 1; n <= 9; n++) html += '<button class="sd-key" data-n="' + n + '">' + n + '<em></em></button>';
    html += '<button class="sd-key act" data-act="erase">擦除</button>';
    padEl.innerHTML = html;
  }

  /* ----------------------- 交互 ----------------------- */

  function select(i) {
    sel = i;
    render();
  }

  function put(n) {
    if (done || sel < 0) return;
    if (puzzle[sel]) { FB.Sound.play('bad'); return; }
    if (user[sel] === n) { user[sel] = 0; }   /* 再点一次同一个数就取消 */
    else user[sel] = n;
    begin();
    FB.Sound.play('move');
    render();
    checkWin();
  }

  function erase() {
    if (done || sel < 0 || puzzle[sel]) return;
    user[sel] = 0;
    FB.Sound.play('click');
    render();
  }

  function checkWin() {
    for (var i = 0; i < 81; i++) if (user[i] !== solution[i]) return;
    done = true;
    stopTimer();
    var sec = usedSeconds();
    /* 记下各难度的最快用时（越少越好，所以不走 Store.best 的只增逻辑） */
    var rec = FB.Store.get('sudoku.best', {}) || {};
    var isNew = !rec[level] || sec < rec[level];
    if (isNew) { rec[level] = sec; FB.Store.set('sudoku.best', rec); }
    ovTitle.textContent = '解开了';
    ovScore.textContent = fmtTime(sec);
    ovSub.textContent = '难度：' + LEVEL_NAME[level] +
      (hints ? ' · 用了 ' + hints + ' 次提示' : ' · 全程没要提示') +
      (isNew ? ' · 新纪录' : ' · 该难度最快 ' + fmtTime(rec[level]));
    setTimeout(function () { overlay.classList.add('on'); }, 300);
    FB.Sound.play('win');
  }

  function newGame() {
    FB.Sound.play('click');
    var made = makePuzzle(GIVENS[level]);
    solution = made.sol;
    puzzle = made.puz;
    user = puzzle.slice();
    sel = -1;
    hints = 0;
    done = false;
    started = false;
    paused = false;
    elapsed = 0;
    startAt = 0;
    stopTimer();
    timeEl.textContent = '0:00';
    hintsEl.textContent = '0';
    overlay.classList.remove('on');
    buildBoard();
    render();
  }

  /* 点格子 */
  boardEl.addEventListener('click', function (e) {
    var el = e.target.closest('.sd-cell');
    if (!el) return;
    select(parseInt(el.dataset.i, 10));
    FB.Sound.play('click');
  });

  /* 数字键盘 */
  padEl.addEventListener('click', function (e) {
    var key = e.target.closest('.sd-key');
    if (!key) return;
    if (key.dataset.act === 'erase') erase();
    else put(parseInt(key.dataset.n, 10));
  });

  /* 实体键盘 */
  document.addEventListener('keydown', function (e) {
    if (e.key >= '1' && e.key <= '9') { put(parseInt(e.key, 10)); return; }
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { erase(); return; }
    var d = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (d !== undefined) {
      if (sel < 0) { select(0); return; }
      var r = (sel / 9) | 0, c = sel % 9;
      if (d === -1 && c === 0) return;
      if (d === 1 && c === 8) return;
      var n = sel + d;
      if (n < 0 || n > 80) return;
      select(n);
    }
  });

  document.getElementById('levels').addEventListener('click', function (e) {
    var b = e.target.closest('.sd-chip');
    if (!b) return;
    if (b.dataset.lv === level) return;
    level = b.dataset.lv;
    this.querySelectorAll('.sd-chip').forEach(function (x) { x.classList.toggle('on', x === b); });
    newGame();
  });

  document.getElementById('newBtn').addEventListener('click', newGame);
  document.getElementById('ovNew').addEventListener('click', newGame);

  document.getElementById('hintBtn').addEventListener('click', function () {
    if (done) return;
    FB.Sound.play('pop');
    var target = -1;
    if (sel > -1 && !puzzle[sel] && user[sel] !== solution[sel]) target = sel;
    if (target < 0) {
      for (var i = 0; i < 81; i++) if (user[i] !== solution[i]) { target = i; break; }
    }
    if (target < 0) return;
    puzzle[target] = solution[target];
    user[target] = solution[target];
    hints++;
    hintsEl.textContent = hints;
    begin();
    render();
    var el = cellEl(target);
    if (el) { el.classList.add('hinted'); setTimeout(function () { el.classList.remove('hinted'); }, 420); }
    checkWin();
  });

  document.getElementById('checkBtn').addEventListener('click', function () {
    if (done) return;
    var wrong = 0;
    for (var i = 0; i < 81; i++) {
      if (!user[i] || user[i] === solution[i]) continue;
      wrong++;
      var el = cellEl(i);
      if (el) {
        el.classList.add('bad');
        (function (e2) { setTimeout(function () { e2.classList.remove('bad'); }, 1300); })(el);
      }
    }
    FB.Sound.play(wrong ? 'bad' : 'good');
    FB.toast(wrong ? '有 ' + wrong + ' 个数字填错了（闪红的格子）' : '目前填的都对');
  });

  FB.Boss.onToggle = function (on) { if (on) pause(); else resume(); };

  buildPad();
  newGame();
})();
