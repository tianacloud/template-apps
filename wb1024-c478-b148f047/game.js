(function () {
  'use strict';

  var SIZE = 4;
  var WIN_VALUE = 1024;
  var EGG_VALUE = 2048;
  var COMBO_WINDOW = 1600;
  var MOVE_MS = 130;

  var boardEl = document.getElementById('board');
  var gridBgEl = document.getElementById('grid-bg');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var scoreBox = document.getElementById('score-box');
  var toastsEl = document.getElementById('toasts');
  var overlayEl = document.getElementById('overlay');
  var ovTitle = document.getElementById('ov-title');
  var ovDesc = document.getElementById('ov-desc');
  var ovStats = document.getElementById('ov-stats');
  var ovPrimary = document.getElementById('ov-primary');
  var ovSecondary = document.getElementById('ov-secondary');
  var ovShare = document.getElementById('ov-share');
  var btnNew = document.getElementById('btn-new');
  var btnUndo = document.getElementById('btn-undo');
  var btnShare = document.getElementById('btn-share');
  var btnSound = document.getElementById('btn-sound');
  var modalBack = document.getElementById('modal-back');
  var shareCanvas = document.getElementById('share-canvas');
  var btnDownload = document.getElementById('btn-download');
  var btnCopy = document.getElementById('btn-copy');
  var btnModalClose = document.getElementById('btn-modal-close');

  var grid = makeGrid();
  var tileSeq = 0;
  var pendingRemove = [];
  var score = 0;
  var best = 0;
  var moves = 0;
  var won = false;
  var keepPlaying = false;
  var over = false;
  var overlayOpen = false;
  var history = [];
  var lastMergeAt = 0;
  var combo = 0;
  var bestCombo = 0;
  var startAt = null;
  var endAt = null;
  var inputLockUntil = 0;
  var bonusGiven = false;

  var MILESTONES = {
    8: 'Hello, World!',
    16: '// TODO: 写注释',
    32: 'git commit -m "merge"',
    64: 'npm run build -> ok',
    128: 'console.log(128)',
    256: 'null? not found',
    512: '404 page (but score)',
    1024: 'Happy 1024! 程序员节快乐',
    2048: 'Segmentation fault -- 彩蛋达成!'
  };

  var TILE_COLORS = {
    2: ['#262d36', '#9aa4b0'],
    4: ['#1d3a52', '#79c0ff'],
    8: ['#0e4a6e', '#a5d6ff'],
    16: ['#0b5e59', '#56d4c8'],
    32: ['#166b3a', '#7ee787'],
    64: ['#6e5616', '#e3b341'],
    128: ['#8a4a12', '#ffa657'],
    256: ['#a34d1f', '#ffb094'],
    512: ['#a12d4a', '#ff9db4'],
    1024: ['#6e40c9', '#f2e9ff'],
    2048: ['#b8860b', '#fff8dc']
  };

  /* ---------------- storage ---------------- */

  function loadBest() {
    try { best = parseInt(localStorage.getItem('m1024-best') || '0', 10) || 0; } catch (e) { best = 0; }
    bestEl.textContent = best;
  }
  function saveBest() {
    try { localStorage.setItem('m1024-best', String(best)); } catch (e) {}
  }
  function loadSound() {
    try {
      var v = localStorage.getItem('m1024-sound');
      if (v === 'off') Sound.on = false;
    } catch (e) {}
    updateSoundBtn();
  }
  function updateSoundBtn() {
    btnSound.textContent = Sound.on ? '音效: 开' : '音效: 关';
  }

  /* ---------------- sound ---------------- */

  var Sound = {
    ctx: null,
    on: true,
    tone: function (freq, dur, type, vol) {
      if (!this.on) return;
      dur = dur || 0.08; type = type || 'sine'; vol = vol || 0.05;
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        var o = this.ctx.createOscillator();
        var g = this.ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.value = vol;
        o.connect(g);
        g.connect(this.ctx.destination);
        var t = this.ctx.currentTime;
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t);
        o.stop(t + dur);
      } catch (e) {}
    },
    merge: function (v) {
      var n = Math.log2(v || 2);
      this.tone(170 * Math.pow(1.095, n), 0.09, 'triangle', 0.06);
    },
    slide: function () { this.tone(110, 0.045, 'sine', 0.028); },
    bugFix: function () {
      this.tone(520, 0.07, 'square', 0.04);
      var self = this;
      setTimeout(function () { self.tone(780, 0.1, 'square', 0.04); }, 70);
    },
    fanfare: function () {
      var notes = [523, 659, 784, 1046, 1318];
      var self = this;
      notes.forEach(function (f, i) {
        setTimeout(function () { self.tone(f, 0.14, 'triangle', 0.06); }, i * 110);
      });
    }
  };

  /* ---------------- grid helpers ---------------- */

  function makeGrid() {
    var g = [];
    for (var y = 0; y < SIZE; y++) {
      var row = [];
      for (var x = 0; x < SIZE; x++) row.push(null);
      g.push(row);
    }
    return g;
  }
  function cell(x, y) { return grid[y][x]; }
  function setCell(x, y, t) { grid[y][x] = t; }
  function inBounds(x, y) { return x >= 0 && x < SIZE && y >= 0 && y < SIZE; }
  function emptyCells() {
    var out = [];
    for (var y = 0; y < SIZE; y++) for (var x = 0; x < SIZE; x++) if (!grid[y][x]) out.push({ x: x, y: y });
    return out;
  }
  function eachTile(fn) {
    for (var y = 0; y < SIZE; y++) {
      var row = grid[y];
      if (!row) continue;
      for (var x = 0; x < SIZE; x++) {
        var t = row[x];
        if (t) fn(t, x, y);
      }
    }
  }

  function tileText(v) { return v === 'BUG' ? 'BUG' : String(v); }
  function tileUnit(v) { return v === 'BUG' ? '' : (v <= 512 ? 'B' : ''); }

  function createTileEl(t) {
    var el = document.createElement('div');
    el.className = 'tile v' + t.value + (t.isNew ? ' new' : '');
    var inner = document.createElement('div');
    inner.className = 'tile-inner';
    var num = document.createElement('span');
    num.textContent = tileText(t.value);
    inner.appendChild(num);
    if (tileUnit(t.value)) {
      var u = document.createElement('span');
      u.className = 'unit';
      u.textContent = tileUnit(t.value);
      inner.appendChild(u);
    }
    el.appendChild(inner);
    var len = String(t.value).length;
    var factor = t.value === 'BUG' ? 0.26 : (len <= 2 ? 0.4 : len === 3 ? 0.32 : 0.25);
    inner.style.fontSize = Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell')) * factor) + 'px';
    if (t.value === 'BUG') {
      el.title = '点我修复这个 bug';
      el.addEventListener('click', function () { fixBug(t); });
    }
    el.style.transform = translateFor(t.x, t.y);
    boardEl.appendChild(el);
    return el;
  }

  function updateTileEl(t) {
    var el = t.el;
    if (!el) return;
    el.className = 'tile v' + t.value + (t.isNew ? ' new' : '');
    var inner = el.firstChild;
    inner.innerHTML = '';
    var num = document.createElement('span');
    num.textContent = tileText(t.value);
    inner.appendChild(num);
    if (tileUnit(t.value)) {
      var u = document.createElement('span');
      u.className = 'unit';
      u.textContent = tileUnit(t.value);
      inner.appendChild(u);
    }
    var len = String(t.value).length;
    var factor = t.value === 'BUG' ? 0.26 : (len <= 2 ? 0.4 : len === 3 ? 0.32 : 0.25);
    inner.style.fontSize = Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell')) * factor) + 'px';
  }

  function cellSize() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell'));
  }
  function gapSize() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap'));
  }
  function translateFor(x, y) {
    var step = cellSize() + gapSize();
    return 'translate(' + x * step + 'px,' + y * step + 'px)';
  }

  function createTile(x, y, value, isNew) {
    var t = {
      id: ++tileSeq,
      value: value,
      x: x,
      y: y,
      el: null,
      isNew: !!isNew,
      mergedThisMove: false
    };
    t.el = createTileEl(t);
    setCell(x, y, t);
    return t;
  }

  function addRandomTile() {
    var empty = emptyCells();
    if (!empty.length) return null;
    var spot = empty[Math.floor(Math.random() * empty.length)];
    var value;
    var r = Math.random();
    if (moves >= 8 && r < 0.1) value = 'BUG';
    else value = Math.random() < 0.9 ? 2 : 4;
    return createTile(spot.x, spot.y, value, true);
  }

  /* ---------------- render ---------------- */

  function render() {
    eachTile(function (t) {
      if (!t.el) t.el = createTileEl(t);
      t.el.style.transform = translateFor(t.x, t.y);
      if (t.mergedThisMove) {
        (function (el) {
          setTimeout(function () {
            if (!el) return;
            el.classList.add('merged');
            setTimeout(function () { el.classList.remove('merged'); }, 220);
          }, MOVE_MS);
        })(t.el);
      }
    });
    for (var i = 0; i < pendingRemove.length; i++) {
      (function (t) {
        if (!t.el) return;
        t.el.style.transform = translateFor(t.x, t.y);
        var el = t.el;
        t.el = null;
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, MOVE_MS + 30);
      })(pendingRemove[i]);
    }
    pendingRemove = [];
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      saveBest();
    }
    btnUndo.disabled = history.length === 0;
  }

  /* ---------------- toast / float ---------------- */

  function toast(msg, ms) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastsEl.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }, ms || 1700);
    while (toastsEl.children.length > 3) toastsEl.removeChild(toastsEl.firstChild);
  }

  function scoreFloat(gained) {
    if (gained <= 0) return;
    var el = document.createElement('div');
    el.className = 'score-float';
    el.textContent = '+' + gained;
    scoreBox.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 850);
  }

  function comboFloat(c, bonus) {
    var el = document.createElement('div');
    el.className = 'combo-float';
    el.textContent = 'COMBO x' + c + ' +' + bonus;
    boardEl.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 950);
  }

  /* ---------------- move ---------------- */

  var VECTORS = {
    up: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 }
  };

  function findFarthest(x, y, vec) {
    var prevX = x, prevY = y;
    var nx = x, ny = y;
    for (;;) {
      prevX = nx; prevY = ny;
      nx = prevX + vec.x;
      ny = prevY + vec.y;
      if (!inBounds(nx, ny) || cell(nx, ny)) break;
    }
    return {
      x: prevX,
      y: prevY,
      next: inBounds(nx, ny) ? cell(nx, ny) : null
    };
  }

  function takeSnapshot() {
    var values = [];
    for (var y = 0; y < SIZE; y++) {
      var row = [];
      for (var x = 0; x < SIZE; x++) {
        var t = grid[y][x];
        row.push(t ? t.value : null);
      }
      values.push(row);
    }
    return { values: values, score: score, moves: moves, won: won };
  }

  function clearTileEls() {
    var old = boardEl.querySelectorAll('.tile');
    for (var i = 0; i < old.length; i++) {
      if (old[i].parentNode) old[i].parentNode.removeChild(old[i]);
    }
  }

  function restoreSnapshot(snap) {
    clearTileEls();
    grid = makeGrid();
    for (var y = 0; y < SIZE; y++) for (var x = 0; x < SIZE; x++) {
      var v = snap.values[y][x];
      if (v) createTile(x, y, v, false);
    }
    score = snap.score;
    moves = snap.moves;
    won = snap.won;
    over = false;
    pendingRemove = [];
    endAt = null;
    scoreEl.textContent = score;
    btnUndo.disabled = history.length === 0;
  }

  function move(dir) {
    if (overlayOpen) return;
    if (Date.now() < inputLockUntil) return;
    var vec = VECTORS[dir];
    if (!vec) return;

    var snap = takeSnapshot();
    var moved = false;
    var gained = 0;
    var mergeCount = 0;
    var maxReached = 0;
    var order = [];
    var i, x, y;

    for (i = 0; i < SIZE; i++) order.push(i);
    var xs = vec.x === 1 ? order.slice().reverse() : order;
    var ys = vec.y === 1 ? order.slice().reverse() : order;

    eachTile(function (t) { t.mergedThisMove = false; });

    for (var iy = 0; iy < SIZE; iy++) {
      for (var ix = 0; ix < SIZE; ix++) {
        x = xs[ix];
        y = ys[iy];
        var tile = cell(x, y);
        if (!tile) continue;
        var far = findFarthest(x, y, vec);
        var next = far.next;
        if (next && next.value === tile.value && !next.mergedThisMove) {
          if (tile.value === 'BUG') {
            gained += 40;
            mergeCount++;
            setCell(next.x, next.y, null);
            setCell(x, y, null);
            next.dead = true;
            tile.dead = true;
            tile.x = next.x;
            tile.y = next.y;
            pendingRemove.push(next);
            pendingRemove.push(tile);
            toast('bug squashed! +40');
          } else {
            var newValue = next.value * 2;
            gained += newValue;
            mergeCount++;
            setCell(x, y, null);
            tile.x = next.x;
            tile.y = next.y;
            tile.dead = true;
            pendingRemove.push(tile);
            next.value = newValue;
            next.mergedThisMove = true;
            updateTileEl(next);
            if (newValue > maxReached) maxReached = newValue;
          }
          moved = true;
        } else if (far.x !== x || far.y !== y) {
          setCell(x, y, null);
          setCell(far.x, far.y, tile);
          tile.x = far.x;
          tile.y = far.y;
          moved = true;
        }
      }
    }

    if (!moved) {
      Sound.slide();
      return;
    }

    history.push(snap);
    if (history.length > 30) history.shift();
    moves++;
    if (!startAt) startAt = Date.now();

    if (mergeCount > 0) {
      var now = Date.now();
      combo = (now - lastMergeAt < COMBO_WINDOW) ? combo + 1 : 1;
      lastMergeAt = now;
      if (combo > bestCombo) bestCombo = combo;
      if (combo >= 2) {
        var bonus = (combo - 1) * 10 * mergeCount;
        gained += bonus;
        comboFloat(combo, bonus);
      }
      Sound.merge(maxReached || 4);
    } else {
      Sound.slide();
    }

    score += gained;
    scoreFloat(gained);
    addRandomTile();
    render();
    inputLockUntil = Date.now() + 90;

    if (maxReached && MILESTONES[maxReached] && maxReached >= 8) {
      toast(MILESTONES[maxReached]);
    }

    if (!won && maxReached >= WIN_VALUE) {
      won = true;
      endAt = Date.now();
      Sound.fanfare();
      setTimeout(function () { showOverlay('win'); }, 380);
      return;
    }
    if (maxReached >= EGG_VALUE) {
      toast('Segmentation fault (core dumped)');
      document.body.classList.add('hacker');
    }

    if (!movesAvailable()) {
      over = true;
      endAt = Date.now();
      setTimeout(function () { showOverlay('lose'); }, 420);
    }
  }

  function movesAvailable() {
    if (emptyCells().length) return true;
    var ok = false;
    eachTile(function (t, x, y) {
      if (ok) return;
      if (inBounds(x + 1, y)) {
        var r = cell(x + 1, y);
        if (r && r.value === t.value) ok = true;
      }
      if (!ok && inBounds(x, y + 1)) {
        var d = cell(x, y + 1);
        if (d && d.value === t.value) ok = true;
      }
    });
    return ok;
  }

  function fixBug(t) {
    if (over || overlayOpen) return;
    if (t.value !== 'BUG' || !cell(t.x, t.y)) return;
    setCell(t.x, t.y, null);
    score += 20;
    scoreFloat(20);
    Sound.bugFix();
    if (t.el) {
      t.el.classList.add('fixed');
      var el = t.el;
      t.el = null;
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }
    toast('bug fixed! +20');
    scoreEl.textContent = score;
    if (score > best) { best = score; bestEl.textContent = best; saveBest(); }
    if (!movesAvailable()) {
      over = true;
      endAt = Date.now();
      setTimeout(function () { showOverlay('lose'); }, 420);
    }
  }

  /* ---------------- overlays ---------------- */

  function fmtTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  }
  function elapsed() {
    if (!startAt) return 0;
    return (endAt || Date.now()) - startAt;
  }
  function maxTileValue() {
    var m = 0;
    eachTile(function (t) {
      if (typeof t.value === 'number' && t.value > m) m = t.value;
    });
    return m;
  }

  function statHtml(items) {
    return items.map(function (it) {
      return '<div class="stat">' + it[0] + '<b>' + it[1] + '</b></div>';
    }).join('');
  }

  function showOverlay(mode) {
    overlayOpen = true;
    overlayEl.hidden = false;
    if (mode === 'win') {
      ovTitle.textContent = 'Happy 1024!';
      ovTitle.className = 'win';
      ovDesc.textContent = '你合成了程序员节的荣耀数字。继续挑战 2048 彩蛋，或带走你的战绩卡片。';
      ovStats.innerHTML = statHtml([
        ['得分', score],
        ['最大方块', maxTileValue()],
        ['步数', moves]
      ]);
      ovPrimary.textContent = '继续挑战';
      ovPrimary.hidden = false;
      ovSecondary.textContent = '新游戏';
      ovShare.textContent = '战绩卡片';
    } else {
      ovTitle.textContent = 'Out of Memory';
      ovTitle.className = 'lose';
      ovDesc.textContent = '内存碎片排不开了。撤销一步试试，或重新整理。';
      ovStats.innerHTML = statHtml([
        ['得分', score],
        ['最大方块', maxTileValue() || 0],
        ['步数', moves]
      ]);
      ovPrimary.textContent = '撤销一步';
      ovPrimary.hidden = history.length === 0;
      ovSecondary.textContent = '新游戏';
      ovShare.textContent = '战绩卡片';
    }
  }

  function hideOverlay() {
    overlayOpen = false;
    overlayEl.hidden = true;
  }

  ovPrimary.addEventListener('click', function () {
    if (ovTitle.className === 'win') {
      keepPlaying = true;
      endAt = null;
      hideOverlay();
    } else {
      undo();
    }
  });
  ovSecondary.addEventListener('click', function () { newGame(); });
  ovShare.addEventListener('click', function () { openShare(); });

  /* ---------------- undo / new game ---------------- */

  function undo() {
    if (!history.length) return;
    var snap = history.pop();
    restoreSnapshot(snap);
    hideOverlay();
    over = false;
    toast('已撤销一步');
  }

  function newGame() {
    grid = makeGrid();
    tileSeq = 0;
    pendingRemove = [];
    score = 0;
    moves = 0;
    won = false;
    keepPlaying = false;
    over = false;
    history = [];
    combo = 0;
    lastMergeAt = 0;
    startAt = null;
    endAt = null;
    bonusGiven = false;
    document.body.classList.remove('hacker');
    clearTileEls();
    createTile(1, 1, 2, false);
    createTile(2, 2, 2, false);
    addRandomTile();
    addRandomTile();
    scoreEl.textContent = '0';
    btnUndo.disabled = true;
    hideOverlay();
  }

  /* ---------------- share card ---------------- */

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawShare() {
    var W = 1080, H = 1350;
    shareCanvas.width = W;
    shareCanvas.height = H;
    var ctx = shareCanvas.getContext('2d');

    ctx.fillStyle = '#0b0f14';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(88,166,255,0.06)';
    ctx.fillRect(0, 0, W, 260);

    ctx.strokeStyle = '#1f2733';
    ctx.lineWidth = 3;
    roundRectPath(ctx, 40, 40, W - 80, H - 80, 28);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#e6edf3';
    ctx.font = '700 64px "JetBrains Mono", "SF Mono", Consolas, monospace';
    ctx.fillText('1024 内存合并', 90, 150);

    ctx.fillStyle = '#8b949e';
    ctx.font = '30px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('WorkBuddy 1024 程序员节 · 造物挑战参赛作品', 90, 200);

    ctx.fillStyle = '#6e7681';
    ctx.font = '26px "JetBrains Mono", monospace';
    ctx.fillText('$ merge --all --memory', 90, 258);

    ctx.fillStyle = '#6e7681';
    ctx.font = '28px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText('得分 SCORE', 90, 360);
    ctx.fillStyle = '#e6edf3';
    ctx.font = '700 130px "JetBrains Mono", monospace';
    ctx.fillText(String(score), 90, 480);

    var stats = [
      ['最大方块', maxTileValue() || '-'],
      ['步数', String(moves)],
      ['用时', fmtTime(elapsed())],
      ['最佳连击', 'x' + bestCombo]
    ];
    var sx = 90;
    stats.forEach(function (s) {
      ctx.fillStyle = '#11161d';
      roundRectPath(ctx, sx, 530, 225, 110, 16);
      ctx.fill();
      ctx.strokeStyle = '#1f2733';
      ctx.lineWidth = 2;
      roundRectPath(ctx, sx, 530, 225, 110, 16);
      ctx.stroke();
      ctx.fillStyle = '#6e7681';
      ctx.font = '24px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText(s[0], sx + 22, 572);
      ctx.fillStyle = '#e6edf3';
      ctx.font = '700 38px "JetBrains Mono", monospace';
      ctx.fillText(s[1], sx + 22, 620);
      sx += 240;
    });

    var cellPx = 92, gapPx = 14, boardX = 90, boardY = 700;
    for (var gy = 0; gy < SIZE; gy++) {
      for (var gx = 0; gx < SIZE; gx++) {
        var t = grid[gy][gx];
        var px = boardX + gx * (cellPx + gapPx);
        var py = boardY + gy * (cellPx + gapPx);
        ctx.fillStyle = t ? (TILE_COLORS[t.value] ? TILE_COLORS[t.value][0] : '#a12d2d') : 'rgba(255,255,255,0.04)';
        roundRectPath(ctx, px, py, cellPx, cellPx, 12);
        ctx.fill();
        if (t) {
          ctx.fillStyle = t.value === 'BUG' ? '#ff9d9d' : (TILE_COLORS[t.value] ? TILE_COLORS[t.value][1] : '#fff');
          var label = tileText(t.value);
          var fs = label.length <= 2 ? 34 : label.length === 3 ? 27 : 22;
          if (t.value === 'BUG') fs = 22;
          ctx.font = '700 ' + fs + 'px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(label, px + cellPx / 2, py + cellPx / 2 + fs * 0.35);
          ctx.textAlign = 'left';
        }
      }
    }

    ctx.fillStyle = '#58a6ff';
    ctx.font = '30px "JetBrains Mono", monospace';
    ctx.fillText('#WorkBuddy  #1024程序员节', 90, 1190);
    ctx.fillStyle = '#8b949e';
    ctx.font = '28px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText('来试试能不能超过我', 90, 1240);
  }

  function shareText() {
    return '我在《1024 内存合并》里合成了 ' + (maxTileValue() || 0) + '，得分 ' + score +
      '，用了 ' + moves + ' 步。来 WorkBuddy 1024 造物挑战试试能不能超过我 #WorkBuddy #1024程序员节';
  }

  function openShare() {
    drawShare();
    modalBack.hidden = false;
  }
  function closeShare() {
    modalBack.hidden = true;
  }

  btnDownload.addEventListener('click', function () {
    shareCanvas.toBlob(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '1024内存合并-战绩-' + score + '分.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }, 'image/png');
  });

  btnCopy.addEventListener('click', function () {
    var text = shareText();
    function done() { toast('分享文案已复制'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  });
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  btnModalClose.addEventListener('click', closeShare);
  modalBack.addEventListener('click', function (e) { if (e.target === modalBack) closeShare(); });

  /* ---------------- input ---------------- */

  var KEYMAP = {
    ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left',
    w: 'up', d: 'right', s: 'down', a: 'left',
    W: 'up', D: 'right', S: 'down', A: 'left',
    k: 'up', l: 'right', j: 'down', h: 'left'
  };

  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var SECRET_1024 = ['1', '0', '2', '4'];
  var keyBuffer = [];

  function trackSecret(key) {
    keyBuffer.push(key);
    if (keyBuffer.length > 16) keyBuffer.shift();
    function endsWith(arr) {
      if (keyBuffer.length < arr.length) return false;
      for (var i = 0; i < arr.length; i++) {
        if (keyBuffer[keyBuffer.length - arr.length + i] !== arr[i]) return false;
      }
      return true;
    }
    if (endsWith(KONAMI)) {
      document.body.classList.add('hacker');
      toast('root@1024:~# 黑客模式已开启');
      keyBuffer = [];
    }
    if (endsWith(SECRET_1024)) {
      if (!bonusGiven) {
        bonusGiven = true;
        score += 1024;
        scoreFloat(1024);
        scoreEl.textContent = score;
        if (score > best) { best = score; bestEl.textContent = best; saveBest(); }
        toast('sudo: 已授予 1024 积分');
      } else {
        toast('sudo: 今天已经发过积分了');
      }
      keyBuffer = [];
    }
  }

  document.addEventListener('keydown', function (e) {
    if (!modalBack.hidden) {
      if (e.key === 'Escape') closeShare();
      return;
    }
    var dir = KEYMAP[e.key];
    if (dir) {
      e.preventDefault();
      move(dir);
    }
    trackSecret(e.key);
  });

  var touchStart = null;
  boardEl.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  boardEl.addEventListener('touchend', function (e) {
    if (!touchStart) return;
    var dx = e.changedTouches[0].clientX - touchStart.x;
    var dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
    else move(dy > 0 ? 'down' : 'up');
  }, { passive: true });

  boardEl.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

  /* ---------------- buttons ---------------- */

  btnNew.addEventListener('click', newGame);
  btnUndo.addEventListener('click', undo);
  btnShare.addEventListener('click', openShare);
  btnSound.addEventListener('click', function () {
    Sound.on = !Sound.on;
    try { localStorage.setItem('m1024-sound', Sound.on ? 'on' : 'off'); } catch (e) {}
    updateSoundBtn();
    if (Sound.on) Sound.tone(660, 0.08, 'triangle', 0.05);
  });

  /* ---------------- layout ---------------- */

  function layout() {
    var vw = window.innerWidth || document.documentElement.clientWidth;
    var size = Math.min(vw - 32, 440);
    var gap = Math.max(10, Math.round(size * 0.03));
    var cell = (size - gap * 5) / 4;
    var root = document.documentElement;
    root.style.setProperty('--cell', cell + 'px');
    root.style.setProperty('--gap', gap + 'px');
    eachTile(function (t) {
      if (t.el) {
        t.el.style.transform = translateFor(t.x, t.y);
        var inner = t.el.firstChild;
        if (inner) {
          var len = String(t.value).length;
          var factor = t.value === 'BUG' ? 0.26 : (len <= 2 ? 0.4 : len === 3 ? 0.32 : 0.25);
          inner.style.fontSize = Math.round(cell * factor) + 'px';
        }
      }
    });
  }
  window.addEventListener('resize', layout);

  /* ---------------- init ---------------- */

  function init() {
    var bg = document.createDocumentFragment();
    for (var i = 0; i < SIZE * SIZE; i++) {
      var c = document.createElement('div');
      c.className = 'cell';
      bg.appendChild(c);
    }
    gridBgEl.appendChild(bg);
    loadBest();
    loadSound();
    layout();
    grid = makeGrid();
    createTile(1, 1, 2, false);
    createTile(2, 2, 2, false);
    addRandomTile();
    addRandomTile();
    scoreEl.textContent = '0';
    btnUndo.disabled = true;
    toast('方向键 / WASD / 滑动开始整理内存', 2600);
  }

  try {
    init();
  } catch (e) {
    console.error('init failed', e);
  }
})();
