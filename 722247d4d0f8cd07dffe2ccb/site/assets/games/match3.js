/* ============================================================
   摸鱼盒子 · 消消乐
   8×8，6 种图案。交换相邻两块，横竖连成 3 个以上即消除；
   消除后上方落下补新，形成连锁时分数按连锁次数加倍。
   90 秒限时，最高分保存在应用中。
   ============================================================ */
(function () {
  'use strict';

  var COLS = 8, ROWS = 8, KINDS = 6;
  var TIME_LIMIT = 90;
  var BASE = 10;

  var SHAPES = [
    { c: '#ef5350', p: '<circle cx="12" cy="12" r="8.4"/>' },
    { c: '#3f7bec', p: '<rect x="4.4" y="4.4" width="15.2" height="15.2" rx="2.4"/>' },
    { c: '#2fb36b', p: '<path d="M12 3.8l8.2 15.4H3.8z"/>' },
    { c: '#e8b02a', p: '<path d="M12 3.4l2.7 6.4 6.9.6-5.2 4.6 1.6 6.8L12 18.1l-6 3.7 1.6-6.8-5.2-4.6 6.9-.6z"/>' },
    { c: '#8e5ce6', p: '<path d="M20.2 14.6A8.6 8.6 0 1 1 9.4 3.8a7 7 0 0 0 10.8 10.8z"/>' },
    { c: '#18a5b8', p: '<path d="M12 3.6l7.3 4.2v8.4L12 20.4l-7.3-4.2V7.8z"/>' }
  ];

  var boardEl = document.getElementById('board');
  var timebarEl = document.getElementById('timebar');
  var barFill = timebarEl.querySelector('i');
  var scoreEl = document.getElementById('score');
  var timeEl = document.getElementById('time');
  var bestEl = document.getElementById('best');
  var overlay = document.getElementById('overlay');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');

  var grid = [];
  var cellEl = [];
  var sel = null;
  var score = 0;
  var best = FB.Store.get('match3.best', 0) || 0;
  var remain = TIME_LIMIT;
  var over = false;
  var busy = false;
  var started = false;
  var startAt = 0;
  var tickId = null;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function ri(n) { return Math.floor(Math.random() * n); }

  function snapshot() {
    return grid.map(function (row) { return row.slice(); });
  }

  function buildCells() {
    boardEl.innerHTML = '';
    cellEl = [];
    for (var y = 0; y < ROWS; y++) {
      var row = [];
      for (var x = 0; x < COLS; x++) {
        var el = document.createElement('div');
        el.className = 'm3-cell';
        el.setAttribute('data-x', x);
        el.setAttribute('data-y', y);
        boardEl.appendChild(el);
        row.push(el);
      }
      cellEl.push(row);
    }
  }

  function findMatches() {
    var set = {};
    for (var y = 0; y < ROWS; y++) {
      var run = 1;
      for (var x = 1; x <= COLS; x++) {
        var same = x < COLS && grid[y][x] >= 0 && grid[y][x] === grid[y][x - 1];
        if (same) {
          run++;
        } else {
          if (run >= 3) for (var k = x - run; k < x; k++) set[y * COLS + k] = true;
          run = 1;
        }
      }
    }
    for (var x2 = 0; x2 < COLS; x2++) {
      var run2 = 1;
      for (var y2 = 1; y2 <= ROWS; y2++) {
        var same2 = y2 < ROWS && grid[y2][x2] >= 0 && grid[y2][x2] === grid[y2 - 1][x2];
        if (same2) {
          run2++;
        } else {
          if (run2 >= 3) for (var k2 = y2 - run2; k2 < y2; k2++) set[k2 * COLS + x2] = true;
          run2 = 1;
        }
      }
    }
    return Object.keys(set).map(Number);
  }

  function swapVals(x1, y1, x2, y2) {
    var t = grid[y1][x1];
    grid[y1][x1] = grid[y2][x2];
    grid[y2][x2] = t;
  }

  function findMove() {
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        if (x + 1 < COLS) {
          swapVals(x, y, x + 1, y);
          var a = findMatches().length > 0;
          swapVals(x, y, x + 1, y);
          if (a) return [{ x: x, y: y }, { x: x + 1, y: y }];
        }
        if (y + 1 < ROWS) {
          swapVals(x, y, x, y + 1);
          var b = findMatches().length > 0;
          swapVals(x, y, x, y + 1);
          if (b) return [{ x: x, y: y }, { x: x, y: y + 1 }];
        }
      }
    }
    return null;
  }

  function makeGrid() {
    var guard = 0;
    do {
      grid = [];
      for (var y = 0; y < ROWS; y++) {
        var row = [];
        for (var x = 0; x < COLS; x++) {
          var bad = [];
          if (x >= 2 && row[x - 1] === row[x - 2]) bad.push(row[x - 1]);
          if (y >= 2 && grid[y - 1][x] === grid[y - 2][x]) bad.push(grid[y - 1][x]);
          var k;
          var g2 = 0;
          do { k = ri(KINDS); g2++; } while (bad.indexOf(k) > -1 && g2 < 40);
          row.push(k);
        }
        grid.push(row);
      }
      guard++;
    } while (!findMove() && guard < 30);
  }

  function render(prev) {
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        var k = grid[y][x];
        var el = cellEl[y][x];
        var changed = !prev || prev[y][x] !== k;
        if (!changed) continue;
        if (k < 0) { el.innerHTML = ''; continue; }
        el.innerHTML = '<svg viewBox="0 0 24 24" fill="' + SHAPES[k].c + '">' + SHAPES[k].p + '</svg>';
        if (prev) {
          el.animate(
            [{ transform: 'translateY(-24px)', opacity: .35 }, { transform: 'none', opacity: 1 }],
            { duration: 190, easing: 'ease-out' }
          );
        }
      }
    }
  }

  function dropAndFill() {
    for (var x = 0; x < COLS; x++) {
      var write = ROWS - 1;
      for (var y = ROWS - 1; y >= 0; y--) {
        if (grid[y][x] >= 0) {
          if (write !== y) {
            grid[write][x] = grid[y][x];
            grid[y][x] = -1;
          }
          write--;
        }
      }
      for (var y2 = write; y2 >= 0; y2--) grid[y2][x] = ri(KINDS);
    }
  }

  async function resolve() {
    var combo = 0;
    while (true) {
      var m = findMatches();
      if (!m.length) break;
      combo++;
      var gain = m.length * BASE * combo;
      score += gain;
      scoreEl.textContent = FB.fmtNum(score);

      if (m.length >= 5) FB.Sound.play('good');
      else FB.Sound.play('pop');

      m.forEach(function (i) {
        var y = Math.floor(i / COLS), x = i % COLS;
        cellEl[y][x].animate(
          [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.18)', opacity: 0 }],
          { duration: 170, easing: 'ease-in' }
        );
      });
      await sleep(170);

      m.forEach(function (i) {
        var y = Math.floor(i / COLS), x = i % COLS;
        grid[y][x] = -1;
        cellEl[y][x].innerHTML = '';
      });

      var before = snapshot();
      dropAndFill();
      render(before);
      await sleep(195);

      if (combo >= 2 && combo < 6) FB.toast('连锁 ×' + combo + ' · +' + gain);
    }

    if (!findMove()) {
      var reshuffled = 0;
      do {
        makeGrid();
        reshuffled++;
      } while (!findMove() && reshuffled < 20);
      render(null);
      FB.toast('没有可消的了，重新摆一遍');
    }
    return combo;
  }

  function paintTime() {
    var m = Math.floor(remain / 60), s = remain % 60;
    timeEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    var pct = Math.max(0, remain / TIME_LIMIT) * 100;
    barFill.style.width = pct + '%';
    if (remain <= 15) timebarEl.classList.add('low');
    else timebarEl.classList.remove('low');
  }

  function startClock() {
    if (started) return;
    started = true;
    startAt = Date.now();
    tickId = setInterval(tickTime, 250);
  }

  function tickTime() {
    if (over) return;
    var used = Math.floor((Date.now() - startAt) / 1000);
    remain = Math.max(0, TIME_LIMIT - used);
    paintTime();
    if (remain <= 0) {
      over = true;
      clearInterval(tickId);
      tickId = null;
      if (!busy) endGame();
    }
  }

  function endGame() {
    var isNew = score > best;
    if (isNew) {
      best = score;
      FB.Store.set('match3.best', best);
    }
    bestEl.textContent = FB.fmtNum(best);
    ovScore.textContent = FB.fmtNum(score) + ' 分';
    ovSub.textContent = isNew ? '刷新了最高分' : '最高分 ' + FB.fmtNum(best);
    overlay.classList.add('on');
    FB.Sound.play(isNew ? 'win' : 'lose');
  }

  function clearSel() {
    if (sel && cellEl[sel.y] && cellEl[sel.y][sel.x]) cellEl[sel.y][sel.x].classList.remove('sel');
    sel = null;
  }

  function cellAt(x, y) { return cellEl[y] && cellEl[y][x] ? cellEl[y][x] : null; }

  function selectCell(x, y) {
    var el = cellAt(x, y);
    if (!el) return;
    clearSel();
    sel = { x: x, y: y };
    el.classList.add('sel');
  }

  async function trySwap(x1, y1, x2, y2) {
    startClock();
    busy = true;
    clearSel();
    swapVals(x1, y1, x2, y2);
    var va = grid[y1][x1], vb = grid[y2][x2];
    var ea = cellAt(x1, y1), eb = cellAt(x2, y2);
    paintCell(ea, va);
    paintCell(eb, vb);
    ea.animate([{ transform: 'scale(.86)' }, { transform: 'none' }], { duration: 150 });
    eb.animate([{ transform: 'scale(.86)' }, { transform: 'none' }], { duration: 150 });
    await sleep(120);

    if (!findMatches().length) {
      swapVals(x1, y1, x2, y2);
      paintCell(ea, grid[y1][x1]);
      paintCell(eb, grid[y2][x2]);
      ea.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }],
        { duration: 200 });
      eb.animate([{ transform: 'translateX(4px)' }, { transform: 'translateX(-4px)' }, { transform: 'none' }],
        { duration: 200 });
      FB.Sound.play('bad');
      busy = false;
      return false;
    }

    FB.Sound.play('click');
    await resolve();
    busy = false;
    if (over) endGame();
    return true;
  }

  function paintCell(el, k) {
    if (!el) return;
    if (k < 0) { el.innerHTML = ''; return; }
    el.innerHTML = '<svg viewBox="0 0 24 24" fill="' + SHAPES[k].c + '">' + SHAPES[k].p + '</svg>';
  }

  function newGame() {
    clearInterval(tickId);
    tickId = null;
    over = false;
    busy = false;
    score = 0;
    remain = TIME_LIMIT;
    scoreEl.textContent = '0';
    bestEl.textContent = FB.fmtNum(best);
    overlay.classList.remove('on');
    clearSel();
    makeGrid();
    if (!cellEl.length) buildCells();
    render(null);
    paintTime();
    started = false;
    startAt = 0;
  }

  /* ----------------------- 事件 ----------------------- */

  boardEl.addEventListener('click', function (e) {
    var el = e.target.closest('.m3-cell');
    if (!el || over || busy) return;
    var x = parseInt(el.getAttribute('data-x'), 10);
    var y = parseInt(el.getAttribute('data-y'), 10);

    if (!sel) { selectCell(x, y); return; }
    if (sel.x === x && sel.y === y) { clearSel(); return; }

    var dx = Math.abs(sel.x - x), dy = Math.abs(sel.y - y);
    if (dx + dy === 1) {
      trySwap(sel.x, sel.y, x, y);
    } else {
      selectCell(x, y);
    }
  });

  document.getElementById('hintBtn').addEventListener('click', function () {
    if (over || busy) return;
    var mv = findMove();
    if (!mv) return;
    FB.Sound.play('click');
    mv.forEach(function (p) {
      var el = cellAt(p.x, p.y);
      if (!el) return;
      el.classList.remove('hintpop');
      void el.offsetWidth;
      el.classList.add('hintpop');
      setTimeout(function () { el.classList.remove('hintpop'); }, 320);
    });
    selectCell(mv[0].x, mv[0].y);
  });

  document.getElementById('newBtn').addEventListener('click', function () {
    FB.Sound.play('click');
    newGame();
  });
  document.getElementById('ovNew').addEventListener('click', function () {
    FB.Sound.play('click');
    newGame();
  });

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if (k === 'n') { e.preventDefault(); newGame(); }
    else if (k === 'h') { e.preventDefault(); document.getElementById('hintBtn').click(); }
  });

  FB.Boss.onToggle = function (on) {
    if (!started) return;
    if (on) {
      if (tickId) {
        remain = Math.max(0, TIME_LIMIT - Math.floor((Date.now() - startAt) / 1000));
        clearInterval(tickId);
        tickId = null;
      }
    } else if (!over && !tickId) {
      startAt = Date.now() - (TIME_LIMIT - remain) * 1000;
      tickId = setInterval(tickTime, 250);
    }
  };

  buildCells();
  newGame();
})();
