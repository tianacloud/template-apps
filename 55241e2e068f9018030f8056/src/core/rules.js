/* rules.js - 技能围棋核心规则引擎（H5 / 小程序共用）
 * UMD: CommonJS(module.exports) 用于小程序，全局 SkillGo.Rules 用于浏览器。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./skills.js'));
  } else {
    (root.SkillGo = root.SkillGo || {}).Rules = factory(root.SkillGo.Skills);
  }
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this), function (Skills) {
  'use strict';

  var EMPTY = 0, BLACK = 1, WHITE = 2;
  var DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  var ENERGY_MAX = 10;
  var ENERGY_START = 2;
  var ENERGY_PER_MOVE = 1;
  var ENERGY_PER_CAPTURE = 2;
  var EFFECT_PLIES = 6; // 3 个回合（双方各 3 手）

  function opp(c) { return c === BLACK ? WHITE : BLACK; }
  function idxOf(size, r, c) { return r * size + c; }
  function rowOf(size, i) { return Math.floor(i / size); }
  function colOf(size, i) { return i % size; }

  function neighbors(size, i) {
    var r = rowOf(size, i), c = colOf(size, i), out = [];
    for (var d = 0; d < 4; d++) {
      var nr = r + DIRS[d][0], nc = c + DIRS[d][1];
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
      out.push(idxOf(size, nr, nc));
    }
    return out;
  }

  function getGroup(board, size, start) {
    var color = board[start];
    if (color === EMPTY) return [];
    var seen = {}, group = [], stack = [start];
    seen[start] = 1;
    while (stack.length) {
      var cur = stack.pop();
      group.push(cur);
      var ns = neighbors(size, cur);
      for (var k = 0; k < ns.length; k++) {
        var n = ns[k];
        if (seen[n]) continue;
        if (board[n] === color) { seen[n] = 1; stack.push(n); }
      }
    }
    return group;
  }

  function groupLiberties(board, size, group) {
    var libs = {}, count = 0;
    for (var i = 0; i < group.length; i++) {
      var ns = neighbors(size, group[i]);
      for (var k = 0; k < ns.length; k++) {
        if (board[ns[k]] === EMPTY && !libs[ns[k]]) { libs[ns[k]] = 1; count++; }
      }
    }
    return { count: count, points: Object.keys(libs).map(Number) };
  }

  function boardKey(board) { return board.join(''); }

  // ---------- 状态 ----------

  function createGame(opts) {
    opts = opts || {};
    var size = opts.size || 9;
    var state = {
      size: size,
      board: new Array(size * size).fill(EMPTY),
      turn: BLACK,
      moveNumber: 0,
      passCount: 0,
      lastMove: -1,
      lastCaptured: [],
      captured: [0, 0, 0],
      energy: [0, ENERGY_START, ENERGY_START],
      cooldown: [{}, {}],           // index: color-1
      effects: { fortify: [], ban: [], fog: [], sight: [0, 0] },
      positions: {},                // 超劫：局面重复检测
      over: false,
      result: null,
      mode: opts.mode || 'pve',     // pve | pvp
      humanColor: opts.humanColor || BLACK,
      log: []
    };
    state.positions[boardKey(state.board)] = 1;
    return state;
  }

  function clone(state) { return JSON.parse(JSON.stringify(state)); }

  function cdMap(state, color) { return state.cooldown[color - 1]; }

  function isFortified(state, color, group) {
    var fs = state.effects.fortify;
    for (var i = 0; i < fs.length; i++) {
      var f = fs[i];
      if (f.owner !== color || f.until <= state.moveNumber) continue;
      for (var j = 0; j < group.length; j++) {
        if (f.cells.indexOf(group[j]) >= 0) return true;
      }
    }
    return false;
  }

  function isBanned(state, i, color) {
    var bs = state.effects.ban;
    for (var k = 0; k < bs.length; k++) {
      if (bs[k].idx === i && bs[k].until > state.moveNumber && bs[k].by !== color) return true;
    }
    return false;
  }

  function banList(state, color) {
    var bs = state.effects.ban, out = [];
    for (var k = 0; k < bs.length; k++) {
      if (bs[k].until > state.moveNumber && bs[k].by !== color) out.push(bs[k].idx);
    }
    return out;
  }

  function fogCells(state, color) {
    var fs = state.effects.fog, out = [];
    for (var k = 0; k < fs.length; k++) {
      if (fs[k].until > state.moveNumber && fs[k].by !== color) {
        out = out.concat(fs[k].cells);
      }
    }
    return out;
  }

  function sightOn(state, color) { return state.effects.sight[color - 1] > state.moveNumber; }

  // ---------- 落子 ----------

  function legality(state, i, color) {
    if (state.over) return '对局已结束';
    if (i < 0 || i >= state.board.length) return '超出棋盘';
    if (state.board[i] !== EMPTY) return '该点已有棋子';
    if (isBanned(state, i, color)) return '该点被封印';
    if (state.turn !== color) return '不是你的回合';
    return null;
  }

  // 移除某方所有无气（且不免疫）的块
  function removeDead(state, color) {
    var removed = [];
    var visited = {};
    for (var i = 0; i < state.board.length; i++) {
      if (state.board[i] !== color || visited[i]) continue;
      var g = getGroup(state.board, state.size, i);
      for (var k = 0; k < g.length; k++) visited[g[k]] = 1;
      if (groupLiberties(state.board, state.size, g).count === 0) {
        if (isFortified(state, color, g)) continue;
        for (var m = 0; m < g.length; m++) { state.board[g[m]] = EMPTY; removed.push(g[m]); }
      }
    }
    return removed;
  }

  function gainEnergy(state, color, amount) {
    state.energy[color] = Math.min(ENERGY_MAX, state.energy[color] + amount);
  }

  function settleCaptures(state, mover) {
    var removed = removeDead(state, opp(mover));
    var selfRemoved = removeDead(state, mover);
    removed = removed.concat(selfRemoved);
    if (removed.length) {
      state.captured[mover] += removed.length;
      gainEnergy(state, mover, ENERGY_PER_CAPTURE * removed.length);
    }
    return removed;
  }

  /* 落子。fromSkill=true 时表示飞石等技能落子（仍受提子结算约束）。 */
  function play(state, i, color, fromSkill) {
    color = color || state.turn;
    if (!fromSkill) {
      var err = legality(state, i, color);
      if (err) return { ok: false, reason: err };
    } else {
      if (state.board[i] !== EMPTY) return { ok: false, reason: '该点已有棋子' };
      if (isBanned(state, i, color)) return { ok: false, reason: '该点被封印' };
    }

    var backup = state.board.slice();
    state.board[i] = color;

    var removed = settleCaptures(state, color);

    // 自杀手：落子后自己无气且未提掉任何敌子 -> 非法（飞石同样不允许自杀）
    if (removed.length === 0) {
      var mine = getGroup(state.board, state.size, i);
      if (groupLiberties(state.board, state.size, mine).count === 0) {
        state.board = backup;
        return { ok: false, reason: '自杀手，不允许' };
      }
    }

    // 超劫检测
    var key = boardKey(state.board);
    if (state.positions[key]) {
      state.board = backup;
      state.captured[color] -= removed.length;
      return { ok: false, reason: '打劫禁着（局面重复）' };
    }
    state.positions[key] = 1;

    state.lastMove = i;
    state.lastCaptured = removed;
    state.passCount = 0;
    gainEnergy(state, color, ENERGY_PER_MOVE);
    if (!fromSkill) state.moveNumber++;
    return { ok: true, captured: removed };
  }

  function pass(state, color) {
    color = color || state.turn;
    state.passCount++;
    state.lastMove = -1;
    state.moveNumber++;
    tick(state, color);
    if (state.passCount >= 2) finish(state);
    return { ok: true };
  }

  /* 回合结束：切换行棋方、冷却 -1、清理过期效果 */
  function tick(state, color) {
    var cd = cdMap(state, color);
    for (var k in cd) if (cd.hasOwnProperty(k)) {
      cd[k] = cd[k] - 1;
      if (cd[k] <= 0) delete cd[k];
    }
    state.effects.fortify = state.effects.fortify.filter(function (f) { return f.until > state.moveNumber; });
    state.effects.ban = state.effects.ban.filter(function (b) { return b.until > state.moveNumber; });
    state.effects.fog = state.effects.fog.filter(function (f) { return f.until > state.moveNumber; });
    state.turn = opp(color);
  }

  function endTurn(state, color) {
    color = color || state.turn;
    tick(state, color);
    return state;
  }

  // ---------- 技能 ----------

  function canUse(state, skillId, color) {
    color = color || state.turn;
    var s = Skills.get(skillId);
    if (!s) return { ok: false, reason: '未知技能' };
    if (state.over) return { ok: false, reason: '对局已结束' };
    if (state.turn !== color) return { ok: false, reason: '不是你的回合' };
    if (cdMap(state, color)[skillId]) return { ok: false, reason: '冷却中（剩 ' + cdMap(state, color)[skillId] + ' 回合）' };
    if (state.energy[color] < s.cost) return { ok: false, reason: '能量不足（需 ' + s.cost + '）' };
    return { ok: true };
  }

  function useSkill(state, skillId, targetIdx, color) {
    color = color || state.turn;
    var check = canUse(state, skillId, color);
    if (!check.ok) return check;
    var s = Skills.get(skillId);
    var i = targetIdx;

    // 目标合法性
    if (s.target === 'point' && (i == null || i < 0 || state.board[i] !== EMPTY)) {
      return { ok: false, reason: '需要指定一个空交叉点' };
    }
    if (s.target === 'own-stone' && (i == null || state.board[i] !== color)) {
      return { ok: false, reason: '需要指定己方的一颗棋子' };
    }
    if (s.target === 'enemy-stone' && (i == null || state.board[i] !== opp(color))) {
      return { ok: false, reason: '需要指定对手的一颗棋子' };
    }
    if (s.target === 'area' && (i == null || i < 0 || i >= state.board.length)) {
      return { ok: false, reason: '需要指定一个区域中心' };
    }

    var res = { ok: true, skill: s.id };
    if (s.id === 'fortify') {
      var g = getGroup(state.board, state.size, i);
      state.effects.fortify.push({ owner: color, cells: g.slice(), until: state.moveNumber + EFFECT_PLIES });
      res.cells = g.slice();
    } else if (s.id === 'airdrop') {
      var pr = play(state, i, color, true);
      if (!pr.ok) return pr;
      res.captured = pr.captured;
    } else if (s.id === 'ban') {
      state.effects.ban.push({ idx: i, by: color, until: state.moveNumber + EFFECT_PLIES });
    } else if (s.id === 'fog') {
      res.cells = areaCells(state.size, i);
      state.effects.fog.push({ by: color, cells: res.cells, until: state.moveNumber + EFFECT_PLIES });
    } else if (s.id === 'quake') {
      state.board[i] = EMPTY;
      state.captured[color] += 1;
      gainEnergy(state, color, ENERGY_PER_CAPTURE);
      var rm = removeDead(state, opp(color));
      var rm2 = removeDead(state, color);
      var all = rm.concat(rm2);
      if (all.length) {
        state.captured[color] += all.length;
        gainEnergy(state, color, ENERGY_PER_CAPTURE * all.length);
      }
      state.lastMove = i;
      res.captured = [i].concat(all);
    } else if (s.id === 'sight') {
      state.effects.sight[color - 1] = state.moveNumber + EFFECT_PLIES;
    }

    state.energy[color] -= s.cost;
    state.cooldown[color - 1][s.id] = s.cd;
    state.log.push({ n: state.moveNumber, c: color, s: s.id, t: i });
    return res;
  }

  function areaCells(size, i) {
    var r = rowOf(size, i), c = colOf(size, i), out = [];
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        var nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
        out.push(idxOf(size, nr, nc));
      }
    }
    return out;
  }

  // ---------- 终局与数子 ----------

  function estimateTerritory(state) {
    var size = state.size, board = state.board;
    var owner = new Array(size * size).fill(0); // 0 未定 / 1 黑 / 2 白
    var visited = {};
    var terr = [0, 0, 0];
    for (var i = 0; i < board.length; i++) {
      if (board[i] !== EMPTY || visited[i]) continue;
      var region = [], stack = [i], touch = {};
      visited[i] = 1;
      while (stack.length) {
        var cur = stack.pop();
        region.push(cur);
        var ns = neighbors(size, cur);
        for (var k = 0; k < ns.length; k++) {
          var n = ns[k];
          if (board[n] === EMPTY) {
            if (!visited[n]) { visited[n] = 1; stack.push(n); }
          } else {
            touch[board[n]] = 1;
          }
        }
      }
      var keys = Object.keys(touch);
      var oc = keys.length === 1 ? Number(keys[0]) : 0;
      if (oc) {
        for (var m = 0; m < region.length; m++) owner[region[m]] = oc;
        terr[oc] += region.length;
      }
    }
    var stones = [0, 0, 0];
    for (var j = 0; j < board.length; j++) if (board[j]) stones[board[j]]++;
    var komi = size >= 13 ? 6.5 : 3.5;
    var black = terr[BLACK] + stones[BLACK];
    var white = terr[WHITE] + stones[WHITE] + komi;
    return {
      owner: owner,
      territory: terr,
      stones: stones,
      komi: komi,
      black: black,
      white: white,
      diff: black - white
    };
  }

  function finish(state) {
    var t = estimateTerritory(state);
    state.over = true;
    state.result = {
      black: t.black,
      white: t.white,
      diff: t.diff,
      winner: t.diff > 0 ? BLACK : WHITE,
      detail: t
    };
    return state.result;
  }

  return {
    EMPTY: EMPTY, BLACK: BLACK, WHITE: WHITE,
    ENERGY_MAX: ENERGY_MAX,
    ENERGY_PER_MOVE: ENERGY_PER_MOVE,
    ENERGY_PER_CAPTURE: ENERGY_PER_CAPTURE,
    createGame: createGame,
    clone: clone,
    play: play,
    pass: pass,
    endTurn: endTurn,
    legality: legality,
    useSkill: useSkill,
    canUse: canUse,
    isBanned: isBanned,
    banList: banList,
    fogCells: fogCells,
    sightOn: sightOn,
    isFortified: isFortified,
    getGroup: getGroup,
    groupLiberties: groupLiberties,
    neighbors: neighbors,
    areaCells: areaCells,
    estimateTerritory: estimateTerritory,
    finish: finish,
    opp: opp,
    rowOf: rowOf,
    colOf: colOf,
    idxOf: idxOf,
    boardKey: boardKey
  };
});
