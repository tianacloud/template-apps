/* ============================================================
   俄罗斯方块
   ============================================================ */
(function () {
  'use strict';

  var COLS = 10, ROWS = 20, CELL = 30;
  var cv = document.getElementById('cv');
  var ctx = cv.getContext('2d');
  var nxt = document.getElementById('nxt');
  var nctx = nxt.getContext('2d');
  var scoreEl = document.getElementById('score');
  var levelEl = document.getElementById('level');
  var linesEl = document.getElementById('lines');
  var overlay = document.getElementById('overlay');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');
  var pauseTag = document.getElementById('pauseTag');

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = COLS * CELL * DPR;
  cv.height = ROWS * CELL * DPR;
  ctx.scale(DPR, DPR);
  nxt.width = 88 * DPR;
  nxt.height = 88 * DPR;
  nctx.scale(DPR, DPR);

  var SHAPES = {
    I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]]
  };
  var COLORS = {
    I: '#22b8cf', J: '#5b6ef5', L: '#f7913c', O: '#f2c14e',
    S: '#2fbf8f', T: '#8b5cf6', Z: '#f2545b'
  };
  var TYPES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  var board, cur, nextType, bag;
  var score, level, lines, over, paused;
  var dropAcc, lastTime, softDrop;

  /* ----------------------- 工具 ----------------------- */

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function drawBlock(c, px, py, size, color, alpha) {
    var pad = Math.max(1, size * 0.06);
    var x = px + pad, y = py + pad, s = size - pad * 2;
    var r = Math.max(3, size * 0.18);
    c.globalAlpha = alpha == null ? 1 : alpha;
    roundRect(c, x, y, s, s, r);
    c.fillStyle = color;
    c.fill();
    /* 顶部高光 */
    c.globalAlpha = (alpha == null ? 1 : alpha) * 0.35;
    roundRect(c, x + s * 0.12, y + s * 0.1, s * 0.76, s * 0.28, r * 0.6);
    c.fillStyle = '#fff';
    c.fill();
    c.globalAlpha = 1;
  }

  function emptyBoard() {
    var b = [];
    for (var r = 0; r < ROWS; r++) {
      var row = [];
      for (var c = 0; c < COLS; c++) row.push(null);
      b.push(row);
    }
    return b;
  }

  function refillBag() {
    bag = TYPES.slice();
    for (var i = bag.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = bag[i]; bag[i] = bag[j]; bag[j] = t;
    }
  }

  function pullType() {
    if (!bag || !bag.length) refillBag();
    return bag.pop();
  }

  function makePiece(type) {
    var m = SHAPES[type].map(function (row) { return row.slice(); });
    return {
      type: type,
      matrix: m,
      x: Math.floor((COLS - m[0].length) / 2),
      y: 0
    };
  }

  /* ----------------------- 碰撞 / 操作 ----------------------- */

  function collide(matrix, ox, oy) {
    for (var r = 0; r < matrix.length; r++) {
      for (var c = 0; c < matrix[r].length; c++) {
        if (!matrix[r][c]) continue;
        var br = oy + r, bc = ox + c;
        if (bc < 0 || bc >= COLS || br >= ROWS) return true;
        if (br >= 0 && board[br][bc]) return true;
      }
    }
    return false;
  }

  function spawn() {
    cur = makePiece(nextType || pullType());
    nextType = pullType();
    drawNext();
    dropAcc = 0;
    if (collide(cur.matrix, cur.x, cur.y)) {
      cur.y = -2;
      if (collide(cur.matrix, cur.x, cur.y)) gameOver();
    }
  }

  function move(dx) {
    if (!collide(cur.matrix, cur.x + dx, cur.y)) {
      cur.x += dx;
      dropAcc = 0;
      return true;
    }
    return false;
  }

  function rotateMatrix(m) {
    var n = m.length;
    var out = [];
    for (var r = 0; r < n; r++) {
      var row = [];
      for (var c = 0; c < n; c++) row.push(m[n - 1 - c][r]);
      out.push(row);
    }
    return out;
  }

  function rotate() {
    var m = rotateMatrix(cur.matrix);
    var kicks = [0, -1, 1, -2, 2];
    for (var i = 0; i < kicks.length; i++) {
      if (!collide(m, cur.x + kicks[i], cur.y)) {
        cur.matrix = m;
        cur.x += kicks[i];
        dropAcc = 0;
        return true;
      }
    }
    return false;
  }

  function softStep() {
    if (!collide(cur.matrix, cur.x, cur.y + 1)) {
      cur.y++;
      dropAcc = 0;
      return true;
    }
    lock();
    return false;
  }

  function hardDrop() {
    var moved = 0;
    while (!collide(cur.matrix, cur.x, cur.y + 1)) { cur.y++; moved++; }
    score += moved * 2;
    lock();
  }

  function lock() {
    var placed = false;
    for (var r = 0; r < cur.matrix.length; r++) {
      for (var c = 0; c < cur.matrix[r].length; c++) {
        if (!cur.matrix[r][c]) continue;
        var br = cur.y + r, bc = cur.x + c;
        if (br < 0) { gameOver(); return; }
        board[br][bc] = cur.type;
        placed = true;
      }
    }
    if (!placed) { gameOver(); return; }
    clearLines();
    updateHud();
    spawn();
  }

  function clearLines() {
    var cleared = 0;
    for (var r = ROWS - 1; r >= 0; r--) {
      var full = true;
      for (var c = 0; c < COLS; c++) {
        if (!board[r][c]) { full = false; break; }
      }
      if (full) {
        board.splice(r, 1);
        var row = [];
        for (var k = 0; k < COLS; k++) row.push(null);
        board.unshift(row);
        cleared++;
        r++;
      }
    }
    if (!cleared) return;
    var table = [0, 100, 300, 500, 800];
    score += table[cleared] * level;
    lines += cleared;
    var newLevel = Math.floor(lines / 10) + 1;
    if (newLevel !== level) {
      level = newLevel;
      FB.Sound.play('good');
    } else {
      FB.Sound.play(cleared >= 3 ? 'good' : 'pop');
    }
  }

  function interval() {
    return Math.max(90, 800 - (level - 1) * 72);
  }

  function updateHud() {
    scoreEl.textContent = FB.fmtNum(score);
    levelEl.textContent = level;
    linesEl.textContent = lines;
    FB.Store.best('tetris', score);
  }

  function gameOver() {
    if (over) return;
    over = true;
    FB.Sound.play('lose');
    FB.Store.best('tetris', score);
    ovScore.textContent = FB.fmtNum(score);
    ovSub.textContent = '得分 ' + FB.fmtNum(score) + '，消了 ' + lines + ' 行。';
    setTimeout(function () { overlay.classList.add('on'); }, 300);
  }

  /* ----------------------- 绘制 ----------------------- */

  function drawBoardBg() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.clearRect(0, 0, COLS * CELL, ROWS * CELL);
    ctx.fillStyle = dark ? '#1a1f2c' : '#eef1f9';
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.06)' : 'rgba(24,31,61,.075)';
    ctx.lineWidth = 1;
    for (var c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, 0);
      ctx.lineTo(c * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (var r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(COLS * CELL, r * CELL);
      ctx.stroke();
    }
  }

  function draw() {
    drawBoardBg();

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        if (board[r][c]) drawBlock(ctx, c * CELL, r * CELL, CELL, COLORS[board[r][c]], 1);
      }
    }

    if (cur && !over) {
      /* 幽灵块 */
      var gy = cur.y;
      while (!collide(cur.matrix, cur.x, gy + 1)) gy++;
      if (gy !== cur.y) {
        for (var gr = 0; gr < cur.matrix.length; gr++) {
          for (var gc = 0; gc < cur.matrix[gr].length; gc++) {
            if (!cur.matrix[gr][gc]) continue;
            var py = (gy + gr) * CELL;
            if (py < 0) continue;
            roundRect(ctx, (cur.x + gc) * CELL + 3, py + 3, CELL - 6, CELL - 6, 5);
            ctx.strokeStyle = COLORS[cur.type];
            ctx.globalAlpha = 0.32;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      /* 当前块 */
      for (var cr = 0; cr < cur.matrix.length; cr++) {
        for (var cc = 0; cc < cur.matrix[cr].length; cc++) {
          if (!cur.matrix[cr][cc]) continue;
          var y = (cur.y + cr) * CELL;
          if (y < -CELL) continue;
          drawBlock(ctx, (cur.x + cc) * CELL, y, CELL, COLORS[cur.type], 1);
        }
      }
    }
  }

  function drawNext() {
    nctx.clearRect(0, 0, 88, 88);
    if (!nextType) return;
    var m = SHAPES[nextType];
    var size = 17;
    var cells = [];
    var minR = 9, maxR = -1, minC = 9, maxC = -1;
    for (var r = 0; r < m.length; r++) {
      for (var c = 0; c < m[r].length; c++) {
        if (!m[r][c]) continue;
        cells.push([r, c]);
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
    var w = (maxC - minC + 1) * size;
    var h = (maxR - minR + 1) * size;
    var ox = (88 - w) / 2;
    var oy = (88 - h) / 2;
    for (var i = 0; i < cells.length; i++) {
      var row = cells[i][0] - minR;
      var col = cells[i][1] - minC;
      drawBlock(nctx, ox + col * size, oy + row * size, size, COLORS[nextType], 1);
    }
  }

  /* ----------------------- 主循环 ----------------------- */

  function loop(t) {
    if (!lastTime) lastTime = t;
    var dt = t - lastTime;
    lastTime = t;
    if (!paused && !over) {
      dropAcc += dt;
      var iv = softDrop ? Math.min(60, interval()) : interval();
      if (dropAcc >= iv) {
        dropAcc = 0;
        if (!collide(cur.matrix, cur.x, cur.y + 1)) {
          cur.y++;
        } else {
          lock();
        }
      }
    }
    draw();
    requestAnimationFrame(loop);
  }

  /* ----------------------- 输入 ----------------------- */

  function reset() {
    board = emptyBoard();
    bag = null;
    nextType = pullType();
    score = 0;
    level = 1;
    lines = 0;
    over = false;
    paused = false;
    softDrop = false;
    dropAcc = 0;
    lastTime = 0;
    pauseTag.classList.remove('on');
    overlay.classList.remove('on');
    spawn();
    updateHud();
  }

  function togglePause() {
    if (over) return;
    paused = !paused;
    pauseTag.classList.toggle('on', paused);
    FB.Sound.play('click');
  }

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); if (!over && !paused) move(-1); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { e.preventDefault(); if (!over && !paused) move(1); }
    else if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); if (!over && !paused) rotate(); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); softDrop = true; }
    else if (k === ' ') { e.preventDefault(); if (!over && !paused) hardDrop(); }
    else if (k === 'p' || k === 'P') { e.preventDefault(); togglePause(); }
  });

  document.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') softDrop = false;
  });

  function bindHold(id, fn, intervalMs) {
    var el = document.getElementById(id);
    var timer = null, repeat = null;
    function stop() {
      clearTimeout(timer); clearInterval(repeat);
      timer = repeat = null;
    }
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;   /* 右键 / 中键留给老板键 */
      e.preventDefault();
      if (over || paused) return;
      fn();
      timer = setTimeout(function () {
        repeat = setInterval(fn, intervalMs || 90);
      }, 220);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      el.addEventListener(ev, stop);
    });
  }

  bindHold('bLeft', function () { move(-1); }, 100);
  bindHold('bRight', function () { move(1); }, 100);
  bindHold('bDown', function () { softStep(); }, 70);
  document.getElementById('bRot').addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    e.preventDefault(); if (!over && !paused) rotate();
  });
  document.getElementById('bDrop').addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    e.preventDefault(); if (!over && !paused) hardDrop();
  });
  document.getElementById('ovNew').addEventListener('click', function () {
    reset(); FB.Sound.play('click');
  });

  FB.Boss.onToggle = function (on) {
    paused = on;
    pauseTag.classList.toggle('on', paused && !over);
  };

  reset();
  requestAnimationFrame(loop);
})();
