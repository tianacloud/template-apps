/* ai.js - 启发式 AI 对手（H5 / 小程序共用）
 * 提供 chooseMove（选点）与 planTurn（输出一整回合的动作序列：技能 + 落子）。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./rules.js'), require('./skills.js'));
  } else {
    (root.SkillGo = root.SkillGo || {}).AI = factory(root.SkillGo.Rules, root.SkillGo.Skills);
  }
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this), function (Rules, Skills) {
  'use strict';

  var EMPTY = 0;

  function libs(board, size, group) {
    return Rules.groupLiberties(board, size, group).count;
  }

  /* 纯 board 模拟落子，忽略技能效果（AI 近似） */
  function simulate(board, size, i, color) {
    var b = board.slice();
    if (b[i] !== EMPTY) return null;
    b[i] = color;
    var captured = 0, visited = {};
    var ns = Rules.neighbors(size, i);
    for (var k = 0; k < ns.length; k++) {
      var n = ns[k];
      if (b[n] !== Rules.opp(color) || visited[n]) continue;
      var g = Rules.getGroup(b, size, n);
      for (var m = 0; m < g.length; m++) visited[g[m]] = 1;
      if (libs(b, size, g) === 0) {
        for (var q = 0; q < g.length; q++) b[g[q]] = EMPTY;
        captured += g.length;
      }
    }
    var mine = Rules.getGroup(b, size, i);
    var myLibs = libs(b, size, mine);
    if (captured === 0 && myLibs === 0) return null; // 自杀
    return { board: b, captured: captured, myLibs: myLibs, mine: mine };
  }

  function libertyUtility(n) {
    if (n <= 1) return -14;
    if (n === 2) return -4;
    if (n === 3) return 1;
    if (n === 4) return 3;
    return 4;
  }

  function isEyeish(board, size, i, color) {
    var ns = Rules.neighbors(size, i);
    if (ns.length < 4) return false;
    for (var k = 0; k < ns.length; k++) if (board[ns[k]] !== color) return false;
    return true;
  }

  function dist(a, b, size) {
    return Math.abs(Rules.rowOf(size, a) - Rules.rowOf(size, b)) + Math.abs(Rules.colOf(size, a) - Rules.colOf(size, b));
  }

  function scoreMove(state, i, color) {
    var size = state.size, board = state.board;
    var sim = simulate(board, size, i, color);
    if (!sim) return -9999;

    var s = 0;
    s += sim.captured * 16;
    s += libertyUtility(sim.myLibs);

    // 压迫：落子后相邻敌块处于被打吃状态
    var ns = Rules.neighbors(size, i), seen = {};
    for (var k = 0; k < ns.length; k++) {
      var n = ns[k];
      if (sim.board[n] !== Rules.opp(color) || seen[n]) continue;
      var g = Rules.getGroup(sim.board, size, n);
      for (var m = 0; m < g.length; m++) seen[g[m]] = 1;
      var l = libs(sim.board, size, g);
      if (l === 1) s += 5 + g.length * 1.5;
      else if (l === 2) s += 1.5;
    }

    if (isEyeish(board, size, i, color) && sim.captured === 0) s -= 7; // 不填自己的眼

    // 距离势场：与己方棋子保持 2~3 路，与对方棋子贴身
    var myMin = 99, opMin = 99;
    for (var j = 0; j < board.length; j++) {
      if (board[j] === EMPTY) continue;
      var d = dist(i, j, size);
      if (board[j] === color) { if (d < myMin) myMin = d; }
      else if (d < opMin) opMin = d;
    }
    if (myMin <= 2) s += 2.4;
    else if (myMin === 3) s += 2.0;
    else if (myMin === 4) s += 0.6;
    else if (myMin >= 6) s -= 1.0;

    if (opMin === 1) s += 2.0;
    else if (opMin === 2) s += 1.0;

    // 开局向中心 / 星位靠拢
    if (state.moveNumber < 10) {
      var cr = (size - 1) / 2, cc = (size - 1) / 2;
      var dc = Math.abs(Rules.rowOf(size, i) - cr) + Math.abs(Rules.colOf(size, i) - cc);
      s += Math.max(0, (size - dc)) * 0.35;
    } else {
      // 中后期偏好己方势力范围内的点
      var t = state._terr;
      if (t && t.owner[i] === color) s += 1.6;
    }

    s += Math.random() * 1.8;
    return s;
  }

  function chooseMove(state, color) {
    color = color || state.turn;
    state._terr = Rules.estimateTerritory(state);
    var best = -1, bestScore = -Infinity;
    var banned = {};
    var bl = Rules.banList(state, color);
    for (var k = 0; k < bl.length; k++) banned[bl[k]] = 1;

    for (var i = 0; i < state.board.length; i++) {
      if (state.board[i] !== EMPTY) continue;
      if (banned[i]) continue;
      var sc = scoreMove(state, i, color);
      if (sc > bestScore) { bestScore = sc; best = i; }
    }
    delete state._terr;
    return { idx: best, score: bestScore };
  }

  /* 找出对手最密集的 3×3 中心 */
  function densestFogCenter(state, color) {
    var size = state.size, best = -1, bestN = 0;
    for (var i = 0; i < state.board.length; i++) {
      var cells = Rules.areaCells(size, i), n = 0;
      for (var k = 0; k < cells.length; k++) if (state.board[cells[k]] === color) n++;
      if (n > bestN) { bestN = n; best = i; }
    }
    return bestN > 0 ? best : -1;
  }

  /* 找出某方气数最少的大块中的一颗棋子 */
  function weakestStone(state, color, minSize) {
    var visited = {}, best = -1, bestScore = -Infinity;
    for (var i = 0; i < state.board.length; i++) {
      if (state.board[i] !== color || visited[i]) continue;
      var g = Rules.getGroup(state.board, state.size, i);
      for (var m = 0; m < g.length; m++) visited[g[m]] = 1;
      if (g.length < minSize) continue;
      var l = Rules.groupLiberties(state.board, state.size, g).count;
      var sc = g.length * 2 - l * 1.5;
      if (sc > bestScore) { bestScore = sc; best = i; }
    }
    return best;
  }

  /* 规划一整个回合：在克隆状态上预演，保证动作序列可执行 */
  function planTurn(state, color) {
    color = color || state.turn;
    var sim = Rules.clone(state);
    var actions = [];
    var used = 0;

    function trySkill(id, target) {
      if (used >= 2) return false;
      var r = Rules.useSkill(sim, id, target, color);
      if (r.ok) { actions.push({ type: 'skill', id: id, target: target }); used++; return true; }
      return false;
    }

    var enemy = Rules.opp(color);

    // 1. 自保：己方大块只剩 1~2 口气 -> 加固
    if (sim.energy[color] >= 2) {
      var weakSelf = weakestStone(sim, color, 3);
      if (weakSelf >= 0) {
        var g = Rules.getGroup(sim.board, sim.size, weakSelf);
        var l = Rules.groupLiberties(sim.board, sim.size, g).count;
        if (l <= 2) trySkill('fortify', weakSelf);
      }
    }

    // 2. 强攻：对手有大气数少的块 -> 震星
    if (sim.energy[color] >= 4) {
      var weakEnemy = weakestStone(sim, enemy, 3);
      if (weakEnemy >= 0) {
        var ge = Rules.getGroup(sim.board, sim.size, weakEnemy);
        var le = Rules.groupLiberties(sim.board, sim.size, ge).count;
        if (le <= 2) trySkill('quake', weakEnemy);
      }
    }

    // 3. 封印：封锁对手当前最佳落点
    if (sim.energy[color] >= 2) {
      var enemyBest = chooseMove(sim, enemy).idx;
      if (enemyBest >= 0 && Math.random() < 0.75) trySkill('ban', enemyBest);
    }

    // 4. 飞石：抢占自己的次佳点扩张
    if (sim.energy[color] >= 3) {
      var my1 = chooseMove(sim, color).idx;
      if (my1 >= 0) trySkill('airdrop', my1);
    }

    // 5. 迷雾：干扰对手视野
    if (sim.energy[color] >= 2 && Math.random() < 0.5) {
      var fc = densestFogCenter(sim, enemy);
      if (fc >= 0) trySkill('fog', fc);
    }

    // 6. 天眼：能量溢出时点亮势力图
    if (sim.energy[color] >= 6) trySkill('sight', -1);

    // 落子 / 虚着
    var mv = chooseMove(sim, color);
    if (mv.idx >= 0) {
      var pr = Rules.play(sim, mv.idx, color);
      if (pr.ok) actions.push({ type: 'move', idx: mv.idx });
      else {
        var mv2 = chooseMove(sim, color);
        if (mv2.idx >= 0 && mv2.idx !== mv.idx) actions.push({ type: 'move', idx: mv2.idx });
        else actions.push({ type: 'pass' });
      }
    } else {
      actions.push({ type: 'pass' });
    }

    return actions;
  }

  return {
    chooseMove: chooseMove,
    planTurn: planTurn,
    scoreMove: scoreMove
  };
});
