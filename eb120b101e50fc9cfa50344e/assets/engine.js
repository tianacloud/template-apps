/*!
 * Decline Doctor · engine.js
 * 递减诊断计算引擎（纯函数，零依赖）
 *
 * 三块核心：
 *   1. parseCSV / aggregateMonthly —— 日度生产数据 -> 月度聚合
 *   2. fitArps                     —— Arps 递减方程三型拟合，网格 + 线性化闭式解
 *   3. decompose                   —— 产量变化 LMDI 因素分解，各分量严格可加
 *
 * 浏览器直接 <script src> 引入挂到 window.DD；Node 下 module.exports 可单测。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DD = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var EPS = 1e-9;
  var DAYS_PER_MONTH = 30.4375; // 365.25 / 12

  /* ------------------------------------------------------------------ *
   * 通用工具
   * ------------------------------------------------------------------ */

  function num(v) {
    if (v === null || v === undefined) return NaN;
    var s = String(v).trim().replace(/,/g, '');
    if (s === '' || s === '-' || s === '—' || s === 'NA' || s === 'N/A') return NaN;
    var n = Number(s);
    return isFinite(n) ? n : NaN;
  }

  function sum(arr) {
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s;
  }

  function mean(arr) {
    return arr.length ? sum(arr) / arr.length : 0;
  }

  function round(v, d) {
    var p = Math.pow(10, d === undefined ? 2 : d);
    return Math.round(v * p) / p;
  }

  // 安全对数：<=0 时夹到 EPS，返回 [值, 是否被夹]
  function safeLog(x) {
    if (!isFinite(x)) return [0, true];
    if (x <= EPS) return [Math.log(EPS), true];
    return [Math.log(x), false];
  }

  /* ------------------------------------------------------------------ *
   * 1. CSV 解析
   * ------------------------------------------------------------------ */

  var HEADER_ALIASES = {
    date:     ['date', '日期', '生产日期', 'time', 'ym', '月份'],
    well:     ['well_id', 'well', 'wellname', '井号', '井名', '井'],
    oil:      ['oil', '日产油', '产油量', 'qo', 'oil_rate', '日产油量'],
    liquid:   ['liquid', '日产液', '产液量', 'ql', 'liquid_rate', '日产液量'],
    waterCut: ['water_cut', '含水', '含水率', 'fw', 'watercut', '含水%'],
    waterInj: ['water_inj', '日注水', '注水量', '注水', 'wi', 'water_injection'],
    openDays: ['open_days', '开井天数', '生产天数', 'opendays', '开井日'],
    measure:  ['measure', '措施', '措施标记', 'measure_flag', '措施类型']
  };

  // 兼容 2026-03-05 / 2026/3/5 / 20260305 / 2026-03
  function parseDate(s) {
    var t = String(s).trim();
    var m = t.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?/);
    if (m) {
      return { y: +m[1], m: +m[2], d: m[3] ? +m[3] : 1 };
    }
    m = t.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m) return { y: +m[1], m: +m[2], d: +m[3] };
    return null;
  }

  function ymOf(dt) {
    return dt.y * 100 + dt.m;
  }

  function ymLabel(ym) {
    var y = Math.floor(ym / 100), m = ym % 100;
    return y + '-' + (m < 10 ? '0' + m : m);
  }

  /**
   * 解析 CSV 文本。自动识别分隔符与表头别名。
   * @returns {{rows: Array, warnings: Array<string>, columns: Object}}
   */
  function parseCSV(text) {
    var warnings = [];
    var raw = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
    if (!raw) return { rows: [], warnings: ['文件为空'], columns: {} };

    var firstLine = raw.split('\n')[0];
    var delim = ',';
    if (firstLine.indexOf('\t') >= 0) delim = '\t';
    else if (firstLine.split(',').length < 2 && firstLine.indexOf(';') >= 0) delim = ';';

    var lines = raw.split('\n').filter(function (l) { return l.trim() !== ''; });
    var header = lines[0].split(delim).map(function (h) {
      return h.trim().toLowerCase().replace(/^["']|["']$/g, '');
    });

    // 表头 -> 标准字段
    var map = {};
    Object.keys(HEADER_ALIASES).forEach(function (key) {
      var aliases = HEADER_ALIASES[key];
      for (var i = 0; i < header.length; i++) {
        if (aliases.indexOf(header[i]) >= 0) { map[key] = i; break; }
      }
    });

    // 没有表头时按位置兜底
    var hasHeader = map.date !== undefined && map.well !== undefined;
    if (!hasHeader) {
      map = { date: 0, well: 1, oil: 2, liquid: 3, waterCut: 4, waterInj: 5, openDays: 6, measure: 7 };
      warnings.push('未识别到表头，已按「日期,井号,日产油,日产液,含水,注水,开井天数,措施」位置解析。');
      lines.unshift('__skip__');
    }

    var rows = [];
    var badDate = 0, badNum = 0, noWell = 0;

    for (var li = 1; li < lines.length; li++) {
      var cells = lines[li].split(delim);
      if (cells.length < 3) continue;

      var dt = parseDate(cells[map.date] || '');
      if (!dt) { badDate++; continue; }

      var well = String(cells[map.well] || '').trim().replace(/^["']|["']$/g, '');
      if (!well) { noWell++; continue; }

      var oil = map.oil !== undefined ? num(cells[map.oil]) : NaN;
      var liquid = map.liquid !== undefined ? num(cells[map.liquid]) : NaN;
      var fw = map.waterCut !== undefined ? num(cells[map.waterCut]) : NaN;
      var wi = map.waterInj !== undefined ? num(cells[map.waterInj]) : NaN;
      var od = map.openDays !== undefined ? num(cells[map.openDays]) : NaN;
      var msRaw = map.measure !== undefined ? String(cells[map.measure] || '').trim() : '';

      // 缺产油有产液+含水时反算
      if (!isFinite(oil) && isFinite(liquid) && isFinite(fw)) {
        var f = fw > 1 ? fw / 100 : fw;
        oil = liquid * (1 - f);
      }
      if (!isFinite(oil)) { badNum++; continue; }

      // 含水归一化到 0~1
      var fwN = isFinite(fw) ? (fw > 1 ? fw / 100 : fw) : NaN;
      fwN = isFinite(fwN) ? Math.min(1, Math.max(0, fwN)) : NaN;

      if (!isFinite(liquid)) {
        liquid = fwN >= 0 && fwN < 1 ? oil / (1 - fwN) : oil;
      }

      var measureStr = msRaw.replace(/^["']|["']$/g, '');
      var isMeasure = measureStr !== '' && measureStr !== '0' && measureStr.toLowerCase() !== 'false'
        && measureStr.toLowerCase() !== '否' && measureStr.toLowerCase() !== '无';

      rows.push({
        ym: ymOf(dt),
        day: dt.d,
        well: well,
        oil: Math.max(0, oil),
        liquid: Math.max(0, liquid),
        waterCut: fwN,
        waterInj: isFinite(wi) ? Math.max(0, wi) : 0,
        openDays: isFinite(od) ? Math.max(0, od) : (oil > 0 ? 1 : 0),
        measure: isMeasure,
        measureLabel: measureStr
      });
    }

    if (badDate) warnings.push(badDate + ' 行日期无法识别，已跳过。');
    if (noWell) warnings.push(noWell + ' 行缺少井号，已跳过。');
    if (badNum) warnings.push(badNum + ' 行既无产油量也无法由液量+含水反算，已跳过。');
    if (!rows.length) warnings.push('没有解析出有效数据行，请检查列名与格式。');

    return { rows: rows, warnings: warnings, columns: map, delimiter: delim };
  }

  /* ------------------------------------------------------------------ *
   * 2. 月度聚合
   * ------------------------------------------------------------------ */

  function daysInMonth(ym) {
    var y = Math.floor(ym / 100), m = ym % 100;
    return new Date(y, m, 0).getDate();
  }

  /**
   * 日度 -> 月度。每口井每月一条。
   * 月均日产按「记录覆盖天数」折算，缺数据月份不会被虚高；不足当月 70% 天数的月份打质量标记。
   */
  function aggregateMonthly(dailyRows) {
    var byWellMonth = {};
    dailyRows.forEach(function (r) {
      var k = r.well + '|' + r.ym;
      if (!byWellMonth[k]) {
        byWellMonth[k] = { well: r.well, ym: r.ym, n: 0, oil: 0, liquid: 0, inj: 0, open: 0, measure: false, measureLabel: '' };
      }
      var a = byWellMonth[k];
      a.n += 1;
      a.oil += r.oil;
      a.liquid += r.liquid;
      a.inj += r.waterInj;
      a.open += r.openDays || (r.oil > 0 ? 1 : 0);
      if (r.measure) { a.measure = true; a.measureLabel = r.measureLabel || '措施'; }
    });

    var out = [];
    Object.keys(byWellMonth).forEach(function (k) {
      var a = byWellMonth[k];
      var dim = daysInMonth(a.ym);
      var denom = Math.min(dim, Math.max(1, a.n));
      var cov = a.n / dim;

      var oilRate = a.oil / denom;
      var liqRate = a.liquid / denom;
      // 含水按液量守恒反算，比直接平均更准
      var fw = a.liquid > EPS ? Math.min(1, Math.max(0, 1 - a.oil / a.liquid)) : 0;
      var timeRate = Math.min(1, (a.open || 0) / denom);

      out.push({
        well: a.well,
        ym: a.ym,
        label: ymLabel(a.ym),
        oilRate: oilRate,
        liquidRate: liqRate,
        waterCut: fw,
        waterInjRate: a.inj / denom,
        timeRate: timeRate,
        openDays: a.open || 0,
        daysInMonth: denom,
        coverage: cov,
        lowQuality: cov < 0.7,
        measure: a.measure,
        measureLabel: a.measureLabel
      });
    });

    out.sort(function (x, y) {
      return x.ym - y.ym || (x.well < y.well ? -1 : x.well > y.well ? 1 : 0);
    });
    return out;
  }

  /** 月度记录 -> 全油田按月汇总序列 */
  function monthlyTotal(monthly) {
    var by = {};
    monthly.forEach(function (r) {
      if (!by[r.ym]) by[r.ym] = { ym: r.ym, label: r.label, oil: 0, liquid: 0, inj: 0, open: 0, dim: 0, wells: 0, lowQuality: 0 };
      var t = by[r.ym];
      t.oil += r.oilRate;
      t.liquid += r.liquidRate;
      t.inj += r.waterInjRate;
      t.open += r.openDays;
      t.dim += r.daysInMonth;
      t.wells += 1;
      if (r.lowQuality) t.lowQuality += 1;
    });

    var list = Object.keys(by).map(function (k) { return by[k]; });
    list.sort(function (a, b) { return a.ym - b.ym; });
    list.forEach(function (t) {
      t.waterCut = t.liquid > EPS ? Math.min(1, Math.max(0, 1 - t.oil / t.liquid)) : 0;
      // 注采比：注水量 / 产液量（地下体积系数此处取 1，仅作趋势参考，报告中已注明）
      t.injectionRatio = t.liquid > EPS ? t.inj / t.liquid : 0;
      // 时率：开井日合计 / (井数 × 月天数)
      t.avgTimeRate = t.dim > EPS ? Math.min(1, t.open / t.dim) : 0;
      t.wellCount = t.wells;
    });
    return list;
  }

  /* ------------------------------------------------------------------ *
   * 3. Arps 递减拟合
   * ------------------------------------------------------------------ */

  function arpsQ(t, qi, Di, b) {
    if (b <= EPS) return qi * Math.exp(-Di * t);
    var base = 1 + b * Di * t;
    if (base <= 0) return 0;
    return qi * Math.pow(base, -1 / b);
  }

  function sseOf(pts, qi, Di, b) {
    var s = 0;
    for (var i = 0; i < pts.length; i++) {
      var d = pts[i].q - arpsQ(pts[i].t, qi, Di, b);
      s += d * d;
    }
    return s;
  }

  /** 给定 b，用线性化求初值：q^-b = qi^-b (1 + b·Di·t)  =>  y = A + B·x */
  function solveLinear(pts, b) {
    var n = pts.length;
    if (n < 3) return null;
    var sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (var i = 0; i < n; i++) {
      var y = Math.pow(Math.max(pts[i].q, EPS), -b);
      var x = pts[i].t;
      sx += x; sy += y; sxx += x * x; sxy += x * y;
    }
    var den = n * sxx - sx * sx;
    if (Math.abs(den) < EPS) return null;
    var B = (n * sxy - sx * sy) / den;
    var A = (sy - B * sx) / n;
    if (A <= EPS || B < 0) return null;
    var qi = Math.pow(A, -1 / b);
    var Di = B / (A * b);
    if (!isFinite(qi) || !isFinite(Di) || qi <= 0 || Di < 0) return null;
    return { qi: qi, Di: Di };
  }

  function solveExp(pts) {
    var n = pts.length;
    if (n < 3) return null;
    var sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (var i = 0; i < n; i++) {
      var y = Math.log(Math.max(pts[i].q, EPS));
      var x = pts[i].t;
      sx += x; sy += y; sxx += x * x; sxy += x * y;
    }
    var den = n * sxx - sx * sx;
    if (Math.abs(den) < EPS) return null;
    var B = (n * sxy - sx * sy) / den;
    var A = (sy - B * sx) / n;
    var Di = -B;
    var qi = Math.exp(A);
    if (!isFinite(qi) || !isFinite(Di) || qi <= 0 || Di <= 0) return null;
    return { qi: qi, Di: Di };
  }

  function r2Of(pts, qi, Di, b) {
    var m = mean(pts.map(function (p) { return p.q; }));
    var sst = 0, sse = 0;
    for (var i = 0; i < pts.length; i++) {
      var d = pts[i].q - m; sst += d * d;
      var e = pts[i].q - arpsQ(pts[i].t, qi, Di, b); sse += e * e;
    }
    if (sst < EPS) return 0;
    return Math.max(0, 1 - sse / sst);
  }

  function declineTypeName(b) {
    if (b < 0.05) return '指数递减';
    if (b < 0.4) return '双曲递减（低 b）';
    if (b < 0.85) return '双曲递减';
    if (b < 0.98) return '双曲递减（近调和）';
    return '调和递减';
  }

  function declineTypeCode(b) {
    if (b < 0.05) return 'exp';
    if (b < 0.98) return 'hyp';
    return 'harm';
  }

  /**
   * Arps 拟合。
   * @param {Array<{t:number,q:number}>} pts t 以「月」为步长，从 0 开始
   * @returns {Object|null}
   */
  function fitArps(pts) {
    var clean = pts.filter(function (p) { return isFinite(p.q) && p.q > 0 && isFinite(p.t); });
    if (clean.length < 4) return null;

    var best = null;

    // 指数型（b=0）
    var expSol = solveExp(clean);
    if (expSol) {
      var r2e = r2Of(clean, expSol.qi, expSol.Di, 0);
      best = { b: 0, qi: expSol.qi, Di: expSol.Di, r2: r2e, sse: sseOf(clean, expSol.qi, expSol.Di, 0) };
    }

    // 双曲型网格（b: 0.01 -> 0.99）
    for (var bi = 1; bi <= 99; bi++) {
      var b = bi / 100;
      var sol = solveLinear(clean, b);
      if (!sol) continue;
      var s = sseOf(clean, sol.qi, sol.Di, b);
      if (!best || s < best.sse) {
        best = { b: b, qi: sol.qi, Di: sol.Di, r2: r2Of(clean, sol.qi, sol.Di, b), sse: s };
      }
    }

    if (!best) return null;

    // 局部精修：在最优 b 邻域细化，并对 Di 做缩放搜索（线性化解在 q 空间未必最优）
    var lo = Math.max(0.001, best.b - 0.02), hi = Math.min(0.999, best.b + 0.02);
    for (var step = 0.001, bv = lo; bv <= hi + EPS; bv += step) {
      var s2 = solveLinear(clean, bv);
      if (!s2) continue;
      for (var k = 0.6; k <= 1.4001; k += 0.05) {
        var qi2 = s2.qi, Di2 = s2.Di * k;
        var ss = sseOf(clean, qi2, Di2, bv);
        if (ss < best.sse) {
          best = { b: bv, qi: qi2, Di: Di2, r2: r2Of(clean, qi2, Di2, bv), sse: ss };
        }
      }
    }

    var bFin = best.b;
    var tLast = clean[clean.length - 1].t;
    var qNow = arpsQ(tLast, best.qi, best.Di, bFin);
    var qNext12 = arpsQ(tLast + 12, best.qi, best.Di, bFin);

    return {
      b: round(bFin, 4),
      qi: round(best.qi, 4),
      Di: round(best.Di, 6),
      DiMonthly: round(best.Di, 6),
      r2: round(best.r2, 4),
      type: declineTypeName(bFin),
      typeCode: declineTypeCode(bFin),
      // 曲线末端所在的 t：数据中存在 0 产量月份时，点数不等于末端索引
      tLast: tLast,
      qNow: round(qNow, 3),
      // 年递减率：未来 12 个月相对当前产量的降幅
      annualDecline: qNow > EPS ? round((1 - qNext12 / qNow) * 100, 2) : 0,
      monthlyDecline: qNow > EPS ? round((1 - arpsQ(tLast + 1, best.qi, best.Di, bFin) / qNow) * 100, 2) : 0,
      points: clean.length,
      predict: function (tAbs) { return arpsQ(tAbs, best.qi, best.Di, bFin); }
    };
  }

  /** Arps 累积产量解析积分（t 单位：月，返回：吨） */
  function arpsCumulative(t1, t2, qi, Di, b) {
    function integ(t) {
      if (t <= 0) return 0;
      if (b <= EPS) return (qi / Di) * (1 - Math.exp(-Di * t));
      if (Math.abs(b - 1) < 1e-6) return (qi / Di) * Math.log(1 + Di * t);
      return (Math.pow(qi, b) / (Di * (1 - b))) * (Math.pow(qi, 1 - b) - Math.pow(arpsQ(t, qi, Di, b), 1 - b));
    }
    var months = integ(t2) - integ(t1);
    return months * DAYS_PER_MONTH; // t/d · 月 -> 吨
  }

  /**
   * 预测到经济极限，返回 EUR 与年限。
   */
  function forecastEur(fit, opts) {
    opts = opts || {};
    var qLimit = opts.qLimit || 0.5;       // t/d 经济极限
    var maxMonths = opts.maxMonths || 600; // 50 年上限
    if (!fit || fit.qNow <= qLimit) {
      return { eur: 0, months: 0, qLimit: qLimit, reached: true, note: '当前产量已低于经济极限' };
    }
    var tNow = fit.tLast !== undefined ? fit.tLast : fit.points - 1;
    var tHit = maxMonths;
    var lo = 0, hi = maxMonths;
    for (var i = 0; i < 60; i++) { // 二分
      var mid = (lo + hi) / 2;
      if (fit.predict(tNow + mid) > qLimit) lo = mid; else hi = mid;
    }
    tHit = hi;
    var cum = arpsCumulative(tNow, tNow + tHit, fit.qi, fit.Di, fit.b);
    return {
      eur: round(cum, 0),
      months: round(tHit, 0),
      years: round(tHit / 12, 1),
      qLimit: qLimit,
      reached: tHit < maxMonths
    };
  }

  /* ------------------------------------------------------------------ *
   * 3.5 老井自然递减序列
   *
   * 递减管理有两个标准口径：
   *   综合递减率 —— 总产量口径，含新井与措施，能反映「今年产量掉多少」
   *   自然递减率 —— 只取连续生产且无措施的老井，才能反演地层的真实递减
   *
   * 直接拿总产量拟合 Arps 会被措施与投产跳变带偏，所以这里单独构造老井序列。
   * ------------------------------------------------------------------ */

  /**
   * @param {Array} monthly aggregateMonthly 结果
   * @returns {{series: Array, wells: Array<string>, excluded: Array}}
   */
  function naturalSeries(monthly) {
    var byWell = {};
    monthly.forEach(function (r) {
      if (!byWell[r.well]) byWell[r.well] = [];
      byWell[r.well].push(r);
    });

    var allYm = Array.from(new Set(monthly.map(function (r) { return r.ym; }))).sort(function (a, b) { return a - b; });
    if (!allYm.length) return { series: [], wells: [], excluded: [] };
    var firstYm = allYm[0];

    var oldWells = [], excluded = [];
    Object.keys(byWell).forEach(function (w) {
      var rows = byWell[w];
      var months = new Set(rows.map(function (r) { return r.ym; }));
      var hasMeasure = rows.some(function (r) { return r.measure; });
      var startsAtFirst = Math.min.apply(null, rows.map(function (r) { return r.ym; })) === firstYm;
      var fullRun = months.size === allYm.length;

      if (startsAtFirst && !hasMeasure && fullRun) oldWells.push(w);
      else excluded.push({
        well: w,
        reason: hasMeasure ? '有措施作业' : (!startsAtFirst ? '期内投产' : '数据不连续')
      });
    });

    // 逐月汇总老井
    var series = allYm.map(function (ym) {
      var rows = monthly.filter(function (r) { return r.ym === ym && oldWells.indexOf(r.well) >= 0; });
      var oil = 0, liquid = 0, open = 0, dim = 0;
      rows.forEach(function (r) {
        oil += r.oilRate;
        liquid += r.liquidRate;
        open += r.openDays;
        dim += r.daysInMonth;
      });
      return {
        ym: ym,
        label: ymLabel(ym),
        oil: oil,
        liquid: liquid,
        waterCut: liquid > EPS ? Math.min(1, Math.max(0, 1 - oil / liquid)) : 0,
        avgTimeRate: dim > EPS ? Math.min(1, open / dim) : 0,
        wells: rows.length
      };
    });

    return { series: series, wells: oldWells, excluded: excluded };
  }

  /* ------------------------------------------------------------------ *
   * 4. LMDI 因素分解
   * ------------------------------------------------------------------ */

  /** LMDI 单因子分量：L(q2,q1) · ln(f2/f1) */
  function lmdiTerm(q1, q2, f1, f2) {
    if (Math.abs(q2 - q1) < EPS) return 0;
    var L;
    if (q1 <= EPS || q2 <= EPS) {
      L = Math.abs(q2 - q1); // 一侧为 0 时的退化处理
    } else {
      L = (q2 - q1) / Math.log(q2 / q1);
    }
    var ln2 = safeLog(f2)[0], ln1 = safeLog(f1)[0];
    return L * (ln2 - ln1);
  }

  /**
   * 产量变化分解。
   *
   * 恒等式：q = A · T · (1 - fw)
   *   A  开井日液量强度（提液/降液）
   *   T  生产时率（开井天数占比）
   *   fw 含水率
   * LMDI 保证 Δq = ΔLiquid + ΔTime + ΔWater 严格可加。
   *
   * 井级分类后可加性同样成立：
   *   Δq_total = Δq_老井 + Δq_新井 + Δq_措施井 + Δq_其他井
   *
   * @param {Array} monthly aggregateMonthly 结果
   * @param {number} windowMonths 回看月数
   */
  function decompose(monthly, windowMonths) {
    windowMonths = windowMonths || 12;
    var totals = monthlyTotal(monthly);
    if (totals.length < 2) {
      return { ok: false, reason: '月度数据不足 2 个月，无法做阶段对比分解。' };
    }

    var allYm = totals.map(function (t) { return t.ym; });
    var endYm = allYm[allYm.length - 1];
    // 窗口：末尾共 windowMonths 个月
    var startIdx = Math.max(0, allYm.length - windowMonths);
    var startYm = allYm[startIdx];

    var start = totals.filter(function (t) { return t.ym === startYm; })[0];
    var end = totals.filter(function (t) { return t.ym === endYm; })[0];
    if (!start || !end) return { ok: false, reason: '窗口首尾月份数据缺失。' };

    // ---- 井级分类 ----
    var byWell = {};
    monthly.forEach(function (r) {
      if (!byWell[r.well]) byWell[r.well] = [];
      byWell[r.well].push(r);
    });

    var wellsNew = [], wellsMeasure = [], wellsOld = [], wellsOther = [];
    Object.keys(byWell).forEach(function (w) {
      var rows = byWell[w].slice().sort(function (a, b) { return a.ym - b.ym; });
      var inWin = rows.filter(function (r) { return r.ym >= startYm && r.ym <= endYm; });
      if (!inWin.length) return;

      var firstYm = rows[0].ym;
      var hasMeasure = inWin.some(function (r) { return r.measure; });
      var hasStart = inWin.some(function (r) { return r.ym === startYm; });
      var hasEnd = inWin.some(function (r) { return r.ym === endYm; });

      var rec = { well: w, rows: inWin, firstYm: firstYm };
      if (firstYm > startYm) { wellsNew.push(rec); }
      else if (hasMeasure) { wellsMeasure.push(rec); }
      else if (hasStart && hasEnd) { wellsOld.push(rec); }
      else { wellsOther.push(rec); }
    });

    function qAt(recs, ym) {
      var s = 0;
      recs.forEach(function (rec) {
        rec.rows.forEach(function (r) { if (r.ym === ym) s += r.oilRate; });
      });
      return s;
    }

    var q1Total = start.oil, q2Total = end.oil;
    var dTotal = q2Total - q1Total;

    // ---- 新井 ----
    var newContrib = qAt(wellsNew, endYm) - qAt(wellsNew, startYm);

    // ---- 措施井：措施前 3 月基线 vs 期末 ----
    var measureContrib = 0;
    var measureDetails = [];
    wellsMeasure.forEach(function (rec) {
      var msYm = null;
      rec.rows.forEach(function (r) { if (r.measure && msYm === null) msYm = r.ym; });
      var before = rec.rows.filter(function (r) { return r.ym < msYm; }).slice(-3);
      // 措施发生在窗口首月时 without 历史，退化为用窗口内首月产量当基线
      var baseline = before.length ? mean(before.map(function (r) { return r.oilRate; }))
                                   : (rec.rows[0] ? rec.rows[0].oilRate : 0);
      var qEnd = 0, qStart = 0;
      rec.rows.forEach(function (r) {
        if (r.ym === endYm) qEnd += r.oilRate;
        if (r.ym === startYm) qStart += r.oilRate;
      });
      // 该井对总量变化的贡献 = 期末 - 期初（含其自然递减，不夸大措施功劳）
      var contrib = qEnd - qStart;
      measureContrib += contrib;
      measureDetails.push({
        well: rec.well,
        measure: (rec.rows.filter(function (r) { return r.measure; })[0] || {}).measureLabel || '措施',
        baseline: round(baseline, 2),
        qStart: round(qStart, 2),
        qEnd: round(qEnd, 2),
        contrib: round(contrib, 2),
        // 相对基线是否有效
        liftVsBaseline: round(qEnd - baseline, 2)
      });
    });

    // ---- 其他井 ----
    var otherContrib = qAt(wellsOther, endYm) - qAt(wellsOther, startYm);

    // ---- 老井 LMDI（逐井分解，保证严格可加）----
    //
    // 注意：不能用「平均液量 × 平均时率」算总量因子——多井聚合时
    // Σ(A_i·T_i) ≠ (ΣA_i/n)(ΣT_i/n)，恒等式一破，三个分量加起来就对不上总变化。
    // 正确做法是对每口井各自做 LMDI，再求和，这样 Σ_i L_i·ln(f_i2/f_i1) 严格等于 Σ_i(q_i2-q_i1)。
    var partLiquid = 0, partTime = 0, partWater = 0;
    var O1 = 0, O2 = 0, L1 = 0, L2 = 0, T1 = 0, T2 = 0;

    wellsOld.forEach(function (rec) {
      var r1 = null, r2 = null;
      rec.rows.forEach(function (r) {
        if (r.ym === startYm) r1 = r;
        if (r.ym === endYm) r2 = r;
      });
      if (!r1 || !r2) return;

      var qa = r1.oilRate, qb = r2.oilRate;
      O1 += qa; O2 += qb;
      L1 += r1.liquidRate; L2 += r2.liquidRate;
      T1 += r1.timeRate; T2 += r2.timeRate;

      var ta = Math.max(1e-6, Math.min(1, r1.timeRate));
      var tb = Math.max(1e-6, Math.min(1, r2.timeRate));
      var Aa = r1.liquidRate / ta;
      var Ab = r2.liquidRate / tb;
      var fwa = r1.liquidRate > EPS ? Math.min(0.999999, Math.max(0, 1 - qa / r1.liquidRate)) : 0;
      var fwb = r2.liquidRate > EPS ? Math.min(0.999999, Math.max(0, 1 - qb / r2.liquidRate)) : 0;

      partLiquid += lmdiTerm(qa, qb, Aa, Ab);
      partTime += lmdiTerm(qa, qb, ta, tb);
      partWater += lmdiTerm(qa, qb, 1 - fwa, 1 - fwb);
    });

    var nOld = wellsOld.length;
    var fw1 = L1 > EPS ? Math.min(0.999999, Math.max(0, 1 - O1 / L1)) : 0;
    var fw2 = L2 > EPS ? Math.min(0.999999, Math.max(0, 1 - O2 / L2)) : 0;
    var Tr1 = nOld > 0 ? T1 / nOld : 0;
    var Tr2 = nOld > 0 ? T2 / nOld : 0;

    // LMDI 三项之和应精确等于 Δq_old；残差仅用于自检展示
    var dOld = O2 - O1;
    var lmdiSum = partLiquid + partTime + partWater;
    var lmdiResidual = dOld - lmdiSum;

    // ---- 自检：四类井贡献之和 vs 总变化 ----
    var sumParts = dOld + newContrib + measureContrib + otherContrib;
    var closureGap = dTotal - sumParts;

    var items = [
      { key: 'new', label: '新井投产', value: newContrib, group: 'l1' },
      { key: 'measure', label: '措施增产', value: measureContrib, group: 'l1' },
      { key: 'liquid', label: '老井·液量变化', value: partLiquid, group: 'l2' },
      { key: 'time', label: '老井·生产时率', value: partTime, group: 'l2' },
      { key: 'water', label: '老井·含水上升', value: partWater, group: 'l2' },
      { key: 'other', label: '其他井 / 数据不完整', value: otherContrib + closureGap + lmdiResidual, group: 'l1' }
    ].map(function (it) {
      return Object.assign(it, {
        // 保留 4 位：保证 6 项之和与 delta 的闭合差 < 0.001，展示层再自行取 2 位
        value: round(it.value, 4),
        share: Math.abs(dTotal) > EPS ? round((it.value / dTotal) * 100, 1) : 0
      });
    });

    // 主控因素：绝对值最大
    var dominant = items.slice().sort(function (a, b) {
      return Math.abs(b.value) - Math.abs(a.value);
    })[0];

    return {
      ok: true,
      startYm: startYm,
      endYm: endYm,
      startLabel: ymLabel(startYm),
      endLabel: ymLabel(endYm),
      months: allYm.length - startIdx,
      q1: round(q1Total, 2),
      q2: round(q2Total, 2),
      delta: round(dTotal, 4),
      deltaPct: q1Total > EPS ? round((dTotal / q1Total) * 100, 2) : 0,
      monthlyRate: q1Total > EPS ? round((dTotal / q1Total / Math.max(1, allYm.length - startIdx)) * 100, 2) : 0,
      items: items,
      dominant: dominant,
      oldTotal: { q1: round(O1, 3), q2: round(O2, 3), delta: round(O2 - O1, 3) },
      closure: { gap: round(closureGap, 4), lmdiResidual: round(lmdiResidual, 5), ok: Math.abs(closureGap) < 0.01 },
      wells: {
        old: wellsOld.length,
        new: wellsNew.length,
        measure: wellsMeasure.length,
        other: wellsOther.length,
        total: wellsOld.length + wellsNew.length + wellsMeasure.length + wellsOther.length,
        oldList: wellsOld.map(function (r) { return r.well; }),
        newList: wellsNew.map(function (r) { return { well: r.well, ym: r.firstYm }; }),
        measureList: wellsMeasure.map(function (r) {
          var ms = r.rows.filter(function (x) { return x.measure; })[0];
          return { well: r.well, ym: ms ? ms.ym : r.firstYm, label: ms ? (ms.measureLabel || '措施') : '措施' };
        })
      },
      measureDetails: measureDetails,
      waterCut: { start: round(fw1 * 100, 1), end: round(fw2 * 100, 1), delta: round((fw2 - fw1) * 100, 1) },
      liquid: { start: round(L1, 2), end: round(L2, 2), deltaPct: L1 > EPS ? round(((L2 - L1) / L1) * 100, 1) : 0 },
      timeRate: { start: round(Tr1 * 100, 1), end: round(Tr2 * 100, 1), delta: round((Tr2 - Tr1) * 100, 1) },
      injectionRatio: { start: round(start.injectionRatio, 2), end: round(end.injectionRatio, 2) }
    };
  }

  /* ------------------------------------------------------------------ *
   * 5. 规则诊断
   * ------------------------------------------------------------------ */

  function diagnose(ctx) {
    var fit = ctx.fit, dec = ctx.decomp, series = ctx.series, field = ctx.field;
    var findings = [];

    function push(level, tag, title, detail) {
      findings.push({ level: level, tag: tag, title: title, detail: detail });
    }

    if (!fit) {
      push('bad', '数据', '无法拟合递减曲线', '有效产量点不足 4 个，无法判定递减规律。请确认数据覆盖至少 4 个月且产油量大于 0。');
    } else {
      // 拟合质量
      if (fit.r2 >= 0.9) {
        push('good', '规律', '递减规律稳定（' + fit.type + '）',
          'Arps 拟合 R² = ' + fit.r2.toFixed(3) + '，b = ' + fit.b.toFixed(2) +
          '，年递减 ' + fit.annualDecline.toFixed(1) + '%。曲线可作为配产与预测依据。');
      } else if (fit.r2 >= 0.75) {
        push('warn', '规律', '递减规律基本可用但存在扰动（' + fit.type + '）',
          'R² = ' + fit.r2.toFixed(3) + '，说明产量受措施、时率或注水调整影响明显。预测建议按月滚动复核，不要直接外推一年以上。');
      } else {
        push('bad', '规律', '递减规律不显著，拟合不可靠',
          'R² 仅 ' + fit.r2.toFixed(3) + '。常见原因：生产制度频繁调整、数据缺失、井数结构变化大。建议先做数据治理，或改用阶段性分段拟合。');
      }

      // b 值的工程含义
      if (fit.b < 0.1) {
        push('warn', '能量', '接近指数递减，地层能量补充不足',
          'b ≈ ' + fit.b.toFixed(2) + ' 表示递减率几乎恒定，通常是天然能量驱动或注水未见效的特征。建议核查注采比与对应注水井的吸水状况。');
      } else if (fit.b > 0.85) {
        push('good', '能量', 'b 值偏高，递减偏慢',
          'b ≈ ' + fit.b.toFixed(2) + ' 表明递减随时间快速趋缓，多为注水见效或强弹性驱。注意：b 值高的曲线尾部预测对参数极敏感，EUR 建议取区间而非点值。');
      }

      if (fit.annualDecline > 25) {
        push('bad', '递减', '年递减率 ' + fit.annualDecline.toFixed(1) + '%，偏高',
          '超过 25% 属于快速递减。优先排查含水上升速度、注水是否中断、是否有井停产未上报。');
      } else if (fit.annualDecline > 15) {
        push('warn', '递减', '年递减率 ' + fit.annualDecline.toFixed(1) + '%，需关注',
          '处于常见区间上沿。若主控因素为含水上升，应提前安排调剖堵水或层系调整。');
      } else {
        push('good', '递减', '年递减率 ' + fit.annualDecline.toFixed(1) + '%，控制良好',
          '低于 15%，递减管理处于较好水平。');
      }
    }

    // 含水
    if (dec && dec.ok) {
      if (dec.waterCut.delta > 5) {
        push('bad', '含水', '窗口内含水上升 ' + dec.waterCut.delta.toFixed(1) + ' 个百分点',
          dec.waterCut.start.toFixed(1) + '% → ' + dec.waterCut.end.toFixed(1) +
          '%。含水每上升 1 个百分点，按当前液量折算约减产 ' + round(dec.liquid.end / 100, 2) +
          ' t/d。建议核查水淹方向、评价堵水调剖潜力。');
      } else if (dec.waterCut.delta > 2) {
        push('warn', '含水', '含水上升 ' + dec.waterCut.delta.toFixed(1) + ' 个百分点',
          '属于正常偏快上升，建议加密含水监测，提前准备控水稳油措施。');
      } else {
        push('good', '含水', '含水基本稳定（' + dec.waterCut.delta.toFixed(1) + ' pp）',
          dec.waterCut.start.toFixed(1) + '% → ' + dec.waterCut.end.toFixed(1) + '%，控水效果正常。');
      }

      // 时率
      if (dec.timeRate.end < 85) {
        push('warn', '时率', '生产时率仅 ' + dec.timeRate.end.toFixed(1) + '%',
          '时率低于 85%，存在较多关井或停产。时率每恢复 1 个百分点，按当前液量折算约增油 ' +
          round(dec.liquid.end / 100, 2) + ' t/d。这部分往往是最容易拿回来的产量。');
      }

      // 注采比
      if (dec.injectionRatio.end < 0.8) {
        push('warn', '注水', '注采比 ' + dec.injectionRatio.end.toFixed(2) + '，偏低',
          '低于 0.8 意味着地下亏空在扩大，长期看会加速递减。建议核查对应注水井的注水量与配注完成率。');
      } else if (dec.injectionRatio.end > 1.4) {
        push('warn', '注水', '注采比 ' + dec.injectionRatio.end.toFixed(2) + '，偏高',
          '注大于采可能带来水窜风险，需结合含水与压力同步判断，避免只堆注水量换产量。');
      }

      // 措施有效性
      if (dec.measureDetails.length) {
        var bad = dec.measureDetails.filter(function (m) { return m.liftVsBaseline <= 0; });
        if (bad.length) {
          push('bad', '措施', bad.length + ' 口井措施后产量未回到措施前水平',
            bad.map(function (m) { return m.well + '（' + m.measure + '，期末 ' + m.qEnd.toFixed(2) + ' vs 基线 ' + m.baseline.toFixed(2) + '）'; }).join('；') +
            '。建议复盘措施选井标准与施工质量，无效井不应重复投入。');
        } else {
          push('good', '措施', dec.measureDetails.length + ' 口措施井均高于措施前基线',
            dec.measureDetails.map(function (m) {
              return m.well + ' 期末 ' + m.qEnd.toFixed(2) + '（基线 ' + m.baseline.toFixed(2) + '，+' + m.liftVsBaseline.toFixed(2) + '）';
            }).join('；') + '。');
        }
      }

      // 主控因素
      if (dec.dominant && dec.dominant.value < 0) {
        push('warn', '主控', '主控因素是「' + dec.dominant.label + '」',
          '该因素造成 ' + dec.dominant.value.toFixed(2) + ' t/d 的产量变化，占总变化的 ' +
          Math.abs(dec.dominant.share).toFixed(1) + '%。治理顺序建议从主控因素入手，而不是平均着力。');
      }

      // 自检
      if (!dec.closure.ok) {
        push('warn', '自检', '分解闭合差 ' + dec.closure.gap.toFixed(3) + ' t/d',
          '各分量之和与总量变化存在偏差，通常源于数据缺失或井的生产状态突变。偏差已单列在「其他井」中，未做隐藏处理。');
      }
    }

    // 数据质量
    var lowQ = series.filter(function (t) { return t.lowQuality > 0; });
    if (lowQ.length) {
      push('warn', '数据', lowQ.length + ' 个月存在数据覆盖不足',
        '涉及 ' + lowQ.map(function (t) { return t.label; }).join('、') +
        '。这些月份的月均日产可能失真，会连带影响递减率与分解结果。');
    }

    // 排序：bad -> warn -> good
    var order = { bad: 0, warn: 1, good: 2 };
    findings.sort(function (a, b) { return order[a.level] - order[b.level]; });

    var badCount = findings.filter(function (f) { return f.level === 'bad'; }).length;
    var warnCount = findings.filter(function (f) { return f.level === 'warn'; }).length;

    return {
      findings: findings,
      score: Math.max(0, 100 - badCount * 12 - warnCount * 4),
      badCount: badCount,
      warnCount: warnCount,
      health: badCount > 0 ? 'attention' : warnCount > 1 ? 'watch' : 'stable'
    };
  }

  /* ------------------------------------------------------------------ *
   * 导出
   * ------------------------------------------------------------------ */

  return {
    parseCSV: parseCSV,
    parseDate: parseDate,
    aggregateMonthly: aggregateMonthly,
    monthlyTotal: monthlyTotal,
    naturalSeries: naturalSeries,
    fitArps: fitArps,
    forecastEur: forecastEur,
    arpsQ: arpsQ,
    arpsCumulative: arpsCumulative,
    decompose: decompose,
    diagnose: diagnose,
    ymLabel: ymLabel,
    daysInMonth: daysInMonth,
    util: { num: num, sum: sum, mean: mean, round: round, safeLog: safeLog },
    VERSION: '1.0.0'
  };
});
