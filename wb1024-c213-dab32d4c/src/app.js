
'use strict';
/* ================= 工具 ================= */
const $ = s => document.querySelector(s);
const $$ = s => Array.prototype.slice.call(document.querySelectorAll(s));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
const monthKey = d => { const x = d ? new Date(d + 'T00:00:00') : new Date(); return x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0'); };
const fmtMoney = n => '¥' + Number(n || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const addDays = (base, n) => { const d = new Date(base + 'T00:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
const weekdayCn = ['周日','周一','周二','周三','周四','周五','周六'];
const fmtDateCn = s => { if(!s) return ''; const d = new Date(s + 'T00:00:00'); return (d.getMonth()+1) + '月' + d.getDate() + '日 ' + weekdayCn[d.getDay()]; };

/* ================= 存储（带损坏检测与恢复） ================= */
const KEYS = {
  finance: 'wb_life_finance', budget: 'wb_life_budget', habits: 'wb_life_habits',
  fitness: 'wb_life_fitness', plan: 'wb_life_plan', schedule: 'wb_life_schedule',
  shopping: 'wb_life_shopping', media: 'wb_life_media', meta: 'wb_life_meta',
  calorie: 'wb_life_calorie', calGoal: 'wb_life_cal_goal', calFood: 'wb_life_cal_food'
};
const Store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const v = JSON.parse(raw);
      return (v == null) ? fallback : v;
    } catch (e) {
      // 数据损坏：明确提示并允许恢复
      let raw = null;
      try { raw = localStorage.getItem(key); } catch (e2) {}
      this._corrupt(key, raw);
      return fallback;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      toast('存储失败：浏览器本地存储不可用或已写满', true);
      return false;
    }
  },
  _corrupt(key, raw) {
    try {
      let reported = JSON.parse(localStorage.getItem('wb_life_corrupt') || '[]');
      if (!reported.includes(key)) { reported.push(key); localStorage.setItem('wb_life_corrupt', JSON.stringify(reported)); }
    } catch (e) {}
    const k = key.replace('wb_life_', '');
    openModal(`
      <h3>数据读取失败</h3>
      <div class="mbody">
        检测到「${esc(k)}」模块的数据文件损坏，无法正常读取。为保护你的数据，可选择：<br/><br/>
        <b>· 下载损坏文件</b> — 将原数据原样保存为文件，方便手动查看或交给工具修复；<br/>
        <b>· 重建该模块</b> — 丢弃损坏数据，该模块恢复为空白（其他模块不受影响）。
      </div>
      <div class="mfoot">
        <button class="btn" id="corruptDl">下载损坏文件</button>
        <button class="btn btn-danger" id="corruptReset">重建该模块</button>
      </div>`, true);
    setTimeout(() => {
      const dl = $('#corruptDl'); if (dl) dl.onclick = () => {
        try {
          const blob = new Blob([raw || ''], {type: 'application/json'});
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = key + '_corrupted.txt';
          a.click();
          toast('已下载损坏文件');
        } catch (e2) { toast('下载失败，请手动查看浏览器存储', true); }
      };
      const rs = $('#corruptReset'); if (rs) rs.onclick = () => {
        try { localStorage.removeItem(key); localStorage.removeItem('wb_life_corrupt'); } catch (e2) {}
        closeModal(); location.reload();
      };
    }, 0);
  }
};

/* ================= 全局状态 ================= */
const State = {
  finance: [], budget: {}, habits: [], fitness: [], plan: [],
  schedule: [], shopping: [], media: [], meta: { seeded: false, addCount: 0 },
  calorie: [], calGoal: {}, calFood: []
};
let mediaView = 'wall';
let mediaStarsSel = 0;

function loadAll() {
  State.finance  = Store.get(KEYS.finance, []);
  State.budget   = Store.get(KEYS.budget, {});
  State.habits   = Store.get(KEYS.habits, []);
  State.fitness  = Store.get(KEYS.fitness, []);
  State.plan     = Store.get(KEYS.plan, []);
  State.schedule = Store.get(KEYS.schedule, []);
  State.shopping = Store.get(KEYS.shopping, []);
  State.media    = Store.get(KEYS.media, []);
  State.meta     = Object.assign({ seeded:false, addCount:0, calGoalDefault: 1800 }, Store.get(KEYS.meta, {}));
  State.calorie  = Store.get(KEYS.calorie, []);
  State.calGoal  = Store.get(KEYS.calGoal, {});
  State.calFood  = Store.get(KEYS.calFood, []);
  // 预算结构迁移：旧格式 { '2026-09': 4000 } → 新三级结构
  if (State.budget && typeof State.budget === 'object' && !('daily' in State.budget)) {
    const old = State.budget, nb = { daily: 0, dayOver: {}, weekOver: {}, monthOver: {} };
    Object.keys(old).forEach(k => { if (/^\d{4}-\d{2}$/.test(k)) nb.monthOver[k] = old[k]; });
    State.budget = nb; saveModule('budget');
  }
  // 旧财务记录无时段字段 → 标记为 'other'
  State.finance.forEach(r => { if (!r.slot) r.slot = 'other'; });
}
function saveModule(k) { Store.set(KEYS[k], State[k]); }
function bumpAdd() {
  State.meta.addCount = (State.meta.addCount || 0) + 1;
  Store.set(KEYS.meta, State.meta);
  if (State.meta.addCount > 0 && State.meta.addCount % 20 === 0) {
    toast('数据已积累 ' + State.meta.addCount + ' 条，建议导出 JSON 备份');
  }
}

/* ================= 演示数据 ================= */
function seedDemo() {
  const today = todayStr();
  const y = d => addDays(today, d);
  if (!State.finance.length) {
    State.finance = [
      {id:uid(), type:'expense', amount:56.5, category:'餐饮', note:'周末买菜', date:y(-1), seed:true},
      {id:uid(), type:'expense', amount:268,  category:'购物', note:'秋季外套', date:y(-3), seed:true},
      {id:uid(), type:'income',  amount:12000, category:'工资', note:'8 月工资', date:y(-5), seed:true},
      {id:uid(), type:'expense', amount:45,   category:'交通', note:'通勤地铁充值', date:today, seed:true}
    ];
    saveModule('finance');
  }
  if (!State.budget.daily && !Object.keys(State.budget.dayOver || {}).length && !Object.keys(State.budget.monthOver || {}).length) {
    State.budget = { daily: 150, dayOver: {}, weekOver: {}, monthOver: {} };
    saveModule('budget');
  }
  if (!State.habits.length) {
    const mk = (rec) => rec;
    State.habits = [
      {id:uid(), name:'喝水', type:'count', goal:8, unit:'杯', records:mk({[y(-1)]:6,[y(-2)]:8,[y(-3)]:5,[y(-4)]:7}), seed:true},
      {id:uid(), name:'早睡（23:30 前）', type:'check', goal:1, unit:'', records:mk({[y(-1)]:1,[y(-2)]:0,[y(-3)]:1,[y(-4)]:1}), seed:true},
      {id:uid(), name:'晨跑', type:'value', goal:3, unit:'km', records:mk({[y(-2)]:3,[y(-4)]:2.5,[y(-6)]:3}), seed:true}
    ];
    saveModule('habits');
  }
  if (!State.fitness.length) {
    State.fitness = [
      {id:uid(), date:y(-12), weight:72.4, bodyfat:23.5, intake:1900, burn:350, seed:true},
      {id:uid(), date:y(-8),  weight:71.8, bodyfat:23.1, intake:1750, burn:420, seed:true},
      {id:uid(), date:y(-4),  weight:71.2, bodyfat:22.6, intake:1650, burn:500, seed:true},
      {id:uid(), date:y(-1),  weight:70.9, bodyfat:22.2, intake:1700, burn:380, seed:true}
    ];
    saveModule('fitness');
  }
  if (!State.plan.length) {
    State.plan = [
      {id:uid(), day:1, time:'07:00', text:'慢跑 30 分钟', done:false, seed:true},
      {id:uid(), day:1, time:'20:30', text:'拉伸 + 平板支撑', done:false, seed:true},
      {id:uid(), day:3, time:'19:00', text:'力量训练（上肢）', done:false, seed:true},
      {id:uid(), day:5, time:'19:00', text:'力量训练（下肢）', done:false, seed:true}
    ];
    saveModule('plan');
  }
  if (!State.schedule.length) {
    State.schedule = [
      {id:uid(), date:y(-1), time:'14:00', title:'提交季度报销单', prio:'P1', done:false, seed:true},
      {id:uid(), date:today, time:'10:00', title:'晨会 + 周计划确认', prio:'P2', done:false, seed:true},
      {id:uid(), date:today, time:'19:30', title:'健身：有氧 40 分钟', prio:'P2', done:false, seed:true},
      {id:uid(), date:y(1),  time:'09:30', title:'预约牙科复诊', prio:'P3', done:false, seed:true}
    ];
    saveModule('schedule');
  }
  if (!State.shopping.length) {
    State.shopping = [
      {id:uid(), name:'咖啡豆（中烘 500g）', cat:'食品', price:88, done:false, seed:true},
      {id:uid(), name:'洗衣液补充装', cat:'日用', price:39.9, done:false, seed:true},
      {id:uid(), name:'瑜伽垫', cat:'家居', price:129, done:true, seed:true}
    ];
    saveModule('shopping');
  }
  if (!State.media.length) {
    State.media = [
      {id:uid(), type:'book', status:'done', title:'置身事内', creator:'兰小欢', year:2021, rating:5, review:'理解中国经济的入门佳作，读起来毫不费力。', seed:true},
      {id:uid(), type:'movie', status:'wish', title:'星际穿越', creator:'诺兰', year:2014, rating:0, review:'', seed:true},
      {id:uid(), type:'music', status:'doing', title:'Midnight', creator:'李健', year:2023, rating:4, review:'深夜循环，很安静。', seed:true}
    ];
    saveModule('media');
  }
  if (!State.calorie.length) {
    State.calorie = [
      {id:uid(), date:today, meal:'breakfast', food:'鸡蛋', qty:2, unit:'个', kcal:144, seed:true},
      {id:uid(), date:today, meal:'breakfast', food:'牛奶', qty:1, unit:'杯', kcal:135, seed:true},
      {id:uid(), date:today, meal:'lunch', food:'米饭', qty:1, unit:'碗', kcal:232, seed:true},
      {id:uid(), date:today, meal:'lunch', food:'鸡胸肉', qty:1, unit:'份(100g)', kcal:165, seed:true},
      {id:uid(), date:y(-1), meal:'breakfast', food:'燕麦粥', qty:1, unit:'碗', kcal:90, seed:true},
      {id:uid(), date:y(-1), meal:'breakfast', food:'鸡蛋', qty:1, unit:'个', kcal:72, seed:true},
      {id:uid(), date:y(-1), meal:'lunch', food:'米饭', qty:1, unit:'碗', kcal:232, seed:true},
      {id:uid(), date:y(-1), meal:'lunch', food:'牛肉', qty:1, unit:'份(100g)', kcal:250, seed:true},
      {id:uid(), date:y(-1), meal:'dinner', food:'火锅', qty:1, unit:'份', kcal:800, seed:true},
      {id:uid(), date:y(-1), meal:'dinner', food:'啤酒', qty:1, unit:'瓶', kcal:150, seed:true},
      {id:uid(), date:y(-1), meal:'dinner', food:'冰淇淋', qty:1, unit:'球', kcal:130, seed:true},
      {id:uid(), date:y(-1), meal:'snack', food:'薯片', qty:1, unit:'包', kcal:280, seed:true}
    ];
    saveModule('calorie');
  }
  State.meta.seeded = true;
  Store.set(KEYS.meta, State.meta);
}

/* ================= 通用 UI ================= */
let toastTimer = null;
function toast(msg, isErr) {
  const t = document.createElement('div');
  t.className = 'toast' + (isErr ? ' err' : '');
  t.textContent = msg;
  $('#toasts').appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3200);
}
function openModal(html) {
  $('#modalBox').innerHTML = html;
  $('#modalMask').classList.add('open');
}
function closeModal() { $('#modalMask').classList.remove('open'); }
$('#modalMask').addEventListener('click', e => { if (e.target === $('#modalMask')) closeModal(); });
function confirmBox(title, body, okLabel, okClass, onOk) {
  openModal(`
    <h3>${esc(title)}</h3>
    <div class="mbody">${body}</div>
    <div class="mfoot">
      <button class="btn btn-soft" id="cCancel">取消</button>
      <button class="btn ${okClass || 'btn-danger'}" id="cOk">${esc(okLabel || '确认')}</button>
    </div>`);
  $('#cCancel').onclick = closeModal;
  $('#cOk').onclick = () => { closeModal(); onOk && onOk(); };
}

/* 图表 SVG */
function ringSVG(pct, color, size, track) {
  pct = Math.max(0, Math.min(1, pct));
  const r = 52, c = 2 * Math.PI * r;
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}">
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="${track || '#e5e0d3'}" stroke-width="9"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"
      stroke-dasharray="${(c * pct).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 60 60)"/>
    <text x="60" y="${size < 90 ? 58 : 62}" text-anchor="middle" dominant-baseline="middle" font-size="${size < 90 ? 17 : 26}" font-weight="600" fill="#26241f">${Math.round(pct * 100)}</text>
  </svg>`;
}
function barsSVG(pairs, labels, w, h) {
  const pad = {l: 8, r: 8, t: 12, b: 26};
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  let max = 1;
  pairs.forEach(p => p.forEach(v => { if (v > max) max = v; }));
  const unit = iw / pairs.length;
  const bw = Math.min(14, unit * 0.24);
  let s = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">`;
  for (let g = 0; g <= 3; g++) {
    const y = pad.t + ih * g / 3;
    s += `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="#ece7da" stroke-width="1"/>`;
  }
  pairs.forEach((p, i) => {
    const cx = pad.l + unit * i + unit / 2;
    [0, 1].forEach(k => {
      const v = p[k] || 0;
      const bh = (v / max) * ih;
      const x = cx - bw + (k === 0 ? -2 : bw - 2);
      s += `<rect x="${x.toFixed(1)}" y="${(pad.t + ih - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="2.5" fill="${k === 0 ? '#64803f' : '#ad4a3c'}" opacity="${v ? 1 : .12}"/>`;
    });
    s += `<text x="${cx}" y="${h - 7}" text-anchor="middle" font-size="10.5" fill="#a8a294">${labels[i]}</text>`;
  });
  s += `<text x="${pad.l}" y="6" font-size="9.5" fill="#a8a294">■ 收入   ■ 支出</text>`;
  return s + '</svg>';
}
function arcPath(cx, cy, r, a0, a1) {
  const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  const large = (a1 - a0) > Math.PI ? 1 : 0;
  return `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
}
const PIE_COLORS = ['#a8603b','#64803f','#56798a','#b08d3e','#8b6a5a','#7d7a6f','#ad4a3c','#6a8b7e'];
function pieSVG(items) {
  const total = items.reduce((s, i) => s + i.v, 0);
  if (!total) return '<div class="empty">本月暂无支出</div>';
  const r = 58, cx = 66, cy = 66;
  let a = -Math.PI / 2, s = `<svg viewBox="0 0 132 132" width="100%" height="100%">`;
  items.forEach((it, i) => {
    const ang = it.v / total * Math.PI * 2;
    s += `<path d="${arcPath(cx, cy, r, a, a + ang)}" fill="${PIE_COLORS[i % PIE_COLORS.length]}"/>`;
    a += ang;
  });
  s += `<circle cx="${cx}" cy="${cy}" r="30" fill="#fbfaf6"/>`;
  s += `<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="15" font-weight="600" fill="#26241f">${total.toFixed(0)}</text>`;
  s += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="9" fill="#a8a294">本月支出 ¥</text>`;
  return s + '</svg>';
}
function lineSVG(series, labels, w, h, opts) {
  // series: [{name, color, values:[{d, v}]}]
  const pad = {l: 34, r: 10, t: 12, b: 24};
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const all = [];
  series.forEach(s => s.values.forEach(p => { if (p.v != null && isFinite(p.v)) all.push(p.v); }));
  let min = Math.min.apply(null, all), max = Math.max.apply(null, all);
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  const X = i => pad.l + (labels.length <= 1 ? iw / 2 : i * (iw / (labels.length - 1)));
  const Y = v => pad.t + ih - (v - min) / span * ih;
  const numTicks = 3;
  let s = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">`;
  for (let g = 0; g <= numTicks; g++) {
    const v = min + span * g / numTicks;
    const y = Y(v);
    s += `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="#ece7da"/>`;
    s += `<text x="${pad.l - 5}" y="${y + 3}" text-anchor="end" font-size="9" fill="#a8a294">${v.toFixed(1)}</text>`;
  }
  series.forEach(se => {
    const pts = se.values.filter(p => p.v != null && isFinite(p.v));
    if (pts.length < 1) return;
    if (pts.length === 1) {
      s += `<circle cx="${X(labels.indexOf(pts[0].d))}" cy="${Y(pts[0].v)}" r="3.5" fill="${se.color}"/>`;
    } else {
      const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + X(labels.indexOf(p.d)).toFixed(1) + ',' + Y(p.v).toFixed(1)).join('');
      s += `<path d="${path}" fill="none" stroke="${se.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
      pts.forEach(p => s += `<circle cx="${X(labels.indexOf(p.d))}" cy="${Y(p.v)}" r="2.6" fill="${se.color}"/>`);
    }
  });
  const lblStep = Math.ceil(labels.length / 8);
  labels.forEach((lb, i) => {
    if (i % lblStep !== 0 && i !== labels.length - 1) return;
    s += `<text x="${X(i)}" y="${h - 7}" text-anchor="middle" font-size="9.5" fill="#a8a294">${lb}</text>`;
  });
  opts && opts.legend && series.forEach((se, i) => {
    s += `<text x="${w - 80 - i * 90}" y="9" font-size="9.5" fill="#a8a294"><tspan fill="${se.color}">■</tspan> ${se.name}</text>`;
  });
  return s + '</svg>';
}

/* ================= 今日生活指数 ================= */
function habitTodayVal(h) {
  const t = todayStr();
  const r = (h.records && h.records[t]) != null ? h.records[t] : null;
  if (h.type === 'check') return r === 1;
  if (h.type === 'count') return r || 0;
  return r; // value 型：null 表示未记录
}
function habitDoneToday(h) {
  if (h.type === 'check') return h.records && h.records[todayStr()] === 1;
  if (h.type === 'count') return (h.records && h.records[todayStr()] || 0) >= (h.goal || 1);
  const v = h.records && h.records[todayStr()];
  return v != null && v >= (h.goal || 1);
}
function calcToday() {
  const today = todayStr();
  let score = 60; const parts = [];
  const undone = State.schedule.filter(x => !x.done);
  const overdue = undone.filter(x => x.date < today);
  if (overdue.length) { score -= overdue.length * 6; parts.push('逾期 ' + overdue.length + ' 项'); }
  const todayS = undone.filter(x => x.date === today);
  const doneS = State.schedule.filter(x => x.date === today && x.done).length;
  if (todayS.length || doneS) {
    const tot = todayS.length + doneS;
    const r = doneS / tot;
    score += Math.round((r - 0.5) * 12);
    parts.push('今日日程 ' + doneS + '/' + tot);
  }
  if (State.habits.length) {
    const done = State.habits.filter(habitDoneToday).length;
    score += Math.round((done / State.habits.length - 0.5) * 16);
    parts.push('习惯 ' + done + '/' + State.habits.length);
  }
  const ym = monthKey(); const spent = monthExpense(ym); const b = monthBudgetOf(ym);
  if (b > 0) {
    if (spent > b) { score -= 10; parts.push('预算超支 ¥' + (spent - b).toFixed(0)); }
    else { score += 3; parts.push('预算余 ¥' + (b - spent).toFixed(0)); }
  }
  const db = dayBudgetOf(today), ds = spentOfDay(today);
  if (db > 0 && ds > db) { score -= 6; parts.push('今日支出超预算'); }
  const yday = addDays(today, -1);
  const calTotal = calIntakeTotal(yday), calGoalY = calGoalOf(yday);
  if (State.calorie.some(c => c.date === yday) && calTotal > calGoalY) {
    score -= 5; parts.push('昨日摄入超 ' + (calTotal - calGoalY).toFixed(0) + ' kcal');
  }
  if (State.fitness.some(f => f.date === today)) { score += 5; parts.push('已记录健康数据'); }
  score = Math.max(0, Math.min(100, Math.round(score)));
  const word = score >= 90 ? '游刃有余' : score >= 75 ? '从容有序' : score >= 60 ? '平稳运转' : score >= 40 ? '有些忙碌' : '需要整顿';
  return { score, word, parts, overdue, todayS };
}
function renderToday() {
  const { score, word, parts, overdue, todayS } = calcToday();
  const today = todayStr();
  $('#scoreRing').innerHTML = ringSVG(score / 100, '#a8603b', 168);
  $('#scoreWord').textContent = word;
  $('#scoreDate').textContent = fmtDateCn(today) + ' · 生活指数';
  $('#scoreParts').innerHTML = parts.map(p => `<span class="part">${esc(p)}</span>`).join('') || '<span class="part">记录一点，指数就有了</span>';
  // 今日要处理
  const items = [];
  overdue.forEach(s => items.push({ tag: 'o', tagTxt: '逾期', t: s.title + '（' + fmtDateCn(s.date) + '）', act: 'done', id: s.id, cls: 'over' }));
  todayS.forEach(s => items.push({ tag: 't', tagTxt: '今日', t: s.title + (s.time ? ' ' + s.time : ''), act: 'done', id: s.id }));
  State.habits.forEach(h => { if (!habitDoneToday(h)) items.push({ tag: 'h', tagTxt: '习惯', t: h.name, act: 'habit', id: h.id }); });
  State.shopping.forEach(sh => { if (!sh.done) items.push({ tag: 's', tagTxt: '待买', t: sh.name, act: 'shop', id: sh.id }); });
  const box = $('#todayList');
  if (!items.length) {
    box.innerHTML = '<div class="tl-empty">今天没有待处理事项，放轻松。</div>';
  } else {
    box.innerHTML = items.slice(0, 8).map(it => `
      <div class="tl-item ${it.cls || ''}">
        <span class="tl-tag ${it.tag}">${it.tagTxt}</span>
        <span class="t">${esc(it.t)}</span>
        <button class="btn btn-soft btn-mini" data-do="${it.act}" data-id="${it.id}">处理</button>
      </div>`).join('');
  }
}
$('#todayList').addEventListener('click', e => {
  const b = e.target.closest('[data-do]'); if (!b) return;
  const id = b.getAttribute('data-id');
  if (b.getAttribute('data-do') === 'done') {
    const s = State.schedule.find(x => x.id === id);
    if (s) { s.done = true; saveModule('schedule'); renderAll(); toast('已处理：' + s.title); }
  } else if (b.getAttribute('data-do') === 'habit') {
    quickCheckin(id);
  } else if (b.getAttribute('data-do') === 'shop') {
    const s = State.shopping.find(x => x.id === id);
    if (s) { s.done = true; saveModule('shopping'); renderAll(); toast('已购买：' + s.name); }
  }
});
function quickCheckin(hid) {
  const h = State.habits.find(x => x.id === hid); if (!h) return;
  if (h.type === 'check') {
    h.records = h.records || {}; h.records[todayStr()] = 1;
    saveModule('habits'); renderAll(); toast('打卡完成：' + h.name);
  } else {
    openModal(`
      <h3>打卡 · ${esc(h.name)}</h3>
      <div class="mbody">${h.type === 'count' ? '今日已完成次数' : '今日数值（单位 ' + esc(h.unit || '') + '）'}：</div>
      <div style="margin-top:14px">
        <input type="number" id="qcVal" min="0" step="${h.type === 'count' ? 1 : 0.1}" style="font-size:22px;text-align:center;padding:10px 4px" value="${h.type === 'count' ? (habitTodayVal(h) || 0) : (habitTodayVal(h) || '')}"/>
      </div>
      <div class="mfoot">
        <button class="btn btn-soft" id="qcCancel">取消</button>
        <button class="btn btn-solid" id="qcOk">保存</button>
      </div>`);
    $('#qcCancel').onclick = closeModal;
    $('#qcOk').onclick = () => {
      const v = parseFloat($('#qcVal').value);
      if (isNaN(v) || v < 0) { toast('请输入有效数值', true); return; }
      h.records = h.records || {}; h.records[todayStr()] = v;
      saveModule('habits'); closeModal(); renderAll(); toast('已记录：' + h.name);
    };
  }
}

/* ================= 记账理财 ================= */
const FIN_EXP = ['餐饮','交通','购物','居住','娱乐','医疗','学习','人情','其他'];
const FIN_INC = ['工资','奖金','理财','副业','其他'];
const finCats = t => t === 'income' ? FIN_INC : FIN_EXP;
function monthExpense(ym) { return State.finance.filter(r => r.type === 'expense' && monthKey(r.date) === ym).reduce((s, r) => s + (+r.amount || 0), 0); }
function monthIncome(ym) { return State.finance.filter(r => r.type === 'income' && monthKey(r.date) === ym).reduce((s, r) => s + (+r.amount || 0), 0); }
function renderFinCats() {
  const t = $('#finType').value;
  $('#finCat').innerHTML = finCats(t).map(c => `<option>${c}</option>`).join('');
}
/* ---- 三级预算：日 / 周 / 月 ---- */
const SLOT_CN = { am: '上午', pm: '下午', night: '晚上', other: '其他' };
const SLOT_ORDER = ['am', 'pm', 'night', 'other'];
function dayBudgetOf(date) {
  const b = State.budget;
  if (b.dayOver && b.dayOver[date] != null) return +b.dayOver[date] || 0;
  return +b.daily || 0;
}
function weekStartOf(date) {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function weekBudgetOf(date) {
  const b = State.budget, wk = weekStartOf(date);
  if (b.weekOver && b.weekOver[wk] != null) return +b.weekOver[wk] || 0;
  let s = 0;
  for (let i = 0; i < 7; i++) s += dayBudgetOf(addDays(wk, i));
  return s;
}
function monthBudgetOf(ym) {
  const b = State.budget;
  if (b.monthOver && b.monthOver[ym] != null) return +b.monthOver[ym] || 0;
  const [y, m] = ym.split('-').map(Number);
  const days = new Date(y, m, 0).getDate();
  let s = 0;
  for (let d = 1; d <= days; d++) s += dayBudgetOf(ym + '-' + String(d).padStart(2, '0'));
  return s;
}
function spentOfDay(date) { return State.finance.filter(r => r.type === 'expense' && r.date === date).reduce((s, r) => s + (+r.amount || 0), 0); }
function spentOfWeek(date) {
  const wk = weekStartOf(date);
  let s = 0;
  for (let i = 0; i < 7; i++) s += spentOfDay(addDays(wk, i));
  return s;
}
function spentOfMonth(ym) { return State.finance.filter(r => r.type === 'expense' && monthKey(r.date) === ym).reduce((s, r) => s + (+r.amount || 0), 0); }
function spentBySlot(date, slot) { return State.finance.filter(r => r.type === 'expense' && r.date === date && r.slot === slot).reduce((s, r) => s + (+r.amount || 0), 0); }
function budCardHTML(title, tag, budget, spent, extra, isToday) {
  const left = budget - spent;
  const pct = budget > 0 ? spent / budget : (spent > 0 ? 2 : 0);
  const cls = left < 0 ? 'over' : (pct >= 0.8 ? 'low' : 'ok');
  const barCls = left < 0 ? 'over' : (pct >= 0.8 ? 'warn' : '');
  const leftTxt = budget > 0 ? (left >= 0 ? '剩余 ' + fmtMoney(left) : '超支 ' + fmtMoney(-left)) : '未设置预算';
  return `
    <div class="bud-card ${isToday ? 'today' : ''}">
      <div class="bk">${title}${tag ? `<span class="tag">${esc(tag)}</span>` : ''}</div>
      <div class="bv num">${budget > 0 ? fmtMoney(budget) : '未设置'}<small>${budget > 0 ? '预算' : ''}</small></div>
      <div class="bs ${cls}"><b>${leftTxt}</b>${budget > 0 ? ' · 已花 ' + fmtMoney(spent) : ''}</div>
      ${budget > 0 ? `<div class="bud-bar"><i class="${barCls}" style="width:${Math.min(100, pct * 100).toFixed(1)}%"></i></div>` : ''}
      ${extra ? `<div class="bs ${cls}" style="margin-top:5px;font-size:11.5px">${extra}</div>` : ''}
    </div>`;
}
function renderBudCards() {
  const today = todayStr();
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 周一=0 … 周日=6
  const db = dayBudgetOf(today), ds = spentOfDay(today);
  const wb = weekBudgetOf(today), ws = spentOfWeek(today);
  const ym = monthKey(), mb = monthBudgetOf(ym), ms = spentOfMonth(ym);
  const dayLeft = db - ds;
  const dayExtra = db > 0 ? (dayLeft >= 0 ? '下班前还可支配 ' + fmtMoney(dayLeft) : '今日已超支') : '点右上角「预算设置」设定每日预算';
  const weekLeft = wb - ws;
  let weekExtra = '';
  if (wb > 0) {
    if (dow >= 4) weekExtra = weekLeft >= 0 ? '周末还可支配 ' + fmtMoney(weekLeft) : '本周已超支 ' + fmtMoney(-weekLeft);
    else weekExtra = '本周还剩 ' + fmtMoney(Math.max(0, weekLeft));
  }
  const monthLeft = mb - ms;
  const monthExtra = mb > 0 ? '本月还剩 ' + fmtMoney(monthLeft) : '';
  $('#budCards').innerHTML =
    budCardHTML('今日预算', '日', db, ds, dayExtra, true) +
    budCardHTML('本周预算', '周一起', wb, ws, weekExtra, false) +
    budCardHTML('本月预算', ym, mb, ms, monthExtra, false);
}
function renderWkBar() {
  const today = todayStr();
  const wk = weekStartOf(today);
  const names = ['一', '二', '三', '四', '五', '六', '日'];
  $('#wkBar').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(i => {
    const d = addDays(wk, i);
    const isT = d === today;
    const db = dayBudgetOf(d), ds = spentOfDay(d);
    const left = db - ds;
    const pct = db > 0 ? ds / db : (ds > 0 ? 2 : 0);
    const lcls = left < 0 ? 'over' : (pct >= 0.8 ? 'low' : 'ok');
    const slots = SLOT_ORDER.filter(s => spentBySlot(d, s) > 0).map(s => {
      const v = spentBySlot(d, s);
      return `<span class="wk-slot ${v > (db / 3) && db > 0 ? 'over' : ''}">${SLOT_CN[s]} ${fmtMoney(v).replace('¥', '')}</span>`;
    }).join('');
    return `
      <div class="wk-day ${isT ? 'today' : ''}">
        <h5><span>周${names[i]}</span><span class="num">${d.slice(5).replace('-', '/')}</span></h5>
        <div class="budget num">预算 ${db > 0 ? fmtMoney(db) : '未设'}</div>
        <div class="sum num">${fmtMoney(ds)}</div>
        <div class="left ${lcls} num">${db > 0 ? (left >= 0 ? '剩 ' + fmtMoney(left) : '超 ' + fmtMoney(-left)) : ''}</div>
        ${db > 0 ? `<div class="bud-bar"><i class="${left < 0 ? 'over' : (pct >= 0.8 ? 'warn' : '')}" style="width:${Math.min(100, pct * 100).toFixed(0)}%"></i></div>` : ''}
        <div class="wk-slots">${slots || '<span style="color:var(--ink3)">暂无记录</span>'}</div>
      </div>`;
  }).join('');
}
function renderFinance() {
  renderBudCards();
  renderWkBar();
  const ym = monthKey();
  // 月度对比（近 6 个月）
  const months = []; const pairs = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    const mk = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    months.push((d.getMonth() + 1) + '月');
    pairs.push([monthIncome(mk), monthExpense(mk)]);
  }
  $('#finBars').innerHTML = barsSVG(pairs, months, 460, 180);
  // 消费结构
  const expThisMonth = State.finance.filter(r => r.type === 'expense' && monthKey(r.date) === ym);
  const byCat = {};
  expThisMonth.forEach(r => byCat[r.category] = (byCat[r.category] || 0) + (+r.amount || 0));
  const items = Object.keys(byCat).map(k => ({ k, v: byCat[k] })).sort((a, b) => b.v - a.v);
  const total = items.reduce((s, i) => s + i.v, 0);
  $('#finPie').innerHTML = pieSVG(items);
  $('#finLegend').innerHTML = items.length ? items.slice(0, 8).map((it, i) => `
    <div class="legend-row">
      <span class="sw" style="background:${PIE_COLORS[i % PIE_COLORS.length]}"></span>
      <span class="nm">${esc(it.k)}</span>
      <span class="pv num">${(it.v / total * 100).toFixed(0)}% · ${fmtMoney(it.v)}</span>
    </div>`).join('') : '<div class="empty">本月暂无支出</div>';
  // 筛选器（重建选项并保留当前选择）
  const mf = $('#finMonthFilter');
  const prevM = mf.value || ym;
  const optsM = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    optsM.push({ v: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), t: (d.getMonth() + 1) + '月' });
  }
  mf.innerHTML = optsM.map(o => `<option value="${o.v}">${o.t}</option>`).join('');
  mf.value = optsM.some(o => o.v === prevM) ? prevM : ym;
  // 明细
  renderFinList();
}
function renderFinList() {
  const ym = $('#finMonthFilter').value || monthKey();
  const cf = $('#finCatFilter').value || 'all';
  let list = State.finance.filter(r => monthKey(r.date) === ym && (cf === 'all' || r.category === cf));
  list.sort((a, b) => (b.date + (b.time || '')) < (a.date + (a.time || '')) ? -1 : 1);
  const box = $('#finList');
  if (!list.length) { box.innerHTML = '<div class="fin-empty">该条件下暂无记录</div>'; return; }
  box.innerHTML = list.slice(0, 60).map(r => `
    <div class="fl-row">
      <span class="fl-date">${r.date.slice(5)}</span>
      ${r.slot && r.slot !== 'other' ? `<span class="fl-cat" style="background:var(--blue-soft);color:var(--blue)">${SLOT_CN[r.slot] || esc(r.slot)}</span>` : ''}
      <span class="fl-cat" style="background:${r.type === 'expense' ? 'var(--red-soft)' : 'var(--green-soft)'};color:${r.type === 'expense' ? 'var(--red)' : 'var(--green)'}">${esc(r.category)}</span>
      <span class="fl-note">${esc(r.note || '')}</span>
      <span class="fl-amt num ${r.type === 'expense' ? 'money-red' : 'money-green'}">${r.type === 'expense' ? '-' : '+'}${fmtMoney(r.amount)}</span>
      <button class="sg-del" data-fdel="${r.id}" title="删除"><svg class="icon" style="width:15px;height:15px"><use href="#i-trash"/></svg></button>
    </div>`).join('');
}
/* 时段快捷记录（上午 / 下午 / 晚上） */
$('#slotForm').addEventListener('submit', e => {
  e.preventDefault();
  const date = $('#slDate').value || todayStr();
  const slots = [['am', $('#slAm')], ['pm', $('#slPm')], ['night', $('#slNight')]];
  let added = 0;
  slots.forEach(([slot, el]) => {
    const v = parseFloat(el.value);
    if (v > 0) {
      State.finance.push({ id: uid(), type: 'expense', amount: v, category: '餐饮', note: SLOT_CN[slot] + '消费', date, slot, seed: false });
      added++;
    }
    el.value = '';
  });
  if (!added) { toast('请至少填写一个时段的金额', true); return; }
  saveModule('finance'); bumpAdd();
  renderAll(); toast('已记录 ' + added + ' 笔');
});
/* 详细记录（收入 / 其他支出） */
$('#btnFinDetail').addEventListener('click', () => {
  openModal(`
    <h3>记一笔（收入 / 其他支出）</h3>
    <div class="inline">
      <div class="frow narrow"><label>类型</label>
        <select id="fxType"><option value="expense">支出</option><option value="income">收入</option></select>
      </div>
      <div class="frow narrow"><label>金额 ¥</label><input type="number" id="fxAmt" min="0" step="0.01" placeholder="0.00"/></div>
      <div class="frow"><label>分类</label><select id="fxCat"></select></div>
      <div class="frow narrow"><label>日期</label><input type="date" id="fxDate"/></div>
    </div>
    <div class="frow" style="margin-top:12px"><label>备注（可选）</label><input type="text" id="fxNote" placeholder="例如：周末买菜"/></div>
    <div class="mfoot">
      <button class="btn btn-soft" id="fxCancel">取消</button>
      <button class="btn btn-solid" id="fxOk">保存</button>
    </div>`);
  $('#fxDate').value = todayStr();
  const fxFill = () => { $('#fxCat').innerHTML = finCats($('#fxType').value).map(c => `<option>${c}</option>`).join(''); };
  fxFill();
  $('#fxType').addEventListener('change', fxFill);
  $('#fxCancel').onclick = closeModal;
  $('#fxOk').onclick = () => {
    const amt = parseFloat($('#fxAmt').value);
    if (!(amt > 0)) { toast('请输入有效金额', true); return; }
    State.finance.push({ id: uid(), type: $('#fxType').value, amount: amt, category: $('#fxCat').value, note: $('#fxNote').value.trim(), date: $('#fxDate').value || todayStr(), slot: 'other', seed: false });
    saveModule('finance'); bumpAdd();
    closeModal(); renderAll(); toast('已保存');
  };
});
$('#finMonthFilter').addEventListener('change', renderFinList);
$('#finCatFilter').addEventListener('change', renderFinList);
$('#finList').addEventListener('click', e => {
  const b = e.target.closest('[data-fdel]'); if (!b) return;
  const id = b.getAttribute('data-fdel');
  confirmBox('删除这笔记录？', '删除后不可恢复。', '删除', 'btn-danger', () => {
    State.finance = State.finance.filter(r => r.id !== id);
    saveModule('finance'); renderAll();
  });
});
/* 预算设置（日 / 周 / 月三级，均可修改） */
$('#btnBudget').addEventListener('click', () => {
  const today = todayStr(), wk = weekStartOf(today), ym = monthKey();
  const b = State.budget;
  openModal(`
    <h3>预算设置 · 日 / 周 / 月</h3>
    <div class="mbody" style="margin-bottom:16px">不手动覆盖时：周预算 = 本周 7 天日预算之和，月预算 = 本月每天日预算之和。</div>
    <div class="frow"><label>每日预算 ¥（默认值，适用于每一天）</label><input type="number" id="bdDaily" min="0" step="10" value="${b.daily || ''}"/></div>
    <div class="frow"><label>本周预算覆盖 ¥（${fmtDateCn(wk).slice(0, 8)} 起，留空 = 自动求和）</label><input type="number" id="bdWeek" min="0" step="50" value="${(b.weekOver && b.weekOver[wk] != null) ? b.weekOver[wk] : ''}"/></div>
    <div class="frow"><label>本月预算覆盖 ¥（${ym}，留空 = 自动求和）</label><input type="number" id="bdMonth" min="0" step="100" value="${(b.monthOver && b.monthOver[ym] != null) ? b.monthOver[ym] : ''}"/></div>
    <div class="frow"><label>特殊日期覆盖（可留空；例如出差日临时加预算）</label><input type="date" id="bdDayDate" style="width:auto;display:inline-block"/><input type="number" id="bdDayAmt" min="0" step="10" placeholder="当日预算 ¥" style="width:130px;display:inline-block;margin-left:8px"/></div>
    <div class="mfoot">
      <button class="btn btn-soft" id="bdCancel">取消</button>
      <button class="btn btn-solid" id="bdOk">保存</button>
    </div>`);
  $('#bdCancel').onclick = closeModal;
  $('#bdOk').onclick = () => {
    const d = parseFloat($('#bdDaily').value);
    b.daily = d > 0 ? d : 0;
    const w = $('#bdWeek').value;
    if (w === '') { delete b.weekOver[wk]; } else { b.weekOver[wk] = parseFloat(w) || 0; }
    const m = $('#bdMonth').value;
    if (m === '') { delete b.monthOver[ym]; } else { b.monthOver[ym] = parseFloat(m) || 0; }
    const dd = $('#bdDayDate').value, da = parseFloat($('#bdDayAmt').value);
    if (dd) { if (da > 0) b.dayOver[dd] = da; else delete b.dayOver[dd]; }
    saveModule('budget'); closeModal(); renderAll(); toast('预算已更新');
  };
});
$('#btnCSV').addEventListener('click', exportCSV);
function exportCSV() {
  if (!State.finance.length) { toast('暂无收支记录可导出', true); return; }
  const head = ['日期', '时段', '类型', '分类', '金额', '备注'];
  const rows = State.finance.slice().sort((a, b) => a.date < b.date ? -1 : 1).map(r => [r.date, SLOT_CN[r.slot] || '其他', r.type === 'income' ? '收入' : '支出', r.category, r.amount, r.note || '']);
  const csv = '\uFEFF' + [head, ...rows].map(row => row.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = '记账导出_' + todayStr() + '.csv';
  a.click();
  toast('已导出 CSV（可直接用 Excel 打开）');
}

/* ================= 卡路里摄入 ================= */
/* 内置常见食物卡路里库：[名称, 单位, 每单位 kcal]（肉/菜类按 100g/份 计） */
const FOOD_DB = [
  /* 主食谷物 */
  ['米饭','碗',232],['粥','碗',90],['馒头','个',223],['花卷','个',190],['包子','个',220],
  ['饺子','个',40],['馄饨','碗',250],['面条','碗',300],['米粉','碗',350],['河粉','碗',300],
  ['方便面','包',470],['油条','根',270],['煎饼果子','份',350],['手抓饼','份',400],['三明治','个',250],
  ['汉堡','个',500],['披萨','片',285],['意面','份',400],['炒饭','份',550],['炒面','份',500],
  ['炒河粉','份',480],['全麦面包','片',80],['白面包','片',75],['吐司','片',75],['燕麦','勺',40],
  ['玉米','根',112],['红薯','个',120],['紫薯','个',130],['土豆','个',150],['山药','段',90],
  ['粽子','个',200],['月饼','个',380],['汤圆','个',60],['年糕','块',100],['寿司','个',50],
  ['饭团','个',200],['小笼包','个',60],['生煎','个',80],['烧麦','个',70],['锅贴','个',60],
  ['韭菜盒子','个',200],['春卷','个',90],['鸡蛋灌饼','份',350],['酱香饼','份',400],['肉夹馍','个',350],
  ['凉皮','份',380],['米线','碗',400],['螺蛳粉','碗',600],['酸辣粉','碗',450],['拉面','碗',450],
  ['刀削面','碗',420],['炸酱面','碗',500],['盖浇饭','份',600],['咖喱饭','份',650],['蛋包饭','份',550],
  ['石锅拌饭','份',550],['八宝粥','碗',200],['皮蛋瘦肉粥','碗',220],['海鲜粥','碗',250],['小米粥','碗',120],
  ['玉米粥','碗',100],['燕麦粥','碗',90],
  /* 蛋奶豆 */
  ['鸡蛋','个',72],['煮鸡蛋','个',72],['煎蛋','个',90],['茶叶蛋','个',80],['荷包蛋','个',90],
  ['蛋白','个',17],['蛋黄','个',55],['鹌鹑蛋','个',14],['牛奶','杯',135],['脱脂牛奶','杯',90],
  ['酸奶','杯',120],['无糖酸奶','杯',100],['奶酪','片',70],['黄油','勺',72],['豆浆','杯',60],
  ['豆奶','杯',100],['豆腐脑','碗',100],['豆腐','块',80],['腐竹','份',200],['豆干','块',90],
  /* 肉蛋海鲜（份≈100g） */
  ['鸡胸肉','份',165],['鸡腿','个',200],['鸡翅','个',90],['鸡爪','个',40],['烤鸡','份',400],
  ['炸鸡','块',300],['鸡排','份',450],['牛肉','份',250],['牛排','份',500],['肥牛','份',350],
  ['牛腩','份',400],['羊肉','份',250],['羊排','份',400],['猪肉','份',300],['五花肉','份',500],
  ['猪排','份',350],['排骨','份',400],['红烧肉','份',500],['回锅肉','份',400],['培根','片',45],
  ['火腿','片',45],['香肠','根',180],['热狗','个',250],['烤鸭','份',300],['烧鸭','份',350],
  ['卤味','份',300],['午餐肉','片',50],['鱼','份',120],['三文鱼','份',208],['金枪鱼','罐',120],
  ['鱿鱼','份',90],['虾','只',7],['小龙虾','只',10],['蟹','只',95],['扇贝','个',15],
  ['生蚝','个',10],['蛤蜊','份',60],['鱼丸','个',15],['虾滑','份',100],
  /* 蔬菜（份≈100g） */
  ['西兰花','份',34],['菠菜','份',28],['生菜','份',15],['油麦菜','份',15],['白菜','份',17],
  ['娃娃菜','份',18],['芹菜','份',16],['韭菜','份',25],['香菜','份',10],['茄子','份',25],
  ['青椒','个',20],['彩椒','个',30],['番茄','个',22],['黄瓜','根',16],['胡萝卜','根',25],
  ['白萝卜','份',18],['洋葱','个',40],['南瓜','份',23],['冬瓜','份',12],['丝瓜','份',20],
  ['苦瓜','份',20],['豆角','份',30],['四季豆','份',30],['荷兰豆','份',40],['豌豆','份',80],
  ['玉米粒','份',110],['蘑菇','份',25],['香菇','个',7],['金针菇','份',30],['杏鲍菇','份',35],
  ['木耳','份',25],['银耳','份',20],['海带','份',15],['紫菜','份',20],['莲藕','份',70],
  ['笋','份',20],['芦笋','份',20],['秋葵','份',25],['山药片','份',90],
  /* 水果 */
  ['苹果','个',80],['香蕉','根',105],['橙子','个',62],['橘子','个',40],['柚子','瓣',20],
  ['梨','个',60],['桃','个',50],['李子','个',30],['杏','个',20],['樱桃','颗',4],
  ['葡萄','颗',4],['提子','颗',4],['草莓','颗',4],['蓝莓','盒',80],['猕猴桃','个',45],
  ['芒果','个',100],['菠萝','份',50],['西瓜','块',30],['哈密瓜','块',30],['火龙果','个',120],
  ['龙眼','颗',5],['荔枝','颗',8],['石榴','个',100],['柿子','个',60],['枣','颗',7],
  ['椰子','个',350],['牛油果','个',160],['柠檬','个',17],['山楂','颗',10],
  /* 坚果零食 */
  ['核桃','个',26],['杏仁','颗',7],['巴旦木','颗',7],['腰果','颗',6],['花生','颗',5],
  ['开心果','颗',4],['瓜子','把',110],['榛子','颗',7],['夏威夷果','颗',20],['薯片','包',550],
  ['薯条','份',350],['饼干','片',40],['苏打饼干','片',25],['威化饼干','块',60],['巧克力','块',68],
  ['黑巧克力','块',60],['糖果','颗',20],['蛋糕','块',300],['奶油蛋糕','块',400],['蛋挞','个',180],
  ['面包','个',250],['牛角包','个',280],['甜甜圈','个',250],['冰淇淋','球',130],['雪糕','根',150],
  ['爆米花','杯',60],['辣条','包',200],['果冻','个',40],['布丁','个',120],['麻薯','个',80],
  ['肉松饼','个',200],['凤梨酥','个',150],['沙琪玛','块',150],['花生米','碟',100],
  /* 饮品 */
  ['可乐','罐',142],['雪碧','罐',140],['芬达','罐',160],['果汁','杯',120],['橙汁','杯',110],
  ['苹果汁','杯',110],['奶茶','杯',350],['珍珠奶茶','杯',400],['柠檬茶','杯',150],['咖啡','杯',10],
  ['美式咖啡','杯',15],['拿铁','杯',180],['卡布奇诺','杯',150],['摩卡','杯',220],['茶','杯',5],
  ['绿茶','杯',5],['红茶','杯',5],['花茶','杯',5],['运动饮料','瓶',100],['能量饮料','罐',110],
  ['椰子水','杯',45],['椰汁','杯',80],['啤酒','瓶',150],['红酒','杯',125],['白酒','两',110],
  ['威士忌','杯',130],['鸡尾酒','杯',180],['蜂蜜水','杯',60],['红糖水','杯',50],
  /* 快餐 / 外食 / 汤羹 */
  ['麻辣烫','份',450],['麻辣香锅','份',600],['冒菜','份',400],['火锅','份',800],['烧烤','串',60],
  ['烤串','串',60],['关东煮','串',50],['章鱼小丸子','份',250],['天妇罗','份',300],['寿喜锅','份',550],
  ['韩式炸鸡','份',600],['越南粉','碗',380],['沙拉','份',250],['鸡肉沙拉','份',300],['凯撒沙拉','份',350],
  ['蔬菜沙拉','份',150],['土豆泥','份',120],['玉米浓汤','碗',150],['南瓜浓汤','碗',130],['奶油蘑菇汤','碗',200],
  ['罗宋汤','碗',120],['味噌汤','碗',50],['紫菜蛋花汤','碗',60],['番茄蛋汤','碗',80],['鸡汤','碗',150],
  ['排骨汤','碗',200],['鱼汤','碗',120],['骨头汤','碗',150],['银耳汤','碗',100],['绿豆汤','碗',80],
  ['红豆汤','碗',120],
  /* 酱料（用于估算） */
  ['沙拉酱','勺',60],['番茄酱','勺',15],['花生酱','勺',94],['果酱','勺',50],['蜂蜜','勺',60],
  ['白糖','勺',48],['炼乳','勺',65],['芝麻酱','勺',90],['辣椒油','勺',120],['橄榄油','勺',120],
  ['食用油','勺',90]
];
const MEAL_CN = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' };
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
function cnNum(s) {
  if (s === '半') return 0.5;
  if (/^\d/.test(s)) return parseFloat(s);
  const map = { '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
  if (s.includes('十')) {
    const p = s.split('十');
    return (map[p[0]] || 1) * 10 + (map[p[1]] || 0);
  }
  return map[s] || 1;
}
/* 自然语言 → 食物条目 */
function parseFoodText(text) {
  const segs = text.split(/[,，、;；\s和与加还有]+/).map(s => s.trim()).filter(Boolean);
  return segs.map(seg => {
    let qty = 1, unit = '', name = seg;
    const m = seg.match(/^(半|零|[一二两三四五六七八九十百\d]+(?:\.\d+)?)\s*(个|杯|碗|片|份|根|块|瓶|包|勺|克|斤|两|只|颗|粒|盒|袋|盘|串|张|支|听|罐|碟|把|球|瓣|条|段)\s*(.+)$/);
    if (m) { qty = cnNum(m[1]); unit = m[2]; name = m[3].trim(); }
    let hit = null;
    for (let i = 0; i < FOOD_DB.length; i++) if (name === FOOD_DB[i][0]) { hit = FOOD_DB[i]; break; }
    if (!hit) {
      let best = null;
      for (let i = 0; i < FOOD_DB.length; i++) {
        const f = FOOD_DB[i];
        if (name.includes(f[0]) || f[0].includes(name)) {
          if (!best || f[0].length > best[0].length) best = [f[0].length, f];
        }
      }
      if (best) hit = best[1];
    }
    if (!hit) {
      for (let i = 0; i < State.calFood.length; i++) {
        const f = State.calFood[i];
        if (name.includes(f.name) || f.name.includes(name)) { hit = [f.name, f.unit, +f.kcal]; break; }
      }
    }
    if (hit) {
      const gramBased = unit === '克' || unit === '两' || unit === '斤';
      let kcal;
      if (gramBased && (hit[1] === '份' || hit[1] === '盘' || hit[1] === '碟' || hit[1] === '串' || hit[1] === '块')) {
        const grams = unit === '克' ? qty : unit === '两' ? qty * 50 : qty * 500;
        kcal = hit[2] / 100 * grams;
      } else {
        kcal = hit[2] * qty;
      }
      return { raw: seg, name: hit[0], qty, unit: unit || hit[1], kcal: Math.round(kcal * 10) / 10, matched: true };
    }
    return { raw: seg, name, qty, unit: unit || '', kcal: 0, matched: false };
  });
}
function calGoalOf(date) {
  if (State.calGoal && State.calGoal[date] != null) return +State.calGoal[date];
  return +State.meta.calGoalDefault || 1800;
}
function calIntakeMeal(date, meal) { return State.calorie.filter(c => c.date === date && c.meal === meal).reduce((s, c) => s + (+c.kcal || 0), 0); }
function calIntakeTotal(date) { return State.calorie.filter(c => c.date === date).reduce((s, c) => s + (+c.kcal || 0), 0); }
function calItemHTML(c) {
  return `<span class="cal-item">${MEAL_CN[c.meal]} · ${esc(c.food)} ×${c.qty}${esc(c.unit || '')} <b class="kl num">${(+c.kcal).toFixed(0)}</b> <button class="ck" data-cdel="${c.id}" title="删除"><svg class="icon" style="width:12px;height:12px"><use href="#i-trash"/></svg></button></span>`;
}
function recoHTML(left, goal) {
  if (left >= 800) return `<h4>晚餐建议 · 余量充足</h4><div class="rline">可正常吃：<b>米饭 1 碗（232）＋ 清炒时蔬（60）＋ 鸡胸肉 100g（165）＋ 番茄蛋汤（80）≈ 537 kcal</b>，还能留 <b>${left.toFixed(0) - 537} kcal</b> 给水果或酸奶。</div>`;
  if (left >= 600) return `<h4>晚餐建议 · 标准餐</h4><div class="rline">推荐：<b>杂粮饭半碗（116）＋ 清蒸鱼 100g（120）＋ 凉拌黄瓜（30）≈ 266 kcal</b>，或 <b>鸡胸肉沙拉（300）＋ 全麦面包 1 片（80）≈ 380 kcal</b>。</div>`;
  if (left >= 450) return `<h4>晚餐建议 · 轻食</h4><div class="rline">推荐：<b>蔬菜沙拉（150）＋ 鸡胸肉 100g（165）＋ 酸奶 1 杯（120）≈ 435 kcal</b>，刚好在剩余额度内。</div>`;
  if (left >= 300) return `<h4>晚餐建议 · 简餐</h4><div class="rline">推荐：<b>燕麦粥 1 碗（90）＋ 水煮蛋 1 个（72）＋ 香蕉 1 根（105）≈ 267 kcal</b>；或 <b>豆浆（60）＋ 玉米 1 根（112）＋ 苹果（80）≈ 252 kcal</b>。</div>`;
  if (left >= 150) return `<h4>晚餐建议 · 少量</h4><div class="rline">推荐：<b>无糖酸奶 1 杯（100）＋ 草莓 6 颗（24）≈ 124 kcal</b>；或 <b>苹果 1 个（80）＋ 蛋白 2 个（34）</b>。</div>`;
  if (left >= 0) return `<h4>晚餐建议 · 极少量</h4><div class="rline">剩余额度紧张（<b>${left.toFixed(0)} kcal</b>）：建议 <b>黄瓜 / 小番茄（≈20 kcal）＋ 无糖茶</b>，或只吃 <b>1 个水煮蛋白（17 kcal）</b>。</div>`;
  return `<h4>已超目标 ${(-left).toFixed(0)} kcal</h4><div class="rline">今晚建议<b>不再进食</b>，多喝水 / 无糖茶；明天早餐保持清淡，或快走 30 分钟（≈消耗 150 kcal）把缺口补回来。</div>`;
}
function renderCalSettle() {
  const y = addDays(todayStr(), -1);
  const goal = calGoalOf(y);
  const total = calIntakeTotal(y);
  const diff = total - goal;
  const box = $('#calSettle');
  if (!State.calorie.some(c => c.date === y)) {
    box.innerHTML = '<div class="settle" style="background:var(--paper);border:1px dashed var(--line2)"><span class="s-t">昨天</span><span class="s-d">还没有记录，补记昨晚吃了什么即可对比目标。</span></div>';
    return;
  }
  const over = diff > 0;
  box.innerHTML = `
    <div class="settle ${over ? 'over' : 'ok'}">
      <span class="s-t">${fmtDateCn(y).slice(0, 5)}</span>
      <span class="s-d">目标 ${goal} · 实际 ${total.toFixed(0)} kcal · 早餐 ${calIntakeMeal(y, 'breakfast').toFixed(0)} / 午餐 ${calIntakeMeal(y, 'lunch').toFixed(0)} / 晚餐 ${calIntakeMeal(y, 'dinner').toFixed(0)} / 加餐 ${calIntakeMeal(y, 'snack').toFixed(0)}</span>
      <span class="s-v num">${over ? '超了 ' + diff.toFixed(0) + ' kcal' : '还剩 ' + (-diff).toFixed(0) + ' kcal'}</span>
    </div>`;
}
function renderCalTrend() {
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(addDays(todayStr(), -i));
  const data = days.map(d => ({ d, v: calIntakeTotal(d), g: calGoalOf(d) }));
  const w = 460, h = 180, pad = { l: 40, r: 10, t: 16, b: 24 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  let max = 1;
  data.forEach(x => { if (x.v > max) max = x.v; if (x.g > max) max = x.g; });
  const unit = iw / 7;
  let s = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">`;
  for (let g = 0; g <= 3; g++) {
    const y = pad.t + ih * g / 3;
    s += `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="#ece7da"/>`;
    s += `<text x="${pad.l - 5}" y="${y + 3}" text-anchor="end" font-size="9" fill="#a8a294">${(max * (1 - g / 3)).toFixed(0)}</text>`;
  }
  data.forEach((x, i) => {
    const cx = pad.l + unit * i + unit / 2;
    const bh = (x.v / max) * ih;
    const y0 = pad.t + ih - bh;
    const over = x.v > x.g;
    s += `<rect x="${(cx - unit * 0.28).toFixed(1)}" y="${y0.toFixed(1)}" width="${(unit * 0.56).toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${over ? '#ad4a3c' : '#64803f'}" opacity="${x.v ? 1 : .25}"/>`;
    const gy = pad.t + ih - (x.g / max) * ih;
    s += `<line x1="${cx - unit * 0.36}" y1="${gy.toFixed(1)}" x2="${cx + unit * 0.36}" y2="${gy.toFixed(1)}" stroke="#b08d3e" stroke-width="1.6" stroke-dasharray="3 3"/>`;
    s += `<text x="${cx}" y="${h - 8}" text-anchor="middle" font-size="9.5" fill="#a8a294">${x.d.slice(5).replace('-', '/')}</text>`;
    if (x.v) s += `<text x="${cx}" y="${(y0 - 4).toFixed(1)}" text-anchor="middle" font-size="9" fill="${over ? '#ad4a3c' : '#64803f'}">${x.v.toFixed(0)}</text>`;
  });
  s += `<text x="${pad.l}" y="9" font-size="9" fill="#a8a294">■ 摄入 &nbsp;虚线 = 当日目标</text>`;
  $('#calTrend').innerHTML = s + '</svg>';
}
function renderCalFoods() {
  $('#cfList').innerHTML = State.calFood.length ? State.calFood.map(f => `
    <span class="cal-item">${esc(f.name)} ×1${esc(f.unit)} <b class="kl num">${(+f.kcal).toFixed(0)}</b>
      <button class="ck" data-fdel="${f.id}" title="删除"><svg class="icon" style="width:12px;height:12px"><use href="#i-trash"/></svg></button>
    </span>`).join('') : '<span style="color:var(--ink3);font-size:12px">空 · 可添加食堂菜、外卖单品等高频食物</span>';
}
function renderCalorie() {
  const today = todayStr();
  const goal = calGoalOf(today);
  const total = calIntakeTotal(today);
  const left = goal - total;
  const pct = goal > 0 ? Math.min(1.2, total / goal) : 1;
  const color = total > goal ? 'var(--red)' : (total / goal >= 0.85 ? 'var(--gold)' : 'var(--green)');
  $('#calRing').innerHTML = ringSVG(Math.min(1, pct), color, 152);
  $('#calRingTxt').textContent = total > goal ? '已超目标' : '今日摄入进度';
  $('#calLeft').innerHTML = left >= 0 ? left.toFixed(0) + ' <small>kcal 可摄入</small>' : '<span style="color:var(--red)">' + (-left).toFixed(0) + '</span> <small>kcal 已超</small>';
  $('#calSub').textContent = '目标 ' + goal + ' kcal · 已摄入 ' + total.toFixed(0) + ' kcal' + (State.calGoal[today] != null ? '（今日单独设定）' : '');
  $('#calMeals').innerHTML = MEAL_ORDER.map(mk => {
    const v = calIntakeMeal(today, mk);
    return `<div class="cal-meal"><div class="mk">${MEAL_CN[mk]}</div><div class="mv num ${v > 0 ? 'done' : ''}">${v ? v.toFixed(0) : '—'}<small style="font-size:10px;color:var(--ink3)"> kcal</small></div></div>`;
  }).join('');
  $('#calReco').innerHTML = recoHTML(left, goal);
  const todayLog = State.calorie.filter(c => c.date === today);
  $('#calLog').innerHTML = todayLog.length ? todayLog.map(calItemHTML).join('') : '<span style="color:var(--ink3);font-size:12.5px">今天还没记录，输入上面「吃了什么」即可自动计算。</span>';
  renderCalSettle();
  renderCalTrend();
  renderCalFoods();
}
/* 解析食物 */
$('#calForm').addEventListener('submit', e => {
  e.preventDefault();
  const text = $('#calText').value.trim();
  if (!text) { toast('请输入吃了什么', true); return; }
  const items = parseFoodText(text);
  const meal = $('#calMeal').value, date = $('#calDate').value || todayStr();
  const unknown = items.filter(i => !i.matched);
  $('#calParse').innerHTML = `
    <div class="blk-t">解析结果（共 ${items.length} 项${unknown.length ? '，<span style="color:var(--red)">' + unknown.length + ' 项未识别</span>' : ''}）</div>
    <div class="cal-log-day">
      ${items.map((it, idx) => `
        <span class="cal-item" style="${it.matched ? '' : 'border-color:var(--red);color:var(--red)'}">
          ${esc(it.name)}${it.qty !== 1 ? ' ×' + it.qty + esc(it.unit) : ''}
          ${it.matched ? ' <b class="kl num">' + it.kcal.toFixed(0) + ' kcal</b>' : ' <span style="font-size:11px">未识别</span>'}
          <input type="number" data-qty="${idx}" value="${it.qty}" min="0.1" step="0.5" style="width:54px;font-size:12px;padding:2px;border:1px solid var(--line2);border-radius:6px"/>
        </span>`).join('')}
    </div>
    <div class="mfoot" style="margin-top:12px">
      <button class="btn btn-soft" id="cpCancel">取消</button>
      <button class="btn btn-solid" id="cpOk">确认写入（${items.filter(i => i.matched).reduce((s, i) => s + i.kcal, 0).toFixed(0)} kcal）</button>
    </div>`;
  $('#cpCancel').onclick = () => { $('#calParse').innerHTML = ''; };
  $('#cpOk').onclick = () => {
    let n = 0;
    items.forEach((it, idx) => {
      if (!it.matched) return;
      const q = parseFloat(document.querySelector('[data-qty="' + idx + '"]').value);
      const qty = q > 0 ? q : it.qty;
      State.calorie.push({ id: uid(), date, meal, food: it.name, qty, unit: it.unit || '', kcal: Math.round(it.kcal / it.qty * qty * 10) / 10, seed: false });
      n++;
    });
    if (!n) { toast('没有可写入的食物（未识别项需先加入自定义库）', true); return; }
    saveModule('calorie'); bumpAdd();
    $('#calText').value = ''; $('#calParse').innerHTML = '';
    renderAll(); toast('已记录 ' + n + ' 项 · ' + fmtDateCn(date).slice(0, 5) + ' ' + MEAL_CN[meal]);
  };
});
/* 删除今日日志项 */
$('#calLog').addEventListener('click', e => {
  const b = e.target.closest('[data-cdel]'); if (!b) return;
  State.calorie = State.calorie.filter(c => c.id !== b.getAttribute('data-cdel'));
  saveModule('calorie'); renderAll();
});
/* 自定义食物库 */
$('#btnAddFood').addEventListener('click', () => {
  const name = $('#cfName').value.trim();
  const kcal = parseFloat($('#cfKcal').value);
  if (!name || !(kcal > 0)) { toast('请输入名称和每份卡路里', true); return; }
  State.calFood.push({ id: uid(), name, unit: $('#cfUnit').value.trim() || '份', kcal, seed: false });
  saveModule('calFood'); bumpAdd();
  $('#cfName').value = ''; $('#cfKcal').value = '';
  renderCalorie(); toast('已加入自定义食物库');
});
$('#cfList').addEventListener('click', e => {
  const b = e.target.closest('[data-fdel]'); if (!b) return;
  State.calFood = State.calFood.filter(f => f.id !== b.getAttribute('data-fdel'));
  saveModule('calFood'); renderCalorie();
});
/* 每日目标设置 */
$('#btnCalGoal').addEventListener('click', () => {
  const today = todayStr();
  openModal(`
    <h3>每日卡路里目标</h3>
    <div class="frow"><label>默认每日目标 kcal</label><input type="number" id="cgDefault" min="800" max="5000" step="50" value="${State.meta.calGoalDefault || 1800}"/></div>
    <div class="frow"><label>今天单独设定（留空 = 用默认值）</label><input type="number" id="cgToday" min="800" max="5000" step="50" value="${State.calGoal[today] != null ? State.calGoal[today] : ''}" placeholder="留空用默认"/></div>
    <div class="mfoot">
      <button class="btn btn-soft" id="cgCancel">取消</button>
      <button class="btn btn-solid" id="cgOk">保存</button>
    </div>`);
  $('#cgCancel').onclick = closeModal;
  $('#cgOk').onclick = () => {
    const d = parseFloat($('#cgDefault').value);
    if (d >= 800) State.meta.calGoalDefault = d;
    const t = $('#cgToday').value;
    if (t === '') delete State.calGoal[today];
    else { const tv = parseFloat(t); if (tv >= 800) State.calGoal[today] = tv; }
    Store.set(KEYS.meta, State.meta); saveModule('calGoal');
    closeModal(); renderCalorie(); toast('目标已更新');
  };
});

/* ================= 习惯健康 ================= */
function heatCell(v, type, goal) {
  if (v == null) return '<span class="cell" style="background:var(--line)"></span>';
  let a = 1;
  if (type === 'check') a = v > 0 ? 1 : 0.12;
  else a = Math.max(0.12, Math.min(1, v / (goal || 1)));
  const col = type === 'value' ? '#56798a' : '#64803f';
  return `<span class="cell" style="background:${col};opacity:${a.toFixed(2)}" title="${esc(String(v))}"></span>`;
}
function heatRow(h) {
  const t = todayStr(); let cells = '';
  for (let i = 29; i >= 0; i--) {
    const d = addDays(t, -i);
    const v = h.records ? h.records[d] : null;
    cells += heatCell(v, h.type, h.goal);
  }
  return cells;
}
function renderHabits() {
  const box = $('#habitList');
  if (!State.habits.length) { box.innerHTML = '<div class="empty">还没有习惯，先在左侧添加一个吧。</div>'; return; }
  box.innerHTML = State.habits.map(h => {
    const todayVal = habitTodayVal(h);
    const streak = calcStreak(h);
    const actHtml = h.type === 'check'
      ? `<span class="hcheck ${todayVal === 1 ? 'on' : ''}" data-hc="${h.id}"><svg class="icon"><use href="#i-check"/></svg></span>`
      : h.type === 'count'
        ? `<span class="hcount">
             <button data-hminus="${h.id}">−</button>
             <span class="n num">${todayVal || 0}</span><span class="of">/ ${h.goal || '∞'}${esc(h.unit || '')}</span>
             <button data-hplus="${h.id}">＋</button>
           </span>`
        : `<span class="hval">
             <input type="number" step="0.1" min="0" value="${todayVal != null ? todayVal : ''}" placeholder="—" data-hval="${h.id}"/>
             <span class="unit">${esc(h.unit || '')}${h.goal ? ' / 目标 ' + h.goal : ''}</span>
           </span>`;
    return `
    <div class="habit-row">
      <div class="habit-top">
        <span class="habit-name">${esc(h.name)}</span>
        ${streak > 0 ? `<span class="streak">🔥 ${streak} 天</span>` : ''}
        <span class="habit-act">${actHtml}
          <button class="hmisc del" data-hdel="${h.id}" title="删除习惯"><svg class="icon"><use href="#i-trash"/></svg></button>
        </span>
      </div>
      <div class="hmisc">
        <div class="heat">${heatRow(h)}</div>
        <span class="cal">近 30 天</span>
      </div>
    </div>`;
  }).join('');
}
function calcStreak(h) {
  let n = 0; let d = todayStr();
  for (let i = 0; i < 400; i++) {
    const v = h.records ? h.records[d] : null;
    const ok = h.type === 'check' ? v === 1 : (v != null && v >= (h.goal || 1));
    if (ok) n++;
    else { if (i === 0) { /* 今天还没打卡，从昨天算 */ } else break; }
    d = addDays(d, -1);
  }
  return n;
}
$('#habitForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#hbName').value.trim();
  if (!name) { toast('请输入习惯名称', true); return; }
  const type = $('#hbType').value;
  const goal = parseFloat($('#hbGoal').value);
  State.habits.push({ id: uid(), name, type, goal: goal > 0 ? goal : null, unit: $('#hbUnit').value.trim(), records: {}, seed: false });
  saveModule('habits'); bumpAdd();
  $('#hbName').value = ''; $('#hbGoal').value = ''; $('#hbUnit').value = '';
  renderAll(); toast('已添加习惯');
});
$('#habitList').addEventListener('click', e => {
  const t = e.target.closest('[data-hc],[data-hplus],[data-hminus],[data-hdel]');
  if (!t) return;
  const id = t.getAttribute('data-hc') || t.getAttribute('data-hplus') || t.getAttribute('data-hminus') || t.getAttribute('data-hdel');
  const h = State.habits.find(x => x.id === id); if (!h) return;
  h.records = h.records || {};
  const today = todayStr();
  if (t.hasAttribute('data-hc')) {
    h.records[today] = h.records[today] === 1 ? 0 : 1;
    saveModule('habits'); renderHabits(); renderToday();
  } else if (t.hasAttribute('data-hplus')) {
    h.records[today] = (h.records[today] || 0) + 1;
    saveModule('habits'); renderHabits(); renderToday();
  } else if (t.hasAttribute('data-hminus')) {
    h.records[today] = Math.max(0, (h.records[today] || 0) - 1);
    if (!h.records[today]) delete h.records[today];
    saveModule('habits'); renderHabits(); renderToday();
  } else if (t.hasAttribute('data-hdel')) {
    confirmBox('删除习惯「' + h.name + '」？', '该习惯的所有打卡记录将一并删除。', '删除', 'btn-danger', () => {
      State.habits = State.habits.filter(x => x.id !== id);
      saveModule('habits'); renderAll();
    });
  }
});
$('#habitList').addEventListener('input', e => {
  const t = e.target.closest('[data-hval]');
  if (!t) return;
  const h = State.habits.find(x => x.id === t.getAttribute('data-hval')); if (!h) return;
  h.records = h.records || {};
  const v = t.value === '' ? null : parseFloat(t.value);
  if (v == null || isNaN(v)) delete h.records[todayStr()];
  else h.records[todayStr()] = v;
  saveModule('habits'); renderToday();
});

/* ================= 减脂健身 ================= */
function fitStatsCalc() {
  const fs = State.fitness.slice().sort((a, b) => a.date < b.date ? -1 : 1);
  const last = fs[fs.length - 1];
  const meta = State.meta;
  let bmi = null, bmiTag = '';
  if (last && last.weight && meta.height) {
    const hm = meta.height / 100;
    bmi = last.weight / (hm * hm);
    bmiTag = bmi < 18.5 ? '偏瘦' : bmi < 24 ? '正常' : bmi < 28 ? '偏胖' : '肥胖';
  }
  // 目标进度
  let prog = null, startW = null;
  if (fs.length && last.weight) {
    startW = meta.startWeight || fs[0].weight;
    if (meta.targetWeight && meta.targetWeight !== startW) {
      prog = (startW - last.weight) / (startW - meta.targetWeight);
    }
  }
  // 热量缺口（最近一条有摄入或消耗的记录）
  let def = null;
  for (let i = fs.length - 1; i >= 0; i--) {
    const r = fs[i];
    if (r.intake != null || r.burn != null) { def = (r.intake || 0) - (r.burn || 0); break; }
  }
  // 7日均线最后值
  let avg7 = null;
  if (last && last.weight) {
    const ws = fs.filter(f => f.weight != null).slice(-7).map(f => f.weight);
    if (ws.length) avg7 = ws.reduce((s, v) => s + v, 0) / ws.length;
  }
  return { last, bmi, bmiTag, prog, startW, def, avg7 };
}
function renderFitness() {
  const { last, bmi, bmiTag, prog, startW, def, avg7 } = fitStatsCalc();
  const meta = State.meta;
  const pct = prog == null ? null : Math.max(0, Math.min(1, prog));
  $('#fitStats').innerHTML = `
    <div class="fit-stat"><div class="k">最新体重</div>
      <div class="v num">${last && last.weight ? last.weight + '<small> kg</small>' : '—'}</div>
      <div class="sub num">7 日均 ${avg7 ? avg7.toFixed(1) : '—'} kg</div></div>
    <div class="fit-stat"><div class="k">体脂率</div>
      <div class="v num">${last && last.fat != null ? last.fat + '<small> %</small>' : '—'}</div>
      <div class="sub">${last ? fmtDateCn(last.date) : ''}</div></div>
    <div class="fit-stat"><div class="k">BMI${meta.height ? '（身高 ' + meta.height + 'cm）' : ''}</div>
      <div class="v num">${bmi ? bmi.toFixed(1) : '—'}</div>
      ${bmiTag ? `<span class="bmi-tag" style="background:${bmi >= 18.5 && bmi < 24 ? 'var(--green-soft);color:var(--green)' : 'var(--gold-soft);color:var(--gold)'}">${bmiTag}</span>` : ''}</div>
    <div class="fit-stat"><div class="k">目标进度${meta.targetWeight ? ' → ' + meta.targetWeight + 'kg' : ''}</div>
      <div class="v num" style="display:flex;align-items:center;gap:8px">
        <span>${pct == null ? '—' : Math.round(pct * 100) + '%'}</span>
        ${pct != null ? `<svg class="ring-small" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#ece7da" stroke-width="5"/><circle cx="20" cy="20" r="16" fill="none" stroke="#64803f" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(100.5 * pct).toFixed(1)} 100.5" transform="rotate(-90 20 20)"/></svg>` : ''}
      </div>
      <div class="sub num">${def == null ? '' : (def > 0 ? '缺口 ' + def.toFixed(0) + ' kcal' : '盈余 ' + Math.abs(def).toFixed(0) + ' kcal')}</div></div>`;
  // 趋势图
  const fs = State.fitness.slice().sort((a, b) => a.date < b.date ? -1 : 1);
  const days = [];
  const seen = {};
  fs.forEach(f => { if (!seen[f.date]) { seen[f.date] = true; days.push(f.date); } });
  days.sort();
  const wSeries = days.map(d => { const f = fs.filter(x => x.date === d).pop(); return { d, v: f.weight }; });
  const fSeries = days.map(d => { const f = fs.filter(x => x.date === d).pop(); return { d, v: f.fat }; });
  // 7 日均线
  const wPts = wSeries.filter(p => p.v != null);
  const avgSeries = wPts.map((p, i) => {
    const from = Math.max(0, i - 6);
    const seg = wPts.slice(from, i + 1);
    return { d: p.d, v: seg.reduce((s, x) => s + x.v, 0) / seg.length };
  });
  const labels = days;
  const series = [
    { name: '体重', color: '#a8603b', values: wSeries },
    { name: '7日均线', color: '#64803f', values: avgSeries }
  ];
  if (fSeries.some(p => p.v != null)) series.push({ name: '体脂', color: '#56798a', values: fSeries });
  if (!days.length) $('#fitLine').innerHTML = '<div class="empty">暂无体重记录，先记录一次吧。</div>';
  else $('#fitLine').innerHTML = lineSVG(series, labels, 480, 210, { legend: true });
  renderPlan();
}
function renderPlan() {
  const days = [0,1,2,3,4,5,6];
  const names = ['周一','周二','周三','周四','周五','周六','周日'];
  const todayIdx = (new Date().getDay() + 6) % 7;
  $('#planGrid').innerHTML = days.map(d => {
    const items = State.plan.filter(p => p.day === d).sort((a, b) => (a.time || '') < (b.time || '') ? -1 : 1);
    return `
    <div class="plan-day ${d === todayIdx ? 'today' : ''}">
      <h4>${names[d]}</h4>
      <div class="plan-items">
        ${items.length ? items.map(p => `
          <div class="pitem">
            <span class="ck ${p.done ? 'done' : ''}" data-pck="${p.id}"><svg class="icon" style="width:11px;height:11px"><use href="#i-check"/></svg></span>
            <span class="tm">${esc(p.time || '')}</span>
            <span class="tx ${p.done ? 'done' : ''}">${esc(p.text)}</span>
            <button class="x" data-pdel="${p.id}">×</button>
          </div>`).join('') : '<div style="font-size:11px;color:var(--ink3);padding:6px 0">空闲</div>'}
      </div>
      <div class="plan-add">
        <select data-pday="${d}"><option value="">—</option>${Array.from({length:13},(_,i)=>`<option>${String(6+i).padStart(2,'0')}:00</option>`).join('')}</select>
        <input type="text" placeholder="计划…" data-ptext="${d}" maxlength="20"/>
        <button class="btn btn-soft btn-mini" data-padd="${d}">＋</button>
      </div>
    </div>`;
  }).join('');
}
$('#planGrid').addEventListener('click', e => {
  const ck = e.target.closest('[data-pck]');
  const del = e.target.closest('[data-pdel]');
  const add = e.target.closest('[data-padd]');
  if (ck) {
    const p = State.plan.find(x => x.id === ck.getAttribute('data-pck'));
    if (p) { p.done = !p.done; saveModule('plan'); renderPlan(); }
  } else if (del) {
    const p = State.plan.find(x => x.id === del.getAttribute('data-pdel'));
    confirmBox('删除该计划项？', p ? '「' + p.text + '」将被删除。' : '', '删除', 'btn-danger', () => {
      State.plan = State.plan.filter(x => x.id !== del.getAttribute('data-pdel'));
      saveModule('plan'); renderPlan();
    });
  } else if (add) {
    const day = parseInt(add.getAttribute('data-padd'), 10);
    const input = document.querySelector('[data-ptext="' + day + '"]');
    const sel = document.querySelector('[data-pday="' + day + '"]');
    const text = input.value.trim();
    if (!text) { toast('请输入计划内容', true); return; }
    State.plan.push({ id: uid(), day, time: sel.value, text, done: false, seed: false });
    saveModule('plan'); bumpAdd(); input.value = '';
    renderPlan();
  }
});
$('#fitForm').addEventListener('submit', e => {
  e.preventDefault();
  const date = $('#ftDate').value || todayStr();
  const w = $('#ftWeight').value, f = $('#ftFat').value, i = $('#ftIn').value, o = $('#ftOut').value;
  if (!w && !f && !i && !o) { toast('请至少填写一项', true); return; }
  const rec = { id: uid(), date, weight: w === '' ? null : parseFloat(w), fat: f === '' ? null : parseFloat(f), intake: i === '' ? null : parseFloat(i), burn: o === '' ? null : parseFloat(o), seed: false };
  // 同日记录合并（覆盖）
  State.fitness = State.fitness.filter(x => !(x.date === date));
  State.fitness.push(rec);
  if (State.meta.startWeight == null && rec.weight) State.meta.startWeight = rec.weight;
  saveModule('fitness'); saveModule('meta'); bumpAdd();
  ['#ftWeight','#ftFat','#ftIn','#ftOut'].forEach(s => $(s).value = '');
  renderAll(); toast('健康数据已保存');
});
$('#btnFitGoal').addEventListener('click', () => {
  const meta = State.meta;
  openModal(`
    <h3>减脂目标设置</h3>
    <div class="frow"><label>身高（cm）</label><input type="number" id="fgH" min="100" max="230" value="${meta.height || ''}"/></div>
    <div class="frow"><label>目标体重（kg）</label><input type="number" id="fgW" min="30" max="200" step="0.1" value="${meta.targetWeight || ''}"/></div>
    <div class="frow"><label>起始体重（kg，留空则用第一条记录）</label><input type="number" id="fgS" min="30" max="300" step="0.1" value="${meta.startWeight || ''}"/></div>
    <div class="mfoot">
      <button class="btn btn-soft" id="fgCancel">取消</button>
      <button class="btn btn-solid" id="fgOk">保存</button>
    </div>`);
  $('#fgCancel').onclick = closeModal;
  $('#fgOk').onclick = () => {
    const h = parseFloat($('#fgH').value), w = parseFloat($('#fgW').value), s = parseFloat($('#fgS').value);
    if (h > 0) meta.height = h; else delete meta.height;
    if (w > 0) meta.targetWeight = w; else delete meta.targetWeight;
    if (s > 0) meta.startWeight = s; else delete meta.startWeight;
    Store.set(KEYS.meta, meta);
    closeModal(); renderFitness(); toast('目标已更新');
  };
});

/* ================= 日程统筹 ================= */
function renderSchedule() {
  const today = todayStr();
  const groups = [
    { key: 'over', title: '逾期未完成', list: State.schedule.filter(s => !s.done && s.date < today).sort((a, b) => a.date < b.date ? -1 : 1) },
    { key: 'today', title: '今天', list: State.schedule.filter(s => s.date === today).sort((a, b) => (a.time || '') < (b.time || '') ? -1 : 1) },
    { key: 'future', title: '未来', list: State.schedule.filter(s => !s.done && s.date > today).sort((a, b) => a.date < b.date ? -1 : 1) },
    { key: 'done', title: '已完成', list: State.schedule.filter(s => s.done).sort((a, b) => a.date > b.date ? -1 : 1).slice(0, 15) }
  ];
  $('#schedList').innerHTML = groups.map(g => {
    if (!g.list.length) return '';
    return `
    <div class="sched-group ${g.key === 'over' ? 'over' : ''}">
      <h3>${g.title} <span class="cnt">${g.list.length}</span></h3>
      ${g.list.map(s => `
        <div class="sg-row ${g.key === 'over' ? 'over-row' : ''}">
          <span class="sg-ck ${s.done ? 'done' : ''}" data-sck="${s.id}"><svg class="icon" style="width:14px;height:14px"><use href="#i-check"/></svg></span>
          <span class="sg-time num">${s.date.slice(5)}${s.time ? ' ' + s.time : ''}</span>
          <span class="sg-title ${s.done ? 'done' : ''}">${esc(s.title)}</span>
          <span class="prio ${(s.prio || 'P3').toLowerCase()}">${esc(s.prio || 'P3')}</span>
          <button class="sg-del" data-sdel="${s.id}" title="删除"><svg class="icon" style="width:15px;height:15px"><use href="#i-trash"/></svg></button>
        </div>`).join('')}
    </div>`;
  }).join('') || '<div class="empty">暂无日程，添加一条试试。</div>';
}
$('#schedForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = $('#scTitle').value.trim();
  if (!title) { toast('请输入事项内容', true); return; }
  State.schedule.push({ id: uid(), date: $('#scDate').value || todayStr(), time: $('#scTime').value, title, prio: $('#scPrio').value, done: false, seed: false });
  saveModule('schedule'); bumpAdd();
  $('#scTitle').value = ''; $('#scTime').value = '';
  renderAll(); toast('日程已添加');
});
$('#schedList').addEventListener('click', e => {
  const ck = e.target.closest('[data-sck]');
  const del = e.target.closest('[data-sdel]');
  if (ck) {
    const s = State.schedule.find(x => x.id === ck.getAttribute('data-sck'));
    if (s) { s.done = !s.done; saveModule('schedule'); renderAll(); }
  } else if (del) {
    const id = del.getAttribute('data-sdel');
    const s = State.schedule.find(x => x.id === id);
    confirmBox('删除日程？', s ? '「' + s.title + '」将被删除。' : '', '删除', 'btn-danger', () => {
      State.schedule = State.schedule.filter(x => x.id !== id);
      saveModule('schedule'); renderAll();
    });
  }
});

/* ================= 待买清单 ================= */
function renderShopping() {
  const filter = $('#shFilter').value;
  const list = State.shopping.filter(s => filter === 'all' ? true : filter === 'done' ? s.done : !s.done);
  const done = State.shopping.filter(s => s.done);
  const todo = State.shopping.filter(s => !s.done);
  const est = todo.reduce((s, x) => s + (+x.price || 0), 0);
  const spent = done.reduce((s, x) => s + (+x.price || 0), 0);
  $('#shopStats').innerHTML = `
    <div class="stat"><div class="k">待购</div><div class="v num">${todo.length}<small> 件</small></div></div>
    <div class="stat"><div class="k">已购</div><div class="v num">${done.length}<small> 件</small></div></div>
    <div class="stat"><div class="k">预计花费</div><div class="v num">${fmtMoney(est)}</div></div>
    <div class="stat"><div class="k">已花费</div><div class="v num">${fmtMoney(spent)}</div></div>`;
  const box = $('#shopList');
  if (!list.length) { box.innerHTML = '<div class="empty">清单为空。</div>'; return; }
  box.innerHTML = list.map(s => `
    <div class="shp-row">
      <span class="shp-ck ${s.done ? 'done' : ''}" data-shck="${s.id}"><svg class="icon" style="width:14px;height:14px"><use href="#i-check"/></svg></span>
      <span class="shp-name ${s.done ? 'done' : ''}">${esc(s.name)}</span>
      <span class="shp-cat">${esc(s.cat)}</span>
      <span class="shp-price num">${s.price != null ? '¥' + Number(s.price).toFixed(2) : ''}</span>
      <button class="shp-del" data-shdel="${s.id}" title="删除"><svg class="icon" style="width:15px;height:15px"><use href="#i-trash"/></svg></button>
    </div>`).join('');
}
$('#shopForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#shName').value.trim();
  if (!name) { toast('请输入物品名称', true); return; }
  State.shopping.push({ id: uid(), name, cat: $('#shCat').value, price: $('#shPrice').value === '' ? null : parseFloat($('#shPrice').value), done: false, seed: false });
  saveModule('shopping'); bumpAdd();
  $('#shName').value = ''; $('#shPrice').value = '';
  renderAll(); toast('已加入清单');
});
$('#shFilter').addEventListener('change', renderShopping);
$('#shopList').addEventListener('click', e => {
  const ck = e.target.closest('[data-shck]');
  const del = e.target.closest('[data-shdel]');
  if (ck) {
    const s = State.shopping.find(x => x.id === ck.getAttribute('data-shck'));
    if (s) { s.done = !s.done; saveModule('shopping'); renderAll(); }
  } else if (del) {
    const id = del.getAttribute('data-shdel');
    const s = State.shopping.find(x => x.id === id);
    confirmBox('从清单移除？', s ? '「' + s.name + '」将被删除。' : '', '删除', 'btn-danger', () => {
      State.shopping = State.shopping.filter(x => x.id !== id);
      saveModule('shopping'); renderAll();
    });
  }
});

/* ================= 书影音收藏 ================= */
const TYPE_CN = { book: '书', movie: '影', music: '音' };
const STATUS_CN = { wish: '想看', doing: '在看', done: '看过' };
function starRowHTML(rating, size) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    const on = rating >= i;
    s += `<svg style="width:${size}px;height:${size}px;color:${on ? '#b08d3e' : '#d6d0c1'};${on ? '' : 'opacity:.55'}" viewBox="0 0 24 24"><use href="#i-star"/></svg>`;
  }
  return s;
}
function renderMedia() {
  // 年度统计
  const year = new Date().getFullYear();
  const ylist = State.media.filter(m => m.year === year);
  const yDone = ylist.filter(m => m.status === 'done');
  const avg = yDone.length ? (yDone.reduce((s, m) => s + (m.rating || 0), 0) / yDone.length).toFixed(1) : '—';
  const total = State.media.length;
  const done = State.media.filter(m => m.status === 'done').length;
  $('#mediaStats').innerHTML = `
    <div class="stat"><div class="k">收藏总数</div><div class="v num">${total}<small> 条</small></div></div>
    <div class="stat"><div class="k">已完成</div><div class="v num">${done}<small> 条</small></div></div>
    <div class="stat"><div class="k">${year} 年新增</div><div class="v num">${ylist.length}<small> 条</small></div></div>
    <div class="stat"><div class="k">${year} 年平均星</div><div class="v num">${avg}</div></div>`;
  // 封面墙
  const wall = $('#mediaWall');
  const list = $('#mediaList');
  if (!State.media.length) {
    wall.innerHTML = '<div class="empty">收藏库为空，添加一本书、一部电影或一张专辑吧。</div>';
    list.innerHTML = '';
    return;
  }
  wall.innerHTML = State.media.slice().sort((a, b) => (b.year || 0) - (a.year || 0)).map(m => `
    <div class="cover ${m.type}" data-mopen="${m.id}">
      <div class="ct"><span>${TYPE_CN[m.type]}</span><span>${esc(m.status === 'done' ? '已完成' : STATUS_CN[m.status])}</span></div>
      <div class="title">${esc(m.title)}</div>
      <div class="meta">${m.year || ''}${m.creator ? ' · ' + esc(m.creator) : ''}</div>
      <div class="stars">${m.rating ? starRowHTML(m.rating, 9) : ''}</div>
    </div>`).join('');
  list.innerHTML = State.media.map(m => `
    <div class="ml-row">
      <span class="ml-type ${m.type}">${TYPE_CN[m.type]}</span>
      <span class="ml-title">${esc(m.title)}${m.creator ? ' <span style="color:var(--ink3)">· ' + esc(m.creator) + '</span>' : ''}</span>
      <span class="ml-status">${STATUS_CN[m.status] || ''}</span>
      <span class="ml-stars">${m.rating ? starRowHTML(m.rating, 11) : ''}</span>
      <span class="ml-ops">
        <button class="sg-del" data-medit="${m.id}" title="编辑"><svg class="icon" style="width:15px;height:15px"><use href="#i-edit"/></svg></button>
        <button class="sg-del" data-mdel="${m.id}" title="删除"><svg class="icon" style="width:15px;height:15px"><use href="#i-trash"/></svg></button>
      </span>
    </div>`).join('');
}
function setMediaView(v) {
  mediaView = v;
  $$('.mtab').forEach(b => b.classList.toggle('on', b.getAttribute('data-view') === v));
  $('#mediaWall').style.display = v === 'wall' ? 'grid' : 'none';
  $('#mediaList').style.display = v === 'list' ? 'block' : 'none';
}
$$('.mtab').forEach(b => b.addEventListener('click', () => setMediaView(b.getAttribute('data-view'))));
function starInputRefresh(n) {
  $$('#mdStars .st').forEach(s => s.classList.toggle('on', +s.getAttribute('data-n') <= n));
}
$('#mdStars').addEventListener('click', e => {
  const st = e.target.closest('.st'); if (!st) return;
  mediaStarsSel = +st.getAttribute('data-n');
  starInputRefresh(mediaStarsSel);
});
$('#mediaForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = $('#mdTitle').value.trim();
  if (!title) { toast('请输入标题', true); return; }
  State.media.push({
    id: uid(), type: $('#mdType').value, status: $('#mdStatus').value, title,
    creator: $('#mdCreator').value.trim(), year: parseInt($('#mdYear').value) || null,
    rating: mediaStarsSel, review: $('#mdReview').value.trim(), seed: false
  });
  saveModule('media'); bumpAdd();
  $('#mdTitle').value = ''; $('#mdCreator').value = ''; $('#mdYear').value = ''; $('#mdReview').value = '';
  mediaStarsSel = 0; starInputRefresh(0);
  renderAll(); toast('已收藏');
});
function openMediaDetail(id) {
  const m = State.media.find(x => x.id === id); if (!m) return;
  openModal(`
    <h3>${esc(TYPE_CN[m.type])} · ${esc(m.title)}</h3>
    <div class="mbody">
      <div style="margin-bottom:12px">${m.rating ? starRowHTML(m.rating, 16) : '<span style="color:var(--ink3)">未评分</span>'}</div>
      ${m.creator ? '<div>作者：' + esc(m.creator) + '</div>' : ''}
      ${m.year ? '<div>年份：' + m.year + '</div>' : ''}
      <div>状态：${STATUS_CN[m.status] || ''}</div>
      ${m.review ? '<div style="margin-top:8px;border-top:1px dashed var(--line);padding-top:10px;font-style:italic">「' + esc(m.review) + '」</div>' : ''}
    </div>
    <div class="mfoot">
      <button class="btn btn-soft" id="mdSt1">${m.status === 'done' ? '→ 想看' : '→ 看过'}</button>
      <button class="btn btn-danger" id="mdDel">删除</button>
      <button class="btn btn-solid" id="mdClose">关闭</button>
    </div>`);
  $('#mdClose').onclick = closeModal;
  $('#mdDel').onclick = () => {
    confirmBox('删除该收藏？', '「' + m.title + '」将被删除。', '删除', 'btn-danger', () => {
      State.media = State.media.filter(x => x.id !== id);
      saveModule('media'); closeModal(); renderAll();
    });
  };
  $('#mdSt1').onclick = () => {
    m.status = m.status === 'done' ? 'wish' : 'done';
    saveModule('media'); closeModal(); renderAll(); toast('状态已更新');
  };
}
$('#mediaWall').addEventListener('click', e => {
  const c = e.target.closest('[data-mopen]'); if (!c) return;
  openMediaDetail(c.getAttribute('data-mopen'));
});
$('#mediaList').addEventListener('click', e => {
  const del = e.target.closest('[data-mdel]');
  const edit = e.target.closest('[data-medit]');
  if (del) {
    const id = del.getAttribute('data-mdel');
    const m = State.media.find(x => x.id === id);
    confirmBox('删除该收藏？', m ? '「' + m.title + '」将被删除。' : '', '删除', 'btn-danger', () => {
      State.media = State.media.filter(x => x.id !== id);
      saveModule('media'); renderAll();
    });
  } else if (edit) {
    openMediaDetail(edit.getAttribute('data-medit'));
  }
});

/* ================= 备份：导出 / 导入 / 重置 ================= */
function exportJSON() {
  const data = {
    app: 'daily-workbench', version: 1, exportedAt: new Date().toISOString(),
    data: {
      finance: State.finance, budget: State.budget, habits: State.habits,
      fitness: State.fitness, plan: State.plan, schedule: State.schedule,
      shopping: State.shopping, media: State.media, meta: State.meta,
      calorie: State.calorie, calGoal: State.calGoal, calFood: State.calFood
    }
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '日常集备份_' + todayStr() + '.json';
  a.click();
  toast('JSON 备份已导出');
}
function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let obj = null;
    try { obj = JSON.parse(reader.result); } catch (e) { toast('备份文件解析失败：不是有效的 JSON', true); return; }
    const d = obj && obj.data;
    if (!d || !obj.app) { toast('文件格式不正确，不是本工作台的备份文件', true); return; }
    const keys = ['finance','budget','habits','fitness','plan','schedule','shopping','media','calorie','calGoal','calFood'];
    keys.forEach(k => { if (d[k] != null && typeof d[k] === 'object') { State[k] = d[k]; saveModule(k); } });
    if (d.meta && typeof d.meta === 'object') { State.meta = Object.assign(State.meta, d.meta); Store.set(KEYS.meta, State.meta); }
    renderAll();
    toast('恢复完成：已导入 ' + (Array.isArray(d.finance) ? d.finance.length : 0) + ' 条财务记录等全部数据');
  };
  reader.onerror = () => toast('读取文件失败', true);
  reader.readAsText(file);
}
function bindImport() {
  const doIt = () => $('#fileImport').click();
  $('#btnImport').addEventListener('click', doIt);
  $('#btnImport2').addEventListener('click', doIt);
  $('#fileImport').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) importJSON(f);
    e.target.value = '';
  });
}
function resetAll() {
  confirmBox('清空全部数据？', '将删除本机存储的<span class="warn">所有数据</span>（记账、习惯、健身、日程、待买、收藏），且不可恢复。建议先导出备份。', '清空', 'btn-danger', () => {
    Object.keys(KEYS).forEach(k => { try { localStorage.removeItem(KEYS[k]); } catch (e) {} });
    location.reload();
  });
}
function clearSeed() {
  confirmBox('移除演示数据？', '将删除所有演示数据条目（带“演示”标记的数据），你自行添加的数据会保留。', '移除', 'btn-danger', () => {
    ['finance','habits','fitness','plan','schedule','shopping','media','calorie'].forEach(k => {
      State[k] = State[k].filter(x => !x.seed);
      saveModule(k);
    });
    renderAll(); toast('演示数据已移除');
  });
}
$('#btnExport').addEventListener('click', exportJSON);
$('#btnExport2').addEventListener('click', exportJSON);
$('#btnReset').addEventListener('click', resetAll);
$('#btnSeedClear').addEventListener('click', clearSeed);
bindImport();

/* ================= 导航高亮 ================= */
const navLinks = $$('.nav-inner a');
const secs = ['today','finance','habits','fitness','schedule','shopping','media'];
window.addEventListener('scroll', () => {
  let cur = 'today';
  secs.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 90) cur = id;
  });
  navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur));
}, { passive: true });

/* ================= 初始化 ================= */
function renderAll() {
  renderToday(); renderFinance(); renderHabits(); renderFitness();
  renderCalorie(); renderSchedule(); renderShopping(); renderMedia();
}
(function init() {
  loadAll();
  if (!State.meta.seeded) seedDemo();
  $('#slDate').value = todayStr();
  $('#calDate').value = todayStr();
  $('#ftDate').value = todayStr();
  $('#scDate').value = todayStr();
  // 月份筛选器
  const opts = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    opts.push({ v: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), t: d.getFullYear() + '年' + (d.getMonth() + 1) + '月' });
  }
  $('#finMonthFilter').innerHTML = opts.map(o => `<option value="${o.v}">${o.t}</option>`).join('');
  $('#finMonthFilter').value = monthKey();
  $('#finCatFilter').innerHTML = '<option value="all">全部分类</option>' + FIN_EXP.concat(FIN_INC).map(c => `<option>${c}</option>`).join('');
  setMediaView('wall');
  renderAll();
  // 每日首次打开提示备份
  const lastTip = Store.get('wb_life_last_tip', '');
  if (State.meta.addCount >= 20 && lastTip !== todayStr()) {
    setTimeout(() => toast('已积累 ' + State.meta.addCount + ' 条数据，建议导出 JSON 备份'), 800);
    Store.set('wb_life_last_tip', todayStr());
  }
})();
