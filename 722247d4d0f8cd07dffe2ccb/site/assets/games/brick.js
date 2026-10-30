/* ============================================================
   摸鱼盒子 · 打砖块
   逻辑坐标固定 480×540，按 CSS 尺寸整体缩放，物理运算与屏幕无关。
   鼠标 / 触摸 / 方向键移动挡板，点击或空格发球。
   八关，起始三条命，每过一关奖励一条（上限五条）。
   ============================================================ */
(function () {
  'use strict';

  var W = 480, H = 540;

  var COLS = 9, SIDE = 16, GAP = 6, BH = 20, TOP = 40;
  var BW = (W - SIDE * 2 - (COLS - 1) * GAP) / COLS;

  var PADDLE_W = 88, PADDLE_H = 12, PADDLE_Y = H - 34;
  var BALL_R = 6;

  var STEP = 1000 / 120;          /* 固定物理步长 */
  var MAX_STEPS = 5;

  var START_LIVES = 3, MAX_LIVES = 5;

  /* 每关：行数、球速、砖块分布（pattern 收到 行号 r、列号 c）
     八关砖块合计 233 块，按正常节奏一局约七到九分钟 */
  var LEVELS = [
    {
      /* 1 满墙，热身 36 块 */
      rows: 4, speed: 4.2,
      pattern: function () { return true; }
    },
    {
      /* 2 棋盘格 27 块 */
      rows: 5, speed: 4.6,
      pattern: function (r, c) { return r === 0 || (r + c) % 2 === 0; }
    },
    {
      /* 3 正金字塔，顶上窄 34 块 */
      rows: 6, speed: 5.0,
      pattern: function (r, c) { return Math.abs(c - 4) <= r; }
    },
    {
      /* 4 竖条纹，六列留三列空 24 块 */
      rows: 4, speed: 4.8,
      pattern: function (r, c) { return c % 3 !== 1; }
    },
    {
      /* 5 菱形 23 块 */
      rows: 5, speed: 5.4,
      pattern: function (r, c) { return Math.abs(c - 4) + Math.abs(r - 2) <= 3; }
    },
    {
      /* 6 空心边框，中间全通 26 块 */
      rows: 6, speed: 5.8,
      pattern: function (r, c) { return r === 0 || r === 5 || c === 0 || c === 8; }
    },
    {
      /* 7 斜纹网，块少但球最快之一 15 块 */
      rows: 5, speed: 6.2,
      pattern: function (r, c) { return (r + c) % 3 === 0; }
    },
    {
      /* 8 倒金字塔 + 厚底座，终关 48 块 */
      rows: 6, speed: 6.6,
      pattern: function (r, c) { return Math.abs(c - 4) <= (5 - r) || r >= 4; }
    }
  ];

  var ROW_COLORS = ['#f2545b', '#f0873f', '#f0b429', '#2fbf8f', '#22a8cf', '#5b6ef5', '#e2569b'];
  var ROW_COLORS_DARK = ['#ff6b71', '#ffa05c', '#ffc94d', '#3fd6a2', '#3fc4e8', '#7d8dff', '#f070b0'];

  var cv = document.getElementById('board');
  var ctx = cv.getContext('2d');
  var scoreEl = document.getElementById('score');
  var livesEl = document.getElementById('lives');
  var bestEl = document.getElementById('best');
  var lvEl = document.getElementById('lv');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');

  var scale = 1;                  /* 逻辑坐标 → CSS 像素 */
  var bricks = [];
  var paddle = { x: W / 2, w: PADDLE_W };
  var ball = { x: W / 2, y: 0, vx: 0, vy: 0, speed: 4.2 };
  var state = 'ready';            /* ready | playing | over | cleared */
  var level = 0;
  var score = 0, lives = 3, cleared = 0;
  var best = FB.Store.get('brick.best', 0) || 0;
  var paused = false;
  var keys = {};
  var raf = null, lastT = 0, acc = 0;
  var clearTimer = null;
  var idleHits = 0;      /* 连续接球但没碰到砖的次数，用于脱困 */

  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  /* ----------------------- 关卡 ----------------------- */

  function buildLevel() {
    var cfg = LEVELS[level];
    bricks = [];
    for (var r = 0; r < cfg.rows; r++) {
      for (var c = 0; c < COLS; c++) {
        if (!cfg.pattern(r, c)) continue;
        bricks.push({
          x: SIDE + c * (BW + GAP),
          y: TOP + r * (BH + GAP),
          w: BW, h: BH,
          row: r, alive: true
        });
      }
    }
    ball.speed = cfg.speed;
    resetBall();
    state = 'ready';
    lvEl.textContent = (level + 1) + '/' + LEVELS.length;
    paintHud();
  }

  function aliveCount() {
    var n = 0;
    for (var i = 0; i < bricks.length; i++) if (bricks[i].alive) n++;
    return n;
  }

  function resetBall() {
    ball.x = paddle.x;
    ball.y = PADDLE_Y - BALL_R - 2;
    ball.vx = 0;
    ball.vy = 0;
  }

  function launch() {
    if (state !== 'ready' || paused) return;
    state = 'playing';
    /* 根据挡板当前偏移给一点初始角度，避免每次都同一条弹道 */
    var a = (paddle.x - W / 2) / (W / 2) * 0.5;
    a = Math.max(-0.5, Math.min(0.5, a)) * 0.4 + (Math.random() - 0.5) * 0.16;
    ball.vx = Math.sin(a) * ball.speed;
    ball.vy = -Math.cos(a) * ball.speed;
    FB.Sound.play('pop');
  }

  function newGame() {
    clearTimeout(clearTimer);
    level = 0;
    score = 0;
    lives = START_LIVES;
    cleared = 0;
    paused = false;
    keys = {};
    acc = 0;
    overlay.classList.remove('on');
    paddle.x = W / 2;
    buildLevel();
    FB.Sound.play('click');
  }

  /* 命用完了不从头来：留在当前关重试，命数复原，分数保留 */
  function retryLevel() {
    clearTimeout(clearTimer);
    lives = START_LIVES;
    paused = false;
    keys = {};
    acc = 0;
    overlay.classList.remove('on');
    paddle.x = W / 2;
    buildLevel();
    FB.Sound.play('click');
  }

  function nextLevel() {
    if (level >= LEVELS.length - 1) {
      win();
      return;
    }
    level++;
    paddle.x = W / 2;
    var gain = lives < MAX_LIVES;
    if (gain) lives++;
    buildLevel();
    FB.toast('第 ' + (level + 1) + ' 关' + (gain ? ' · 生命 +1' : ''));
  }

  function win() {
    state = 'over';
    if (score > best) { best = score; FB.Store.set('brick.best', best); }
    paintHud();
    ovTitle.textContent = LEVELS.length + ' 关全清';
    ovScore.textContent = score + ' 分';
    ovSub.textContent = '最高分 ' + best + ' · 一共打掉 ' + cleared + ' 块砖';
    document.getElementById('ovRetry').style.display = 'none';
    overlay.classList.add('on');
    FB.Sound.play('win');
  }

  function gameOver() {
    state = 'over';
    if (score > best) { best = score; FB.Store.set('brick.best', best); }
    paintHud();
    ovTitle.textContent = '游戏结束';
    ovScore.textContent = score + ' 分';
    ovSub.textContent = '最高分 ' + best + ' · 打到第 ' + (level + 1) + ' 关';
    document.getElementById('ovRetry').style.display = '';
    overlay.classList.add('on');
    FB.Sound.play('lose');
  }

  function paintHud() {
    scoreEl.textContent = FB.fmtNum(score);
    bestEl.textContent = FB.fmtNum(best);
    var cap = Math.max(START_LIVES, lives);
    var s = '';
    for (var i = 0; i < cap; i++) s += i < lives ? '♥' : '♡';
    livesEl.textContent = s;
  }

  /* ----------------------- 物理 ----------------------- */

  function update(dt) {
    var k = dt / STEP;

    /* 键盘移动挡板 */
    var mv = 0;
    if (keys.left) mv -= 6 * k;
    if (keys.right) mv += 6 * k;
    if (mv) paddle.x += mv;
    paddle.x = Math.max(paddle.w / 2, Math.min(W - paddle.w / 2, paddle.x));

    if (state === 'ready') {
      ball.x = paddle.x;
      ball.y = PADDLE_Y - BALL_R - 2;
      return;
    }
    if (state !== 'playing') return;

    ball.x += ball.vx * k;
    ball.y += ball.vy * k;

    /* 左右墙 */
    if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); FB.Sound.play('move'); }
    if (ball.x + BALL_R > W) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); FB.Sound.play('move'); }
    /* 顶墙 */
    if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); FB.Sound.play('move'); }

    /* 挡板 */
    var py = PADDLE_Y;
    if (ball.vy > 0 &&
        ball.y + BALL_R >= py && ball.y - BALL_R <= py + PADDLE_H &&
        ball.x >= paddle.x - paddle.w / 2 - BALL_R &&
        ball.x <= paddle.x + paddle.w / 2 + BALL_R) {
      ball.y = py - BALL_R;
      var rel = (ball.x - paddle.x) / (paddle.w / 2);
      rel = Math.max(-1, Math.min(1, rel));
      /* 一直用挡板正中心接球 → 球会垂直上下弹，打完一列后就在空列里空转。
         连续几次接球都没摸到砖，就把球往边上拨一点，自己脱困。 */
      idleHits++;
      if (idleHits >= 3 && Math.abs(rel) < 0.25) {
        rel = (Math.random() < 0.5 ? -1 : 1) * (0.34 + Math.random() * 0.26);
        idleHits = 0;
      }
      var ang = rel * 1.02;                       /* 最外侧约 58° */
      var sp = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      sp = Math.min(sp + 0.02, ball.speed * 1.3); /* 轻微加速，有上限 */
      ball.vx = Math.sin(ang) * sp;
      ball.vy = -Math.abs(Math.cos(ang) * sp);
      FB.Sound.play('click');
    }

    /* 砖块 */
    for (var i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (!b.alive) continue;
      var cx = Math.max(b.x, Math.min(ball.x, b.x + b.w));
      var cy = Math.max(b.y, Math.min(ball.y, b.y + b.h));
      var dx = ball.x - cx, dy = ball.y - cy;
      if (dx * dx + dy * dy > BALL_R * BALL_R) continue;

      /* 用最小穿透轴决定反弹方向 */
      var ox = (b.w / 2 + BALL_R) - Math.abs(ball.x - (b.x + b.w / 2));
      var oy = (b.h / 2 + BALL_R) - Math.abs(ball.y - (b.y + b.h / 2));
      if (ox < oy) {
        ball.vx = -ball.vx;
        ball.x += ball.vx > 0 ? ox : -ox;
      } else {
        ball.vy = -ball.vy;
        ball.y += ball.vy > 0 ? oy : -oy;
      }

      b.alive = false;
      cleared++;
      idleHits = 0;
      score += 10 + (LEVELS[level].rows - b.row) * 2;
      paintHud();
      FB.Sound.play('good');

      if (aliveCount() === 0) {
        state = 'cleared';
        clearTimer = setTimeout(nextLevel, 720);
        FB.Sound.play('win');
      }
      break;   /* 一帧只吃一块，避免连续穿砖 */
    }

    /* 掉出底部 */
    if (ball.y - BALL_R > H) {
      lives--;
      paintHud();
      if (lives <= 0) { gameOver(); return; }
      FB.Sound.play('bad');
      paddle.x = W / 2;
      resetBall();
      state = 'ready';
    }

    /* 防御：避免球几乎水平飞行 */
    if (Math.abs(ball.vy) < 0.9) {
      ball.vy = ball.vy >= 0 ? 0.9 : -0.9;
    }
  }

  /* ----------------------- 绘制 ----------------------- */

  function layout() {
    var maxW = Math.min(window.innerWidth * 0.93, 460);
    var wrap = cv.parentNode.clientWidth || maxW;
    var cssW = Math.max(240, Math.min(maxW, wrap > 0 ? wrap : maxW));
    scale = cssW / W;

    var dpr = window.devicePixelRatio || 1;
    cv.style.width = Math.round(cssW) + 'px';
    cv.style.height = Math.round(cssW * (H / W)) + 'px';
    cv.width = Math.round(cssW * dpr);
    cv.height = Math.round(cssW * (H / W) * dpr);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    draw();
  }

  function roundRect(x, y, w, h, r) {
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    var dark = isDark();
    var bg = dark ? '#1b2133' : '#edf1fa';
    var pal = dark ? ROW_COLORS_DARK : ROW_COLORS;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* 砖块 */
    for (var i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (!b.alive) continue;
      var col = pal[b.row % pal.length];
      ctx.fillStyle = col;
      roundRect(b.x, b.y, b.w, b.h, 5);
      ctx.fill();
      /* 顶部高光 */
      ctx.fillStyle = 'rgba(255, 255, 255, .3)';
      roundRect(b.x + 2, b.y + 2, b.w - 4, b.h * 0.34, 3);
      ctx.fill();
    }

    /* 挡板 */
    var px0 = paddle.x - paddle.w / 2;
    var pg = ctx.createLinearGradient(0, PADDLE_Y, 0, PADDLE_Y + PADDLE_H);
    if (dark) { pg.addColorStop(0, '#9aa9d6'); pg.addColorStop(1, '#6272a8'); }
    else { pg.addColorStop(0, '#5b6ef5'); pg.addColorStop(1, '#3d4dc4'); }
    ctx.fillStyle = pg;
    roundRect(px0, PADDLE_Y, paddle.w, PADDLE_H, PADDLE_H / 2);
    ctx.fill();

    /* 球 */
    var bg2 = ctx.createRadialGradient(
      ball.x - BALL_R * 0.35, ball.y - BALL_R * 0.35, BALL_R * 0.15,
      ball.x, ball.y, BALL_R
    );
    bg2.addColorStop(0, dark ? '#ffffff' : '#fff6e2');
    bg2.addColorStop(1, dark ? '#ffc94d' : '#f0a04b');
    ctx.save();
    ctx.shadowColor = dark ? 'rgba(255, 200, 80, .55)' : 'rgba(240, 160, 75, .45)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = bg2;
    ctx.fill();
    ctx.restore();

    /* 待发球提示 */
    if (state === 'ready' && !overlay.classList.contains('on')) {
      ctx.save();
      ctx.font = '600 14px ui-sans-serif, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = dark ? 'rgba(226, 232, 245, .78)' : 'rgba(45, 55, 82, .72)';
      ctx.fillText('点击或按空格发球', W / 2, H - 92);
      ctx.restore();
    }
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (!lastT) lastT = t;
    var dt = Math.min(t - lastT, 100);
    lastT = t;
    if (paused) { acc = 0; return; }
    if (state === 'over') return;

    acc += dt;
    var n = 0;
    while (acc >= STEP && n < MAX_STEPS) {
      update(STEP);
      acc -= STEP;
      n++;
      if (state === 'over') break;
    }
    if (n === MAX_STEPS) acc = 0;
    draw();
  }

  /* ----------------------- 事件 ----------------------- */

  function logicalX(e) {
    var r = cv.getBoundingClientRect();
    return (e.clientX - r.left) / r.width * W;
  }

  cv.addEventListener('pointermove', function (e) {
    e.preventDefault();
    paddle.x = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, logicalX(e)));
    if (state === 'ready') { ball.x = paddle.x; }
  });

  cv.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    paddle.x = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, logicalX(e)));
    if (state === 'ready') launch();
  });

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { keys.left = 1; e.preventDefault(); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { keys.right = 1; e.preventDefault(); }
    else if (k === ' ' || k === 'Enter') {
      e.preventDefault();
      if (state === 'ready') launch();
    }
  });

  document.addEventListener('keyup', function (e) {
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = 0;
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = 0;
  });

  document.getElementById('newBtn').addEventListener('click', newGame);
  document.getElementById('ovNew').addEventListener('click', newGame);
  document.getElementById('ovRetry').addEventListener('click', retryLevel);

  /* 主题切换后按新配色重画 */
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

  FB.Boss.onToggle = function (on) {
    paused = on;
    if (on) { keys.left = 0; keys.right = 0; }
  };

  newGame();
  layout();
  raf = requestAnimationFrame(loop);
})();
