/* render.js - 共用 Canvas 2D 绘制层（H5 / 小程序复用）
 * 只依赖 ctx 的标准 2D API，无 DOM 依赖。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./rules.js'), require('./skills.js'));
  } else {
    (root.SkillGo = root.SkillGo || {}).Render = factory(root.SkillGo.Rules, root.SkillGo.Skills);
  }
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this), function (Rules, Skills) {
  'use strict';

  var THEME = {
    wood1: '#dcb887',
    wood2: '#c99a63',
    woodEdge: 'rgba(38, 24, 12, 0.35)',
    line: 'rgba(58, 38, 18, 0.62)',
    lineBold: 'rgba(44, 28, 12, 0.85)',
    star: 'rgba(48, 30, 12, 0.9)',
    black1: '#5b5f6b',
    black2: '#12141a',
    white1: '#ffffff',
    white2: '#c9ccd6',
    label: 'rgba(60, 40, 20, 0.75)'
  };

  var COL_LETTERS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'; // 跳过 I

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function layout(canvasPx, size, pad) {
    pad = pad == null ? 26 : pad;
    var inner = canvasPx - pad * 2;
    var cell = inner / (size - 1);
    return { px: canvasPx, size: size, pad: pad, cell: cell, ox: pad, oy: pad, r: cell * 0.455 };
  }

  function cellPos(L, i) {
    return {
      x: L.ox + Rules.colOf(L.size, i) * L.cell,
      y: L.oy + Rules.rowOf(L.size, i) * L.cell
    };
  }

  function pointToCell(L, x, y) {
    var c = Math.round((x - L.ox) / L.cell);
    var r = Math.round((y - L.oy) / L.cell);
    if (r < 0 || c < 0 || r >= L.size || c >= L.size) return -1;
    var p = cellPos(L, Rules.idxOf(L.size, r, c));
    var dx = x - p.x, dy = y - p.y;
    if (dx * dx + dy * dy > (L.cell * 0.52) * (L.cell * 0.52)) return -1;
    return Rules.idxOf(L.size, r, c);
  }

  function starPoints(size) {
    if (size === 9) return [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]];
    if (size === 13) return [[3, 3], [3, 9], [9, 3], [9, 9], [6, 6]];
    if (size === 19) return [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]];
    return [];
  }

  function drawStone(ctx, x, y, r, color, opts) {
    opts = opts || {};
    if (opts.ghost) {
      ctx.save();
      ctx.globalAlpha = opts.alpha == null ? 0.42 : opts.alpha;
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + 1, y + 2, r * 0.98, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(12, 8, 4, 0.28)';
    ctx.fill();
    ctx.restore();

    var g = ctx.createRadialGradient(x - r * 0.32, y - r * 0.36, r * 0.12, x, y, r);
    if (color === 1) {
      g.addColorStop(0, THEME.black1);
      g.addColorStop(1, THEME.black2);
    } else {
      g.addColorStop(0, THEME.white1);
      g.addColorStop(1, THEME.white2);
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = Math.max(0.6, r * 0.06);
    ctx.strokeStyle = color === 1 ? 'rgba(0,0,0,0.55)' : 'rgba(120,122,135,0.55)';
    ctx.stroke();
    if (opts.ghost) ctx.restore();
  }

  /* 主绘制
   * o = { L, state, viewer, hover, skill, territory, showTerritory }
   */
  function draw(ctx, o) {
    var L = o.L, s = o.state, size = s.size;
    var boardPx = L.px;

    // 棋盘底
    ctx.clearRect(0, 0, boardPx, boardPx);
    var bg = ctx.createLinearGradient(0, 0, boardPx, boardPx);
    bg.addColorStop(0, THEME.wood1);
    bg.addColorStop(1, THEME.wood2);
    roundRect(ctx, 2, 2, boardPx - 4, boardPx - 4, 14);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = THEME.woodEdge;
    ctx.stroke();

    // 网格
    ctx.strokeStyle = THEME.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < size; i++) {
      var a = L.oy + i * L.cell, b = L.ox + i * L.cell;
      ctx.moveTo(L.ox, a); ctx.lineTo(L.ox + (size - 1) * L.cell, a);
      ctx.moveTo(b, L.oy); ctx.lineTo(b, L.oy + (size - 1) * L.cell);
    }
    ctx.stroke();

    // 外框加粗
    var e = L.ox, f = L.oy + (size - 1) * L.cell;
    ctx.strokeStyle = THEME.lineBold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e, L.oy); ctx.lineTo(e, f); ctx.lineTo(e + (size - 1) * L.cell, f);
    ctx.lineTo(e + (size - 1) * L.cell, L.oy); ctx.closePath();
    ctx.stroke();

    // 星位
    var stars = starPoints(size);
    ctx.fillStyle = THEME.star;
    for (var k = 0; k < stars.length; k++) {
      var sp = { x: L.ox + stars[k][1] * L.cell, y: L.oy + stars[k][0] * L.cell };
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, Math.max(2, L.cell * 0.085), 0, Math.PI * 2);
      ctx.fill();
    }

    // 坐标
    ctx.fillStyle = THEME.label;
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var ci = 0; ci < size; ci++) {
      ctx.fillText(COL_LETTERS[ci], L.ox + ci * L.cell, L.oy - L.pad * 0.55);
      ctx.fillText(String(size - ci), L.ox - L.pad * 0.6, L.oy + ci * L.cell);
    }

    var viewer = o.viewer || s.turn;
    var fogSet = {};
    var fog = Rules.fogCells(s, viewer);
    for (var fi = 0; fi < fog.length; fi++) fogSet[fog[fi]] = 1;

    // 势力图（天眼 / 结算）
    if (o.showTerritory && o.territory) {
      for (var t = 0; t < s.board.length; t++) {
        var ow = o.territory.owner[t];
        if (!ow || s.board[t] !== 0) continue;
        var p = cellPos(L, t);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, L.r * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = ow === 1 ? '#2b2f3a' : '#f2f2f6';
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // 加固光环
    for (var q = 0; q < s.effects.fortify.length; q++) {
      var ft = s.effects.fortify[q];
      if (ft.until <= s.moveNumber) continue;
      ctx.save();
      ctx.strokeStyle = ft.owner === viewer ? '#f2c14e' : 'rgba(242,193,78,0.5)';
      ctx.lineWidth = Math.max(1.5, L.cell * 0.07);
      ctx.setLineDash([L.cell * 0.22, L.cell * 0.14]);
      for (var qc = 0; qc < ft.cells.length; qc++) {
        var pp = cellPos(L, ft.cells[qc]);
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, L.r * 1.02, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 棋子
    for (var idx = 0; idx < s.board.length; idx++) {
      if (!s.board[idx]) continue;
      if (fogSet[idx]) continue;
      var cp = cellPos(L, idx);
      drawStone(ctx, cp.x, cp.y, L.r, s.board[idx]);
    }

    // 禁行标记
    for (var b = 0; b < s.effects.ban.length; b++) {
      var bn = s.effects.ban[b];
      if (bn.until <= s.moveNumber) continue;
      var bp = cellPos(L, bn.idx);
      var rr = L.r * 0.62;
      ctx.save();
      ctx.strokeStyle = '#e8564f';
      ctx.lineWidth = Math.max(1.6, L.cell * 0.08);
      ctx.beginPath();
      ctx.moveTo(bp.x - rr, bp.y - rr); ctx.lineTo(bp.x + rr, bp.y + rr);
      ctx.moveTo(bp.x + rr, bp.y - rr); ctx.lineTo(bp.x - rr, bp.y + rr);
      ctx.stroke();
      ctx.restore();
    }

    // 迷雾遮罩
    for (var g2 = 0; g2 < s.effects.fog.length; g2++) {
      var fg = s.effects.fog[g2];
      if (fg.until <= s.moveNumber || fg.by === viewer) continue;
      for (var fc = 0; fc < fg.cells.length; fc++) {
        var fp = cellPos(L, fg.cells[fc]);
        ctx.save();
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, L.cell * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(28, 30, 40, 0.9)';
        ctx.fill();
        ctx.clip();
        ctx.strokeStyle = 'rgba(150, 160, 200, 0.35)';
        ctx.lineWidth = 1.2;
        for (var sl = -2; sl <= 2; sl++) {
          ctx.beginPath();
          ctx.moveTo(fp.x - L.cell * 0.5 + sl * L.cell * 0.25, fp.y + L.cell * 0.5);
          ctx.lineTo(fp.x - L.cell * 0.5 + sl * L.cell * 0.25 + L.cell, fp.y - L.cell * 0.5);
          ctx.stroke();
        }
        ctx.restore();
        ctx.fillStyle = 'rgba(190, 200, 240, 0.85)';
        ctx.font = 'bold ' + Math.round(L.cell * 0.42) + 'px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', fp.x, fp.y + 1);
      }
    }

    // 技能目标提示
    var sk = o.skill;
    if (sk) {
      for (var ti = 0; ti < s.board.length; ti++) {
        if (!targetValid(s, sk, ti, s.turn)) continue;
        var tp = cellPos(L, ti);
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = sk.color;
        ctx.lineWidth = Math.max(1.2, L.cell * 0.06);
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, L.r * 0.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 最后一手
    if (s.lastMove >= 0 && s.board[s.lastMove]) {
      var lp = cellPos(L, s.lastMove);
      ctx.save();
      ctx.strokeStyle = s.board[s.lastMove] === 1 ? '#ffd166' : '#e8564f';
      ctx.lineWidth = Math.max(1.4, L.cell * 0.07);
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, L.r * 0.34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 悬停预览
    if (o.hover >= 0 && s.board[o.hover] === 0 && !s.over) {
      var hp = cellPos(L, o.hover);
      var banned = Rules.isBanned(s, o.hover, s.turn);
      drawStone(ctx, hp.x, hp.y, L.r, s.turn, { ghost: true, alpha: banned ? 0.2 : 0.45 });
    }
  }

  function targetValid(state, skill, i, color) {
    if (skill.target === 'none') return false;
    if (skill.target === 'point') return state.board[i] === 0 && !Rules.isBanned(state, i, color);
    if (skill.target === 'own-stone') return state.board[i] === color;
    if (skill.target === 'enemy-stone') return state.board[i] === Rules.opp(color);
    if (skill.target === 'area') return i >= 0;
    return false;
  }

  return {
    THEME: THEME,
    layout: layout,
    cellPos: cellPos,
    pointToCell: pointToCell,
    drawStone: drawStone,
    draw: draw,
    roundRect: roundRect,
    targetValid: targetValid
  };
});
