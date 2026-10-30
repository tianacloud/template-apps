/* ============================================================
   贪吃蛇
   ============================================================ */
(function () {
  'use strict';

  var G = 20, CELL = 20;
  var cv = document.getElementById('cv');
  var ctx = cv.getContext('2d');
  var stage = document.getElementById('stage');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var lenEl = document.getElementById('len');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');
  var pauseTag = document.getElementById('pauseTag');

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = G * CELL * DPR;
  cv.height = G * CELL * DPR;
  ctx.scale(DPR, DPR);

  var snake, dir, queue, food, score, speed, acc, last, over, paused, grew;

  function reset() {
    snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
    dir = { x: 1, y: 0 };
    queue = [];
    score = 0;
    speed = 145;
    acc = 0;
    last = 0;
    over = false;
    paused = false;
    overlay.classList.remove('on');
    pauseTag.classList.remove('on');
    placeFood();
    updateHud();
  }

  function placeFood() {
    var free = [];
    for (var y = 0; y < G; y++) {
      for (var x = 0; x < G; x++) {
        var hit = false;
        for (var i = 0; i < snake.length; i++) {
          if (snake[i].x === x && snake[i].y === y) { hit = true; break; }
        }
        if (!hit) free.push({ x: x, y: y });
      }
    }
    if (!free.length) return;
    food = free[Math.floor(Math.random() * free.length)];
  }

  function updateHud() {
    scoreEl.textContent = FB.fmtNum(score);
    lenEl.textContent = snake.length;
    var res = FB.Store.best('snake', score);
    bestEl.textContent = FB.fmtNum(res.best);
  }

  function turn(d) {
    if (!queue.length) {
      var base = dir;
      if (base.x === -d.x && base.y === -d.y) return;
      if (base.x === d.x && base.y === d.y) return;
    }
    var lastDir = queue.length ? queue[queue.length - 1] : dir;
    if (lastDir.x === -d.x && lastDir.y === -d.y) return;
    if (lastDir.x === d.x && lastDir.y === d.y) return;
    if (queue.length < 3) queue.push(d);
  }

  function step() {
    if (queue.length) dir = queue.shift();

    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= G || head.y < 0 || head.y >= G) return die('撞墙了');
    for (var i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) return die('咬到自己了');
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      speed = Math.max(70, speed - 3.5);
      placeFood();
      FB.Sound.play('pop');
    } else {
      snake.pop();
    }
    updateHud();
  }

  function die(reason) {
    over = true;
    FB.Sound.play('lose');
    var res = FB.Store.best('snake', score);
    ovTitle.textContent = reason;
    ovScore.textContent = FB.fmtNum(score);
    ovSub.textContent = '长度 ' + snake.length + ' · ' +
      (res.isNew ? '刷新了最高分。' : '最高分 ' + FB.fmtNum(res.best));
    setTimeout(function () { overlay.classList.add('on'); }, 260);
    updateHud();
  }

  /* ----------------------- 绘制 ----------------------- */

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function draw() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.clearRect(0, 0, G * CELL, G * CELL);
    ctx.fillStyle = dark ? '#131a24' : '#f7fbfd';
    ctx.fillRect(0, 0, G * CELL, G * CELL);

    ctx.strokeStyle = dark ? 'rgba(255,255,255,.04)' : 'rgba(24,60,80,.045)';
    ctx.lineWidth = 1;
    for (var i = 1; i < G; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, G * CELL); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(G * CELL, i * CELL); ctx.stroke();
    }

    /* 食物 */
    if (food) {
      var pulse = 1 + Math.sin(Date.now() / 260) * 0.07;
      var fr = (CELL / 2 - 2.4) * pulse;
      var g = ctx.createRadialGradient(
        food.x * CELL + CELL / 2 - fr * 0.35, food.y * CELL + CELL / 2 - fr * 0.35, fr * 0.15,
        food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, fr
      );
      g.addColorStop(0, '#ff9b9b');
      g.addColorStop(1, '#ee3f47');
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, fr, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    /* 蛇身 */
    for (var s = snake.length - 1; s >= 0; s--) {
      var p = snake[s];
      var t = s / Math.max(1, snake.length);
      var col = s === 0 ? '#12a3a3' : mix('#22b8cf', '#7ee0d8', Math.min(1, t * 1.4));
      roundRect(ctx, p.x * CELL + 1.6, p.y * CELL + 1.6, CELL - 3.2, CELL - 3.2, s === 0 ? 6 : 5);
      ctx.fillStyle = col;
      ctx.fill();
    }

    /* 眼睛 */
    if (snake.length) {
      var h = snake[0];
      var cx = h.x * CELL + CELL / 2;
      var cy = h.y * CELL + CELL / 2;
      var ox = dir.x * 3.2, oy = dir.y * 3.2;
      var px = -dir.y * 3.4, py = dir.x * 3.4;
      for (var e = 0; e < 2; e++) {
        var sign = e === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.arc(cx + ox + px * sign, cy + oy + py * sign, 2.1, 0, Math.PI * 2);
        ctx.fillStyle = '#0b3b45';
        ctx.fill();
      }
    }
  }

  function mix(a, b, t) {
    function parse(h) {
      h = h.replace('#', '');
      return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }
    var A = parse(a), B = parse(b);
    return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' +
      Math.round(A[1] + (B[1] - A[1]) * t) + ',' +
      Math.round(A[2] + (B[2] - A[2]) * t) + ')';
  }

  /* ----------------------- 主循环 ----------------------- */

  function loop(t) {
    if (!last) last = t;
    var dt = Math.min(t - last, 100);
    last = t;
    if (!paused && !over) {
      acc += dt;
      while (acc >= speed) {
        acc -= speed;
        step();
        if (over) break;
      }
    }
    draw();
    requestAnimationFrame(loop);
  }

  /* ----------------------- 输入 ----------------------- */

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); turn({ x: 0, y: -1 }); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); turn({ x: 0, y: 1 }); }
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); turn({ x: -1, y: 0 }); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { e.preventDefault(); turn({ x: 1, y: 0 }); }
    else if (k === 'p' || k === 'P') {
      e.preventDefault();
      if (over) return;
      paused = !paused;
      pauseTag.classList.toggle('on', paused);
      FB.Sound.play('click');
    }
  });

  var tx = 0, ty = 0;
  stage.addEventListener('touchstart', function (e) {
    if (!e.touches.length) return;
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    var t = e.changedTouches[0];
    var dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) turn({ x: dx > 0 ? 1 : -1, y: 0 });
    else turn({ x: 0, y: dy > 0 ? 1 : -1 });
  }, { passive: true });
  stage.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

  document.getElementById('bUp').addEventListener('click', function () { turn({ x: 0, y: -1 }); });
  document.getElementById('bDown').addEventListener('click', function () { turn({ x: 0, y: 1 }); });
  document.getElementById('bLeft').addEventListener('click', function () { turn({ x: -1, y: 0 }); });
  document.getElementById('bRight').addEventListener('click', function () { turn({ x: 1, y: 0 }); });
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
