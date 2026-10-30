/* ============================================================
   合成大西瓜 — 自写简易圆形刚体物理
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('cv');
  var ctx = cv.getContext('2d');
  var stage = document.getElementById('stage');
  var evoEl = document.getElementById('evo');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var overlay = document.getElementById('overlay');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');

  var W = 360, H = 560, SIDE = 10, LINE_Y = 82;
  var SOLVER_ITER = 16;   /* 每帧位置约束松弛次数：16 次可把最坏重叠压到 3px 内，再多收益递减 */
  var POS_SLOP = 0.06;    /* 小于该重叠量视为已贴合，避免抖动 */
  var POS_RELAX = 0.9;    /* 单次松弛的分离比例 */
  var GRAVITY = 0.66;     /* 每帧重力增量 */
  var AIR_DRAG = 0.968;   /* 速度衰减：与重力一起决定终端速度约 20px/帧 */
  var MAX_SPEED = 18;     /* 单帧位移上限，防止高速穿透 */
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = W * DPR;
  cv.height = H * DPR;
  ctx.scale(DPR, DPR);

  var FRUITS = [
    { r: 15, color: '#9b6bd8' },
    { r: 19, color: '#ef476f' },
    { r: 24, color: '#f7913c' },
    { r: 30, color: '#f2c14e' },
    { r: 36, color: '#8bc34a' },
    { r: 42, color: '#e5533d' },
    { r: 49, color: '#f7a3a3' },
    { r: 57, color: '#f5c542' },
    { r: 66, color: '#2e9e4f' }
  ];
  var DROP_POOL = [0, 0, 0, 1, 1, 2, 2, 3, 3, 4];

  var bodies, score, best, curLevel, nextLevel, aimX, cooldown, over, paused, dying;
  var drawOrder = [];

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function randLevel() { return DROP_POOL[Math.floor(Math.random() * DROP_POOL.length)]; }

  function shade(hex, amt) {
    var c = hex.replace('#', '');
    var r = parseInt(c.substr(0, 2), 16);
    var g = parseInt(c.substr(2, 2), 16);
    var b = parseInt(c.substr(4, 2), 16);
    if (amt > 0) {
      r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt;
    } else {
      r *= (1 + amt); g *= (1 + amt); b *= (1 + amt);
    }
    return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
  }

  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  /* ----------------------- 右侧进化链 ----------------------- */

  var evoBalls = [];

  /* 把 9 个等级一次性铺成一条链：DOM 顺序由小到大，
     靠 CSS 的 column-reverse（桌面）/ row（窄屏）决定视觉方向 */
  function buildEvo() {
    var minR = FRUITS[0].r;
    var maxR = FRUITS[FRUITS.length - 1].r;
    var html = '';
    for (var i = 0; i < FRUITS.length; i++) {
      var f = FRUITS[i];
      if (i > 0) html += '<span class="evo-arrow"></span>';
      var t = (f.r - minR) / (maxR - minR);
      html += '<span class="evo-ball" data-lv="' + i + '"' +
        ' style="--t:' + t.toFixed(3) +
        ';--c:' + f.color +
        ';--cl:' + shade(f.color, 0.45) +
        ';--cd:' + shade(f.color, -0.2) + '"></span>';
    }
    evoEl.innerHTML = html;
    evoBalls = evoEl.querySelectorAll('.evo-ball');
  }

  /* 高亮当前手上这颗球所在的级别 */
  function setEvoActive(lv) {
    for (var i = 0; i < evoBalls.length; i++) {
      if (i === lv) evoBalls[i].classList.add('on');
      else evoBalls[i].classList.remove('on');
    }
  }

  function reset() {
    bodies = [];
    score = 0;
    over = false;
    dying = false;
    cooldown = 0;
    aimX = W / 2;
    curLevel = randLevel();
    nextLevel = randLevel();
    overlay.classList.remove('on');
    updateScore();
    setEvoActive(curLevel);
  }

  function updateScore() {
    scoreEl.textContent = FB.fmtNum(score);
    var res = FB.Store.best('watermelon', score);
    bestEl.textContent = FB.fmtNum(res.best);
  }

  /* ----------------------- 投放 ----------------------- */

  function drop() {
    if (over || paused || cooldown > 0) return;
    var f = FRUITS[curLevel];
    var x = clamp(aimX, SIDE + f.r + 1, W - SIDE - f.r - 1);
    bodies.push({
      x: x, y: LINE_Y - 34, px: x, py: LINE_Y - 34, vx: 0, vy: 0, r: f.r, lv: curLevel,
      overTime: 0, spawn: 0
    });
    curLevel = nextLevel;
    nextLevel = randLevel();
    setEvoActive(curLevel);
    cooldown = 0.4;
    FB.Sound.play('pop');
  }

  /* ----------------------- 物理 ----------------------- */

  function step() {
    if (cooldown > 0) cooldown = Math.max(0, cooldown - 1 / 60);

    var i, b;
    for (i = 0; i < bodies.length; i++) {
      b = bodies[i];
      /* 合并时的弹出放大必须衰减，否则视觉半径长期大于碰撞半径 */
      if (b.spawn > 0) b.spawn = Math.max(0, b.spawn - 1 / 60);

      /* 记下本帧起点：解算结束后用实际位移反推速度（Verlet 式） */
      b.px = b.x;
      b.py = b.y;

      b.vy += GRAVITY;
      if (b.vy > MAX_SPEED) b.vy = MAX_SPEED;
      if (b.vx > MAX_SPEED) b.vx = MAX_SPEED;
      else if (b.vx < -MAX_SPEED) b.vx = -MAX_SPEED;

      b.x += b.vx;
      b.y += b.vy;
    }

    var merges = [];
    /* 位置约束用多次松弛求解：迭代太少会让深堆里的球长期互相咬进十几像素 */
    for (var iter = 0; iter < SOLVER_ITER; iter++) {
      for (i = 0; i < bodies.length; i++) {
        for (var j = i + 1; j < bodies.length; j++) {
          resolve(bodies[i], bodies[j], iter === 0, merges, iter === 0);
        }
      }
      /* 分离修正可能把球挤出墙外，每次迭代后重新夹紧位置 */
      for (var k2 = 0; k2 < bodies.length; k2++) clampPos(bodies[k2]);
    }

    /* 用本帧实际位移重新计算速度。
       这样被墙或被别的球顶住的球，法向速度会自动归零，
       不会出现"位置被推回去、速度却还在累积重力"的情况——
       那种球一旦松动就会高速窜出，直接穿透旁边的球 */
    for (i = 0; i < bodies.length; i++) {
      b = bodies[i];
      b.vx = (b.x - b.px) * AIR_DRAG;
      b.vy = (b.y - b.py) * AIR_DRAG;
    }

    if (merges.length) {
      var removeSet = [];
      for (var m = 0; m < merges.length; m++) {
        var a = merges[m][0], c = merges[m][1];
        if (removeSet.indexOf(a) > -1 || removeSet.indexOf(c) > -1) continue;
        removeSet.push(a, c);
        var lv = a.lv + 1;
        var mx = (a.x + c.x) / 2;
        var my = (a.y + c.y) / 2;
        score += (lv + 1) * 5;
        if (lv < FRUITS.length) {
          bodies.push({
            x: mx, y: my, px: mx, py: my, vx: 0, vy: -1.2, r: FRUITS[lv].r, lv: lv,
            overTime: 0, spawn: 0.22
          });
        } else {
          score += 150;
        }
        FB.Sound.play(lv >= 6 ? 'win' : 'merge');
      }
      bodies = bodies.filter(function (bb) { return removeSet.indexOf(bb) === -1; });
      /* 升级后的球半径明显变大，且诞生在最拥挤的地方，必须立刻再解算一次，
         否则这一帧会与周围球重叠十几像素，看起来就像被挤扁了 */
      settle();
      updateScore();
    }

    /* 越线判定 */
    if (!over) {
      for (i = 0; i < bodies.length; i++) {
        b = bodies[i];
        var calm = Math.abs(b.vy) < 1.5 && Math.abs(b.vx) < 1.5;
        if (b.y - b.r < LINE_Y && calm && b.spawn <= 0) {
          b.overTime += 1 / 60;
          if (b.overTime > 1.3) { gameOver(); break; }
        } else if (b.overTime > 0) {
          b.overTime = Math.max(0, b.overTime - 3 / 60);
        }
      }
    }
  }

  function clampPos(b) {
    if (b.x - b.r < SIDE) b.x = SIDE + b.r;
    if (b.x + b.r > W - SIDE) b.x = W - SIDE - b.r;
    if (b.y + b.r > H - SIDE) b.y = H - SIDE - b.r;
    if (b.y - b.r < 0) b.y = b.r;
  }

  /* 纯位置松弛：只把重叠推开，不改速度、不触发合并 */
  function settle() {
    for (var it = 0; it < SOLVER_ITER; it++) {
      for (var i = 0; i < bodies.length; i++) {
        for (var j = i + 1; j < bodies.length; j++) {
          resolve(bodies[i], bodies[j], false, null, it === 0);
        }
      }
      for (var k = 0; k < bodies.length; k++) clampPos(bodies[k]);
    }
  }

  function resolve(a, b, canMerge, merges, doImpulse) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var minD = a.r + b.r;
    if (Math.abs(dx) > minD || Math.abs(dy) > minD) return;
    var d2 = dx * dx + dy * dy;
    if (d2 >= minD * minD) return;

    if (canMerge && a.lv === b.lv && merges.length < 8) {
      merges.push([a, b]);
      return;
    }

    var d = Math.sqrt(d2) || 0.001;
    var nx = dx / d, ny = dy / d;
    var overlap = minD - d;
    if (overlap < POS_SLOP) return;
    var ma = a.r * a.r, mb = b.r * b.r, tm = ma + mb;

    /* 位置分离：质量大的少移动 */
    a.x -= nx * overlap * (mb / tm) * POS_RELAX;
    a.y -= ny * overlap * (mb / tm) * POS_RELAX;
    b.x += nx * overlap * (ma / tm) * POS_RELAX;
    b.y += ny * overlap * (ma / tm) * POS_RELAX;

    /* 沿法线做一次非弹性冲量：整步只做一次，重复做会让堆叠的球不断获得能量 */
    if (!doImpulse) return;
    var rvx = b.vx - a.vx;
    var rvy = b.vy - a.vy;
    var vn = rvx * nx + rvy * ny;
    if (vn < 0) {
      var e = 0.16;
      var jn = -(1 + e) * vn / (1 / ma + 1 / mb);
      a.vx -= jn * nx / ma;
      a.vy -= jn * ny / ma;
      b.vx += jn * nx / mb;
      b.vy += jn * ny / mb;
      /* 切向摩擦 */
      var tx = -ny, ty = nx;
      var vt = rvx * tx + rvy * ty;
      var jt = -vt / (1 / ma + 1 / mb) * 0.2;
      a.vx -= jt * tx / ma; a.vy -= jt * ty / ma;
      b.vx += jt * tx / mb; b.vy += jt * ty / mb;
    }
  }

  function gameOver() {
    if (over) return;
    over = true;
    FB.Sound.play('lose');
    FB.Store.best('watermelon', score);
    ovScore.textContent = FB.fmtNum(score);
    ovSub.textContent = score >= FB.Store.getBest('watermelon') ? '刷新了最高分。' : '还差一点，再来一局？';
    setTimeout(function () { overlay.classList.add('on'); }, 420);
  }

  /* ----------------------- 绘制 ----------------------- */

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawFruit(x, y, r, lv, alpha, vx, vy, scale) {
    var f = FRUITS[lv];
    var s = scale == null ? 1 : scale;
    var rr = r * s;
    ctx.globalAlpha = alpha == null ? 1 : alpha;

    var g = ctx.createRadialGradient(x - rr * 0.3, y - rr * 0.34, rr * 0.1, x, y, rr * 1.04);
    g.addColorStop(0, shade(f.color, 0.45));
    g.addColorStop(0.55, f.color);
    g.addColorStop(1, shade(f.color, -0.2));
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    /* 极细的深色轮廓：球互相贴近时边界清楚，不会糊成一团 */
    var baseAlpha = alpha == null ? 1 : alpha;
    ctx.strokeStyle = shade(f.color, -0.45);
    ctx.lineWidth = Math.max(0.8, rr * 0.032);
    ctx.globalAlpha = baseAlpha * 0.5;
    ctx.stroke();
    ctx.globalAlpha = baseAlpha;

    ctx.beginPath();
    ctx.arc(x - rr * 0.33, y - rr * 0.36, rr * 0.19, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fill();

    if (rr > 16) {
      var ex = clamp((vx || 0) * 0.5, -rr * 0.12, rr * 0.12);
      var ey = clamp((vy || 0) * 0.5, -rr * 0.12, rr * 0.12);
      var eo = rr * 0.26;
      var er = rr * 0.135;
      ctx.fillStyle = 'rgba(28,20,14,.86)';
      ctx.beginPath(); ctx.arc(x - eo + ex, y - rr * 0.06 + ey, er, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + eo + ex, y - rr * 0.06 + ey, er, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.beginPath(); ctx.arc(x - eo + ex - er * 0.3, y - rr * 0.06 + ey - er * 0.35, er * 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + eo + ex - er * 0.3, y - rr * 0.06 + ey - er * 0.35, er * 0.35, 0, Math.PI * 2); ctx.fill();
      /* 腮红 */
      ctx.fillStyle = 'rgba(255,120,120,.28)';
      ctx.beginPath(); ctx.arc(x - eo * 1.7, y + rr * 0.18, er * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + eo * 1.7, y + rr * 0.18, er * 0.9, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    var dark = isDark();
    ctx.clearRect(0, 0, W, H);

    /* 容器底 */
    ctx.fillStyle = dark ? '#1b1a24' : '#fff8ec';
    ctx.fillRect(0, 0, W, H);

    roundRect(SIDE, SIDE, W - SIDE * 2, H - SIDE * 2, 20);
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.14)' : 'rgba(160,120,70,.28)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 警戒线 */
    ctx.save();
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = 'rgba(242,84,91,.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(SIDE + 4, LINE_Y);
    ctx.lineTo(W - SIDE - 4, LINE_Y);
    ctx.stroke();
    ctx.restore();

    /* 待投放 */
    if (!over && !paused) {
      var cf = FRUITS[curLevel];
      var cx = clamp(aimX, SIDE + cf.r + 1, W - SIDE - cf.r - 1);
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = dark ? 'rgba(255,255,255,.18)' : 'rgba(160,120,70,.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, LINE_Y - 8);
      ctx.lineTo(cx, H - SIDE);
      ctx.stroke();
      ctx.restore();
      drawFruit(cx, LINE_Y - 34, cf.r, curLevel, 0.96, 0, 0, 1);
    }

    /* 下一个预览 */
    var pf = FRUITS[nextLevel];
    drawFruit(W - 40, 34, pf.r * 0.62, nextLevel, 0.5, 0, 0, 1);
    ctx.fillStyle = dark ? 'rgba(255,255,255,.42)' : 'rgba(120,90,50,.5)';
    ctx.font = '10px -apple-system, "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT', W - 40, 62);

    /* 所有水果：按 y 从小到大绘制，靠前（y 大）的后画，遮挡层次才符合景深 */
    drawOrder.length = 0;
    for (var i = 0; i < bodies.length; i++) drawOrder.push(bodies[i]);
    drawOrder.sort(function (p, q) { return p.y - q.y; });
    for (var n = 0; n < drawOrder.length; n++) {
      var b = drawOrder[n];
      var sc = b.spawn > 0 ? 1 + b.spawn * 0.6 : 1;
      drawFruit(b.x, b.y, b.r, b.lv, 1, b.vx, b.vy, sc);
    }
  }

  /* ----------------------- 主循环 ----------------------- */

  var last = 0, acc = 0;
  function loop(t) {
    if (!last) last = t;
    var dt = Math.min(t - last, 60);
    last = t;
    if (!paused && !over) {
      acc += dt;
      var guard = 0;
      while (acc >= 1000 / 60 && guard < 4) {
        step();
        acc -= 1000 / 60;
        guard++;
      }
      if (acc > 200) acc = 0;
    }
    draw();
    requestAnimationFrame(loop);
  }

  /* ----------------------- 输入 ----------------------- */

  function toLocalX(clientX) {
    var rect = cv.getBoundingClientRect();
    var scale = W / rect.width;
    return (clientX - rect.left) * scale;
  }

  var pressing = false;

  stage.addEventListener('pointerdown', function (e) {
    pressing = true;
    aimX = toLocalX(e.clientX);
  });
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'mouse' || e.buttons) aimX = toLocalX(e.clientX);
  });
  window.addEventListener('pointerup', function (e) {
    if (!pressing) return;
    pressing = false;
    /* 右键 / 中键已用于老板键，不投放水果 */
    if (e.button !== 0) return;
    if (typeof e.clientX === 'number' && e.clientX > 0) aimX = toLocalX(e.clientX);
    drop();
  });
  window.addEventListener('pointercancel', function () { pressing = false; });
  stage.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

  /* 自适应高度：窄屏时按视口高度限制宽度 */
  function fitStage() {
    var maxByHeight = (window.innerHeight * 0.6) * (W / H);
    stage.style.maxWidth = Math.max(240, Math.min(360, maxByHeight)) + 'px';
    /* 进化链与画布等高；窄屏横排时交给 CSS 的 height:auto */
    if (window.innerWidth > 680) evoEl.style.height = stage.offsetHeight + 'px';
    else evoEl.style.height = '';
  }
  window.addEventListener('resize', fitStage);

  document.getElementById('ovNew').addEventListener('click', function () {
    reset();
    FB.Sound.play('click');
  });

  FB.Boss.onToggle = function (on) { paused = on; };

  buildEvo();   /* 必须早于 fitStage 与 reset：前者要读链的高度，后者要设高亮 */
  fitStage();
  reset();
  requestAnimationFrame(loop);
})();
