/* main.js - 技能围棋 H5 版交互逻辑 */
(function () {
  'use strict';

  var R = SkillGo.Rules, AI = SkillGo.AI, RD = SkillGo.Render, SK = SkillGo.Skills;
  var LETTERS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';

  var $ = function (id) { return document.getElementById(id); };
  var canvas = $('board');
  var ctx = canvas.getContext('2d');

  var state = null;
  var L = null;
  var ui = {
    skill: null,
    hover: -1,
    history: [],
    records: [],
    busy: false,
    showTerr: false,
    setup: { size: 9, mode: 'pve', color: 1 }
  };

  // ---------- 工具 ----------
  function coord(i) {
    if (i == null || i < 0) return '-';
    return LETTERS[R.colOf(state.size, i)] + (state.size - R.rowOf(state.size, i));
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 1800);
  }

  function humanColor() { return state.mode === 'pve' ? state.humanColor : state.turn; }
  function isHumanTurn() { return state.mode === 'pvp' || state.turn === state.humanColor; }

  function pushRecord(color, text) {
    ui.records.push({ color: color, text: text });
    if (ui.records.length > 60) ui.records.shift();
  }

  // ---------- 布局 ----------
  function resize() {
    if (!state) return;
    var wrap = canvas.parentElement;
    var w = Math.max(240, Math.min(wrap.clientWidth, 560));
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(w * dpr);
    canvas.style.height = w + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    L = RD.layout(w, state.size, state.size >= 13 ? 22 : 26);
    render();
  }
  window.addEventListener('resize', resize);

  function render() {
    if (!state || !L) return;
    var viewer = state.mode === 'pvp' ? state.turn : state.humanColor;
    var showT = ui.showTerr || state.over || R.sightOn(state, viewer);
    RD.draw(ctx, {
      L: L,
      state: state,
      viewer: viewer,
      hover: ui.hover,
      skill: ui.skill,
      territory: showT ? R.estimateTerritory(state) : null,
      showTerritory: showT
    });
  }

  // ---------- 对局 ----------
  function newGame() {
    state = R.createGame({ size: ui.setup.size, mode: ui.setup.mode, humanColor: ui.setup.color });
    ui.history = [];
    ui.records = [];
    ui.skill = null;
    ui.busy = false;
    ui.showTerr = false;
    $('subTitle').textContent = ui.setup.size + ' 路 · ' + (ui.setup.mode === 'pve' ? '人机对战' : '双人同屏');
    $('nameBlack').textContent = '黑方 · ' + (ui.setup.mode === 'pve'
      ? (state.humanColor === 1 ? '你' : 'AI')
      : '玩家 1');
    $('nameWhite').textContent = '白方 · ' + (ui.setup.mode === 'pve'
      ? (state.humanColor === 2 ? '你' : 'AI')
      : '玩家 2');
    buildEnergyCells();
    resize();
    updateUI();
    if (state.mode === 'pve' && !isHumanTurn()) aiTurn();
  }

  function buildEnergyCells() {
    var hb = $('enBlack'), hw = $('enWhite');
    hb.innerHTML = ''; hw.innerHTML = '';
    for (var i = 0; i < R.ENERGY_MAX; i++) {
      hb.appendChild(document.createElement('i'));
      hw.appendChild(document.createElement('i'));
    }
  }

  function snapshot() { ui.history.push(R.clone(state)); if (ui.history.length > 80) ui.history.shift(); }

  function doMove(idx) {
    if (ui.busy || state.over || !isHumanTurn()) return;
    var color = state.turn;
    snapshot();
    var r = R.play(state, idx, color);
    if (!r.ok) { ui.history.pop(); toast(r.reason); return; }
    pushRecord(color, '落子 ' + coord(idx) + (r.captured.length ? ' · 提子 ' + r.captured.length : ''));
    ui.skill = null;
    R.endTurn(state, color);
    afterAction();
  }

  function doSkill(skillId, idx) {
    if (ui.busy || state.over || !isHumanTurn()) return;
    var color = state.turn;
    var r = R.useSkill(state, skillId, idx, color);
    if (!r.ok) { toast(r.reason); return; }
    var s = SK.get(skillId);
    pushRecord(color, '施放【' + s.name + '】' + (idx >= 0 ? ' @ ' + coord(idx) : '') +
      (r.captured && r.captured.length ? ' · 拔子 ' + r.captured.length : ''));
    toast('已施放：' + s.name + '·' + s.tag);
    ui.skill = null;
    render();
    updateUI();
  }

  function afterAction() {
    render();
    updateUI();
    if (state.over) { showResult(); return; }
    if (state.mode === 'pve' && !isHumanTurn()) aiTurn();
  }

  function aiTurn() {
    if (state.over) { updateUI(); return; }
    ui.busy = true;
    $('thinking').classList.add('on');
    var color = state.turn;
    var actions = AI.planTurn(state, color);
    var i = 0;
    function step() {
      if (state.over) { end(); return; }
      if (i >= actions.length) { end(); return; }
      var a = actions[i++];
      if (a.type === 'skill') {
        var r = R.useSkill(state, a.id, a.target, color);
        if (r.ok) {
          var s = SK.get(a.id);
          pushRecord(color, '施放【' + s.name + '】' + (a.target >= 0 ? ' @ ' + coord(a.target) : ''));
          if (a.id !== 'sight') toast('AI 施放了 ' + s.name + '·' + s.tag);
        }
      } else if (a.type === 'move') {
        var m = R.play(state, a.idx, color);
        if (m.ok) {
          pushRecord(color, '落子 ' + coord(a.idx) + (m.captured.length ? ' · 提子 ' + m.captured.length : ''));
        }
      } else {
        R.pass(state, color);
        pushRecord(color, '虚着');
      }
      render();
      updateUI();
      setTimeout(step, 460);
    }
    function end() {
      if (!state.over) R.endTurn(state, color);
      ui.busy = false;
      $('thinking').classList.remove('on');
      render();
      updateUI();
      if (state.over) showResult();
    }
    setTimeout(step, 360);
  }

  // ---------- UI 更新 ----------
  function updateUI() {
    // 能量
    var cells = [$('enBlack').children, $('enWhite').children];
    for (var c = 1; c <= 2; c++) {
      for (var i = 0; i < cells[c - 1].length; i++) {
        cells[c - 1][i].className = i < state.energy[c] ? 'on' : '';
      }
    }
    $('capBlack').textContent = state.captured[1];
    $('capWhite').textContent = state.captured[2];
    $('myEnergy').textContent = state.energy[isHumanTurn() ? state.turn : (state.mode === 'pve' ? state.humanColor : state.turn)];

    // 回合指示
    var turnName = state.turn === 1 ? '黑方' : '白方';
    $('turnChip').textContent = state.over ? '对局结束' : turnName + '行棋';
    $('pcardBlack').className = 'pcard black' + (state.turn === 1 && !state.over ? ' active' : '');
    $('pcardWhite').className = 'pcard white' + (state.turn === 2 && !state.over ? ' active' : '');

    renderSkills();
    renderEffects();
    renderLog();
    updateHint();
  }

  function renderSkills() {
    var box = $('skills');
    if (!box.childElementCount) {
      box.innerHTML = '';
      SK.LIST.forEach(function (s) {
        var b = document.createElement('button');
        b.className = 'skill';
        b.dataset.id = s.id;
        b.innerHTML =
          '<div class="cost">' + s.cost + '⚡</div>' +
          '<div class="ic" style="color:' + s.color + '">' + s.icon + '</div>' +
          '<div class="nm">' + s.name + '</div>' +
          '<div class="tg">' + s.tag + '</div>' +
          '<div class="cdMask"><span></span></div>';
        b.addEventListener('click', function () { pickSkill(s.id); });
        box.appendChild(b);
      });
    }
    var color = state.mode === 'pve' ? state.humanColor : state.turn;
    var cd = state.cooldown[color - 1];
    var myTurn = isHumanTurn() && !state.over;
    Array.prototype.forEach.call(box.children, function (b) {
      var s = SK.get(b.dataset.id);
      var cooling = !!cd[s.id];
      var poor = state.energy[color] < s.cost;
      var dis = !myTurn || cooling || poor;
      b.className = 'skill' + (dis ? ' disabled' : '') + (cooling ? ' cooling' : '') + (ui.skill && ui.skill.id === s.id ? ' on' : '');
      b.querySelector('.cdMask span').textContent = cooling ? '冷却 ' + cd[s.id] : '';
    });
  }

  function renderEffects() {
    var ul = $('effects');
    var items = [];
    state.effects.fortify.forEach(function (f) {
      items.push(['gold', (f.owner === 1 ? '黑' : '白') + '方磐石加固中 · ' + turnsLeft(f.until) + ' 回合']);
    });
    state.effects.ban.forEach(function (f) {
      items.push(['red', '封印 ' + coord(f.idx) + ' · ' + turnsLeft(f.until) + ' 回合']);
    });
    state.effects.fog.forEach(function (f) {
      items.push(['cyan', (f.by === 1 ? '黑' : '白') + '方布下迷雾 ' + coord(f.cells[4]) + ' 一带 · ' + turnsLeft(f.until) + ' 回合']);
    });
    if (R.sightOn(state, 1)) items.push(['cyan', '黑方天眼开启 · ' + turnsLeft(state.effects.sight[0]) + ' 回合']);
    if (R.sightOn(state, 2)) items.push(['cyan', '白方天眼开启 · ' + turnsLeft(state.effects.sight[1]) + ' 回合']);

    ul.innerHTML = items.length
      ? items.map(function (it) {
        var c = it[0] === 'gold' ? '#f2c14e' : (it[0] === 'red' ? '#e8564f' : '#4fc4f5');
        return '<li><span class="dot" style="background:' + c + '"></span>' + it[1] + '</li>';
      }).join('')
      : '<li class="empty">暂无生效中的效果</li>';
  }

  function turnsLeft(until) {
    return Math.max(0, Math.ceil((until - state.moveNumber) / 2));
  }

  function renderLog() {
    var ul = $('log');
    if (!ui.records.length) { ul.innerHTML = '<li class="empty">暂无记录</li>'; return; }
    var recent = ui.records.slice(-24).reverse();
    ul.innerHTML = recent.map(function (r, i) {
      var c = r.color === 1 ? 'radial-gradient(circle at 32% 30%,#5b5f6b,#12141a)' : 'radial-gradient(circle at 32% 30%,#fff,#c5c8d2)';
      var n = ui.records.length - i;
      return '<li><span class="dot" style="background:' + c + '"></span><span class="tag">' + n + '</span>' + r.text + '</li>';
    }).join('');
  }

  function updateHint() {
    var h = $('hintBar');
    if (state.over) { h.textContent = '对局结束 · 点击「新对局」再来一盘'; return; }
    if (ui.skill) {
      h.textContent = '【' + ui.skill.name + '】' + ui.skill.tip + '（再点一次技能卡取消）';
    } else if (!isHumanTurn()) {
      h.textContent = '对手回合中…';
    } else {
      h.textContent = '点击交叉点落子 · 使用技能不占用落子机会（每回合可连用多个技能）';
    }
  }

  function pickSkill(id) {
    if (ui.busy || state.over || !isHumanTurn()) { toast('现在不是你的回合'); return; }
    var s = SK.get(id);
    var color = state.turn;
    var check = R.canUse(state, id, color);
    if (!check.ok) { toast(check.reason); return; }
    if (s.target === 'none') { doSkill(id, -1); return; }
    ui.skill = ui.skill && ui.skill.id === id ? null : s;
    ui.hover = -1;
    updateHint();
    renderSkills();
    render();
  }

  // ---------- 交互 ----------
  function localPos(e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches && e.touches[0] ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  var lastTap = 0;
  function onClick(e) {
    if (!state || ui.busy) return;
    var now = Date.now();
    if (now - lastTap < 350) { e.preventDefault(); return; } // 防止 touch + click 双触发
    lastTap = now;
    e.preventDefault();
    var p = localPos(e);
    var idx = RD.pointToCell(L, p.x, p.y);
    if (idx < 0) return;
    if (ui.skill) {
      if (!RD.targetValid(state, ui.skill, idx, state.turn)) { toast('该目标无效：' + ui.skill.tip); return; }
      doSkill(ui.skill.id, idx);
    } else {
      doMove(idx);
    }
  }

  canvas.addEventListener('click', onClick);
  canvas.addEventListener('touchstart', function (e) { onClick(e); }, { passive: false });

  canvas.addEventListener('mousemove', function (e) {
    if (!state) return;
    var p = localPos(e);
    var idx = RD.pointToCell(L, p.x, p.y);
    if (idx !== ui.hover) { ui.hover = idx; render(); }
  });
  canvas.addEventListener('mouseleave', function () { ui.hover = -1; render(); });

  $('btnPass').addEventListener('click', function () {
    if (ui.busy || state.over || !isHumanTurn()) return;
    snapshot();
    var c = state.turn;
    pushRecord(c, '虚着');
    R.pass(state, c);
    ui.skill = null;
    if (state.over) { showResult(); return; }
    if (state.mode === 'pve' && !isHumanTurn()) aiTurn();
    else { render(); updateUI(); }
  });

  $('btnUndo').addEventListener('click', function () {
    if (ui.busy || !ui.history.length) { toast('没有可悔的棋'); return; }
    state = ui.history.pop();
    if (ui.records.length) ui.records.pop();
    ui.skill = null;
    ui.showTerr = false;
    // pve：若回退后仍轮到 AI，再退一步回到玩家回合
    if (state.mode === 'pve' && !isHumanTurn() && ui.history.length) {
      state = ui.history.pop();
      if (ui.records.length) ui.records.pop();
    }
    resize();
    updateUI();
    toast('已悔棋');
  });

  $('btnResign').addEventListener('click', function () {
    if (state.over) return;
    var loser = state.mode === 'pve' ? state.humanColor : state.turn;
    var t = R.estimateTerritory(state);
    state.over = true;
    state.result = { winner: R.opp(loser), resign: true, black: t.black, white: t.white, diff: t.diff, detail: t };
    render();
    updateUI();
    showResult();
  });

  $('btnNew').addEventListener('click', function () { $('setupModal').classList.add('on'); });
  $('btnAgain').addEventListener('click', function () {
    $('resultModal').classList.remove('on');
    $('setupModal').classList.add('on');
  });
  $('btnCloseResult').addEventListener('click', function () { $('resultModal').classList.remove('on'); });
  $('btnRules').addEventListener('click', function () { $('rulesModal').classList.add('on'); });
  $('btnCloseRules').addEventListener('click', function () { $('rulesModal').classList.remove('on'); });

  // 设置弹窗
  function bindSeg(id, key, cast) {
    var seg = $(id);
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      Array.prototype.forEach.call(seg.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      ui.setup[key] = cast ? cast(b.dataset.v) : b.dataset.v;
      if (key === 'mode') $('fieldColor').style.display = ui.setup.mode === 'pve' ? '' : 'none';
    });
  }
  bindSeg('segSize', 'size', Number);
  bindSeg('segMode', 'mode');
  bindSeg('segColor', 'color', Number);

  $('btnStart').addEventListener('click', function () {
    $('setupModal').classList.remove('on');
    newGame();
  });

  // 规则弹窗内容
  (function fillRules() {
    var box = $('ruleList');
    box.innerHTML = SK.LIST.map(function (s) {
      return '<div class="ruleRow"><div class="t" style="color:' + s.color + '">' +
        s.icon + ' ' + s.name + ' · ' + s.tag + '　<span style="color:#f2c14e;font-size:11px">' + s.cost + '⚡</span>' +
        '　<span style="color:#6b7488;font-size:11px">冷却 ' + s.cd + ' 回合</span></div>' +
        '<div class="d">' + s.desc + '</div></div>';
    }).join('');
  })();

  // ---------- 结算 ----------
  function showResult() {
    var r = state.result;
    if (!r) return;
    var t = r.detail || R.estimateTerritory(state);
    var winnerName = r.winner === 1 ? '黑方' : '白方';
    var iAm = state.mode === 'pve' ? (r.winner === state.humanColor) : null;
    $('resTitle').textContent = r.resign
      ? (winnerName + '胜（对方认输）')
      : (winnerName + '胜 · 数子');
    $('resScore').innerHTML =
      '黑方 ' + t.black + ' 子　vs　白方 ' + t.white + ' 子（含贴目 ' + t.komi + '）<br>' +
      '分差 <b>' + (t.diff > 0 ? '+' : '') + t.diff.toFixed(1) + '</b>';
    $('resNote').textContent = iAm === null
      ? '黑地 ' + t.territory[1] + ' + 黑子 ' + t.stones[1] + '　|　白地 ' + t.territory[2] + ' + 白子 ' + t.stones[2]
      : (iAm ? '你赢了，棋感不错。' : '这局输了，试试用技能断掉对方大块。');
    $('resultModal').classList.add('on');
    ui.showTerr = true;
    render();
  }

  // ---------- 启动 ----------
  state = R.createGame({ size: 9, mode: 'pve', humanColor: 1 });
  buildEnergyCells();
  resize();
  updateUI();
  $('setupModal').classList.add('on');
})();
