/* ============================================================
   合成 2048
   ============================================================ */
(function () {
  'use strict';

  var N = 4;
  var boardEl = document.getElementById('board');
  var cellsEl = document.getElementById('cells');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');
  var ovUndoBtn = document.getElementById('ovUndo');

  var grid, tiles, score, best, uid, over, won, undoState, pending, paused;

  /* ----------------------- 初始化 ----------------------- */

  function emptyGrid() {
    var g = [];
    for (var r = 0; r < N; r++) {
      g.push([null, null, null, null]);
    }
    return g;
  }

  function buildBackground() {
    cellsEl.innerHTML = '';
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        var d = document.createElement('div');
        d.className = 'cellbg';
        d.style.left = cellOffset(c);
        d.style.top = cellOffset(r);
        cellsEl.appendChild(d);
      }
    }
  }

  function cellOffset(i) {
    return 'calc(' + i + ' * (var(--tile) + var(--gap)))';
  }

  function makeTile(v, r, c, isNew) {
    var el = document.createElement('div');
    el.className = 'tile' + (isNew ? ' new' : '');
    el.dataset.v = v;
    el.textContent = v;
    el.style.left = cellOffset(c);
    el.style.top = cellOffset(r);
    cellsEl.appendChild(el);
    var t = { id: uid++, v: v, r: r, c: c, el: el, merged: false };
    grid[r][c] = t;
    tiles.push(t);
    return t;
  }

  function setPos(el, r, c) {
    el.style.left = cellOffset(c);
    el.style.top = cellOffset(r);
  }

  function updateTileVisual(t) {
    t.el.dataset.v = t.v;
    t.el.textContent = t.v;
  }

  function addRandomTile() {
    var empty = [];
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        if (!grid[r][c]) empty.push([r, c]);
      }
    }
    if (!empty.length) return null;
    var pick = empty[Math.floor(Math.random() * empty.length)];
    return makeTile(Math.random() < 0.9 ? 2 : 4, pick[0], pick[1], true);
  }

  function newGame() {
    flush();
    grid = emptyGrid();
    tiles = [];
    score = 0;
    uid = 1;
    over = false;
    won = false;
    undoState = null;
    paused = false;
    cellsEl.innerHTML = '';
    buildBackground();
    addRandomTile();
    addRandomTile();
    updateScore();
    overlay.classList.remove('on');
    ovUndoBtn.style.display = '';
  }

  function updateScore() {
    scoreEl.textContent = FB.fmtNum(score);
    var res = FB.Store.best('2048', score);
    best = res.best;
    bestEl.textContent = FB.fmtNum(best);
  }

  /* ----------------------- 动画调度 ----------------------- */

  function schedule(fn, ms) {
    flush();
    var timer = setTimeout(function () {
      pending = null;
      fn();
    }, ms);
    pending = { timer: timer, fn: fn };
  }

  function flush() {
    if (!pending) return;
    clearTimeout(pending.timer);
    var fn = pending.fn;
    pending = null;
    fn();
  }

  /* ----------------------- 移动逻辑 ----------------------- */

  function linesFor(dir) {
    var lines = [];
    var order = [0, 1, 2, 3];
    var rev = order.slice().reverse();
    var r, c;
    if (dir === 'left' || dir === 'right') {
      for (r = 0; r < N; r++) {
        var seq = dir === 'left' ? order : rev;
        lines.push(seq.map(function (x) { return [r, x]; }));
      }
    } else {
      for (c = 0; c < N; c++) {
        var seq2 = dir === 'up' ? order : rev;
        lines.push(seq2.map(function (x) { return [x, c]; }));
      }
    }
    return lines;
  }

  function resetMerged() {
    for (var i = 0; i < tiles.length; i++) tiles[i].merged = false;
  }

  function doMove(dir) {
    if (over || paused) return;
    flush();
    if (over) return;

    resetMerged();
    var lines = linesFor(dir);
    var moved = false;
    var merges = [];
    var kept = [];
    var newGrid = emptyGrid();
    var gained = 0;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var inLine = [];
      for (var j = 0; j < line.length; j++) {
        var cell = grid[line[j][0]][line[j][1]];
        if (cell) inLine.push(cell);
      }
      var target = 0;
      var prev = null;
      for (var k = 0; k < inLine.length; k++) {
        var t = inLine[k];
        if (prev && prev.v === t.v && !prev.merged) {
          /* 合并到 prev 身上 */
          t.r = prev.r;
          t.c = prev.c;
          prev.v *= 2;
          prev.merged = true;
          gained += prev.v;
          merges.push({ keep: prev, drop: t });
          moved = true;
          if (prev.v === 2048 && !won) won = true;
        } else {
          var pos = line[target];
          if (t.r !== pos[0] || t.c !== pos[1]) moved = true;
          t.r = pos[0];
          t.c = pos[1];
          newGrid[t.r][t.c] = t;
          kept.push(t);
          prev = t;
          target++;
        }
      }
    }

    if (!moved) {
      /* 没有任何格子发生位移或合并 */
      return false;
    }

    grid = newGrid;
    score += gained;

    /* 位置过渡 */
    for (var m = 0; m < tiles.length; m++) setPos(tiles[m].el, tiles[m].r, tiles[m].c);
    FB.Sound.play(merges.length ? 'merge' : 'move');

    schedule(function () {
      for (var a = 0; a < merges.length; a++) {
        var pair = merges[a];
        if (pair.drop.el.parentNode) pair.drop.el.remove();
        var idx = tiles.indexOf(pair.drop);
        if (idx > -1) tiles.splice(idx, 1);
      }
      for (var b = 0; b < merges.length; b++) {
        var kp = merges[b].keep;
        updateTileVisual(kp);
        kp.el.classList.remove('pop');
        void kp.el.offsetWidth;
        kp.el.classList.add('pop');
      }
      addRandomTile();
      updateScore();
      checkState();
    }, 130);

    return true;
  }

  function checkState() {
    /* 达成 2048 */
    if (won && !over) {
      won = false;
      over = false;
      showOverlay('达成 2048', score, '你赢了。要继续冲 4096 吗？', true);
      return;
    }
    if (!canMove()) {
      over = true;
      FB.Sound.play('lose');
      showOverlay('游戏结束', score, '格子满了，再来一局？', false);
    }
  }

  function canMove() {
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        if (!grid[r][c]) return true;
        if (c < N - 1 && grid[r][c] && grid[r][c + 1] && grid[r][c].v === grid[r][c + 1].v) return true;
        if (r < N - 1 && grid[r][c] && grid[r + 1][c] && grid[r][c].v === grid[r + 1][c].v) return true;
      }
    }
    return false;
  }

  function showOverlay(title, sc, sub, isWin) {
    ovTitle.textContent = title;
    ovScore.textContent = FB.fmtNum(sc);
    ovSub.textContent = sub;
    ovUndoBtn.style.display = isWin ? 'none' : '';
    overlay.classList.add('on');
    FB.Store.best('2048', sc);
    if (isWin) FB.Sound.play('win');
  }

  /* ----------------------- 撤销 ----------------------- */

  function snapshot() {
    var g = [];
    for (var r = 0; r < N; r++) {
      var row = [];
      for (var c = 0; c < N; c++) row.push(grid[r][c] ? grid[r][c].v : 0);
      g.push(row);
    }
    return { g: g, score: score };
  }

  function restore(s) {
    flush();
    grid = emptyGrid();
    tiles = [];
    cellsEl.innerHTML = '';
    buildBackground();
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        if (s.g[r][c] > 0) makeTile(s.g[r][c], r, c, false);
      }
    }
    score = s.score;
    over = false;
    won = false;
    updateScore();
    overlay.classList.remove('on');
  }

  function undo() {
    if (!undoState) {
      FB.toast('没有可撤销的步骤');
      return;
    }
    var s = undoState;
    undoState = null;
    restore(s);
    FB.Sound.play('click');
  }

  /* ----------------------- 输入 ----------------------- */

  function snapshotForUndo() {
    flush();
    undoState = snapshot();
  }

  /* 统一入口：先结算上一帧动画，再记录撤销点，移动无效则回滚撤销点 */
  function tryMove(dir) {
    if (over || paused) return;
    flush();
    if (over) return;
    var prevUndo = undoState;
    undoState = snapshot();
    var ok = doMove(dir);
    if (!ok) undoState = prevUndo;
  }

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    var map = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
      W: 'up', S: 'down', A: 'left', D: 'right'
    };
    if (map[k]) {
      e.preventDefault();
      tryMove(map[k]);
    }
  });

  var touchX = 0, touchY = 0, touching = false;
  boardEl.addEventListener('touchstart', function (e) {
    if (!e.touches.length) return;
    touching = true;
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });

  boardEl.addEventListener('touchend', function (e) {
    if (!touching) return;
    touching = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchX;
    var dy = t.clientY - touchY;
    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;
    var dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    tryMove(dir);
  }, { passive: true });

  boardEl.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

  /* ----------------------- 按钮 ----------------------- */

  document.getElementById('newBtn').addEventListener('click', function () {
    newGame();
    FB.Sound.play('click');
  });
  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('ovNew').addEventListener('click', function () {
    newGame();
    FB.Sound.play('click');
  });
  ovUndoBtn.addEventListener('click', undo);

  /* 老板键打开时暂停输入 */
  FB.Boss.onToggle = function (on) { paused = on; };

  /* ----------------------- 启动 ----------------------- */

  buildBackground();
  newGame();
  bestEl.textContent = FB.fmtNum(FB.Store.getBest('2048'));
})();
