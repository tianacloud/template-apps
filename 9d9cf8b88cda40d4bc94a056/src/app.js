import { createTianaFetch } from "@tianacloud/serverless";
const style=document.createElement("style");style.textContent="\n  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }\n  html, body { height:100%; }\n  body {\n    font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n    background: radial-gradient(1200px 800px at 50% -10%, #16233f 0%, #0d1424 55%, #0a0f1c 100%);\n    color:#dbe6f5;\n    display:flex; flex-direction:column; align-items:center;\n    min-height:100%;\n    overflow-x:hidden;\n    user-select:none;\n    -webkit-user-select:none;\n  }\n  .bgbinary {\n    position:fixed; inset:0; z-index:0; overflow:hidden;\n    font-family:Consolas, \"Courier New\", monospace;\n    font-size:20px; line-height:2; word-break:break-all;\n    color:#7d9fe0; opacity:.045; padding:8px;\n    pointer-events:none;\n  }\n  .wrap { width:min(92vw, 440px); position:relative; z-index:1; padding:20px 0 30px; }\n\n  header { text-align:center; margin-bottom:14px; }\n  .logo {\n    font-family:Consolas, \"Courier New\", monospace;\n    font-size:clamp(48px, 14vw, 68px);\n    font-weight:800; letter-spacing:2px; line-height:1.1;\n    background:linear-gradient(92deg, #4f8ef7 10%, #69c4ff 90%);\n    -webkit-background-clip:text; background-clip:text; color:transparent;\n    text-shadow:0 0 40px rgba(80,140,247,.25);\n  }\n  .tagline { margin-top:4px; font-size:14px; color:#7c93bd; letter-spacing:3px; }\n  .tagline b { color:#f5c542; font-weight:600; }\n\n  .topbar { display:flex; align-items:stretch; gap:10px; margin:14px 0 14px; }\n  .score-box {\n    flex:1; background:#141f3a; border:1px solid rgba(255,255,255,.06);\n    border-radius:10px; padding:8px 0 9px; text-align:center; position:relative; overflow:hidden;\n  }\n  .score-box .label { font-size:12px; color:#7c93bd; letter-spacing:2px; }\n  .score-box .val {\n    font-family:Consolas, monospace; font-size:clamp(20px, 5.6vw, 26px);\n    font-weight:700; color:#eaf2ff; margin-top:2px;\n  }\n  .score-box.bump .val { animation:bump .25s ease; }\n  @keyframes bump { 40% { transform:scale(1.18); color:#9fd1ff; } }\n  .score-pop {\n    position:absolute; left:50%; top:6px; transform:translateX(-50%);\n    font-family:Consolas, monospace; font-weight:700; font-size:18px; color:#8fd18f;\n    animation:floatUp .8s ease forwards; pointer-events:none;\n  }\n  @keyframes floatUp { to { transform:translate(-50%,-26px); opacity:0; } }\n\n  .btnrow { display:flex; gap:10px; margin-bottom:14px; }\n  .btn {\n    flex:1; border:none; border-radius:9px; padding:11px 0;\n    font-size:15px; font-weight:600; cursor:pointer;\n    background:linear-gradient(135deg, #3f82e2, #2a5cb8); color:#fff;\n    box-shadow:0 4px 14px rgba(50,100,220,.28);\n    transition:transform .12s ease, filter .12s ease;\n    font-family:inherit;\n  }\n  .btn:active { transform:scale(.96); }\n  .btn:hover { filter:brightness(1.12); }\n  .btn.ghost {\n    background:rgba(255,255,255,.07); color:#b9c9e6;\n    box-shadow:inset 0 0 0 1px rgba(255,255,255,.1);\n  }\n  .btn:disabled { opacity:.4; cursor:default; }\n\n  #board {\n    --gap: clamp(8px, 2.2vw, 11px);\n    position:relative; width:100%; aspect-ratio:1;\n    background:#15203a; border-radius:14px; padding:var(--gap);\n    box-shadow:inset 0 0 0 1px rgba(255,255,255,.05), 0 14px 40px rgba(0,0,0,.4);\n    touch-action:none;\n  }\n  .cells {\n    position:absolute; inset:var(--gap);\n    display:grid; grid-template:repeat(4,1fr)/repeat(4,1fr); gap:var(--gap);\n  }\n  .cell { background:#1d2b4b; border-radius:9px; }\n  .tiles { position:absolute; inset:var(--gap); }\n  .tile {\n    position:absolute; top:0; left:0;\n    width:calc((100% - 3*var(--gap)) / 4);\n    height:calc((100% - 3*var(--gap)) / 4);\n    transform:translate(calc(var(--x) * (100% + var(--gap))), calc(var(--y) * (100% + var(--gap))));\n    transition:transform .13s ease-in-out;\n    z-index:10;\n  }\n  .tile .tv {\n    width:100%; height:100%; border-radius:9px;\n    display:flex; align-items:center; justify-content:center;\n    font-family:Consolas, \"Courier New\", monospace; font-weight:700;\n  }\n  .tile.new .tv { animation:pop .2s ease .1s backwards; }\n  @keyframes pop { from { transform:scale(.2); opacity:0; } }\n  .tv.pulse { animation:pulse .22s ease; }\n  @keyframes pulse { 45% { transform:scale(1.16); } }\n\n  /* 尺寸 */\n  .t-s .tv { font-size:clamp(25px, 8.2vw, 38px); }\n  .t-m .tv { font-size:clamp(21px, 6.6vw, 31px); }\n  .t-l .tv { font-size:clamp(17px, 5.2vw, 25px); }\n  .t-xl .tv { font-size:clamp(14px, 4.4vw, 21px); }\n\n  /* 蓝色系配色，1024 金色高光 */\n  .v2 .tv    { background:#eaf1fd; color:#24406e; }\n  .v4 .tv    { background:#d6e5fc; color:#24406e; }\n  .v8 .tv    { background:#b2cff8; color:#16305c; }\n  .v16 .tv   { background:#89b7f2; color:#0f2748; }\n  .v32 .tv   { background:#5f9bec; color:#fff; }\n  .v64 .tv   { background:#3f82e2; color:#fff; }\n  .v128 .tv  { background:#3568cc; color:#fff; box-shadow:0 0 14px rgba(76,127,230,.45); }\n  .v256 .tv  { background:#2c55b0; color:#fff; box-shadow:0 0 16px rgba(60,105,220,.5); }\n  .v512 .tv  { background:#23468f; color:#dbe8ff; box-shadow:0 0 18px rgba(50,95,200,.55); }\n  .v1024 .tv { background:linear-gradient(135deg,#ffd75e,#f5a623); color:#4a3000;\n               box-shadow:0 0 24px rgba(255,196,56,.6); }\n  .v2048 .tv { background:#141f3d; color:#ffd75e; box-shadow:inset 0 0 0 2px #f5a623; }\n  .vbig .tv  { background:#0b1224; color:#7fd0ff; box-shadow:inset 0 0 0 2px #4f8ef7; }\n\n  #overlay {\n    position:absolute; inset:0; z-index:40; border-radius:14px;\n    display:none; flex-direction:column; align-items:center; justify-content:center;\n    gap:8px; text-align:center; padding:20px;\n    background:rgba(9,15,29,.85); backdrop-filter:blur(2px);\n  }\n  #overlay.show { display:flex; animation:fadeIn .3s ease; }\n  @keyframes fadeIn { from { opacity:0; } }\n  #overlay .big {\n    font-size:clamp(26px, 8vw, 38px); font-weight:800; letter-spacing:2px;\n    font-family:Consolas, monospace;\n    background:linear-gradient(92deg,#ffd75e,#f5a623);\n    -webkit-background-clip:text; background-clip:text; color:transparent;\n  }\n  #overlay .big.lose {\n    background:linear-gradient(92deg,#8aa3cf,#b9c9e6);\n    -webkit-background-clip:text; background-clip:text;\n  }\n  #overlay .sub { color:#9db2d8; font-size:14px; margin-bottom:14px; }\n  #overlay .obtns { display:flex; gap:10px; }\n  #overlay .btn { flex:none; padding:10px 22px; }\n\n  footer { margin-top:18px; text-align:center; font-size:12.5px; color:#5d739c; line-height:1.9; }\n  footer code { font-family:Consolas, monospace; color:#7c9fd8; }\n  .hint { margin-top:10px; text-align:center; font-size:12.5px; color:#5d739c; }\n";document.head.appendChild(style);
document.getElementById("app").innerHTML="\n<div class=\"bgbinary\" id=\"bgbinary\"></div>\n<div class=\"wrap\">\n  <header>\n    <div class=\"logo\">1024</div>\n    <div class=\"tagline\">程序员节特别版 · 合成 <b>1024</b> 即通关</div>\n  </header>\n\n  <div class=\"topbar\">\n    <div class=\"score-box\" id=\"scoreBox\">\n      <div class=\"label\">得分</div>\n      <div class=\"val\" id=\"score\">0</div>\n    </div>\n    <div class=\"score-box\">\n      <div class=\"label\">最高分</div>\n      <div class=\"val\" id=\"best\">0</div>\n    </div>\n  </div>\n\n  <div class=\"btnrow\">\n    <button class=\"btn ghost\" id=\"undoBtn\">↩ 撤销一步</button>\n    <button class=\"btn\" id=\"newBtn\">⟳ 新游戏</button>\n  </div>\n\n  <div id=\"board\">\n    <div class=\"cells\" id=\"cells\"></div>\n    <div class=\"tiles\" id=\"tiles\"></div>\n    <div id=\"overlay\">\n      <div class=\"big\" id=\"ovTitle\"></div>\n      <div class=\"sub\" id=\"ovSub\"></div>\n      <div class=\"obtns\">\n        <button class=\"btn ghost\" id=\"ovContinue\" style=\"display:none\">继续挑战</button>\n        <button class=\"btn\" id=\"ovRestart\">再来一局</button>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"hint\">↑ ↓ ← → 或 WASD 移动 · 手机滑动同样有效</div>\n\n  <footer>\n    把 <code>0b100</code> 一路合成 <code>0b10000000000</code><br>\n    10 · 24 程序员节快乐\n  </footer>\n</div>\n\n";

(function () {
  'use strict';
  var SIZE = 4;
  var boardEl = document.getElementById('board');
  var tilesEl = document.getElementById('tiles');
  var cellsEl = document.getElementById('cells');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var scoreBox = document.getElementById('scoreBox');
  var undoBtn = document.getElementById('undoBtn');
  var newBtn = document.getElementById('newBtn');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovSub = document.getElementById('ovSub');
  var ovContinue = document.getElementById('ovContinue');
  var ovRestart = document.getElementById('ovRestart');

  var grid, tiles, tileId, score, best, won, keep, over, undoState;
  var tileEls = new Map();

  best = 0;
  var db, saveQueue = Promise.resolve();
  var statusEl = document.createElement('div');
  statusEl.className = 'hint'; statusEl.setAttribute('role', 'status');
  statusEl.textContent = '正在读取最高分…'; document.querySelector('.wrap').appendChild(statusEl);
  async function execute(sql, args) {
    var response = await db.fetch(db.origin + '/v3/pipeline', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql:sql,args:args || [],want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw new Error('数据库请求失败');
    var body = await response.json(), result = body.results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作失败');
    return result.response.result;
  }
  async function loadBest() {
    try {
      if (!window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw new Error('运行环境未就绪');
      var connection = await window.tiana.connection();
      if (connection.sql_api !== 'hrana-v3') throw new Error('不支持的数据库协议');
      db = {origin:connection.origin, fetch:createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};
      var result = await execute('SELECT best FROM game_best WHERE id = 1');
      var pendingBest = best; best = Number(result.rows?.[0]?.[0]?.value || 0); bestEl.textContent = best;
      statusEl.textContent = '最高分已连接云端';
      if (pendingBest > best) { var currentScore = score; score = pendingBest; updateScore(); score = currentScore; scoreEl.textContent = score; }
    } catch (_) { statusEl.textContent = '最高分读取失败，请检查连接后刷新页面'; }
  }
  loadBest();

  // 背景二进制装饰
  (function () {
    var s = '';
    for (var i = 0; i < 900; i++) s += (Math.random() < 0.5 ? '0' : '1') + (i % 40 === 39 ? ' ' : '');
    document.getElementById('bgbinary').textContent = s;
  })();

  // 背景格子
  for (var i = 0; i < SIZE * SIZE; i++) {
    var c = document.createElement('div');
    c.className = 'cell';
    cellsEl.appendChild(c);
  }

  function cls(v) { return v <= 2048 ? 'v' + v : 'vbig'; }
  function sizeCls(v) {
    var n = String(v).length;
    if (n <= 2) return 't-s';
    if (n === 3) return 't-m';
    if (n === 4) return 't-l';
    return 't-xl';
  }
  function setPos(el, r, c) {
    el.style.setProperty('--x', c);
    el.style.setProperty('--y', r);
  }
  function makeTile(value, r, c) {
    var t = { id: ++tileId, value: value, r: r, c: c };
    tiles.add(t);
    grid[r][c] = t;
    return t;
  }
  function renderTile(t, isNew) {
    var el = document.createElement('div');
    el.className = 'tile ' + cls(t.value) + ' ' + sizeCls(t.value) + (isNew ? ' new' : '');
    var tv = document.createElement('div');
    tv.className = 'tv';
    tv.textContent = t.value;
    el.appendChild(tv);
    setPos(el, t.r, t.c);
    tilesEl.appendChild(el);
    tileEls.set(t.id, el);
    return el;
  }

  function emptyCells() {
    var list = [];
    for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++)
      if (!grid[r][c]) list.push([r, c]);
    return list;
  }
  function spawn() {
    var es = emptyCells();
    if (!es.length) return;
    var p = es[Math.floor(Math.random() * es.length)];
    var t = makeTile(Math.random() < 0.9 ? 2 : 4, p[0], p[1]);
    renderTile(t, true);
  }
  function canMove() {
    if (emptyCells().length) return true;
    var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) {
      var v = grid[r][c].value;
      for (var d = 0; d < 4; d++) {
        var tr = r + dirs[d][0], tc = c + dirs[d][1];
        if (tr >= 0 && tr < SIZE && tc >= 0 && tc < SIZE && grid[tr][tc].value === v) return true;
      }
    }
    return false;
  }

  function snapshot() {
    var v = [];
    for (var r = 0; r < SIZE; r++) {
      var row = [];
      for (var c = 0; c < SIZE; c++) row.push(grid[r][c] ? grid[r][c].value : 0);
      v.push(row);
    }
    return { v: v, score: score, won: won };
  }
  function rebuild(state) {
    tilesEl.innerHTML = '';
    tileEls.clear();
    tiles = new Set();
    grid = [];
    for (var r = 0; r < SIZE; r++) {
      grid.push([]);
      for (var c = 0; c < SIZE; c++) {
        var v = state.v[r][c];
        if (v) {
          var t = { id: ++tileId, value: v, r: r, c: c };
          tiles.add(t);
          grid[r].push(t);
          renderTile(t, false);
        } else grid[r].push(null);
      }
    }
    score = state.score;
    won = state.won;
    updateScore();
  }

  function updateScore() {
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      if (db) {
        var value = best;
        saveQueue = saveQueue.then(async function () {
          await execute('INSERT INTO game_best (id,best) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET best = MAX(best,excluded.best)', [{type:'integer',value:String(value)}]);
          statusEl.textContent = '最高分已保存';
        }).catch(function () { statusEl.textContent = '最高分保存失败，请检查连接后刷新页面'; });
      }
    }
    undoBtn.disabled = !undoState;
  }
  function scorePop(n) {
    var s = document.createElement('div');
    s.className = 'score-pop';
    s.textContent = '+' + n;
    scoreBox.appendChild(s);
    scoreBox.classList.remove('bump');
    void scoreBox.offsetWidth;
    scoreBox.classList.add('bump');
    setTimeout(function () { s.remove(); }, 850);
  }

  function showOverlay(title, sub, lose) {
    ovTitle.textContent = title;
    ovTitle.className = 'big' + (lose ? ' lose' : '');
    ovSub.textContent = sub;
    ovContinue.style.display = (!lose && won && !keep) ? '' : 'none';
    overlay.classList.add('show');
  }
  function hideOverlay() { overlay.classList.remove('show'); }

  var VEC = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

  function move(dir) {
    if (over || (won && !keep)) return;
    var v = VEC[dir];
    if (!v) return;
    undoState = snapshot();

    var moved = false, gained = 0;
    var merges = [];
    for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++)
      if (grid[r][c]) grid[r][c].merged = false;

    var rows = [0,1,2,3], cols = [0,1,2,3];
    if (v[0] === 1) rows = [3,2,1,0];
    if (v[1] === 1) cols = [3,2,1,0];

    rows.forEach(function (r) {
      cols.forEach(function (c) {
        var t = grid[r][c];
        if (!t) return;
        var nr = r, nc = c, merged = false;
        while (true) {
          var tr = nr + v[0], tc = nc + v[1];
          if (tr < 0 || tr >= SIZE || tc < 0 || tc >= SIZE) break;
          var o = grid[tr][tc];
          if (!o) { nr = tr; nc = tc; continue; }
          if (o.value === t.value && !o.merged) {
            grid[r][c] = null;
            t.r = tr; t.c = tc;
            o.merged = true;
            merges.push({ dead: t, keep: o });
            gained += t.value * 2;
            moved = true;
            merged = true;
          }
          break;
        }
        if (!merged && (nr !== r || nc !== c)) {
          grid[r][c] = null;
          grid[nr][nc] = t;
          t.r = nr; t.c = nc;
          moved = true;
        }
      });
    });

    if (!moved) { undoState = null; updateScore(); return; }

    // 滑动动画：更新所有元素位置
    tiles.forEach(function (t) {
      var el = tileEls.get(t.id);
      if (el) setPos(el, t.r, t.c);
    });

    if (gained) { score += gained; scorePop(gained); }
    updateScore();

    setTimeout(function () {
      merges.forEach(function (m) {
        var dEl = tileEls.get(m.dead.id);
        if (dEl) { dEl.remove(); tileEls.delete(m.dead.id); }
        tiles.delete(m.dead);
        m.keep.value *= 2;
        var kEl = tileEls.get(m.keep.id);
        if (kEl) {
          kEl.className = 'tile ' + cls(m.keep.value) + ' ' + sizeCls(m.keep.value);
          var tv = kEl.firstChild;
          tv.textContent = m.keep.value;
          tv.classList.remove('pulse');
          void tv.offsetWidth;
          tv.classList.add('pulse');
        }
        if (m.keep.value === 1024 && !won) {
          won = true;
          setTimeout(function () { showOverlay('通关！', '你合成了 1024 —— 0b10000000000', false); }, 250);
        }
      });
      spawn();
      if (!canMove()) {
        over = true;
        setTimeout(function () { showOverlay('游戏结束', '没有可以移动的格子了', true); }, 250);
      }
    }, 135);
  }

  function restart() {
    tilesEl.innerHTML = '';
    tileEls.clear();
    tiles = new Set();
    grid = [];
    for (var r = 0; r < SIZE; r++) {
      grid.push([null, null, null, null]);
    }
    tileId = 0;
    score = 0;
    won = false;
    keep = false;
    over = false;
    undoState = null;
    hideOverlay();
    updateScore();
    spawn();
    spawn();
  }

  function undo() {
    if (!undoState || over) return;
    rebuild(undoState);
    undoState = null;
    updateScore();
    hideOverlay();
  }

  // 键盘
  document.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    var dir = null;
    if (k === 'arrowup' || k === 'w') dir = 'up';
    else if (k === 'arrowdown' || k === 's') dir = 'down';
    else if (k === 'arrowleft' || k === 'a') dir = 'left';
    else if (k === 'arrowright' || k === 'd') dir = 'right';
    if (dir) { e.preventDefault(); move(dir); }
  });

  // 触摸滑动
  var tx = 0, ty = 0;
  boardEl.addEventListener('touchstart', function (e) {
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  }, { passive: true });
  boardEl.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
    else move(dy > 0 ? 'down' : 'up');
  }, { passive: true });

  newBtn.addEventListener('click', restart);
  undoBtn.addEventListener('click', undo);
  ovRestart.addEventListener('click', restart);
  ovContinue.addEventListener('click', function () {
    keep = true;
    hideOverlay();
  });

  restart();
})();
