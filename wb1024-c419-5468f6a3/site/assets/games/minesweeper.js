/* ============================================================
   扫雷
   ============================================================ */
(function () {
  'use strict';

  var LEVELS = {
    easy: { rows: 9, cols: 9, mines: 10 },
    mid: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
  };

  var boardEl = document.getElementById('board');
  var minesLeftEl = document.getElementById('minesLeft');
  var timerEl = document.getElementById('timer');
  var faceEl = document.getElementById('face');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovTime = document.getElementById('ovTime');
  var ovSub = document.getElementById('ovSub');

  var FACES = {
    smile: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f4b942" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9.4" fill="#ffd964" stroke="#e8a72c"/><circle cx="9" cy="10" r="1.2" fill="#5a4210" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="#5a4210" stroke="none"/><path d="M8 14.4c1 1.5 2.5 2.2 4 2.2s3-.7 4-2.2" stroke="#5a4210"/></svg>',
    dead: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f4b942" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9.4" fill="#ffd964" stroke="#e8a72c"/><path d="M7.4 8.2l3 3M10.4 8.2l-3 3M13.6 8.2l3 3M16.6 8.2l-3 3" stroke="#5a4210"/><path d="M8.6 15.2c1 1.2 2.2 1.8 3.4 1.8s2.4-.6 3.4-1.8" stroke="#5a4210"/></svg>',
    win: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-linecap="round"><circle cx="12" cy="12" r="9.4" fill="#ffd964" stroke="#e8a72c" stroke-width="2"/><path d="M5.6 9.6h4.2v3.4H5.6zM14.2 9.6h4.2v3.4h-4.2z" fill="#3a2f14" stroke="none"/><path d="M9.8 10.4h4.4M7.2 8.8l.8.8M17 8.8l-.8.8" stroke="#3a2f14" stroke-width="1.4"/><path d="M8.6 15.6c1 1.2 2.2 1.8 3.4 1.8s2.4-.6 3.4-1.8" stroke="#5a4210" stroke-width="2"/></svg>'
  };

  var rows, cols, mines;
  var isMine, nums, cellState, cellEls;
  var started, over, sec, timerId, flagCount, openCount, paused;

  function init(lv) {
    var cfg = LEVELS[lv];
    rows = cfg.rows; cols = cfg.cols; mines = cfg.mines;
    var total = rows * cols;
    isMine = new Array(total);
    nums = new Array(total).fill(0);
    cellState = new Array(total).fill(0);
    cellEls = new Array(total);
    for (var i = 0; i < total; i++) isMine[i] = false;

    started = false;
    over = false;
    sec = 0;
    flagCount = 0;
    openCount = 0;
    paused = false;
    stopTimer();
    timerEl.textContent = '000';
    updateMinesLeft();
    setFace('smile');
    overlay.classList.remove('on');
    buildBoard();
  }

  function buildBoard() {
    boardEl.style.gridTemplateColumns = 'repeat(' + cols + ', var(--ms))';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < rows * cols; i++) {
      var d = document.createElement('div');
      d.className = 'ms-cell';
      d.dataset.i = i;
      cellEls[i] = d;
      frag.appendChild(d);
    }
    boardEl.innerHTML = '';
    boardEl.appendChild(frag);
  }

  function setFace(kind) {
    faceEl.innerHTML = FACES[kind];
  }

  function updateMinesLeft() {
    minesLeftEl.textContent = mines - flagCount;
  }

  /* ----------------------- 布雷 ----------------------- */

  function neighbors(i) {
    var r = Math.floor(i / cols), c = i % cols, out = [];
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        var nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc);
      }
    }
    return out;
  }

  function plantMines(safeIndex) {
    var total = rows * cols;
    var safe = {};
    safe[safeIndex] = true;
    neighbors(safeIndex).forEach(function (n) { safe[n] = true; });

    var pool = [];
    for (var i = 0; i < total; i++) if (!safe[i]) pool.push(i);

    /* 洗牌取前 mines 个 */
    for (var k = pool.length - 1; k > 0; k--) {
      var j = Math.floor(Math.random() * (k + 1));
      var tmp = pool[k]; pool[k] = pool[j]; pool[j] = tmp;
    }
    var n = Math.min(mines, pool.length);
    for (var m = 0; m < n; m++) isMine[pool[m]] = true;

    for (var p = 0; p < total; p++) {
      var cnt = 0;
      neighbors(p).forEach(function (q) { if (isMine[q]) cnt++; });
      nums[p] = cnt;
    }
    started = true;
    startTimer();
  }

  /* ----------------------- 计时 ----------------------- */

  function startTimer() {
    stopTimer();
    timerId = setInterval(function () {
      if (paused) return;
      sec++;
      if (sec > 999) sec = 999;
      timerEl.textContent = ('00' + sec).slice(-3);
    }, 1000);
  }

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  /* ----------------------- 操作 ----------------------- */

  function openCell(i) {
    if (cellState[i] !== 0) return;
    var stack = [i];
    while (stack.length) {
      var cur = stack.pop();
      if (cellState[cur] !== 0) continue;
      cellState[cur] = 1;
      openCount++;
      var el = cellEls[cur];
      el.classList.add('open');
      if (nums[cur] > 0) {
        el.textContent = nums[cur];
        el.dataset.n = nums[cur];
      } else {
        var nb = neighbors(cur);
        for (var k = 0; k < nb.length; k++) {
          if (cellState[nb[k]] === 0 && !isMine[nb[k]]) stack.push(nb[k]);
        }
      }
    }
  }

  function toggleFlag(i) {
    if (over || cellState[i] === 1) return;
    if (cellState[i] === 2) {
      cellState[i] = 0;
      flagCount--;
      cellEls[i].classList.remove('flag');
    } else {
      cellState[i] = 2;
      flagCount++;
      cellEls[i].classList.add('flag');
    }
    updateMinesLeft();
    FB.Sound.play('click');
  }

  function chord(i) {
    if (cellState[i] !== 1 || nums[i] === 0) return;
    var nb = neighbors(i);
    var flags = 0;
    for (var k = 0; k < nb.length; k++) if (cellState[nb[k]] === 2) flags++;
    if (flags !== nums[i]) return;
    for (var m = 0; m < nb.length; m++) {
      var n = nb[m];
      if (cellState[n] === 0) {
        if (isMine[n]) { boom(n); return; }
        openCell(n);
      }
    }
    FB.Sound.play('pop');
    checkWin();
  }

  function boom(i) {
    over = true;
    stopTimer();
    setFace('dead');
    FB.Sound.play('lose');
    for (var k = 0; k < rows * cols; k++) {
      if (isMine[k] && cellState[k] !== 2) {
        cellEls[k].classList.add('mine');
      } else if (!isMine[k] && cellState[k] === 2) {
        cellEls[k].classList.add('wrong');
        cellEls[k].classList.remove('flag');
      }
    }
    cellEls[i].classList.add('mine');
    cellEls[i].style.background = '#c62828';
    setTimeout(function () {
      showOverlay('踩到雷了', sec, '已经坚持了 ' + sec + ' 秒，再来一局？');
    }, 420);
  }

  function checkWin() {
    if (over) return;
    if (openCount === rows * cols - mines) {
      over = true;
      stopTimer();
      setFace('win');
      FB.Sound.play('win');
      /* 自动补旗 */
      for (var k = 0; k < rows * cols; k++) {
        if (isMine[k] && cellState[k] === 0) {
          cellState[k] = 2;
          flagCount++;
          cellEls[k].classList.add('flag');
        }
      }
      updateMinesLeft();
      setTimeout(function () {
        showOverlay('清场完成', sec, '用时 ' + sec + ' 秒，一个雷都没踩。');
      }, 320);
    }
  }

  function showOverlay(title, seconds, sub) {
    ovTitle.textContent = title;
    ovTime.textContent = seconds + 's';
    ovSub.textContent = sub;
    overlay.classList.add('on');
  }

  /* ----------------------- 事件 ----------------------- */

  var pressTimer = null;
  var longPressed = false;

  boardEl.addEventListener('contextmenu', function (e) {
    var cell = e.target.closest('.ms-cell');
    /* 扫雷的右键要用来插旗，所以棋盘上不抢；按住 Alt 时放行，
       让事件冒泡到全局老板键（或直接用中键）。 */
    if (!cell || e.altKey) return;
    e.preventDefault();
    e.stopPropagation();   /* 阻止冒泡，否则全局右键老板键也会一起触发 */
    toggleFlag(parseInt(cell.dataset.i, 10));
  });

  boardEl.addEventListener('click', function (e) {
    var cell = e.target.closest('.ms-cell');
    if (!cell) return;
    if (longPressed) { longPressed = false; return; }
    var i = parseInt(cell.dataset.i, 10);
    if (over || cellState[i] === 2) return;
    if (!started) plantMines(i);
    if (cellState[i] === 1) { chord(i); return; }
    if (isMine[i]) { cellEls[i].classList.add('mine'); openCount++; boom(i); return; }
    openCell(i);
    FB.Sound.play('tick');
    checkWin();
  });

  boardEl.addEventListener('dblclick', function (e) {
    var cell = e.target.closest('.ms-cell');
    if (!cell) return;
    chord(parseInt(cell.dataset.i, 10));
  });

  boardEl.addEventListener('touchstart', function (e) {
    var cell = e.target.closest('.ms-cell');
    if (!cell) return;
    longPressed = false;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(function () {
      longPressed = true;
      toggleFlag(parseInt(cell.dataset.i, 10));
    }, 420);
  }, { passive: true });

  boardEl.addEventListener('touchend', function (e) {
    clearTimeout(pressTimer);
    if (longPressed) e.preventDefault();
  });

  boardEl.addEventListener('touchmove', function () {
    clearTimeout(pressTimer);
  }, { passive: true });

  document.getElementById('levels').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    document.querySelectorAll('#levels button').forEach(function (b) { b.classList.remove('on'); });
    btn.classList.add('on');
    init(btn.dataset.lv);
    FB.Sound.play('click');
  });

  faceEl.addEventListener('click', function () {
    init(currentLevel());
    FB.Sound.play('click');
  });
  document.getElementById('ovNew').addEventListener('click', function () {
    init(currentLevel());
    FB.Sound.play('click');
  });

  function currentLevel() {
    var btn = document.querySelector('#levels button.on');
    return btn ? btn.dataset.lv : 'easy';
  }

  FB.Boss.onToggle = function (on) { paused = on; };

  init('easy');
})();
