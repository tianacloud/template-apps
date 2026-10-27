/* ============================================================
   打地鼠
   ============================================================ */
(function () {
  'use strict';

  var stage = document.getElementById('stage');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var secEl = document.getElementById('sec');
  var timerBar = document.getElementById('timerBar');
  var timerFill = timerBar.querySelector('i');
  var comboTag = document.getElementById('comboTag');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');
  var ovStart = document.getElementById('ovStart');

  var TOTAL = 30;
  var holes = [];
  var score, combo, lastHit, running, paused;
  var endAt, tickId, spawnId, sec;

  /* ----------------------- 建立九宫格洞穴 ----------------------- */

  function build() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 9; i++) {
      var hole = document.createElement('div');
      hole.className = 'whack-hole';
      var mole = document.createElement('div');
      mole.className = 'mole';
      mole.innerHTML = '<div class="face"><span class="eye l"></span><span class="eye r"></span><span class="nose"></span></div>';
      hole.appendChild(mole);
      frag.appendChild(hole);
      holes.push({ el: hole, mole: mole, active: false, timer: null, hit: false });
    }
    stage.appendChild(frag);
  }

  /* ----------------------- 游戏流程 ----------------------- */

  function start() {
    stopAll();
    score = 0;
    combo = 0;
    lastHit = 0;
    sec = TOTAL;
    running = true;
    paused = false;
    scoreEl.textContent = '0';
    secEl.textContent = TOTAL + 's';
    timerFill.style.width = '100%';
    timerBar.classList.remove('low');
    comboTag.classList.remove('on');
    updateBest();
    resetHoles();
    overlay.classList.remove('on');

    endAt = Date.now() + TOTAL * 1000;
    tickId = setInterval(tick, 100);
    spawnId = setTimeout(popLoop, 400);
  }

  function tick() {
    if (!running || paused) return;
    var left = Math.max(0, endAt - Date.now());
    var leftSec = Math.ceil(left / 1000);
    if (leftSec !== sec) {
      sec = leftSec;
      secEl.textContent = sec + 's';
    }
    var pct = (left / (TOTAL * 1000)) * 100;
    timerFill.style.width = pct + '%';
    timerBar.classList.toggle('low', leftSec <= 10);

    if (combo > 0 && Date.now() - lastHit > 2200) {
      combo = 0;
      comboTag.classList.remove('on');
    }
    if (left <= 0) finish();
  }

  function popLoop() {
    if (!running || paused) return;
    popOne();
    if (score > 120) popOne();
    var elapsed = TOTAL * 1000 - Math.max(0, endAt - Date.now());
    var gap = Math.max(300, 720 - elapsed * 0.012);
    spawnId = setTimeout(popLoop, gap + Math.random() * 180);
  }

  function popOne() {
    var free = holes.filter(function (h) { return !h.active; });
    if (!free.length) return;
    var h = free[Math.floor(Math.random() * free.length)];
    var elapsed = TOTAL * 1000 - Math.max(0, endAt - Date.now());
    var upTime = Math.max(380, 900 - elapsed * 0.016);

    h.active = true;
    h.hit = false;
    h.mole.classList.remove('hit');
    h.mole.classList.add('up');
    clearTimeout(h.timer);
    h.timer = setTimeout(function () {
      if (!h.active) return;
      h.active = false;
      h.mole.classList.remove('up', 'hit');
      /* 漏掉的会打断连击 */
      if (combo > 0) {
        combo = 0;
        comboTag.classList.remove('on');
      }
    }, upTime);
  }

  function hitMole(h) {
    if (!h.active || h.hit || !running) return;
    h.hit = true;
    h.active = false;
    clearTimeout(h.timer);

    combo++;
    lastHit = Date.now();
    var gain = 10 + Math.min(30, (combo - 1) * 2);
    score += gain;
    scoreEl.textContent = FB.fmtNum(score);
    FB.Sound.play('good');
    updateBest();

    h.mole.classList.add('hit');
    setTimeout(function () {
      h.mole.classList.remove('up', 'hit');
    }, 120);

    if (combo >= 3) {
      comboTag.textContent = combo + ' 连击  +' + gain;
      comboTag.classList.add('on');
    }
    fx(h, '+' + gain);
  }

  function fx(h, text) {
    var rect = h.el.getBoundingClientRect();
    var srect = stage.getBoundingClientRect();
    var el = document.createElement('span');
    el.className = 'whack-fx';
    el.textContent = text;
    el.style.left = (rect.left - srect.left + rect.width / 2) + 'px';
    el.style.top = (rect.top - srect.top + rect.height * 0.1) + 'px';
    stage.appendChild(el);
    setTimeout(function () { el.remove(); }, 680);
  }

  function resetHoles() {
    for (var i = 0; i < holes.length; i++) {
      clearTimeout(holes[i].timer);
      holes[i].active = false;
      holes[i].hit = false;
      holes[i].mole.classList.remove('up', 'hit');
    }
  }

  function stopAll() {
    running = false;
    clearInterval(tickId);
    clearTimeout(spawnId);
    resetHoles();
  }

  function finish() {
    running = false;
    clearInterval(tickId);
    clearTimeout(spawnId);

    var res = FB.Store.best('whack', score);
    ovTitle.textContent = score >= 200 ? '手速惊人' : (score >= 100 ? '还不错' : '再来一次吧');
    ovScore.textContent = score;
    ovSub.textContent = res.isNew
      ? '刷新了最高分。'
      : '最高分 ' + res.best + '。';
    ovStart.textContent = '再来一局';
    overlay.classList.add('on');
    FB.Sound.play(score >= 150 ? 'win' : 'lose');

    setTimeout(resetHoles, 200);
  }

  function updateBest() {
    var res = FB.Store.best('whack', score);
    bestEl.textContent = FB.fmtNum(res.best);
  }

  /* ----------------------- 事件 ----------------------- */

  stage.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;   /* 右键 / 中键留给老板键 */
    var mole = e.target.closest('.mole');
    if (!mole) return;
    var idx = Array.prototype.indexOf.call(stage.querySelectorAll('.whack-hole'), mole.parentNode);
    if (idx < 0) return;
    e.preventDefault();
    hitMole(holes[idx]);
  });

  ovStart.addEventListener('click', function () {
    FB.Sound.play('click');
    start();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === ' ' && !overlay.classList.contains('on')) {
      e.preventDefault();
    }
  });

  FB.Boss.onToggle = function (on) {
    paused = on;
    if (on) {
      resetHoles();
    }
  };

  build();
  score = 0;
  combo = 0;
  running = false;
  bestEl.textContent = FB.fmtNum(FB.Store.getBest('whack'));
  ovScore.textContent = '30s';
})();
