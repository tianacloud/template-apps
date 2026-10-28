/**
 * 被动收入小账本 · 计算内核（纯函数，无任何 UI / 存储依赖）
 * 小程序与 Node 单元测试共用同一份代码，保证“算得对”。
 *
 * 统一规则（单利）：
 *   每日收益 = 生效本金 × 生效年利率(%) ÷ 100 ÷ 365
 *   有到期日资产：计息区间为 起息日 ~ 到期日的前一天，到期日当天起不再计息
 *   无到期日资产：起息日起持续计息
 *   本金 / 利率变更：通过 segments（时间分段）记录，变更日次日按新参数计息
 */

var MS_DAY = 86400000;

function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

/** 'YYYY-MM-DD' -> UTC 毫秒；非法返回 null */
function parseDate(key) {
  if (!key) return null;
  var p = String(key).slice(0, 10).split('-');
  if (p.length !== 3) return null;
  var y = parseInt(p[0], 10);
  var m = parseInt(p[1], 10);
  var d = parseInt(p[2], 10);
  if (!y || !m || !d) return null;
  var t = Date.UTC(y, m - 1, d);
  return isNaN(t) ? null : t;
}

/** UTC 毫秒 -> 'YYYY-MM-DD' */
function toKey(ms) {
  var d = new Date(ms);
  return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
}

function isDateKey(key) {
  return parseDate(key) !== null;
}

/** 日期加减天数，返回 'YYYY-MM-DD' */
function addDays(key, n) {
  var t = parseDate(key);
  if (t === null) return key;
  return toKey(t + n * MS_DAY);
}

/** b - a 的天数差（可为负） */
function diffDays(a, b) {
  var ta = parseDate(a);
  var tb = parseDate(b);
  if (ta === null || tb === null) return 0;
  return Math.round((tb - ta) / MS_DAY);
}

/** 本地“今天”，'YYYY-MM-DD' */
function todayKey() {
  var d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function monthStartOf(key) {
  return String(key).slice(0, 7) + '-01';
}

function yearStartOf(key) {
  return String(key).slice(0, 4) + '-01-01';
}

/**
 * 取资产的计息分段（按 from 升序）。
 * 兼容只有 principal / rate 的老数据（自动补一段）。
 */
function segmentsOf(asset) {
  if (!asset) return [];
  var raw = Array.isArray(asset.segments) ? asset.segments : [];
  var segs = [];
  for (var i = 0; i < raw.length; i++) {
    var s = raw[i];
    if (!s || !isDateKey(s.from)) continue;
    segs.push({
      from: String(s.from).slice(0, 10),
      principal: Number(s.principal) || 0,
      rate: Number(s.rate) || 0
    });
  }
  if (!segs.length && asset.startDate && isDateKey(asset.startDate)) {
    segs.push({
      from: String(asset.startDate).slice(0, 10),
      principal: Number(asset.principal) || 0,
      rate: Number(asset.rate) || 0
    });
  }
  segs.sort(function (a, b) {
    if (a.from < b.from) return -1;
    if (a.from > b.from) return 1;
    return 0;
  });
  return segs;
}

/**
 * 某个日期生效的本金与利率。
 * 早于第一段时沿用第一段（用于展示“当前本金”）；晚于最后一段沿用最后一段。
 */
function effective(asset, dateKey) {
  var segs = segmentsOf(asset);
  if (!segs.length) return { principal: 0, rate: 0, from: '' };
  var k = dateKey || todayKey();
  var cur = segs[0];
  for (var i = 0; i < segs.length; i++) {
    if (segs[i].from <= k) cur = segs[i];
    else break;
  }
  return { principal: cur.principal, rate: cur.rate, from: cur.from };
}

/** 当前本金（按今天） */
function currentPrincipal(asset, dateKey) {
  return effective(asset, dateKey || todayKey()).principal;
}

/**
 * 尚未生效的分段（今天之后才起算的本金/利率调整），用于提示“明日起按新参数计息”
 */
function pendingSegment(asset, dateKey) {
  var k = dateKey || todayKey();
  var segs = segmentsOf(asset);
  for (var i = 0; i < segs.length; i++) {
    if (segs[i].from > k) return segs[i];
  }
  return null;
}

/**
 * 计息窗口：起息日 ~ 到期日的前一天（被 untilKey 截断）。
 * 返回 null 表示该日期尚无收益。
 */
function accrualWindow(asset, untilKey) {
  if (!asset || !isDateKey(asset.startDate)) return null;
  var from = String(asset.startDate).slice(0, 10);
  var to = untilKey;
  if (asset.endDate && isDateKey(asset.endDate)) {
    var lastAccrual = addDays(String(asset.endDate).slice(0, 10), -1);
    if (lastAccrual < to) to = lastAccrual;
  }
  if (!to || to < from) return null;
  return { from: from, to: to };
}

/** 某一天的单日收益（不含该日则为 0） */
function dailyIncome(asset, dateKey) {
  var k = dateKey;
  var w = accrualWindow(asset, k);
  if (!w) return 0;
  if (k < w.from || k > w.to) return 0;
  var eff = effective(asset, k);
  return eff.principal * (eff.rate / 100) / 365;
}

/**
 * 区间 [fromKey, toKey] 内的收益合计（按分段逐段累加，段内按天数乘日收益）
 */
function incomeBetween(asset, fromKey, toKey) {
  if (!fromKey || !toKey || toKey < fromKey) return 0;
  var w = accrualWindow(asset, toKey);
  if (!w) return 0;
  var from = w.from > fromKey ? w.from : fromKey;
  var to = w.to;
  if (to < from) return 0;
  var segs = segmentsOf(asset);
  if (!segs.length) return 0;
  var total = 0;
  for (var i = 0; i < segs.length; i++) {
    var segFrom = segs[i].from;
    var segTo = i + 1 < segs.length ? addDays(segs[i + 1].from, -1) : null;
    var f = segFrom > from ? segFrom : from;
    var t = segTo === null ? to : segTo < to ? segTo : to;
    if (t < f) continue;
    var days = diffDays(f, t) + 1;
    total += days * segs[i].principal * (segs[i].rate / 100) / 365;
  }
  return total;
}

/** 累计已产生收益（起息日 ~ 今天，含今天；到期后自动封顶） */
function accruedIncome(asset, today) {
  var k = today || todayKey();
  return incomeBetween(asset, String(asset.startDate || '').slice(0, 10), k);
}

/** 已计息天数 */
function daysAccrued(asset, today) {
  var w = accrualWindow(asset, today || todayKey());
  if (!w) return 0;
  return diffDays(w.from, w.to) + 1;
}

/** 当天是否处于计息状态 */
function isActive(asset, dateKey) {
  var k = dateKey || todayKey();
  if (!isDateKey(asset.startDate) || k < String(asset.startDate).slice(0, 10)) return false;
  if (asset.endDate && isDateKey(asset.endDate) && k >= String(asset.endDate).slice(0, 10)) return false;
  return true;
}

function hasEndDate(asset) {
  return !!(asset && asset.endDate && isDateKey(asset.endDate));
}

/** 汇总：今日 / 本月 / 本年 / 累计 / 本金 */
function summarize(assets, today) {
  var k = today || todayKey();
  var list = Array.isArray(assets) ? assets : [];
  var mStart = monthStartOf(k);
  var yStart = yearStartOf(k);
  var rows = [];
  var todayTotal = 0;
  var monthTotal = 0;
  var yearTotal = 0;
  var allTotal = 0;
  var principalTotal = 0;
  var activeCount = 0;

  for (var i = 0; i < list.length; i++) {
    var a = list[i];
    var t = dailyIncome(a, k);
    var acc = accruedIncome(a, k);
    var m = incomeBetween(a, mStart, k);
    var y = incomeBetween(a, yStart, k);
    var p = currentPrincipal(a, k);
    var active = isActive(a, k);
    todayTotal += t;
    monthTotal += m;
    yearTotal += y;
    allTotal += acc;
    principalTotal += p;
    if (active) activeCount++;
    rows.push({
      id: a.id,
      asset: a,
      name: a.name,
      today: t,
      month: m,
      year: y,
      accrued: acc,
      principal: p,
      days: daysAccrued(a, k),
      active: active,
      rate: effective(a, k).rate
    });
  }

  rows.sort(function (a, b) {
    if (b.today !== a.today) return b.today - a.today;
    return b.accrued - a.accrued;
  });

  return {
    date: k,
    rows: rows,
    todayTotal: todayTotal,
    monthTotal: monthTotal,
    yearTotal: yearTotal,
    allTotal: allTotal,
    principalTotal: principalTotal,
    activeCount: activeCount,
    count: list.length,
    // 年化视角的两个参考值
    monthAvgDaily: 0
  };
}

/** 近 n 天每日总收益序列（含今天），用于折线/柱状图 */
function historySeries(assets, today, days) {
  var k = today || todayKey();
  var n = days || 30;
  var out = [];
  for (var i = n - 1; i >= 0; i--) {
    var d = addDays(k, -i);
    var total = 0;
    for (var j = 0; j < (assets || []).length; j++) {
      total += dailyIncome(assets[j], d);
    }
    out.push({ date: d, total: total });
  }
  return out;
}

/** 某一天的资产明细（只列当日有收益的） */
function breakdown(assets, dateKey) {
  var out = [];
  for (var i = 0; i < (assets || []).length; i++) {
    var a = assets[i];
    var v = dailyIncome(a, dateKey);
    if (v > 0) out.push({ id: a.id, asset: a, name: a.name, today: v });
  }
  out.sort(function (a, b) { return b.today - a.today; });
  return out;
}

/**
 * 到期提醒分组
 * soon: 0~7 天；later: 8~30 天；expired: 已到期（近 90 天内）
 */
function reminderGroups(assets, today, opts) {
  var k = today || todayKey();
  var o = opts || {};
  var soon = [];
  var later = [];
  var expired = [];
  var list = Array.isArray(assets) ? assets : [];
  for (var i = 0; i < list.length; i++) {
    var a = list[i];
    if (!hasEndDate(a)) continue;
    if (o.remindOnly !== false && a.remind === false) continue;
    var left = diffDays(k, String(a.endDate).slice(0, 10));
    var item = { id: a.id, asset: a, name: a.name, endDate: a.endDate, daysLeft: left, remind: a.remind !== false };
    if (left < 0) {
      if (left >= -90) expired.push(item);
    } else if (left <= 7) {
      soon.push(item);
    } else if (left <= 30) {
      later.push(item);
    } else if (o.remindOnly === false) {
      later.push(item);
    }
  }
  function byLeft(a, b) { return a.daysLeft - b.daysLeft; }
  soon.sort(byLeft);
  later.sort(byLeft);
  expired.sort(function (a, b) { return b.daysLeft - a.daysLeft; });
  return { soon: soon, later: later, expired: expired, today: k };
}

/** 金额格式化：千分位 + 固定小数位 */
function fmtMoney(n, decimals) {
  var d = decimals === undefined || decimals === null ? 2 : Number(decimals);
  if (!(d >= 0 && d <= 6)) d = 2;
  var v = Number(n);
  if (!isFinite(v)) v = 0;
  var neg = v < 0;
  var fixed = Math.abs(v).toFixed(d);
  var parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + parts.join('.');
}

/** 中文日期：2026年10月22日 */
function fmtDateCN(key) {
  var t = parseDate(key);
  if (t === null) return '';
  var d = new Date(t);
  return d.getUTCFullYear() + '年' + (d.getUTCMonth() + 1) + '月' + d.getUTCDate() + '日';
}

function fmtDateShort(key) {
  var t = parseDate(key);
  if (t === null) return '';
  var d = new Date(t);
  return (d.getUTCMonth() + 1) + '月' + d.getUTCDate() + '日';
}

/**
 * 表单校验（新增 / 编辑共用），返回 { ok, errors }
 */
function validateAsset(draft) {
  var errors = {};
  var d = draft || {};
  var name = String(d.name || '').trim();
  if (!name) errors.name = '请填写资产名称';
  if (name.length > 30) errors.name = '名称请控制在 30 字以内';

  var p = Number(d.principal);
  if (!isFinite(p) || p <= 0) errors.principal = '本金需为大于 0 的数字';
  if (p > 1000000000000) errors.principal = '本金数值过大';

  var r = Number(d.rate);
  if (!isFinite(r) || r < 0) errors.rate = '年利率不能为负数';
  if (r > 100) errors.rate = '年利率请填写百分数（如 3.5）';

  if (!isDateKey(d.startDate)) errors.startDate = '请选择起息日期';

  var needEnd = d.type === 'fixed' || (d.type === 'custom' && d.hasEndDate);
  if (needEnd) {
    if (!isDateKey(d.endDate)) errors.endDate = '请选择到期日期';
    else if (isDateKey(d.startDate) && diffDays(d.startDate, d.endDate) <= 0) {
      errors.endDate = '到期日期需晚于起息日期';
    }
  }
  if (d.endDate && isDateKey(d.endDate) && isDateKey(d.startDate) && diffDays(d.startDate, d.endDate) <= 0) {
    errors.endDate = '到期日期需晚于起息日期';
  }
  return { ok: Object.keys(errors).length === 0, errors: errors };
}

/** 把表单数据整理成资产对象（新增用） */
function buildAsset(draft, id, now) {
  var d = draft || {};
  var startDate = String(d.startDate || '').slice(0, 10);
  var principal = Number(d.principal) || 0;
  var rate = Number(d.rate) || 0;
  var endDate = d.type === 'fixed' || (d.type === 'custom' && d.hasEndDate) ? String(d.endDate || '').slice(0, 10) : '';
  return {
    id: id || newId(),
    type: d.type || 'fixed',
    name: String(d.name || '').trim(),
    note: String(d.note || '').trim(),
    startDate: startDate,
    endDate: endDate,
    remind: d.remind !== false,
    principal: principal,
    rate: rate,
    segments: [{ from: startDate, principal: principal, rate: rate }],
    createdAt: now || Date.now(),
    updatedAt: now || Date.now()
  };
}

var idSeq = 0;
function newId() {
  idSeq = (idSeq + 1) % 100000;
  return 'a' + Date.now().toString(36) + idSeq.toString(36) + Math.random().toString(36).slice(2, 6);
}

var api = {
  MS_DAY: MS_DAY,
  parseDate: parseDate,
  toKey: toKey,
  isDateKey: isDateKey,
  addDays: addDays,
  diffDays: diffDays,
  todayKey: todayKey,
  monthStartOf: monthStartOf,
  yearStartOf: yearStartOf,
  segmentsOf: segmentsOf,
  effective: effective,
  currentPrincipal: currentPrincipal,
  pendingSegment: pendingSegment,
  accrualWindow: accrualWindow,
  dailyIncome: dailyIncome,
  incomeBetween: incomeBetween,
  accruedIncome: accruedIncome,
  daysAccrued: daysAccrued,
  isActive: isActive,
  hasEndDate: hasEndDate,
  summarize: summarize,
  historySeries: historySeries,
  breakdown: breakdown,
  reminderGroups: reminderGroups,
  fmtMoney: fmtMoney,
  fmtDateCN: fmtDateCN,
  fmtDateShort: fmtDateShort,
  validateAsset: validateAsset,
  buildAsset: buildAsset,
  newId: newId
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof window !== 'undefined') {
  window.PILCalc = api;
}
