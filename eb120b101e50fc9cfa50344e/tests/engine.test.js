/**
 * Decline Doctor · 算法自测
 * 运行：node tests/engine.test.js
 *
 * 重点验证两件事：
 *   1. Arps 拟合能还原已知参数（b / qi / Di）
 *   2. LMDI 分解严格可加（这才是「分因素」成立的前提）
 */
const E = require('../assets/engine.js');

let pass = 0, fail = 0;
const failures = [];

function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  \x1b[32m✔\x1b[0m ' + name + (extra ? '  \x1b[90m' + extra + '\x1b[0m' : '')); }
  else { fail++; failures.push(name); console.log('  \x1b[31m✘\x1b[0m ' + name + '  \x1b[90m' + (extra || '') + '\x1b[0m'); }
}
function near(a, b, tol, name) {
  const d = Math.abs(a - b);
  ok(d <= tol, name, '实测 ' + a.toFixed(4) + ' / 期望 ' + b.toFixed(4) + ' / 误差 ' + d.toFixed(4));
}
function section(t) { console.log('\n\x1b[1m' + t + '\x1b[0m'); }

/* ---------------- 合成数据工厂 ---------------- */

/**
 * 生成一口井的日度记录。
 *
 * 严格按 q = A · T · (1 - fw) 构造，三个因子独立可控：
 *   A   开井日液量强度 = frac（frac0 -> frac1 线性变化）
 *   T   生产时率       = tr0 -> tr1 线性变化
 *   fw  含水率         = fw0 -> fw1 线性变化
 * Di/b 只影响产能的自然衰减，不干扰上面三个因子。
 */
function makeWell(o) {
  const {
    well, startYm, months,
    Di = 0, b = 0.001,
    fw0 = 0.3, fw1 = 0.3,
    frac0 = 20, frac1 = frac0,
    tr0 = 1, tr1 = tr0,
    injRatio = 0.9,
    measureAt = null, measureLabel = '压裂'
  } = o;

  const rows = [];
  const y0 = Math.floor(startYm / 100), m0 = startYm % 100;
  const denom = Math.max(1, months - 1);

  for (let mi = 0; mi < months; mi++) {
    const seq = m0 - 1 + mi;
    const y = y0 + Math.floor(seq / 12);
    const mo = (seq % 12) + 1;
    const ym = y * 100 + mo;
    const dim = E.daysInMonth(ym);

    const frac = frac0 + (frac1 - frac0) * (mi / denom);   // 开井日液量 t/d
    const fw = fw0 + (fw1 - fw0) * (mi / denom);           // 含水
    const tr = Math.min(1, Math.max(0, tr0 + (tr1 - tr0) * (mi / denom))); // 时率
    const decline = E.arpsQ(mi, 1, Di, b);                 // 产能自然衰减系数

    let liquidDay = frac * decline;
    // 措施：当月起液量放大 60%，只在措施当月打标记
    const isMeasureMonth = measureAt !== null && mi === measureAt;
    if (measureAt !== null && mi >= measureAt) liquidDay *= 1.6;

    const oilDay = liquidDay * (1 - fw);
    // 按目标时率精确控制开井天数
    const openN = Math.round(dim * tr);

    for (let d = 1; d <= dim; d++) {
      const isOpen = d <= openN;
      rows.push({
        ym, day: d, well,
        oil: isOpen ? oilDay : 0,
        liquid: isOpen ? liquidDay : 0,
        waterCut: fw,
        waterInj: isOpen ? liquidDay * injRatio : 0,
        openDays: isOpen ? 1 : 0,
        measure: isMeasureMonth,
        measureLabel: isMeasureMonth ? measureLabel : ''
      });
    }
  }
  return rows;
}

/* ---------------- 1. Arps 拟合 ---------------- */

section('1. Arps 递减拟合');

[
  { b: 0.0, qi: 20, Di: 0.06 },
  { b: 0.45, qi: 18, Di: 0.04 },
  { b: 0.75, qi: 25, Di: 0.03 },
  { b: 1.0, qi: 15, Di: 0.05 }
].forEach(({ b, qi, Di }) => {
  const pts = [];
  for (let t = 0; t < 24; t++) pts.push({ t, q: E.arpsQ(t, qi, Di, b) });
  const f = E.fitArps(pts);
  const tag = 'b=' + b;
  ok(!!f, '无噪声可拟合 ' + tag);
  if (!f) return;
  near(f.b, b, 0.03, '还原 b ' + tag);
  near(f.Di, Di, 0.004, '还原 Di ' + tag);
  ok(f.r2 > 0.999, 'R² ≈ 1 ' + tag, 'R²=' + f.r2);
});

{
  let seed = 42;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const pts = [];
  for (let t = 0; t < 36; t++) {
    pts.push({ t, q: E.arpsQ(t, 22, 0.045, 0.6) * (1 + (rnd() - 0.5) * 0.08) });
  }
  const f = E.fitArps(pts);
  ok(f.b > 0.45 && f.b < 0.75, '含 8% 噪声时 b 落在合理区间', 'b=' + f.b + ' R²=' + f.r2);
  ok(f.r2 > 0.9, '含噪声仍保持高 R²', 'R²=' + f.r2);
}

{
  const qi = 20, Di = 0.05, b = 0.6;
  const analytic = E.arpsCumulative(0, 24, qi, Di, b);
  let numeric = 0;
  const N = 20000;
  for (let i = 0; i < N; i++) numeric += E.arpsQ((i + 0.5) * 24 / N, qi, Di, b) * (24 / N);
  numeric *= 30.4375;
  const err = Math.abs(analytic - numeric) / numeric * 100;
  ok(err < 0.1, '累积产量解析积分与数值积分一致', '偏差 ' + err.toFixed(4) + '%');
}

ok(E.fitArps([{ t: 0, q: 10 }, { t: 1, q: 9 }]) === null, '点数不足 4 个时返回 null');

/* ---------------- 2. 聚合与解析 ---------------- */

section('2. 数据解析与月度聚合');

const csv = [
  '日期,井号,日产油,日产液,含水,日注水,开井天数,措施',
  '2026-01-01,A-1,10,20,50,15,1,',
  '2026-01-02,A-1,10,20,50,15,1,',
  '2026-02-01,A-1,9,20,55,15,1,',
  '2026-02-02,A-1,9,20,55,15,1,压裂'
].join('\n');
const parsed = E.parseCSV(csv);
ok(parsed.rows.length === 4, 'CSV 解析出 4 行', '实际 ' + parsed.rows.length);
ok(parsed.rows[3].measure === true, '措施标记识别为 true');
ok(Math.abs(parsed.rows[0].waterCut - 0.5) < 1e-9, '含水 50 归一化为 0.5');

const monthly0 = E.aggregateMonthly(parsed.rows);
ok(monthly0.length === 2, '聚合为 2 个月度记录', '实际 ' + monthly0.length);
const jan = monthly0.find(r => r.ym === 202601);
ok(Math.abs(jan.oilRate - 10) < 1e-6, '月均日产油正确', jan.oilRate.toFixed(3));
ok(jan.lowQuality === true, '仅覆盖 2/31 天判为低质量并标记');

/* ---------------- 3. LMDI 严格可加 ---------------- */

section('3. LMDI 因素分解可加性');

// 场景 A：液量与时率恒定，仅含水 30% -> 45%
{
  const rows = makeWell({ well: 'W1', startYm: 202501, months: 13, fw0: 0.30, fw1: 0.45, frac0: 20, frac1: 20, tr0: 1, tr1: 1 });
  const d = E.decompose(E.aggregateMonthly(rows), 12);
  const water = d.items.find(i => i.key === 'water').value;
  const liquid = d.items.find(i => i.key === 'liquid').value;
  const time = d.items.find(i => i.key === 'time').value;

  ok(d.delta < 0, '含水上升导致产量下降', 'Δq=' + d.delta.toFixed(3));
  near(water, d.delta, Math.abs(d.delta) * 0.03, '含水项 ≈ 总变化（单因子场景）');
  ok(Math.abs(liquid) < Math.abs(d.delta) * 0.02, '同场景液量项 ≈ 0', liquid.toFixed(5));
  ok(Math.abs(time) < Math.abs(d.delta) * 0.02, '同场景时率项 ≈ 0', time.toFixed(5));
  ok(Math.abs(liquid + time + water - d.delta) < 0.001, 'LMDI 三项之和 = 老井总变化',
    '三项和 ' + (liquid + time + water).toFixed(5) + ' vs Δq ' + d.delta.toFixed(5));
}

// 场景 B：含水与时率恒定，液量翻倍
{
  const rows = makeWell({ well: 'W2', startYm: 202501, months: 13, fw0: 0.4, fw1: 0.4, frac0: 20, frac1: 40, tr0: 1, tr1: 1 });
  const d = E.decompose(E.aggregateMonthly(rows), 12);
  const liquid = d.items.find(i => i.key === 'liquid').value;
  ok(d.delta > 0, '提液带来产量增长', 'Δq=' + d.delta.toFixed(3));
  ok(liquid / d.delta > 0.95, '液量项占总变化 95% 以上',
    (liquid / d.delta * 100).toFixed(1) + '%');
}

// 场景 C：含水与液量恒定，时率 100% -> 75%
{
  const rows = makeWell({ well: 'W3', startYm: 202501, months: 13, fw0: 0.3, fw1: 0.3, frac0: 20, frac1: 20, tr0: 1, tr1: 0.75 });
  const d = E.decompose(E.aggregateMonthly(rows), 12);
  ok(d.delta < 0, '时率降至 75% 时产量下降', 'Δq=' + d.delta.toFixed(3));
  const time = d.items.find(i => i.key === 'time').value;
  near(time, d.delta, Math.abs(d.delta) * 0.03, '时率项 ≈ 总变化');
}

// 场景 D：新井 + 措施井 + 老井综合
{
  const rows = [];
  rows.push(...makeWell({ well: 'A-1', startYm: 202501, months: 13, Di: 0.01, b: 0.5, fw0: 0.25, fw1: 0.38, frac0: 28 }));
  rows.push(...makeWell({ well: 'A-2', startYm: 202501, months: 13, Di: 0.008, b: 0.6, fw0: 0.40, fw1: 0.44, frac0: 20 }));
  rows.push(...makeWell({ well: 'B-1', startYm: 202501, months: 13, Di: 0.02, b: 0.8, fw0: 0.30, fw1: 0.34, frac0: 21, measureAt: 6 }));
  rows.push(...makeWell({ well: 'C-1', startYm: 202508, months: 6, Di: 0.01, b: 0.5, fw0: 0.15, fw1: 0.18, frac0: 12 }));

  const d = E.decompose(E.aggregateMonthly(rows), 12);

  ok(d.ok, '综合场景分解成功');
  ok(d.closure.ok, '分解闭合（差 < 0.01 t/d）', 'gap=' + d.closure.gap + ' LMDI残差=' + d.closure.lmdiResidual);

  const sumItems = d.items.reduce((s, it) => s + it.value, 0);
  near(sumItems, d.delta, 0.002, '六项之和 = 总变化量');

  near(d.oldTotal.q2 - d.oldTotal.q1, d.oldTotal.delta, 0.002, '老井总变化自洽');
  var lmdiSum = ['liquid','time','water'].reduce(function (s, k) {
    return s + d.items.find(function (i) { return i.key === k; }).value;
  }, 0);
  near(lmdiSum, d.oldTotal.delta, 0.002, 'LMDI 三项和 = 老井产量实际变化');

  ok(d.wells.new === 1, '识别出 1 口新井', 'new=' + d.wells.new);
  ok(d.wells.measure === 1, '识别出 1 口措施井', 'measure=' + d.wells.measure);
  ok(d.wells.old === 2, '识别出 2 口老井', 'old=' + d.wells.old);

  ok(d.items.find(i => i.key === 'new').value > 0, '新井贡献为正');
  ok(d.items.find(i => i.key === 'measure').value > 0, '措施井贡献为正');
  ok(d.measureDetails.length === 1 && d.measureDetails[0].liftVsBaseline > 0, '措施井期末产量高于基线');

  console.log('\n  \x1b[90m分解明细：期初 ' + d.q1 + ' → 期末 ' + d.q2 + ' t/d，变化 ' + d.delta +
    '（' + d.deltaPct + '%）\x1b[0m');
  d.items.forEach(it => {
    console.log('  \x1b[90m  ' + it.label.padEnd(18, ' ') + String(it.value.toFixed(3)).padStart(9) + '  (' + it.share + '%)\x1b[0m');
  });
  console.log('  \x1b[90m  含水 ' + d.waterCut.start + '% → ' + d.waterCut.end + '%，时率 ' +
    d.timeRate.start + '% → ' + d.timeRate.end + '%\x1b[0m');
}

/* ---------------- 4. 诊断与预测 ---------------- */

section('4. 诊断规则与预测');

{
  const rows = [];
  rows.push(...makeWell({ well: 'A-1', startYm: 202501, months: 13, Di: 0.02, b: 0.5, fw0: 0.25, fw1: 0.55, frac0: 32, frac1: 32, injRatio: 0.5 }));
  rows.push(...makeWell({ well: 'A-2', startYm: 202501, months: 13, Di: 0.02, b: 0.5, fw0: 0.30, fw1: 0.58, frac0: 24, frac1: 24, injRatio: 0.5 }));
  const m = E.aggregateMonthly(rows);
  const series = E.monthlyTotal(m);
  const pts = series.map((t, i) => ({ t: i, q: t.oil }));
  const fit = E.fitArps(pts);
  const dec = E.decompose(m, 12);

  const diag = E.diagnose({ fit, decomp: dec, series, field: 'test' });
  ok(diag.findings.length > 0, '产出诊断条目', diag.findings.length + ' 条');
  ok(diag.findings.some(f => f.tag === '含水'), '识别出含水问题');
  ok(diag.findings.some(f => f.tag === '注水'), '识别出注采比异常', '注采比=' + dec.injectionRatio.end);
  ok(diag.findings.some(f => f.tag === '规律'), '给出递减规律结论');
  ok(diag.score >= 0 && diag.score <= 100, '健康分在 0~100 区间', 'score=' + diag.score);
  ok(diag.findings[0].level === 'bad', '问题条目排在最前');

  const eur = E.forecastEur(fit, { qLimit: 0.5 });
  ok(eur.eur > 0, 'EUR 预测为正', eur.eur + ' t / ' + eur.years + ' 年');
  ok(eur.months > 0, '预测年限为正');
}

/* ---------------- 5. 边界情况 ---------------- */

section('5. 边界与鲁棒性');

ok(E.parseCSV('').rows.length === 0, '空文本不崩溃');
ok(E.parseCSV('garbage').rows.length === 0, '乱码文本不崩溃');
ok(E.decompose([], 12).ok === false, '空数据分解返回 ok:false');

{
  const rows = makeWell({ well: 'Z-1', startYm: 202501, months: 1, Di: 0.03, b: 0.5, frac0: 20 });
  ok(E.decompose(E.aggregateMonthly(rows), 12).ok === false, '仅 1 个月数据时分解被拒绝');
}

{
  const rows = [];
  for (let mo = 1; mo <= 6; mo++) {
    rows.push({ ym: 202500 + mo, day: 1, well: 'N-1', oil: 0, liquid: 0, waterCut: 0, waterInj: 0, openDays: 0, measure: false, measureLabel: '' });
  }
  const d = E.decompose(E.aggregateMonthly(rows), 12);
  const bad = /NaN|Infinity/.test(JSON.stringify(d));
  ok(!bad, '全零产量不产生 NaN / Infinity');

  const fit = E.fitArps(E.monthlyTotal(E.aggregateMonthly(rows)).map((t, i) => ({ t: i, q: t.oil })));
  ok(fit === null, '全零产量拟合返回 null 而非崩溃');
}

/* ---------------- 汇总 ---------------- */

console.log('\n' + '─'.repeat(52));
if (fail === 0) {
  console.log('\x1b[32m\x1b[1m全部通过\x1b[0m  ' + pass + ' 项断言\n');
  process.exit(0);
} else {
  console.log('\x1b[31m\x1b[1m' + fail + ' 项失败\x1b[0m  /  通过 ' + pass + ' 项');
  failures.forEach(f => console.log('  \x1b[31m- ' + f + '\x1b[0m'));
  console.log('');
  process.exit(1);
}
