/* ============================================================
   摸鱼盒子 · 推箱子
   字符地图：# 墙  . 目标  $ 箱子  * 箱子在目标上  @ 玩家  + 玩家在目标上
   方向键 / WASD 移动，Z 撤销，R 重来。过关记录存本地。
   ============================================================ */
(function () {
  'use strict';

  var LEVELS = [
    [ /* 1 一箱起步 */
      '#######',
      '#     #',
      '# $ . #',
      '#  @  #',
      '#######'
    ],
    [ /* 2 给点距离 */
      '########',
      '#      #',
      '#  $ . #',
      '#  @   #',
      '#      #',
      '########'
    ],
    [ /* 3 两箱并排 */
      '########',
      '#      #',
      '# $ $  #',
      '#  ..  #',
      '#  @   #',
      '########'
    ],
    [ /* 4 绕开中间那堵墙 */
      '#########',
      '#       #',
      '#  ###  #',
      '# $   . #',
      '#  @    #',
      '#       #',
      '#########'
    ],
    [ /* 5 三箱对齐 */
      '#########',
      '#       #',
      '# $ $ $ #',
      '#  ...  #',
      '#   @   #',
      '#       #',
      '#########'
    ],
    [ /* 6 两箱错列 */
      '##########',
      '#        #',
      '#  $  $  #',
      '#   ..   #',
      '#  @     #',
      '#        #',
      '##########'
    ],
    [ /* 7 得先绕到箱子上方 */
      '#########',
      '#       #',
      '# $$$   #',
      '#       #',
      '#  ...  #',
      '#   @   #',
      '#########'
    ],
    [ /* 8 四个角，横竖各推一次 */
      '#########',
      '#  . .  #',
      '# $   $ #',
      '#   @   #',
      '# $   $ #',
      '#  . .  #',
      '#########'
    ],
    [ /* 9 长走廊，注意推的顺序 */
      '###########',
      '#         #',
      '# $ $ $ $ #',
      '#  ....   #',
      '#    @    #',
      '###########'
    ],
    [ /* 10 顶上有檐，箱子别往上顶 */
      '##########',
      '#  ####  #',
      '#        #',
      '# $ $ $  #',
      '#  ...   #',
      '#   $    #',
      '#   .    #',
      '#   @    #',
      '##########'
    ],
    [ /* 11 L 形隔断 */
      '#########',
      '#       #',
      '#  ###  #',
      '#  $ $  #',
      '#   @   #',
      '#  $ .  #',
      '#  . .  #',
      '#########'
    ],
    [ /* 12 终关：四箱，三十推 */
      '###########',
      '#         #',
      '# ######  #',
      '# $ $ $ $ #',
      '#  ....   #',
      '#    @    #',
      '###########'
    ]
  ];

  var boardEl = document.getElementById('board');
  var levelsEl = document.getElementById('levels');
  var movesEl = document.getElementById('moves');
  var pushesEl = document.getElementById('pushes');
  var goalsEl = document.getElementById('goals');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');

  var lvIndex = 0;
  var W = 0, H = 0;
  var walls = [], goals = {}, floor = {};
  var player = { x: 0, y: 0 };
  var boxes = {};
  var moves = 0, pushes = 0;
  var history = [];
  var won = false;
  var done = loadDone();

  function loadDone() {
    var d = FB.Store.get('sokoban.done', []);
    return Array.isArray(d) ? d : [];
  }

  function key(x, y) { return x + ',' + y; }

  function parse(map) {
    walls = []; goals = {}; floor = {}; boxes = {};
    H = map.length; W = 0;
    for (var y = 0; y < H; y++) {
      var row = map[y];
      if (row.length > W) W = row.length;
    }
    for (var yy = 0; yy < H; yy++) {
      for (var xx = 0; xx < W; xx++) {
        var ch = map[yy].charAt(xx) || ' ';
        if (ch === '#') { walls.push(key(xx, yy)); continue; }
        floor[key(xx, yy)] = 1;
        if (ch === '.' || ch === '*' || ch === '+') goals[key(xx, yy)] = 1;
        if (ch === '$' || ch === '*') boxes[key(xx, yy)] = 1;
        if (ch === '@' || ch === '+') player = { x: xx, y: yy };
      }
    }
  }

  function isWall(x, y) { return walls.indexOf(key(x, y)) > -1; }
  function isFloor(x, y) { return !!floor[key(x, y)]; }
  function hasBox(x, y) { return !!boxes[key(x, y)]; }

  function buildLevels() {
    var html = '';
    for (var i = 0; i < LEVELS.length; i++) {
      html += '<button class="sk-lv' + (i === lvIndex ? ' on' : '') +
        (done.indexOf(i) > -1 ? ' done' : '') + '" data-lv="' + i + '">' + (i + 1) + '</button>';
    }
    levelsEl.innerHTML = html;
  }

  function render() {
    boardEl.style.gridTemplateColumns = 'repeat(' + W + ', 1fr)';
    var html = '';
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var cls = 'sk-cell';
        if (isWall(x, y)) cls += ' wall';
        else if (!isFloor(x, y)) cls += ' void';
        else {
          cls += ' floor';
          if (goals[key(x, y)]) cls += ' goal';
        }
        var inner = '';
        if (!isWall(x, y) && isFloor(x, y)) {
          if (hasBox(x, y)) inner += '<span class="sk-box' + (goals[key(x, y)] ? ' on' : '') + '"></span>';
          if (player.x === x && player.y === y) inner += '<span class="sk-man"></span>';
        }
        html += '<div class="' + cls + '" style="' + (isFloor(x, y) || isWall(x, y) ? '' : 'visibility:hidden') + '">' + inner + '</div>';
      }
    }
    boardEl.innerHTML = html;

    movesEl.textContent = moves;
    pushesEl.textContent = pushes;
    var onGoal = 0, total = 0;
    Object.keys(boxes).forEach(function (k) {
      total++;
      if (goals[k]) onGoal++;
    });
    goalsEl.textContent = onGoal + '/' + total;
  }

  function snapshot() {
    history.push({
      p: { x: player.x, y: player.y },
      b: Object.keys(boxes),
      m: moves, u: pushes
    });
    if (history.length > 400) history.shift();
  }

  function move(dx, dy) {
    if (won) return;
    var nx = player.x + dx, ny = player.y + dy;
    if (isWall(nx, ny) || !isFloor(nx, ny)) return;

    if (hasBox(nx, ny)) {
      var bx = nx + dx, by = ny + dy;
      if (isWall(bx, by) || !isFloor(bx, by) || hasBox(bx, by)) {
        FB.Sound.play('bad');
        return;
      }
      snapshot();
      delete boxes[key(nx, ny)];
      boxes[key(bx, by)] = 1;
      player = { x: nx, y: ny };
      moves++; pushes++;
      FB.Sound.play(goals[key(bx, by)] ? 'good' : 'move');
    } else {
      snapshot();
      player = { x: nx, y: ny };
      moves++;
      FB.Sound.play('move');
    }
    render();
    checkWin();
  }

  function undo() {
    if (won || !history.length) return;
    var s = history.pop();
    player = s.p;
    boxes = {};
    s.b.forEach(function (k) { boxes[k] = 1; });
    moves = s.m; pushes = s.u;
    FB.Sound.play('click');
    render();
  }

  function checkWin() {
    var keys = Object.keys(boxes);
    for (var i = 0; i < keys.length; i++) if (!goals[keys[i]]) return;
    won = true;
    if (done.indexOf(lvIndex) === -1) {
      done.push(lvIndex);
      FB.Store.set('sokoban.done', done);
      buildLevels();
    }
    var last = lvIndex === LEVELS.length - 1;
    ovTitle.textContent = last ? '全部通关' : '过关';
    ovScore.textContent = moves + ' 步';
    ovSub.textContent = '推动 ' + pushes + ' 次' + (last ? ' · ' + LEVELS.length + ' 关都走完了' : '');
    document.getElementById('ovNext').textContent = last ? '回到第一关' : '下一关';
    setTimeout(function () { overlay.classList.add('on'); }, 260);
    FB.Sound.play('win');
  }

  function load(i) {
    lvIndex = Math.max(0, Math.min(LEVELS.length - 1, i));
    parse(LEVELS[lvIndex]);
    moves = 0; pushes = 0; history = []; won = false;
    overlay.classList.remove('on');
    buildLevels();
    render();
  }

  function next() {
    load(lvIndex === LEVELS.length - 1 ? 0 : lvIndex + 1);
  }

  /* ----------------------- 事件 ----------------------- */

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); move(0, -1); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); move(0, 1); }
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); move(-1, 0); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { e.preventDefault(); move(1, 0); }
    else if (k === 'z' || k === 'Z') undo();
    else if (k === 'r' || k === 'R') { load(lvIndex); }
  });

  document.querySelector('.sk-pad').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-dir]');
    if (!b) return;
    var d = b.dataset.dir;
    if (d === 'up') move(0, -1);
    else if (d === 'down') move(0, 1);
    else if (d === 'left') move(-1, 0);
    else move(1, 0);
  });

  levelsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.sk-lv');
    if (!b) return;
    FB.Sound.play('click');
    load(parseInt(b.dataset.lv, 10));
  });

  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('resetBtn').addEventListener('click', function () { FB.Sound.play('click'); load(lvIndex); });
  document.getElementById('nextBtn').addEventListener('click', function () { FB.Sound.play('click'); next(); });
  document.getElementById('ovNext').addEventListener('click', function () { FB.Sound.play('click'); next(); });
  document.getElementById('ovAgain').addEventListener('click', function () { FB.Sound.play('click'); load(lvIndex); });

  /* 开局：接着上次没通关的关卡玩 */
  var first = 0;
  for (var i = 0; i < LEVELS.length; i++) { if (done.indexOf(i) === -1) { first = i; break; } }
  load(first);
})();
