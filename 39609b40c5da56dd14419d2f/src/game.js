/* ============================================================
   凌晨三点 · Oncall 指挥台
   核心机制：回合制时间推进 —— 动作耗时直接换算成「失败请求数」
   ============================================================ */
export function startGame(initialScores, saveScore) {
  'use strict';

  var app = document.getElementById('app');
  var scoreCache = initialScores;
  var cloudStatus = '';
  var pendingScore = null;

  /* ---------------- 工具 ---------------- */
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function mmss(s) { var m = Math.floor(s / 60), q = s % 60; return (m < 10 ? '0' : '') + m + ':' + (q < 10 ? '0' : '') + q; }
  function num(n) {
    if (n >= 100000000) return (n / 100000000).toFixed(2) + ' 亿';
    if (n >= 10000) return (n / 10000).toFixed(1) + ' 万';
    return Math.round(n).toLocaleString('en-US');
  }
  function store() { return scoreCache; }

  var toastT;
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = el('<div class="toast"></div>'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 3200);
  }

  /* ---------------- 引擎 ---------------- */
  function newGame(sc) {
    return {
      sc: sc, t: 0, err: sc.startErr, growth: sc.growth, impact: 0,
      flags: {}, used: {}, recs: [], alerts: [], aIdx: 0, hist: [{ t: 0, e: sc.startErr }],
      done: false, mttr: null, trapped: 0, temps: 0, runaway: false
    };
  }

  /* 推进时间：每 1 秒都在产生失败请求 */
  function advance(g, dt) {
    var sc = g.sc, acc = 0;
    for (var i = 0; i < dt; i++) {
      g.t++;
      g.err = clamp(g.err + g.growth, 0.3, 100);
      acc += sc.qps * (g.err / 100);
      g.hist.push({ t: g.t, e: g.err });
      /* 快到期的告警 */
      while (g.aIdx < sc.alerts.length && sc.alerts[g.aIdx].t <= g.t) {
        g.alerts.push(sc.alerts[g.aIdx]); g.aIdx++;
      }
    }
    g.impact += acc;
    if (g.hist.length > 900) g.hist.splice(0, g.hist.length - 900);
  }

  /* 应用一个动作 */
  function act(g, id) {
    if (g.done) return null;
    var a = null;
    for (var i = 0; i < g.sc.acts.length; i++) if (g.sc.acts[i].id === id) { a = g.sc.acts[i]; break; }
    if (!a || g.used[id]) return null;

    var eff = a, blind = false;
    if (a.req && !g.flags[a.req] && a.blind) { eff = Object.assign({}, a, a.blind); blind = true; }

    var t0 = g.t;
    advance(g, a.dur);
    if (!blind) g.used[id] = true;   /* 盲目失败的动作可以重来一次，但要再付一次时间 */
    if (a.flag) g.flags[a.flag] = true;

    if (eff.err) {
      if (eff.err.set != null) g.err = eff.err.set;
      if (eff.err.mul != null) g.err = clamp(g.err * eff.err.mul, 0.3, 100);
    }
    if (eff.growth) {
      if (eff.growth.set != null) g.growth = eff.growth.set;
      if (eff.growth.add != null) g.growth = g.growth + eff.growth.add;
    }
    g.hist.push({ t: g.t, e: g.err });

    var lv = eff.lv || 'info';
    if (lv === 'bad') g.trapped++;
    if (lv === 'temp') g.temps++;

    var rec = { id: id, label: a.t, t0: t0, t1: g.t, dur: a.dur, lv: lv, log: eff.log || '' };
    g.recs.push(rec);

    if (eff.win) { g.done = true; g.mttr = g.t; }
    else if (g.t >= g.sc.maxSec) { g.done = true; g.mttr = g.t; g.runaway = true; }
    return rec;
  }

  /* 干跑最优路径，得到满分基准（不写死数字） */
  var bestCache = {};
  function bestOf(sc) {
    if (bestCache[sc.id]) return bestCache[sc.id];
    var g = newGame(sc);
    for (var i = 0; i < sc.bestPath.length; i++) {
      if (g.done) break;
      act(g, sc.bestPath[i]);
    }
    if (!g.done) { g.mttr = g.t; }
    bestCache[sc.id] = { t: Math.max(g.mttr, 20), i: Math.max(g.impact, 1000) };
    return bestCache[sc.id];
  }

  function commCount(g) {
    var n = 0; if (g.flags.comm1) n++; if (g.flags.comm2) n++; if (g.flags.comm3) n++; return n;
  }

  function scoreOf(g) {
    var b = bestOf(g.sc);
    var mttr = g.mttr || g.t;
    var speed = 40 * clamp(1 - (mttr - b.t) / b.t, 0, 1);
    var imp = 30 * clamp(1 - (g.impact - b.i) / b.i, 0, 1);
    var dec = Math.max(0, 20 - 6 * g.trapped - 2 * g.temps);
    var cc = commCount(g);
    var comm = cc >= 2 ? 10 : cc === 1 ? 5 : 0;
    var total = Math.round(speed + imp + dec + comm);
    return {
      speed: Math.round(speed), imp: Math.round(imp), dec: Math.round(dec), comm: comm,
      total: total, grade: gradeOf(total), best: b, mttr: mttr
    };
  }
  function gradeOf(n) { return n >= 95 ? 'S' : n >= 85 ? 'A' : n >= 70 ? 'B' : n >= 55 ? 'C' : 'D'; }
  function gradeTitle(gr) {
    return ({ S: '首席救火官', A: '老练值班人', B: '合格 oncall', C: '手忙脚乱', D: '事故扩大者' })[gr];
  }

  /* ---------------- 视图状态 ---------------- */
  var view = 'home';
  var G = null;
  var RESULT = null;
  var BRIEF = null;   // 简报弹层

  /* ---------------- 首页 ---------------- */
  function heroHTML() {
    var s = store();
    var doneN = 0, bestSum = 0;
    window.SCENARIOS.forEach(function (sc) { if (s[sc.id]) { doneN++; bestSum += s[sc.id].total; } });

    var levels = window.SCENARIOS.map(function (sc) {
      var rec = s[sc.id];
      return '<button class="lv" data-lv="' + sc.id + '">' +
        '<div class="lv-top"><span class="lv-no">' + sc.no + '</span>' +
        '<span class="lv-diff">' + sc.diff + '</span></div>' +
        '<h3>' + esc(sc.name) + '</h3>' +
        '<p class="d">' + esc(sc.sub) + '</p>' +
        '<div class="lv-foot"><span class="sys">' + esc(sc.system) + '</span>' +
        '<span>·</span><span>' + esc(sc.brief.when) + '</span>' +
        '<span class="grade g-' + (rec ? rec.grade : 'N') + '">' + (rec ? rec.grade : '·') + '</span>' +
        '</div></button>';
    }).join('');

    return '<div class="home"><div class="wrap">' +
      '<div class="topbar">' +
      '<div class="brand"><span class="dot"></span>凌晨三点 · ONCALL 指挥台</div>' +
      '<div class="meta">' + (doneN ? '已通关 ' + doneN + '/4 · 累计 ' + bestSum + ' 分' : '4 场真实生产事故') + '</div>' +
      '</div>' +

      '<div class="hero">' +
      '<span class="kicker">INCIDENT COMMANDER</span>' +
      '<h1>凌晨三点，<br>你只有<span class="n">六分钟</span>。</h1>' +
      '<p class="sub">这不是一个看板，是一个<b>要你动手</b>的线上故障指挥台。' +
      '告警会一条条砸过来，每个处置动作都要花时间——' +
      '而你花掉的每一秒，都在变成用户的<b>失败请求</b>。</p>' +
      '<div class="cta">' +
      '<button class="btn btn-primary" id="go">开始值班 →</button>' +
      '<button class="btn btn-ghost" id="howBtn">怎么玩</button>' +
      '<span class="tip">约 3 分钟一关</span>' +
      '</div>' +
      '<div class="hero-visual"><div class="hv-card">' +
      '<div class="hv-h"><span>告警流</span><i>● LIVE</i></div>' +
      '<div class="hv-al p2"><div class="l"><b>P2</b><span>T+00:00</span><span>gateway</span></div>' +
      '<p>下单接口 5xx 比例 6.2%，呈上升趋势</p></div>' +
      '<div class="hv-al p1"><div class="l"><b>P1</b><span>T+00:28</span><span>order-api</span></div>' +
      '<p>HikariPool - Connection is not available, request timed out</p></div>' +
      '<div class="hv-al p3"><div class="l"><b>P1</b><span>T+01:02</span><span>mysql</span></div>' +
      '<p>活跃连接 100/100 已达上限，等待队列 214</p></div>' +
      '<div class="hv-foot"><em>▶</em> 你已执行 3 个动作 · 失败请求 8.9 万</div>' +
      '</div></div>' +
      '</div>' +

      '<div class="how">' +
      '<div class="cell"><div class="i">01 / 读</div><b>告警会自己找上门</b>' +
      '<p>故障开始后，告警按真实节奏推送到左侧。信息不全的时候，你得主动去查。</p></div>' +
      '<div class="cell"><div class="i">02 / 赌</div><b>每个动作都明码标时</b>' +
      '<p>查慢日志 35 秒、回滚 45 秒、扩容 90 秒。时间在你点下去的那一刻就开始烧。</p></div>' +
      '<div class="cell"><div class="i">03 / 收</div><b>收得住才叫救火</b>' +
      '<p>4 关 58 个动作里，藏着 11 个错误决策和 7 个临时方案。做错了，故障会变得更严重。</p></div>' +
      '</div>' +

      '<div class="sect-head"><h2>选择今晚的事故</h2><span>' + window.SCENARIOS.length + ' 关 · 建议按顺序</span></div>' +
      '<div class="levels">' + levels + '</div>' +

      '<div class="foot-note"><span>《凌晨三点 · Oncall 指挥台》</span>' +
      '<span>所有事故场景均为虚构，数值为教学目的做了简化</span></div>' +
      '</div></div>';
  }

  /* ---------------- 简报 ---------------- */
  function briefHTML(sc) {
    return '<div class="overlay" id="ov"><div class="sheet">' +
      '<div class="k">INCIDENT BRIEF · ' + sc.no + '</div>' +
      '<h2>' + esc(sc.name) + '</h2>' +
      '<p class="st">' + esc(sc.sub) + ' · ' + esc(sc.diff) + '</p>' +
      '<div class="brief-grid">' +
      '<div class="b"><span>事发时间</span><b>' + esc(sc.brief.when) + '</b></div>' +
      '<div class="b"><span>核心服务</span><b>' + esc(sc.system) + '</b></div>' +
      '<div class="b"><span>起始错误率</span><b>' + sc.startErr + '% ↑</b></div>' +
      '</div>' +
      '<p class="body">' + esc(sc.brief.intro) + '</p>' +
      '<div class="rulebox"><b>今晚的任务</b>' +
      '<ul><li>' + esc(sc.brief.task) + '</li>' +
      '<li>诊断和止血动作会<b>推进时间</b>，失败请求同时累加。</li>' +
      '<li>沟通是并行的（现实中你也是一边排查一边在群里同步），不占时间。</li>' +
      '<li>没执行过的动作可以随时点，执行过的会置灰。</li>' +
      '<li>动作分三类：诊断（拿信息）、止血（降错误率）、沟通（拿沟通分）。</li>' +
      '</ul></div>' +
      '<div class="acts"><button class="btn btn-ghost" id="cancelB">再想想</button>' +
      '<button class="btn btn-primary" id="startB">进入指挥台</button></div>' +
      '</div></div>';
  }

  /* ---------------- 游戏界面 ---------------- */
  function spark(g) {
    var h = g.hist, W = 100, H = 40;
    if (h.length < 2) return '';
    var maxE = 1;
    for (var i = 0; i < h.length; i++) if (h[i].e > maxE) maxE = h[i].e;
    var ymax = ymaxOf(g);
    var tmax = Math.max(g.t, 20);
    var pts = [], area = [];
    for (var k = 0; k < h.length; k++) {
      var x = (h[k].t / tmax) * W;
      var y = H - (clamp(h[k].e, 0, ymax) / ymax) * H;
      pts.push(x.toFixed(2) + ',' + y.toFixed(2));
      area.push(x.toFixed(2) + ',' + y.toFixed(2));
    }
    var line = pts.join(' ');
    var fill = '0,' + H + ' ' + area.join(' ') + ' ' + W + ',' + H;
    var col = g.err > 20 ? '#FF4D6D' : g.err > 5 ? '#FFB020' : '#2FD27D';
    var grid = '';
    [0.25, 0.5, 0.75].forEach(function (f) {
      var gy = (H * f).toFixed(2);
      grid += '<line x1="0" y1="' + gy + '" x2="' + W + '" y2="' + gy + '" stroke="rgba(150,180,220,.10)" stroke-width="1" vector-effect="non-scaling-stroke"/>';
    });
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + col + '" stop-opacity=".30"/>' +
      '<stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient></defs>' +
      grid +
      '<polygon points="' + fill + '" fill="url(#sg)"/>' +
      '<polyline points="' + line + '" fill="none" stroke="' + col + '" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<line x1="' + (W - 0.15) + '" y1="0" x2="' + (W - 0.15) + '" y2="' + H + '" stroke="' + col + '" stroke-width="1.5" opacity=".55" vector-effect="non-scaling-stroke"/>' +
      '</svg>';
  }
  function ymaxOf(g) {
    var m = 1; for (var i = 0; i < g.hist.length; i++) if (g.hist[i].e > m) m = g.hist[i].e;
    var need = m * 1.2, steps = [6, 10, 15, 20, 30, 40, 50, 65, 80, 100];
    for (var k = 0; k < steps.length; k++) if (steps[k] >= need) return steps[k];
    return 100;
  }

  function svcRows(g) {
    var bad = g.err > 22 ? 2 : g.err > 6 ? 1 : 0;
    return g.sc.svc.map(function (s, i) {
      var st = bad === 2 ? (i >= 2 ? 2 : 1) : bad === 1 ? (i >= 2 ? 1 : 0) : 0;
      if (g.done && !g.runaway) st = 0;
      var cls = st === 2 ? 'st-err' : st === 1 ? 'st-warn' : 'st-ok';
      var txt = st === 2 ? '异常' : st === 1 ? '过载' : '健康';
      return '<div class="svcrow"><span class="nm">' + esc(s.n) + '</span>' +
        '<span class="rl">' + esc(s.r) + '</span>' +
        '<span class="st ' + cls + '">' + txt + '</span></div>';
    }).join('');
  }

  function alertsHTML(g) {
    var list = g.alerts.slice(-14);
    if (!list.length) return '<div style="padding:18px 14px;color:var(--dim);font-size:12.5px">还没有告警。先主动查一下。</div>';
    return list.map(function (a) {
      var k = a.lv === 'P1' ? 'p1' : a.lv === 'P2' ? 'p2' : a.lv === 'P3' ? 'p3' : 'info';
      return '<div class="al ' + k + '"><div class="hd"><span class="lv">' + a.lv + '</span>' +
        '<span class="t">T+' + mmss(a.t) + '</span><span class="svc">' + esc(a.svc) + '</span></div>' +
        '<div class="msg">' + esc(a.msg) + '</div></div>';
    }).join('');
  }

  function tlHTML(g) {
    if (!g.recs.length) return '<div style="color:var(--dim);font-size:12px">你的每一个动作都会记在这里。</div>';
    return g.recs.map(function (r) {
      return '<div class="tl-i ' + r.lv + '"><span class="tt">' + mmss(r.t1) + '</span>' +
        '<span class="tx"><em>' + esc(r.label) + '</em> · ' + esc(r.log) + '</span></div>';
    }).join('');
  }

  function actsHTML(g) {
    var groups = [['diag', '诊断 · 拿信息'], ['stop', '止血 · 降错误率'], ['comm', '沟通 · 拿沟通分']];
    return groups.map(function (grp) {
      var items = g.sc.acts.filter(function (a) { return a.g === grp[0]; });
      var left = items.filter(function (a) { return !g.used[a.id]; }).length;
      return '<div class="agroup"><div class="gh">' + grp[1] + '<u>' + left + '</u></div>' +
        items.map(function (a) {
          var done = g.used[a.id];
          var locked = a.req && !g.flags[a.req];
          var durTxt = a.dur === 0 ? '并行' : a.dur + 's';
          return '<button class="act' + (done ? ' done' : '') + (!done && a.lv === 'bad' ? ' trap' : '') + '" data-act="' + a.id + '">' +
            '<div class="t">' + esc(a.t) + '<span class="dur' + (a.dur === 0 ? ' par' : '') + '">' + durTxt + '</span></div>' +
            '<div class="d">' + esc(a.d) + (locked && !done ? ' · 信息不足' : '') + '</div>' +
            '</button>';
        }).join('') + '</div>';
    }).join('');
  }

  function gameHTML() {
    var g = G, sc = g.sc;
    var errCls = g.err > 20 ? 'bad' : g.err > 5 ? 'warn' : 'ok';
    var prog = clamp(g.t / (bestOf(sc).t * 2.6) * 100, 0, 100);
    var bcol = prog > 75 ? 'var(--red)' : prog > 45 ? 'var(--amber)' : 'var(--green)';
    return '<div class="game">' +
      '<div class="hud"><div class="hud-in">' +
      '<button class="back" id="backHome">← 退出</button>' +
      '<div class="lvname"><i>' + sc.no + '</i>' + esc(sc.name) + '</div>' +
      '<div class="stats">' +
      '<div class="stat"><span>ELAPSED</span><b class="mono">' + mmss(g.t) + '</b></div>' +
      '<div class="stat"><span>错误率</span><b class="' + errCls + '">' + g.err.toFixed(1) + '%</b></div>' +
      '<div class="stat"><span>失败请求</span><b class="' + (g.impact > 60000 ? 'warn' : '') + '">' + num(g.impact) + '</b></div>' +
      '<div class="stat"><span>状态</span><b class="' + (g.done ? 'ok' : 'warn') + '">' + (g.done ? '已止血' : '进行中') + '</b></div>' +
      '</div></div>' +
      '<div class="burnbar"><i style="width:' + prog + '%;background:' + bcol + '"></i></div>' +
      '</div>' +

      '<div class="board">' +

      /* 左：告警 + 服务 */
      '<div class="col">' +
      '<div class="panel grow"><div class="panel-h"><b>告警流</b><span class="r">' + g.alerts.length + ' 条 · 按时间推送</span></div>' +
      '<div class="alerts" id="alertBox">' + alertsHTML(g) + '</div></div>' +
      '<div class="panel"><div class="panel-h"><b>服务健康</b><span class="r">' + g.sc.svc.length + ' 个依赖</span></div>' +
      '<div class="panel-b" style="padding-top:2px;padding-bottom:6px">' + svcRows(g) + '</div></div>' +
      '</div>' +

      /* 中：指标 + 时间轴 */
      '<div class="col">' +
      '<div class="panel"><div class="panel-h"><b>错误率趋势</b><span class="r">实时 · 每段 = 一个动作</span></div>' +
      '<div class="metric"><div class="mt"><span>当前错误率</span>' +
      '<b class="' + errCls + '">' + g.err.toFixed(1) + '<i>%</i></b></div>' +
      '<div class="chartwrap"><span class="ylab t">' + ymaxOf(g) + '%</span>' +
      '<span class="ylab m">' + Math.round(ymaxOf(g) / 2) + '%</span>' +
      '<span class="ylab b">0</span>' + spark(g) + '</div></div></div>' +

      '<div class="panel grow"><div class="panel-h"><b>操作时间轴</b><span class="r">' + g.recs.length + ' 个动作</span></div>' +
      '<div class="tl" id="tlBox">' + tlHTML(g) + '</div></div>' +

      '<div class="panel" style="flex:none;display:block;padding:13px 16px;font-size:12.5px;color:var(--dim);line-height:1.7">' +
      '<b style="color:var(--txt2)">判据</b> · 错误率 <b style="color:var(--green)">1%</b> 以下才算止血成功，盲目操作只会白烧时间。</div>' +
      '</div>' +

      /* 右：动作 */
      '<div class="col"><div class="panel grow"><div class="panel-h"><b>指挥动作</b><span class="r">点一下 = 花掉时间</span></div>' +
      '<div class="actions" id="actBox">' + actsHTML(g) + '</div></div></div>' +
      '</div></div>';
  }

  /* ---------------- 结算 ---------------- */
  function resultHTML() {
    var g = G, sc = g.sc, R = RESULT;
    var b = R.best;
    var gr = R.grade;
    var colMap = { S: 'var(--amber)', A: 'var(--green)', B: 'var(--cyan)', C: 'var(--txt2)', D: 'var(--red)' };
    var col = colMap[gr];

    var rows = [['止血速度', R.speed, 40], ['影响控制', R.imp, 30], ['决策质量', R.dec, 20], ['沟通协作', R.comm, 10]];
    var scoreHTML = rows.map(function (r) {
      var ratio = r[1] / r[2];
      var bc = ratio >= 0.99 ? 'linear-gradient(90deg,#FFB020,#FF8B5E)'
        : ratio >= 0.5 ? 'linear-gradient(90deg,#FF6A3D,#FFB020)'
          : 'linear-gradient(90deg,#FF4D6D,#FF6A3D)';
      return '<div class="sc"><span class="nm">' + r[0] + '</span>' +
        '<span class="bar"><i style="width:' + (ratio * 100) + '%;background:' + bc + '"></i></span>' +
        '<span class="vl">' + r[1] + ' / ' + r[2] + '</span></div>';
    }).join('');

    var comment = makeComment(g, R);
    var lessonHTML = sc.lesson.points.map(function (p) { return '<li>' + p + '</li>'; }).join('');
    var cmp = '<div class="compare">' +
      '<div class="row"><span>止血时间 · 你</span><b>' + mmss(R.mttr) + '</b></div>' +
      '<div class="row"><span>止血时间 · 满分路径</span><b>' + mmss(b.t) + '</b></div>' +
      '<div class="row"><span>失败请求 · 你</span><b>' + num(g.impact) + '</b></div>' +
      '<div class="row"><span>失败请求 · 满分路径</span><b>' + num(b.i) + '</b></div>' +
      '<div class="row"><span>错误决策 / 临时方案</span><b>' + g.trapped + ' / ' + g.temps + '</b></div>' +
      '</div>' +
      '<p style="font-size:11.5px;color:var(--dim);line-height:1.7;margin-top:10px">' +
      '沟通动作是并行的、不占时间，但它值 10 分——不做沟通，最多只能拿 90 分（A）。</p>';

    var recsHTML = g.recs.map(function (r) {
      return '<div class="tl-i ' + r.lv + '"><span class="tt">' + mmss(r.t1) + '</span>' +
        '<span class="tx"><em>' + esc(r.label) + '</em> · ' + esc(r.log) + '</span></div>';
    }).join('');

    var prev = store()[sc.id];
    var isNew = !prev || R.total > prev.total;
    var nextIdx = window.SCENARIOS.findIndex(function (x) { return x.id === sc.id; }) + 1;
    var next = window.SCENARIOS[nextIdx];

    return '<div class="result">' +
      '<div class="rgrade"><div class="big" style="color:' + col + '">' + gr + '</div>' +
      '<div class="txt"><h2>' + gradeTitle(gr) + ' · ' + R.total + ' 分</h2>' +
      '<p>' + esc(comment) + (isNew ? ' <span class="pill" style="vertical-align:2px">新纪录</span>' : '') + '</p></div></div>' +

      '<div class="rstats">' +
      '<div class="s"><span>MTTR</span><b>' + mmss(R.mttr) + '</b></div>' +
      '<div class="s"><span>失败请求</span><b>' + num(g.impact) + '</b></div>' +
      '<div class="s"><span>执行动作</span><b>' + g.recs.length + '<i>个</i></b></div>' +
      '<div class="s"><span>错误决策</span><b>' + g.trapped + '<i>个</i></b></div>' +
      '</div>' +

      cloudHTML() + '<div class="scorelist">' + scoreHTML + '</div>' +

      '<div class="review">' +
      '<div class="rbox"><h4><span class="i">01</span>处置时间轴 · 你做的每一个决定</h4>' +
      '<div class="tl" style="max-height:230px;padding:0">' + recsHTML + '</div></div>' +
      '<div class="rbox"><h4><span class="i">02</span>你和满分路径差在哪</h4>' + cmp +
      '<div style="margin-top:18px" class="pill">最优路径：' +
      sc.bestPath.map(function (id) {
        var a = sc.acts.find(function (x) { return x.id === id; });
        return a ? a.t : id;
      }).join(' → ') + '</div></div>' +
      '</div>' +

      '<div class="rbox" style="margin-bottom:22px"><h4><span class="i">03</span>' + esc(sc.lesson.title) + '</h4>' +
      '<ul>' + lessonHTML + '</ul></div>' +

      '<div class="ractions">' +
      '<button class="btn btn-primary" id="shareCard">生成我的救火战绩卡</button>' +
      '<button class="btn btn-ghost" id="retry">再打一次</button>' +
      (next ? '<button class="btn btn-ghost" id="nextLv">下一关：' + esc(next.name) + '</button>' : '') +
      '<button class="btn btn-ghost" id="backHome">回到首页</button>' +
      '</div></div>';
  }

  function makeComment(g, R) {
    var parts = [];
    if (g.runaway) parts.push('时间耗尽，事故升级——出现这种情况通常是因为一直在做无效动作。');
    else if (R.mttr <= R.best.t * 1.2) parts.push('止血速度接近理论最优，你这套判断很干净。');
    else if (R.mttr <= R.best.t * 1.8) parts.push('止血速度还行，但中间有几秒其实是白花的。');
    else parts.push('花了太多时间在无效动作上——故障期间，犹豫本身就是成本。');

    if (g.trapped >= 3) parts.push('而且你踩了 ' + g.trapped + ' 个陷阱动作，其中有的让故障更严重了。');
    else if (g.trapped === 0) parts.push('全程没有一个错误决策，这在真实 oncall 里非常难得。');
    else parts.push('有 ' + g.trapped + ' 个错误决策，好在没把故障放大。');

    if (commCount(g) >= 2) parts.push('沟通也没落下。');
    else parts.push('沟通分基本空着——真实事故里，同步信息往往比修代码更重要。');
    return parts.join('');
  }

  /* ---------------- 战绩卡（Canvas） ---------------- */
  function makeCard() {
    var g = G, sc = g.sc, R = RESULT;
    var W = 1080, H = 1350;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    var colMap = { S: '#FFB020', A: '#2FD27D', B: '#45C8F1', C: '#A9BACC', D: '#FF4D6D' };
    var col = colMap[R.grade];
    var P = 84, CW = W - P * 2;

    /* 背景 */
    x.fillStyle = '#070B10'; x.fillRect(0, 0, W, H);
    var grd = x.createRadialGradient(840, 100, 0, 840, 100, 760);
    grd.addColorStop(0, 'rgba(255,106,61,.22)'); grd.addColorStop(1, 'rgba(255,106,61,0)');
    x.fillStyle = grd; x.fillRect(0, 0, W, H);
    var grd2 = x.createRadialGradient(100, 1180, 0, 100, 1180, 660);
    grd2.addColorStop(0, 'rgba(69,200,241,.13)'); grd2.addColorStop(1, 'rgba(69,200,241,0)');
    x.fillStyle = grd2; x.fillRect(0, 0, W, H);

    /* 网格 */
    x.strokeStyle = 'rgba(150,180,220,.055)'; x.lineWidth = 1;
    for (var i = 0; i <= W; i += 54) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
    for (var j = 0; j <= H; j += 54) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }

    x.textBaseline = 'top'; x.textAlign = 'left';

    /* 顶栏 */
    x.font = '600 25px ui-monospace, Menlo, Consolas, monospace';
    x.fillStyle = '#FF6A3D'; x.fillText('ONCALL  ·  03:00 AM', P, 84);
    x.textAlign = 'right'; x.fillStyle = '#63788E';
    x.fillText('INCIDENT REPORT', W - P, 84); x.textAlign = 'left';

    x.fillStyle = '#E7EEF7';
    x.font = '800 66px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    x.fillText('我的救火战绩', P, 138);

    /* 等级环 */
    var cx = W - P - 118, cy = 330, rr = 108;
    x.beginPath(); x.arc(cx, cy, rr, 0, Math.PI * 2);
    x.strokeStyle = 'rgba(150,180,220,.15)'; x.lineWidth = 3; x.stroke();
    x.beginPath(); x.arc(cx, cy, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(R.total / 100, 0.02, 1));
    x.strokeStyle = col; x.lineWidth = 10; x.lineCap = 'round'; x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = col; x.font = '800 112px ui-monospace, Menlo, monospace';
    x.fillText(R.grade, cx, cy + 4);
    x.textBaseline = 'top'; x.textAlign = 'left';

    /* 关卡 */
    x.font = '600 22px ui-monospace, Menlo, monospace'; x.fillStyle = '#63788E';
    x.fillText('INCIDENT ' + sc.no + '  ·  ' + sc.diff, P, 252);
    x.fillStyle = '#E7EEF7'; x.font = '800 56px -apple-system, "PingFang SC", sans-serif';
    x.fillText(sc.name, P, 290);
    x.fillStyle = '#A9BACC'; x.font = '400 26px -apple-system, "PingFang SC", sans-serif';
    x.fillText(sc.sub, P, 364);
    x.fillStyle = '#FF6A3D'; x.font = '700 30px ui-monospace, Menlo, monospace';
    x.fillText(R.total + ' 分', P, 408);

    /* 四格数据 */
    var stats = [
      ['MTTR', mmss(R.mttr)],
      ['失败请求', num(g.impact)],
      ['执行动作', g.recs.length + ''],
      ['错误决策', g.trapped + '']
    ];
    var sy = 476, gap = 16, cw = (CW - gap * 3) / 4, ch = 136;
    stats.forEach(function (s, k) {
      var bx = P + k * (cw + gap);
      x.fillStyle = 'rgba(15,23,33,.9)';
      roundRect(x, bx, sy, cw, ch, 16); x.fill();
      x.strokeStyle = 'rgba(150,180,220,.15)'; x.lineWidth = 1.5; x.stroke();
      x.fillStyle = '#63788E'; x.font = '500 17px ui-monospace, monospace';
      x.fillText(s[0], bx + 20, sy + 22);
      x.fillStyle = k === 3 && g.trapped > 0 ? '#FF4D6D' : '#E7EEF7';
      x.font = '700 40px ui-monospace, monospace';
      x.fillText(s[1], bx + 20, sy + 62);
    });

    /* 四维得分 */
    var dims = [['止血速度', R.speed, 40], ['影响控制', R.imp, 30], ['决策质量', R.dec, 20], ['沟通协作', R.comm, 10]];
    var dy = 662;
    dims.forEach(function (d, k) {
      var yy = dy + k * 52;
      x.fillStyle = '#8A9CB2'; x.font = '400 22px -apple-system, "PingFang SC", sans-serif';
      x.fillText(d[0], P, yy - 4);
      var bx = P + 150, bw2 = CW - 150 - 92;
      x.fillStyle = 'rgba(150,180,220,.13)';
      roundRect(x, bx, yy, bw2, 9, 5); x.fill();
      var ratio = d[1] / d[2];
      if (ratio > 0.01) {
        x.fillStyle = ratio >= 0.99 ? '#FFB020' : ratio >= 0.7 ? '#FF6A3D' : '#FF4D6D';
        roundRect(x, bx, yy, Math.max(bw2 * ratio, 9), 9, 5); x.fill();
      }
      x.fillStyle = '#E7EEF7'; x.font = '600 21px ui-monospace, monospace';
      x.textAlign = 'right'; x.fillText(d[1] + '/' + d[2], W - P, yy - 4); x.textAlign = 'left';
    });

    /* 点评 */
    var cy2 = 905;
    x.fillStyle = 'rgba(255,106,61,.09)';
    roundRect(x, P, cy2, CW, 208, 18); x.fill();
    x.strokeStyle = 'rgba(255,106,61,.30)'; x.lineWidth = 1.5; x.stroke();
    x.fillStyle = '#FF6A3D'; x.font = '600 19px ui-monospace, monospace';
    x.fillText('复盘点评', P + 30, cy2 + 24);
    x.fillStyle = '#D5E0EC'; x.font = '400 27px -apple-system, "PingFang SC", sans-serif';
    wrap(x, makeComment(g, R), P + 30, cy2 + 62, CW - 60, 42, 4);

    /* 底栏 */
    var fy = H - 128;
    x.fillStyle = 'rgba(150,180,220,.15)'; x.fillRect(P, fy - 30, CW, 1);
    x.fillStyle = '#E7EEF7'; x.font = '700 26px -apple-system, "PingFang SC", sans-serif';
    x.fillText('凌晨三点 · Oncall 指挥台', P, fy);
    x.fillStyle = '#5C7086'; x.font = '400 20px ui-monospace, monospace';
    x.fillText('你花的每一秒，都是用户的失败请求', P, fy + 44);
    x.textAlign = 'right';
    x.fillStyle = '#FF6A3D'; x.font = '600 20px ui-monospace, monospace';
    x.fillText('#凌晨三点  #故障演练', W - P, fy + 44);
    x.textAlign = 'left';

    return c;
  }
  function roundRect(x, a, b, w, h, r) {
    x.beginPath();
    x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r);
    x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r);
    x.arcTo(a, b, a + w, b, r); x.closePath();
  }
  function wrap(x, text, px, py, maxW, lh, maxLines) {
    var chars = String(text).split('');
    var line = '', lines = [];
    for (var i = 0; i < chars.length; i++) {
      var test = line + chars[i];
      if (x.measureText(test).width > maxW && line) { lines.push(line); line = chars[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] += '…'; }
    lines.forEach(function (l, k) { x.fillText(l, px, py + k * lh); });
  }

  /* ---------------- 分享 ---------------- */
  function showShare() {
    var c = makeCard();
    var url = c.toDataURL('image/png');
    var g = G, R = RESULT;
    var text = '我在《凌晨三点 · Oncall 指挥台》里，用 ' + mmss(R.mttr) + ' 把「' + g.sc.name + '」救了回来，评级 ' + R.grade + '。\n' +
      '这个作品最扎心的地方是：你每点一个动作，时间就往前走，而每一秒都在变成用户的失败请求。\n' +
      '#凌晨三点 #故障演练';

    var o = el('<div class="overlay" id="ovShare"><div class="sheet" style="width:min(560px,100%)">' +
      '<div class="k">SHARE CARD</div>' +
      '<h2>你的救火战绩卡</h2>' +
      '<p class="st">3:4 比例，直接发小红书 / 朋友圈都合适</p>' +
      '<img class="shareimg" src="' + url + '" alt="战绩卡">' +
      '<div class="sharetxt" id="shareTxt">' + esc(text) + '</div>' +
      '<div class="acts">' +
      '<button class="btn btn-ghost" id="cpTxt">复制文案</button>' +
      '<button class="btn btn-primary" id="dlCard">保存战绩卡</button>' +
      '</div></div></div>');
    document.body.appendChild(o);
    o.onclick = function (e) { if (e.target === o) o.remove(); };

    o.querySelector('#dlCard').onclick = function () {
      var a = document.createElement('a');
      a.download = 'oncall-' + g.sc.id + '-' + R.grade + '.png';
      a.href = url; a.click();
      toast('战绩卡已保存。');
    };
    o.querySelector('#cpTxt').onclick = function () {
      var t = text;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { toast('文案已复制，直接粘贴即可'); })
          .catch(function () { fallbackCopy(t); });
      } else fallbackCopy(t);
    };
  }
  function fallbackCopy(t) {
    var ta = document.createElement('textarea');
    ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('文案已复制'); } catch (e) { toast('复制失败，请手动选择文本'); }
    ta.remove();
  }

  /* ---------------- 渲染 & 事件 ---------------- */
  function render() {
    if (view === 'home') {
      app.innerHTML = heroHTML();
      app.querySelectorAll('.lv').forEach(function (b) {
        b.onclick = function () { openBrief(b.dataset.lv); };
      });
      document.getElementById('go').onclick = function () { openBrief(window.SCENARIOS[0].id); };
      document.getElementById('howBtn').onclick = showHow;
    } else if (view === 'game') {
      app.innerHTML = gameHTML();
      var ab = document.getElementById('alertBox');
      if (ab) ab.scrollTop = ab.scrollHeight;
      var tb = document.getElementById('tlBox');
      if (tb) tb.scrollTop = tb.scrollHeight;
      bindGame();
      if (BRIEF) { app.appendChild(el(briefHTML(G.sc))); bindBrief(); }
    } else if (view === 'result') {
      app.innerHTML = resultHTML();
      bindResult();
    }
  }

  function showHow() {
    var o = el('<div class="overlay" id="ov"><div class="sheet">' +
      '<div class="k">HOW TO PLAY</div><h2>三句话学会</h2>' +
      '<p class="st">不用读文档，进关卡点两下就懂了</p>' +
      '<div class="rulebox" style="margin-top:20px"><b>1 · 时间只在你操作时前进</b>' +
      '<ul><li>点一个动作，时间就往前走它标示的秒数。诊断 35 秒、回滚 45 秒、扩容 90 秒。</li>' +
      '<li>这几十秒里，故障一直在产生失败请求，实时累加在顶部。</li>' +
      '<li>只有沟通类动作是「并行」的——不占时间，但能拿 10 分沟通分。</li></ul></div>' +
      '<div class="rulebox"><b>2 · 诊断决定你能不能找对位置</b>' +
      '<ul><li>有些止血动作需要先拿到关键信息才有效——信息不足时点下去，可能白花时间。</li>' +
      '<li>但也不是查得越多越好：每查一项，都在烧用户的时间。</li></ul></div>' +
      '<div class="rulebox"><b>3 · 结算看四个维度</b>' +
      '<ul><li>止血速度 40 分 · 影响控制 30 分 · 决策质量 20 分 · 沟通协作 10 分。</li>' +
      '<li>评级 S / A / B / C / D，通关后可以生成战绩卡。</li></ul></div>' +
      '<div class="acts"><button class="btn btn-primary" id="closeHow">明白了</button></div>' +
      '</div></div>');
    document.body.appendChild(o);
    o.querySelector('#closeHow').onclick = function () { o.remove(); };
    o.onclick = function (e) { if (e.target === o) o.remove(); };
  }

  function openBrief(id) {
    var sc = window.SCENARIOS.find(function (s) { return s.id === id; });
    if (!sc) return;
    G = newGame(sc); RESULT = null; view = 'game'; BRIEF = true; render();
  }

  function bindBrief() {
    var ov = document.getElementById('ov');
    if (!ov) return;
    ov.querySelector('#cancelB').onclick = function () { BRIEF = null; view = 'home'; render(); };
    ov.querySelector('#startB').onclick = function () { BRIEF = null; render(); };
  }

  function bindGame() {
    document.getElementById('backHome').onclick = function () {
      if (G && !G.done && G.recs.length && !confirm('离开这一局？当前进度不会保存。')) return;
      BRIEF = null; view = 'home'; render();
    };
    document.querySelectorAll('[data-act]').forEach(function (b) {
      b.onclick = function () {
        var r = act(G, b.dataset.act);
        if (!r) return;
        if (G.done) { finish(); return; }
        render();
        toast(r.label + ' · ' + r.log);
      };
    });
  }

  async function saveCompleted(item) {
    cloudStatus = 'saving';
    if (G === item.game && view === 'result') render();
    try {
      var confirmed = await saveScore(item.scenario, item.record);
      Object.keys(confirmed).forEach(function (id) {
        if (!scoreCache[id] || confirmed[id].total >= scoreCache[id].total) scoreCache[id] = confirmed[id];
      });
      if (G === item.game) { cloudStatus = 'saved'; pendingScore = null; }
    } catch (error) { if (G === item.game) cloudStatus = 'error'; }
    if (G === item.game && view === 'result') render();
  }

  function cloudHTML() {
    var text = cloudStatus === 'saving' ? '正在保存云端成绩…' :
      cloudStatus === 'saved' ? '最高成绩已同步至 Tiana 云数据库' : '云端成绩未能确认保存，请检查连接后重新保存。';
    return '<div class="panel" role="status" style="padding:12px 16px;margin-bottom:16px;color:var(--txt2)">' + text +
      (cloudStatus === 'error' ? ' <button class="btn btn-ghost" id="retrySave">重新保存成绩</button>' : '') + '</div>';
  }

  function finish() {
    RESULT = scoreOf(G);
    pendingScore = {game: G, scenario: G.sc.id, record: {total: RESULT.total, grade: RESULT.grade,
      mttr: RESULT.mttr, impact: Math.round(G.impact), ts: Date.now()}};
    view = 'result'; cloudStatus = 'saving'; render();
    window.scrollTo(0, 0);
    saveCompleted(pendingScore);
  }

  function bindResult() {
    var saveButton = document.getElementById('retrySave');
    if (saveButton) saveButton.onclick = function () { if (pendingScore) saveCompleted(pendingScore); };
    document.getElementById('retry').onclick = function () { openBrief(G.sc.id); };
    var nx = document.getElementById('nextLv');
    if (nx) nx.onclick = function () {
      var i = window.SCENARIOS.findIndex(function (x) { return x.id === G.sc.id; });
      openBrief(window.SCENARIOS[i + 1].id);
    };
    document.getElementById('backHome').onclick = function () { view = 'home'; render(); };
    document.getElementById('shareCard').onclick = function () { showShare(); };
  }

  /* 启动 */
  render();
}
